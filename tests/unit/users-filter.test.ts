import { describe, expect, it } from "vitest";
import {
  filterAdminUsers,
  hasAdminUsersFilters,
  parseAdminUsersFilter,
  userRoleLabel,
  usersFilterHref,
  type AdminUserListRow,
} from "@/features/admin/users-filter";

function user(overrides: Partial<AdminUserListRow>): AdminUserListRow {
  return {
    id: "id",
    full_name: "Asha Patel",
    phone: "9876543210",
    role: "customer",
    building_id: "11111111-1111-4111-8111-111111111111",
    building_name: "Green Valley",
    created_at: "2026-10-02T10:00:00.000Z",
    order_count: 0,
    open_order_count: 0,
    order_value: 0,
    ...overrides,
  };
}

describe("admin users filter", () => {
  it("parses known query params and ignores junk", () => {
    expect(
      parseAdminUsersFilter({
        role: "admin",
        building: "none",
        orders: "open",
        q: "  lake  ",
        sort: "name_desc",
        page: "3",
      }),
    ).toEqual({
      role: "admin",
      building: "none",
      orders: "open",
      q: "lake",
      sort: "name_desc",
      page: 3,
    });
    expect(parseAdminUsersFilter({ role: "staff", building: "nope", orders: "all", sort: "newest", page: "0" })).toEqual({
      role: undefined,
      building: undefined,
      orders: undefined,
      q: undefined,
      sort: undefined,
      page: undefined,
    });
  });

  it("builds a users href without the default newest sort", () => {
    expect(usersFilterHref({ sort: "newest" })).toBe("/admin/users");
    expect(usersFilterHref({ role: "customer", page: 2 })).toBe("/admin/users?role=customer&page=2");
  });

  it("filters and sorts user rows", () => {
    const rows = [
      user({
        id: "a",
        full_name: "Asha Patel",
        created_at: "2026-10-02T10:00:00.000Z",
        order_count: 4,
        open_order_count: 1,
        order_value: 800,
      }),
      user({
        id: "b",
        full_name: "Admin User",
        phone: "9000000000",
        role: "admin",
        building_id: null,
        building_name: null,
        created_at: "2026-10-10T10:00:00.000Z",
        order_count: 0,
      }),
      user({
        id: "c",
        full_name: "Ravi Shah",
        phone: "9123456780",
        building_id: "22222222-2222-4222-8222-222222222222",
        building_name: "Lake View",
        created_at: "2026-09-01T10:00:00.000Z",
        order_count: 2,
        open_order_count: 0,
        order_value: 1200,
      }),
    ];

    expect(filterAdminUsers(rows, { role: "admin" }).map((row) => row.full_name)).toEqual(["Admin User"]);
    expect(filterAdminUsers(rows, { building: "none" }).map((row) => row.full_name)).toEqual(["Admin User"]);
    expect(filterAdminUsers(rows, { orders: "open" }).map((row) => row.full_name)).toEqual(["Asha Patel"]);
    expect(filterAdminUsers(rows, { orders: "empty" }).map((row) => row.full_name)).toEqual(["Admin User"]);
    expect(filterAdminUsers(rows, { q: "lake" }).map((row) => row.full_name)).toEqual(["Ravi Shah"]);
    expect(filterAdminUsers(rows, { q: "+91 91234" }).map((row) => row.full_name)).toEqual(["Ravi Shah"]);
    expect(filterAdminUsers(rows, { sort: "name" }).map((row) => row.full_name)).toEqual([
      "Admin User",
      "Asha Patel",
      "Ravi Shah",
    ]);
    expect(filterAdminUsers(rows, { sort: "orders_desc" }).map((row) => row.full_name)).toEqual([
      "Asha Patel",
      "Ravi Shah",
      "Admin User",
    ]);
    expect(filterAdminUsers(rows, { sort: "spent_desc" }).map((row) => row.full_name)).toEqual([
      "Ravi Shah",
      "Asha Patel",
      "Admin User",
    ]);
    expect(filterAdminUsers(rows, {}).map((row) => row.full_name)).toEqual(["Admin User", "Asha Patel", "Ravi Shah"]);
    expect(hasAdminUsersFilters({ sort: "newest" })).toBe(false);
    expect(hasAdminUsersFilters({ orders: "with" })).toBe(true);
    expect(userRoleLabel("admin")).toBe("Admin");
    expect(userRoleLabel("customer")).toBe("Customer");
  });
});
