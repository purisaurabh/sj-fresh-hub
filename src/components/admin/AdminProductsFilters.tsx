"use client";

import { useEffect, useOptimistic, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ListFilter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  hasAdminProductsFilters,
  productsFilterHref,
  type AdminProductsFilter,
} from "@/features/admin/products-filter";

const SELECT_CLASS =
  "h-11 w-full appearance-none rounded-xl border border-border bg-white py-1 pr-10 pl-3 text-sm font-medium text-gray-900 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type CategoryOption = { id: string; name: string };

type AdminProductsFiltersProps = {
  filter: AdminProductsFilter;
  categories: CategoryOption[];
  children: ReactNode;
};

function emptyDraft(filter: AdminProductsFilter): AdminProductsFilter {
  return {
    status: filter.status,
    category: filter.category,
    stock: filter.stock,
    q: filter.q,
    sort: filter.sort,
  };
}

export function AdminProductsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading products</span>
      {Array.from({ length: count }).map((_, index) => (
        <li key={index} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
          <Skeleton className="size-10 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
          <Skeleton className="h-9 w-20 rounded-lg" />
        </li>
      ))}
    </ul>
  );
}

export function AdminProductsFilters({ filter, categories, children }: AdminProductsFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useOptimistic(filter);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AdminProductsFilter>(() => emptyDraft(filter));
  const applied = hasAdminProductsFilters(active);

  function go(next: AdminProductsFilter) {
    const href = productsFilterHref({ ...next, page: undefined });
    startTransition(() => {
      setActive({ ...next, page: undefined });
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
    go({
      ...draft,
      q: draft.q?.trim() || undefined,
    });
    setOpen(false);
  }

  return (
    <>
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
              <SheetTitle>Filter products</SheetTitle>
              <SheetDescription>Set the options, then tap Apply.</SheetDescription>
              {hasAdminProductsFilters(draft) ? (
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
        className="hidden min-w-0 gap-2 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        data-local-navigation
      >
        <FilterFields idPrefix="desktop" value={active} categories={categories} commitSearch onChange={go} />
      </div>

      {applied ? (
        <div className="hidden justify-end md:flex">
          <Button type="button" variant="outline" className="h-9 border-border bg-white text-forest hover:bg-mint" onClick={() => go({})}>
            <X className="size-4" aria-hidden="true" />
            Clear filters
          </Button>
        </div>
      ) : null}

      {isPending ? <AdminProductsSkeleton /> : children}
    </>
  );
}

function FilterFields({
  idPrefix,
  value,
  categories,
  stacked = false,
  commitSearch = false,
  onChange,
}: {
  idPrefix: string;
  value: AdminProductsFilter;
  categories: CategoryOption[];
  stacked?: boolean;
  commitSearch?: boolean;
  onChange: (next: AdminProductsFilter) => void;
}) {
  const fieldClass = stacked ? "" : "min-w-0";
  const [search, setSearch] = useState(value.q ?? "");

  useEffect(() => {
    setSearch(value.q ?? "");
  }, [value.q]);

  function commitProductSearch() {
    const q = search.trim() || undefined;
    if (q === (value.q || undefined)) {
      return;
    }
    onChange({ ...value, q });
  }

  return (
    <>
      <FilterField className={fieldClass} label="Status" htmlFor={`${idPrefix}-product-status-filter`}>
        <div className="relative">
          <select
            id={`${idPrefix}-product-status-filter`}
            className={SELECT_CLASS}
            value={value.status ?? ""}
            onChange={(event) => onChange({ ...value, status: (event.target.value || undefined) as AdminProductsFilter["status"] })}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        </div>
      </FilterField>
      <FilterField className={fieldClass} label="Category" htmlFor={`${idPrefix}-product-category-filter`}>
        <div className="relative">
          <select
            id={`${idPrefix}-product-category-filter`}
            className={SELECT_CLASS}
            value={value.category ?? ""}
            onChange={(event) => onChange({ ...value, category: event.target.value || undefined })}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        </div>
      </FilterField>
      <FilterField className={fieldClass} label="Stock" htmlFor={`${idPrefix}-product-stock-filter`}>
        <div className="relative">
          <select
            id={`${idPrefix}-product-stock-filter`}
            className={SELECT_CLASS}
            value={value.stock ?? ""}
            onChange={(event) => onChange({ ...value, stock: (event.target.value || undefined) as AdminProductsFilter["stock"] })}
          >
            <option value="">All stock</option>
            <option value="in">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        </div>
      </FilterField>
      <FilterField className={fieldClass} label="Sort" htmlFor={`${idPrefix}-product-sort-filter`}>
        <div className="relative">
          <select
            id={`${idPrefix}-product-sort-filter`}
            className={SELECT_CLASS}
            value={value.sort ?? "name"}
            onChange={(event) =>
              onChange({
                ...value,
                sort: event.target.value === "name" ? undefined : (event.target.value as AdminProductsFilter["sort"]),
              })
            }
          >
            <option value="name">Name A–Z</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="stock_asc">Stock: low to high</option>
            <option value="stock_desc">Stock: high to low</option>
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        </div>
      </FilterField>
      <FilterField className={fieldClass} label="Search" htmlFor={`${idPrefix}-product-search-filter`}>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id={`${idPrefix}-product-search-filter`}
            value={commitSearch ? search : (value.q ?? "")}
            onChange={(event) => {
              if (commitSearch) {
                setSearch(event.target.value);
                return;
              }
              onChange({ ...value, q: event.target.value || undefined });
            }}
            onBlur={commitSearch ? commitProductSearch : undefined}
            onKeyDown={
              commitSearch
                ? (event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      commitProductSearch();
                    }
                  }
                : undefined
            }
            placeholder="Name or unit"
            className="h-11 rounded-xl bg-white pr-3 pl-9 text-sm"
          />
        </div>
      </FilterField>
    </>
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
