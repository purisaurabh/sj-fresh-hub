import { describe, expect, it } from "vitest";
import { isValidQuantityStep, nextQuantity } from "@/features/products/quantity";

describe("quantity steps", () => {
  it("accepts multiples of the configured step", () => {
    expect(isValidQuantityStep(1, 1)).toBe(true);
    expect(isValidQuantityStep(0.5, 0.5)).toBe(true);
    expect(isValidQuantityStep(1.5, 0.5)).toBe(true);
  });

  it("rejects invalid quantities", () => {
    expect(isValidQuantityStep(0, 1)).toBe(false);
    expect(isValidQuantityStep(0.75, 0.5)).toBe(false);
    expect(isValidQuantityStep(1, 0)).toBe(false);
  });

  it("does not increment past stock", () => {
    expect(nextQuantity(2, 1, 2, 1)).toBe(2);
    expect(nextQuantity(2, 1, 5, 1)).toBe(3);
    expect(nextQuantity(1, 1, 5, -1)).toBe(0);
  });
});
