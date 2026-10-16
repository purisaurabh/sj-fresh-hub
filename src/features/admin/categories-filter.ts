import { parsePage } from "@/lib/paginate";

export const CATEGORY_PRODUCT_FILTERS = ["with", "empty"] as const;
export type CategoryProductFilter = (typeof CATEGORY_PRODUCT_FILTERS)[number];

export const CATEGORY_SORTS = ["order", "name", "name_desc", "products_desc", "products_asc"] as const;
export type CategorySort = (typeof CATEGORY_SORTS)[number];

export type AdminCategoryRow = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  product_count: number;
};

export type AdminCategoriesFilter = {
  status?: "active" | "inactive";
  products?: CategoryProductFilter;
  q?: string;
  sort?: CategorySort;
  page?: number;
};

export function parseAdminCategoriesFilter(params: {
  status?: string;
  products?: string;
  q?: string;
  sort?: string;
  page?: string;
}): AdminCategoriesFilter {
  const q = params.q?.trim().replace(/[%_]/g, "").replace(/\s+/g, " ").slice(0, 40) || undefined;
  const page = parsePage(params.page);
  const status = params.status === "active" || params.status === "inactive" ? params.status : undefined;
  const products = (CATEGORY_PRODUCT_FILTERS as readonly string[]).includes(params.products ?? "")
    ? (params.products as CategoryProductFilter)
    : undefined;
  const sort = (CATEGORY_SORTS as readonly string[]).includes(params.sort ?? "")
    ? (params.sort as CategorySort)
    : undefined;
  return {
    status,
    products,
    q,
    sort: sort && sort !== "order" ? sort : undefined,
    page: page > 1 ? page : undefined,
  };
}

export function categoriesFilterHref(filter: AdminCategoriesFilter = {}) {
  const params = new URLSearchParams();
  if (filter.status) {
    params.set("status", filter.status);
  }
  if (filter.products) {
    params.set("products", filter.products);
  }
  if (filter.q) {
    params.set("q", filter.q);
  }
  if (filter.sort && filter.sort !== "order") {
    params.set("sort", filter.sort);
  }
  if (filter.page && filter.page > 1) {
    params.set("page", String(filter.page));
  }
  const query = params.toString();
  return query ? `/admin/categories?${query}` : "/admin/categories";
}

export function hasAdminCategoriesFilters(filter: AdminCategoriesFilter) {
  return Boolean(filter.status || filter.products || filter.q || (filter.sort && filter.sort !== "order"));
}

export function filterAdminCategories(categories: AdminCategoryRow[], filter: AdminCategoriesFilter) {
  const query = filter.q?.toLowerCase();
  const filtered = categories.filter((category) => {
    if (filter.status === "active" && !category.is_active) {
      return false;
    }
    if (filter.status === "inactive" && category.is_active) {
      return false;
    }
    if (filter.products === "with" && category.product_count <= 0) {
      return false;
    }
    if (filter.products === "empty" && category.product_count > 0) {
      return false;
    }
    if (query && !category.name.toLowerCase().includes(query)) {
      return false;
    }
    return true;
  });

  const sort = filter.sort ?? "order";
  return filtered.sort((left, right) => {
    if (sort === "name") {
      return left.name.localeCompare(right.name);
    }
    if (sort === "name_desc") {
      return right.name.localeCompare(left.name);
    }
    if (sort === "products_desc") {
      return right.product_count - left.product_count || left.name.localeCompare(right.name);
    }
    if (sort === "products_asc") {
      return left.product_count - right.product_count || left.name.localeCompare(right.name);
    }
    return left.sort_order - right.sort_order || left.name.localeCompare(right.name);
  });
}
