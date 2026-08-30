import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useStore } from '../state/store';
import { EarthGlobe } from './EarthGlobe';
import { GlobeFloatMarkers } from './GlobeFloatMarkers';
import { OceanVolume } from './OceanVolume';
import { FloatMarkers } from './FloatMarkers';
import { BathymetryFloor } from './BathymetryFloor';
import { CoastlineLayer } from './CoastlineLayer';
import { CurrentVectorField } from './CurrentVectorField';
import { SCENE_WIDTH_X, SCENE_DEPTH_Z } from '../utils/coordinates';

export const Viewport3D: React.FC = () => {
  const { viewMode } = useStore();

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{
          position: viewMode === 'globe' ? [12, 10, 36] : [35, 30, 45],
          fov: 42,
          near: 0.1,
          far: 500
        }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#020617']} />
        <fog attach="fog" args={['#020617', viewMode === 'globe' ? 80 : 50, 200]} />

        {/* Dynamic Scene Lighting */}
        <ambientLight intensity={viewMode === 'globe' ? 1.8 : 1.4} />
        <directionalLight position={[35, 45, 30]} intensity={2.4} color="#f8fafc" />
        <directionalLight position={[-30, -10, -25]} intensity={0.8} color="#38bdf8" />
        <pointLight position={[0, -10, 0]} intensity={0.6} color="#0284c7" />

        {/* Space Background */}
        <Stars radius={140} depth={70} count={4000} factor={4} saturation={0.5} fade speed={0.6} />

        {/* Conditional 3D Rendering: Globe vs Basin Box */}
        {viewMode === 'globe' ? (
          <group>
            <EarthGlobe />
            <CurrentVectorField />
            <GlobeFloatMarkers />
          </group>
        ) : (
          <group>
            <OceanVolume />
            <BathymetryFloor />
            <CoastlineLayer />
            <CurrentVectorField />
            <FloatMarkers />
            <gridHelper
              args={[Math.max(SCENE_WIDTH_X, SCENE_DEPTH_Z) * 1.4, 28, '#0284c7', '#0f172a']}
              position={[0, 0, 0]}
            />
          </group>
        )}


        {/* Orbit Controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={viewMode === 'globe' ? Math.PI : Math.PI / 2 + 0.1}
          minDistance={viewMode === 'globe' ? 18 : 10}
          maxDistance={viewMode === 'globe' ? 90 : 120}
        />
      </Canvas>
    </div>
  );
};


