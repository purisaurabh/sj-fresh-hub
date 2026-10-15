import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { CatalogSkeleton } from "@/components/shop/CatalogSkeleton";
import { Badge } from "@/components/ui/badge";
import { getPublicCatalog } from "@/features/products/queries";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { formatPriceWithUnit } from "@/lib/money";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getPublicCatalog();
  const product = catalog.products.find((item) => item.slug === slug);
  if (!product) {
    return { title: "Product" };
  }
  return {
    title: product.name,
    description: product.categoryName
      ? `${product.name} (${product.categoryName}) for delivery to selected buildings.`
      : `${product.name} for delivery to selected buildings.`,
  };
}

async function ProductDetail({ params }: ProductPageProps) {
  const { slug } = await params;
  const catalog = await getPublicCatalog();
  const product = catalog.products.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  const threshold = catalog.settings?.low_stock_threshold ?? LOW_STOCK_THRESHOLD;
  const soldOut = product.stockQuantity <= 0 || product.status !== "active";
  const lowStock = !soldOut && product.stockQuantity <= threshold;

  return (
    <article className="grid gap-6 md:grid-cols-2 md:items-start lg:gap-10">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-border bg-mint text-5xl font-semibold text-forest md:aspect-[4/3]">
        {product.imageUrl ? (
          // Catalog images are added in admin inventory; keep a lightweight fallback until then.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="size-full object-cover" />
        ) : (
          <span aria-hidden="true">{product.name.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      <div className="flex flex-col gap-4">
        {product.categoryName ? (
          <p className="text-sm font-medium text-muted-foreground">{product.categoryName}</p>
        ) : null}
        <h1 className="text-lg font-semibold md:text-4xl">{product.name}</h1>
        <p className="text-base font-semibold text-forest md:text-xl">{formatPriceWithUnit(product.price, product.unit)}</p>
        <div>
          {soldOut ? (
            <Badge variant="destructive">Out of stock</Badge>
          ) : lowStock ? (
            <Badge className="bg-amber-status text-white">Only {product.stockQuantity} left</Badge>
          ) : (
            <Badge className="bg-mint text-forest">In stock</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Fresh produce from SJ Fresh Hub. Payment is Cash on Delivery.
        </p>
        <div className="max-w-sm">
          <AddToCartButton
            disabled={soldOut}
            item={{
              productId: product.id,
              name: product.name,
              slug: product.slug,
              unit: product.unit,
              unitPrice: product.price,
              quantityStep: product.quantityStep,
              imageUrl: product.imageUrl,
              stockQuantity: product.stockQuantity,
            }}
          />
        </div>
      </div>
    </article>
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <ProductDetail params={params} />
    </Suspense>
  );
}
