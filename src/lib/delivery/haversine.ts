import { DEFAULT_RADIUS_KM, EARTH_RADIUS_KM } from "@/lib/constants";

export type GeoPoint = {
  latitude: number;
  longitude: number;
};

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineKm(from: GeoPoint, to: GeoPoint): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

export function isWithinDeliveryRadius(
  from: GeoPoint,
  to: GeoPoint,
  radiusKm: number = DEFAULT_RADIUS_KM,
): boolean {
  if (radiusKm <= 0) {
    return false;
  }

  return haversineKm(from, to) <= radiusKm;
}

export function roundDistanceKm(distanceKm: number, digits = 3): number {
  const factor = 10 ** digits;
  return Math.round(distanceKm * factor) / factor;
}
