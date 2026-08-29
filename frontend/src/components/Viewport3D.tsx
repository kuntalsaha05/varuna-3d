import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { OceanVolume } from './OceanVolume';
import { FloatMarkers } from './FloatMarkers';
import { BathymetryFloor } from './BathymetryFloor';
import { CoastlineLayer } from './CoastlineLayer';
import { CurrentVectorField } from './CurrentVectorField';
import { SCENE_WIDTH_X, SCENE_DEPTH_Z } from '../utils/coordinates';

export const Viewport3D: React.FC = () => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [35, 30, 45], fov: 42, near: 0.1, far: 500 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#020617']} />
        <fog attach="fog" args={['#020617', 50, 160]} />

        {/* Lighting */}
        <ambientLight intensity={1.4} />
        <directionalLight position={[20, 35, 20]} intensity={1.8} />
        <directionalLight position={[-20, 20, -20]} intensity={0.6} color="#38bdf8" />
        <pointLight position={[0, -10, 0]} intensity={0.8} color="#0284c7" />

        {/* Background Environment */}
        <Stars radius={120} depth={60} count={3500} factor={4} saturation={0.5} fade speed={0.8} />

        {/* 3D Ocean Scene Layers */}
        <OceanVolume />
        <BathymetryFloor />
        <CoastlineLayer />
        <CurrentVectorField />
        <FloatMarkers />

        {/* Grid and Controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minDistance={10}
          maxDistance={120}
        />
        <gridHelper
          args={[Math.max(SCENE_WIDTH_X, SCENE_DEPTH_Z) * 1.4, 28, '#0284c7', '#0f172a']}
          position={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
};

