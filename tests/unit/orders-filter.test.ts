import { describe, expect, it } from "vitest";
import { ordersFilterHref } from "@/features/admin/orders-filter";

describe("ordersFilterHref", () => {
  it("omits page 1 so the first page is the filter URL", () => {
    expect(ordersFilterHref(undefined, undefined, 1)).toBe("/admin/orders");
    expect(ordersFilterHref("placed", undefined, 1)).toBe("/admin/orders?status=placed");
  });

  it("keeps status and from when paging forward", () => {
    expect(ordersFilterHref("placed", "2026-10-15", 3)).toBe(
      "/admin/orders?status=placed&from=2026-10-15&page=3",
    );
  });
});
