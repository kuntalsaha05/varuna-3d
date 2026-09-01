import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import axios from 'axios';
import { useStore } from '../state/store';
import { geoTo3D, geoToSpherical, EARTH_RADIUS } from '../utils/coordinates';

export const SarDriftLayer: React.FC = () => {
  const {
    isSarMode,
    sarPoint,
    sarResult,
    setSarResult,
    sarObjectType,
    viewMode,
    verticalExaggeration
  } = useStore();

  const [loading, setLoading] = useState(false);
  const beaconRef = useRef<THREE.Mesh>(null);

  // Fetch 72-hour drift trajectory when sarPoint or object type changes
  useEffect(() => {
    if (!sarPoint || !isSarMode) return;
    setLoading(true);
    axios.get('http://127.0.0.1:8000/api/v1/disaster/sar-drift', {
      params: {
        lat: sarPoint.lat,
        lon: sarPoint.lon,
        hours: 72,
        object_type: sarObjectType
      }
    })
      .then(res => {
        setSarResult(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sarPoint, sarObjectType, isSarMode]);

  // Animate pulse on distress beacon
  useFrame(({ clock }) => {
    if (beaconRef.current) {
      const s = 1.0 + Math.sin(clock.getElapsedTime() * 4.0) * 0.35;
      beaconRef.current.scale.set(s, s, s);
    }
  });

  // Calculate 3D points along trajectory
  const trajectoryPoints = useMemo(() => {
    if (!sarResult?.trajectory) return [];
    return sarResult.trajectory.map((t: any) => {
      if (viewMode === 'globe') {
        const [x, y, z] = geoToSpherical(t.latitude, t.longitude, EARTH_RADIUS + 0.3);
        return new THREE.Vector3(x, y, z);
      } else {
        const [x, y, z] = geoTo3D(t.latitude, t.longitude, 0, verticalExaggeration);
        return new THREE.Vector3(x, y + 0.5, z);
      }
    });
  }, [sarResult, viewMode, verticalExaggeration]);

  if (!isSarMode || !sarResult || trajectoryPoints.length < 2) return null;

  const originPoint = trajectoryPoints[0];
  const datum24h = trajectoryPoints[minIdx(8, trajectoryPoints.length - 1)];
  const datum48h = trajectoryPoints[minIdx(16, trajectoryPoints.length - 1)];
  const datum72h = trajectoryPoints[trajectoryPoints.length - 1];

  function minIdx(a: number, b: number) {
    return Math.min(a, b);
  }

  return (
    <group>
      {/* 1. Forward 72-Hour Drift Trajectory Line */}
      <line>
        <bufferGeometry
          attach="geometry"
          onUpdate={(self) => {
            self.setFromPoints(trajectoryPoints);
          }}
        />
        <lineBasicMaterial attach="material" color="#ef4444" linewidth={3} transparent opacity={0.9} />
      </line>

      {/* 2. Initial Distress Origin Beacon */}
      <group position={originPoint}>
        <mesh ref={beaconRef}>
          <sphereGeometry args={[0.45, 16, 16]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#b91c1c"
            emissiveIntensity={2.0}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* 3. 24h, 48h, 72h Search Datum Radii Rings */}
      {[
        { pt: datum24h, label: '24h', radius: 0.8, col: '#f59e0b' },
        { pt: datum48h, label: '48h', radius: 1.4, col: '#f97316' },
        { pt: datum72h, label: '72h', radius: 2.2, col: '#ef4444' }
      ].map((item, idx) => (
        <group key={idx} position={item.pt}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[item.radius * 0.9, item.radius, 32]} />
            <meshBasicMaterial color={item.col} transparent opacity={0.65} side={THREE.DoubleSide} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.28, 12, 12]} />
            <meshStandardMaterial color={item.col} emissive={item.col} emissiveIntensity={1.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

