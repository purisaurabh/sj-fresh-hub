"use client";

import { useState } from "react";
import { Building2, ChevronDown, Lock, UserRound } from "lucide-react";
import { toast } from "sonner";
import { profileUpdateSchema } from "@/features/auth/schemas";
import { updateProfile } from "@/features/profile/actions";
import type { ActiveBuilding } from "@/features/buildings/queries";
import { AuthFormStatus } from "@/components/auth/AuthFormStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { withActionOverlay } from "@/lib/ui/action-overlay";

type ProfileFormProps = {
  phone: string;
  defaultValues: {
    fullName: string;
    buildingId: string;
  };
  buildings: ActiveBuilding[];
};

const fieldIconClass = "pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground";

export function ProfileForm({ phone, defaultValues, buildings }: ProfileFormProps) {
  const [fullName, setFullName] = useState(defaultValues.fullName);
  const [buildingId, setBuildingId] = useState(defaultValues.buildingId);
  const [saved, setSaved] = useState(defaultValues);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const changed = fullName.trim() !== saved.fullName.trim() || buildingId !== saved.buildingId;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = profileUpdateSchema.safeParse({ fullName, buildingId });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the profile form.");
      return;
    }

    setPending(true);
    setError(undefined);
    const result = await withActionOverlay(() => updateProfile(parsed.data));
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved({ fullName: parsed.data.fullName, buildingId: parsed.data.buildingId });
    toast.success(result.message ?? "Profile updated");
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
      <AuthFormStatus error={error} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="fullName">Full name</Label>
        <div className="relative">
          <UserRound className={fieldIconClass} aria-hidden="true" />
          <Input
            id="fullName"
            autoComplete="name"
            className="h-12 bg-input pl-10 text-base md:text-base"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Mobile number</Label>
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-base text-muted-foreground">
            +91
          </span>
          <Input
            id="phone"
            value={phone}
            className="h-12 bg-muted/60 pr-10 pl-12 text-base md:text-base"
            disabled
          />
          <Lock className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="text-xs text-muted-foreground">This is your login number and can&apos;t be changed.</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="buildingId">Building</Label>
        <div className="relative">
          <Building2 className={fieldIconClass} aria-hidden="true" />
          <select
            id="buildingId"
            className="h-12 w-full appearance-none rounded-lg border border-input bg-input pr-10 pl-10 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={buildingId}
            onChange={(event) => setBuildingId(event.target.value)}
          >
            <option value="" disabled>
              Select your building
            </option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <Button className="h-12 bg-forest px-6 text-white hover:bg-forest/90" disabled={pending || !changed} type="submit">
          {pending ? "Saving…" : "Save changes"}
        </Button>
        {changed && !pending ? (
          <Button
            type="button"
            variant="ghost"
            className="h-12"
            onClick={() => {
              setFullName(saved.fullName);
              setBuildingId(saved.buildingId);
              setError(undefined);
            }}
          >
            Discard
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">{pending ? "" : "All changes saved"}</p>
        )}
      </div>
    </form>
  );
}
