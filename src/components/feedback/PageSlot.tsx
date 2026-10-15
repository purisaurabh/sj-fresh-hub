"use client";

import type { ReactNode } from "react";
import { BrandLoader } from "@/components/feedback/BrandLoader";
import { useRouteTransition } from "@/lib/ui/route-transition";

function RoutePendingOverlay() {
  const pendingHref = useRouteTransition((state) => state.pendingHref);
  if (!pendingHref) {
    return null;
  }

  return <BrandLoader variant="overlay" />;
}

export function PageSlot({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <RoutePendingOverlay />
    </>
  );
}
