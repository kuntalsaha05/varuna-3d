export const DEFAULT_LAT_BOUNDS: [number, number] = [-29.5, 29.5];
export const DEFAULT_LON_BOUNDS: [number, number] = [30.5, 119.5];
export const MAX_DEPTH = 2000.0;
export const SCENE_WIDTH_X = 50.0;  // Longitude extent in 3D
export const SCENE_DEPTH_Z = 34.0;  // Latitude extent in 3D

export function geoTo3D(
  lat: number,
  lon: number,
  depth: number = 0,
  exaggeration: number = 30,
  latBounds: [number, number] = DEFAULT_LAT_BOUNDS,
  lonBounds: [number, number] = DEFAULT_LON_BOUNDS
): [number, number, number] {
  const normX = (lon - lonBounds[0]) / (lonBounds[1] - lonBounds[0]);
  const normZ = (lat - latBounds[0]) / (latBounds[1] - latBounds[0]);

  const x = (normX - 0.5) * SCENE_WIDTH_X;
  const z = -(normZ - 0.5) * SCENE_DEPTH_Z;
  const y = -(Math.min(depth, MAX_DEPTH) / MAX_DEPTH) * (exaggeration / 3.0);

  return [x, y, z];
}

export function threeDtoGeo(
  x: number,
  z: number,
  latBounds: [number, number] = DEFAULT_LAT_BOUNDS,
  lonBounds: [number, number] = DEFAULT_LON_BOUNDS
): [number, number] {
  const normX = x / SCENE_WIDTH_X + 0.5;
  const normZ = -z / SCENE_DEPTH_Z + 0.5;

  const lon = lonBounds[0] + normX * (lonBounds[1] - lonBounds[0]);
  const lat = latBounds[0] + normZ * (latBounds[1] - latBounds[0]);

  return [lat, lon];
}

