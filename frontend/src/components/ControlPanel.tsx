import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore, OceanVariable, PresetRegion } from '../state/store';
import { PaletteName } from '../utils/colormaps';
import {
  Layers,
  Sliders,
  Eye,
  Wind,
  Cloud,
  Sun,
  Flame,
  Droplets,
  Sprout,
  Compass,
  Palette,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export const ControlPanel: React.FC = () => {
  const {
    viewMode,
    activeVariable,
    setActiveVariable,
    selectedDepth,
    setSelectedDepth,
    verticalExaggeration,
    setVerticalExaggeration,
    colorPalette,
    setColorPalette,
    layerOpacity,
    setLayerOpacity,
    showCurrents,
    setShowCurrents,
    showClouds,
    setShowClouds,
    showAtmosphere,
    setShowAtmosphere,
    particleDensity,
    setParticleDensity,
    showGlider,
    setShowGlider,
    isSarMode,
    setIsSarMode,
    sarObjectType,
    setSarObjectType,
    sarPoint,
    setSarPoint,
    sarResult,
    activePresetRegion,
    setActivePresetRegion,
    setTimeIndex,
    setMetadata
  } = useStore();

  const [showLayerMenu, setShowLayerMenu] = useState(true);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/slice/metadata', {
      params: { variable: activeVariable }
    })
      .then(res => {
        setMetadata(res.data.depth_levels, res.data.time_steps, res.data.variables);
        setTimeIndex(-1);
      })
      .catch(console.error);
  }, [activeVariable]);

  const variablesList: { key: OceanVariable; label: string; unit: string }[] = [
    { key: 'temp', label: 'Sub-surface Temperature', unit: '°C' },
    { key: 'sal', label: 'Sub-surface Salinity', unit: 'PSU' },
    { key: 'sst', label: 'Sea Surface Temperature (SST)', unit: '°C' },
    { key: 'chlorophyll', label: 'Chlorophyll-a Concentration', unit: 'mg/m³' }
  ];

  const depthPresets = [
    { d: 5, label: 'Surface Layer (5 m)' },
    { d: 50, label: 'Mixed Layer (50 m)' },
    { d: 100, label: 'Upper Stratification (100 m)' },
    { d: 150, label: 'Main Thermocline (150 m)' },
    { d: 300, label: 'Intermediate Layer (300 m)' },
    { d: 500, label: 'Mesopelagic Layer (500 m)' },
    { d: 1000, label: 'Deep Ocean (1000 m)' },
    { d: 2000, label: 'Abyssal Zone (2000 m)' }
  ];

  const palettes: { key: PaletteName; label: string }[] = [
    { key: 'thermal', label: 'Thermal (Temperature / Heat)' },
    { key: 'haline', label: 'Haline (Salinity Analysis)' },
    { key: 'algae', label: 'Algae (Chlorophyll / Ocean Color)' },
    { key: 'turbo', label: 'Turbo (High-Contrast Multi-Hue)' },
    { key: 'viridis', label: 'Viridis (Perceptually Uniform)' },
    { key: 'coolwarm', label: 'CoolWarm (Diverging Anomaly)' }
  ];

  const regions: { key: PresetRegion; label: string; coords: [number, number, number] }[] = [
    { key: 'all', label: 'Full Indian Ocean Basin', coords: [22, 18, 38] },
    { key: 'arabian_sea', label: 'Arabian Sea (Somali Jet)', coords: [12, 16, 26] },
    { key: 'bay_of_bengal', label: 'Bay of Bengal (Monsoon)', coords: [28, 16, 26] },
    { key: 'equator', label: 'Equatorial Current Jet', coords: [20, 0, 24] }
  ];

  const handleRegionChange = (regKey: PresetRegion) => {
    setActivePresetRegion(regKey);
    const reg = regions.find(r => r.key === regKey);
    if (reg) setCameraTarget(reg.coords);
  };

  return (
    <aside className="absolute top-[96px] left-6 z-20 w-80 bg-slate-950/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-4 shadow-2xl text-slate-100 space-y-3.5 select-none pointer-events-auto max-h-[calc(100vh-180px)] overflow-y-auto">
      
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. VARIABLE SELECTOR DROPDOWN MENU                        */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Layers size={13} className="text-cyan-400" />
          <span>Ocean Variable</span>
        </label>
        <div className="relative">
          <select
            value={activeVariable}
            onChange={(e) => setActiveVariable(e.target.value as OceanVariable)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-cyan-300 focus:outline-none focus:border-cyan-400 appearance-none cursor-pointer pr-8 shadow-inner"
          >
            {variablesList.map((v) => (
              <option key={v.key} value={v.key} className="bg-slate-950 text-slate-200">
                {v.label} ({v.unit})
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. DEPTH STRATIFICATION DROPDOWN MENU & SLIDER            */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeVariable !== 'sst' && (
        <div className="space-y-2 pt-2 border-t border-slate-800/70">
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-1.5 font-bold text-slate-300 uppercase tracking-wider">
              <Sliders size={13} className="text-cyan-400" />
              <span>Depth Stratification</span>
            </label>
            <span className="font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-700/50 text-[11px]">
              {selectedDepth} m
            </span>
          </div>

          {/* Depth Preset Dropdown */}
          <div className="relative">
            <select
              value={depthPresets.some(p => p.d === selectedDepth) ? selectedDepth : ''}
              onChange={(e) => {
                if (e.target.value) setSelectedDepth(Number(e.target.value));
              }}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-400 appearance-none cursor-pointer pr-8 shadow-inner"
            >
              <option value="" disabled>Custom Depth ({selectedDepth}m)</option>
              {depthPresets.map((p) => (
                <option key={p.d} value={p.d} className="bg-slate-950 text-slate-200">
                  {p.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Continuous Fine-Tuning Depth Slider */}
          <input
            type="range"
            min="5"
            max="2000"
            step="10"
            value={selectedDepth}
            onChange={(e) => setSelectedDepth(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-1"
          />
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. REGION FOCUS DROPDOWN MENU                             */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800/70">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Compass size={13} className="text-cyan-400" />
          <span>Region Focus</span>
        </label>
        <div className="relative">
          <select
            value={activePresetRegion}
            onChange={(e) => handleRegionChange(e.target.value as PresetRegion)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-400 appearance-none cursor-pointer pr-8 shadow-inner"
          >
            {regions.map((r) => (
              <option key={r.key} value={r.key} className="bg-slate-950 text-slate-200">
                {r.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. SCIENTIFIC COLORMAP DROPDOWN MENU                      */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800/70">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Palette size={13} className="text-cyan-400" />
          <span>Scientific Colormap</span>
        </label>
        <div className="relative">
          <select
            value={colorPalette}
            onChange={(e) => setColorPalette(e.target.value as PaletteName)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-400 appearance-none cursor-pointer pr-8 shadow-inner"
          >
            {palettes.map((p) => (
              <option key={p.key} value={p.key} className="bg-slate-950 text-slate-200">
                {p.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. SIMULATION LAYERS & SHADING MENU (TOGGLEABLE)          */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="pt-2 border-t border-slate-800/70 space-y-2">
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-bold text-slate-300 hover:text-white transition"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={13} className="text-cyan-400" />
            <span>LAYERS & SHADING SETTINGS</span>
          </span>
          <ChevronDown size={14} className={`transform transition ${showLayerMenu ? 'rotate-180' : ''}`} />
        </button>

        {showLayerMenu && (
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-3 text-xs">
            {/* Streamlines Toggle & Density */}
            <div className="space-y-1.5">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2 text-slate-300 font-medium">
                  <Wind size={13} className="text-cyan-400" /> Current Streamlines
                </span>
                <input
                  type="checkbox"
                  checked={showCurrents}
                  onChange={(e) => setShowCurrents(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
              </label>

              {showCurrents && (
                <div className="pt-1 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Particle Density</span>
                    <span className="font-mono text-cyan-300">{particleDensity}</span>
                  </div>
                  <input
                    type="range"
                    min="400"
                    max="2000"
                    step="100"
                    value={particleDensity}
                    onChange={(e) => setParticleDensity(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              )}
            </div>

            {/* Glider Sawtooth Missions Toggle */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2 text-slate-300 font-medium">
                  <Compass size={13} className="text-emerald-400" /> Underwater Gliders (3D Sawtooth)
                </span>
                <input
                  type="checkbox"
                  checked={showGlider}
                  onChange={(e) => setShowGlider(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
                />
              </label>
            </div>

            {/* Search & Rescue (SAR) Drift Controls */}
            {isSarMode && (
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/60 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-300 uppercase">
                  <span>🚨 SAR 72h Drift Simulation</span>
                  <button onClick={() => setIsSarMode(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Drift Object Type</label>
                  <select
                    value={sarObjectType}
                    onChange={(e) => setSarObjectType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1 text-[11px] text-slate-200"
                  >
                    <option value="life_raft">Life Raft (With Canopy)</option>
                    <option value="vessel_capsized">Capsized Fishing Boat</option>
                    <option value="oil_slick">Maritime Oil Slick</option>
                    <option value="person_in_water">Person in Water (PIW)</option>
                  </select>
                </div>

                {sarResult && (
                  <div className="text-[10px] font-mono text-slate-300 space-y-0.5 pt-1 border-t border-slate-800">
                    <div>72h Datum: {sarResult.search_datum_72h.latitude}°N, {sarResult.search_datum_72h.longitude}°E</div>
                    <div className="text-amber-400 font-bold">Search Radius: {sarResult.search_datum_72h.search_radius_nm} NM ({sarResult.search_datum_72h.search_radius_km} km)</div>
                  </div>
                )}
              </div>
            )}

            {/* Atmosphere & Clouds (Globe Mode) */}
            {viewMode === 'globe' && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-2 text-slate-300">
                    <Cloud size={13} className="text-sky-300" /> Cloud Cover
                  </span>
                  <input
                    type="checkbox"
                    checked={showClouds}
                    onChange={(e) => setShowClouds(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-2 text-slate-300">
                    <Sun size={13} className="text-cyan-300" /> Atmosphere Glow
                  </span>
                  <input
                    type="checkbox"
                    checked={showAtmosphere}
                    onChange={(e) => setShowAtmosphere(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                </label>
              </div>
            )}

            {/* Layer Opacity Slider */}
            <div className="space-y-1 pt-2 border-t border-slate-800/60">
              <div className="flex justify-between text-slate-400">
                <span>Layer Opacity</span>
                <span className="font-mono text-cyan-400">{Math.round(layerOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={layerOpacity}
                onChange={(e) => setLayerOpacity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Vertical Exaggeration Slider (Box Mode) */}
            {viewMode === 'box' && (
              <div className="space-y-1 pt-2 border-t border-slate-800/60">
                <div className="flex justify-between text-slate-400">
                  <span className="flex items-center gap-1"><Eye size={12} className="text-cyan-400" /> Vertical Exaggeration</span>
                  <span className="font-mono text-cyan-400 font-bold">{verticalExaggeration}x</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="1"
                  value={verticalExaggeration}
                  onChange={(e) => setVerticalExaggeration(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            )}
          </div>
        )}
      </div>

    </aside>
  );
};
