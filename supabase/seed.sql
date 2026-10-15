-- Development seed only. Replace shop coordinates, buildings, and products
-- with the owner's real data before launch.

insert into public.buildings (id, name, address, landmark, latitude, longitude, is_active)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'Green Valley Apartments',
    'Survey No. 12, Sample Road',
    'Near City Park',
    18.521200,
    73.857100,
    true
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Sunrise Residency',
    'Plot 8, Lake View Lane',
    'Opposite bus stop',
    18.518900,
    73.854800,
    true
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Lakeview Heights',
    'Gate 2, Hillside Road',
    'Next to community hall',
    18.523100,
    73.859400,
    true
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'Old Mill Complex',
    'Former mill compound',
    'Inactive — used for registration rejection tests',
    18.540000,
    73.880000,
    false
  )
on conflict (id) do nothing;

insert into public.categories (id, name, slug, sort_order, is_active)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Vegetables', 'vegetables', 10, true),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'Fruits', 'fruits', 20, true),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'Leafy Greens', 'leafy-greens', 30, true),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'Herbs', 'herbs', 40, true)
on conflict (id) do nothing;

insert into public.products (
  id,
  category_id,
  name,
  slug,
  description,
  image_url,
  unit,
  quantity_step,
  price,
  stock_quantity,
  status
)
values
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    'Tomato',
    'tomato',
    'Ripe local tomatoes.',
    null,
    'kg',
    0.500,
    40.00,
    25.000,
    'active'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    'Onion',
    'onion',
    'Fresh onions.',
    null,
    'kg',
    0.500,
    35.00,
    40.000,
    'active'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    'Potato',
    'potato',
    'Farm potatoes.',
    null,
    'kg',
    1.000,
    30.00,
    50.000,
    'active'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    'Banana',
    'banana',
    'Sweet bananas.',
    null,
    'dozen',
    1.000,
    50.00,
    18.000,
    'active'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb5',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    'Apple',
    'apple',
    'Crisp apples.',
    null,
    'kg',
    0.500,
    120.00,
    12.000,
    'active'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb6',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    'Spinach',
    'spinach',
    'Fresh palak bunch.',
    null,
    'bunch',
    1.000,
    20.00,
    8.000,
    'active'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb7',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    'Coriander',
    'coriander',
    'Low-stock sample for admin alerts.',
    null,
    'bunch',
    1.000,
    15.00,
    3.000,
    'active'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb8',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
    'Mint',
    'mint',
    'Out-of-stock sample. Hidden from add-to-cart.',
    null,
    'bunch',
    1.000,
    10.00,
    0.000,
    'active'
  )
on conflict (id) do nothing;
