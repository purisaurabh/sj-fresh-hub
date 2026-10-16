export const LOW_STOCK_THRESHOLD = 5;
export const PRODUCT_IMAGE_BUCKET = "product-images";
export const MAX_PRODUCT_IMAGE_BYTES = 200 * 1024;
export const ORDER_NO_PREFIX = "SFH-";
export const SHOP_CONTACT_PHONE = "9876543210";
export const ORDERS_PAGE_SIZE = 8;
export const ADMIN_ORDERS_PAGE_SIZE = ORDERS_PAGE_SIZE;
export const ADMIN_CATALOG_PAGE_SIZE = ADMIN_ORDERS_PAGE_SIZE;
export const NOTIFICATIONS_PAGE_SIZE = 12;

export const SHOP_HOURS_TITLE = "Order and delivery hours";
export const SHOP_HOURS_MESSAGE =
  "We accept orders from 9:00 AM to 12:00 PM. We deliver only from 3:00 PM to 6:00 PM.";
export const SHOP_HOURS_DONE_EVENT = "sj-fresh-hub:shop-hours-done";
export const SHOP_HOURS_SEEN_KEY = "sj-fresh-hub-shop-hours-seen-v2";
export const PUSH_PROMPT_SEEN_KEY = "sj-fresh-hub-push-prompt-seen-v2";

export const USER_ROLES = ["customer", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PRODUCT_STATUSES = ["active", "inactive"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const ORDER_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "out_for_delivery",
  "delivered",
  "rejected",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ["cod"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = ["pending", "collected"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
