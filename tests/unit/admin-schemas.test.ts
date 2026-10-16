import { describe, expect, it } from "vitest";
import {
  buildingSchema,
  categorySchema,
  orderStatusSchema,
  productSchema,
} from "@/features/admin/schemas";

describe("admin schemas", () => {
  it("accepts a valid product payload", () => {
    const parsed = productSchema.parse({
      name: "Tomato",
      categoryId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
      unit: "kg",
      quantityStep: "0.5",
      price: "40",
      stockQuantity: "12",
    });
    expect(parsed.price).toBe(40);
    expect(parsed.quantityStep).toBe(0.5);
  });

  it("rejects a product without a name", () => {
    expect(
      productSchema.safeParse({
        name: "",
        categoryId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
        unit: "kg",
        quantityStep: 1,
        price: 10,
        stockQuantity: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects negative price or stock and a zero quantity step", () => {
    const base = {
      name: "Tomato",
      categoryId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
      unit: "kg",
      quantityStep: 1,
      price: 10,
      stockQuantity: 1,
    };
    expect(productSchema.safeParse({ ...base, price: -1 }).success).toBe(false);
    expect(productSchema.safeParse({ ...base, stockQuantity: -4 }).success).toBe(false);
    expect(productSchema.safeParse({ ...base, quantityStep: 0 }).success).toBe(false);
    expect(productSchema.safeParse({ ...base, quantityStep: -0.5 }).success).toBe(false);
  });

  it("accepts category and building payloads", () => {
    expect(categorySchema.parse({ name: "Vegetables" }).name).toBe("Vegetables");
    expect(buildingSchema.parse({ name: "Green Valley", address: "Near the park" }).name).toBe("Green Valley");
  });

  it("accepts an allowed order status change payload", () => {
    expect(
      orderStatusSchema.parse({
        orderId: "cccccccc-cccc-4ccc-8ccc-ccccccccccc1",
        status: "accepted",
        note: "On it",
      }).status,
    ).toBe("accepted");
  });
});
