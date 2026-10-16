import { describe, expect, it } from "vitest";
import {
  categoriesFilterHref,
  filterAdminCategories,
  hasAdminCategoriesFilters,
  parseAdminCategoriesFilter,
  type AdminCategoryRow,
} from "@/features/admin/categories-filter";

function category(overrides: Partial<AdminCategoryRow>): AdminCategoryRow {
  return {
    id: "id",
    name: "Vegetables",
    slug: "vegetables",
    sort_order: 0,
    is_active: true,
    product_count: 3,
    ...overrides,
  };
}

describe("admin categories filter", () => {
  it("parses known query params and ignores junk", () => {
    expect(
      parseAdminCategoriesFilter({
        status: "inactive",
        products: "empty",
        q: "  leaf  ",
        sort: "name_desc",
        page: "2",
      }),
    ).toEqual({
      status: "inactive",
      products: "empty",
      q: "leaf",
      sort: "name_desc",
      page: 2,
    });
    expect(parseAdminCategoriesFilter({ status: "nope", products: "all", sort: "order" })).toEqual({
      status: undefined,
      products: undefined,
      q: undefined,
      sort: undefined,
      page: undefined,
    });
  });

  it("builds a categories href without default shop order", () => {
    expect(categoriesFilterHref({ sort: "order" })).toBe("/admin/categories");
    expect(categoriesFilterHref({ status: "active", page: 2 })).toBe("/admin/categories?status=active&page=2");
  });

  it("filters and sorts category rows", () => {
    const rows = [
      category({ id: "a", name: "Vegetables", sort_order: 0, product_count: 3, is_active: true }),
      category({ id: "b", name: "Fruits", sort_order: 1, product_count: 0, is_active: false }),
      category({ id: "c", name: "Herbs", sort_order: 2, product_count: 1, is_active: true }),
    ];
    expect(filterAdminCategories(rows, { status: "inactive" }).map((row) => row.name)).toEqual(["Fruits"]);
    expect(filterAdminCategories(rows, { products: "empty" }).map((row) => row.name)).toEqual(["Fruits"]);
    expect(filterAdminCategories(rows, { q: "herb" }).map((row) => row.name)).toEqual(["Herbs"]);
    expect(filterAdminCategories(rows, { sort: "products_desc" }).map((row) => row.name)).toEqual([
      "Vegetables",
      "Herbs",
      "Fruits",
    ]);
    expect(hasAdminCategoriesFilters({ sort: "order" })).toBe(false);
    expect(hasAdminCategoriesFilters({ products: "with" })).toBe(true);
  });
});
