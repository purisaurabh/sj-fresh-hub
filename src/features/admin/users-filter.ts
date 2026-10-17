import { isBuildingId } from "@/features/admin/orders-filter";
import { USER_ROLES, type UserRole } from "@/lib/constants";
import { parsePage } from "@/lib/paginate";

export const USER_ORDER_FILTERS = ["with", "empty", "open"] as const;
export type UserOrderFilter = (typeof USER_ORDER_FILTERS)[number];

export const USER_SORTS = ["newest", "oldest", "name", "name_desc", "orders_desc", "spent_desc"] as const;
export type UserSort = (typeof USER_SORTS)[number];

export type AdminUserListRow = {
  id: string;
  full_name: string;
  phone: string | null;
  role: string;
  building_id: string | null;
  building_name: string | null;
  created_at: string;
  order_count: number;
  open_order_count: number;
  order_value: number;
};

export type AdminUsersFilter = {
  role?: UserRole;
  building?: string;
  orders?: UserOrderFilter;
  q?: string;
  sort?: UserSort;
  page?: number;
};

export function parseAdminUsersFilter(params: {
  role?: string;
  building?: string;
  orders?: string;
  q?: string;
  sort?: string;
  page?: string;
}): AdminUsersFilter {
  const q = params.q?.trim().replace(/[%_]/g, "").replace(/\s+/g, " ").slice(0, 40) || undefined;
  const page = parsePage(params.page);
  const role = (USER_ROLES as readonly string[]).includes(params.role ?? "") ? (params.role as UserRole) : undefined;
  const building =
    params.building === "none" || isBuildingId(params.building) ? params.building : undefined;
  const orders = (USER_ORDER_FILTERS as readonly string[]).includes(params.orders ?? "")
    ? (params.orders as UserOrderFilter)
    : undefined;
  const sort = (USER_SORTS as readonly string[]).includes(params.sort ?? "") ? (params.sort as UserSort) : undefined;

  return {
    role,
    building,
    orders,
    q,
    sort: sort && sort !== "newest" ? sort : undefined,
    page: page > 1 ? page : undefined,
  };
}

export function usersFilterHref(filter: AdminUsersFilter = {}) {
  const params = new URLSearchParams();
  if (filter.role) {
    params.set("role", filter.role);
  }
  if (filter.building) {
    params.set("building", filter.building);
  }
  if (filter.orders) {
    params.set("orders", filter.orders);
  }
  if (filter.q) {
    params.set("q", filter.q);
  }
  if (filter.sort && filter.sort !== "newest") {
    params.set("sort", filter.sort);
  }
  if (filter.page && filter.page > 1) {
    params.set("page", String(filter.page));
  }
  const query = params.toString();
  return query ? `/admin/users?${query}` : "/admin/users";
}

export function hasAdminUsersFilters(filter: AdminUsersFilter) {
  return Boolean(filter.role || filter.building || filter.orders || filter.q || (filter.sort && filter.sort !== "newest"));
}

export function userRoleLabel(role: string) {
  return role === "admin" ? "Admin" : "Customer";
}

function searchDigits(value: string | undefined) {
  const raw = value ?? "";
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && (raw.includes("+") || digits.length > 10)) {
    digits = digits.slice(2);
  }
  return digits;
}

export function filterAdminUsers(users: AdminUserListRow[], filter: AdminUsersFilter) {
  const query = filter.q?.toLowerCase();
  const digits = searchDigits(filter.q);
  const filtered = users.filter((user) => {
    if (filter.role && user.role !== filter.role) {
      return false;
    }
    if (filter.building === "none" && user.building_id) {
      return false;
    }
    if (filter.building && filter.building !== "none" && user.building_id !== filter.building) {
      return false;
    }
    if (filter.orders === "with" && user.order_count <= 0) {
      return false;
    }
    if (filter.orders === "empty" && user.order_count > 0) {
      return false;
    }
    if (filter.orders === "open" && user.open_order_count <= 0) {
      return false;
    }
    if (query) {
      const haystack = `${user.full_name} ${user.phone ?? ""} ${user.building_name ?? ""}`.toLowerCase();
      const phoneMatch = digits.length >= 3 && (user.phone ?? "").includes(digits);
      if (!haystack.includes(query) && !phoneMatch) {
        return false;
      }
    }
    return true;
  });

  const sort = filter.sort ?? "newest";
  return filtered.sort((left, right) => {
    if (sort === "oldest") {
      return left.created_at.localeCompare(right.created_at) || left.full_name.localeCompare(right.full_name);
    }
    if (sort === "name") {
      return left.full_name.localeCompare(right.full_name);
    }
    if (sort === "name_desc") {
      return right.full_name.localeCompare(left.full_name);
    }
    if (sort === "orders_desc") {
      return right.order_count - left.order_count || left.full_name.localeCompare(right.full_name);
    }
    if (sort === "spent_desc") {
      return right.order_value - left.order_value || left.full_name.localeCompare(right.full_name);
    }
    return right.created_at.localeCompare(left.created_at) || left.full_name.localeCompare(right.full_name);
  });
}
