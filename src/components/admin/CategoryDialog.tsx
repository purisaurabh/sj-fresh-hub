"use client";

import { useState } from "react";
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

export function CategoryDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full border-forest/30 px-3 text-sm text-forest hover:bg-mint sm:h-12 sm:w-auto sm:px-5"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">Add category</DialogTitle>
          <DialogDescription>Give it a name. Active categories appear in the shop and in the product form.</DialogDescription>
        </DialogHeader>
        <CategoryForm
          key={open ? "new" : "closed"}
          defaultValues={{ name: "", isActive: true }}
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
