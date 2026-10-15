import Link from "next/link";
import { Suspense } from "react";
import { CatalogSkeleton } from "@/components/shop/CatalogSkeleton";
import { EmptyState } from "@/components/shop/EmptyState";
import { HeroBanner } from "@/components/shop/HeroBanner";
import { ProductCard } from "@/components/shop/ProductCard";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { getPublicCatalog } from "@/features/products/queries";
import { getPublicSettings } from "@/features/settings/queries";

export const metadata = {
  title: "Shop",
  description: "Browse fresh vegetables and fruits for delivery to selected buildings.",
};

type ShopPageProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
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

async function Catalog({ query, category }: { query?: string; category?: string }) {
  const catalog = await getPublicCatalog(query, category);

  if (!catalog.configured) {
    return (
      <EmptyState
        title="Connect Supabase to load the catalogue"
        description="Copy .env.example to .env.local, add your project URL and anon key, then apply the SQL migrations. Seed data will appear here after that."
      />
    );
  }

  const resultsHeading = query ? (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-gray-700">
        {catalog.products.length} {catalog.products.length === 1 ? "result" : "results"} for{" "}
        <span className="font-semibold text-gray-900">&ldquo;{query}&rdquo;</span>
      </p>
      <Link href="/" className="inline-flex min-h-11 items-center text-sm font-semibold text-forest hover:underline">
        Clear search
      </Link>
    </div>
  ) : null;

  if (catalog.products.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        {resultsHeading}
        <EmptyState
          title={query ? `No products match “${query}”` : "No products found"}
          description={
            query
              ? "Check the spelling or try a shorter word, like “tomato” or “apple”."
              : "Try a different category, or check that products are active in the admin inventory."
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {resultsHeading}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {catalog.products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            lowStockThreshold={catalog.settings?.low_stock_threshold}
          />
        ))}
      </div>
    </div>
  );
}

async function CatalogFromSearch({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim().replace(/\s+/g, " ") || undefined;
  const category = query ? undefined : params.category?.trim() || undefined;
  const { categories } = await getPublicCatalog();

  return (
    <>
      {query ? null : (
        <Suspense fallback={<HeroFallback />}>
          <HomeHero />
        </Suspense>
      )}
      <CategoryFilter categories={categories} selected={category}>
        <Catalog query={query} category={category} />
      </CategoryFilter>
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
