# Architecture

## 1. High-level architecture

```text
Browser (mobile-first)
  Next.js React UI · Tailwind · cart · profile · admin · notifications
                         │ HTTPS
                         ▼
Next.js App Router (frontend + backend in one repository)
  Server Components · Server Actions · Route Handlers
  Supabase Auth session checks · role checks · Zod validation
  Server-side price/stock/building validation
                         │
                         ▼
Supabase
  PostgreSQL · Row Level Security · Auth · Storage · Realtime
```

External services kept optional/free:
- Google Maps address embed/link for admin order details (subject to Google Maps terms).
- OpenStreetMap/Leaflet can be used for customer map-pin selection; obey tile usage policies.
- GitHub for source control and CI.
- Browser in-app notifications are part of the app; no paid SMS or WhatsApp API is assumed.

## 2. Stack

| Layer | Choice | Purpose / notes |
|---|---|---|
| Full-stack framework | Next.js App Router | UI plus backend Route Handlers/Server Actions |
| Language | TypeScript strict | Type safety |
| Styling | Tailwind CSS | Responsive design |
| UI components | shadcn/ui + Radix, where useful | Accessible reusable components |
| Database | Supabase PostgreSQL | Relational data |
| Authentication | Supabase Auth | Mobile number + password in the UI; email is internal and never shown |
| Storage | Supabase Storage | Product images |
| Realtime | Supabase Realtime | Refresh order/notification UI |
| Validation | Zod | Validate client forms and all server inputs |
| Forms | React Hook Form | Registration, profile, product and checkout forms |
| Cart state | Zustand + localStorage | Cart state for the browser |
| Icons | lucide-react | Consistent iconography |
| Maps | Google Maps iframe/link for admin address; optional Leaflet/OSM pin picker | No paid route/geocoding API required for basic map link |
| Tests | Vitest, React Testing Library, Playwright | Unit and end-to-end tests |
| CI | GitHub Actions | Lint, type-check and tests |
| Hosting | A provider whose current free plan supports Next.js server execution and permits commercial use | Check terms and limits before launch |

Free-tier allowances and terms change. A free software license does not guarantee that every host's free plan permits commercial use. Vercel Hobby is for personal, non-commercial use; do not rely on it for this business without a suitable plan/permission.

## 3. Main user flows

### 3.1 Registration
1. Browser loads active buildings from a safe server query.
2. Customer submits name, 10-digit mobile number, password and building ID.
3. A trusted server-side flow creates the Auth user and `profiles` row; the selected building is checked again against active database records.
4. The user's role defaults to `customer`. Role is never accepted from registration input.
5. User is redirected to the storefront/profile.

### 3.2 Login and role routing
1. User enters a registered mobile number and password. There is no separate admin login page.
2. Server looks up `profiles` by phone, signs in with the stored credentials, and reads the profile role.
3. Customers are sent to the shop; admins are sent to `/admin`.
4. Customers access shop/profile/orders/notifications. Admins access `/admin/*`.
5. Authorization is enforced in server layouts/actions/Route Handlers and RLS, not only by hiding UI or using middleware.

### 3.3 Place order
1. Customer checks out with a saved or new delivery address.
2. Server validates session, payload, active building and address.
3. Server reloads current product prices and stock; it does not trust client-sent prices or totals.
4. A PostgreSQL function/RPC or transaction inserts the order and order items atomically and reserves/reduces stock safely.
5. After the order is committed, create an admin notification.
6. Admin order list updates using Realtime or polling. If Realtime is disconnected, reload/polling still shows the order.
7. Customer sees the confirmation page and order status.

### 3.4 Admin status update and customer notification
1. Admin request is authenticated and role-checked.
2. Server validates the allowed status transition.
3. Update order status and append an order event/status history record.
4. Create an in-app notification for the customer.
5. Realtime refreshes the customer notification panel/order detail. The notification remains in the database if the customer is offline.

## 4. Database design

Use versioned migrations in `supabase/migrations/`. Suggested tables:

```text
profiles(
  id uuid primary key references auth.users,
  full_name text not null,
  phone text,
  role text not null default 'customer' check (role in ('customer','admin')),
  building_id uuid references buildings,
  created_at timestamptz,
  updated_at timestamptz
)

buildings(
  id uuid primary key,
  name text unique not null,
  address text,
  landmark text,
  latitude numeric,
  longitude numeric,
  is_active boolean not null default true,
  created_at timestamptz,
  updated_at timestamptz
)

categories(
  id uuid primary key,
  name text not null,
  slug text unique not null,
  sort_order integer default 0,
  is_active boolean not null default true
)

products(
  id uuid primary key,
  category_id uuid references categories,
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  unit text not null,
  quantity_step numeric not null default 1,
  price numeric(10,2) not null,
  stock_quantity numeric(10,3) not null default 0,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz,
  updated_at timestamptz
)

addresses(
  id uuid primary key,
  user_id uuid not null references profiles,
  label text,
  line1 text not null,
  building_id uuid references buildings,
  landmark text,
  pincode text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz,
  updated_at timestamptz
)

orders(
  id uuid primary key,
  order_no text unique not null,
  user_id uuid not null references profiles,
  address_snapshot jsonb not null,
  building_name_snapshot text not null,
  latitude numeric,
  longitude numeric,
  distance_km numeric,
  payment_method text not null default 'cod' check (payment_method = 'cod'),
  payment_status text not null default 'pending',
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  status text not null default 'placed'
    check (status in ('placed','accepted','preparing','out_for_delivery','delivered','rejected','cancelled')),
  customer_note text,
  created_at timestamptz,
  updated_at timestamptz
)

order_items(
  id uuid primary key,
  order_id uuid not null references orders,
  product_id uuid references products,
  product_name_snapshot text not null,
  unit_snapshot text not null,
  unit_price_snapshot numeric(10,2) not null,
  quantity numeric(10,3) not null,
  line_total numeric(10,2) not null
)

notifications(
  id uuid primary key,
  recipient_user_id uuid not null references profiles,
  order_id uuid references orders,
  type text not null,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz,
  read_at timestamptz
)

order_status_history(
  id uuid primary key,
  order_id uuid not null references orders,
  changed_by uuid references profiles,
  old_status text,
  new_status text not null,
  note text,
  created_at timestamptz
)

settings(
  id integer primary key check (id = 1),
  shop_name text not null,
  shop_phone text,
  shop_latitude numeric,
  shop_longitude numeric,
  radius_km numeric not null default 5,
  minimum_order numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  is_open boolean not null default true
)
```

Use `timestamptz` defaults and UUID defaults in migrations. Add indexes for `products.category_id`, `orders.user_id`, `orders.status`, `orders.created_at`, and `notifications.recipient_user_id, is_read, created_at`. Validate quantity precision/step and stock at order time.

## 5. Security and RLS

- Enable RLS on every table.
- `buildings`: public/anonymous users may read only safe fields for active buildings; writes are admin-only.
- `categories`/`products`: public reads active rows; admin manages rows.
- `profiles`: user reads/updates permitted own profile fields; role changes are admin-only.
- `addresses`: customer can read/write only their own addresses; admin may read the address for order fulfilment.
- `orders`/`order_items`: customer reads own orders; admin reads/updates all. Create orders through a trusted server action/RPC after validation.
- `notifications`: recipient can read/update read state only for their own notifications; inserts are restricted to trusted server-side flows/admin.
- `order_status_history`: customer can read history for own orders; admin can read all; writes occur only through authorized order-status operations.
- `settings`: expose only safe public settings; admin writes settings.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Prefer user-scoped server clients plus RLS for normal operations; use the service role only where strictly necessary.
- Protect admin actions independently of route layout/middleware. Never trust client-sent roles, totals, price, stock, or order status.

## 6. Notification model

Notification channels in v1:
1. Persistent in-app notification records in `notifications`.
2. Supabase Realtime subscription for prompt UI updates when the user is online.
3. Initial fetch and optional polling as fallback.
4. Optional browser Web Push (service worker + VAPID) so alerts can appear in the OS/browser notification bar after the user grants permission.

Event examples:
- New order → admin notification.
- Order accepted/rejected → customer notification.
- Order preparing/out for delivery/delivered → customer notification.
- Optional low-stock alert → admin notification.

SMS and automated WhatsApp notifications are not implied and should stay separate, explicitly scoped features.

## 7. Google Maps address view

- In the admin order details page, render an iframe using an address-based Google Maps embed URL where supported, and provide an “Open in Google Maps” link.
- Encode address text safely when constructing the URL.
- Treat the map as a convenience for locating the address, not proof that the address is within the service radius.
- Verify current Google Maps embed terms and browser behavior before launch. A direct Maps link is the fallback.
- Do not send customer personal data beyond what is required to locate the delivery address.

## 8. Suggested folder structure

```text
sj-fresh-hub/
├── public/
│   ├── icons/
│   └── manifest.webmanifest
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── policies.sql
├── src/
│   ├── app/
│   │   ├── (shop)/
│   │   │   ├── page.tsx
│   │   │   ├── product/[slug]/page.tsx
│   │   │   ├── cart/page.tsx
│   │   │   ├── checkout/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── addresses/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── orders/[id]/page.tsx
│   │   │   └── notifications/page.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── auth/callback/route.ts
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── orders/[id]/page.tsx
│   │   │   ├── products/page.tsx
│   │   │   ├── products/new/page.tsx
│   │   │   ├── products/[id]/edit/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   ├── buildings/page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── api/
│   │   │   └── health/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   └── error.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── shop/
│   │   ├── auth/
│   │   ├── profile/
│   │   ├── checkout/
│   │   ├── notifications/
│   │   ├── admin/
│   │   └── layout/
│   ├── features/
│   │   ├── auth/
│   │   ├── buildings/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── addresses/
│   │   ├── orders/
│   │   ├── notifications/
│   │   └── settings/
│   ├── lib/
│   │   ├── supabase/client.ts
│   │   ├── supabase/server.ts
│   │   ├── supabase/admin.ts
│   │   ├── delivery/haversine.ts
│   │   ├── maps/google-maps-url.ts
│   │   └── utils.ts
│   ├── types/
│   │   └── database.types.ts
│   └── proxy.ts                 # Next.js 16 request boundary (replaces middleware.ts)
├── tests/
│   ├── unit/
│   └── e2e/
├── .env.example
├── PRD.md
├── architecture.md
├── rules.md
├── design.md
├── tasks.md
└── memory.md
```

## 9. Environment variables

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=  # server-only; never use NEXT_PUBLIC_
NEXT_PUBLIC_SITE_URL=
```

Use the current Supabase publishable/anon key guidance for the project. Never commit actual secrets.

## 10. Deployment checklist

1. Create Supabase project and configure Auth redirect URLs.
2. Run versioned SQL migrations and seed categories/buildings/products.
3. Create Storage bucket and policies for product images.
4. Provision the first admin account securely; assign the role using a trusted database/admin operation.
5. Push source to GitHub.
6. Deploy to a provider that supports Next.js server execution and permits commercial use on the chosen plan.
7. Configure environment variables.
8. Test auth, RLS, checkout, stock concurrency, notifications, and map link in production.
9. Export/back up important database data regularly.
10. Re-check all free-tier quotas and terms before launch.

## 11. Growth path

When the free tiers are no longer enough: add stronger backups/monitoring, evaluate paid hosting/database plans, consider browser push or messaging integrations, and add a delivery-person role only when operationally necessary.
