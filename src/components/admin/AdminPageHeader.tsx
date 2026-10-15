import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 md:text-2xl">{title}</h1>
        {description ? <p className="mt-1 text-xs text-muted-foreground md:text-sm">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
