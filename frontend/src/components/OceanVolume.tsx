import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import axios from 'axios';
import { useStore } from '../state/store';
import { getColorRamp } from '../utils/colormaps';

export const OceanVolume: React.FC = () => {
  const { activeVariable, selectedDepth, timeIndex, verticalExaggeration, colorPalette, layerOpacity } = useStore();
  const [sliceData, setSliceData] = useState<any>(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/slice/depth', {
      params: { depth: selectedDepth, time_index: timeIndex, variable: activeVariable }
    }).then(res => {
      setSliceData(res.data);
      if (res.data.min_val !== undefined && res.data.max_val !== undefined) {
        useStore.getState().setRangeVals(res.data.min_val, res.data.max_val);
      }
    }).catch(console.error);
  }, [activeVariable, selectedDepth, timeIndex]);

  const texture = useMemo(() => {
    if (!sliceData || !sliceData.grid) return null;

    const rows = sliceData.grid.length;
    const cols = sliceData.grid[0].length;
    const size = rows * cols;
    const data = new Uint8Array(4 * size);

    const minV = sliceData.min_val ?? 10;
    const maxV = sliceData.max_val ?? 32;
    const range = maxV - minV || 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = sliceData.grid[r][c];
        const idx = (r * cols + c) * 4;

        if (val === null || val === undefined) {
          data[idx] = 8;
          data[idx + 1] = 16;
          data[idx + 2] = 28;
          data[idx + 3] = 30;
        } else {
          const norm = Math.max(0, Math.min(1, (val - minV) / range));
          const [red, green, blue] = getColorRamp(norm, colorPalette);
          data[idx] = red;
          data[idx + 1] = green;
          data[idx + 2] = blue;
          data[idx + 3] = Math.floor(255 * layerOpacity);
        }
      }
    }

    const tex = new THREE.DataTexture(data, cols, rows, THREE.RGBAFormat);
    tex.needsUpdate = true;
    return tex;
  }, [sliceData, colorPalette, layerOpacity]);

  const boxHeight = verticalExaggeration / 2.2;
  const depthY = -(selectedDepth / 2000.0) * boxHeight;

  // Depth ruler benchmark ticks (meters)
  const depthTicks = [
    { d: 5, label: '0m Surface' },
    { d: 50, label: '-50m Mixed Layer' },
    { d: 150, label: '-150m Thermocline' },
    { d: 500, label: '-500m Mesopelagic' },
    { d: 1000, label: '-1000m Bathypelagic' },
    { d: 2000, label: '-2000m Abyssal Bed' }
  ];

  return (
    <group>
      {/* 1. Volumetric Glass Tank Outer Frame */}
      <mesh position={[0, -boxHeight / 2, 0]}>
        <boxGeometry args={[42, boxHeight, 32]} />
        <meshBasicMaterial color='#0284c7' wireframe opacity={0.25} transparent />
      </mesh>

      {/* 2. Semi-Transparent Frosted Back & Side Water Column Walls */}
      <mesh position={[0, -boxHeight / 2, -16]}>
        <planeGeometry args={[42, boxHeight]} />
        <meshStandardMaterial
          color='#021b36'
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[-21, -boxHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[32, boxHeight]} />
        <meshStandardMaterial
          color='#021b36'
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          roughness={0.4}
        />
      </mesh>

      {/* 3. High-Fidelity Bathymetric Seabed with Continental Slope Relief */}
      <mesh position={[0, -boxHeight, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[42, 32, 24, 24]} />
        <meshStandardMaterial
          color='#071626'
          roughness={0.85}
          metalness={0.2}
          wireframe={false}
        />
      </mesh>

      {/* 4. Active Target Depth Slice Plane */}
      {texture && (
        <group position={[0, depthY, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[42, 32]} />
            <meshStandardMaterial
              map={texture}
              transparent
              opacity={layerOpacity}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Luminous Active Elevation Boundary Ring */}
          <lineSegments>
            <edgesGeometry attach="geometry" args={[new THREE.PlaneGeometry(42, 32)]} />
            <lineBasicMaterial attach="material" color="#00f5d4" linewidth={2.5} />
          </lineSegments>
        </group>
      )}

      {/* 5. 3D Depth Axis Ruler Markings & Callout Tags */}
      {depthTicks.map((tick) => {
        const yPos = -(tick.d / 2000.0) * boxHeight;
        return (
          <group key={tick.d} position={[-21.2, yPos, -16]}>
            {/* Horizontal tick mark */}
            <mesh position={[0.6, 0, 0]}>
              <boxGeometry args={[1.2, 0.08, 0.08]} />
              <meshBasicMaterial color={tick.d === selectedDepth ? '#00f5d4' : '#0284c7'} />
            </mesh>

            {/* 3D Depth Badge */}
            <Html position={[-0.5, 0, 0]} distanceFactor={28} center>
              <div className={`px-2 py-0.5 rounded text-[9px] font-mono whitespace-nowrap select-none border transition-all ${
                Math.abs(tick.d - selectedDepth) < 30
                  ? 'bg-cyan-950 text-cyan-300 font-bold border-cyan-400 shadow-md shadow-cyan-500/40 scale-110'
                  : 'bg-slate-950/80 text-slate-400 border-slate-800'
              }`}>
                {tick.label}
              </div>
            </Html>
          </group>
        );
      })}

      {/* 6. Axis Labels: Longitude & Latitude Corner Tags */}
      <Html position={[0, 0.5, 16.5]} center distanceFactor={30}>
        <div className="px-2.5 py-0.5 rounded-full bg-slate-950/90 text-cyan-400 border border-cyan-700/60 text-[10px] font-mono font-bold tracking-wider pointer-events-none">
          LONGITUDE TRANSECT: 65°E ─── 90°E (Arabian Sea to Bay of Bengal)
        </div>
      </Html>

      <Html position={[21.5, 0.5, 0]} center distanceFactor={30}>
        <div className="px-2.5 py-0.5 rounded-full bg-slate-950/90 text-sky-400 border border-sky-700/60 text-[10px] font-mono font-bold tracking-wider pointer-events-none">
          LATITUDE TRANSECT: 5°N ─── 25°N (Equator to Coast)
        </div>
      </Html>
    </group>
  );
};

