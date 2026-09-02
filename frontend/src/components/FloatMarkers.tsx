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
  const markersGroupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/observations/floats?limit=350')
      .then(res => setFloats(res.data.floats))
      .catch(console.error);
  }, []);

  // Dynamic Camera-Distance Zoom Adaptive Scaling
  useFrame(({ camera, clock }) => {
    const camDist = camera.position.length();
    // Smooth dynamic scale based on camera distance (Reference dist ~42 units)
    const zoomScale = Math.max(0.4, Math.min(2.8, Math.pow(camDist / 42.0, 0.85)));
    const pulse = 1.0 + (Math.sin(clock.getElapsedTime() * 3.5) + 1.0) * 0.35;

    if (markersGroupRef.current) {
      markersGroupRef.current.children.forEach((child: any) => {
        const isSelected = child.userData?.isSelected;
        const baseScale = isSelected ? 1.75 : 1.0;
        const finalScale = baseScale * zoomScale;
        child.scale.set(finalScale, finalScale, finalScale);
      });
    }

    if (pulseRingsRef.current) {
      pulseRingsRef.current.children.forEach((child: any) => {
        const ringScale = zoomScale * pulse;
        child.scale.set(ringScale, ringScale, ringScale);
      });
    }
  });

  return (
    <group>
      {/* 1. Pulsing Outer Rings */}
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
              <ringGeometry args={[0.25, 0.42, 16]} />
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

      {/* 2. Float Markers with Zoom-Adaptive Sizing */}
      <group ref={markersGroupRef}>
        {floats.map((f) => {
          let pos: [number, number, number];
          if (viewMode === 'globe') {
            pos = geoToSpherical(f.latitude, f.longitude, EARTH_RADIUS + 0.25);
          } else {
            pos = geoTo3D(f.latitude, f.longitude, 0, verticalExaggeration);
            pos[1] += 0.4;
          }

          const isSelected = selectedFloatId === f.PLATFORM_NUMBER;

          return (
            <group
              key={f.PLATFORM_NUMBER}
              position={pos}
              userData={{ isSelected, platformNumber: f.PLATFORM_NUMBER }}
            >
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
                <sphereGeometry args={[0.28, 16, 16]} />
                <meshStandardMaterial
                  color={isSelected ? '#00f5d4' : '#ffb703'}
                  emissive={isSelected ? '#00bbf9' : '#fb8500'}
                  emissiveIntensity={isSelected ? 1.6 : 0.85}
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
    </group>
  );
};
