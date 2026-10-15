import { describe, expect, it } from "vitest";
import {
  composeAddressQuery,
  googleMapsEmbedUrl,
  googleMapsSearchUrl,
  mapsUrlsForAddress,
} from "@/lib/maps/google-maps-url";

describe("google maps urls", () => {
  it("composes and encodes an address query", () => {
    const query = composeAddressQuery({
      line1: "Flat 12, Green Valley",
      landmark: "Near City Park",
      buildingName: "Green Valley Apartments",
      pincode: "411001",
    });

    expect(query).toContain("Green Valley");
    expect(googleMapsSearchUrl(query)).toContain("https://www.google.com/maps/search/?api=1&query=");
    expect(googleMapsSearchUrl(query)).toContain(encodeURIComponent(query));
    expect(googleMapsEmbedUrl(query)).toContain("output=embed");
  });

  it("rejects an empty address", () => {
    expect(() => googleMapsSearchUrl("   ")).toThrow(/delivery address is required/i);
    expect(() => googleMapsEmbedUrl("")).toThrow(/delivery address is required/i);
  });

  it("builds both fallback and embed URLs", () => {
    const urls = mapsUrlsForAddress({ line1: "Gate 2, Hillside Road" });
    expect(urls.searchUrl).toContain("query=Gate%202%2C%20Hillside%20Road");
    expect(urls.embedUrl).toContain("q=Gate%202%2C%20Hillside%20Road");
  });
});
