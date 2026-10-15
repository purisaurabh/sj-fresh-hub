export type AddressParts = {
  line1: string;
  landmark?: string | null;
  buildingName?: string | null;
  pincode?: string | null;
};

export function composeAddressQuery(parts: AddressParts): string {
  return [parts.line1, parts.landmark, parts.buildingName, parts.pincode]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(", ");
}

export function googleMapsSearchUrl(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error("A delivery address is required to open Google Maps.");
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}

export function googleMapsEmbedUrl(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error("A delivery address is required to embed Google Maps.");
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&z=16&output=embed`;
}

export function mapsUrlsForAddress(parts: AddressParts): {
  query: string;
  searchUrl: string;
  embedUrl: string;
} {
  const query = composeAddressQuery(parts);
  return {
    query,
    searchUrl: googleMapsSearchUrl(query),
    embedUrl: googleMapsEmbedUrl(query),
  };
}
