"use client";

import type { ReactNode } from "react";
import { BrandLoader } from "@/components/feedback/BrandLoader";
import { useRouteTransition } from "@/lib/ui/route-transition";

export function PageSlot({ children }: { children: ReactNode }) {
  const pendingHref = useRouteTransition((state) => state.pendingHref);

  if (pendingHref) {
    return <BrandLoader />;
  }

  return children;
}
