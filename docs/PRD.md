# Product Requirements Document (PRD)

**Project:** SJ Fresh Hub — Vegetables & Fruits Delivery  
**Version:** 2.0  
**Status:** Updated requirements  
**Primary goal:** A small-scale, mobile-first grocery storefront inspired by Blinkit/Zepto, serving only approved buildings, built with free/open-source software and eligible free tiers.

---

## 1. Overview

SJ Fresh Hub allows residents of selected buildings to register, browse available vegetables and fruits, add items to a cart, select a delivery address, and place a Cash on Delivery (COD) order. The admin manages building eligibility, products, categories, images, prices, inventory, orders, and shop settings.

The application uses **Next.js App Router + TypeScript + Tailwind CSS + Supabase (PostgreSQL, Auth, Storage, Realtime)**. Next.js provides both the frontend and server-side application logic.

## 2. Goals and success measures

| Goal | Success measure |
|---|---|
| Simple shopping | Customer can browse, add products, and submit an order with minimal steps |
| Restricted service area | Registration and checkout are limited to admin-approved buildings |
| Account management | Customer can register, log in, view and update their profile, and manage saved addresses |
| Admin operations | Admin can manage product catalog, stock, prices, categories, buildings, orders, and settings |
| Activity notifications | New orders notify admin in-app; order/status changes notify the relevant customer in-app |
| Secure roles | Customer and admin permissions are enforced server-side and through database RLS |
| Cost control | Use free/open-source tools and free tiers; no paid gateway, SMS OTP, paid map API, or paid notification service in v1 |

## 3. Roles

### Customer
- Register and log in.
- Select a building from an admin-maintained dropdown during registration. Only active/approved buildings are offered.
- View and update their profile details.
- Maintain one or more delivery addresses.
- Browse products by category, search, see availability and price/unit, and add items to cart.
- Place an order using Cash on Delivery.
- View order history, current status, and in-app notifications.
- Receive a notification when the admin accepts, rejects/cancels, or updates the delivery status of an order.

### Admin
- Sign in using an admin account provisioned securely by the project owner.
- Access a separate protected admin dashboard.
- Manage buildings and whether each building is eligible for service.
- Create/update/deactivate categories and products.
- Upload product images and manage name, category, unit/weight, price, stock quantity, availability/status, and actions.
- View and manage orders, accept or reject orders, and update order status.
- View customer and delivery details needed to fulfil an order.
- Open the delivery address in a Google Maps iframe/link.
- Receive in-app notifications for new orders and relevant order activity.
- Configure shop location, service radius, delivery fees/minimum order, and whether ordering is open.

## 4. Functional requirements

### 4.1 Registration, login and profile
- FR-1: Provide registration and login pages.
- FR-2: Registration collects full name, mobile number, password and a required building dropdown populated from active `buildings` records. Email is not collected.
- FR-3: Reject registration if the selected building is inactive or not found in the database.
- FR-4: Use Supabase Auth for session management with a mobile number and password. Do not store plaintext passwords.
- FR-5: Create a `profiles` row associated with the authenticated user. Customers cannot set or change their own role.
- FR-6: Profile page displays name, mobile number, selected building, and saved delivery addresses. Allow appropriate profile edits. The login mobile number is not editable from the profile form.
- FR-7: Admin role is assigned only by a trusted server/admin operation; never trust a role sent from the browser.
- FR-8: Customers and admins use the same `/login` screen (mobile number and password). After login the server reads `profiles.role` and sends admins to `/admin` and customers to the shop. There is no separate admin login option.

### 4.2 Buildings and service eligibility
- FR-9: Maintain a `buildings` table with building name, optional address/landmark, active status, and optional coordinates.
- FR-10: Admin can add/edit/activate/deactivate buildings.
- FR-11: Registration dropdown only displays active buildings supplied by the business owner.
- FR-12: Checkout requires a delivery address. Validate the selected building and address again on the server.
- FR-13: Checkout is limited to an active building from the approved list. Distance is not used to accept or reject an order.
- FR-14: If a building is disabled, block checkout with a clear explanation.

### 4.3 Product catalog and storefront
- FR-15: Product fields include image, name, category, description (optional), unit/weight, price, stock quantity, status, and timestamps.
- FR-16: Units can include kg, g, piece, bunch, packet, or other admin-configured labels. Quantity increments must respect each product's configured step.
- FR-17: Show categories, search, product cards, current price/unit, stock availability and an Add/quantity-stepper control.
- FR-18: Out-of-stock/inactive products cannot be added to the cart.
- FR-19: Keep the visual direction in `design.md`: farm-fresh green and yellow palette, compact hero, category chips, product grid, visible stock states, mobile-first layout.

### 4.4 Cart and checkout
- FR-20: Cart supports add, remove, and quantity updates and persists locally for a guest/session where appropriate.
- FR-21: Checkout requires a customer delivery address and contact details.
- FR-22: Only **Cash on Delivery** is enabled in v1. The customer pays the delivery person in cash when the order is delivered; no online payment gateway is required.
- FR-23: Server reloads product prices and stock, recalculates totals and delivery fees, validates quantities and building eligibility, then creates the order.
- FR-24: Create the order and order items atomically to avoid partial orders.
- FR-25: Show order number, item summary, total, COD method and initial status after successful placement.

### 4.5 Order lifecycle
- FR-26: Status flow: `placed → accepted → preparing → out_for_delivery → delivered`; cancellation/rejection states are also supported.
- FR-27: Admin can accept or reject a new order, then update the status through fulfilment.
- FR-28: Customer can view current status and order history.
- FR-29: Admin actions and customer-facing status changes are recorded with timestamps.
- FR-30: Do not mark an order delivered automatically. Admin explicitly marks it delivered after handoff/payment collection.
- FR-31: Define and test cancellation rules. At minimum, customer cancellation is allowed only while the order is `placed`; admin can reject/cancel with a reason.

### 4.6 Notifications
- FR-32: Provide an in-app notifications page/panel for both roles.
- FR-33: On successful order placement, create an admin notification such as “New order #123 received”.
- FR-34: When admin accepts/rejects an order or changes its status, create a notification for that customer.
- FR-35: Notifications include recipient, type, title/message, related order, read/unread state, and timestamp.
- FR-36: Use Supabase Realtime where available to update the UI promptly; also fetch unread notifications on page load so the experience does not depend solely on an open realtime connection.
- FR-37: Browser push notifications are optional future work and require browser permission/service-worker support. Core v1 notifications are in-app; do not promise SMS, WhatsApp API or push delivery without implementing and verifying them.
- FR-38: Write the order to the database before creating or broadcasting notifications. A notification failure must not lose an order.

### 4.7 Admin dashboard
- FR-39: Dashboard summary cards show new/pending orders, today's order count, and low/out-of-stock products.
- FR-40: Products page table columns: image, name, category, unit/weight, price, stock quantity, status, and action buttons (view/edit/activate/deactivate).
- FR-41: Product create/edit form supports image upload to Supabase Storage.
- FR-42: Orders page supports filters by status/date, order details, customer contact, building, address, item list, totals, status updates and relevant notifications.
- FR-43: Address detail includes an embedded Google Maps view where feasible and a clear “Open in Google Maps” link. Do not require a paid Google Maps API key for the basic address query embed; confirm current Google Maps terms before production use.
- FR-44: Settings page allows authorized admin to maintain shop coordinates, radius (default 5 km), minimum order, delivery fee, open/closed state and support phone.
- FR-45: Admin can manage active/inactive buildings.

## 5. Non-functional requirements
- Mobile-first and usable at 360 px width.
- TypeScript strict mode; validate external input with Zod.
- Enable Row Level Security (RLS) on all tables containing protected data.
- Never expose the Supabase service-role key in browser code.
- Server is authoritative for roles, prices, totals, stock and building eligibility.
- Provide loading, empty, success and error states.
- Use accessible labels, keyboard focus states and touch targets of at least 44×44 px.
- Compress product images and limit uploads to a sensible size.
- Back up important order data manually while using a free database tier.
- No mandatory paid services in v1; hosting provider must permit the business's commercial use.

## 6. Out of scope for v1
- Online card/payment-gateway integration.
- SMS OTP or paid messaging APIs.
- Driver live tracking and route optimization.
- Multi-vendor marketplace.
- Automated WhatsApp Business API.
- Native iOS/Android apps.

## 7. Acceptance criteria
1. A user can register only with an active building from the dropdown.
2. Customer and admin can log in, but customer sessions cannot access admin pages or admin mutations.
3. Customer profile shows correct account/building/address details.
4. Customer can browse products, manage a cart and place a COD order with a delivery address.
5. Server rejects inactive/out-of-stock products, manipulated prices and out-of-area addresses.
6. Admin can manage product image, name, category, unit/weight, price, stock and status.
7. New orders create admin in-app notifications; admin status changes create customer in-app notifications.
8. Admin order detail provides a map embed/link for the delivery address.
9. An order remains stored even if notification delivery fails.
10. Main flows work on mobile and desktop and have loading/error/empty states.

## 8. Decisions still needed
- Final building list and whether buildings need separate address/coordinates.
- Exact logo and brand assets.
- Delivery fee and minimum order rules.
- Whether the site should be English-only or also Marathi/Hindi.
- Whether browser push notifications are required in v1 (recommended: start with in-app notifications).
- Final hosting provider whose free tier allows commercial use.
