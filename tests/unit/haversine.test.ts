import { describe, expect, it } from "vitest";
import { haversineKm, isWithinDeliveryRadius } from "@/lib/delivery/haversine";

const shop = { latitude: 18.5204, longitude: 73.8567 };

describe("haversineKm", () => {
  it("returns 0 for the same point", () => {
    expect(haversineKm(shop, shop)).toBeCloseTo(0, 6);
  });

  it("measures a nearby building inside 5 km", () => {
    const nearby = { latitude: 18.5212, longitude: 73.8571 };
    const distance = haversineKm(shop, nearby);
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(1);
    expect(isWithinDeliveryRadius(shop, nearby, 5)).toBe(true);
  });

  it("rejects a point clearly outside the 5 km radius", () => {
    const far = { latitude: 18.62, longitude: 73.96 };
    expect(haversineKm(shop, far)).toBeGreaterThan(5);
    expect(isWithinDeliveryRadius(shop, far, 5)).toBe(false);
  });
});
