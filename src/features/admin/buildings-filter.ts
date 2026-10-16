import { parsePage } from "@/lib/paginate";

export const BUILDING_TEXT_FILTERS = ["with", "empty"] as const;
export type BuildingTextFilter = (typeof BUILDING_TEXT_FILTERS)[number];

export const BUILDING_CUSTOMER_FILTERS = ["with", "empty"] as const;
export type BuildingCustomerFilter = (typeof BUILDING_CUSTOMER_FILTERS)[number];

export const BUILDING_SORTS = ["name", "name_desc", "customers_desc", "customers_asc"] as const;
export type BuildingSort = (typeof BUILDING_SORTS)[number];

export type AdminBuildingRow = {
  id: string;
  name: string;
  address: string | null;
  is_active: boolean;
  linked_count: number;
};

export type AdminBuildingsFilter = {
  status?: "active" | "inactive";
  text?: BuildingTextFilter;
  customers?: BuildingCustomerFilter;
  q?: string;
  sort?: BuildingSort;
  page?: number;
};

export function parseAdminBuildingsFilter(params: {
  status?: string;
  text?: string;
  customers?: string;
  q?: string;
  sort?: string;
  page?: string;
}): AdminBuildingsFilter {
  const q = params.q?.trim().replace(/[%_]/g, "").replace(/\s+/g, " ").slice(0, 40) || undefined;
  const page = parsePage(params.page);
  const status = params.status === "active" || params.status === "inactive" ? params.status : undefined;
  const text = (BUILDING_TEXT_FILTERS as readonly string[]).includes(params.text ?? "")
    ? (params.text as BuildingTextFilter)
    : undefined;
  const customers = (BUILDING_CUSTOMER_FILTERS as readonly string[]).includes(params.customers ?? "")
    ? (params.customers as BuildingCustomerFilter)
    : undefined;
  const sort = (BUILDING_SORTS as readonly string[]).includes(params.sort ?? "")
    ? (params.sort as BuildingSort)
    : undefined;
  return {
    status,
    text,
    customers,
    q,
    sort: sort && sort !== "name" ? sort : undefined,
    page: page > 1 ? page : undefined,
  };
}

export function buildingsFilterHref(filter: AdminBuildingsFilter = {}) {
  const params = new URLSearchParams();
  if (filter.status) {
    params.set("status", filter.status);
  }
  if (filter.text) {
    params.set("text", filter.text);
  }
  if (filter.customers) {
    params.set("customers", filter.customers);
  }
  if (filter.q) {
    params.set("q", filter.q);
  }
  if (filter.sort && filter.sort !== "name") {
    params.set("sort", filter.sort);
  }
  if (filter.page && filter.page > 1) {
    params.set("page", String(filter.page));
  }
  const query = params.toString();
  return query ? `/admin/buildings?${query}` : "/admin/buildings";
}

export function hasAdminBuildingsFilters(filter: AdminBuildingsFilter) {
  return Boolean(
    filter.status || filter.text || filter.customers || filter.q || (filter.sort && filter.sort !== "name"),
  );
}

export function filterAdminBuildings(buildings: AdminBuildingRow[], filter: AdminBuildingsFilter) {
  const query = filter.q?.toLowerCase();
  const filtered = buildings.filter((building) => {
    if (filter.status === "active" && !building.is_active) {
      return false;
    }
    if (filter.status === "inactive" && building.is_active) {
      return false;
    }
    const hasText = Boolean(building.address?.trim());
    if (filter.text === "with" && !hasText) {
      return false;
    }
    if (filter.text === "empty" && hasText) {
      return false;
    }
    if (filter.customers === "with" && building.linked_count <= 0) {
      return false;
    }
    if (filter.customers === "empty" && building.linked_count > 0) {
      return false;
    }
    if (query) {
      const haystack = `${building.name} ${building.address ?? ""}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  });

  const sort = filter.sort ?? "name";
  return filtered.sort((left, right) => {
    if (sort === "name_desc") {
      return right.name.localeCompare(left.name);
    }
    if (sort === "customers_desc") {
      return right.linked_count - left.linked_count || left.name.localeCompare(right.name);
    }
    if (sort === "customers_asc") {
      return left.linked_count - right.linked_count || left.name.localeCompare(right.name);
    }
    return left.name.localeCompare(right.name);
  });
}
