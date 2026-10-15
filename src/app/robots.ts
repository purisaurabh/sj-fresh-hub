import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl().replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/checkout", "/profile", "/orders", "/addresses", "/notifications", "/cart"],
    },
    sitemap: `${site}/sitemap.xml`,
  };
}
