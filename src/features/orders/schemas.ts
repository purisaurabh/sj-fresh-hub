import { z } from "zod";

export const checkoutItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
});

export const checkoutSchema = z.object({
  addressId: z.string().uuid("Choose a delivery address"),
  items: z.array(checkoutItemSchema).min(1, "Your cart is empty"),
  customerNote: z.string().trim().max(200, "Keep the note under 200 characters").optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
