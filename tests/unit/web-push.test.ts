import { describe, expect, it } from "vitest";
import { isWebPushConfigured, urlBase64ToUint8Array } from "@/lib/push/keys";
import { webPushClickUrl, webPushPayload } from "@/lib/push/payload";

describe("web push helpers", () => {
  it("decodes a URL-safe VAPID public key", () => {
    const bytes = urlBase64ToUint8Array("AQID");
    expect(Array.from(bytes)).toEqual([1, 2, 3]);
  });

  it("requires a real public key before enabling the UI", () => {
    expect(isWebPushConfigured("")).toBe(false);
    expect(isWebPushConfigured("B".repeat(80))).toBe(true);
  });

  it("builds a notification-bar payload and click URL", () => {
    const payload = JSON.parse(
      webPushPayload({ title: "New order SFH-0001 received", body: "Waiting for review.", url: "/admin/orders/1" }),
    );
    expect(payload.title).toMatch(/SFH-0001/);
    expect(payload.body).toMatch(/review/);
    expect(webPushClickUrl("new_order", "cccccccc-cccc-4ccc-8ccc-ccccccccccc1")).toContain("/admin/orders/");
    expect(webPushClickUrl("order_status", "cccccccc-cccc-4ccc-8ccc-ccccccccccc1")).toContain("/orders/");
  });
});
