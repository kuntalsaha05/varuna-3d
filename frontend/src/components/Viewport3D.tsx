import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { OceanVolume } from './OceanVolume';
import { FloatMarkers } from './FloatMarkers';

export const Viewport3D: React.FC = () => {
  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [30, 25, 40], fov: 45 }}>
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 20, 15]} intensity={1.5} />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        <OceanVolume />
        <FloatMarkers />
        
        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 + 0.1} />
        <gridHelper args={[60, 20, '#0284c7', '#1e293b']} position={[0, 0, 0]} />
      </Canvas>
    </div>
  );
};
