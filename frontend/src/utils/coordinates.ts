export const LAT_BOUNDS = [-30.0, 30.0];
export const LON_BOUNDS = [30.0, 120.0];
export const MAX_DEPTH = 2000.0;
export const EARTH_RADIUS = 16.0;

/**
 * Transforms Geographic (Lat, Lon, Depth) to 3D Cartesian coordinates for Regional Box View
 */
export function geoTo3D(lat: number, lon: number, depth: number = 0, exaggeration: number = 30): [number, number, number] {
  const x = ((lon - 65.0) / 25.0 - 0.5) * 40;
  const z = -((lat - 5.0) / 20.0 - 0.5) * 30;
  const y = -(depth / MAX_DEPTH) * (exaggeration / 3);
  return [x, y, z];
}

/**
 * Transforms Geographic (Lat, Lon, Depth) to 3D Spherical coordinates on the Earth Globe
 */
export function geoToSpherical(lat: number, lon: number, radius: number = EARTH_RADIUS, depth: number = 0): [number, number, number] {
  // Slight depth depression on globe surface
  const r = radius - (depth / MAX_DEPTH) * 0.4;
  
  const phi = (90.0 - lat) * (Math.PI / 180.0);
  const theta = (lon + 180.0) * (Math.PI / 180.0);

  const x = -(r * Math.sin(phi) * Math.cos(theta));
  const z = r * Math.sin(phi) * Math.sin(theta);
  const y = r * Math.cos(phi);

  return [x, y, z];
}
