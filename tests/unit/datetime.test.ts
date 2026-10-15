import { describe, expect, it } from "vitest";
import { formatDateTime, formatPhone, isIsoDateOnly, startOfShopDayIso } from "@/lib/datetime";

describe("datetime helpers", () => {
  it("formats an ISO timestamp for India locale", () => {
    expect(formatDateTime("2026-10-13T08:30:00.000Z")).toMatch(/2026/);
  });

  it("formats a 10-digit mobile number", () => {
    expect(formatPhone("9876543210")).toBe("+91 9876543210");
    expect(formatPhone(null)).toMatch(/no phone/i);
  });

  it("accepts only YYYY-MM-DD shop dates", () => {
    expect(isIsoDateOnly("2026-10-14")).toBe(true);
    expect(isIsoDateOnly("14-10-2026")).toBe(false);
  });

  it("converts a shop calendar day to UTC midnight-equivalent", () => {
    expect(startOfShopDayIso("2026-10-14")).toBe("2026-10-13T18:30:00.000Z");
  });
});
