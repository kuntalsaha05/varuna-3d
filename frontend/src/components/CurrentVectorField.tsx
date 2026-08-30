import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../state/store';
import { SCENE_WIDTH_X, SCENE_DEPTH_Z, GLOBE_RADIUS, geoToSphere } from '../utils/coordinates';

export const CurrentVectorField: React.FC = () => {
  const { showCurrents, selectedDepth, viewMode } = useStore();
  const particlesRef = useRef<THREE.Points>(null);

  const particleCount = 1500;

  // Initialize particles with geodetic latitude/longitude for globe & Cartesian for basin
  const [lats, lons, velocities, ages, cartesianPos] = useMemo(() => {
    const latArr = new Float32Array(particleCount);
    const lonArr = new Float32Array(particleCount);
    const vel = new Float32Array(particleCount * 2); // dLat, dLon
    const ag = new Float32Array(particleCount);
    const cPos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Seed across Indian Ocean domain: Lat -28° to 28°, Lon 32° to 118°
      latArr[i] = -28.0 + Math.random() * 56.0;
      lonArr[i] = 32.0 + Math.random() * 86.0;
      ag[i] = Math.random() * 100.0;

      // Realistic circulation velocity
      if (latArr[i] > 5.0) {
        // Arabian Sea / Bay of Bengal Monsoon Gyre
        vel[i * 2] = -0.04 * Math.sin((lonArr[i] - 32) * 0.05); // dLat
        vel[i * 2 + 1] = 0.08 * Math.cos((latArr[i] - 5) * 0.08); // dLon
      } else if (latArr[i] < -10.0) {
        // South Equatorial Current (Westward flow)
        vel[i * 2] = 0.01 * Math.sin(lonArr[i] * 0.1);
        vel[i * 2 + 1] = -0.09;
      } else {
        // Equatorial Jet (Eastward flow)
        vel[i * 2] = 0.0;
        vel[i * 2 + 1] = 0.12;
      }

      // Initial Cartesian positions
      cPos[i * 3] = ((lonArr[i] - 30.5) / 89.0 - 0.5) * SCENE_WIDTH_X;
      cPos[i * 3 + 1] = 0.12;
      cPos[i * 3 + 2] = -((latArr[i] - (-29.5)) / 59.0 - 0.5) * SCENE_DEPTH_Z;
    }

    return [latArr, lonArr, vel, ag, cPos];
  }, []);

  const posBuffer = useMemo(() => new Float32Array(particleCount * 3), []);

  useFrame((_, delta) => {
    if (!particlesRef.current || !showCurrents) return;

    const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      // Advect latitude & longitude
      lats[i] += velocities[i * 2] * (delta * 25);
      lons[i] += velocities[i * 2 + 1] * (delta * 25);
      ages[i] += delta * 18;

      // Wrap around Indian Ocean boundaries
      if (lons[i] > 118.0) lons[i] = 32.0;
      if (lons[i] < 32.0) lons[i] = 118.0;
      if (lats[i] > 28.0) lats[i] = -28.0;
      if (lats[i] < -28.0) lats[i] = 28.0;

      if (ages[i] > 100.0) {
        ages[i] = 0;
        latArrReinit(i, lats, lons);
      }

      if (viewMode === 'globe') {
        // Project onto 3D Earth Sphere
        const [gx, gy, gz] = geoToSphere(lats[i], lons[i], GLOBE_RADIUS, 0.12);
        posArr[i * 3] = gx;
        posArr[i * 3 + 1] = gy;
        posArr[i * 3 + 2] = gz;
      } else {
        // Planar Cartesian projection for Basin Box
        posArr[i * 3] = ((lons[i] - 30.5) / 89.0 - 0.5) * SCENE_WIDTH_X;
        posArr[i * 3 + 1] = 0.12;
        posArr[i * 3 + 2] = -((lats[i] - (-29.5)) / 59.0 - 0.5) * SCENE_DEPTH_Z;
      }
    }

    posAttr.needsUpdate = true;
  });

  function latArrReinit(i: number, lats: Float32Array, lons: Float32Array) {
    lats[i] = -28.0 + Math.random() * 56.0;
    lons[i] = 32.0 + Math.random() * 86.0;
  }

  // Only render surface currents when near surface
  if (!showCurrents || selectedDepth > 150) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[posBuffer, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#38bdf8"
        size={viewMode === 'globe' ? 0.18 : 0.28}
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};


