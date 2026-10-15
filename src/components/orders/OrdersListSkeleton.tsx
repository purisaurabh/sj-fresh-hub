import { Skeleton } from "@/components/ui/skeleton";

export function CustomerOrdersSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading orders</span>
      {Array.from({ length: count }).map((_, index) => (
        <li key={index} className="rounded-2xl border border-border bg-white p-4 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <Skeleton className="size-11 shrink-0 rounded-xl sm:size-12" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="mt-2 h-3 w-28" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-3 w-2/3" />
            </div>
          </div>
          <div className="mt-4 flex gap-1.5">
            {Array.from({ length: 5 }).map((__, bar) => (
              <Skeleton key={bar} className="h-1.5 flex-1 rounded-full" />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-dashed border-border pt-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AdminOrdersSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid gap-2 lg:grid-cols-2" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading orders</span>
      {Array.from({ length: count }).map((_, index) => (
        <li key={index} className="rounded-xl border border-border bg-white p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-3 h-4 w-40" />
          <Skeleton className="mt-2 h-3 w-32" />
          <div className="mt-3 flex items-center justify-between border-t border-dashed border-border pt-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </li>
      ))}
    </ul>
  );
}
