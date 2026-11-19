/**
 * OSRM Real-World Road Routing Service
 *
 * Uses the Open Source Routing Machine (OSRM) public API for real-world street routing
 * and road-distance calculations over OpenStreetMap data.
 *
 * Separation of Concerns (DAA evaluation requirement):
 * - Dijkstra calculates shortest paths and distances on the project's academic road graph.
 * - 0/1 Knapsack selects optimal bins within capacity.
 * - Held-Karp TSP calculates the optimal tour stop sequence.
 * - OSRM provides real street-level driving geometry and real-world road distances.
 * - If OSRM is offline or unreachable, system falls back to Dijkstra graph coordinates.
 */

const OSRM_BASE_URL = 'https://router.project-osrm.org';
const ROUTE_CACHE = new Map();
const TABLE_CACHE = new Map();
const TIMEOUT_MS = 4500;

/**
 * Builds coordinate string for OSRM URL: "lng1,lat1;lng2,lat2;..."
 */
function toCoordString(waypoints) {
  return waypoints.map(w => `${w.lng.toFixed(6)},${w.lat.toFixed(6)}`).join(';');
}

/**
 * Fetches real-world driving route geometry and road distance for ordered stops.
 *
 * @param {Array<{lat: number, lng: number}>} waypoints - Ordered stops (Depot -> Bin A -> Bin B -> Depot)
 * @returns {Promise<{
 *   success: boolean,
 *   isRealRoad: boolean,
 *   coordinates: Array<[number, number]>, // Leaflet format: [lat, lng]
 *   distanceKm: number,
 *   durationMin: number,
 *   networkTimeMs: number,
 *   error?: string
 * }>}
 */
export async function fetchOsrmRoute(waypoints) {
  if (!waypoints || waypoints.length < 2) {
    return {
      success: true,
      isRealRoad: false,
      coordinates: [],
      distanceKm: 0,
      durationMin: 0,
      networkTimeMs: 0
    };
  }

  const coordStr = toCoordString(waypoints);
  const cacheKey = `route_${coordStr}`;

  if (ROUTE_CACHE.has(cacheKey)) {
    return { ...ROUTE_CACHE.get(cacheKey), fromCache: true };
  }

  const startTime = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `${OSRM_BASE_URL}/route/v1/driving/${coordStr}?overview=full&geometries=geojson&steps=false`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`OSRM HTTP error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const networkTimeMs = parseFloat((performance.now() - startTime).toFixed(1));

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error(data.message || 'No route found by OSRM');
    }

    const primaryRoute = data.routes[0];
    // GeoJSON is [lng, lat], convert to Leaflet [lat, lng]
    const leafletCoords = primaryRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    const distanceKm = parseFloat((primaryRoute.distance / 1000).toFixed(2));
    const durationMin = parseFloat((primaryRoute.duration / 60).toFixed(1));

    const result = {
      success: true,
      isRealRoad: true,
      coordinates: leafletCoords,
      distanceKm,
      durationMin,
      networkTimeMs
    };

    ROUTE_CACHE.set(cacheKey, result);
    return result;
  } catch (err) {
    clearTimeout(timer);
    const networkTimeMs = parseFloat((performance.now() - startTime).toFixed(1));
    return {
      success: false,
      isRealRoad: false,
      coordinates: [],
      distanceKm: 0,
      durationMin: 0,
      networkTimeMs,
      error: err.name === 'AbortError' ? 'OSRM request timed out (>4.5s)' : err.message
    };
  }
}

/**
 * Fetches real-world driving distance matrix between waypoints.
 *
 * @param {Array<{lat: number, lng: number}>} waypoints
 * @returns {Promise<{
 *   success: boolean,
 *   matrixKm: Array<Array<number>>,
 *   networkTimeMs: number,
 *   error?: string
 * }>}
 */
export async function fetchOsrmDistanceMatrix(waypoints) {
  if (!waypoints || waypoints.length === 0) {
    return { success: true, matrixKm: [], networkTimeMs: 0 };
  }

  const coordStr = toCoordString(waypoints);
  const cacheKey = `table_${coordStr}`;

  if (TABLE_CACHE.has(cacheKey)) {
    return { ...TABLE_CACHE.get(cacheKey), fromCache: true };
  }

  const startTime = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `${OSRM_BASE_URL}/table/v1/driving/${coordStr}`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`OSRM HTTP error: ${response.status}`);
    }

    const data = await response.json();
    const networkTimeMs = parseFloat((performance.now() - startTime).toFixed(1));

    if (data.code !== 'Ok' || !data.distances) {
      throw new Error(data.message || 'OSRM Table API returned non-OK status');
    }

    // Convert meters to km
    const matrixKm = data.distances.map(row =>
      row.map(d => (d === null ? Infinity : parseFloat((d / 1000).toFixed(3))))
    );

    const result = {
      success: true,
      matrixKm,
      networkTimeMs
    };

    TABLE_CACHE.set(cacheKey, result);
    return result;
  } catch (err) {
    clearTimeout(timer);
    const networkTimeMs = parseFloat((performance.now() - startTime).toFixed(1));
    return {
      success: false,
      matrixKm: null,
      networkTimeMs,
      error: err.message
    };
  }
}

export function clearOsrmCache() {
  ROUTE_CACHE.clear();
  TABLE_CACHE.clear();
}
