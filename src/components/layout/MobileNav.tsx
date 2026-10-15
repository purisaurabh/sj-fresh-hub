"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { MobileNavChrome } from "@/components/layout/MobileNavChrome";

function MobileNavWithPath(props: { unreadBadge?: ReactNode; showAlerts?: boolean }) {
  const pathname = usePathname();
  return <MobileNavChrome {...props} pathname={pathname} />;
}

export function MobileNav(props: { unreadBadge?: ReactNode; showAlerts?: boolean }) {
  return (
    <Suspense fallback={<MobileNavChrome {...props} />}>
      <MobileNavWithPath {...props} />
    </Suspense>
  );
}
