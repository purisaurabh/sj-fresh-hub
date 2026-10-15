# Development Tasks

Legend: `[ ]` todo · `[~]` in progress · `[x]` done

## Phase 0: Planning and setup

- [ ] Confirm SJ Fresh Hub name/logo and final brand assets.
- [ ] Receive and confirm the allowed building list.
- [ ] Decide whether each building needs address, landmark and coordinates.
- [ ] Confirm shop latitude/longitude and 5 km radius.
- [ ] Decide delivery fee and minimum order value.
- [ ] Decide supported languages.
- [ ] Create GitHub repository.
- [x] Create Supabase project (free).
- [x] Initialize Next.js App Router + TypeScript + Tailwind.
- [x] Configure ESLint, Prettier, strict TypeScript and `@/` alias.
- [x] Install required libraries: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `react-hook-form`, `zustand`, `lucide-react`, `clsx`, `tailwind-merge`.
- [x] Add shadcn/ui components as needed.
- [x] Configure `.env.example` and local environment variables.
- [x] Set up CI for lint, type-check and tests.
- [ ] Select a host that permits commercial use on its chosen plan.

## Phase 1: Database foundation and security

- [x] Create migrations for `profiles`, `buildings`, `categories`, `products`, `addresses`, `orders`, `order_items`, `notifications`, `order_status_history`, and `settings`.
- [x] Enable RLS on every table.
- [~] Write and test customer/admin RLS policies. (Public reads verified live; authenticated RLS still needs a test user)
- [x] Create safe public query/view for active buildings and active products.
- [x] Create Storage bucket and policies for product images.
- [x] Create an atomic order-placement RPC/transaction with stock validation.
- [x] Generate TypeScript database types.
- [x] Seed sample buildings, categories and products for development.
- [~] Provision the first admin securely; verify role cannot be self-assigned. (SQL helper added; live user not created)

## Phase 2: Authentication, registration and profile

- [x] Build customer registration page: name, mobile number, password and required building dropdown.
- [x] Load only active buildings from the database.
- [x] Validate building selection again on the server.
- [x] Build login and logout flows with mobile number and password; auto-route admins after role lookup.
- [x] Remove email/password recovery and the separate admin login option.
- [x] Add server-side role routing and protected `/admin` pages.
- [x] Build profile page displaying name, mobile number and selected building.
- [x] Allow safe profile edits; prohibit customer role changes.
- [x] Build saved address list and add/edit/delete address forms.
- [~] Test inactive-building registration and direct admin URL access. (Unit tests in place; live signup/admin-user checks pending)

## Phase 3: Storefront and cart

- [x] Build shared header, announcement bar, footer and mobile navigation.
- [x] Build home/catalogue page with category chips and product grid.
- [x] Add search and category filter.
- [x] Build product cards with image, name, category, unit/weight, price, stock and Add/stepper.
- [x] Show inactive/out-of-stock products correctly and prevent adding them.
- [x] Implement Zustand cart with localStorage persistence.
- [x] Build cart drawer/page with quantities, subtotal, delivery fee and total.
- [x] Add loading, empty, error and success states.
- [x] Match the green/yellow SJ Fresh Hub design guide.

## Phase 4: Checkout and service-area validation

- [x] Build checkout form for contact details and delivery address.
- [x] Let customers select a saved address or add a new one.
- [x] Require an eligible building at checkout.
- [x] Revalidate building, shop status, product status, stock, quantity steps and price on the server.
- [x] Support only Cash on Delivery.
- [x] Recalculate totals on the server.
- [x] Create order and order items atomically and prevent overselling.
- [x] Build order confirmation page with order number, items, total and status.
- [x] Test tampered prices, inactive products and insufficient stock.

## Phase 5: Admin dashboard

- [x] Build admin layout, navigation and role-protected dashboard.
- [x] Dashboard summary cards: new orders, today's orders, low/out-of-stock products.
- [x] Products/inventory table with image, name, category, unit/weight, price, stock quantity, status and actions.
- [x] Add/edit product form and image upload.
- [x] Activate/deactivate products; avoid deleting records used by order history.
- [x] Category management page.
- [x] Buildings management page: add/edit/activate/deactivate.
- [x] Orders page with filters by status/date.
- [x] Order detail page with customer contact, building, address, items, totals and status history.
- [x] Add status transitions: placed, accepted, preparing, out for delivery, delivered, rejected/cancelled.
- [x] Add embedded Google Maps view plus “Open in Google Maps” fallback.
- [x] Settings page for shop location, radius, minimum order, delivery fee and open/closed status.
- [ ] Test every admin mutation with a non-admin account (server actions call `requireAdmin`; RPC/RLS also reject non-admins; live account check is still outstanding).

## Phase 6: Notifications

- [x] Create persistent `notifications` table and RLS policies.
- [x] Create admin notification after a successfully committed new order.
- [x] Create customer notification when admin accepts/rejects or updates an order.
- [x] Build header notification bell and unread count.
- [x] Build notification panel/page with mark-as-read and related-order links.
- [x] Subscribe to authorized Supabase Realtime changes and refresh the UI.
- [x] Fetch persisted notifications on page load and test reconnect/fallback behavior.
- [x] Ensure notification failures do not lose or roll back an order.
- [x] Optional later: browser push notifications with permission and service worker; do not add paid messaging by default.

## Phase 7: Testing and launch readiness

- [x] Unit tests for registration/building validation, Haversine, totals, stock and status transitions.
- [ ] E2E: register → select building → browse → cart → checkout COD → confirmation (guest cart → login is automated; signed-in COD still needs a live account pass).
- [ ] E2E: admin sees new order notification → accepts order → customer receives notification.
- [ ] E2E: admin updates status to delivered → customer receives notification.
- [x] E2E: non-admin cannot access admin routes/actions (unauthenticated `/admin` redirects to `/login`).
- [ ] Verify RLS on every protected table (policies exist in migrations; live dual-role pass still outstanding).
- [x] Test at 360 px, common Android sizes and desktop (Playwright specs added for 360 / Pixel 7 / desktop; install browsers with `npx playwright install`).
- [x] Verify map iframe and external link fallback (unit tests for URL builders; live iframe check at launch).
- [x] Add page titles, metadata and basic SEO.
- [x] Compress product images and test performance (admin upload cap 200 KB; compress source images before upload).
- [x] Configure production environment variables and Auth redirect URLs (documented in `docs/launch.md`).
- [ ] Deploy to a free plan that permits commercial use.
- [ ] Test order flow on the deployed site.
- [x] Export database backup and document recovery procedure (`docs/launch.md`).
- [ ] Re-check all provider terms, quotas and pause policies before launch.

## Phase 8: Future improvements

- [ ] Optional PWA install support.
- [x] Optional browser push notifications.
- [ ] Daily/weekly sales reports and CSV export.
- [ ] Delivery-person role and assigned deliveries.
- [ ] Reorder previous order.
- [ ] Regional language support.
- [ ] Optional UPI display/QR (not an online gateway).
- [ ] Road-distance validation if straight-line radius is insufficient.
- [ ] Re-evaluate paid plans only if free limits become insufficient.

## Ongoing
- [ ] Export/backup important database data periodically.
- [ ] Review free-tier limits and commercial-use terms quarterly.
- [ ] Update `memory.md` at the end of every work session.
