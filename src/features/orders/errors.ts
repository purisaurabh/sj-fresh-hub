const ERROR_MESSAGES: Record<string, string> = {
  AUTH_REQUIRED: "Please log in to place an order.",
  EMPTY_CART: "Your cart is empty.",
  SETTINGS_MISSING: "The shop is not ready to take orders yet.",
  SHOP_CLOSED: "Ordering is currently closed. Please try again later.",
  ADDRESS_NOT_FOUND: "Choose a saved delivery address.",
  BUILDING_REQUIRED: "This address needs an approved building.",
  BUILDING_INACTIVE: "This building is no longer available for delivery.",
  COORDINATES_REQUIRED: "Could not place the order. Run the latest checkout SQL in Supabase, then try again.",
  OUTSIDE_DELIVERY_RADIUS: "Could not place the order. Run the latest checkout SQL in Supabase, then try again.",
  INVALID_PAYLOAD: "The order could not be read. Please refresh and try again.",
  PRODUCT_UNAVAILABLE: "An item in your cart is no longer available.",
  INVALID_QUANTITY: "One or more quantities are not valid for this product.",
  INSUFFICIENT_STOCK: "Some items do not have enough stock. Update your cart and try again.",
  BELOW_MINIMUM_ORDER: "Add a few more items to meet the minimum order.",
  CANCEL_NOT_ALLOWED: "This order can no longer be cancelled.",
  ORDER_NOT_FOUND: "That order could not be found.",
  ADMIN_REQUIRED: "You need an admin account for this action.",
  INVALID_STATUS_TRANSITION: "That status change is not allowed.",
  PAYMENT_COLLECT_NOT_ALLOWED: "Collect cash after the order is out for delivery.",
};

export function mapOrderError(message: string | null | undefined): string {
  const text = message ?? "";
  for (const [code, friendly] of Object.entries(ERROR_MESSAGES)) {
    if (text.includes(code)) {
      return friendly;
    }
  }
  return "Could not complete this order. Please try again.";
}
