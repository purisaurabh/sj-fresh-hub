-- Admin can delete products and categories.
-- Past orders keep name/price snapshots; unlink the live product row.

alter table public.order_items
  drop constraint if exists order_items_product_id_fkey;

alter table public.order_items
  add constraint order_items_product_id_fkey
  foreign key (product_id) references public.products (id) on delete set null;

create policy categories_admin_delete
  on public.categories
  for delete
  using (public.is_admin());

create policy products_admin_delete
  on public.products
  for delete
  using (public.is_admin());
