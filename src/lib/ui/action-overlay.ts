"use client";

import { create } from "zustand";

const SHOW_AFTER_MS = 220;

type ActionOverlayState = {
  count: number;
  visible: boolean;
  start: () => void;
  stop: () => void;
};

let showTimer: ReturnType<typeof setTimeout> | undefined;

export const useActionOverlay = create<ActionOverlayState>((set, get) => ({
  count: 0,
  visible: false,
  start: () => {
    const count = get().count + 1;
    set({ count });
    if (count === 1 && !showTimer) {
      showTimer = setTimeout(() => {
        showTimer = undefined;
        if (get().count > 0) {
          set({ visible: true });
        }
      }, SHOW_AFTER_MS);
    }
  },
  stop: () => {
    const count = Math.max(0, get().count - 1);
    if (count === 0) {
      if (showTimer) {
        clearTimeout(showTimer);
        showTimer = undefined;
      }
      set({ count: 0, visible: false });
      return;
    }
    set({ count });
  },
}));

export async function withActionOverlay<T>(action: () => Promise<T>): Promise<T> {
  useActionOverlay.getState().start();
  try {
    return await action();
  } finally {
    useActionOverlay.getState().stop();
  }
}
