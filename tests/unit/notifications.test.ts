import { describe, expect, it } from "vitest";
import { notificationOrderHref, notificationsPathForRole } from "@/features/notifications/paths";
import { shouldRefreshOnNotificationChange, withLocalReads } from "@/features/notifications/read-state";
import { shouldPollNotifications } from "@/features/notifications/realtime";

describe("notification paths", () => {
  it("sends each role to their inbox and related order", () => {
    expect(notificationsPathForRole("admin")).toBe("/admin/notifications");
    expect(notificationsPathForRole("customer")).toBe("/notifications");
    expect(notificationOrderHref("cccccccc-cccc-4ccc-8ccc-ccccccccccc1", "admin")).toBe(
      "/admin/orders/cccccccc-cccc-4ccc-8ccc-ccccccccccc1",
    );
    expect(notificationOrderHref("cccccccc-cccc-4ccc-8ccc-ccccccccccc1", "customer")).toBe(
      "/orders/cccccccc-cccc-4ccc-8ccc-ccccccccccc1",
    );
    expect(notificationOrderHref(null, "customer")).toBeNull();
  });
});

describe("notification realtime fallback", () => {
  it("polls when the tab is visible and Realtime is not subscribed", () => {
    expect(shouldPollNotifications("SUBSCRIBED", true)).toBe(false);
    expect(shouldPollNotifications("CHANNEL_ERROR", true)).toBe(true);
    expect(shouldPollNotifications("TIMED_OUT", true)).toBe(true);
    expect(shouldPollNotifications(null, true)).toBe(true);
    expect(shouldPollNotifications("CHANNEL_ERROR", false)).toBe(false);
  });

  it("does not full-refresh the app when a notification is only marked read", () => {
    expect(shouldRefreshOnNotificationChange("UPDATE")).toBe(false);
    expect(shouldRefreshOnNotificationChange("INSERT")).toBe(true);
    expect(shouldRefreshOnNotificationChange("DELETE")).toBe(true);
  });
});

describe("local notification reads", () => {
  const sample = [
    { id: "a", is_read: false },
    { id: "b", is_read: false },
    { id: "c", is_read: true },
  ];

  it("marks specific notifications read without waiting for the server list", () => {
    expect(withLocalReads(sample, { a: true }, false).map((item) => item.is_read)).toEqual([true, false, true]);
  });

  it("marks the whole inbox read in one pass", () => {
    expect(withLocalReads(sample, {}, true).every((item) => item.is_read)).toBe(true);
  });
});
