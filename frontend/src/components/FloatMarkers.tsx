import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import axios from 'axios';
import { useStore } from '../state/store';
import { geoTo3D, geoToSpherical, EARTH_RADIUS } from '../utils/coordinates';

interface FloatMarkerData {
  PLATFORM_NUMBER: number;
  latitude: number;
  longitude: number;
  time: string;
}

export const FloatMarkers: React.FC = () => {
  const [floats, setFloats] = useState<FloatMarkerData[]>([]);
  const { viewMode, verticalExaggeration, selectedFloatId, setSelectedFloatId, setHoveredCoords } = useStore();
  const pulseRingsRef = useRef<THREE.Group>(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/observations/floats?limit=350')
      .then(res => setFloats(res.data.floats))
      .catch(console.error);
  }, []);

  useFrame(({ clock }) => {
    if (pulseRingsRef.current) {
      const s = 1.0 + (Math.sin(clock.getElapsedTime() * 3.5) + 1.0) * 0.4;
      pulseRingsRef.current.children.forEach(child => {
        child.scale.set(s, s, s);
      });
    }
  });

  return (
    <group>
      <group ref={pulseRingsRef}>
        {floats.map((f) => {
          let pos: [number, number, number];
          if (viewMode === 'globe') {
            pos = geoToSpherical(f.latitude, f.longitude, EARTH_RADIUS + 0.25);
          } else {
            pos = geoTo3D(f.latitude, f.longitude, 0, verticalExaggeration);
            pos[1] += 0.4;
          }

          return (
            <mesh key={`ring-${f.PLATFORM_NUMBER}`} position={pos}>
              <ringGeometry args={[0.25, 0.4, 16]} />
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

      {floats.map((f) => {
        let pos: [number, number, number];
        if (viewMode === 'globe') {
          pos = geoToSpherical(f.latitude, f.longitude, EARTH_RADIUS + 0.25);
        } else {
          pos = geoTo3D(f.latitude, f.longitude, 0, verticalExaggeration);
          pos[1] += 0.4;
        }

        const isSelected = selectedFloatId === f.PLATFORM_NUMBER;
        const scale = isSelected ? 1.6 : 1.0;

        return (
          <group key={f.PLATFORM_NUMBER} position={pos} scale={[scale, scale, scale]}>
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
                color={isSelected ? '#00f5d4' : '#ffb703'}
                emissive={isSelected ? '#00bbf9' : '#fb8500'}
                emissiveIntensity={isSelected ? 1.5 : 0.8}
                roughness={0.2}
              />
            </mesh>

            {viewMode === 'box' && (
              <line>
                <bufferGeometry
                  attach='geometry'
                  onUpdate={(self) => {
                    const points = [
                      new THREE.Vector3(0, 0, 0),
                      new THREE.Vector3(0, -(verticalExaggeration / 3), 0)
                    ];
                    self.setFromPoints(points);
                  }}
                />
                <lineBasicMaterial attach='material' color='#fb8500' opacity={0.35} transparent />
              </line>
            )}
          </group>
        );
      })}
    </group>
  );
};
