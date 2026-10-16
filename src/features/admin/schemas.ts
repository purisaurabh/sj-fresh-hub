import { z } from "zod";
import { ORDER_STATUSES } from "@/lib/constants";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Enter a product name").max(80),
  categoryId: z.string().uuid("Select a category"),
  description: z.string().trim().max(400).optional(),
  unit: z.string().trim().min(1, "Enter a unit").max(20),
  quantityStep: z.coerce.number().finite().gt(0, "Quantity step cannot be zero"),
  price: z.coerce.number().finite().min(0, "Price cannot be negative"),
  stockQuantity: z.coerce.number().finite().min(0, "Stock cannot be negative"),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Enter a category name").max(40),
});

export const buildingSchema = z.object({
  name: z.string().trim().min(2, "Enter a building name").max(80),
  address: z.string().trim().max(160).optional(),
});

export const orderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(ORDER_STATUSES),
  note: z.string().trim().max(200).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type BuildingInput = z.infer<typeof buildingSchema>;
