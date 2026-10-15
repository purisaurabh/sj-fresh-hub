import { describe, expect, it } from "vitest";
import { addressSchema } from "@/features/addresses/schemas";

describe("address schema", () => {
  it("accepts a complete address", () => {
    const parsed = addressSchema.parse({
      label: "Home",
      line1: "Flat 12, Green Valley",
      buildingId: "11111111-1111-4111-8111-111111111111",
      landmark: "Near park",
      pincode: "411001",
    });

    expect(parsed.line1).toContain("Green Valley");
    expect(parsed.pincode).toBe("411001");
  });

  it("accepts an address with empty optional fields", () => {
    const parsed = addressSchema.parse({
      line1: "Flat 12, Green Valley",
      buildingId: "11111111-1111-4111-8111-111111111111",
      label: "",
      landmark: "",
      pincode: "",
    });
    expect(parsed.label).toBeUndefined();
    expect(parsed.landmark).toBeUndefined();
    expect(parsed.pincode).toBeUndefined();
  });

  it("accepts an address when optional fields are omitted", () => {
    const parsed = addressSchema.parse({
      line1: "Flat 12, Green Valley",
      buildingId: "11111111-1111-4111-8111-111111111111",
    });
    expect(parsed.line1).toContain("Green Valley");
  });

  it("re-parses client output when optional fields are undefined", () => {
    const first = addressSchema.parse({
      line1: "Flat 12, Green Valley",
      buildingId: "11111111-1111-4111-8111-111111111111",
      label: "",
      landmark: "",
      pincode: "",
    });
    const second = addressSchema.safeParse(first);
    expect(second.success).toBe(true);
  });

  it("rejects an inactive-style empty building id", () => {
    const parsed = addressSchema.safeParse({
      line1: "Flat 12",
      buildingId: "not-a-uuid",
    });
    expect(parsed.success).toBe(false);
  });
});
