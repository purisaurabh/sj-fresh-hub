-- Checkout no longer enforces a 5 km Haversine check. Active building is still required.

create or replace function public.place_order(
  p_address_id uuid,
  p_items jsonb,
  p_customer_note text default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_settings public.settings%rowtype;
  v_address public.addresses%rowtype;
  v_building public.buildings%rowtype;
  v_subtotal numeric(10, 2) := 0;
  v_total numeric(10, 2);
  v_order public.orders%rowtype;
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty numeric(10, 3);
  v_ids uuid[];
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = 'P0001';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_CART' using errcode = 'P0001';
  end if;

  select * into v_settings from public.settings where id = 1;
  if not found then
    raise exception 'SETTINGS_MISSING' using errcode = 'P0001';
  end if;

  if not v_settings.is_open then
    raise exception 'SHOP_CLOSED' using errcode = 'P0001';
  end if;

  select * into v_address
  from public.addresses
  where id = p_address_id
    and user_id = v_user_id;

  if not found then
    raise exception 'ADDRESS_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_address.building_id is null then
    raise exception 'BUILDING_REQUIRED' using errcode = 'P0001';
  end if;

  select * into v_building
  from public.buildings
  where id = v_address.building_id;

  if not found or v_building.is_active is not true then
    raise exception 'BUILDING_INACTIVE' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_items) as item
    where nullif(item->>'product_id', '') is null
       or nullif(item->>'quantity', '') is null
  ) then
    raise exception 'INVALID_PAYLOAD' using errcode = 'P0001';
  end if;

  select array_agg(distinct (item->>'product_id')::uuid order by (item->>'product_id')::uuid)
  into v_ids
  from jsonb_array_elements(p_items) as item;

  perform p.id
  from public.products p
  where p.id = any (v_ids)
  order by p.id
  for update of p;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'quantity')::numeric;

    select * into v_product
    from public.products
    where id = (v_item->>'product_id')::uuid;

    if not found or v_product.status <> 'active' then
      raise exception 'PRODUCT_UNAVAILABLE' using errcode = 'P0001';
    end if;

    if v_qty is null or v_qty <= 0 or mod(v_qty, v_product.quantity_step) <> 0 then
      raise exception 'INVALID_QUANTITY' using errcode = 'P0001';
    end if;

    if v_product.stock_quantity < v_qty then
      raise exception 'INSUFFICIENT_STOCK' using errcode = 'P0001';
    end if;

    v_subtotal := v_subtotal + round(v_product.price * v_qty, 2);
  end loop;

  if v_subtotal < v_settings.minimum_order then
    raise exception 'BELOW_MINIMUM_ORDER' using errcode = 'P0001';
  end if;

  v_total := v_subtotal + v_settings.delivery_fee;

  insert into public.orders (
    order_no,
    user_id,
    address_snapshot,
    building_name_snapshot,
    latitude,
    longitude,
    distance_km,
    payment_method,
    payment_status,
    subtotal,
    delivery_fee,
    total,
    status,
    customer_note
  ) values (
    'SFH-' || lpad(nextval('public.order_no_seq')::text, 4, '0'),
    v_user_id,
    jsonb_build_object(
      'id', v_address.id,
      'label', v_address.label,
      'line1', v_address.line1,
      'landmark', v_address.landmark,
      'pincode', v_address.pincode,
      'latitude', v_address.latitude,
      'longitude', v_address.longitude,
      'building_id', v_address.building_id
    ),
    v_building.name,
    v_address.latitude,
    v_address.longitude,
    null,
    'cod',
    'pending',
    v_subtotal,
    v_settings.delivery_fee,
    v_total,
    'placed',
    p_customer_note
  )
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'quantity')::numeric;

    update public.products
    set stock_quantity = stock_quantity - v_qty
    where id = (v_item->>'product_id')::uuid
      and status = 'active'
      and stock_quantity >= v_qty
    returning * into v_product;

    if not found then
      raise exception 'INSUFFICIENT_STOCK' using errcode = 'P0001';
    end if;

    insert into public.order_items (
      order_id,
      product_id,
      product_name_snapshot,
      unit_snapshot,
      unit_price_snapshot,
      quantity,
      line_total
    ) values (
      v_order.id,
      v_product.id,
      v_product.name,
      v_product.unit,
      v_product.price,
      v_qty,
      round(v_product.price * v_qty, 2)
    );
  end loop;

  insert into public.order_status_history (
    order_id,
    changed_by,
    old_status,
    new_status,
    note
  ) values (
    v_order.id,
    v_user_id,
    null,
    'placed',
    'Order placed'
  );

  return v_order;
end;
$$;
