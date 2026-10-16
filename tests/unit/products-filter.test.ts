import { describe, expect, it } from "vitest";
import {
  filterAdminProducts,
  hasAdminProductsFilters,
  parseAdminProductsFilter,
  productsFilterHref,
} from "@/features/admin/products-filter";
import type { AdminProductRow } from "@/features/admin/queries";

function product(overrides: Partial<AdminProductRow>): AdminProductRow {
  return {
    id: "id",
    name: "Tomato",
    slug: "tomato",
    category_id: "cat-1",
    category_name: "Vegetables",
    image_url: null,
    unit: "kg",
    quantity_step: 1,
    price: 40,
    stock_quantity: 12,
    status: "active",
    description: null,
    ...overrides,
  };
}

describe("admin products filter", () => {
  it("parses known query params and ignores junk", () => {
    expect(
      parseAdminProductsFilter({
        status: "inactive",
        category: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
        stock: "low",
        q: "  toMA  ",
        sort: "price_desc",
      }),
    ).toEqual({
      status: "inactive",
      category: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
      stock: "low",
      q: "toMA",
      sort: "price_desc",
      page: undefined,
    });
    expect(parseAdminProductsFilter({ status: "nope", stock: "all", sort: "random" })).toEqual({
      status: undefined,
      category: undefined,
      stock: undefined,
      q: undefined,
      sort: undefined,
      page: undefined,
    });
  });

  it("builds a products href without the default name sort", () => {
    expect(productsFilterHref({ sort: "name" })).toBe("/admin/products");
    expect(productsFilterHref({ status: "active", sort: "stock_asc" })).toBe(
      "/admin/products?status=active&sort=stock_asc",
    );
    expect(productsFilterHref({ status: "active", page: 2 })).toBe("/admin/products?status=active&page=2");
  });

  it("filters and sorts catalog rows", () => {
    const rows = [
      product({ id: "a", name: "Apple", price: 80, stock_quantity: 2, status: "active" }),
      product({ id: "b", name: "Banana", price: 20, stock_quantity: 0, status: "inactive", category_id: "cat-2" }),
      product({ id: "c", name: "Carrot", price: 30, stock_quantity: 20, status: "active" }),
    ];
    const byPrice = filterAdminProducts(rows, { sort: "price_asc" }, 5);
    expect(byPrice.map((row) => row.name)).toEqual(["Banana", "Carrot", "Apple"]);
    const out = filterAdminProducts(rows, { stock: "out" }, 5);
    expect(out.map((row) => row.name)).toEqual(["Banana"]);
    const low = filterAdminProducts(rows, { stock: "low" }, 5);
    expect(low.map((row) => row.name)).toEqual(["Apple"]);
    const search = filterAdminProducts(rows, { q: "ban" }, 5);
    expect(search.map((row) => row.name)).toEqual(["Banana"]);
    expect(hasAdminProductsFilters({ sort: "name" })).toBe(false);
    expect(hasAdminProductsFilters({ sort: "price_desc" })).toBe(true);
  });
});
