"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type CategoryDialogCategory = {
  id: string;
  name: string;
};

export function CategoryDialog({
  category,
  trigger,
}: {
  category?: CategoryDialogCategory;
  trigger?: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(category);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" className="h-10 bg-forest px-3 text-sm text-white hover:bg-forest/90 sm:h-12 sm:px-5">
            <Plus className="size-4" aria-hidden="true" />
            Add category
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit category" : "Add category"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the name. Use Activate or Deactivate on the list to show it in the shop."
              : "Give it a name. New categories start active in the shop and product form."}
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          key={open ? category?.id ?? "new" : "closed"}
          categoryId={category?.id}
          defaultValues={{ name: category?.name ?? "" }}
          onSaved={() => {
            setOpen(false);
            router.refresh();
          }}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
