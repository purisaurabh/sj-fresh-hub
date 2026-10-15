import { describe, expect, it } from "vitest";
import { calculateCartTotals, lineTotal, roundMoney } from "@/lib/money";

describe("money helpers", () => {
  it("rounds to two decimal places", () => {
    expect(roundMoney(10.005)).toBe(10.01);
    expect(lineTotal(40, 0.5)).toBe(20);
  });

  it("recalculates subtotal, delivery fee and total on the server-side helper", () => {
    const totals = calculateCartTotals(
      [
        { unitPrice: 40, quantity: 1.5 },
        { unitPrice: 35, quantity: 2 },
      ],
      20,
    );

    expect(totals.subtotal).toBe(130);
    expect(totals.deliveryFee).toBe(20);
    expect(totals.total).toBe(150);
  });
});
