# Development Rules

## 1. General principles

1. Simplicity first; build the smallest complete workflow before optional enhancements.
2. Free by default. Do not add a paid service or dependency without explicit approval.
3. Server is the source of truth for roles, prices, totals, stock, building eligibility and order status.
4. Mobile-first; test at 360 px before desktop.
5. Security by default: RLS on every protected table, least privilege, no secrets in the client.
6. One concern per change; keep code readable and reviewable.
7. Update `PRD.md`, `architecture.md`, `tasks.md` and `memory.md` when decisions change.
8. Every asynchronous UI path needs loading, empty, success and error states.
9. Never lose an order because a notification fails.
10. Keep the selected-building list admin-controlled and validate it on the server.

## 2. TypeScript and React/Next.js

- Enable `strict: true`; avoid `any`; use `unknown` and narrow it.
- Use generated Supabase database types.
- Validate all external input with Zod and infer TypeScript types from schemas.
- Default to Server Components. Add `"use client"` only for browser interactivity (cart, maps, forms, realtime subscriptions).
- Use Server Actions or Route Handlers for mutations; always authenticate and authorize on the server.
- Keep route files thin; put business logic in `features/*` or `lib/*`.
- Use `next/image` for images and `next/link` for internal navigation.
- Keep components focused; extract reusable logic and hooks.
- Use `@/` imports; avoid deep relative paths.
- No business logic hidden in JSX.

## 3. Authentication and authorization rules

- Use Supabase Auth with a mobile number and password; never store plaintext passwords.
- Registration creates a customer by default. Never accept `role` from the registration form or browser payload.
- Provision the first admin account through a trusted manual/server-side operation. Never hard-code admin credentials in source code.
- Admin page hiding is not authorization. Every admin Server Action/Route Handler must verify the authenticated user's role.
- Refresh/validate auth session using the recommended current Supabase SSR approach.
- Profile edits must allow only explicitly permitted fields; customers cannot change their own role or grant admin access.
- Building dropdown is loaded from active `buildings` records and checked again on registration and checkout.

## 4. Database and Supabase

- All schema changes go into versioned SQL migrations.
- Enable RLS on each table when it is created.
- Write policies in the same migration or a corresponding versioned migration.
- Service-role key is server-only and must never be imported by a client component or exposed as a `NEXT_PUBLIC_` variable.
- Use a transaction/RPC for creating an order plus order items and safely validating/updating stock.
- Use `numeric(10,2)` for money; do not use floating-point types for persisted currency.
- Store a snapshot of product name, unit and price in each order item.
- Keep a snapshot of the delivery address/building on the order so historical orders remain accurate if the customer edits their profile.
- Index common filters, including order status/date, user ID and notification recipient/read state.
- Do not hard-delete products/buildings that are referenced by orders; deactivate them instead.
- Back up important data regularly when the chosen free tier does not include automatic backups.

## 5. Order and inventory rules

For every order request:
1. Validate input with Zod.
2. Authenticate the customer and authorize the operation.
3. Check shop is open.
4. Confirm the building is active and eligible.
5. Validate address coordinates and configured service radius.
6. Load current product data from the database.
7. Validate product active status, unit steps, stock and quantity.
8. Recalculate subtotal, delivery fee and total on the server.
9. Create order and order items atomically; safely prevent overselling.
10. Persist the order before creating notifications.
11. Return a generic success/error response without leaking internal details.

- The only v1 payment method is `cod`.
- `payment_status` remains pending until cash is collected at delivery; mark it paid/collected only through an authorized operation.
- Enforce allowed status transitions, e.g. `placed → accepted → preparing → out_for_delivery → delivered`.
- Record who changed a status and when.
- A notification error must not roll back a committed order.

## 6. Notifications

- Store notifications in the database so offline users can see them later.
- A new order creates a notification for the admin recipient(s).
- Admin acceptance, rejection and delivery-status changes create notifications for the order's customer.
- Check authorization before subscribing to or reading notifications.
- Realtime is a delivery/refresh aid, not the source of truth; fetch stored notifications on page load and handle reconnects.
- Do not claim SMS, push or WhatsApp automation unless that channel is implemented and tested.
- Browser push uses the Web Push API, a service worker, and VAPID keys. Request permission before subscribing. Do not add paid FCM/OneSignal/SMS providers unless approved.

## 7. Maps and address privacy

- Google Maps iframe/link is used only to help the admin locate a delivery address.
- Construct map URLs safely and encode address text.
- Always provide an external “Open in Google Maps” link if the iframe fails.
- Do not use the map display as a substitute for server-side address and building validation.
- Share only the customer address needed for fulfilment.

## 8. Styling

- Use Tailwind tokens and values from `design.md`.
- Use a `cn()` helper for conditional classes.
- Avoid repeated arbitrary values; use design tokens where appropriate.
- Respect reduced-motion preferences.
- Ensure readable contrast, visible focus rings, labels and 44×44 px touch targets.

## 9. Naming

| Item | Convention | Example |
|---|---|---|
| Components | PascalCase | `ProductCard.tsx` |
| Hooks | camelCase `use*` | `useNotifications.ts` |
| Utility files | kebab-case | `haversine.ts` |
| Routes | kebab-case | `order-history` |
| Database | snake_case | `order_items` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_RADIUS_KM` |
| Environment variables | UPPER_SNAKE_CASE | `SUPABASE_SERVICE_ROLE_KEY` |

## 10. Error handling, testing and performance

- Use `error.tsx` and `not-found.tsx`.
- Show friendly messages; never expose stack traces or secrets.
- Avoid committed debug logs.
- Unit tests: distance calculation, price calculation, registration/building validation, order status transitions, notification authorization and Zod schemas.
- E2E tests: registration with active building, inactive building rejection, login/role guard, profile, browse/cart/checkout, out-of-area rejection, admin product management, order notification, status update and customer notification.
- Compress images (WebP preferred; target ≤200 KB).
- Use catalogue caching/revalidation where safe, but avoid stale stock/price during checkout.
- Lazy-load map and heavy client components.
- Rate-limit public mutation endpoints where possible within the hosting constraints.

## 11. Git and workflow

- Branches: `main`, `feature/<short-name>`, `fix/<short-name>`.
- Use Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`).
- Do not commit real `.env` files.
- Run lint, type-check and tests before merging.
- Update `tasks.md` and `memory.md` at the end of each work session.

## 12. Release security checklist

- [ ] RLS enabled and tested on every table.
- [ ] Service-role key is server-only.
- [ ] Admin account provisioned securely; no hard-coded credentials.
- [ ] Registration cannot set role or use inactive buildings.
- [ ] Admin actions independently verify role.
- [ ] Server recomputes prices, totals and stock.
- [ ] Order creation is atomic and safe against overselling.
- [ ] Customer can access only their own profile, addresses, orders and notifications.
- [ ] Notification recipients are verified server-side.
- [ ] Secrets and stack traces are not exposed.
- [ ] Order/notification flows tested while Realtime is disconnected.
- [ ] Free hosting plan permits commercial use.
