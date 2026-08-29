import React, { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import axios from 'axios';
import { useStore } from '../state/store';
import { EARTH_RADIUS } from '../utils/coordinates';
import { getColorRamp } from '../utils/colormaps';
import { AtmosphereShader } from './AtmosphereShader';

export const EarthGlobe: React.FC = () => {
  const {
    activeVariable,
    selectedDepth,
    timeIndex,
    colorPalette,
    layerOpacity,
    showClouds,
    showAtmosphere
  } = useStore();

  const cloudsRef = useRef<THREE.Mesh>(null);
  const globeRef = useRef<THREE.Group>(null);
  const [sliceData, setSliceData] = useState<any>(null);

  // Load High-Res Earth Textures
  const [dayMap, bumpMap, specularMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    '/assets/earth/earth_daymap.jpg',
    '/assets/earth/earth_bump.jpg',
    '/assets/earth/earth_specular.jpg',
    '/assets/earth/earth_clouds_2k.jpg'
  ]);

  // Fetch model depth slice
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/slice/depth', {
      params: { depth: selectedDepth, time_index: timeIndex, variable: activeVariable }
    }).then(res => setSliceData(res.data)).catch(console.error);
  }, [activeVariable, selectedDepth, timeIndex]);

  // Generate Ocean Texture Map
  const modelTexture = useMemo(() => {
    if (!sliceData || !sliceData.grid) return null;

    const rows = sliceData.grid.length;
    const cols = sliceData.grid[0].length;
    const size = rows * cols;
    const data = new Uint8Array(4 * size);

    const minV = sliceData.min_val ?? 10;
    const maxV = sliceData.max_val ?? 32;
    const range = maxV - minV || 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Reverse row order so North is at the top of the texture
        const rowIdx = rows - 1 - r;
        const val = sliceData.grid[rowIdx][c];
        const idx = (r * cols + c) * 4;

        if (val === null || val === undefined) {
          // Transparent on land
          data[idx] = 0;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
          data[idx + 3] = 0;
        } else {
          const norm = Math.max(0, Math.min(1, (val - minV) / range));
          const [red, green, blue] = getColorRamp(norm, colorPalette);
          data[idx] = red;
          data[idx + 1] = green;
          data[idx + 2] = blue;
          data[idx + 3] = Math.floor(255 * layerOpacity);
        }
      }
    }

    const tex = new THREE.DataTexture(data, cols, rows, THREE.RGBAFormat);
    tex.needsUpdate = true;
    return tex;
  }, [sliceData, colorPalette, layerOpacity]);

  // Subtle clouds orbital motion
  useFrame((_, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.015;
    }
  });

  // Spherical bounds for Indian Ocean Model (Lat: -30 to 30, Lon: 30 to 120)
  // Converting to Three.js Sphere sector (phiStart, phiLength, thetaStart, thetaLength)
  const oceanSector = useMemo(() => {
    const latMin = sliceData?.lats ? Math.min(...sliceData.lats) : -30.0;
    const latMax = sliceData?.lats ? Math.max(...sliceData.lats) : 30.0;
    const lonMin = sliceData?.lons ? Math.min(...sliceData.lons) : 30.0;
    const lonMax = sliceData?.lons ? Math.max(...sliceData.lons) : 120.0;

    const phiStart = (90.0 - latMax) * (Math.PI / 180.0);
    const phiLength = (latMax - latMin) * (Math.PI / 180.0);
    const thetaStart = (lonMin + 180.0) * (Math.PI / 180.0);
    const thetaLength = (lonMax - lonMin) * (Math.PI / 180.0);

    return { phiStart, phiLength, thetaStart, thetaLength };
  }, [sliceData]);

  // Depth depression on globe (deeper slices render slightly beneath surface)
  const oceanRadius = EARTH_RADIUS + 0.05 - (selectedDepth / 2000.0) * 0.4;

  return (
    <group ref={globeRef}>
      {/* 1. Photorealistic Earth Sphere (Day + Bump + Specular) */}
      <mesh receiveShadow>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <meshPhongMaterial
          map={dayMap}
          bumpMap={bumpMap}
          bumpScale={0.18}
          specularMap={specularMap}
          specular={new THREE.Color(0x336699)}
          shininess={25}
        />
      </mesh>

      {/* 2. Projected Indian Ocean Model Heatmap Layer */}
      {modelTexture && (
        <mesh>
          <sphereGeometry
            args={[
              oceanRadius,
              64,
              64,
              oceanSector.thetaStart,
              oceanSector.thetaLength,
              oceanSector.phiStart,
              oceanSector.phiLength
            ]}
          />
          <meshStandardMaterial
            map={modelTexture}
            transparent
            opacity={layerOpacity}
            side={THREE.DoubleSide}
            depthWrite={false}
            roughness={0.3}
          />
        </mesh>
      )}

      {/* 3. Rotating Atmospheric Cloud Cover */}
      {showClouds && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[EARTH_RADIUS + 0.12, 48, 48]} />
          <meshStandardMaterial
            map={cloudsMap}
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 4. Atmospheric Fresnel Glow (Rayleigh scattering rim) */}
      {showAtmosphere && (
        <mesh>
          <sphereGeometry args={[EARTH_RADIUS * 1.08, 48, 48]} />
          <shaderMaterial
            vertexShader={AtmosphereShader.vertexShader}
            fragmentShader={AtmosphereShader.fragmentShader}
            uniforms={{
              uColor: { value: new THREE.Color(0x00d2ff) },
              uIntensity: { value: 0.85 },
              uPower: { value: 3.2 }
            }}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
            transparent
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
};
