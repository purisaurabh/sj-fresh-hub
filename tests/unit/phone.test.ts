import { describe, expect, it } from "vitest";
import { normalizePhone, toE164India, toInternalEmail } from "@/lib/auth/phone";

describe("phone helpers", () => {
  it("normalizes to the last 10 digits", () => {
    expect(normalizePhone("+91 98765-43210")).toBe("9876543210");
  });

  it("builds an internal auth email that is never shown in the UI", () => {
    expect(toInternalEmail("9876543210")).toBe("919876543210@users.sjfreshhub.invalid");
    expect(toE164India("9876543210")).toBe("+919876543210");
  });
});
