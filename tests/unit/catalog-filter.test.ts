import { describe, expect, it } from "vitest";
import {
  filterShopCatalog,
  hasShopCatalogFilters,
  parseShopCatalogFilter,
  shopCatalogHref,
  type ShopCatalogFilter,
} from "@/features/shop/catalog-filter";
import type { StorefrontProduct } from "@/features/products/types";

function product(overrides: Partial<StorefrontProduct>): StorefrontProduct {
  return {
    id: "id",
    name: "Tomato",
    slug: "tomato",
    categoryId: "veg",
    categoryName: "Vegetables",
    imageUrl: null,
    unit: "kg",
    quantityStep: 0.5,
    price: 40,
    stockQuantity: 12,
    status: "active",
    ...overrides,
  };
}

const categories = [
  { id: "veg", slug: "vegetables" },
  { id: "fruit", slug: "fruits" },
];

describe("shop catalog filter", () => {
  it("parses known query params and ignores junk", () => {
    expect(
      parseShopCatalogFilter({
        q: "  tomato  ",
        category: "Vegetables",
        stock: "low",
        price: "under_50",
        sort: "price_desc",
      }),
    ).toEqual({
      q: "tomato",
      category: "vegetables",
      stock: "low",
      price: "under_50",
      sort: "price_desc",
    });
    expect(parseShopCatalogFilter({ stock: "all", price: "cheap", sort: "name", category: "??" })).toEqual({
      q: undefined,
      category: undefined,
      stock: undefined,
      price: undefined,
      sort: undefined,
    });
  });

  it("builds a home href without the default name sort", () => {
    expect(shopCatalogHref({ sort: "name" })).toBe("/");
    expect(shopCatalogHref({ stock: "in", q: "apple" })).toBe("/?q=apple&stock=in");
  });

  it("filters and sorts storefront products", () => {
    const rows = [
      product({ id: "a", name: "Apple", categoryId: "fruit", price: 70, stockQuantity: 6 }),
      product({ id: "b", name: "Mint", categoryId: "veg", price: 10, stockQuantity: 0 }),
      product({ id: "c", name: "Onion", categoryId: "veg", price: 35, stockQuantity: 2 }),
    ];
    const filter = (next: ShopCatalogFilter) => filterShopCatalog(rows, next, 5, categories).map((row) => row.name);

    expect(filter({ category: "fruits" })).toEqual(["Apple"]);
    expect(filter({ stock: "out" })).toEqual(["Mint"]);
    expect(filter({ stock: "low" })).toEqual(["Onion"]);
    expect(filter({ price: "under_50" })).toEqual(["Mint", "Onion"]);
    expect(filter({ price: "50_100" })).toEqual(["Apple"]);
    expect(filter({ sort: "price_asc" })).toEqual(["Mint", "Onion", "Apple"]);
    expect(hasShopCatalogFilters({ sort: "name" })).toBe(false);
    expect(hasShopCatalogFilters({ stock: "in" })).toBe(true);
  });
});
