import React, { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import axios from 'axios';
import { useStore } from '../state/store';
import { geoTo3D } from '../utils/coordinates';

export const FloatMarkers: React.FC = () => {
  const [floats, setFloats] = useState<any[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [trajectoryPoints, setTrajectoryPoints] = useState<any[]>([]);
  
  const {
    verticalExaggeration,
    selectedFloatId,
    setSelectedFloatId,
    showTrajectories
  } = useStore();

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/observations/floats?limit=300')
      .then(res => setFloats(res.data.floats))
      .catch(console.error);
  }, []);

  // Fetch trajectory for selected float
  useEffect(() => {
    if (!selectedFloatId) {
      setTrajectoryPoints([]);
      return;
    }
    axios.get(`http://127.0.0.1:8000/api/v1/observations/trajectory?platform_number=${selectedFloatId}`)
      .then(res => setTrajectoryPoints(res.data.trajectory || []))
      .catch(() => setTrajectoryPoints([]));
  }, [selectedFloatId]);

  // Build trajectory 3D polyline object
  const trajectoryLine = useMemo(() => {
    if (!trajectoryPoints || trajectoryPoints.length < 2) return null;
    const pts = trajectoryPoints.map(p => {
      const [x, y, z] = geoTo3D(p.latitude, p.longitude, 0, verticalExaggeration);
      return new THREE.Vector3(x, y + 0.15, z);
    });
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#fbbf24'),
      transparent: true,
      opacity: 0.9
    });
    return new THREE.Line(geom, mat);
  }, [trajectoryPoints, verticalExaggeration]);

  return (
    <group>
      {/* Historical Drift Trajectory Path */}
      {showTrajectories && trajectoryLine && (
        <group>
          <primitive object={trajectoryLine} />
          {/* Small cycle waypoint dots */}
          {trajectoryPoints.map((pt, idx) => {
            const [x, y, z] = geoTo3D(pt.latitude, pt.longitude, 0, verticalExaggeration);
            return (
              <mesh key={idx} position={[x, y + 0.15, z]}>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshBasicMaterial color="#f59e0b" />
              </mesh>
            );
          })}
        </group>
      )}


      {/* Float Surface Markers */}
      {floats.map((f) => {
        const [x, y, z] = geoTo3D(f.latitude, f.longitude, 0, verticalExaggeration);
        const isSelected = selectedFloatId === f.PLATFORM_NUMBER;
        const isHovered = hoveredId === f.PLATFORM_NUMBER;

        return (
          <group
            key={f.PLATFORM_NUMBER}
            position={[x, y + 0.35, z]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredId(f.PLATFORM_NUMBER);
            }}
            onPointerOut={() => setHoveredId(null)}
          >
            {/* Core Pin Mesh */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFloatId(f.PLATFORM_NUMBER);
              }}
            >
              <sphereGeometry args={[isSelected ? 0.65 : isHovered ? 0.55 : 0.4, 16, 16]} />
              <meshStandardMaterial
                color={isSelected ? '#00f5d4' : '#ffb703'}
                emissive={isSelected ? '#00b4d8' : '#fb8500'}
                emissiveIntensity={isSelected ? 1.0 : 0.65}
                roughness={0.2}
              />
            </mesh>

            {/* Glowing Beacon Halo Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.5, isSelected ? 0.9 : 0.7, 16]} />
              <meshBasicMaterial
                color={isSelected ? '#00f5d4' : '#ffb703'}
                transparent
                opacity={isSelected ? 0.8 : 0.4}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Hover Tooltip Card */}
            {(isHovered || isSelected) && (
              <Html distanceFactor={45} position={[0, 0.8, 0]} center>
                <div className="bg-slate-900/95 border border-cyan-500/40 text-slate-100 text-[11px] p-2.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap min-w-[140px]">
                  <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Argo WMO #{f.PLATFORM_NUMBER}
                  </div>
                  <div className="text-slate-300 text-[10px] mt-0.5">
                    Pos: {f.latitude}°N, {f.longitude}°E
                  </div>
                  {f.cycle_count && (
                    <div className="text-slate-400 text-[10px]">
                      Cycles: <span className="text-amber-400 font-semibold">{f.cycle_count}</span> profiles
                    </div>
                  )}
                  <div className="text-slate-400 text-[9px] mt-1 border-t border-slate-800 pt-0.5">
                    Click to validate vs model
                  </div>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

