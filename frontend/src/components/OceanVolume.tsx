import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { useStore } from '../state/store';
import { interpolateColor } from '../utils/colorScales';
import { SCENE_WIDTH_X, SCENE_DEPTH_Z, MAX_DEPTH } from '../utils/coordinates';

export const OceanVolume: React.FC = () => {
  const {
    activeDataset,
    activeVariable,
    selectedDepth,
    timeIndex,
    verticalExaggeration,
    colorPalette,
    paletteMin,
    paletteMax,
    setCurrentTimeStr,
    showIsoSurfaces
  } = useStore();

  const [sliceData, setSliceData] = useState<any>(null);
  const [surfaceSlice, setSurfaceSlice] = useState<any>(null);

  // Fetch target depth slice
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/slice/depth', {
      params: {
        dataset_type: activeDataset,
        depth: selectedDepth,
        time_index: timeIndex,
        variable: activeVariable
      }
    }).then(res => {
      setSliceData(res.data);
      if (res.data.time_str) {
        setCurrentTimeStr(res.data.time_str);
      }
    }).catch(console.error);
  }, [activeDataset, activeVariable, selectedDepth, timeIndex, setCurrentTimeStr]);

  // Fetch surface slice for reference when viewing subsurface depth
  useEffect(() => {
    if (selectedDepth > 50 && showIsoSurfaces) {
      axios.get('http://127.0.0.1:8000/api/v1/slice/depth', {
        params: {
          dataset_type: activeDataset,
          depth: 5.0,
          time_index: timeIndex,
          variable: activeVariable
        }
      }).then(res => setSurfaceSlice(res.data)).catch(console.error);
    } else {
      setSurfaceSlice(null);
    }
  }, [activeDataset, activeVariable, selectedDepth, timeIndex, showIsoSurfaces]);

  const generateTexture = (gridData: any) => {
    if (!gridData || !gridData.grid || gridData.grid.length === 0) return null;

    const rows = gridData.grid.length;
    const cols = gridData.grid[0].length;
    const size = rows * cols;
    const data = new Uint8Array(4 * size);

    const minV = paletteMin !== null ? paletteMin : (gridData.min_val ?? 10);
    const maxV = paletteMax !== null ? paletteMax : (gridData.max_val ?? 30);
    const range = maxV - minV || 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Texture coordinate flip: WebGL texture (0,0) at bottom-left
        const val = gridData.grid[rows - 1 - r][c];
        const idx = (r * cols + c) * 4;

        if (val === null || val === undefined) {
          // Land / mask pixel: subtle dark slate
          data[idx] = 10;
          data[idx + 1] = 18;
          data[idx + 2] = 30;
          data[idx + 3] = 40;
        } else {
          const norm = Math.max(0, Math.min(1, (val - minV) / range));
          const [red, green, blue] = interpolateColor(colorPalette, norm);
          data[idx] = red;
          data[idx + 1] = green;
          data[idx + 2] = blue;
          data[idx + 3] = 235;
        }
      }
    }

    const tex = new THREE.DataTexture(data, cols, rows, THREE.RGBAFormat);
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  };

  const mainTexture = useMemo(() => generateTexture(sliceData), [sliceData, colorPalette, paletteMin, paletteMax]);
  const surfaceTexture = useMemo(() => generateTexture(surfaceSlice), [surfaceSlice, colorPalette, paletteMin, paletteMax]);

  const depthY = -(Math.min(selectedDepth, MAX_DEPTH) / MAX_DEPTH) * (verticalExaggeration / 3.0);
  const totalVolumeHeight = verticalExaggeration / 3.0;

  return (
    <group>
      {/* 3D Ocean Bounding Box Frame */}
      <mesh position={[0, -(totalVolumeHeight / 2.0), 0]}>
        <boxGeometry args={[SCENE_WIDTH_X, totalVolumeHeight, SCENE_DEPTH_Z]} />
        <meshBasicMaterial color="#0284c7" wireframe opacity={0.12} transparent />
      </mesh>

      {/* Surface Reference Plane (Water Surface at Y = 0) */}
      {selectedDepth > 50 && surfaceTexture && (
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[SCENE_WIDTH_X, SCENE_DEPTH_Z]} />
          <meshStandardMaterial
            map={surfaceTexture}
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Primary Dynamic Depth Slice Plane */}
      {mainTexture && (
        <mesh position={[0, depthY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[SCENE_WIDTH_X, SCENE_DEPTH_Z]} />
          <meshStandardMaterial
            map={mainTexture}
            transparent
            opacity={0.92}
            side={THREE.DoubleSide}
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Slice Outline Ring Indicator */}
      <mesh position={[0, depthY, 0]}>
        <boxGeometry args={[SCENE_WIDTH_X + 0.1, 0.05, SCENE_DEPTH_Z + 0.1]} />
        <meshBasicMaterial color="#38bdf8" wireframe opacity={0.5} transparent />
      </mesh>
    </group>
  );
};

