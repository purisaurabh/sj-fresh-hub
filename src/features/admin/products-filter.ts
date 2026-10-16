import { PRODUCT_STATUSES, type ProductStatus } from "@/lib/constants";
import type { AdminProductRow } from "@/features/admin/queries";
import { parsePage } from "@/lib/paginate";

export const PRODUCT_STOCK_FILTERS = ["in", "low", "out"] as const;
export type ProductStockFilter = (typeof PRODUCT_STOCK_FILTERS)[number];

export const PRODUCT_SORTS = ["name", "price_asc", "price_desc", "stock_asc", "stock_desc"] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export type AdminProductsFilter = {
  status?: ProductStatus;
  category?: string;
  stock?: ProductStockFilter;
  q?: string;
  sort?: ProductSort;
  page?: number;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isCategoryId(value: string | undefined): value is string {
  return Boolean(value && UUID_RE.test(value));
}

function isProductStatus(value: string | undefined): value is ProductStatus {
  return Boolean(value && (PRODUCT_STATUSES as readonly string[]).includes(value));
}

function isStockFilter(value: string | undefined): value is ProductStockFilter {
  return Boolean(value && (PRODUCT_STOCK_FILTERS as readonly string[]).includes(value));
}

function isProductSort(value: string | undefined): value is ProductSort {
  return Boolean(value && (PRODUCT_SORTS as readonly string[]).includes(value));
}

export function parseAdminProductsFilter(params: {
  status?: string;
  category?: string;
  stock?: string;
  q?: string;
  sort?: string;
  page?: string;
}): AdminProductsFilter {
  const q = params.q?.trim().replace(/[%_]/g, "").replace(/\s+/g, " ").slice(0, 40) || undefined;
  const page = parsePage(params.page);
  return {
    status: isProductStatus(params.status) ? params.status : undefined,
    category: isCategoryId(params.category) ? params.category : undefined,
    stock: isStockFilter(params.stock) ? params.stock : undefined,
    q,
    sort: isProductSort(params.sort) ? params.sort : undefined,
    page: page > 1 ? page : undefined,
  };
}

export function productsFilterHref(filter: AdminProductsFilter = {}) {
  const params = new URLSearchParams();
  if (filter.status) {
    params.set("status", filter.status);
  }
  if (isCategoryId(filter.category)) {
    params.set("category", filter.category);
  }
  if (filter.stock) {
    params.set("stock", filter.stock);
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
  return query ? `/admin/products?${query}` : "/admin/products";
}

export function hasAdminProductsFilters(filter: AdminProductsFilter) {
  return Boolean(filter.status || filter.category || filter.stock || filter.q || (filter.sort && filter.sort !== "name"));
}

export function matchesProductStock(stock: number, filter: ProductStockFilter, threshold: number) {
  if (filter === "out") {
    return stock <= 0;
  }
  if (filter === "low") {
    return stock > 0 && stock <= threshold;
  }
  return stock > threshold;
}

export function filterAdminProducts(
  products: AdminProductRow[],
  filter: AdminProductsFilter,
  threshold: number,
) {
  const query = filter.q?.toLowerCase();
  const filtered = products.filter((product) => {
    if (filter.status && product.status !== filter.status) {
      return false;
    }
    if (filter.category && product.category_id !== filter.category) {
      return false;
    }
    if (filter.stock && !matchesProductStock(product.stock_quantity, filter.stock, threshold)) {
      return false;
    }
    if (query) {
      const haystack = `${product.name} ${product.category_name ?? ""} ${product.unit}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  });

  const sort = filter.sort ?? "name";
  return filtered.sort((left, right) => {
    if (sort === "price_asc") {
      return left.price - right.price || left.name.localeCompare(right.name);
    }
    if (sort === "price_desc") {
      return right.price - left.price || left.name.localeCompare(right.name);
    }
    if (sort === "stock_asc") {
      return left.stock_quantity - right.stock_quantity || left.name.localeCompare(right.name);
    }
    if (sort === "stock_desc") {
      return right.stock_quantity - left.stock_quantity || left.name.localeCompare(right.name);
    }
    return left.name.localeCompare(right.name);
  });
}
