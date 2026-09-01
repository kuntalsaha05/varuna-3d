import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import axios from 'axios';
import { useStore } from '../state/store';
import { geoTo3D, geoToSpherical, EARTH_RADIUS } from '../utils/coordinates';

interface Particle {
  lat: number;
  lon: number;
  depth: number;
  life: number;
  maxLife: number;
  speed: number;
}

export const CurrentVectorField: React.FC = () => {
  const { viewMode, selectedDepth, verticalExaggeration, showCurrents, particleDensity } = useStore();
  const pointsRef = useRef<THREE.Points>(null);

  const COUNT = particleDensity || 1200;

  const particles = useMemo(() => {
    const arr: Particle[] = [];
    for (let i = 0; i < COUNT; i++) {
      arr.push({
        lat: 5.0 + Math.random() * 20.0,
        lon: 65.0 + Math.random() * 25.0,
        depth: selectedDepth + (Math.random() - 0.5) * 50.0,
        life: Math.random() * 100,
        maxLife: 80 + Math.random() * 40,
        speed: 0.2 + Math.random() * 0.4
      });
    }
    return arr;
  }, [selectedDepth, COUNT]);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    return [pos, col];
  }, [COUNT]);

  useFrame(() => {
    if (!showCurrents || !pointsRef.current) return;

    for (let i = 0; i < COUNT; i++) {
      const p = particles[i];
      p.life += 1;

      if (p.life > p.maxLife || p.lat < 4.0 || p.lat > 26.0 || p.lon < 64.0 || p.lon > 91.0) {
        p.lat = 5.0 + Math.random() * 20.0;
        p.lon = 65.0 + Math.random() * 25.0;
        p.life = 0;
      }

      const somaliFactor = Math.exp(-Math.pow(p.lon - 66.0, 2) / 16.0);
      const u = (-0.3 * Math.sin((p.lat - 15) * 0.2) + somaliFactor * 0.7) * p.speed;
      const v = (0.4 * Math.cos((p.lon - 70) * 0.15) + somaliFactor * 0.8) * p.speed;

      p.lon += u * 0.08;
      p.lat += v * 0.08;

      let px = 0, py = 0, pz = 0;
      if (viewMode === 'globe') {
        const [x, y, z] = geoToSpherical(p.lat, p.lon, EARTH_RADIUS + 0.2, selectedDepth);
        px = x; py = y; pz = z;
      } else {
        const [x, y, z] = geoTo3D(p.lat, p.lon, selectedDepth, verticalExaggeration);
        px = x; py = y + 0.1; pz = z;
      }

      const idx = i * 3;
      positions[idx] = px;
      positions[idx + 1] = py;
      positions[idx + 2] = pz;

      const currentSpeed = Math.sqrt(u * u + v * v);
      const intensity = Math.min(1.0, currentSpeed * 1.8);
      const alpha = Math.sin((p.life / p.maxLife) * Math.PI);

      colors[idx] = (0.0 + intensity * 0.8) * alpha;
      colors[idx + 1] = (0.8 + intensity * 0.2) * alpha;
      colors[idx + 2] = 1.0 * alpha;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate = true;
  });

  if (!showCurrents) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach='attributes-position'
          count={COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach='attributes-color'
          count={COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={viewMode === 'globe' ? 0.35 : 0.45}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
