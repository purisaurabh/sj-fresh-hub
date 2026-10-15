import { describe, expect, it } from "vitest";
import { parseAddressSnapshot } from "@/features/admin/address-snapshot";
import { mapsUrlsForAddress } from "@/lib/maps/google-maps-url";

describe("address snapshot", () => {
  it("reads delivery fields used on the admin order map", () => {
    const parsed = parseAddressSnapshot({
      line1: "Flat 12, Green Valley",
      landmark: "Near City Park",
      pincode: "411001",
    });
    expect(parsed?.line1).toBe("Flat 12, Green Valley");
    const urls = mapsUrlsForAddress({
      line1: parsed!.line1,
      landmark: parsed?.landmark,
      buildingName: "Green Valley Apartments",
      pincode: parsed?.pincode,
    });
    expect(urls.embedUrl).toContain("output=embed");
    expect(urls.searchUrl).toContain("maps/search");
  });

  it("rejects snapshots without a street line", () => {
    expect(parseAddressSnapshot({})).toBeNull();
    expect(parseAddressSnapshot(null)).toBeNull();
  });
});
