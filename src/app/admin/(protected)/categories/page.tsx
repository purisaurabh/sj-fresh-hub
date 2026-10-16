import { Pencil, Tags } from "lucide-react";
import { AdminCategoriesFilters } from "@/components/admin/AdminCategoriesFilters";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminProductsSkeleton } from "@/components/admin/AdminProductsFilters";
import { CategoryDialog } from "@/components/admin/CategoryDialog";
import { CategoryStatusButton } from "@/components/admin/CategoryStatusButton";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrdersPagedList } from "@/components/orders/OrdersPagedList";
import {
  categoriesFilterHref,
  filterAdminCategories,
  parseAdminCategoriesFilter,
} from "@/features/admin/categories-filter";
import { getAdminCategories, getAdminProducts } from "@/features/admin/queries";
import { ADMIN_CATALOG_PAGE_SIZE } from "@/lib/constants";
import { paginateItems } from "@/lib/paginate";

const actionClass =
  "h-10 w-full justify-center border-forest/30 px-2 text-sm font-medium text-forest";

export const metadata = { title: "Categories" };

type CategoriesPageProps = {
  searchParams: Promise<{
    status?: string;
    products?: string;
    q?: string;
    sort?: string;
    page?: string;
  }>;
};

async function CategoriesContent({ searchParams }: CategoriesPageProps) {
  const params = await searchParams;
  const filter = parseAdminCategoriesFilter(params);
  const [categories, products] = await Promise.all([getAdminCategories(), getAdminProducts()]);
  const productCounts = new Map<string, number>();
  for (const product of products) {
    if (!product.category_id) {
      continue;
    }
    productCounts.set(product.category_id, (productCounts.get(product.category_id) ?? 0) + 1);
  }
  const rows = categories.map((category) => ({
    ...category,
    product_count: productCounts.get(category.id) ?? 0,
  }));
  const visible = filterAdminCategories(rows, filter);
  const paged = paginateItems(visible, filter.page ?? 1, ADMIN_CATALOG_PAGE_SIZE);
  const activeCount = categories.filter((category) => category.is_active).length;

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Categories"
        description={`Only active categories (${activeCount} of ${categories.length}) appear in the shop and when adding a product.`}
        action={<CategoryDialog />}
      />
      <AdminCategoriesFilters filter={filter}>
        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-mint text-forest">
              <Tags className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-3 font-semibold text-gray-900">No categories yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Add a category first, then attach products to it.</p>
            <div className="mt-4 flex justify-center">
              <CategoryDialog />
            </div>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center">
            <p className="font-semibold text-gray-900">No categories match these filters</p>
            <p className="mt-1 text-sm text-muted-foreground">Clear filters or try a different search.</p>
          </div>
        ) : (
          <OrdersPagedList
            page={paged.page}
            total={paged.total}
            pageSize={paged.pageSize}
            prevHref={paged.page > 1 ? categoriesFilterHref({ ...filter, page: paged.page - 1 }) : null}
            nextHref={paged.page * paged.pageSize < paged.total ? categoriesFilterHref({ ...filter, page: paged.page + 1 }) : null}
            label="Category pages"
            skeleton={<AdminProductsSkeleton count={ADMIN_CATALOG_PAGE_SIZE} />}
          >
            <ul className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
              {paged.items.map((category) => {
                const count = category.product_count;
                return (
                  <li
                    key={category.id}
                    className="flex flex-col gap-3 border-b border-border px-4 py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                          category.is_active ? "bg-mint text-forest" : "bg-red-50 text-destructive"
                        }`}
                        aria-hidden="true"
                      >
                        <Tags className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-sm font-semibold text-gray-900">{category.name}</h2>
                          <Badge className={category.is_active ? "bg-mint text-forest" : "bg-red-50 text-destructive"}>
                            {category.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {count === 1 ? "1 product" : `${count} products`}
                        </p>
                      </div>
                    </div>
                    <div className="grid w-full grid-cols-2 gap-2 sm:w-72 sm:shrink-0 sm:grid-cols-3">
                      <div className="min-w-0">
                        <CategoryDialog
                          category={{ id: category.id, name: category.name }}
                          trigger={
                            <Button type="button" variant="outline" className={actionClass}>
                              <Pencil className="size-3.5" aria-hidden="true" />
                              Edit
                            </Button>
                          }
                        />
                      </div>
                      <CategoryStatusButton categoryId={category.id} isActive={category.is_active} className={actionClass} />
                      <div className="col-span-2 min-w-0 sm:col-span-1">
                        <DeleteCategoryButton
                          categoryId={category.id}
                          categoryName={category.name}
                          productCount={count}
                          className="h-10"
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </OrdersPagedList>
        )}
      </AdminCategoriesFilters>
    </div>
  );
}

export default function AdminCategoriesPage({ searchParams }: CategoriesPageProps) {
  return <CategoriesContent searchParams={searchParams} />;
}
