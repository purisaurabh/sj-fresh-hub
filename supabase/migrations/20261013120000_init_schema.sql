-- SJ Fresh Hub — core schema, helper functions, and singleton settings.
-- Apply with the Supabase CLI or by running files in order in the SQL editor.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  address text,
  landmark text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  building_id uuid references public.buildings (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  unit text not null,
  quantity_step numeric(10, 3) not null default 1 check (quantity_step > 0),
  price numeric(10, 2) not null check (price >= 0),
  stock_quantity numeric(10, 3) not null default 0 check (stock_quantity >= 0),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text,
  line1 text not null,
  building_id uuid references public.buildings (id),
  landmark text,
  pincode text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  user_id uuid not null references public.profiles (id),
  address_snapshot jsonb not null,
  building_name_snapshot text not null,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  distance_km numeric(8, 3),
  payment_method text not null default 'cod' check (payment_method = 'cod'),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'collected')),
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  delivery_fee numeric(10, 2) not null default 0 check (delivery_fee >= 0),
  total numeric(10, 2) not null check (total >= 0),
  status text not null default 'placed' check (
    status in (
      'placed',
      'accepted',
      'preparing',
      'out_for_delivery',
      'delivered',
      'rejected',
      'cancelled'
    )
  ),
  customer_note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id),
  product_name_snapshot text not null,
  unit_snapshot text not null,
  unit_price_snapshot numeric(10, 2) not null,
  quantity numeric(10, 3) not null check (quantity > 0),
  line_total numeric(10, 2) not null check (line_total >= 0)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references public.profiles (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  type text not null,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  read_at timestamptz
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  changed_by uuid references public.profiles (id),
  old_status text,
  new_status text not null,
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.settings (
  id integer primary key check (id = 1),
  shop_name text not null,
  shop_phone text,
  shop_latitude numeric(9, 6),
  shop_longitude numeric(9, 6),
  radius_km numeric(6, 2) not null default 5 check (radius_km > 0),
  minimum_order numeric(10, 2) not null default 0 check (minimum_order >= 0),
  delivery_fee numeric(10, 2) not null default 0 check (delivery_fee >= 0),
  is_open boolean not null default true,
  announcement_text text not null default 'SJ Fresh Hub • Fresh Healthy Tasty Vegetables & Fruits',
  delivery_area_text text not null default 'Home Delivery in Selected Buildings',
  low_stock_threshold numeric(10, 3) not null default 5 check (low_stock_threshold >= 0),
  updated_at timestamptz not null default timezone('utc', now())
);

create index products_category_id_idx on public.products (category_id);
create index products_status_idx on public.products (status);
create index products_name_idx on public.products (name);
create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);
create index orders_created_at_idx on public.orders (created_at desc);
create index notifications_recipient_unread_idx
  on public.notifications (recipient_user_id, is_read, created_at desc);
create index addresses_user_id_idx on public.addresses (user_id);
create index order_items_order_id_idx on public.order_items (order_id);
create index order_status_history_order_id_idx on public.order_status_history (order_id);
create index buildings_is_active_idx on public.buildings (is_active);
create index profiles_building_id_idx on public.profiles (building_id);
create index categories_is_active_sort_idx on public.categories (is_active, sort_order);

create trigger buildings_set_updated_at
  before update on public.buildings
  for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger addresses_set_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.haversine_km(
  lat1 numeric,
  lon1 numeric,
  lat2 numeric,
  lon2 numeric
)
returns numeric
language sql
immutable
parallel safe
as $$
  select case
    when lat1 is null or lon1 is null or lat2 is null or lon2 is null then null
    else (
      6371 * acos(
        least(
          1::numeric,
          greatest(
            -1::numeric,
            cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1))
            + sin(radians(lat1)) * sin(radians(lat2))
          )
        )
      )
    )
  end;
$$;

revoke all on function public.haversine_km(numeric, numeric, numeric, numeric) from public;
grant execute on function public.haversine_km(numeric, numeric, numeric, numeric) to anon, authenticated;

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Service role and SQL-editor superusers may provision admins.
  if coalesce(auth.role(), '') = 'service_role'
     or current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.role := 'customer';
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'Changing role is not allowed';
  end if;

  return new;
end;
$$;

create trigger profiles_protect_role
  before insert or update on public.profiles
  for each row execute function public.protect_profile_role();

create sequence public.order_no_seq start with 1001;

-- Required singleton. Replace placeholder coordinates before taking live orders.
insert into public.settings (
  id,
  shop_name,
  shop_phone,
  shop_latitude,
  shop_longitude,
  radius_km,
  minimum_order,
  delivery_fee,
  is_open
) values (
  1,
  'SJ Fresh Hub',
  null,
  18.520400,
  73.856700,
  5,
  0,
  0,
  true
);
