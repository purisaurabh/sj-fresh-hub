-- Row Level Security. Canonical source of truth for access control.
-- Keep this file in sync with supabase/policies.sql.

alter table public.buildings enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.notifications enable row level security;
alter table public.order_status_history enable row level security;
alter table public.settings enable row level security;

-- Buildings: anonymous/public users may read active buildings only.
create policy buildings_public_read_active
  on public.buildings
  for select
  using (is_active = true or public.is_admin());

create policy buildings_admin_insert
  on public.buildings
  for insert
  with check (public.is_admin());

create policy buildings_admin_update
  on public.buildings
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- Categories
create policy categories_public_read_active
  on public.categories
  for select
  using (is_active = true or public.is_admin());

create policy categories_admin_insert
  on public.categories
  for insert
  with check (public.is_admin());

create policy categories_admin_update
  on public.categories
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- Products: public may read active rows, including out-of-stock items.
create policy products_public_read_active
  on public.products
  for select
  using (status = 'active' or public.is_admin());

create policy products_admin_insert
  on public.products
  for insert
  with check (public.is_admin());

create policy products_admin_update
  on public.products
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- Profiles: users manage their own row; role changes are blocked by trigger.
create policy profiles_select_own_or_admin
  on public.profiles
  for select
  using (id = auth.uid() or public.is_admin());

create policy profiles_insert_own_customer
  on public.profiles
  for insert
  with check (id = auth.uid() and role = 'customer');

create policy profiles_update_own
  on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = 'customer');

create policy profiles_admin_update
  on public.profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- Addresses
create policy addresses_select_own_or_admin
  on public.addresses
  for select
  using (user_id = auth.uid() or public.is_admin());

create policy addresses_insert_own
  on public.addresses
  for insert
  with check (user_id = auth.uid());

create policy addresses_update_own
  on public.addresses
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy addresses_delete_own
  on public.addresses
  for delete
  using (user_id = auth.uid());

-- Orders: customers read own rows. Inserts go through place_order RPC.
create policy orders_select_own_or_admin
  on public.orders
  for select
  using (user_id = auth.uid() or public.is_admin());

create policy orders_admin_update
  on public.orders
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- Order items
create policy order_items_select_own_or_admin
  on public.order_items
  for select
  using (
    public.is_admin()
    or exists (
      select 1
      from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

-- Notifications
create policy notifications_select_own
  on public.notifications
  for select
  using (recipient_user_id = auth.uid());

create policy notifications_update_own_read_state
  on public.notifications
  for update
  using (recipient_user_id = auth.uid())
  with check (recipient_user_id = auth.uid());

-- Order status history
create policy order_status_history_select_own_or_admin
  on public.order_status_history
  for select
  using (
    public.is_admin()
    or exists (
      select 1
      from public.orders
      where orders.id = order_status_history.order_id
        and orders.user_id = auth.uid()
    )
  );

-- Settings: public may read the singleton; only admins write.
create policy settings_public_read
  on public.settings
  for select
  using (true);

create policy settings_admin_update
  on public.settings
  for update
  using (public.is_admin())
  with check (public.is_admin());

create or replace view public.active_buildings
with (security_invoker = true) as
select id, name, address, landmark
from public.buildings
where is_active = true;

create or replace view public.catalog_products
with (security_invoker = true) as
select
  p.id,
  p.category_id,
  c.name as category_name,
  p.name,
  p.slug,
  p.description,
  p.image_url,
  p.unit,
  p.quantity_step,
  p.price,
  p.stock_quantity,
  p.status
from public.products p
left join public.categories c on c.id = p.category_id
where p.status = 'active';

grant select on public.active_buildings to anon, authenticated;
grant select on public.catalog_products to anon, authenticated;
