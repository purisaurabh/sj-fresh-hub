import Link from "next/link";
import { Suspense } from "react";
import { CatalogSkeleton } from "@/components/shop/CatalogSkeleton";
import { EmptyState } from "@/components/shop/EmptyState";
import { HeroBanner } from "@/components/shop/HeroBanner";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShopCatalogFilters } from "@/components/shop/ShopCatalogFilters";
import { getPublicCatalog } from "@/features/products/queries";
import { getPublicSettings } from "@/features/settings/queries";
import { filterShopCatalog, parseShopCatalogFilter, shopCatalogHref } from "@/features/shop/catalog-filter";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import type { StorefrontProduct } from "@/features/products/types";

export const metadata = {
  title: "Shop",
  description: "Browse fresh vegetables and fruits for delivery to selected buildings.",
};

type ShopPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    stock?: string;
    price?: string;
    sort?: string;
  }>;
};

async function HomeHero() {
  const settings = await getPublicSettings();

  return (
    <HeroBanner
      shopName={settings.shop_name}
      isOpen={settings.is_open}
      shopPhone={settings.shop_phone}
    />
  );
}

function ProductGrid({
  products,
  lowStockThreshold,
}: {
  products: StorefrontProduct[];
  lowStockThreshold?: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} lowStockThreshold={lowStockThreshold} />
      ))}
    </div>
  );
}

async function CatalogFromSearch({
  searchParams,
}: {
  searchParams: ShopPageProps["searchParams"];
}) {
  const params = await searchParams;
  const filter = parseShopCatalogFilter(params);
  const catalog = await getPublicCatalog(filter.q);
  const threshold = catalog.settings?.low_stock_threshold ?? LOW_STOCK_THRESHOLD;
  const visible = filterShopCatalog(catalog.products, filter, threshold, catalog.categories);

  if (!catalog.configured) {
    return (
      <EmptyState
        title="Connect Supabase to load the catalogue"
        description="Copy .env.example to .env.local, add your project URL and anon key, then apply the SQL migrations. Seed data will appear here after that."
      />
    );
  }

  const resultsHeading = filter.q ? (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-gray-700">
        Showing matches for <span className="font-semibold text-gray-900">&ldquo;{filter.q}&rdquo;</span>
      </p>
      <Link
        href={shopCatalogHref({ ...filter, q: undefined })}
        className="inline-flex min-h-11 items-center text-sm font-semibold text-forest hover:underline"
      >
        Clear search
      </Link>
    </div>
  ) : null;

  return (
    <>
      {filter.q ? null : (
        <Suspense fallback={<HeroFallback />}>
          <HomeHero />
        </Suspense>
      )}
      <ShopCatalogFilters filter={filter} categories={catalog.categories} resultCount={visible.length}>
        {catalog.products.length === 0 ? (
          <div className="flex flex-col gap-3">
            {resultsHeading}
            <EmptyState
              title={filter.q ? `No products match “${filter.q}”` : "No products found"}
              description={
                filter.q
                  ? "Check the spelling or try a shorter word, like “tomato” or “apple”."
                  : "Check that products are active in the admin inventory."
              }
            />
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col gap-3">
            {resultsHeading}
            <EmptyState
              title="No products match these filters"
              description="Clear filters or try a different search."
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {resultsHeading}
            <ProductGrid products={visible} lowStockThreshold={threshold} />
          </div>
        )}
      </ShopCatalogFilters>
    </>
  );
}

function HeroFallback() {
  return <div className="h-48 animate-pulse rounded-xl bg-forest/80" aria-hidden="true" />;
}

export default function ShopPage({ searchParams }: ShopPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense
        fallback={
          <>
            <HeroFallback />
            <CatalogSkeleton />
          </>
        }
      >
        <CatalogFromSearch searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
