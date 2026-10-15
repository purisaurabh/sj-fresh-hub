import { describe, expect, it } from "vitest";
import { canAdminTransition, canCustomerCancel, orderStatusActionLabel } from "@/features/orders/status";

describe("order status transitions", () => {
  it("allows the fulfilment path", () => {
    expect(canAdminTransition("placed", "accepted")).toBe(true);
    expect(canAdminTransition("accepted", "preparing")).toBe(true);
    expect(canAdminTransition("preparing", "out_for_delivery")).toBe(true);
    expect(canAdminTransition("out_for_delivery", "delivered")).toBe(true);
  });

  it("allows authorised rejection and cancellation", () => {
    expect(canAdminTransition("placed", "rejected")).toBe(true);
    expect(canAdminTransition("placed", "cancelled")).toBe(true);
    expect(canAdminTransition("delivered", "cancelled")).toBe(false);
    expect(canAdminTransition("placed", "delivered")).toBe(false);
  });

  it("lets customers cancel only while the order is placed", () => {
    expect(canCustomerCancel("placed")).toBe(true);
    expect(canCustomerCancel("accepted")).toBe(false);
    expect(canCustomerCancel("delivered")).toBe(false);
  });

  it("uses present-tense action labels for admin buttons", () => {
    expect(orderStatusActionLabel("accepted")).toBe("Accept");
    expect(orderStatusActionLabel("rejected")).toBe("Reject");
    expect(orderStatusActionLabel("cancelled")).toBe("Cancel");
    expect(orderStatusActionLabel("preparing")).toBe("Prepare");
  });
});
