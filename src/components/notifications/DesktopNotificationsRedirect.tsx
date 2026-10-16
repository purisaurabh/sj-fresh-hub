"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BrandLoader } from "@/components/feedback/BrandLoader";

export function DesktopNotificationsRedirect({ href }: { href: string }) {
  const router = useRouter();

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    function sync() {
      if (media.matches) {
        router.replace(href);
      }
    }
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [href, router]);

  return (
    <div className="hidden md:block">
      <BrandLoader />
    </div>
  );
}
