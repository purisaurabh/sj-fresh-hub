export type StorefrontProduct = {
  id: string;
  name: string;
  slug: string;
  categoryId: string | null;
  categoryName: string | null;
  imageUrl: string | null;
  unit: string;
  quantityStep: number;
  price: number;
  stockQuantity: number;
  status: string;
};
