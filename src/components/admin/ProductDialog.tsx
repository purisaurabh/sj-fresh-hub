"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { AdminProductRow } from "@/features/admin/queries";

type CategoryOption = { id: string; name: string; is_active: boolean };

export function ProductDialog({
  product,
  categories,
  trigger,
}: {
  product?: AdminProductRow;
  categories: CategoryOption[];
  trigger?: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(product);
  const options = categories.filter((category) => category.is_active || category.id === product?.category_id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" className="h-10 bg-forest px-3 text-sm text-white hover:bg-forest/90 sm:h-12 sm:px-5">
            <Plus className="size-4" aria-hidden="true" />
            Add product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg" onOpenAutoFocus={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {isEdit ? `Edit ${product?.name}` : "Add product"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update price, stock or photo. Use Activate or Deactivate on the list to show it in the shop."
              : "Fill in the details and save. New products start active; you can deactivate them from the list."}
          </DialogDescription>
        </DialogHeader>
        {options.length === 0 ? (
          <p className="rounded-xl bg-amber-50 px-3 py-3 text-sm text-amber-900">
            Create an active category first, then add products.
          </p>
        ) : (
          <ProductForm
            key={open ? product?.id ?? "new" : "closed"}
            product={product}
            categories={options}
            onSaved={() => {
              setOpen(false);
              router.refresh();
            }}
            onCancel={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
