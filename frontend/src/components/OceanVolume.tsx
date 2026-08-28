import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { useStore } from '../state/store';

export const OceanVolume: React.FC = () => {
  const { activeVariable, selectedDepth, timeIndex, verticalExaggeration } = useStore();
  const [sliceData, setSliceData] = useState<any>(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/slice/depth', {
      params: { depth: selectedDepth, time_index: timeIndex, variable: activeVariable }
    }).then(res => setSliceData(res.data)).catch(console.error);
  }, [activeVariable, selectedDepth, timeIndex]);

  const texture = useMemo(() => {
    if (!sliceData || !sliceData.grid) return null;

    const rows = sliceData.grid.length;
    const cols = sliceData.grid[0].length;
    const size = rows * cols;
    const data = new Uint8Array(4 * size);

    const minV = sliceData.min_val ?? 10;
    const maxV = sliceData.max_val ?? 30;
    const range = maxV - minV || 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = sliceData.grid[r][c];
        const idx = (r * cols + c) * 4;

        if (val === null || val === undefined) {
          data[idx] = 15;
          data[idx + 1] = 23;
          data[idx + 2] = 42;
          data[idx + 3] = 40;
        } else {
          const norm = Math.max(0, Math.min(1, (val - minV) / range));
          data[idx] = Math.floor(norm * 255);
          data[idx + 1] = Math.floor((1 - Math.abs(norm - 0.5) * 2) * 220);
          data[idx + 2] = Math.floor((1 - norm) * 255);
          data[idx + 3] = 230;
        }
      }
    }

    const tex = new THREE.DataTexture(data, cols, rows, THREE.RGBAFormat);
    tex.needsUpdate = true;
    return tex;
  }, [sliceData]);

  const depthY = -(selectedDepth / 2000) * (verticalExaggeration / 3);

  return (
    <group>
      {/* 3D Ocean Bounding Box Wireframe */}
      <mesh position={[0, -(verticalExaggeration / 6), 0]}>
        <boxGeometry args={[40, verticalExaggeration / 3, 30]} />
        <meshBasicMaterial color="#00f5d4" wireframe opacity={0.15} transparent />
      </mesh>

      {/* Dynamic Depth Slice Plane */}
      {texture && (
        <mesh position={[0, depthY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[40, 30]} />
          <meshStandardMaterial
            map={texture}
            transparent
            opacity={0.88}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};
