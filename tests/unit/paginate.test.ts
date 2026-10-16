import { describe, expect, it } from "vitest";
import { paginateItems, parsePage } from "@/lib/paginate";

describe("paginateItems", () => {
  it("slices a page and clamps an out-of-range page", () => {
    const rows = ["a", "b", "c", "d", "e"];
    expect(paginateItems(rows, 2, 2)).toEqual({
      items: ["c", "d"],
      total: 5,
      page: 2,
      pageSize: 2,
      totalPages: 3,
    });
    expect(paginateItems(rows, 99, 2).page).toBe(3);
    expect(paginateItems(rows, 0, 2).page).toBe(1);
  });
});

describe("parsePage", () => {
  it("falls back to page 1", () => {
    expect(parsePage(undefined)).toBe(1);
    expect(parsePage("nope")).toBe(1);
    expect(parsePage("3")).toBe(3);
  });
});
