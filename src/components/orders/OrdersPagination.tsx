"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function OrdersPagination({
  page,
  total,
  pageSize,
  prevHref,
  nextHref,
  pending = false,
  scroll = false,
  label = "Pages",
  onNavigate,
}: {
  page: number;
  total: number;
  pageSize: number;
  prevHref: string | null;
  nextHref: string | null;
  pending?: boolean;
  scroll?: boolean;
  label?: string;
  onNavigate?: (href: string) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) {
    return null;
  }

  function go(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (
      pending ||
      !onNavigate ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    onNavigate(href);
  }

  return (
    <nav className="flex items-center justify-center gap-2 pt-1" aria-label={label} data-local-navigation>
      {prevHref ? (
        <Link
          href={prevHref}
          scroll={scroll}
          onClick={(event) => go(event, prevHref)}
          aria-disabled={pending || undefined}
          tabIndex={pending ? -1 : undefined}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-white px-2.5 text-sm font-medium text-forest hover:bg-mint aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Prev
        </Link>
      ) : (
        <span className="inline-flex h-9 items-center gap-1 rounded-lg border border-transparent px-2.5 text-sm text-muted-foreground">
          <ChevronLeft className="size-4" aria-hidden="true" />
          Prev
        </span>
      )}
      <p className="min-w-24 text-center text-xs font-medium text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      {nextHref ? (
        <Link
          href={nextHref}
          scroll={scroll}
          onClick={(event) => go(event, nextHref)}
          aria-disabled={pending || undefined}
          tabIndex={pending ? -1 : undefined}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-white px-2.5 text-sm font-medium text-forest hover:bg-mint aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className="inline-flex h-9 items-center gap-1 rounded-lg border border-transparent px-2.5 text-sm text-muted-foreground">
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
