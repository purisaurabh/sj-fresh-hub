import { describe, expect, it } from "vitest";
import {
  buildingsFilterHref,
  filterAdminBuildings,
  hasAdminBuildingsFilters,
  parseAdminBuildingsFilter,
  type AdminBuildingRow,
} from "@/features/admin/buildings-filter";

function building(overrides: Partial<AdminBuildingRow>): AdminBuildingRow {
  return {
    id: "id",
    name: "Green Valley",
    address: "Near the park",
    is_active: true,
    linked_count: 0,
    ...overrides,
  };
}

describe("admin buildings filter", () => {
  it("parses known query params and ignores junk", () => {
    expect(
      parseAdminBuildingsFilter({
        status: "inactive",
        text: "empty",
        customers: "with",
        q: "  lake  ",
        sort: "name_desc",
        page: "2",
      }),
    ).toEqual({
      status: "inactive",
      text: "empty",
      customers: "with",
      q: "lake",
      sort: "name_desc",
      page: 2,
    });
    expect(parseAdminBuildingsFilter({ status: "nope", text: "all", customers: "all", sort: "name" })).toEqual({
      status: undefined,
      text: undefined,
      customers: undefined,
      q: undefined,
      sort: undefined,
      page: undefined,
    });
  });

  it("builds a buildings href without the default name sort", () => {
    expect(buildingsFilterHref({ sort: "name" })).toBe("/admin/buildings");
    expect(buildingsFilterHref({ status: "active", page: 2 })).toBe("/admin/buildings?status=active&page=2");
  });

  it("filters and sorts building rows", () => {
    const rows = [
      building({ id: "a", name: "Green Valley", address: "Park", is_active: true, linked_count: 4 }),
      building({ id: "b", name: "Lakeview Heights", address: null, is_active: false, linked_count: 0 }),
      building({ id: "c", name: "Sunrise Residency", address: "Lake View Lane", is_active: true, linked_count: 2 }),
    ];
    expect(filterAdminBuildings(rows, { status: "inactive" }).map((row) => row.name)).toEqual(["Lakeview Heights"]);
    expect(filterAdminBuildings(rows, { text: "empty" }).map((row) => row.name)).toEqual(["Lakeview Heights"]);
    expect(filterAdminBuildings(rows, { customers: "with" }).map((row) => row.name)).toEqual([
      "Green Valley",
      "Sunrise Residency",
    ]);
    expect(filterAdminBuildings(rows, { customers: "empty" }).map((row) => row.name)).toEqual(["Lakeview Heights"]);
    expect(filterAdminBuildings(rows, { q: "sunrise" }).map((row) => row.name)).toEqual(["Sunrise Residency"]);
    expect(filterAdminBuildings(rows, { sort: "name_desc" }).map((row) => row.name)).toEqual([
      "Sunrise Residency",
      "Lakeview Heights",
      "Green Valley",
    ]);
    expect(filterAdminBuildings(rows, { sort: "customers_desc" }).map((row) => row.name)).toEqual([
      "Green Valley",
      "Sunrise Residency",
      "Lakeview Heights",
    ]);
    expect(hasAdminBuildingsFilters({ sort: "name" })).toBe(false);
    expect(hasAdminBuildingsFilters({ text: "with" })).toBe(true);
    expect(hasAdminBuildingsFilters({ customers: "empty" })).toBe(true);
  });
});
