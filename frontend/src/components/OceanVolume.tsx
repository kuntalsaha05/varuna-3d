import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import axios from 'axios';
import { useStore, VOLUMETRIC_REGIONS } from '../state/store';
import { getColorRamp } from '../utils/colormaps';

interface LiveFloatMarker {
  PLATFORM_NUMBER: number;
  latitude: number;
  longitude: number;
  time: string;
}

export const OceanVolume: React.FC = () => {
  const {
    volumetricRegion,
    activeVariable,
    selectedDepth,
    setSelectedDepth,
    timeIndex,
    verticalExaggeration,
    setVerticalExaggeration,
    colorPalette,
    layerOpacity,
    selectedFloatId,
    setSelectedFloatId
  } = useStore();

  const [sliceData, setSliceData] = useState<any>(null);
  const [allFloats, setAllFloats] = useState<LiveFloatMarker[]>([]);

  const regionConfig = VOLUMETRIC_REGIONS[volumetricRegion] || VOLUMETRIC_REGIONS.bay_of_bengal;

  // 1. Fetch Depth Slice Data
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

  // 2. Fetch All Real-Time Argo Floats
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/observations/floats?limit=1000')
      .then(res => {
        if (res.data && res.data.floats) {
          setAllFloats(res.data.floats);
        }
      })
      .catch(console.error);
  }, []);

  // Filter Floats for Current Volumetric Region Box
  const regionFloats = useMemo(() => {
    if (volumetricRegion === 'all') {
      return allFloats;
    }

    const matched = allFloats.filter(
      f => f.latitude >= regionConfig.minLat &&
           f.latitude <= regionConfig.maxLat &&
           f.longitude >= regionConfig.minLon &&
           f.longitude <= regionConfig.maxLon
    );

    if (matched.length > 0) {
      return matched;
    }

    return allFloats;
  }, [allFloats, regionConfig, volumetricRegion]);

  // Height & Geometry dimensions for Box View
  const BOX_WIDTH = 36;
  const BOX_DEPTH = 28;
  const boxHeight = Math.max(14, (verticalExaggeration / 40.0) * 18);
  const depthY = -(selectedDepth / 2000.0) * boxHeight;

  // Active Slice Texture
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
          data[idx + 3] = 40;
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

  // High-Resolution Procedural Thermal Cutaway Face Texture with White Wavy Isotherms
  const cutawayTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Vertical Ocean Thermal Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.00, '#e63946');
    grad.addColorStop(0.12, '#f77f00');
    grad.addColorStop(0.24, '#fcbf49');
    grad.addColorStop(0.40, '#06d6a0');
    grad.addColorStop(0.60, '#118ab2');
    grad.addColorStop(0.85, '#073b4c');
    grad.addColorStop(1.00, '#03162a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // White Isotherm Contour Lines traversing across the cutaway face
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2.5;

    const isothermDepths = [35, 75, 125, 190, 270, 360, 440];
    isothermDepths.forEach((baseY, idx) => {
      ctx.beginPath();
      for (let x = 0; x <= 1024; x += 10) {
        const wave = Math.sin(x * 0.008 + idx * 0.7) * 14 + Math.cos(x * 0.016) * 6;
        const y = baseY + wave;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.2;
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Top Face Satellite Coastline Map customized per Region
  const topFaceTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#05192d';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = '#1b4332';

    if (volumetricRegion === 'bay_of_bengal') {
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(160, 0); ctx.lineTo(140, 120); ctx.lineTo(100, 240); ctx.lineTo(80, 360); ctx.lineTo(40, 480); ctx.lineTo(0, 512);
      ctx.closePath(); ctx.fill();

      ctx.beginPath();
      ctx.moveTo(512, 0); ctx.lineTo(420, 0); ctx.lineTo(440, 180); ctx.lineTo(460, 320); ctx.lineTo(490, 440); ctx.lineTo(512, 512);
      ctx.closePath(); ctx.fill();
    } else if (volumetricRegion === 'arabian_sea') {
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(140, 0); ctx.lineTo(160, 140); ctx.lineTo(120, 280); ctx.lineTo(80, 420); ctx.lineTo(0, 512);
      ctx.closePath(); ctx.fill();

      ctx.beginPath();
      ctx.moveTo(512, 0); ctx.lineTo(380, 0); ctx.lineTo(390, 120); ctx.lineTo(420, 260); ctx.lineTo(450, 420); ctx.lineTo(512, 512);
      ctx.closePath(); ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(60, 60, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(460, 440, 35, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(0, 245, 212, 0.25)';
    ctx.lineWidth = 1;
    for (let i = 100; i < 512; i += 100) {
      ctx.beginPath();
      ctx.moveTo(i, 0); ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i); ctx.lineTo(512, i);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [volumetricRegion]);

  // 3D Rugged Bathymetric Seabed Geometry
  const seabedGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(BOX_WIDTH, BOX_DEPTH, 32, 32);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const ridge = Math.sin(x * 0.3) * 1.5 + Math.cos(y * 0.4) * 1.2 + Math.sin(x * 0.8 + y * 0.6) * 0.8;
      pos.setZ(i, ridge);
    }
    geo.computeVertexNormals();
    return geo;
  }, [BOX_WIDTH, BOX_DEPTH]);

  const beadDepths = [5, 50, 100, 250, 500, 1000, 1500, 2000];

  return (
    <group>
      {/* Front Cutaway Vertical Face */}
      {cutawayTexture && (
        <mesh position={[0, -boxHeight / 2, BOX_DEPTH / 2]}>
          <planeGeometry args={[BOX_WIDTH, boxHeight]} />
          <meshStandardMaterial
            map={cutawayTexture}
            side={THREE.DoubleSide}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Right Cutaway Vertical Face */}
      {cutawayTexture && (
        <mesh position={[BOX_WIDTH / 2, -boxHeight / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[BOX_DEPTH, boxHeight]} />
          <meshStandardMaterial
            map={cutawayTexture}
            side={THREE.DoubleSide}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Back & Left Frosted Glass Boundary Walls */}
      <mesh position={[0, -boxHeight / 2, -BOX_DEPTH / 2]}>
        <planeGeometry args={[BOX_WIDTH, boxHeight]} />
        <meshStandardMaterial color="#021428" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-BOX_WIDTH / 2, -boxHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[BOX_DEPTH, boxHeight]} />
        <meshStandardMaterial color="#021428" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Top Surface Map */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[BOX_WIDTH, BOX_DEPTH]} />
        <meshStandardMaterial map={topFaceTexture} roughness={0.4} metalness={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Active Target Depth Slice Plane */}
      {texture && selectedDepth > 10 && (
        <group position={[0, depthY, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[BOX_WIDTH, BOX_DEPTH]} />
            <meshStandardMaterial map={texture} transparent opacity={layerOpacity} side={THREE.DoubleSide} />
          </mesh>
          <lineSegments>
            <edgesGeometry attach="geometry" args={[new THREE.PlaneGeometry(BOX_WIDTH, BOX_DEPTH)]} />
            <lineBasicMaterial attach="material" color="#00f5d4" linewidth={2} />
          </lineSegments>
        </group>
      )}

      {/* Seafloor */}
      <mesh geometry={seabedGeometry} position={[0, -boxHeight, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#03162a" roughness={0.9} metalness={0.2} wireframe={false} />
      </mesh>
      <mesh geometry={seabedGeometry} position={[0, -boxHeight + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#00f5d4" wireframe transparent opacity={0.15} />
      </mesh>

      {/* 4. REAL-TIME IN-SITU ARGO FLOATS */}
      {regionFloats.map((st) => {
        const lonSpan = regionConfig.maxLon - regionConfig.minLon || 15;
        const latSpan = regionConfig.maxLat - regionConfig.minLat || 14;

        const x = Math.max(-BOX_WIDTH / 2 + 2, Math.min(BOX_WIDTH / 2 - 2, ((st.longitude - regionConfig.minLon) / lonSpan - 0.5) * BOX_WIDTH));
        const z = Math.max(-BOX_DEPTH / 2 + 2, Math.min(BOX_DEPTH / 2 - 2, -((st.latitude - regionConfig.minLat) / latSpan - 0.5) * BOX_DEPTH));
        const isSelected = selectedFloatId === st.PLATFORM_NUMBER;

        return (
          <group key={st.PLATFORM_NUMBER} position={[x, 0, z]}>
            <lineSegments>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={2} array={new Float32Array([0, 0, 0, 0, -boxHeight, 0])} itemSize={3} />
              </bufferGeometry>
              <lineDashedMaterial color="#ffffff" dashSize={0.4} gapSize={0.2} linewidth={1.5} />
            </lineSegments>

            <mesh
              position={[0, 0.45, 0]}
              onClick={(e) => { e.stopPropagation(); setSelectedFloatId(st.PLATFORM_NUMBER); }}
              onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { document.body.style.cursor = 'auto'; }}
            >
              <cylinderGeometry args={[0.32, 0.32, 0.6, 14]} />
              <meshStandardMaterial
                color={isSelected ? '#00f5d4' : '#fbbf24'}
                emissive={isSelected ? '#00bbf9' : '#f59e0b'}
                emissiveIntensity={isSelected ? 1.6 : 0.8}
              />
            </mesh>

            <mesh position={[0, 0.95, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>

            {isSelected && (
              <Html position={[0, 1.4, 0]} center distanceFactor={28}>
                <div className="px-2 py-0.5 rounded-md bg-slate-950/95 border border-cyan-400 text-[10px] font-mono font-bold text-cyan-300 shadow-xl whitespace-nowrap pointer-events-none">
                  Argo #{st.PLATFORM_NUMBER}
                </div>
              </Html>
            )}

            {beadDepths.map((d) => {
              const y = -(d / 2000.0) * boxHeight;
              const ratio = d / 2000.0;
              const color = ratio < 0.05 ? '#ef4444' : ratio < 0.15 ? '#f97316' : ratio < 0.3 ? '#eab308' : ratio < 0.6 ? '#06b6d4' : '#3b82f6';

              return (
                <group key={d} position={[0, y, 0]}>
                  <mesh
                    onClick={(e) => { e.stopPropagation(); setSelectedFloatId(st.PLATFORM_NUMBER); setSelectedDepth(d); }}
                    onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
                    onPointerOut={() => { document.body.style.cursor = 'auto'; }}
                  >
                    <sphereGeometry args={[0.26, 14, 14]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} roughness={0.2} />
                  </mesh>
                </group>
              );
            })}
          </group>
        );
      })}

      {regionConfig.latLabels.map((item, idx) => (
        <Html key={idx} position={[item.offset, 0.6, -BOX_DEPTH / 2 - 0.8]} center distanceFactor={32}>
          <span className="font-mono text-[11px] font-bold text-slate-300 select-none pointer-events-none">{item.label}</span>
        </Html>
      ))}

      <Html position={[BOX_WIDTH / 2 + 1.2, 0.6, regionConfig.lonLabel.offset]} center distanceFactor={32}>
        <span className="font-mono text-[11px] font-bold text-cyan-400 select-none pointer-events-none">{regionConfig.lonLabel.label}</span>
      </Html>

      {[0, 500, 1000, 1500, 2000].map((d) => {
        const y = -(d / 2000.0) * boxHeight;
        return (
          <group key={d} position={[-BOX_WIDTH / 2 - 1.2, y, BOX_DEPTH / 2]}>
            <Html center distanceFactor={32}>
              <span className="font-mono text-[10px] font-bold text-slate-300 select-none pointer-events-none">{d === 0 ? '0' : `${d}`}</span>
            </Html>
          </group>
        );
      })}

      <Html position={[-BOX_WIDTH / 2 - 3.2, -boxHeight / 2, BOX_DEPTH / 2]} center distanceFactor={32}>
        <span className="font-mono text-[10px] font-bold text-slate-400 -rotate-90 block select-none pointer-events-none whitespace-nowrap">Depth (m)</span>
      </Html>

      <group position={[BOX_WIDTH / 2 + 2.5, -boxHeight / 2, BOX_DEPTH / 2 - 2]}>
        <Html center distanceFactor={30}>
          <div className="flex flex-col items-center bg-slate-950/90 border border-slate-800/90 p-2 rounded-xl backdrop-blur-md shadow-2xl select-none pointer-events-none">
            <span className="text-[10px] font-bold text-slate-300 mb-1.5 whitespace-nowrap text-center">Temperature<br />(°C)</span>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-32 rounded-full border border-slate-700/80 shadow-inner" style={{ background: 'linear-gradient(to bottom, #e63946, #f77f00, #fcbf49, #06d6a0, #118ab2, #073b4c, #03162a)' }} />
              <div className="flex flex-col justify-between h-32 text-[9px] font-mono text-slate-300 font-bold"><span>30</span><span>20</span><span>10</span><span>0</span></div>
            </div>
          </div>
        </Html>
      </group>

      <group position={[0, -boxHeight - 2.5, BOX_DEPTH / 2]}>
        <Html center distanceFactor={28}>
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-950/95 border border-cyan-500/40 shadow-2xl backdrop-blur-xl pointer-events-auto select-none whitespace-nowrap">
            <span className="text-xs font-bold text-slate-200">Vertical Exaggeration</span>
            <input
              type="range"
              min="5"
              max="80"
              step="5"
              value={verticalExaggeration}
              onChange={(e) => setVerticalExaggeration(Number(e.target.value))}
              className="w-32 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="font-mono text-xs font-bold text-cyan-300 w-8">
              {verticalExaggeration}x
            </span>
          </div>
        </Html>
      </group>
    </group>
  );
};

