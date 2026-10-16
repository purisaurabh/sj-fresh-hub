"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { loginUser } from "@/features/auth/actions";
import { registerHref } from "@/lib/auth/next-path";
import { authInputClassName } from "@/components/auth/auth-field";
import { AuthFormStatus } from "@/components/auth/AuthFormStatus";
import { AuthPasswordField } from "@/components/auth/AuthPasswordField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { withActionOverlay } from "@/lib/ui/action-overlay";

export function LoginForm({ next }: { next?: string | null }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    const result = await withActionOverlay(() => loginUser({ phone, password, next }));
    setPending(false);
    if (!result.ok) {
      setError(result.error);
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-forest">WELCOME BACK</p>
        <h1 className="mt-1 text-lg font-semibold text-gray-900 md:mt-2 md:text-3xl">Log in</h1>
        <p className="mt-1 text-sm leading-snug text-muted-foreground md:mt-2 md:leading-relaxed">
          Use your 10-digit mobile number and password.
        </p>
      </div>
      <AuthFormStatus error={error} />
      <form className="space-y-3.5 md:space-y-5" onSubmit={onSubmit}>
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
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />
        <Button className="h-12 w-full text-base font-semibold" disabled={pending} type="submit">
          {pending ? "Logging in…" : "Log in"}
        </Button>
      </form>
      <p className="border-t border-border pt-4 text-center text-sm text-muted-foreground md:pt-5">
        New here?{" "}
        <Link href={registerHref(next)} className="font-semibold text-forest underline-offset-2 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
