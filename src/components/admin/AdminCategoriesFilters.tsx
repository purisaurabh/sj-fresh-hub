"use client";

import { useEffect, useOptimistic, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ListFilter, Search, X } from "lucide-react";
import { AdminProductsSkeleton } from "@/components/admin/AdminProductsFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  categoriesFilterHref,
  hasAdminCategoriesFilters,
  type AdminCategoriesFilter,
} from "@/features/admin/categories-filter";
import { ADMIN_CATALOG_PAGE_SIZE } from "@/lib/constants";

const SELECT_CLASS =
  "h-11 w-full appearance-none rounded-xl border border-border bg-white py-1 pr-10 pl-3 text-sm font-medium text-gray-900 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type AdminCategoriesFiltersProps = {
  filter: AdminCategoriesFilter;
  children: ReactNode;
};

function emptyDraft(filter: AdminCategoriesFilter): AdminCategoriesFilter {
  return {
    status: filter.status,
    products: filter.products,
    q: filter.q,
    sort: filter.sort,
  };
}

export function AdminCategoriesFilters({ filter, children }: AdminCategoriesFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useOptimistic(filter);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AdminCategoriesFilter>(() => emptyDraft(filter));
  const applied = hasAdminCategoriesFilters(active);

  function go(next: AdminCategoriesFilter) {
    const href = categoriesFilterHref({ ...next, page: undefined });
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
              <SheetTitle>Filter categories</SheetTitle>
              <SheetDescription>Set the options, then tap Apply.</SheetDescription>
              {hasAdminCategoriesFilters(draft) ? (
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
              <FilterFields idPrefix="mobile" value={draft} stacked onChange={setDraft} />
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

      <div className="hidden min-w-0 gap-2 md:flex" data-local-navigation>
        <FilterFields idPrefix="desktop" value={active} commitSearch onChange={go} />
      </div>

      {applied ? (
        <div className="hidden justify-end md:flex">
          <Button type="button" variant="outline" className="h-9 border-border bg-white text-forest hover:bg-mint" onClick={() => go({})}>
            <X className="size-4" aria-hidden="true" />
            Clear filters
          </Button>
        </div>
      ) : null}

      {isPending ? <AdminProductsSkeleton count={ADMIN_CATALOG_PAGE_SIZE} /> : children}
    </>
  );
}

function FilterFields({
  idPrefix,
  value,
  stacked = false,
  commitSearch = false,
  onChange,
}: {
  idPrefix: string;
  value: AdminCategoriesFilter;
  stacked?: boolean;
  commitSearch?: boolean;
  onChange: (next: AdminCategoriesFilter) => void;
}) {
  const fieldClass = stacked ? "" : "min-w-[8rem] flex-1";
  const [search, setSearch] = useState(value.q ?? "");

  useEffect(() => {
    setSearch(value.q ?? "");
  }, [value.q]);

  function commitCategorySearch() {
    const q = search.trim() || undefined;
    if (q === (value.q || undefined)) {
      return;
    }
    onChange({ ...value, q });
  }

  return (
    <>
      <FilterField className={fieldClass} label="Status" htmlFor={`${idPrefix}-category-status-filter`}>
        <div className="relative">
          <select
            id={`${idPrefix}-category-status-filter`}
            className={SELECT_CLASS}
            value={value.status ?? ""}
            onChange={(event) =>
              onChange({ ...value, status: (event.target.value || undefined) as AdminCategoriesFilter["status"] })
            }
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        </div>
      </FilterField>
      <FilterField className={fieldClass} label="Products" htmlFor={`${idPrefix}-category-products-filter`}>
        <div className="relative">
          <select
            id={`${idPrefix}-category-products-filter`}
            className={SELECT_CLASS}
            value={value.products ?? ""}
            onChange={(event) =>
              onChange({ ...value, products: (event.target.value || undefined) as AdminCategoriesFilter["products"] })
            }
          >
            <option value="">All categories</option>
            <option value="with">Has products</option>
            <option value="empty">No products</option>
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        </div>
      </FilterField>
      <FilterField className={fieldClass} label="Sort" htmlFor={`${idPrefix}-category-sort-filter`}>
        <div className="relative">
          <select
            id={`${idPrefix}-category-sort-filter`}
            className={SELECT_CLASS}
            value={value.sort ?? "order"}
            onChange={(event) =>
              onChange({
                ...value,
                sort: event.target.value === "order" ? undefined : (event.target.value as AdminCategoriesFilter["sort"]),
              })
            }
          >
            <option value="order">Shop order</option>
            <option value="name">Name A–Z</option>
            <option value="name_desc">Name Z–A</option>
            <option value="products_desc">Most products</option>
            <option value="products_asc">Fewest products</option>
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        </div>
      </FilterField>
      <FilterField className={fieldClass} label="Search" htmlFor={`${idPrefix}-category-search-filter`}>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id={`${idPrefix}-category-search-filter`}
            value={commitSearch ? search : (value.q ?? "")}
            onChange={(event) => {
              if (commitSearch) {
                setSearch(event.target.value);
                return;
              }
              onChange({ ...value, q: event.target.value || undefined });
            }}
            onBlur={commitSearch ? commitCategorySearch : undefined}
            onKeyDown={
              commitSearch
                ? (event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      commitCategorySearch();
                    }
                  }
                : undefined
            }
            placeholder="Category name"
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
