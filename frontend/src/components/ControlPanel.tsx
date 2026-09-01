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
  ChevronDown,
  ChevronRight,
  Radio,
  SlidersHorizontal,
  Info
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
    activePresetRegion,
    setActivePresetRegion,
    setCameraTarget,
    setMetadata
  } = useStore();

  // Accordion Section Open States
  const [openSections, setOpenSections] = useState({
    explore: true,
    layers: true,
    appearance: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/slice/metadata')
      .then(res => setMetadata(res.data.depth_levels, res.data.time_steps, res.data.variables))
      .catch(console.error);
  }, []);

  const variablesList: { key: OceanVariable; label: string; icon: any; color: string; unit: string }[] = [
    { key: 'temp', label: '3D Temperature', icon: Flame, color: 'text-amber-400', unit: '°C' },
    { key: 'sal', label: '3D Salinity', icon: Droplets, color: 'text-sky-400', unit: 'PSU' },
    { key: 'sst', label: 'Sea Surface Temp', icon: Sun, color: 'text-rose-400', unit: '°C' },
    { key: 'chlorophyll', label: 'Chlorophyll-a', icon: Sprout, color: 'text-emerald-400', unit: 'mg/m³' }
  ];

  const palettes: { key: PaletteName; label: string }[] = [
    { key: 'thermal', label: 'Thermal' },
    { key: 'haline', label: 'Haline' },
    { key: 'algae', label: 'Algae' },
    { key: 'turbo', label: 'Turbo' },
    { key: 'viridis', label: 'Viridis' },
    { key: 'coolwarm', label: 'CoolWarm' }
  ];

  const regions: { key: PresetRegion; label: string; coords: [number, number, number] }[] = [
    { key: 'all', label: 'Full Basin', coords: [22, 18, 38] },
    { key: 'arabian_sea', label: 'Arabian Sea', coords: [12, 16, 26] },
    { key: 'bay_of_bengal', label: 'Bay of Bengal', coords: [28, 16, 26] },
    { key: 'equator', label: 'Equatorial Jet', coords: [20, 0, 24] }
  ];

  const handleRegionJump = (reg: PresetRegion, coords: [number, number, number]) => {
    setActivePresetRegion(reg);
    setCameraTarget(coords);
  };

  return (
    <aside className="absolute top-26 left-6 z-10 w-80 bg-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 shadow-2xl text-slate-100 space-y-3 max-h-[78vh] overflow-y-auto select-none pointer-events-auto">
      
      {/* ────────────────────────────────────────────────────────── */}
      {/* SECTION 1: 🔭 EXPLORE & PRIMARY DATA CONTROLS              */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/40">
        <button
          onClick={() => toggleSection('explore')}
          className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-900/80 text-xs font-bold text-slate-300 hover:text-white transition"
        >
          <span className="flex items-center gap-2">
            <Layers size={14} className="text-cyan-400" />
            <span>1. EXPLORE DATASET</span>
          </span>
          {openSections.explore ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {openSections.explore && (
          <div className="p-3 space-y-3">
            {/* Variable Selection Grid */}
            <div className="grid grid-cols-2 gap-1.5">
              {variablesList.map((v) => {
                const Icon = v.icon;
                const isSelected = activeVariable === v.key;
                return (
                  <button
                    key={v.key}
                    onClick={() => setActiveVariable(v.key)}
                    className={`flex items-center gap-2 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all border text-left ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/20'
                        : 'bg-slate-900/90 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <Icon size={14} className={v.color} />
                    <div className="min-w-0">
                      <div className="truncate">{v.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Depth Level Slider */}
            {activeVariable !== 'sst' && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Sliders size={13} className="text-cyan-400" /> Depth Level
                  </span>
                  <span className="font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-700/50">
                    {selectedDepth} m
                  </span>
                </div>

                <input
                  type="range"
                  min="5"
                  max="2000"
                  step="10"
                  value={selectedDepth}
                  onChange={(e) => setSelectedDepth(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />

                {/* Ocean Stratification Presets */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {[
                    { d: 5, label: 'Surface' },
                    { d: 50, label: 'Mixed Layer' },
                    { d: 150, label: 'Thermocline' },
                    { d: 500, label: '500m' },
                    { d: 1000, label: '1000m' },
                    { d: 2000, label: 'Abyssal' }
                  ].map((item) => (
                    <button
                      key={item.d}
                      onClick={() => setSelectedDepth(item.d)}
                      className={`text-[10px] px-2 py-0.5 rounded-md transition font-medium ${
                        selectedDepth === item.d
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Regional Camera Presets */}
            <div className="space-y-1 pt-1 border-t border-slate-800/60">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Compass size={12} className="text-cyan-400" /> Region Focus
              </span>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                {regions.map((reg) => (
                  <button
                    key={reg.key}
                    onClick={() => handleRegionJump(reg.key, reg.coords)}
                    className={`px-2 py-1 rounded-lg text-center transition border ${
                      activePresetRegion === reg.key
                        ? 'bg-slate-800 border-cyan-500/80 text-cyan-300 font-semibold'
                        : 'bg-slate-900/60 border-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {reg.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* SECTION 2: 🛰️ SIMULATION LAYERS & IN-SITU CONTROLS          */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/40">
        <button
          onClick={() => toggleSection('layers')}
          className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-900/80 text-xs font-bold text-slate-300 hover:text-white transition"
        >
          <span className="flex items-center gap-2">
            <Radio size={14} className="text-cyan-400" />
            <span>2. LAYERS & IN-SITU</span>
          </span>
          {openSections.layers ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {openSections.layers && (
          <div className="p-3 space-y-2 text-xs">
            {/* Ocean Current Streamlines Toggle */}
            <div className="space-y-1.5 p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
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

            {/* Globe Atmosphere & Clouds */}
            {viewMode === 'globe' && (
              <>
                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 cursor-pointer hover:bg-slate-900">
                  <span className="flex items-center gap-2 text-slate-300">
                    <Cloud size={13} className="text-sky-300" /> Cloud Layer
                  </span>
                  <input
                    type="checkbox"
                    checked={showClouds}
                    onChange={(e) => setShowClouds(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 cursor-pointer hover:bg-slate-900">
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
              </>
            )}
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* SECTION 3: 🎨 APPEARANCE & RENDERING CONTROLS              */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/40">
        <button
          onClick={() => toggleSection('appearance')}
          className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-900/80 text-xs font-bold text-slate-300 hover:text-white transition"
        >
          <span className="flex items-center gap-2">
            <Palette size={14} className="text-cyan-400" />
            <span>3. APPEARANCE & SHADING</span>
          </span>
          {openSections.appearance ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {openSections.appearance && (
          <div className="p-3 space-y-3 text-xs">
            {/* Colormap Grid */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium">Scientific Colormap</label>
              <div className="grid grid-cols-3 gap-1">
                {palettes.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setColorPalette(p.key)}
                    className={`py-1 px-1.5 rounded-lg text-[11px] font-medium transition border ${
                      colorPalette === p.key
                        ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Layer Opacity */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Model Opacity</span>
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

            {/* Vertical Exaggeration (Box Mode) */}
            {viewMode === 'box' && (
              <div className="space-y-1 pt-1 border-t border-slate-800/60">
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
                <p className="text-[10px] text-slate-500 italic">
                  Expands depth scale visually without altering physical values.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

    </aside>
  );
};
