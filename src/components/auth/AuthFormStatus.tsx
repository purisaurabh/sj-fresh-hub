"use client";

type AuthFormStatusProps = {
  error?: string;
  message?: string;
};

export function AuthFormStatus({ error, message }: AuthFormStatusProps) {
  if (error) {
    return (
      <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (message) {
    return (
      <p className="rounded-lg bg-mint px-3 py-2 text-sm text-forest" role="status">
        {message}
      </p>
    );
  }

  return null;
}
