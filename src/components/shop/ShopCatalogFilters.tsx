"use client";

import { useOptimistic, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ListFilter, X } from "lucide-react";
import { CatalogSkeleton } from "@/components/shop/CatalogSkeleton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  hasShopCatalogFilters,
  shopCatalogHref,
  type ShopCatalogFilter,
} from "@/features/shop/catalog-filter";

const SELECT_CLASS =
  "h-11 w-full appearance-none rounded-xl border border-border bg-white py-1 pr-10 pl-3 text-sm font-medium text-gray-900 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type CategoryOption = { id: string; name: string; slug: string };

type ShopCatalogFiltersProps = {
  filter: ShopCatalogFilter;
  categories: CategoryOption[];
  resultCount: number;
  children: ReactNode;
};

function emptyDraft(filter: ShopCatalogFilter): ShopCatalogFilter {
  return {
    category: filter.category,
    stock: filter.stock,
    price: filter.price,
    sort: filter.sort,
  };
}

export function ShopCatalogFilters({ filter, categories, resultCount, children }: ShopCatalogFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useOptimistic(filter);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ShopCatalogFilter>(() => emptyDraft(filter));
  const applied = hasShopCatalogFilters(active);

  function go(next: ShopCatalogFilter) {
    const href = shopCatalogHref({ ...next, q: active.q });
    startTransition(() => {
      setActive({ ...next, q: active.q });
      router.replace(href, { scroll: false });
    });
  }

  function openSheet() {
    setDraft(emptyDraft(active));
    setOpen(true);
  }

  function cancelSheet() {
    setDraft(emptyDraft(active));
    setOpen(false);
  }

  function applySheet() {
    go(draft);
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gray-900 md:text-lg">Fresh produce</h2>
          <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">
            {resultCount === 1 ? "1 product" : `${resultCount} products`}
            {applied ? " match your filters" : " ready to add to cart"}
          </p>
        </div>
        {applied ? (
          <Button
            type="button"
            variant="outline"
            className="hidden h-10 border-border bg-white text-forest hover:bg-mint md:inline-flex"
            onClick={() => go({})}
          >
            <X className="size-4" aria-hidden="true" />
            Clear filters
          </Button>
        ) : null}
      </div>

      <div className="flex gap-2 md:hidden">
        <Button
          type="button"
          variant={applied ? undefined : "outline"}
          className={`h-11 min-w-0 flex-1 ${applied ? "bg-forest text-white hover:bg-forest/90" : "border-border bg-white text-forest hover:bg-mint"}`}
          onClick={openSheet}
        >
          <ListFilter className="size-4" aria-hidden="true" />
          Filter
          {applied ? <span className="rounded-full bg-white/20 px-1.5 text-xs">On</span> : null}
        </Button>
        {applied ? (
          <Button type="button" variant="outline" className="h-11 shrink-0 border-border bg-white text-forest hover:bg-mint" onClick={() => go({})}>
            <X className="size-4" aria-hidden="true" />
            Clear
          </Button>
        ) : null}
        <Sheet
          open={open}
          onOpenChange={(next) => {
            if (next) {
              openSheet();
              return;
            }
            cancelSheet();
          }}
        >
          <SheetContent
            side="left"
            showCloseButton={false}
            className="w-full max-w-none gap-0 bg-white p-0 sm:max-w-none"
          >
            <SheetHeader className="border-b border-border">
              <SheetTitle>Filter produce</SheetTitle>
              <SheetDescription>Narrow the list, then tap Apply.</SheetDescription>
              {hasShopCatalogFilters(draft) ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 w-fit px-0 text-forest hover:bg-transparent hover:underline"
                  onClick={() => setDraft({})}
                >
                  <X className="size-4" aria-hidden="true" />
                  Clear all
                </Button>
              ) : null}
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
              <FilterFields idPrefix="mobile" value={draft} categories={categories} stacked onChange={setDraft} />
            </div>
            <SheetFooter className="grid grid-cols-2 gap-2 border-t border-border">
              <Button type="button" variant="outline" className="h-11" onClick={cancelSheet}>
                Cancel
              </Button>
              <Button type="button" className="h-11 bg-forest text-white hover:bg-forest/90" onClick={applySheet}>
                Apply
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div
        className="hidden rounded-2xl border border-border bg-white p-3 shadow-sm md:grid md:grid-cols-2 md:gap-3 lg:grid-cols-4"
        data-local-navigation
      >
        <FilterFields idPrefix="desktop" value={active} categories={categories} onChange={go} />
      </div>

      {isPending ? (
        <div aria-busy="true" aria-live="polite">
          <span className="sr-only">Loading products</span>
          <CatalogSkeleton />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function FilterFields({
  idPrefix,
  value,
  categories,
  stacked = false,
  onChange,
}: {
  idPrefix: string;
  value: ShopCatalogFilter;
  categories: CategoryOption[];
  stacked?: boolean;
  onChange: (next: ShopCatalogFilter) => void;
}) {
  return (
    <>
      {categories.length > 0 ? (
        <FilterField className={stacked ? "" : "min-w-0"} label="Type" htmlFor={`${idPrefix}-shop-type-filter`}>
          <SelectWrap>
            <select
              id={`${idPrefix}-shop-type-filter`}
              className={SELECT_CLASS}
              value={value.category ?? ""}
              onChange={(event) => onChange({ ...value, category: event.target.value || undefined })}
            >
              <option value="">All produce</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </SelectWrap>
        </FilterField>
      ) : null}
      <FilterField className={stacked ? "" : "min-w-0"} label="Availability" htmlFor={`${idPrefix}-shop-stock-filter`}>
        <SelectWrap>
          <select
            id={`${idPrefix}-shop-stock-filter`}
            className={SELECT_CLASS}
            value={value.stock ?? ""}
            onChange={(event) =>
              onChange({ ...value, stock: (event.target.value || undefined) as ShopCatalogFilter["stock"] })
            }
          >
            <option value="">All stock</option>
            <option value="in">In stock</option>
            <option value="low">Running low</option>
            <option value="out">Sold out</option>
          </select>
        </SelectWrap>
      </FilterField>
      <FilterField className={stacked ? "" : "min-w-0"} label="Price" htmlFor={`${idPrefix}-shop-price-filter`}>
        <SelectWrap>
          <select
            id={`${idPrefix}-shop-price-filter`}
            className={SELECT_CLASS}
            value={value.price ?? ""}
            onChange={(event) =>
              onChange({ ...value, price: (event.target.value || undefined) as ShopCatalogFilter["price"] })
            }
          >
            <option value="">Any price</option>
            <option value="under_50">Under ₹50</option>
            <option value="50_100">₹50 – ₹100</option>
            <option value="over_100">Over ₹100</option>
          </select>
        </SelectWrap>
      </FilterField>
      <FilterField className={stacked ? "" : "min-w-0"} label="Sort" htmlFor={`${idPrefix}-shop-sort-filter`}>
        <SelectWrap>
          <select
            id={`${idPrefix}-shop-sort-filter`}
            className={SELECT_CLASS}
            value={value.sort ?? "name"}
            onChange={(event) =>
              onChange({
                ...value,
                sort: event.target.value === "name" ? undefined : (event.target.value as ShopCatalogFilter["sort"]),
              })
            }
          >
            <option value="name">Name A–Z</option>
            <option value="name_desc">Name Z–A</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </SelectWrap>
      </FilterField>
    </>
  );
}

function SelectWrap({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}

function FilterField({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
