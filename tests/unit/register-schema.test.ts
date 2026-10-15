import { describe, expect, it } from "vitest";
import { assertActiveBuilding, loginSchema, registerSchema } from "@/features/auth/schemas";

const validInput = {
  fullName: "Asha Patil",
  phone: "9876543210",
  password: "password1",
  confirmPassword: "password1",
  buildingId: "11111111-1111-4111-8111-111111111111",
};

describe("registration schema", () => {
  it("accepts a complete customer payload", () => {
    const parsed = registerSchema.parse(validInput);
    expect(parsed.fullName).toBe("Asha Patil");
    expect(parsed.phone).toBe("9876543210");
    expect(parsed).not.toHaveProperty("role");
  });

  it("strips a client-supplied role instead of trusting it", () => {
    const parsed = registerSchema.parse({
      ...validInput,
      role: "admin",
    });
    expect(parsed).not.toHaveProperty("role");
  });

  it("rejects mismatched passwords", () => {
    expect(
      registerSchema.safeParse({
        ...validInput,
        confirmPassword: "different1",
      }).success,
    ).toBe(false);
  });

  it("rejects inactive or missing buildings", () => {
    expect(() =>
      assertActiveBuilding({ id: validInput.buildingId, is_active: false }, validInput.buildingId),
    ).toThrow(/active buildings/i);
    expect(() => assertActiveBuilding(null, validInput.buildingId)).toThrow(/active buildings/i);
  });

  it("accepts an active building", () => {
    const building = assertActiveBuilding(
      { id: validInput.buildingId, is_active: true },
      validInput.buildingId,
    );
    expect(building.is_active).toBe(true);
  });
});

describe("login schema", () => {
  it("accepts a mobile number and password", () => {
    expect(loginSchema.parse({ phone: "9876543210", password: "password1" }).phone).toBe("9876543210");
  });

  it("rejects a short mobile number", () => {
    expect(loginSchema.safeParse({ phone: "98765", password: "password1" }).success).toBe(false);
  });
});
