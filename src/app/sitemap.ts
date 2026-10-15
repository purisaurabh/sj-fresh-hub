import type { MetadataRoute } from "next";
import { getPublicCatalog } from "@/features/products/queries";
import { getSiteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl().replace(/\/$/, "");
  const entries: MetadataRoute.Sitemap = [
    { url: site, changeFrequency: "daily", priority: 1 },
    { url: `${site}/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${site}/register`, changeFrequency: "monthly", priority: 0.4 },
  ];

  try {
    const catalog = await getPublicCatalog();
    for (const product of catalog.products) {
      entries.push({
        url: `${site}/product/${product.slug}`,
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
  } catch {
    // Public catalog is optional while the shop is still being configured.
  }

  return entries;
}
