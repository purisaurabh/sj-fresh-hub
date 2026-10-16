"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pathFromHref, useRouteTransition } from "@/lib/ui/route-transition";

const OVERLAY_TIMEOUT_MS = 8000;

function RouteProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pendingHref = useRouteTransition((state) => state.pendingHref);
  const originHref = useRouteTransition((state) => state.originHref);
  const start = useRouteTransition((state) => state.start);
  const clear = useRouteTransition((state) => state.clear);
  const current = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  useEffect(() => {
    if (!pendingHref) {
      return;
    }
    const pendingPath = pendingHref.split("?")[0] ?? pendingHref;
    if (pathname === pendingPath || (originHref !== null && current !== originHref)) {
      clear();
    }
  }, [clear, current, originHref, pathname, pendingHref]);

  useEffect(() => {
    if (!pendingHref) {
      return;
    }
    const timer = window.setTimeout(() => clear(), OVERLAY_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [clear, pendingHref]);

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

      start(next, here);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [start]);

  return null;
}

export function RouteProgress() {
  return (
    <Suspense fallback={null}>
      <RouteProgressInner />
    </Suspense>
  );
}
