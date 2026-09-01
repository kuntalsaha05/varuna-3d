import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { useStore } from '../state/store';
import { geoTo3D, geoToSpherical, EARTH_RADIUS } from '../utils/coordinates';

export const GliderSawtooth: React.FC = () => {
  const { showGlider, setSelectedGlider, viewMode, verticalExaggeration } = useStore();
  const [missions, setMissions] = useState<any[]>([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/gliders/missions')
      .then(res => {
        if (res.data.missions) setMissions(res.data.missions);
      })
      .catch(console.error);
  }, []);

  const gliderPoints = useMemo(() => {
    if (!missions.length || !missions[0].trajectory) return [];
    return missions[0].trajectory.map((w: any) => {
      if (viewMode === 'globe') {
        const [x, y, z] = geoToSpherical(w.latitude, w.longitude, EARTH_RADIUS + 0.1, w.depth);
        return new THREE.Vector3(x, y, z);
      } else {
        const [x, y, z] = geoTo3D(w.latitude, w.longitude, w.depth, verticalExaggeration);
        return new THREE.Vector3(x, y, z);
      }
    });
  }, [missions, viewMode, verticalExaggeration]);

  if (!showGlider || gliderPoints.length < 2) return null;

  return (
    <group>
      {/* 3D Sawtooth Trajectory Tube / Curve */}
      <line>
        <bufferGeometry
          attach="geometry"
          onUpdate={(self) => {
            self.setFromPoints(gliderPoints);
          }}
        />
        <lineBasicMaterial attach="material" color="#00f5d4" linewidth={2.5} transparent opacity={0.85} />
      </line>

      {/* Surface Surfacing Waypoint Nodes */}
      {missions[0].trajectory.filter((_: any, idx: number) => idx % 20 === 0).map((wp: any, i: number) => {
        let pos: [number, number, number];
        if (viewMode === 'globe') {
          pos = geoToSpherical(wp.latitude, wp.longitude, EARTH_RADIUS + 0.2, wp.depth);
        } else {
          pos = geoTo3D(wp.latitude, wp.longitude, wp.depth, verticalExaggeration);
        }

        return (
          <group key={i} position={pos}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                setSelectedGlider(missions[0]);
              }}
              onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { document.body.style.cursor = 'auto'; }}
            >
              <sphereGeometry args={[0.25, 12, 12]} />
              <meshStandardMaterial color="#00f5d4" emissive="#00bbf9" emissiveIntensity={1.5} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

