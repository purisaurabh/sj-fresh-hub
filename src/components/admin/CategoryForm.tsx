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
import { saveCategory } from "@/features/admin/actions";
import { categorySchema, type CategoryInput } from "@/features/admin/schemas";
import { withActionOverlay } from "@/lib/ui/action-overlay";

type CategoryFormValues = z.input<typeof categorySchema>;

export function CategoryForm({
  categoryId,
  defaultValues,
  onSaved,
  onCancel,
}: {
  categoryId?: string;
  defaultValues?: CategoryFormValues;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [error, setError] = useState<string>();
  const form = useForm<CategoryFormValues, unknown, CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: defaultValues ?? { name: "", isActive: true },
  });

  async function onSubmit(values: CategoryInput) {
    setError(undefined);
    const result = await withActionOverlay(() => saveCategory(values, categoryId));
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(result.message);
    if (onSaved) {
      onSaved();
    } else if (!categoryId) {
      form.reset({ name: "", isActive: true });
    }
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <AuthFormStatus error={error} />
      <div className="space-y-2">
        <Label htmlFor={`name-${categoryId ?? "new"}`}>Name</Label>
        <Input id={`name-${categoryId ?? "new"}`} className="h-12 text-base" {...form.register("name")} />
        <p className="text-xs text-destructive">{form.formState.errors.name?.message}</p>
      </div>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" {...form.register("isActive")} />
        Active (shown in the shop)
      </label>
      <div className="flex flex-wrap gap-2">
        <Button className="h-12 bg-forest" disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting ? "Saving…" : categoryId ? "Save category" : "Add category"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" className="h-12" disabled={form.formState.isSubmitting} onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
