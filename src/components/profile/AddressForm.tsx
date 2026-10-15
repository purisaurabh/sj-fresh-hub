"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { addressSchema, type AddressInput } from "@/features/addresses/schemas";
import { createAddress, updateAddress } from "@/features/addresses/actions";
import type { ActiveBuilding } from "@/features/buildings/queries";
import { AuthFormStatus } from "@/components/auth/AuthFormStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { withActionOverlay } from "@/lib/ui/action-overlay";

type AddressFormValues = z.input<typeof addressSchema>;

function FieldLabel({
  htmlFor,
  children,
  required = false,
}: {
  htmlFor: string;
  children: string;
  required?: boolean;
}) {
  return (
    <Label htmlFor={htmlFor} className="gap-1">
      {children}
      {required ? (
        <>
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
          <span className="sr-only">required</span>
        </>
      ) : null}
    </Label>
  );
}

type AddressFormProps = {
  buildings: ActiveBuilding[];
  addressId?: string;
  defaultValues?: AddressFormValues;
  onDone?: () => void;
};

export function AddressForm({ buildings, addressId, defaultValues, onDone }: AddressFormProps) {
  const fieldId = useId();
  const [error, setError] = useState<string>();
  const form = useForm<AddressFormValues, unknown, AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: defaultValues ?? {
      label: "",
      line1: "",
      buildingId: "",
      landmark: "",
      pincode: "",
      isDefault: false,
    },
  });

  async function onSubmit(values: AddressInput) {
    setError(undefined);
    const result = await withActionOverlay(() =>
      addressId ? updateAddress(addressId, values) : createAddress(values),
    );
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(result.message);
    form.reset(values);
    onDone?.();
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <AuthFormStatus error={error} />
      <div className="space-y-2">
        <FieldLabel htmlFor={`${fieldId}-label`}>Label</FieldLabel>
        <Input id={`${fieldId}-label`} placeholder="Home" className="h-12 text-base" {...form.register("label")} />
      </div>
      <div className="space-y-2">
        <FieldLabel htmlFor={`${fieldId}-line1`} required>
          Address
        </FieldLabel>
        <Input id={`${fieldId}-line1`} className="h-12 text-base" {...form.register("line1")} />
        <p className="text-xs text-destructive">{form.formState.errors.line1?.message}</p>
      </div>
      <div className="space-y-2">
        <FieldLabel htmlFor={`${fieldId}-buildingId`} required>
          Building
        </FieldLabel>
        <select
          id={`${fieldId}-buildingId`}
          className="h-12 w-full rounded-lg border border-input bg-input px-3 text-base"
          {...form.register("buildingId")}
        >
          <option value="">Select a building</option>
          {buildings.map((building) => (
            <option key={building.id} value={building.id}>
              {building.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-destructive">{form.formState.errors.buildingId?.message}</p>
      </div>
      <div className="space-y-2">
        <FieldLabel htmlFor={`${fieldId}-landmark`}>Landmark</FieldLabel>
        <Input id={`${fieldId}-landmark`} className="h-12 text-base" {...form.register("landmark")} />
      </div>
      <div className="space-y-2">
        <FieldLabel htmlFor={`${fieldId}-pincode`}>Pincode</FieldLabel>
        <Input id={`${fieldId}-pincode`} inputMode="numeric" className="h-12 text-base" {...form.register("pincode")} />
        <p className="text-xs text-destructive">{form.formState.errors.pincode?.message}</p>
      </div>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" {...form.register("isDefault")} />
        Default delivery address
      </label>
      <p className="text-xs text-muted-foreground">
        If you skip coordinates, we use the selected building location.
      </p>
      <Button className="h-12 w-full bg-forest sm:w-auto" disabled={form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? "Saving…" : addressId ? "Update address" : "Save address"}
      </Button>
    </form>
  );
}
