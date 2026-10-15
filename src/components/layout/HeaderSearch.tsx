"use client";

import { Suspense, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouteTransition } from "@/lib/ui/route-transition";

const LIVE_SEARCH_DELAY_MS = 300;

function searchHref(query: string, category: string | null) {
  const params = new URLSearchParams();
  const trimmed = query.trim().replace(/\s+/g, " ");
  if (trimmed) {
    params.set("q", trimmed);
  } else if (category) {
    params.set("category", category);
  }
  const search = params.toString();
  return search ? `/?${search}` : "/";
}

function SearchField({ id }: { id: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const category = searchParams.get("category");
  const [value, setValue] = useState(urlQuery);
  const [isPending, startTransition] = useTransition();
  const startRoute = useRouteTransition((state) => state.start);
  const lastSentRef = useRef(urlQuery);

  useEffect(() => {
    if (urlQuery !== lastSentRef.current) {
      lastSentRef.current = urlQuery;
      setValue(urlQuery);
    }
  }, [urlQuery]);

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }
    const normalized = value.trim().replace(/\s+/g, " ");
    if (normalized === lastSentRef.current) {
      return;
    }
    const timer = window.setTimeout(() => {
      lastSentRef.current = normalized;
      startTransition(() => {
        router.replace(searchHref(normalized, category), { scroll: false });
      });
    }, LIVE_SEARCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [category, pathname, router, value]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = value.trim().replace(/\s+/g, " ");
    lastSentRef.current = normalized;
    const href = searchHref(normalized, pathname === "/" ? category : null);
    if (pathname === "/") {
      startTransition(() => {
        router.replace(href, { scroll: false });
      });
      return;
    }
    startRoute(href);
    startTransition(() => {
      router.push(href);
    });
  }

  function clearSearch() {
    setValue("");
    if (pathname === "/" && lastSentRef.current) {
      lastSentRef.current = "";
      startTransition(() => {
        router.replace(searchHref("", category), { scroll: false });
      });
    }
  }

  return (
    <form onSubmit={submit} role="search" className="relative">
      <label htmlFor={id} className="sr-only">
        Search vegetables and fruits
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        name="q"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search vegetables and fruits"
        autoComplete="off"
        enterKeyHint="search"
        className="h-11 bg-input pr-10 pl-9 text-base [&::-webkit-search-cancel-button]:hidden"
      />
      <span className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center">
        {isPending ? (
          <Loader2 className="size-4 animate-spin text-forest" aria-label="Searching" />
        ) : value ? (
          <button
            type="button"
            onClick={clearSearch}
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-mint hover:text-forest"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </span>
    </form>
  );
}

function SearchFieldFallback({ id }: { id: string }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        disabled
        placeholder="Search vegetables and fruits"
        className="h-11 bg-input pl-9 text-base"
      />
    </div>
  );
}

function HomeOnlySearch({ id, className }: { id: string; className?: string }) {
  const pathname = usePathname();
  if (pathname !== "/") {
    return null;
  }

  return (
    <div className={className}>
      <Suspense fallback={<SearchFieldFallback id={id} />}>
        <SearchField id={id} />
      </Suspense>
    </div>
  );
}

export function HeaderSearch({ id, className }: { id: string; className?: string }) {
  return (
    <Suspense fallback={null}>
      <HomeOnlySearch id={id} className={className} />
    </Suspense>
  );
}
