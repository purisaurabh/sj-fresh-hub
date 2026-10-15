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
}: {
  children: ReactNode;
  skeleton: ReactNode;
  page: number;
  total: number;
  pageSize: number;
  prevHref: string | null;
  nextHref: string | null;
  scroll?: boolean;
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
    startTransition(() => {
      setVisiblePage(nextPage);
      router.push(href, { scroll });
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {pending ? skeleton : children}
      <OrdersPagination
        page={visiblePage}
        total={total}
        pageSize={pageSize}
        prevHref={prevHref}
        nextHref={nextHref}
        pending={pending}
        scroll={scroll}
        onNavigate={go}
      />
    </div>
  );
}
