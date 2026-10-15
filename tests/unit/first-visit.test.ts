import { describe, expect, it } from "vitest";
import { shouldShowPushPrompt } from "@/lib/ui/shop-hours";

describe("logged-in push prompt", () => {
  it("never asks before login", () => {
    expect(shouldShowPushPrompt("default", false)).toBe(false);
    expect(shouldShowPushPrompt("denied", false)).toBe(false);
    expect(shouldShowPushPrompt("granted", false)).toBe(false);
  });

  it("asks after login until the browser has allowed notifications", () => {
    expect(shouldShowPushPrompt("default", true)).toBe(true);
    expect(shouldShowPushPrompt("denied", true)).toBe(true);
    expect(shouldShowPushPrompt("granted", true)).toBe(false);
    expect(shouldShowPushPrompt("unsupported", true)).toBe(false);
  });
});
