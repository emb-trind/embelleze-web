// Instituto Embelleze Trindade — Av. Manoel Monteiro, 1691, Trindade/GO
const INSTITUTE_LAT = -16.6497;
const INSTITUTE_LNG = -49.4873;

export interface Coordinates {
  lat: number;
  lng: number;
}

export function getInstituteCoords(): Coordinates {
  return { lat: INSTITUTE_LAT, lng: INSTITUTE_LNG };
}

export function getGoogleMapsLink(): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${INSTITUTE_LAT},${INSTITUTE_LNG}`;
}

export function haversineDistanceKm(from: Coordinates): number {
  const R = 6371;
  const dLat = toRad(INSTITUTE_LAT - from.lat);
  const dLng = toRad(INSTITUTE_LNG - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(INSTITUTE_LAT)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
