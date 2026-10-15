"use client";

import { create } from "zustand";

type UnreadNotificationsState = {
  userId: string | null;
  count: number;
  readIds: Record<string, true>;
  allRead: boolean;
  hydrate: (userId: string, serverCount: number) => void;
  markRead: (id: string) => void;
  unmarkRead: (id: string) => void;
  markAllRead: (ids: string[]) => void;
  revertAll: (serverCount: number) => void;
  bumpUnread: () => void;
  reset: () => void;
};

export const useUnreadNotifications = create<UnreadNotificationsState>((set, get) => ({
  userId: null,
  count: 0,
  readIds: {},
  allRead: false,
  hydrate: (userId, serverCount) => {
    const state = get();
    if (state.userId !== userId) {
      set({ userId, count: serverCount, readIds: {}, allRead: false });
      return;
    }
    if (state.allRead || Object.keys(state.readIds).length > 0) {
      return;
    }
    set({ count: serverCount });
  },
  markRead: (id) => {
    const { readIds, allRead, count } = get();
    if (allRead || readIds[id]) {
      return;
    }
    set({
      readIds: { ...readIds, [id]: true },
      count: Math.max(0, count - 1),
    });
  },
  unmarkRead: (id) => {
    const { readIds, count } = get();
    if (!readIds[id]) {
      return;
    }
    const next = { ...readIds };
    delete next[id];
    set({ readIds: next, count: count + 1, allRead: false });
  },
  markAllRead: (ids) => {
    const readIds = { ...get().readIds };
    for (const id of ids) {
      readIds[id] = true;
    }
    set({ readIds, count: 0, allRead: true });
  },
  revertAll: (serverCount) => {
    set({ readIds: {}, allRead: false, count: serverCount });
  },
  bumpUnread: () => {
    set({ count: get().count + 1, allRead: false });
  },
  reset: () => {
    set({ userId: null, count: 0, readIds: {}, allRead: false });
  },
}));
