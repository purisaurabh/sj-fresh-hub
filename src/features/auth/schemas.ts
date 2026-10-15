import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{10}$/, "Enter a 10-digit mobile number");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long");

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(80),
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    buildingId: z.string().uuid("Select a valid building"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, "Enter your password"),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  buildingId: z.string().uuid("Select a valid building"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export function assertActiveBuilding<T extends { id: string; is_active: boolean }>(
  building: T | null,
  selectedId: string,
): T {
  if (!building || building.id !== selectedId || !building.is_active) {
    throw new Error("Registration is limited to active buildings.");
  }

  return building;
}
