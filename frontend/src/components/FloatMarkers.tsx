import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { useStore } from '../state/store';
import { geoTo3D } from '../utils/coordinates';

export const FloatMarkers: React.FC = () => {
  const [floats, setFloats] = useState<any[]>([]);
  const { verticalExaggeration, setSelectedFloatId } = useStore();

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/observations/floats?limit=300')
      .then(res => setFloats(res.data.floats))
      .catch(console.error);
  }, []);

  return (
    <group>
      {floats.map((f) => {
        const [x, y, z] = geoTo3D(f.latitude, f.longitude, 0, verticalExaggeration);
        return (
          <group key={f.PLATFORM_NUMBER} position={[x, y + 0.3, z]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFloatId(f.PLATFORM_NUMBER);
              }}
            >
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial
                color="#ffb703"
                emissive="#fb8500"
                emissiveIntensity={0.6}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
