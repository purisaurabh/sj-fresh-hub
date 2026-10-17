import { Package, Pencil } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminProductsFilters, AdminProductsSkeleton } from "@/components/admin/AdminProductsFilters";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { ProductDialog } from "@/components/admin/ProductDialog";
import { ProductStatusButton } from "@/components/admin/ProductStatusButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrdersPagedList } from "@/components/orders/OrdersPagedList";
import { filterAdminProducts, parseAdminProductsFilter, productsFilterHref } from "@/features/admin/products-filter";
import { getAdminCategories, getAdminProducts, getAdminSettings } from "@/features/admin/queries";
import { ADMIN_CATALOG_PAGE_SIZE, LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { formatInr } from "@/lib/money";
import { paginateItems } from "@/lib/paginate";

const actionClass =
  "h-10 w-full cursor-pointer justify-center border-forest/30 px-2 text-sm font-medium text-forest";
const tableActionClass =
  "h-9 w-auto shrink-0 cursor-pointer justify-center border-forest/30 px-2.5 text-sm font-medium text-forest";

export const metadata = { title: "Products" };

type ProductsPageProps = {
  searchParams: Promise<{
    status?: string;
    category?: string;
    stock?: string;
    q?: string;
    sort?: string;
    page?: string;
  }>;
};

async function ProductsContent({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const filter = parseAdminProductsFilter(params);
  const [products, settings, categories] = await Promise.all([
    getAdminProducts(),
    getAdminSettings(),
    getAdminCategories(),
  ]);
  const threshold = Number(settings?.low_stock_threshold ?? LOW_STOCK_THRESHOLD);
  const visible = filterAdminProducts(products, filter, threshold);
  const paged = paginateItems(visible, filter.page ?? 1, ADMIN_CATALOG_PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Products"
        description="Prices, stock and whether an item is on sale in the shop."
        action={<ProductDialog categories={categories} />}
      />
      <AdminProductsFilters filter={filter} categories={categories}>
        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-mint text-forest">
              <Package className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-3 font-semibold text-gray-900">No products yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Add a category first if needed, then create a product.</p>
            <div className="mt-4 flex justify-center">
              <ProductDialog categories={categories} />
            </div>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center">
            <p className="font-semibold text-gray-900">No products match these filters</p>
            <p className="mt-1 text-sm text-muted-foreground">Clear filters or try a different search.</p>
          </div>
        ) : (
          <OrdersPagedList
            page={paged.page}
            total={paged.total}
            pageSize={paged.pageSize}
            prevHref={paged.page > 1 ? productsFilterHref({ ...filter, page: paged.page - 1 }) : null}
            nextHref={paged.page * paged.pageSize < paged.total ? productsFilterHref({ ...filter, page: paged.page + 1 }) : null}
            label="Product pages"
            skeleton={<AdminProductsSkeleton count={ADMIN_CATALOG_PAGE_SIZE} />}
          >
            <ul className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm xl:hidden">
              {paged.items.map((product) => {
                const out = product.stock_quantity <= 0;
                const low = !out && product.stock_quantity <= threshold;
                const active = product.status === "active";
                return (
                  <li
                    key={product.id}
                    className="flex flex-col gap-3 border-b border-border px-4 py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-[11px] font-semibold ${
                          active ? "bg-mint text-forest" : "bg-red-50 text-destructive"
                        }`}
                      >
                        {product.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.image_url} alt="" className="size-full object-cover" />
                        ) : (
                          product.name.slice(0, 2).toUpperCase()
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-sm font-semibold text-gray-900">{product.name}</h2>
                          <Badge className={active ? "bg-mint text-forest" : "bg-red-50 text-destructive"}>
                            {active ? "Active" : "Inactive"}
                          </Badge>
                          {out ? (
                            <Badge variant="destructive">Out</Badge>
                          ) : low ? (
                            <Badge className="bg-amber-100 text-amber-900">Low · {product.stock_quantity}</Badge>
                          ) : null}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {product.category_name ?? "Uncategorised"} · {formatInr(product.price)} / {product.unit}
                          {!out && !low ? ` · Stock ${product.stock_quantity}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="grid w-full grid-cols-2 gap-2 sm:w-72 sm:shrink-0 sm:grid-cols-3">
                      <div className="min-w-0">
                        <ProductDialog
                          product={product}
                          categories={categories}
                          trigger={
                            <Button type="button" variant="outline" className={actionClass}>
                              <Pencil className="size-3.5" aria-hidden="true" />
                              Edit
                            </Button>
                          }
                        />
                      </div>
                      <ProductStatusButton productId={product.id} status={product.status} className={actionClass} />
                      <div className="col-span-2 min-w-0 sm:col-span-1">
                        <DeleteProductButton productId={product.id} productName={product.name} className="h-10" />
                      </div>
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
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.items.map((product) => {
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
                          <div className="flex items-center justify-end gap-1.5">
                            <ProductDialog
                              product={product}
                              categories={categories}
                              trigger={
                                <Button type="button" variant="outline" className={tableActionClass}>
                                  <Pencil className="size-3.5" aria-hidden="true" />
                                  Edit
                                </Button>
                              }
                            />
                            <ProductStatusButton productId={product.id} status={product.status} className={tableActionClass} />
                            <DeleteProductButton productId={product.id} productName={product.name} className="h-9 w-auto shrink-0 px-2.5" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </OrdersPagedList>
        )}
      </AdminProductsFilters>
    </div>
  );
}

export default function AdminProductsPage({ searchParams }: ProductsPageProps) {
  return <ProductsContent searchParams={searchParams} />;
}
