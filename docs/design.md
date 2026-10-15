# Design Guide: SJ Fresh Hub

> Design foundation for a small-scale vegetables and fruits delivery experience inspired by quick-commerce apps such as Blinkit/Zepto, adapted to a local shop serving approved buildings within 5 km. Keep the existing visual direction and make the account, notification, checkout and admin experiences consistent with the storefront.

## 1. Design principles

1. **Farm-fresh and friendly:** deep greens, sunny yellow accents, rounded shapes and clear produce photos.
2. **Fast shopping:** categories, search, prices, stock and Add controls visible without unnecessary page hops.
3. **Trust at a glance:** business contact, delivery eligibility, clear order status and cash-on-delivery terms.
4. **Building-aware service:** registration and profile visibly show the selected building; checkout confirms the delivery address.
5. **Admin clarity:** inventory and order actions must be easy to use from a phone.
6. **Mobile-first:** design at 360 px first, then scale up.
7. **Accessible:** sufficient contrast, visible keyboard focus, labels, text statuses and 44×44 px minimum touch targets.
8. **Consistent:** reuse tokens, buttons, form fields, badges, cards and spacing.

## 2. Brand

- **Name:** SJ Fresh Hub
- **Tagline:** Vegetables and Fruits
- **Announcement bar:** “SJ Fresh Hub • Fresh Healthy Tasty Vegetables & Fruits”
- **Delivery pill:** “Home Delivery in Selected Buildings”
- **Hero tag:** “FARM FRESH • GOOD FOOD GOOD MOOD”
- **Hero heading:** “Fresh, Healthy & Tasty Produce Delivered to Your Home”
- **Logo direction:** green rounded square with white “SJ”, italic green “fresh”, and “Hub” highlighted in yellow.

Do not claim “Free Home Delivery” unless the owner confirms delivery is always free. Make delivery wording configurable.

## 3. Color palette

| Role | Name | Hex | Usage |
|---|---|---|---|
| Brand dark | Forest Green | `#14611E` | Announcement bar, primary CTA, active category |
| Brand | Leaf Green | `#16A34A` | Highlights, icons, secondary actions |
| Brand soft | Mint | `#F0FDF4` | Hover and soft badges |
| Accent | Sunshine Yellow | `#FACC15` | Pills, hero accent, brand highlight |
| Danger | Stock Red | `#DC2626` | Out-of-stock, errors, destructive actions |
| Warning | Amber | `#D97706` | Low stock, pending orders |
| Page background | Cool Gray | `#F7F8FC` | Main background |
| Surface | White | `#FFFFFF` | Cards and forms |
| Border | Gray 200 | `#E5E7EB` | Card/input borders |
| Input background | Gray 100 | `#F1F3F6` | Search and input surfaces |
| Primary text | Gray 900 | `#111827` | Headings and product names |
| Secondary text | Gray 500 | `#6B7280` | Supporting text |

Use dark green for small white text where contrast against leaf green is insufficient. Do not use yellow text on white backgrounds.

## 4. Typography and layout

- Font: Poppins (400/500/600/700) via `next/font/google`, with system-ui fallback.
- Optional regional font: Noto Sans Devanagari if Marathi/Hindi support is added.
- Main container: `max-w-[1250px] mx-auto px-4 md:px-6`.
- Cards: `rounded-xl`, white background, subtle border and shadow.
- Buttons: `rounded-lg`, primary CTA at least 44 px high.
- Inputs: at least 16 px font size on mobile.
- Product grid: 2 columns under 480 px, 3 at 640 px, 4 at 768 px, 5 at 1024 px, 6 at 1280 px.
- Use loading skeletons, empty states and helpful error messages.

## 5. Storefront pages

### 5.1 Announcement bar and header
- Forest-green announcement bar with delivery-area wording.
- Logo links to `/`.
- Search field filters product list.
- Account/profile entry, My Orders, notification bell with unread count, and cart total.
- Mobile: logo/cart on first row, search on second row, compact bottom navigation if useful.

### 5.2 Hero banner
- Green gradient from `#14611E` to `#16A34A`, rounded corners, yellow bottom accent.
- Short headline and subcopy.
- Small information panel with shop contact and delivery area.
- On mobile, stack the content and keep the hero compact.

### 5.3 Building/service indicator
- For signed-in customers, show their selected building in profile/account menu.
- If service is unavailable for an inactive building, show a clear message and prevent checkout.
- Do not expose private customer lists through building selection.

### 5.4 Category chips and product grid
- Categories come from the database, not hard-coded UI.
- Chips are horizontally scrollable on mobile.
- Product cards include image, name, category (where useful), unit/weight, price, stock status, and Add/quantity stepper.
- Out-of-stock items remain visible but are muted and cannot be added.
- Low-stock badge may display “Only 3 left” when stock is below a configurable threshold.
- Price must clearly indicate unit, e.g. `₹40 / 500 g` or `₹80 / kg`.

### 5.5 Cart and checkout
- Cart drawer/page lists thumbnail, product, unit, quantity stepper, line total, subtotal, delivery fee and total.
- Checkout sections: contact details → building and delivery address → optional map pin → order review → **Cash on Delivery**.
- Checkout confirms the delivery address and Cash on Delivery. Distance is not shown or used to block the order.
- Confirmation page shows order number, item summary, COD payment method and current status.

## 6. Authentication and profile

### Registration page
- Name, 10-digit mobile number, password, confirm password and building fields.
- Required building dropdown populated from active database buildings.
- Helper text: “We currently deliver only to selected buildings.”
- Inline validation and clear errors.
- Do not let the customer choose a role.
- Layout: stacked card on mobile, split-pane brand panel on laptop.

### Login page
- Mobile number and password only. Same screen for customers and admins.
- After login, redirect by server-verified role (`/` or `/admin`).
- Link to registration. No password recovery and no admin login option.

### Profile page
- Display name, mobile number and selected building.
- Edit allowed profile details.
- Manage saved delivery addresses.
- Link to order history and notifications.
- Do not display internal IDs or security-sensitive fields.

## 7. Customer notifications

- Bell icon with unread count in header.
- Notification panel/page with newest first.
- Each item shows a title, concise message, time, read/unread state and related order link.
- Example: “Order #SFH-1024 accepted”, “Your order is out for delivery”, “Your order was delivered”.
- Mark as read action and empty state.
- Realtime updates when connected; fetch persisted notifications on page load.
- Core v1 is **in-app notification**. Browser push, SMS and automated WhatsApp messages are not promised unless separately implemented.

## 8. Admin UI

### Navigation
- Dashboard
- Orders
- Products / Inventory
- Categories
- Buildings
- Notifications
- Settings

### Dashboard
- Cards: new/pending orders, today's orders, low-stock products.
- Recent orders table and quick links.
- Keep charts optional until there is meaningful data.

### Products / inventory table
Required columns:
1. Image
2. Name
3. Category
4. Unit/weight
5. Price
6. Stock quantity
7. Status
8. Actions

Actions: Add product, view/edit, activate/deactivate; deletion should be restricted or replaced by deactivation if the product has historical orders. Product form supports image upload, category, name, unit, price, quantity step, stock and status.

### Orders page
- Tabs/filter chips for placed, accepted, preparing, out for delivery, delivered, rejected/cancelled.
- Table/card shows order number, customer, building, total, created time and status.
- Order detail includes item list, customer phone, delivery address, building, notes, COD payment status and status history.
- Status buttons enforce valid transitions and require confirmation for reject/cancel.
- Address section displays an embedded Google Maps view where supported and a separate “Open in Google Maps” link.

### Buildings page
- Table with building name, address/landmark, active status and actions.
- Add/edit/deactivate building.
- Warn that deactivating a building prevents new registrations/orders but must not erase historical orders.

### Notifications page
- New-order alerts and relevant operational alerts.
- Unread/read indicators and link to the associated order.

### Settings page
- Shop name and phone.
- Shop coordinates and delivery radius (default 5 km).
- Minimum order, delivery fee, ordering open/closed toggle.
- All settings affecting checkout are enforced server-side.

## 9. Product status and order status styles

- Product active/in stock: green.
- Low stock: amber.
- Out of stock/inactive: red or muted with explicit text.
- Order placed: amber.
- Accepted: blue/green.
- Preparing: blue.
- Out for delivery: orange.
- Delivered: green.
- Rejected/cancelled: red/gray.

Never communicate status by color alone; always include a label.

## 10. Interaction and motion

- 150–200 ms transitions for hover, button press and cart drawer.
- No autoplay carousels.
- Respect `prefers-reduced-motion`.
- Show loading spinners and disable duplicate submission while an action is pending.
- Toasts for “Added to cart”, “Order placed”, “Profile updated”, and errors.
- Keep notifications persistent in the database, not only transient toast messages.

## 11. Imagery and accessibility

- Use clean, real-looking vegetable/fruit images; WebP preferred and ideally ≤200 KB each.
- Use `next/image` with explicit sizes and meaningful alt text.
- Provide image fallbacks.
- Inputs have labels and inline validation.
- Maintain visible focus rings, semantic HTML and keyboard navigation.
- Product stock states and notification status need text labels.
- Phone numbers use `tel:` links.
- Google Maps iframe has a descriptive title; always provide an external map link fallback.
