import { describe, expect, it } from "vitest";
import { hasAdminOrdersFilters, isBuildingId, ordersFilterHref, parseAdminOrdersFilter } from "@/features/admin/orders-filter";
import { endOfShopDayIso, startOfShopDayIso } from "@/lib/datetime";

const buildingId = "11111111-1111-4111-8111-111111111111";

describe("ordersFilterHref", () => {
  it("omits page 1 so the first page is the filter URL", () => {
    expect(ordersFilterHref({})).toBe("/admin/orders");
    expect(ordersFilterHref({ status: "placed", page: 1 })).toBe("/admin/orders?status=placed");
  });

  it("keeps status, dates and building when paging forward", () => {
    expect(
      ordersFilterHref({
        status: "placed",
        building: buildingId,
        from: "2026-10-15",
        to: "2026-10-16",
        page: 3,
      }),
    ).toBe(`/admin/orders?status=placed&building=${buildingId}&from=2026-10-15&to=2026-10-16&page=3`);
  });

  it("supports from-only, to-only, and order search", () => {
    expect(ordersFilterHref({ from: "2026-10-01" })).toBe("/admin/orders?from=2026-10-01");
    expect(ordersFilterHref({ to: "2026-10-31" })).toBe("/admin/orders?to=2026-10-31");
    expect(ordersFilterHref({ q: "SFH-12" })).toBe("/admin/orders?q=SFH-12");
  });
});

describe("parseAdminOrdersFilter", () => {
  it("swaps from and to when the range is reversed", () => {
    expect(parseAdminOrdersFilter({ from: "2026-10-16", to: "2026-10-15" })).toEqual({
      status: undefined,
      building: undefined,
      from: "2026-10-15",
      to: "2026-10-16",
      q: undefined,
      page: undefined,
    });
  });

  it("drops invalid status, dates and building ids", () => {
    expect(
      parseAdminOrdersFilter({
        status: "unknown",
        from: "15-10-2026",
        to: "not-a-date",
        building: "not-a-uuid",
        page: "0",
      }),
    ).toEqual({
      status: undefined,
      building: undefined,
      from: undefined,
      to: undefined,
      q: undefined,
      page: undefined,
    });
  });

  it("accepts a building id and order-number search", () => {
    const filter = parseAdminOrdersFilter({ building: buildingId, q: " SFH-12 " });
    expect(filter.building).toBe(buildingId);
    expect(filter.q).toBe("SFH-12");
    expect(hasAdminOrdersFilters(filter)).toBe(true);
  });

  it("strips wildcard characters from order search", () => {
    expect(parseAdminOrdersFilter({ q: "%SFH_1%" }).q).toBe("SFH1");
  });
});

describe("isBuildingId", () => {
  it("accepts standard uuids and rejects junk", () => {
    expect(isBuildingId(buildingId)).toBe(true);
    expect(isBuildingId("abc")).toBe(false);
    expect(isBuildingId(undefined)).toBe(false);
  });
});

describe("shop-day date range", () => {
  it("keeps a same-day from/to range inclusive in India time", () => {
    const from = startOfShopDayIso("2026-10-16");
    const to = endOfShopDayIso("2026-10-16");
    expect(from).toBe("2026-10-15T18:30:00.000Z");
    expect(to).toBe("2026-10-16T18:29:59.999Z");
    expect(Date.parse(to)).toBeGreaterThan(Date.parse(from));
  });
});
