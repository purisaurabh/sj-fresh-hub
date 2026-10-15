"use client";

import { BrandLoader } from "@/components/feedback/BrandLoader";
import { useActionOverlay } from "@/lib/ui/action-overlay";

export function AppLoader() {
  const visible = useActionOverlay((state) => state.visible);

  if (!visible) {
    return null;
  }

  return <BrandLoader variant="overlay" />;
}
