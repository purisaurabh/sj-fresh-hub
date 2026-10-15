"use client";

import { Suspense, useEffect, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { pathFromHref, useRouteTransition } from "@/lib/ui/route-transition";

function RouteProgressInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const pendingHref = useRouteTransition((state) => state.pendingHref);
  const start = useRouteTransition((state) => state.start);
  const clear = useRouteTransition((state) => state.clear);
  const current = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  useEffect(() => {
    if (!pendingHref || isPending) {
      return;
    }
    if (pendingHref === current) {
      clear();
    }
  }, [clear, current, isPending, pendingHref]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest("a");
      if (
        !anchor?.href ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.closest("[data-local-navigation]")
      ) {
        return;
      }

      const rawHref = anchor.getAttribute("href") ?? "";
      if (rawHref.startsWith("tel:") || rawHref.startsWith("mailto:") || rawHref.startsWith("#")) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) {
        return;
      }

      const next = pathFromHref(url.href, window.location.origin);
      const here = `${window.location.pathname}${window.location.search}`;
      if (next === here) {
        return;
      }

      event.preventDefault();
      start(next);
      startTransition(() => {
        router.push(next);
      });
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router, start]);

  return null;
}

export function RouteProgress() {
  return (
    <Suspense fallback={null}>
      <RouteProgressInner />
    </Suspense>
  );
}
