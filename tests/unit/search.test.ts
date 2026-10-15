import { describe, expect, it } from "vitest";
import { normalizeSearchQuery, searchScore } from "@/lib/search";

describe("normalizeSearchQuery", () => {
  it("lowercases, strips punctuation and collapses spaces", () => {
    expect(normalizeSearchQuery("  Green   CHILLI, ")).toBe("green chilli");
  });
});

describe("searchScore", () => {
  const tomato = { name: "Tomato", categoryName: "Vegetables" };
  const greenChilli = { name: "Green Chilli", categoryName: "Vegetables" };

  it("matches regardless of case and extra spaces", () => {
    expect(searchScore(tomato, "  TOMATO ")).toBeGreaterThan(0);
  });

  it("matches plural searches against singular names", () => {
    expect(searchScore(tomato, "tomatoes")).toBeGreaterThan(0);
    expect(searchScore(greenChilli, "chillies")).toBeGreaterThan(0);
    expect(searchScore({ name: "Strawberry" }, "strawberries")).toBeGreaterThan(0);
  });

  it("matches words in any order", () => {
    expect(searchScore(greenChilli, "chilli green")).toBeGreaterThan(0);
  });

  it("matches by category name", () => {
    expect(searchScore(tomato, "vegetable")).toBeGreaterThan(0);
  });

  it("rejects items missing a word", () => {
    expect(searchScore(greenChilli, "red chilli")).toBe(0);
  });

  it("ranks name prefix matches above category matches", () => {
    expect(searchScore(tomato, "tom")).toBeGreaterThan(searchScore(greenChilli, "veg"));
  });
});
