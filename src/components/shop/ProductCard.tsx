import Link from "next/link";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { Badge } from "@/components/ui/badge";
import { formatPriceWithUnit } from "@/lib/money";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import type { StorefrontProduct } from "@/features/products/types";

type ProductCardProps = {
  product: StorefrontProduct;
  lowStockThreshold?: number;
};

export function ProductCard({
  product,
  lowStockThreshold = LOW_STOCK_THRESHOLD,
}: ProductCardProps) {
  const soldOut = product.stockQuantity <= 0 || product.status !== "active";
  const lowStock = !soldOut && product.stockQuantity <= lowStockThreshold;

  return (
    <article className={`rounded-xl border border-border bg-white p-3 shadow-sm ${soldOut ? "opacity-70" : ""}`}>
      <Link href={`/product/${product.slug}`} className="block">
        <div className="flex aspect-square items-center justify-center rounded-lg bg-mint text-2xl font-semibold text-forest">
          {product.imageUrl ? (
            // Catalog images are added in admin inventory; keep a lightweight fallback until then.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="size-full rounded-lg object-cover" />
          ) : (
            <span aria-hidden="true">{product.name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <h3 className="mt-3 text-sm font-semibold text-gray-900">{product.name}</h3>
        {product.categoryName ? (
          <p className="text-xs text-muted-foreground">{product.categoryName}</p>
        ) : null}
        <p className="mt-1 text-sm font-medium text-forest">{formatPriceWithUnit(product.price, product.unit)}</p>
      </Link>
      <div className="mt-2 flex min-h-6 items-center">
        {soldOut ? (
          <Badge variant="destructive">Out of stock</Badge>
        ) : lowStock ? (
          <Badge className="bg-amber-status text-white">Only {product.stockQuantity} left</Badge>
        ) : (
          <Badge className="bg-mint text-forest">In stock</Badge>
        )}
      </div>
      <div className="mt-3">
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
    </article>
  );
}
