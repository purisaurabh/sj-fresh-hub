# Project Memory

> Update this file at the end of every work session. It is the quick-start context for resuming the project.

**Last updated:** 2026-10-14

## Project summary

**SJ Fresh Hub** is a small-scale, mobile-first vegetable and fruit delivery website inspired by quick-commerce storefronts, serving only selected/approved buildings.

**Stack:** Next.js 16 App Router + TypeScript + Tailwind CSS v4 + shadcn/ui + Supabase PostgreSQL/Auth/Storage/Realtime. Next.js handles both frontend and backend logic.

**Design:** Farm-fresh green and yellow palette, Poppins typography, compact hero, category chips, searchable product grid, visible stock states, mobile-first layout.

## Confirmed requirements

- Customer registration and login.
- Registration includes a required dropdown populated from an admin-maintained list of active buildings.
- Customer profile page displays account details, selected building and saved delivery addresses.
- Customer can browse products, add them to a cart, select delivery address and place an order.
- Only Cash on Delivery is enabled in v1; cash is collected on delivery.
- Roles: customer and admin.
- Admin has a protected dashboard and securely provisioned credentials.
- Admin manages product image, name, category, unit/weight, price, stock quantity, status and actions.
- Admin manages categories, buildings, orders and relevant shop settings.
- New orders create admin in-app notifications.
- Admin acceptance/rejection/status changes create customer in-app notifications.
- Notifications are persisted in the database and may use Supabase Realtime for prompt UI refresh.
- Browser users and admins can opt in to Web Push so alerts appear in the browser/OS notification bar.
- Admin order details include a Google Maps iframe where supported and an “Open in Google Maps” fallback.
- Service eligibility is checked server-side using an active approved building.
- Free/open-source tools and free tiers are preferred; no paid service without explicit approval.

## Current status

**Phase:** Phase 7 launch-readiness in progress. App features through notifications/Web Push are in code.  
**Code status:** Storefront, cart, phone/password auth, profile/addresses, checkout COD, admin dashboard, in-app + browser push notifications, page metadata/SEO, e2e smoke tests, and `docs/launch.md` are in the workspace. Deploy and live dual-role RLS/order e2e still need the owner.

## Key documents

- `docs/PRD.md`: requirements and acceptance criteria.
- `docs/architecture.md`: system architecture, database schema, RLS and folder structure.
- `docs/design.md`: visual design and page/component specifications.
- `docs/rules.md`: implementation, security and testing rules.
- `docs/tasks.md`: phased development checklist.
- `docs/memory.md`: this quick-start context.

## Key decisions

| Date | Decision | Reason |
|---|---|---|
| 2026-10-13 | Next.js App Router + TypeScript | One repository for frontend and backend |
| 2026-10-13 | Supabase PostgreSQL/Auth/Storage/Realtime | Database and supporting features on free tier |
| 2026-10-13 | Active-building dropdown at registration | Restrict service to buildings provided by the owner |
| 2026-10-13 | Roles are customer/admin | Separate customer and admin capabilities |
| 2026-10-13 | Cash on Delivery only in v1 | Avoid payment gateway fees |
| 2026-10-13 | Persistent in-app notifications + Realtime | No paid SMS/WhatsApp API required |
| 2026-10-14 | Browser Web Push with VAPID + service worker | Owner asked for notification-bar alerts; no paid push vendor |
| 2026-10-13 | Checkout is limited to approved buildings, not a 5 km radius | Owner asked to drop the distance check |
| 2026-10-13 | Google Maps iframe/link in admin order details | Help admin locate delivery address |
| 2026-10-13 | Preserve SJ Fresh Hub green/yellow visual direction | Consistent storefront and admin experience |
| 2026-10-13 | Next.js 16 `src/proxy.ts` instead of `middleware.ts` | Current App Router request-boundary convention |
| 2026-10-15 | No `src/proxy.ts` / `middleware.ts` on Cloudflare | OpenNext Node middleware is experimental and 1101-prone; auth stays in layouts |
| 2026-10-13 | Keep `cacheComponents` enabled | Default Next.js 16 performance model; public catalog uses `'use cache'` |
| 2026-10-15 | Disable `cacheComponents` on Cloudflare Workers | Next.js 16 Cache Components throws Error 1101 on every Worker request |
| 2026-10-13 | Placeholder shop coordinates in `settings` (Pune sample) | Owner has not confirmed the real shop location |
| 2026-10-13 | Delivery fee and minimum order default to 0 | Owner has not confirmed commercial values |
| 2026-10-13 | English-only UI for now | Language choice is still open |
| 2026-10-13 | Hand-written `database.types.ts` matching migrations | Types match applied SQL; regenerate after schema changes |
| 2026-10-13 | `place_order` RPC does not insert notifications | Notification failure must not roll back a committed order |
| 2026-10-13 | Create `profiles` with the service role after signup | Email confirmation can leave no session; role is still forced to `customer` |

## Open questions

- What is the final building list?
- Should building records include coordinates, address and landmark?
- What is the shop's exact location?
- What delivery fee and minimum order value should be used?
- English only, or Marathi/Hindi as well?
- Which commercial-use-compatible free hosting provider will be selected?

## Risks and notes

- Free-tier limits and terms can change.
- Some free hosts restrict commercial use; verify before deployment.
- Supabase free projects may pause after inactivity.
- Backups need an explicit plan on the free tier.
- Checkout does not enforce a delivery radius.
- Google Maps iframe/link behavior and terms should be verified before launch.
- Browser Realtime notifications require a connected browser; persisted notification records are the fallback.
- Never expose Supabase service-role credentials to client-side code.
- Public catalog reads are verified live. Authenticated RLS still needs a real customer/admin user.
- Catalogue caching is for browsing only. Checkout must reload live prices and stock.
- Add Auth redirect URL `http://localhost:3000/auth/callback` in the Supabase dashboard.
- Login and registration use a 10-digit mobile number and a password. Email is not collected in the UI.
- Existing accounts need `profiles.phone` set to a 10-digit number, and must use the password stored in Supabase Auth.
- Admins use `/login`. After sign-in, `profiles.role = 'admin'` sends them to `/admin`.

## Next steps

1. Apply remaining SQL (`place_order_no_distance` and `push_subscriptions`) if not already run.
2. Follow `docs/launch.md`: Auth callback URLs, backups, and a commercial-use-compatible host.
3. Walk through a live COD order + admin accept/deliver on the deployed site.
