import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function OrdersPagination({
  page,
  total,
  pageSize,
  hrefForPage,
  scroll = false,
}: {
  page: number;
  total: number;
  pageSize: number;
  hrefForPage: (page: number) => string;
  scroll?: boolean;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) {
    return null;
  }

  const prev = page > 1 ? hrefForPage(page - 1) : null;
  const next = page < totalPages ? hrefForPage(page + 1) : null;

  return (
    <nav className="flex items-center justify-center gap-2 pt-1" aria-label="Order pages" data-local-navigation>
      {prev ? (
        <Link
          href={prev}
          scroll={scroll}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-white px-2.5 text-sm font-medium text-forest hover:bg-mint"
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
      {next ? (
        <Link
          href={next}
          scroll={scroll}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-white px-2.5 text-sm font-medium text-forest hover:bg-mint"
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
