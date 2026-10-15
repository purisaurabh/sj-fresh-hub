"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { authInputClassName } from "@/components/auth/auth-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthPasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  autoComplete: string;
  onChange: (value: string) => void;
};

export function AuthPasswordField({ id, label, value, autoComplete, onChange }: AuthPasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          className={`${authInputClassName} pr-12`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex min-w-11 items-center justify-center rounded-r-lg text-muted-foreground hover:text-forest"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}
