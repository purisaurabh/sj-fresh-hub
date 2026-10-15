"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Pencil, Plus } from "lucide-react";
import { AddressDialog } from "@/components/profile/AddressDialog";
import type { SavedAddress } from "@/features/addresses/queries";
import type { ActiveBuilding } from "@/features/buildings/queries";

type SavedAddressesPanelProps = {
  buildings: ActiveBuilding[];
  addresses: SavedAddress[];
};

export function SavedAddressesPanel({ buildings, addresses }: SavedAddressesPanelProps) {
  const router = useRouter();
  const defaultAddressId = addresses.find((address) => address.is_default)?.id ?? addresses[0]?.id;
  const [open, setOpen] = useState<"add" | "edit" | null>(null);
  const [editingId, setEditingId] = useState(defaultAddressId);
  const editing = useMemo(
    () => addresses.find((address) => address.id === editingId) ?? addresses[0],
    [addresses, editingId],
  );

  function closeDialog() {
    setOpen(null);
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="font-semibold text-gray-900">Saved addresses</h2>
        <button
          type="button"
          className="inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-forest hover:underline"
          onClick={() => setOpen("add")}
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Add New Address
        </button>
      </div>

      <div className="mt-4">
        {addresses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-3 py-6 text-center">
            <p className="text-sm text-muted-foreground">No delivery addresses yet.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {addresses.map((address) => (
              <li key={address.id}>
                <div className="flex items-start gap-3 rounded-xl border border-border p-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-forest" aria-hidden="true" />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="flex items-center gap-2 font-medium text-gray-900">
                      {address.label ?? "Address"}
                      {address.is_default ? (
                        <span className="rounded-full bg-mint px-2 py-0.5 text-[10px] font-semibold text-forest uppercase">
                          Default
                        </span>
                      ) : null}
                    </p>
                    <p className="truncate text-gray-700">{address.line1}</p>
                    <p className="truncate text-xs text-muted-foreground">{address.building_name}</p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center gap-1 pt-0.5 text-sm font-semibold text-forest hover:underline"
                    onClick={() => {
                      setEditingId(address.id);
                      setOpen("edit");
                    }}
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                    Edit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddressDialog
        open={open !== null}
        mode={open === "edit" ? "edit" : "add"}
        address={open === "edit" ? editing : undefined}
        buildings={buildings}
        isFirstAddress={addresses.length === 0}
        onOpenChange={(next) => {
          if (!next) {
            setOpen(null);
          }
        }}
        onDone={closeDialog}
      />
    </section>
  );
}
