"use client";

import { useOptimistic, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { OrdersPagination } from "@/components/orders/OrdersPagination";

export function OrdersPagedList({
  children,
  skeleton,
  page,
  total,
  pageSize,
  prevHref,
  nextHref,
  scroll = false,
  label,
}: {
  children: ReactNode;
  skeleton: ReactNode;
  page: number;
  total: number;
  pageSize: number;
  prevHref: string | null;
  nextHref: string | null;
  scroll?: boolean;
  label?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [visiblePage, setVisiblePage] = useOptimistic(page);

  function go(href: string) {
    if (pending) {
      return;
    }
    const parsed = Number.parseInt(new URL(href, "https://sj.local").searchParams.get("page") || "1", 10);
    const nextPage = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    const scrollToTop = scroll || window.matchMedia("(max-width: 767px)").matches;
    startTransition(() => {
      setVisiblePage(nextPage);
      router.push(href, { scroll: scrollToTop });
    });
    if (scrollToTop) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }

  const start = total === 0 ? 0 : (visiblePage - 1) * pageSize + 1;
  const end = Math.min(visiblePage * pageSize, total);

  return (
    <div className="flex flex-col gap-3">
      {pending ? skeleton : children}
      {total > 0 ? (
        <p className="text-center text-xs text-muted-foreground">
          Showing {start}–{end} of {total}
        </p>
      ) : null}
      <OrdersPagination
        page={visiblePage}
        total={total}
        pageSize={pageSize}
        prevHref={prevHref}
        nextHref={nextHref}
        pending={pending}
        scroll={scroll}
        label={label}
        onNavigate={go}
      />
    </div>
  );
}
