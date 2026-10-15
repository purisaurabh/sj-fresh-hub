import { describe, expect, it } from "vitest";
import { sortOrdersNewestFirst } from "@/features/orders/sort";

describe("sortOrdersNewestFirst", () => {
  it("puts the newest created_at first", () => {
    const sorted = sortOrdersNewestFirst([
      { order_no: "SFH-1001", created_at: "2026-10-01T10:00:00.000Z" },
      { order_no: "SFH-1003", created_at: "2026-10-14T10:00:00.000Z" },
      { order_no: "SFH-1002", created_at: "2026-10-10T10:00:00.000Z" },
    ]);
    expect(sorted.map((order) => order.order_no)).toEqual(["SFH-1003", "SFH-1002", "SFH-1001"]);
  });

  it("uses order number when timestamps match", () => {
    const sorted = sortOrdersNewestFirst([
      { order_no: "SFH-1001", created_at: "2026-10-14T10:00:00.000Z" },
      { order_no: "SFH-1010", created_at: "2026-10-14T10:00:00.000Z" },
    ]);
    expect(sorted[0]?.order_no).toBe("SFH-1010");
  });
});
