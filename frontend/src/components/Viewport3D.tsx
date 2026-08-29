import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../state/store';
import { EarthGlobe } from './EarthGlobe';
import { OceanVolume } from './OceanVolume';
import { FloatMarkers } from './FloatMarkers';
import { CurrentVectorField } from './CurrentVectorField';

const CameraHandler: React.FC = () => {
  const { viewMode, cameraTarget } = useStore();
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (viewMode === 'globe') {
      // Focus on the Indian Ocean (Lat 15 N, Lon 75 E)
      camera.position.set(22, 18, 38);
      camera.lookAt(0, 0, 0);
    } else {
      // Regional Box View
      camera.position.set(28, 22, 38);
      camera.lookAt(0, -5, 0);
    }
  }, [viewMode, camera]);

  return <OrbitControls ref={controlsRef} makeDefault minDistance={18} maxDistance={90} enableDamping dampingFactor={0.05} />;
};

export const Viewport3D: React.FC = () => {
  const { viewMode } = useStore();

  return (
    <div className='w-full h-full relative'>
      <Canvas camera={{ position: [22, 18, 38], fov: 45 }} gl={{ antialias: true, alpha: false }}>
        <color attach='background' args={['#01040d']} />
        <ambientLight intensity={1.1} />
        <directionalLight position={[35, 45, 30]} intensity={1.8} castShadow />
        <directionalLight position={[-30, -20, -20]} intensity={0.4} color='#0284c7' />
        <Stars radius={120} depth={60} count={4000} factor={4} saturation={0.2} fade speed={0.8} />

        <Suspense fallback={null}>
          {viewMode === 'globe' ? <EarthGlobe /> : <OceanVolume />}
          <FloatMarkers />
          <CurrentVectorField />
        </Suspense>

        <CameraHandler />
      </Canvas>
    </div>
  );
};
