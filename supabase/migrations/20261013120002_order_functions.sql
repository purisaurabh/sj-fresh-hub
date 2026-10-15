-- Atomic checkout, status transitions, and post-commit notification helpers.
-- Call notify_* only after the order transaction has committed.

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

revoke all on function public.place_order(uuid, jsonb, text) from public;
grant execute on function public.place_order(uuid, jsonb, text) to authenticated;

create or replace function public.restore_order_stock(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products p
  set stock_quantity = p.stock_quantity + oi.quantity
  from public.order_items oi
  where oi.order_id = p_order_id
    and oi.product_id = p.id;
end;
$$;

revoke all on function public.restore_order_stock(uuid) from public;

create or replace function public.update_order_status(
  p_order_id uuid,
  p_new_status text,
  p_note text default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_old_status text;
  v_allowed boolean := false;
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED' using errcode = 'P0001';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0001';
  end if;

  v_old_status := v_order.status;

  if p_new_status = v_old_status then
    return v_order;
  end if;

  v_allowed :=
    (v_old_status = 'placed' and p_new_status in ('accepted', 'rejected', 'cancelled'))
    or (v_old_status = 'accepted' and p_new_status in ('preparing', 'cancelled'))
    or (v_old_status = 'preparing' and p_new_status in ('out_for_delivery', 'cancelled'))
    or (v_old_status = 'out_for_delivery' and p_new_status = 'delivered');

  if not v_allowed then
    raise exception 'INVALID_STATUS_TRANSITION' using errcode = 'P0001';
  end if;

  if p_new_status in ('rejected', 'cancelled') then
    perform public.restore_order_stock(p_order_id);
  end if;

  update public.orders
  set status = p_new_status
  where id = p_order_id
  returning * into v_order;

  insert into public.order_status_history (
    order_id,
    changed_by,
    old_status,
    new_status,
    note
  ) values (
    p_order_id,
    auth.uid(),
    v_old_status,
    p_new_status,
    p_note
  );

  return v_order;
end;
$$;

revoke all on function public.update_order_status(uuid, text, text) from public;
grant execute on function public.update_order_status(uuid, text, text) to authenticated;

create or replace function public.cancel_own_order(
  p_order_id uuid,
  p_note text default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = 'P0001';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
    and user_id = auth.uid()
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_order.status <> 'placed' then
    raise exception 'CANCEL_NOT_ALLOWED' using errcode = 'P0001';
  end if;

  perform public.restore_order_stock(p_order_id);

  update public.orders
  set status = 'cancelled'
  where id = p_order_id
  returning * into v_order;

  insert into public.order_status_history (
    order_id,
    changed_by,
    old_status,
    new_status,
    note
  ) values (
    p_order_id,
    auth.uid(),
    'placed',
    'cancelled',
    coalesce(p_note, 'Cancelled by customer')
  );

  return v_order;
end;
$$;

revoke all on function public.cancel_own_order(uuid, text) from public;
grant execute on function public.cancel_own_order(uuid, text) to authenticated;

create or replace function public.mark_payment_collected(p_order_id uuid)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED' using errcode = 'P0001';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_order.status not in ('out_for_delivery', 'delivered') then
    raise exception 'PAYMENT_COLLECT_NOT_ALLOWED' using errcode = 'P0001';
  end if;

  update public.orders
  set payment_status = 'collected'
  where id = p_order_id
  returning * into v_order;

  return v_order;
end;
$$;

revoke all on function public.mark_payment_collected(uuid) from public;
grant execute on function public.mark_payment_collected(uuid) to authenticated;

create or replace function public.notify_new_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order
  from public.orders
  where id = p_order_id;

  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_order.user_id <> auth.uid() and not public.is_admin() then
    raise exception 'NOT_ALLOWED' using errcode = 'P0001';
  end if;

  insert into public.notifications (
    recipient_user_id,
    order_id,
    type,
    title,
    message
  )
  select
    p.id,
    v_order.id,
    'new_order',
    'New order ' || v_order.order_no || ' received',
    'A new Cash on Delivery order is waiting for review.'
  from public.profiles p
  where p.role = 'admin'
    and not exists (
      select 1
      from public.notifications n
      where n.order_id = v_order.id
        and n.type = 'new_order'
        and n.recipient_user_id = p.id
    );
end;
$$;

revoke all on function public.notify_new_order(uuid) from public;
grant execute on function public.notify_new_order(uuid) to authenticated;

create or replace function public.notify_order_status_change(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_title text;
  v_message text;
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED' using errcode = 'P0001';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id;

  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0001';
  end if;

  v_title := case v_order.status
    when 'accepted' then 'Order ' || v_order.order_no || ' accepted'
    when 'rejected' then 'Order ' || v_order.order_no || ' was rejected'
    when 'cancelled' then 'Order ' || v_order.order_no || ' was cancelled'
    when 'preparing' then 'Order ' || v_order.order_no || ' is being prepared'
    when 'out_for_delivery' then 'Order ' || v_order.order_no || ' is out for delivery'
    when 'delivered' then 'Order ' || v_order.order_no || ' was delivered'
    else 'Order ' || v_order.order_no || ' updated'
  end;

  v_message := case v_order.status
    when 'accepted' then 'Your order has been accepted and will be prepared shortly.'
    when 'rejected' then 'Your order could not be fulfilled. Please contact the shop if you have questions.'
    when 'cancelled' then 'Your order was cancelled.'
    when 'preparing' then 'The shop is packing your fresh produce.'
    when 'out_for_delivery' then 'Your order is on the way. Please keep cash ready for delivery.'
    when 'delivered' then 'Your order has been delivered. Thank you for shopping with SJ Fresh Hub.'
    else 'Your order status was updated.'
  end;

  insert into public.notifications (
    recipient_user_id,
    order_id,
    type,
    title,
    message
  ) values (
    v_order.user_id,
    v_order.id,
    'order_status',
    v_title,
    v_message
  );
end;
$$;

revoke all on function public.notify_order_status_change(uuid) from public;
grant execute on function public.notify_order_status_change(uuid) to authenticated;
