"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { AuthFormStatus } from "@/components/auth/AuthFormStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveBuilding } from "@/features/admin/actions";
import { buildingSchema, type BuildingInput } from "@/features/admin/schemas";
import { withActionOverlay } from "@/lib/ui/action-overlay";

type BuildingFormValues = z.input<typeof buildingSchema>;

export function BuildingForm({
  buildingId,
  defaultValues,
  onSaved,
  onCancel,
}: {
  buildingId?: string;
  defaultValues?: BuildingFormValues;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [error, setError] = useState<string>();
  const form = useForm<BuildingFormValues, unknown, BuildingInput>({
    resolver: zodResolver(buildingSchema),
    defaultValues: defaultValues ?? {
      name: "",
      address: "",
    },
  });

  async function onSubmit(values: BuildingInput) {
    setError(undefined);
    const result = await withActionOverlay(() => saveBuilding(values, buildingId));
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(result.message);
    if (onSaved) {
      onSaved();
    } else if (!buildingId) {
      form.reset({
        name: "",
        address: "",
      });
    }
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <AuthFormStatus error={error} />
      <div className="space-y-2">
        <Label htmlFor={`building-name-${buildingId ?? "new"}`} className="gap-1">
          Building name
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
          <span className="sr-only">required</span>
        </Label>
        <Input
          id={`building-name-${buildingId ?? "new"}`}
          className="h-11 text-base"
          {...form.register("name")}
        />
        {form.formState.errors.name?.message ? (
          <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Each building needs a unique name.</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`building-subtext-${buildingId ?? "new"}`}>Sub text</Label>
        <Input
          id={`building-subtext-${buildingId ?? "new"}`}
          className="h-11 text-base"
          placeholder="Area, street or short note"
          {...form.register("address")}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button className="h-11 bg-forest" disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting ? "Saving…" : buildingId ? "Save building" : "Add Building"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" className="h-11" disabled={form.formState.isSubmitting} onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
