import type { ReactNode } from "react";

export function PromptDialog({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-200 flex items-end justify-center bg-black/60 p-4 pt-[max(1.5rem,env(safe-area-inset-top))] sm:items-center"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="prompt-dialog-title"
        className="mb-[max(1rem,env(safe-area-inset-bottom))] w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:mb-0"
      >
        <h2 id="prompt-dialog-title" className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
        <div className="mt-3">{children}</div>
        <div className="mt-4 flex flex-col gap-2">{footer}</div>
      </div>
    </div>
  );
}
