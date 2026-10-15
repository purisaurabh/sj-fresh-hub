import { describe, expect, it } from "vitest";
import { shouldShowPushPrompt } from "@/lib/ui/shop-hours";

describe("first-visit push prompt", () => {
  it("asks only when the browser has not decided yet", () => {
    expect(shouldShowPushPrompt("default")).toBe(true);
    expect(shouldShowPushPrompt("granted")).toBe(false);
    expect(shouldShowPushPrompt("denied")).toBe(false);
    expect(shouldShowPushPrompt("unsupported")).toBe(false);
  });

  it("does not ask again after the visitor has answered", () => {
    expect(shouldShowPushPrompt("default", true)).toBe(false);
  });
});
