import { describe, expect, it } from "vitest";
import { checkoutSchema } from "@/features/orders/schemas";
import { mapOrderError } from "@/features/orders/errors";

const validInput = {
  addressId: "11111111-1111-4111-8111-111111111111",
  items: [{ productId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1", quantity: 0.5 }],
};

describe("checkout schema", () => {
  it("accepts address and quantities without trusting prices", () => {
    const parsed = checkoutSchema.parse({
      ...validInput,
      items: [{ ...validInput.items[0], unitPrice: 1 }],
    });
    expect(parsed.items[0]).not.toHaveProperty("unitPrice");
    expect(parsed.items[0]?.quantity).toBe(0.5);
  });

  it("rejects an empty cart", () => {
    expect(checkoutSchema.safeParse({ addressId: validInput.addressId, items: [] }).success).toBe(false);
  });
});

describe("place order errors", () => {
  it("maps stock and shop-closed failures to customer-facing copy", () => {
    expect(mapOrderError("INSUFFICIENT_STOCK")).toMatch(/stock/i);
    expect(mapOrderError("SHOP_CLOSED")).toMatch(/closed/i);
    expect(mapOrderError("BUILDING_INACTIVE")).toMatch(/building/i);
    expect(mapOrderError("ADMIN_REQUIRED")).toMatch(/admin/i);
    expect(mapOrderError("INVALID_STATUS_TRANSITION")).toMatch(/status/i);
    expect(mapOrderError("PAYMENT_COLLECT_NOT_ALLOWED")).toMatch(/cash/i);
  });
});
