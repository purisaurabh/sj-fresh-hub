"use client";

import { create } from "zustand";

type RouteTransitionState = {
  pendingHref: string | null;
  start: (href: string) => void;
  clear: () => void;
};

export const useRouteTransition = create<RouteTransitionState>((set) => ({
  pendingHref: null,
  start: (href) => set({ pendingHref: href }),
  clear: () => set({ pendingHref: null }),
}));

export function pathFromHref(href: string, origin: string) {
  const url = new URL(href, origin);
  return `${url.pathname}${url.search}`;
}
