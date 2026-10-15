"use client";

import type { ReactNode } from "react";
import { PageSlot } from "@/components/feedback/PageSlot";

export function ShopShell({ children }: { children: ReactNode }) {
  return <PageSlot>{children}</PageSlot>;
}
