import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '../state/store';
import { geoTo3D } from '../utils/coordinates';

export const CoastlineLayer: React.FC = () => {
  const { showCoastlines, verticalExaggeration } = useStore();

  const coastlinePolylines = useMemo(() => {
    // Calibrated continental coastline polygons for Indian Ocean perimeter
    const features = [
      // 1. Indian Subcontinent (Gujarat -> Kanyakumari -> West Bengal)
      [
        [23.5, 68.5], [21.0, 70.0], [20.5, 72.8], [19.0, 72.8], [15.5, 73.8],
        [12.9, 74.8], [10.0, 76.2], [8.08, 77.55], [9.3, 79.1], [10.8, 79.8],
        [13.1, 80.3], [16.5, 82.0], [17.7, 83.3], [20.0, 86.5], [21.8, 87.5],
        [22.5, 89.5], [21.5, 91.8], [19.0, 93.5], [16.0, 94.5], [14.0, 98.0],
        [8.0, 98.5], [1.3, 103.8] // Malay peninsula tip
      ],
      // 2. Sri Lanka
      [
        [9.8, 80.2], [8.6, 81.2], [7.0, 81.8], [5.9, 80.5], [6.9, 79.8],
        [8.5, 79.8], [9.8, 80.2]
      ],
      // 3. Arabian Peninsula & Persian Gulf / Gulf of Aden
      [
        [30.0, 48.0], [27.0, 50.0], [25.0, 55.0], [24.0, 57.0], [22.5, 59.8],
        [18.0, 55.5], [14.5, 49.5], [12.6, 43.5], [15.0, 41.5], [20.0, 39.0],
        [28.0, 34.5]
      ],
      // 4. East African Coast & Horn of Africa
      [
        [11.8, 51.2], [10.4, 51.2], [5.0, 48.5], [0.0, 42.5], [-4.0, 39.5],
        [-10.0, 40.5], [-15.0, 40.5], [-20.0, 35.5], [-26.0, 32.5], [-30.0, 31.0]
      ],
      // 5. Madagascar
      [
        [-12.0, 49.3], [-15.5, 50.5], [-21.0, 48.5], [-25.5, 45.2],
        [-22.0, 43.5], [-16.0, 44.5], [-12.0, 49.3]
      ],
      // 6. Sumatra & Java (Indonesia)
      [
        [5.5, 95.3], [2.0, 97.0], [-1.0, 100.0], [-4.5, 103.0], [-6.0, 106.0],
        [-7.0, 110.0], [-8.5, 115.0], [-8.0, 119.5]
      ],
      // 7. Australia NW Coast
      [
        [-15.0, 120.0], [-20.0, 117.0], [-22.0, 114.0], [-28.0, 114.0], [-30.0, 115.0]
      ]
    ];

    return features.map((poly) => {
      const pts = poly.map(([lat, lon]) => {
        const [x, y, z] = geoTo3D(lat, lon, 0, verticalExaggeration);
        return new THREE.Vector3(x, y + 0.08, z);
      });
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color('#38bdf8'),
        transparent: true,
        opacity: 0.75
      });
      return new THREE.Line(geom, mat);
    });
  }, [verticalExaggeration]);

  if (!showCoastlines) return null;

  return (
    <group>
      {coastlinePolylines.map((lineObj, idx) => (
        <primitive key={idx} object={lineObj} />
      ))}
    </group>
  );
};

