"use client";

import { AddressForm } from "@/components/profile/AddressForm";
import { DeleteAddressButton } from "@/components/profile/DeleteAddressButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SavedAddress } from "@/features/addresses/queries";
import type { ActiveBuilding } from "@/features/buildings/queries";

export function addressFormValues(address: SavedAddress, fallbackBuildingId: string) {
  return {
    label: address.label ?? "",
    line1: address.line1,
    buildingId: address.building_id ?? fallbackBuildingId,
    landmark: address.landmark ?? "",
    pincode: address.pincode ?? "",
    latitude: address.latitude ?? undefined,
    longitude: address.longitude ?? undefined,
    isDefault: address.is_default,
  };
}

export function AddressDialog({
  open,
  mode,
  address,
  buildings,
  defaultBuildingId,
  isFirstAddress = false,
  showDelete = true,
  onOpenChange,
  onDone,
}: {
  open: boolean;
  mode: "add" | "edit";
  address?: SavedAddress;
  buildings: ActiveBuilding[];
  defaultBuildingId?: string;
  isFirstAddress?: boolean;
  showDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}) {
  const fallbackBuildingId = defaultBuildingId ?? buildings[0]?.id ?? "";
  const isEdit = mode === "edit" && Boolean(address);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg" onOpenAutoFocus={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Address" : "Add New Address"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this delivery address. Changes apply to your next order."
              : "Save a delivery address for checkout. Address and Building are required."}
          </DialogDescription>
        </DialogHeader>

        {buildings.length === 0 ? (
          <p className="rounded-xl bg-amber-50 px-3 py-3 text-sm text-amber-900">
            Addresses can be added after the shop publishes active buildings.
          </p>
        ) : isEdit && address ? (
          <div className="space-y-4">
            <AddressForm
              key={address.id}
              addressId={address.id}
              buildings={buildings}
              defaultValues={addressFormValues(address, fallbackBuildingId)}
              onDone={onDone}
            />
            {showDelete ? (
              <div className="flex justify-end border-t border-border pt-2">
                <DeleteAddressButton addressId={address.id} onDeleted={onDone} />
              </div>
            ) : null}
          </div>
        ) : (
          <AddressForm
            key="new-address"
            buildings={buildings}
            defaultValues={{
              label: "Home",
              line1: "",
              buildingId: "",
              landmark: "",
              pincode: "",
              isDefault: isFirstAddress,
            }}
            onDone={onDone}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
