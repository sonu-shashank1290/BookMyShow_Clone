/**
 * Approximate city centres. Enough to snap a browser location to the nearest
 * city we actually sell tickets in, without calling a geocoding service.
 */
const COORDINATES: Record<string, [number, number]> = {
  Mumbai: [19.076, 72.8777],
  "Delhi-NCR": [28.6139, 77.209],
  Bengaluru: [12.9716, 77.5946],
  Hyderabad: [17.385, 78.4867],
  Chandigarh: [30.7333, 76.7794],
  Ahmedabad: [23.0225, 72.5714],
  Pune: [18.5204, 73.8567],
  Chennai: [13.0827, 80.2707],
  Kolkata: [22.5726, 88.3639],
  Kochi: [9.9312, 76.2673],
  Coimbatore: [11.0168, 76.9558],
  Indore: [22.7196, 75.8577],
  Jaipur: [26.9124, 75.7873],
  Lucknow: [26.8467, 80.9462],
  Mysuru: [12.2958, 76.6394],
  Nagpur: [21.1458, 79.0882],
  Vadodara: [22.3072, 73.1812],
  Visakhapatnam: [17.6868, 83.2185],
};

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/** Nearest of the given cities to a coordinate, or null if none are mapped. */
export function nearestCity(
  latitude: number,
  longitude: number,
  available: string[],
): string | null {
  let best: string | null = null;
  let bestDistance = Infinity;

  for (const name of available) {
    const point = COORDINATES[name];
    if (!point) continue;
    const distance = distanceKm(latitude, longitude, point[0], point[1]);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = name;
    }
  }
  return best;
}
