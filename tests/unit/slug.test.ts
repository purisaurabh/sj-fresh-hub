import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it("turns a product name into a URL slug", () => {
    expect(slugify(" Fresh Tomatoes ")).toBe("fresh-tomatoes");
  });

  it("falls back when nothing usable remains", () => {
    expect(slugify("***")).toBe("item");
  });
});
