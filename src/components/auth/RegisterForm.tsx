"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { registerUser } from "@/features/auth/actions";
import type { ActiveBuilding } from "@/features/buildings/queries";
import { authInputClassName } from "@/components/auth/auth-field";
import { AuthFormStatus } from "@/components/auth/AuthFormStatus";
import { AuthPasswordField } from "@/components/auth/AuthPasswordField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { withActionOverlay } from "@/lib/ui/action-overlay";

type RegisterFormProps = {
  buildings: ActiveBuilding[];
};

export function RegisterForm({ buildings }: RegisterFormProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [buildingId, setBuildingId] = useState("");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    const result = await withActionOverlay(() =>
      registerUser({ fullName, phone, password, confirmPassword, buildingId }),
    );
    setPending(false);
    if (!result.ok) {
      setError(result.error);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-forest">JOIN SJ FRESH HUB</p>
        <h1 className="mt-2 text-lg font-semibold text-gray-900 md:text-3xl">Create your account</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          We currently deliver only to selected buildings. Sign up with your mobile number and a password.
        </p>
      </div>
      <AuthFormStatus error={error} />
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            autoComplete="name"
            className={authInputClassName}
            placeholder="Your name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Mobile number</Label>
          <Input
            id="phone"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            className={authInputClassName}
            placeholder="10-digit number"
            value={phone}
            onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
          />
        </div>
        <AuthPasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
        />
        <AuthPasswordField
          id="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
        <div className="space-y-2">
          <Label htmlFor="buildingId">Building</Label>
          <div className="relative">
            <select
              id="buildingId"
              className={`h-12 w-full appearance-none rounded-lg border border-input bg-input py-1 pr-10 pl-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ${
                buildingId ? "" : "text-muted-foreground"
              }`}
              value={buildingId}
              onChange={(event) => setBuildingId(event.target.value)}
            >
              <option value="" disabled>
                Select your building
              </option>
              {buildings.map((building) => (
                <option key={building.id} value={building.id} className="text-foreground">
                  {building.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="text-xs text-muted-foreground">New orders are accepted only for active buildings.</p>
        </div>
        <Button className="mt-1 h-12 w-full text-base font-semibold" disabled={pending} type="submit">
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="border-t border-border pt-5 text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-forest underline-offset-2 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
