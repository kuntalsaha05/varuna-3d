import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { useStore } from '../state/store';
import { SCENE_WIDTH_X, SCENE_DEPTH_Z, MAX_DEPTH } from '../utils/coordinates';

export const BathymetryFloor: React.FC = () => {
  const { showBathymetry, verticalExaggeration } = useStore();
  const [bathyData, setBathyData] = useState<{
    lats: number[];
    lons: number[];
    elevation: number[][];
    min_elevation: number;
    max_elevation: number;
  } | null>(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/bathymetry/grid?res_lat=50&res_lon=70')
      .then(res => setBathyData(res.data))
      .catch(console.error);
  }, []);

  const geometry = useMemo(() => {
    if (!bathyData || !bathyData.elevation) return null;

    const rows = bathyData.lats.length;
    const cols = bathyData.lons.length;
    const geom = new THREE.PlaneGeometry(SCENE_WIDTH_X, SCENE_DEPTH_Z, cols - 1, rows - 1);
    
    // Rotate to lie horizontally (XZ plane)
    geom.rotateX(-Math.PI / 2);

    const pos = geom.attributes.position;
    const colors: number[] = [];

    // Elevation scaling factor
    const depthScale = (verticalExaggeration / 3.0) / MAX_DEPTH;

    for (let i = 0; i < pos.count; i++) {
      const colIdx = i % cols;
      const rowIdx = Math.floor(i / cols);

      // Note: Row 0 in meshgrid corresponds to lat min (south), plane goes from top to bottom
      const elev = bathyData.elevation[rows - 1 - rowIdx]?.[colIdx] ?? -4000;
      
      // Compute Y height
      if (elev >= 0) {
        pos.setY(i, 0.2); // Land slightly above sea level
        // Land color (dark slate-emerald)
        colors.push(0.08, 0.18, 0.15);
      } else {
        // Ocean floor depth clamped to MAX_DEPTH for rendering
        const clampedElev = Math.max(-MAX_DEPTH, elev);
        pos.setY(i, clampedElev * depthScale);

        // Depth-based bathymetric color
        const depthNorm = Math.min(1.0, Math.abs(elev) / 4500.0);
        if (depthNorm < 0.2) {
          // Shallow shelf (teal/cyan)
          colors.push(0.05, 0.35, 0.45);
        } else if (depthNorm < 0.6) {
          // Oceanic ridge / slope (deep ocean blue)
          colors.push(0.03, 0.15, 0.35);
        } else {
          // Abyssal deep (midnight navy)
          colors.push(0.01, 0.05, 0.15);
        }
      }
    }

    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.computeVertexNormals();
    return geom;
  }, [bathyData, verticalExaggeration]);

  if (!showBathymetry || !geometry) return null;

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          vertexColors
          roughness={0.8}
          metalness={0.1}
          wireframe={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Subtle bathymetric wireframe grid for depth contours */}
      <mesh geometry={geometry} position={[0, 0.02, 0]}>
        <meshBasicMaterial
          color="#06b6d4"
          wireframe
          transparent
          opacity={0.07}
        />
      </mesh>
    </group>
  );
};

