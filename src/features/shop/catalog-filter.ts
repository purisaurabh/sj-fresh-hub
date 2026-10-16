import type { StorefrontProduct } from "@/features/products/types";

export const SHOP_STOCK_FILTERS = ["in", "low", "out"] as const;
export type ShopStockFilter = (typeof SHOP_STOCK_FILTERS)[number];

export const SHOP_PRICE_FILTERS = ["under_50", "50_100", "over_100"] as const;
export type ShopPriceFilter = (typeof SHOP_PRICE_FILTERS)[number];

export const SHOP_SORTS = ["name", "name_desc", "price_asc", "price_desc"] as const;
export type ShopSort = (typeof SHOP_SORTS)[number];

export type ShopCatalogFilter = {
  q?: string;
  category?: string;
  stock?: ShopStockFilter;
  price?: ShopPriceFilter;
  sort?: ShopSort;
};

function isStockFilter(value: string | undefined): value is ShopStockFilter {
  return Boolean(value && (SHOP_STOCK_FILTERS as readonly string[]).includes(value));
}

function isPriceFilter(value: string | undefined): value is ShopPriceFilter {
  return Boolean(value && (SHOP_PRICE_FILTERS as readonly string[]).includes(value));
}

function isShopSort(value: string | undefined): value is ShopSort {
  return Boolean(value && (SHOP_SORTS as readonly string[]).includes(value));
}

export function parseShopCatalogFilter(params: {
  q?: string;
  category?: string;
  stock?: string;
  price?: string;
  sort?: string;
}): ShopCatalogFilter {
  const q = params.q?.trim().replace(/[%_]/g, "").replace(/\s+/g, " ").slice(0, 40) || undefined;
  const category = params.category?.trim().toLowerCase().replace(/[^a-z0-9-]/g, "") || undefined;
  const sort = isShopSort(params.sort) ? params.sort : undefined;
  return {
    q,
    category,
    stock: isStockFilter(params.stock) ? params.stock : undefined,
    price: isPriceFilter(params.price) ? params.price : undefined,
    sort: sort && sort !== "name" ? sort : undefined,
  };
}

export function shopCatalogHref(filter: ShopCatalogFilter = {}) {
  const params = new URLSearchParams();
  if (filter.q) {
    params.set("q", filter.q);
  }
  if (filter.category) {
    params.set("category", filter.category);
  }
  if (filter.stock) {
    params.set("stock", filter.stock);
  }
  if (filter.price) {
    params.set("price", filter.price);
  }
  if (filter.sort && filter.sort !== "name") {
    params.set("sort", filter.sort);
  }
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export function hasShopCatalogFilters(filter: ShopCatalogFilter) {
  return Boolean(filter.category || filter.stock || filter.price || (filter.sort && filter.sort !== "name"));
}

export function matchesShopStock(stock: number, filter: ShopStockFilter, threshold: number) {
  if (filter === "out") {
    return stock <= 0;
  }
  if (filter === "low") {
    return stock > 0 && stock <= threshold;
  }
  return stock > threshold;
}

export function matchesShopPrice(price: number, filter: ShopPriceFilter) {
  if (filter === "under_50") {
    return price < 50;
  }
  if (filter === "50_100") {
    return price >= 50 && price <= 100;
  }
  return price > 100;
}

export function filterShopCatalog(
  products: StorefrontProduct[],
  filter: ShopCatalogFilter,
  threshold: number,
  categories: { id: string; slug: string }[] = [],
) {
  const categoryId = filter.category
    ? categories.find((category) => category.slug === filter.category)?.id
    : undefined;
  const filtered = products.filter((product) => {
    if (filter.category && product.categoryId !== categoryId) {
      return false;
    }
    if (filter.stock && !matchesShopStock(product.stockQuantity, filter.stock, threshold)) {
      return false;
    }
    if (filter.price && !matchesShopPrice(product.price, filter.price)) {
      return false;
    }
    return true;
  });

  const sort = filter.sort ?? "name";
  return filtered.sort((left, right) => {
    if (sort === "name_desc") {
      return right.name.localeCompare(left.name);
    }
    if (sort === "price_asc") {
      return left.price - right.price || left.name.localeCompare(right.name);
    }
    if (sort === "price_desc") {
      return right.price - left.price || left.name.localeCompare(right.name);
    }
    return left.name.localeCompare(right.name);
  });
}
