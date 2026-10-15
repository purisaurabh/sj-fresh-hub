import { Pencil } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CategoryDialog } from "@/components/admin/CategoryDialog";
import { ProductDialog } from "@/components/admin/ProductDialog";
import { ProductStatusButton } from "@/components/admin/ProductStatusButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdminCategories, getAdminProducts, getAdminSettings } from "@/features/admin/queries";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { formatInr } from "@/lib/money";

const compactActionClass =
  "h-9 w-full justify-center border-forest/30 px-3 text-sm font-medium text-forest";

export const metadata = { title: "Products" };

async function ProductsContent() {
  const [products, settings, categories] = await Promise.all([
    getAdminProducts(),
    getAdminSettings(),
    getAdminCategories(),
  ]);
  const threshold = Number(settings?.low_stock_threshold ?? LOW_STOCK_THRESHOLD);

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Products"
        description="Prices, stock and whether an item is on sale in the shop."
        action={
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
            <CategoryDialog />
            <ProductDialog categories={categories} />
          </div>
        }
      />
      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center">
          <p className="font-semibold text-gray-900">No products yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add a category first if needed, then create a product.</p>
        </div>
      ) : (
        <>
          <ul className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm xl:hidden">
            {products.map((product) => {
              const out = product.stock_quantity <= 0;
              const low = !out && product.stock_quantity <= threshold;
              return (
                <li
                  key={product.id}
                  className="flex flex-col gap-2.5 border-b border-border px-3 py-2.5 last:border-b-0 sm:flex-row sm:items-center sm:gap-3 sm:px-4"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-mint text-[11px] font-semibold text-forest">
                      {product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image_url} alt="" className="size-full object-cover" />
                      ) : (
                        product.name.slice(0, 2).toUpperCase()
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h2 className="truncate text-sm font-semibold text-gray-900">{product.name}</h2>
                        <Badge className={product.status === "active" ? "bg-mint text-forest" : "bg-red-50 text-destructive"}>
                          {product.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                        {out ? (
                          <Badge variant="destructive">Out</Badge>
                        ) : low ? (
                          <Badge className="bg-amber-100 text-amber-900">Low · {product.stock_quantity}</Badge>
                        ) : (
                          <Badge className="bg-mint text-forest">Stock {product.stock_quantity}</Badge>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {product.category_name ?? "Uncategorised"} · {formatInr(product.price)} / {product.unit}
                      </p>
                    </div>
                  </div>
                  <div className="grid w-full grid-cols-2 gap-2 sm:w-55 sm:shrink-0">
                    <div className="min-w-0">
                      <ProductDialog
                        product={product}
                        categories={categories}
                        trigger={
                          <Button type="button" variant="outline" className={compactActionClass}>
                            <Pencil className="size-3.5" aria-hidden="true" />
                            Edit
                          </Button>
                        }
                      />
                    </div>
                    <ProductStatusButton productId={product.id} status={product.status} className={compactActionClass} />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-white shadow-sm xl:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-mint/40 text-forest">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const out = product.stock_quantity <= 0;
                  const low = !out && product.stock_quantity <= threshold;
                  return (
                    <tr key={product.id} className="border-b border-border last:border-0 hover:bg-mint/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-mint text-xs font-semibold text-forest">
                            {product.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={product.image_url} alt="" className="size-full object-cover" />
                            ) : (
                              product.name.slice(0, 2).toUpperCase()
                            )}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{product.category_name ?? "—"}</td>
                      <td className="px-4 py-3 font-medium">{formatInr(product.price)}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{product.stock_quantity}</span>
                        {out ? (
                          <Badge variant="destructive" className="ml-2">
                            Out
                          </Badge>
                        ) : low ? (
                          <Badge className="ml-2 bg-amber-100 text-amber-900">Low</Badge>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={product.status === "active" ? "bg-mint text-forest" : "bg-red-50 text-destructive"}>
                          {product.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <ProductDialog
                            product={product}
                            categories={categories}
                            trigger={
                              <Button type="button" variant="outline" className="h-10 border-forest/30 text-forest">
                                Edit
                              </Button>
                            }
                          />
                          <ProductStatusButton productId={product.id} status={product.status} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return <ProductsContent />;
}
