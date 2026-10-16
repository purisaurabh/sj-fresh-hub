"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { AuthFormStatus } from "@/components/auth/AuthFormStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveProduct } from "@/features/admin/actions";
import { productSchema } from "@/features/admin/schemas";
import type { AdminProductRow } from "@/features/admin/queries";
import { MAX_PRODUCT_IMAGE_BYTES } from "@/lib/constants";
import { withActionOverlay } from "@/lib/ui/action-overlay";

type CategoryOption = { id: string; name: string };

function blockMinus(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === "-" || event.key === "−" || event.key === "e" || event.key === "E") {
    event.preventDefault();
  }
}

function clampNonNegative(event: FormEvent<HTMLInputElement>) {
  const input = event.currentTarget;
  if (input.value === "") {
    return;
  }
  const value = input.valueAsNumber;
  if (!Number.isFinite(value) || value < 0) {
    input.value = "0";
  }
}

function clampPositiveStep(event: FormEvent<HTMLInputElement>) {
  const input = event.currentTarget;
  if (input.value === "") {
    return;
  }
  const value = input.valueAsNumber;
  if (!Number.isFinite(value) || value <= 0) {
    input.value = "";
  }
}

export function ProductForm({
  product,
  categories,
  onSaved,
  onCancel,
}: {
  product?: AdminProductRow;
  categories: CategoryOption[];
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const parsed = productSchema.safeParse({
      name: formData.get("name"),
      categoryId: formData.get("categoryId"),
      description: formData.get("description") ?? "",
      unit: formData.get("unit"),
      quantityStep: formData.get("quantityStep"),
      price: formData.get("price"),
      stockQuantity: formData.get("stockQuantity"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the product form.");
      return;
    }
    const file = formData.get("image");
    if (file instanceof File && file.size > MAX_PRODUCT_IMAGE_BYTES) {
      setError("Keep the product image under 200 KB.");
      return;
    }
    setPending(true);
    setError(undefined);
    const result = await withActionOverlay(() => saveProduct(formData));
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(result.message);
    onSaved?.();
  }

  return (
    <form className="space-y-4" onSubmit={(event) => void onSubmit(event)} noValidate>
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <AuthFormStatus error={error} />
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required defaultValue={product?.name ?? ""} className="h-12 text-base" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue={product?.category_id ?? ""}
          className="h-12 w-full rounded-lg border border-input bg-input px-3 text-base"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={product?.description ?? ""}
          className="min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Input id="unit" name="unit" required defaultValue={product?.unit ?? "kg"} className="h-12 text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantityStep">Quantity step</Label>
          <Input
            id="quantityStep"
            name="quantityStep"
            type="number"
            inputMode="decimal"
            step="any"
            min="0.001"
            required
            defaultValue={product?.quantity_step ?? 1}
            className="h-12 text-base"
            onKeyDown={blockMinus}
            onInput={clampPositiveStep}
          />
          <p className="text-xs text-muted-foreground">Must be greater than 0. Customers add this amount each tap.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            required
            defaultValue={product?.price ?? ""}
            className="h-12 text-base"
            onKeyDown={blockMinus}
            onInput={clampNonNegative}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stockQuantity">Stock</Label>
          <Input
            id="stockQuantity"
            name="stockQuantity"
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            required
            defaultValue={product?.stock_quantity ?? 0}
            className="h-12 text-base"
            onKeyDown={blockMinus}
            onInput={clampNonNegative}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="image">Image (optional, max 200 KB)</Label>
        <Input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="h-12" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button className="h-12 w-full bg-forest sm:w-auto" disabled={pending} type="submit">
          {pending ? "Saving…" : product ? "Save product" : "Add product"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" className="h-12 w-full sm:w-auto" disabled={pending} onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
