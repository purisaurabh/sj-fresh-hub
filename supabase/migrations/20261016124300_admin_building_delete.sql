create policy buildings_admin_delete
  on public.buildings
  for delete
  using (public.is_admin());

create unique index if not exists buildings_name_lower_uidx
  on public.buildings (lower(btrim(name)));
