import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import axios from 'axios';
import { useStore } from '../state/store';
import { geoTo3D, geoToSpherical, EARTH_RADIUS } from '../utils/coordinates';
import { Anchor, Navigation, Radio } from 'lucide-react';

interface FloatMarkerData {
  PLATFORM_NUMBER: number;
  latitude: number;
  longitude: number;
  time: string;
}

export const FloatMarkers: React.FC = () => {
  const [floats, setFloats] = useState<FloatMarkerData[]>([]);
  const {
    viewMode,
    verticalExaggeration,
    selectedFloatId,
    setSelectedFloatId,
    setHoveredCoords,
    showModalExpanded,
    showWarningModal,
    showHelpModal
  } = useStore();
  
  const pulseRingsRef = useRef<THREE.Group>(null);
  const markersGroupRef = useRef<THREE.Group>(null);
  const anyModalOpen = showModalExpanded || showWarningModal || showHelpModal;

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/observations/floats?limit=350')
      .then(res => setFloats(res.data.floats))
      .catch(console.error);
  }, []);

  // Dynamic Camera-Distance Zoom Adaptive Scaling
  useFrame(({ camera, clock }) => {
    const camDist = camera.position.length();
    const zoomScale = Math.max(0.4, Math.min(2.8, Math.pow(camDist / 42.0, 0.85)));
    const pulse = 1.0 + (Math.sin(clock.getElapsedTime() * 3.5) + 1.0) * 0.35;

    if (markersGroupRef.current) {
      markersGroupRef.current.children.forEach((child: any) => {
        const isSelected = child.userData?.isSelected;
        const baseScale = isSelected ? 1.75 : 1.0;
        const finalScale = baseScale * zoomScale;
        child.scale.set(finalScale, finalScale, finalScale);
      });
    }

    if (pulseRingsRef.current) {
      pulseRingsRef.current.children.forEach((child: any) => {
        const ringScale = zoomScale * pulse;
        child.scale.set(ringScale, ringScale, ringScale);
      });
    }
  });

  // Highlighted Argo Float #6902903 from proposal slide
  const targetWmo = 6902903;

  return (
    <group>
      {/* 1. Pulsing Outer Rings */}
      <group ref={pulseRingsRef}>
        {floats.map((f) => {
          let pos: [number, number, number];
          if (viewMode === 'globe' || viewMode === 'split') {
            pos = geoToSpherical(f.latitude, f.longitude, EARTH_RADIUS + 0.25);
          } else {
            pos = geoTo3D(f.latitude, f.longitude, 0, verticalExaggeration);
            pos[1] += 0.4;
          }

          return (
            <mesh key={`ring-${f.PLATFORM_NUMBER}`} position={pos}>
              <ringGeometry args={[0.25, 0.42, 16]} />
              <meshBasicMaterial
                color='#ffb703'
                transparent
                opacity={0.45}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
      </group>

      {/* 2. Float Markers with Zoom-Adaptive Sizing & Badges */}
      <group ref={markersGroupRef}>
        {floats.map((f) => {
          let pos: [number, number, number];
          if (viewMode === 'globe' || viewMode === 'split') {
            pos = geoToSpherical(f.latitude, f.longitude, EARTH_RADIUS + 0.25);
          } else {
            pos = geoTo3D(f.latitude, f.longitude, 0, verticalExaggeration);
            pos[1] += 0.4;
          }

          const isSelected = selectedFloatId === f.PLATFORM_NUMBER;
          const isFeatured = f.PLATFORM_NUMBER === targetWmo || isSelected;

          return (
            <group
              key={f.PLATFORM_NUMBER}
              position={pos}
              userData={{ isSelected, platformNumber: f.PLATFORM_NUMBER }}
            >
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFloatId(f.PLATFORM_NUMBER);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  document.body.style.cursor = 'pointer';
                  setHoveredCoords({ lat: f.latitude, lon: f.longitude });
                }}
                onPointerOut={() => {
                  document.body.style.cursor = 'auto';
                  setHoveredCoords(null);
                }}
              >
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial
                  color={isSelected ? '#00f5d4' : (f.PLATFORM_NUMBER === targetWmo ? '#fbbf24' : '#ffb703')}
                  emissive={isSelected ? '#00bbf9' : '#fb8500'}
                  emissiveIntensity={isSelected || isFeatured ? 1.8 : 0.85}
                  roughness={0.2}
                />
              </mesh>

              {/* Proposal Prototype Pin Badge for Featured / Selected Float */}
              {isFeatured && !anyModalOpen && (
                <Html position={[0, 0.9, 0]} center distanceFactor={28}>
                  <div
                    onClick={() => setSelectedFloatId(f.PLATFORM_NUMBER)}
                    className="cursor-pointer select-none px-2.5 py-1 rounded-xl bg-slate-950/95 border border-amber-400 shadow-xl text-[10px] font-bold text-amber-300 flex items-center gap-1.5 whitespace-nowrap transition-transform hover:scale-110"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                    <span>Argo Float #{f.PLATFORM_NUMBER}</span>
                  </div>
                </Html>
              )}
            </group>
          );
        })}
      </group>

      {/* 3. Proposal Prototype Glider & Mooring Buoy Pins on Globe */}
      {(viewMode === 'globe' || viewMode === 'split') && !anyModalOpen && (
        <>
          {/* Glider #SG-120 Badge in Bay of Bengal (14°N, 86°E) */}
          <group position={geoToSpherical(14.0, 86.0, EARTH_RADIUS + 0.35)}>
            <mesh>
              <sphereGeometry args={[0.32, 16, 16]} />
              <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={1.8} />
            </mesh>
            <Html position={[0, 0.8, 0]} center distanceFactor={28}>
              <div className="cursor-pointer select-none px-2.5 py-1 rounded-xl bg-slate-950/95 border border-emerald-400 shadow-xl text-[10px] font-bold text-emerald-300 flex items-center gap-1.5 whitespace-nowrap">
                <Navigation size={12} className="text-emerald-400 rotate-45" />
                <span>Glider #SG-120</span>
              </div>
            </Html>
          </group>

          {/* Mooring Buoy #MB-04 Badge in Arabian Sea (16.5°N, 68°E) */}
          <group position={geoToSpherical(16.5, 68.0, EARTH_RADIUS + 0.35)}>
            <mesh>
              <sphereGeometry args={[0.32, 16, 16]} />
              <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={1.8} />
            </mesh>
            <Html position={[0, 0.8, 0]} center distanceFactor={28}>
              <div className="cursor-pointer select-none px-2.5 py-1 rounded-xl bg-slate-950/95 border border-rose-400 shadow-xl text-[10px] font-bold text-rose-300 flex items-center gap-1.5 whitespace-nowrap">
                <Radio size={12} className="text-rose-400" />
                <span>Mooring Buoy #MB-04</span>
              </div>
            </Html>
          </group>
        </>
      )}
    </group>
  );
};
