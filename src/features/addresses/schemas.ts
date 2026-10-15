import { z } from "zod";

function optionalText(max: number, message?: string) {
  return z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }
      return typeof value === "string" ? value.trim() : value;
    },
    z.string().max(max, message).optional(),
  );
}

export const addressSchema = z.object({
  label: optionalText(40),
  line1: z.preprocess(
    (value) => (value === null || value === undefined ? "" : value),
    z.string().trim().min(3, "Enter your delivery address").max(160),
  ),
  buildingId: z.string().uuid("Select a building"),
  landmark: optionalText(80),
  pincode: z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }
    return typeof value === "string" ? value.trim() : value;
  }, z.string().regex(/^[0-9]{6}$/, "Enter a 6-digit pincode").optional()),
  latitude: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().min(-90).max(90).optional(),
  ),
  longitude: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().min(-180).max(180).optional(),
  ),
  isDefault: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
