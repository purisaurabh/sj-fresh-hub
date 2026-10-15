"use client";

import { useOptimistic, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { CatalogSkeleton } from "@/components/shop/CatalogSkeleton";
import { Badge } from "@/components/ui/badge";

type CategoryFilterProps = {
  categories: { id: string; name: string; slug: string }[];
  selected?: string;
  children: ReactNode;
};

function hrefForCategory(slug: string) {
  return slug ? `/?category=${slug}` : "/";
}

export function CategoryFilter({ categories, selected, children }: CategoryFilterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useOptimistic(selected ?? "");

  function go(slug: string) {
    if (slug === active) {
      return;
    }
    startTransition(() => {
      setActive(slug);
      router.replace(hrefForCategory(slug), { scroll: false });
    });
  }

  function choose(event: React.MouseEvent<HTMLAnchorElement>, slug: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    go(slug);
  }

  const items = [{ slug: "", name: "All", href: "/" }].concat(
    categories.map((item) => ({ slug: item.slug, name: item.name, href: hrefForCategory(item.slug) })),
  );

  return (
    <>
      {categories.length > 0 ? (
        <>
          <div className="md:hidden">
            <label htmlFor="category-filter" className="mb-1 block text-xs font-medium text-muted-foreground">
              Category
            </label>
            <div className="relative">
              <select
                id="category-filter"
                className="h-11 w-full appearance-none rounded-xl border border-border bg-white py-1 pr-10 pl-3 text-sm font-medium text-gray-900 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={active}
                onChange={(event) => go(event.target.value)}
              >
                {items.map((item) => (
                  <option key={item.slug || "all"} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          </div>
          <nav
            className="hidden flex-wrap gap-2 md:flex"
            aria-label="Categories"
            data-local-navigation
          >
            {items.map((item) => (
              <Link
                key={item.slug || "all"}
                href={item.href}
                scroll={false}
                onClick={(event) => choose(event, item.slug)}
                aria-current={active === item.slug ? "page" : undefined}
                className="inline-flex min-h-11 shrink-0 items-center"
              >
                <Badge
                  className={active === item.slug ? "bg-forest text-white" : "bg-white text-gray-700 hover:bg-mint"}
                  variant="outline"
                >
                  {item.name}
                </Badge>
              </Link>
            ))}
          </nav>
        </>
      ) : null}
      {isPending ? (
        <div aria-busy="true" aria-live="polite">
          <span className="sr-only">Loading products</span>
          <CatalogSkeleton />
        </div>
      ) : (
        children
      )}
    </>
  );
}
