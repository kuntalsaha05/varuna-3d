import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
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

  const COUNT = Math.max(1200, particleDensity || 1600);

  const MIN_LAT = -10.0;
  const MAX_LAT = 26.0;
  const MIN_LON = 45.0;
  const MAX_LON = 98.0;

  const particles = useMemo(() => {
    const arr: Particle[] = [];
    for (let i = 0; i < COUNT; i++) {
      arr.push({
        lat: MIN_LAT + Math.random() * (MAX_LAT - MIN_LAT),
        lon: MIN_LON + Math.random() * (MAX_LON - MIN_LON),
        depth: selectedDepth + (Math.random() - 0.5) * 30.0,
        life: Math.random() * 100,
        maxLife: 90 + Math.random() * 50,
        speed: 0.35 + Math.random() * 0.45
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

    const depthDecay = Math.exp(-selectedDepth / 350.0);

    for (let i = 0; i < COUNT; i++) {
      const p = particles[i];
      p.life += 1;

      if (
        p.life > p.maxLife ||
        p.lat < MIN_LAT || p.lat > MAX_LAT ||
        p.lon < MIN_LON || p.lon > MAX_LON
      ) {
        p.lat = MIN_LAT + Math.random() * (MAX_LAT - MIN_LAT);
        p.lon = MIN_LON + Math.random() * (MAX_LON - MIN_LON);
        p.life = 0;
      }

      // Geostrophic vector currents
      const wyrtkiZone = Math.exp(-Math.pow(p.lat - 1.5, 2) / 6.0);
      const u_wyrtki = wyrtkiZone * 1.4;
      const v_wyrtki = wyrtkiZone * 0.1;

      const somaliCore = Math.exp(-Math.pow(p.lon - 54.0, 2) / 30.0) * (p.lat > 0 && p.lat < 16 ? 1.0 : 0.0);
      const u_somali = somaliCore * 1.6;
      const v_somali = somaliCore * 1.8;

      const asCore = (p.lon >= 58 && p.lon <= 77 && p.lat >= 8 && p.lat <= 25) ? 1.0 : 0.0;
      const u_as = asCore * (-0.5 * Math.sin((p.lat - 15) * 0.22) + 0.3);
      const v_as = asCore * (0.6 * Math.cos((p.lon - 66) * 0.18));

      const wiccCore = (p.lon >= 71 && p.lon <= 76 && p.lat >= 8 && p.lat <= 20) ? 1.0 : 0.0;
      const u_wicc = wiccCore * -0.2;
      const v_wicc = wiccCore * -0.8;

      const bobCore = (p.lon >= 78 && p.lon <= 96 && p.lat >= 6 && p.lat <= 24) ? 1.0 : 0.0;
      const u_bob = bobCore * (0.45 * Math.cos((p.lat - 14) * 0.2) - 0.2);
      const v_bob = bobCore * (-0.5 * Math.sin((p.lon - 88) * 0.18) + 0.25);

      const secCore = (p.lat <= 0) ? 1.0 : 0.0;
      const u_sec = secCore * -0.85;
      const v_sec = secCore * -0.15;

      const u = (u_wyrtki + u_somali + u_as + u_wicc + u_bob + u_sec) * p.speed * depthDecay;
      const v = (v_wyrtki + v_somali + v_as + v_wicc + v_bob + v_sec) * p.speed * depthDecay;

      p.lon += u * 0.065;
      p.lat += v * 0.065;

      let px = 0, py = 0, pz = 0;
      if (viewMode === 'globe') {
        const [x, y, z] = geoToSpherical(p.lat, p.lon, EARTH_RADIUS + 0.18, selectedDepth);
        px = x; py = y; pz = z;
      } else {
        const [x, y, z] = geoTo3D(p.lat, p.lon, selectedDepth, verticalExaggeration);
        px = x; py = y + 0.15; pz = z;
      }

      const idx = i * 3;
      positions[idx] = px;
      positions[idx + 1] = py;
      positions[idx + 2] = pz;

      const speedMagnitude = Math.sqrt(u * u + v * v);
      const speedNorm = Math.min(1.0, speedMagnitude / 1.5);
      const alpha = Math.sin((p.life / p.maxLife) * Math.PI);

      colors[idx] = (0.1 + speedNorm * 0.85) * alpha;
      colors[idx + 1] = (0.75 + speedNorm * 0.2) * alpha;
      colors[idx + 2] = (1.0 - speedNorm * 0.6) * alpha;
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
        size={viewMode === 'globe' ? 0.38 : 0.52}
        vertexColors
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
