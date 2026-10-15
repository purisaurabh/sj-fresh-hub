# Launch checklist

Use this before putting SJ Fresh Hub on a public host. Free-tier terms change; re-read them at launch time.

## 1. Environment

Copy `.env.example` to `.env` on the host and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only; never expose to the browser)
- `NEXT_PUBLIC_SITE_URL` (the live `https://` origin)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` (browser notification bar)
- `VAPID_SUBJECT` (`mailto:` contact or the live site URL)

Generate VAPID keys with `npm run vapid:generate` if you do not already have a pair.

## 2. Supabase Auth

In Authentication → URL configuration, add:

- `http://localhost:3000/auth/callback` for local work
- `https://YOUR_DOMAIN/auth/callback` for production

Keep the site URL aligned with `NEXT_PUBLIC_SITE_URL`.

## 3. Database

Apply every file in `supabase/migrations/` in timestamp order, including:

- `20261013234500_place_order_no_distance.sql` (checkout no longer uses a 5 km check)
- `20261014001000_push_subscriptions.sql` (browser push)

Confirm `profiles.role` for the shop owner with `supabase/provision_admin.sql`.

## 4. Hosting

Vercel Hobby is for personal, non-commercial use. Do not rely on it for this shop unless you have a plan that permits commercial use. Prefer a host whose current free or paid plan allows a commercial Next.js app and server execution.

## 5. Backup and recovery

Supabase free projects can pause after inactivity. At least weekly:

1. Dashboard → Project Settings → Database: note the connection string privately.
2. Table Editor or SQL: export `buildings`, `categories`, `products`, `settings`, and recent `orders`.
3. Store the export off-site (encrypted drive or the owner’s backup folder).

To recover: create/restore the project, re-run migrations, import the CSV/SQL export, set Auth redirect URLs, and redeploy with the same env keys (or new VAPID keys plus a fresh “Enable browser alerts” from each device).

## 6. Images and performance

Keep product images at or under 200 KB (WebP/AVIF preferred). The admin upload already rejects files over 200 KB.

## 7. Manual launch tests

- Register with an active building; reject an inactive building.
- Browse, add to cart, checkout COD, open the confirmation page.
- Admin: new-order notification, accept, customer notification, delivered status.
- Customer cannot open `/admin`.
- Map iframe and “Open in Google Maps” on an admin order.
- 360 px phone, a common Android size, and a laptop window.
- Browser notification prompt after login; then a background-tab order alert.

## 8. Provider terms

Before going live, re-read current quotas and pause policies for Supabase, the host, and Google Maps embed/link use. Do not add paid SMS, WhatsApp API, or a card gateway without an explicit decision.
