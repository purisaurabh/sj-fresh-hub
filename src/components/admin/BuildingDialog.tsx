"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { BuildingForm } from "@/components/admin/BuildingForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type BuildingDialogBuilding = {
  id: string;
  name: string;
  address: string | null;
};

export function BuildingDialog({
  building,
  trigger,
}: {
  building?: BuildingDialogBuilding;
  trigger?: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(building);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" className="h-12 bg-forest px-5 text-white hover:bg-forest/90">
            <Plus className="size-4" aria-hidden="true" />
            Add Building
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit building" : "Add Building"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the name or sub text. Changes apply at registration and checkout."
              : "Add a society you deliver to. It will be active immediately."}
          </DialogDescription>
        </DialogHeader>
        <BuildingForm
          key={open ? building?.id ?? "new" : "closed"}
          buildingId={building?.id}
          defaultValues={{
            name: building?.name ?? "",
            address: building?.address ?? "",
          }}
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
