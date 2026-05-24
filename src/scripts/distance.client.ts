import { haversineDistanceKm } from '../lib/geo';

export function getUserDistance(callback: (km: number) => void): void {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    pos => {
      const km = haversineDistanceKm({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      callback(Math.round(km * 10) / 10);
    },
    () => {
      // permissão negada — silencia
    }
  );
}
