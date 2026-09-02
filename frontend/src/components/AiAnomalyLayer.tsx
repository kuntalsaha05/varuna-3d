import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import axios from 'axios';
import { useStore } from '../state/store';
import { geoTo3D, geoToSpherical, EARTH_RADIUS } from '../utils/coordinates';
import { Flame, Sparkles, Droplets, AlertCircle } from 'lucide-react';

export const AiAnomalyLayer: React.FC = () => {
  const {
    showAiAnomalies,
    activeVariable,
    selectedDepth,
    aiAnomalies,
    setAiAnomalies,
    selectedAnomaly,
    setSelectedAnomaly,
    showModalExpanded,
    showWarningModal,
    showHelpModal,
    showStoryTour,
    viewMode,
    verticalExaggeration
  } = useStore();

  const pulseRef = useRef<THREE.Group>(null);
  const anyModalOpen = showModalExpanded || showWarningModal || showHelpModal || showStoryTour || !!selectedAnomaly;

  useEffect(() => {
    if (!showAiAnomalies) return;
    axios.get('http://127.0.0.1:8000/api/v1/ai/anomalies', {
      params: { variable: activeVariable, depth: selectedDepth }
    })
      .then(res => {
        if (res.data.anomalies) setAiAnomalies(res.data.anomalies);
      })
      .catch(console.error);
  }, [showAiAnomalies, activeVariable, selectedDepth]);

  useFrame(({ camera, clock }) => {
    if (pulseRef.current) {
      const camDist = camera.position.length();
      const zoomScale = Math.max(0.45, Math.min(2.5, Math.pow(camDist / 42.0, 0.85)));
      const pulse = 1.0 + Math.sin(clock.getElapsedTime() * 3.5) * 0.25;
      pulseRef.current.children.forEach(mesh => {
        const finalScale = zoomScale * pulse;
        mesh.scale.set(finalScale, finalScale, finalScale);
      });
    }
  });

  if (!showAiAnomalies || !aiAnomalies.length) return null;

  return (
    <group ref={pulseRef}>
      {aiAnomalies.map((anom) => {
        let pos: [number, number, number];
        if (viewMode === 'globe') {
          pos = geoToSpherical(anom.lat, anom.lon, EARTH_RADIUS + 0.35, anom.depth);
        } else {
          pos = geoTo3D(anom.lat, anom.lon, anom.depth, verticalExaggeration);
        }

        const isHot = anom.type.includes('Heatwave');
        const color = anom.color || (isHot ? '#ef4444' : '#00f5d4');

        return (
          <group key={anom.id} position={pos}>
            {/* Glowing 3D Anomaly Sphere */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAnomaly(anom);
              }}
              onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { document.body.style.cursor = 'auto'; }}
            >
              <sphereGeometry args={[0.35, 16, 16]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={2.2}
                roughness={0.2}
              />
            </mesh>

            {/* Pulsing Outer Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.45, 0.65, 24]} />
              <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
            </mesh>

            {/* HTML Floating Anomaly Tag (Hidden when any modal is open) */}
            {!anyModalOpen && (
              <Html position={[0, 0.8, 0]} center distanceFactor={24}>
                <div
                  onClick={() => setSelectedAnomaly(anom)}
                  className="cursor-pointer select-none px-2 py-1 rounded-xl bg-slate-950/90 backdrop-blur-md border shadow-lg text-[10px] font-bold flex items-center gap-1.5 whitespace-nowrap transition-transform hover:scale-110"
                  style={{ borderColor: `${color}88`, color: '#ffffff' }}
                >
                  {isHot ? <Flame size={12} className="text-rose-400" /> : <Sparkles size={12} className="text-cyan-400" />}
                  <span>{anom.type}</span>
                  <span className="font-mono text-[9px] px-1 py-0.2 rounded" style={{ backgroundColor: `${color}33`, color }}>
                    {anom.anomaly_delta}
                  </span>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

