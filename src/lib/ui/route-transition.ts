"use client";

import { create } from "zustand";

type RouteTransitionState = {
  pendingHref: string | null;
  originHref: string | null;
  start: (href: string, originHref?: string) => void;
  clear: () => void;
};

export const useRouteTransition = create<RouteTransitionState>((set) => ({
  pendingHref: null,
  originHref: null,
  start: (href, originHref) =>
    set({
      pendingHref: href,
      originHref: originHref ?? (typeof window === "undefined" ? null : `${window.location.pathname}${window.location.search}`),
    }),
  clear: () => set({ pendingHref: null, originHref: null }),
}));

export function pathFromHref(href: string, origin: string) {
  const url = new URL(href, origin);
  return `${url.pathname}${url.search}`;
}
