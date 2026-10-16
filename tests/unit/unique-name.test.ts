import { describe, expect, it } from "vitest";
import { hasDuplicateName, namesMatchIgnoreCase } from "@/lib/unique-name";

describe("unique names", () => {
  it("treats mixed-case names as the same", () => {
    expect(namesMatchIgnoreCase("Tomato", "tomato")).toBe(true);
    expect(namesMatchIgnoreCase("  Leafy Greens ", "leafy greens")).toBe(true);
    expect(namesMatchIgnoreCase("Apple", "Banana")).toBe(false);
  });

  it("finds a duplicate while ignoring the current row", () => {
    const rows = [
      { id: "1", name: "Vegetables" },
      { id: "2", name: "Fruits" },
    ];
    expect(hasDuplicateName(rows, "VEGETABLES")).toBe(true);
    expect(hasDuplicateName(rows, "vegetables", "1")).toBe(false);
    expect(hasDuplicateName(rows, "Fruits", "1")).toBe(true);
  });
});
