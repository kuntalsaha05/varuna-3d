import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useStore, VOLUMETRIC_REGIONS, VolumetricRegionKey } from '../state/store';
import { EarthGlobe } from './EarthGlobe';
import { OceanVolume } from './OceanVolume';
import { FloatMarkers } from './FloatMarkers';
import { CurrentVectorField } from './CurrentVectorField';
import { SarDriftLayer } from './SarDriftLayer';
import { GliderSawtooth } from './GliderSawtooth';
import { AiAnomalyLayer } from './AiAnomalyLayer';
import { FloatingLayerManager } from './FloatingLayerManager';
import { FloatingBottomDock } from './FloatingBottomDock';
import { Compass, Plus, Minus, Maximize2, Minimize2 } from 'lucide-react';

const GlobeCameraHandler: React.FC = () => {
  const { cameraTarget } = useStore();
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (cameraTarget) {
      camera.position.set(cameraTarget[0], cameraTarget[1], cameraTarget[2]);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
      return;
    }
    camera.position.set(20, 16, 36);
    camera.lookAt(0, 0, 0);
  }, [camera, cameraTarget]);

  return <OrbitControls ref={controlsRef} makeDefault minDistance={12} maxDistance={85} enableDamping dampingFactor={0.05} />;
};

const BoxCameraHandler: React.FC = () => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    camera.position.set(30, 24, 38);
    camera.lookAt(0, -6, 0);
  }, [camera]);

  return <OrbitControls ref={controlsRef} makeDefault minDistance={15} maxDistance={90} enableDamping dampingFactor={0.05} />;
};

export const Viewport3D: React.FC = () => {
  const { viewMode, setViewMode, volumetricRegion, setVolumetricRegion } = useStore();

  return (
    <div className="w-full h-full relative flex overflow-hidden select-none bg-[#01040d]">
      
      {/* ─────────────────────────────────────────────────────────────
          LEFT PANE: 3D DIGITAL TWIN GLOBE VIEW
          ───────────────────────────────────────────────────────────── */}
      {(viewMode === 'split' || viewMode === 'globe') && (
        <div className={`relative h-full transition-all duration-300 ${viewMode === 'split' ? 'w-1/2 border-r border-slate-800/80' : 'w-full'}`}>
          
          {/* Top Pill Banner: 🌐 3D Digital Twin Globe View */}
          <div className="absolute top-20 left-6 z-25 flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-xl border border-cyan-500/50 shadow-2xl text-cyan-300 text-xs font-bold pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
            <span>3D Digital Twin Globe View</span>
            {viewMode === 'split' && (
              <button
                onClick={() => setViewMode('globe')}
                className="ml-2 text-slate-400 hover:text-white transition p-0.5"
                title="Maximize Globe View"
              >
                <Maximize2 size={12} />
              </button>
            )}
          </div>

          {/* Compass Rose & Zoom Controls on Top Right of Globe */}
          <div className="absolute top-20 right-6 z-25 flex flex-col items-center gap-2 pointer-events-auto">
            <div className="w-9 h-9 rounded-full bg-slate-950/90 border border-slate-800 shadow-xl flex items-center justify-center text-cyan-400">
              <Compass size={18} className="animate-pulse" />
            </div>
            <div className="flex flex-col rounded-xl bg-slate-950/90 border border-slate-800 overflow-hidden shadow-xl text-slate-300 text-xs">
              <button className="p-2 hover:bg-slate-900 transition hover:text-white">
                <Plus size={13} />
              </button>
              <div className="h-px bg-slate-800" />
              <button className="p-2 hover:bg-slate-900 transition hover:text-white">
                <Minus size={13} />
              </button>
            </div>
          </div>

          {/* Floating Layer Manager Card */}
          <FloatingLayerManager />

          {/* Floating Bottom Tool Dock */}
          <FloatingBottomDock />

          {/* 3D Canvas for Globe */}
          <Canvas camera={{ position: [20, 16, 36], fov: 45 }} gl={{ antialias: true, alpha: false }}>
            <color attach="background" args={['#01040d']} />
            <ambientLight intensity={1.2} />
            <directionalLight position={[35, 45, 30]} intensity={2.0} castShadow />
            <directionalLight position={[-30, -20, -20]} intensity={0.5} color="#0284c7" />
            <Stars radius={120} depth={60} count={3500} factor={4} saturation={0.2} fade speed={0.8} />

            <Suspense fallback={null}>
              <EarthGlobe />
              <FloatMarkers />
              <CurrentVectorField />
              <GliderSawtooth />
              <SarDriftLayer />
              <AiAnomalyLayer />
            </Suspense>

            <GlobeCameraHandler />
          </Canvas>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          RIGHT PANE: 3D REGIONAL VOLUMETRIC BOX VIEW
          ───────────────────────────────────────────────────────────── */}
      {(viewMode === 'split' || viewMode === 'box') && (
        <div className={`relative h-full transition-all duration-300 ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
          
          {/* Top Pill Banner & Interactive Regional Location Switcher */}
          <div className="absolute top-20 left-6 right-6 z-25 flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-sky-500/40 shadow-2xl pointer-events-auto">
            <div className="flex items-center gap-2 px-2 text-sky-300 text-xs font-bold">
              <span>📦 3D Regional Volumetric Box View</span>
              <span className="text-slate-400 text-[11px] font-normal hidden xl:inline">
                | {VOLUMETRIC_REGIONS[volumetricRegion]?.name} - {VOLUMETRIC_REGIONS[volumetricRegion]?.subtitle}
              </span>
            </div>

            {/* Location Switcher Pills */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              {(Object.keys(VOLUMETRIC_REGIONS) as VolumetricRegionKey[]).map((rKey) => {
                const reg = VOLUMETRIC_REGIONS[rKey];
                const active = volumetricRegion === rKey;
                return (
                  <button
                    key={rKey}
                    onClick={() => setVolumetricRegion(rKey)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      active
                        ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                    title={`Change Volumetric Box location to ${reg.name} (${reg.minLat}° to ${reg.maxLat}°N/S, ${reg.minLon}° to ${reg.maxLon}°E)`}
                  >
                    {reg.name}
                  </button>
                );
              })}
            </div>

            {/* Maximize / Restore Split View Button */}
            <div className="flex items-center">
              {viewMode === 'split' ? (
                <button
                  onClick={() => setViewMode('box')}
                  className="text-slate-400 hover:text-white transition p-1.5 rounded-xl hover:bg-slate-800"
                  title="Maximize Volumetric Box View"
                >
                  <Maximize2 size={13} />
                </button>
              ) : (
                <button
                  onClick={() => setViewMode('split')}
                  className="text-slate-400 hover:text-white transition p-1.5 rounded-xl hover:bg-slate-800"
                  title="Restore Split View"
                >
                  <Minimize2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* 3D Canvas for Regional Volumetric Box */}
          <Canvas camera={{ position: [30, 24, 38], fov: 45 }} gl={{ antialias: true, alpha: false }}>
            <color attach="background" args={['#020617']} />
            <ambientLight intensity={1.3} />
            <directionalLight position={[30, 45, 25]} intensity={2.2} castShadow />
            <directionalLight position={[-25, -20, -20]} intensity={0.5} color="#0ea5e9" />
            <Stars radius={120} depth={60} count={3000} factor={3} saturation={0.1} fade speed={0.6} />

            <Suspense fallback={null}>
              <OceanVolume />
            </Suspense>

            <BoxCameraHandler />
          </Canvas>
        </div>
      )}
    </div>
  );
};
