import { mapsUrlsForAddress } from "@/lib/maps/google-maps-url";

export function OrderMap({
  line1,
  landmark,
  buildingName,
  pincode,
}: {
  line1: string;
  landmark?: string | null;
  buildingName?: string | null;
  pincode?: string | null;
}) {
  let urls: { query: string; searchUrl: string; embedUrl: string };
  try {
    urls = mapsUrlsForAddress({ line1, landmark, buildingName, pincode });
  } catch {
    return null;
  }

  return (
    <div className="space-y-3">
      <iframe
        title={`Map for ${urls.query}`}
        src={urls.embedUrl}
        className="h-56 w-full rounded-lg border border-border"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a
        href={urls.searchUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 items-center font-medium text-forest underline-offset-2 hover:underline"
      >
        Open in Google Maps
      </a>
    </div>
  );
}
