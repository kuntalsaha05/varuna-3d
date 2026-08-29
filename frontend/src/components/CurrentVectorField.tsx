import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../state/store';
import { SCENE_WIDTH_X, SCENE_DEPTH_Z } from '../utils/coordinates';

export const CurrentVectorField: React.FC = () => {
  const { showCurrents, selectedDepth } = useStore();
  const particlesRef = useRef<THREE.Points>(null);

  const particleCount = 1200;

  // Initialize particle positions, lifetimes, and velocities
  const [positions, velocities, ages] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    const ag = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Random position across Indian Ocean bounding box
      pos[i * 3] = (Math.random() - 0.5) * SCENE_WIDTH_X;
      pos[i * 3 + 1] = 0.12; // Surface elevation
      pos[i * 3 + 2] = (Math.random() - 0.5) * SCENE_DEPTH_Z;

      // Indian Ocean monsoon & gyre circulation vector pattern:
      // Equatorial region (Z ~ 0): Eastward/Westward flow
      // Southern Ocean (Z > 5): Strong eastward Antarctic Circumpolar Current
      // Arabian Sea (Z < -5, X < 0): Clockwise gyre
      const zNorm = pos[i * 3 + 2] / (SCENE_DEPTH_Z / 2);
      const xNorm = pos[i * 3] / (SCENE_WIDTH_X / 2);

      let vx = 0.04;
      let vz = 0.0;

      if (zNorm < -0.2) {
        // Northern Indian Ocean / Arabian Sea & BoB
        vx = 0.05 * Math.cos(xNorm * 2.0);
        vz = 0.03 * Math.sin(xNorm * 2.0);
      } else if (zNorm > 0.3) {
        // South Indian Ocean Westward flow
        vx = -0.06;
        vz = 0.01 * Math.sin(xNorm * 3.0);
      } else {
        // Equatorial currents
        vx = 0.07;
        vz = 0.0;
      }

      vel[i * 3] = vx;
      vel[i * 3 + 1] = 0.0;
      vel[i * 3 + 2] = vz;

      ag[i] = Math.random() * 100.0;
    }

    return [pos, vel, ag];
  }, []);

  useFrame((_, delta) => {
    if (!particlesRef.current || !showCurrents) return;

    const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      posArr[i * 3] += velocities[i * 3] * (delta * 60);
      posArr[i * 3 + 2] += velocities[i * 3 + 2] * (delta * 60);
      ages[i] += delta * 20;

      // Wrap around boundaries
      const halfW = SCENE_WIDTH_X / 2;
      const halfD = SCENE_DEPTH_Z / 2;

      if (posArr[i * 3] > halfW) posArr[i * 3] = -halfW;
      if (posArr[i * 3] < -halfW) posArr[i * 3] = halfW;
      if (posArr[i * 3 + 2] > halfD) posArr[i * 3 + 2] = -halfD;
      if (posArr[i * 3 + 2] < -halfD) posArr[i * 3 + 2] = halfD;

      if (ages[i] > 100.0) {
        ages[i] = 0;
        posArr[i * 3] = (Math.random() - 0.5) * SCENE_WIDTH_X;
        posArr[i * 3 + 2] = (Math.random() - 0.5) * SCENE_DEPTH_Z;
      }
    }

    posAttr.needsUpdate = true;
  });

  // Only render surface currents when near surface
  if (!showCurrents || selectedDepth > 150) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#38bdf8"
        size={0.28}
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

