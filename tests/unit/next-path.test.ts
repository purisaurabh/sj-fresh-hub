import { describe, expect, it } from "vitest";
import { loginHref, registerHref, safeNextPath } from "@/lib/auth/next-path";

describe("safeNextPath", () => {
  it("keeps an in-app path with a query string", () => {
    expect(safeNextPath("/checkout")).toBe("/checkout");
    expect(safeNextPath("/orders?page=2")).toBe("/orders?page=2");
  });

  it("rejects off-site and auth loops", () => {
    expect(safeNextPath("https://example.com")).toBeNull();
    expect(safeNextPath("//evil.example")).toBeNull();
    expect(safeNextPath("/login")).toBeNull();
    expect(safeNextPath("/register?next=/checkout")).toBeNull();
    expect(safeNextPath("/auth/callback")).toBeNull();
  });
});

describe("loginHref", () => {
  it("adds a return path for protected pages", () => {
    expect(loginHref("/checkout")).toBe("/login?next=%2Fcheckout");
    expect(loginHref("/login")).toBe("/login");
  });

  it("keeps register on the same return path", () => {
    expect(registerHref("/orders")).toBe("/register?next=%2Forders");
  });
});
