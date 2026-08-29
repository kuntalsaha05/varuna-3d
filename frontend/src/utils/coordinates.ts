export const LAT_BOUNDS = [5.0, 25.0];
export const LON_BOUNDS = [65.0, 90.0];
export const MAX_DEPTH = 2000.0;

export function geoTo3D(lat: number, lon: number, depth: number = 0, exaggeration: number = 30): [number, number, number] {
  const x = ((lon - LON_BOUNDS[0]) / (LON_BOUNDS[1] - LON_BOUNDS[0]) - 0.5) * 40;
  const z = -((lat - LAT_BOUNDS[0]) / (LAT_BOUNDS[1] - LAT_BOUNDS[0]) - 0.5) * 30;
  const y = -(depth / MAX_DEPTH) * (exaggeration / 3);
  return [x, y, z];
}
