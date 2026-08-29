import React, { useEffect } from 'react';
import axios from 'axios';
import { useStore, OceanVariable } from '../state/store';
import { PaletteName } from '../utils/colormaps';
import {
  Layers,
  Sliders,
  Eye,
  Activity,
  Wind,
  Cloud,
  Sun,
  Flame,
  Droplets,
  Sprout
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
    setMetadata
  } = useStore();

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/slice/metadata')
      .then(res => setMetadata(res.data.depth_levels, res.data.time_steps, res.data.variables))
      .catch(console.error);
  }, []);

  const variablesList: { key: OceanVariable; label: string; icon: any; color: string }[] = [
    { key: 'temp', label: '3D Temperature', icon: Flame, color: 'text-amber-400' },
    { key: 'sal', label: '3D Salinity', icon: Droplets, color: 'text-sky-400' },
    { key: 'sst', label: 'Sea Surface Temp', icon: Sun, color: 'text-rose-400' },
    { key: 'chlorophyll', label: 'Chlorophyll-a (BGC)', icon: Sprout, color: 'text-emerald-400' }
  ];

  const palettes: { key: PaletteName; label: string }[] = [
    { key: 'thermal', label: 'Thermal' },
    { key: 'haline', label: 'Haline' },
    { key: 'algae', label: 'Algae (Chl)' },
    { key: 'turbo', label: 'Turbo' },
    { key: 'viridis', label: 'Viridis' },
    { key: 'coolwarm', label: 'CoolWarm' }
  ];

  return (
    <aside className="absolute top-20 left-6 z-10 w-84 bg-slate-950/85 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-4 max-h-[82vh] overflow-y-auto">
      
      {/* 1. Oceanographic Variable Layer Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 tracking-wider">
          <span className="flex items-center gap-1.5"><Layers size={14} className="text-cyan-400" /> OCEAN VARIABLE LAYER</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {variablesList.map((v) => {
            const Icon = v.icon;
            const isSelected = activeVariable === v.key;
            return (
              <button
                key={v.key}
                onClick={() => setActiveVariable(v.key)}
                className={`flex items-center gap-2 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-cyan-400/80 text-cyan-300 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon size={14} className={v.color} />
                <span className="truncate">{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Vertical Depth Level Scrubber */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-400 flex items-center gap-1.5"><Sliders size={14} className="text-cyan-400" /> DEPTH LEVEL</span>
          <span className="font-mono text-cyan-400 font-bold bg-cyan-950/70 px-2 py-0.5 rounded-md border border-cyan-700/40">
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

        {/* Ocean Zone Quick Presets */}
        <div className="flex flex-wrap gap-1 pt-0.5">
          {[5, 50, 150, 300, 500, 1000, 2000].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDepth(d)}
              className={`text-[10px] px-2 py-0.5 rounded-md transition font-medium ${
                selectedDepth === d
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {d === 5 ? 'Surface' : `${d}m`}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Colormap Ramp Selection */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <Activity size={14} className="text-cyan-400" /> COLOR PALETTE
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {palettes.map((p) => (
            <button
              key={p.key}
              onClick={() => setColorPalette(p.key)}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition border ${
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

      {/* 4. Display Layer Toggles */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <label className="text-xs font-semibold text-slate-400">DIGITAL TWIN LAYERS</label>
        
        <div className="space-y-1.5 text-xs">
          <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 cursor-pointer hover:bg-slate-900">
            <span className="flex items-center gap-2 text-slate-300"><Wind size={14} className="text-cyan-400" /> Ocean Current Streamlines</span>
            <input
              type="checkbox"
              checked={showCurrents}
              onChange={(e) => setShowCurrents(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
          </label>

          {viewMode === 'globe' && (
            <>
              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 cursor-pointer hover:bg-slate-900">
                <span className="flex items-center gap-2 text-slate-300"><Cloud size={14} className="text-sky-300" /> Atmospheric Clouds</span>
                <input
                  type="checkbox"
                  checked={showClouds}
                  onChange={(e) => setShowClouds(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 cursor-pointer hover:bg-slate-900">
                <span className="flex items-center gap-2 text-slate-300"><Sun size={14} className="text-cyan-300" /> Rayleigh Atmosphere Glow</span>
                <input
                  type="checkbox"
                  checked={showAtmosphere}
                  onChange={(e) => setShowAtmosphere(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
              </label>
            </>
          )}

          {viewMode === 'box' && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5"><Eye size={13} className="text-cyan-400" /> Vertical Exaggeration</span>
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
      </div>

      {/* 5. Layer Opacity */}
      <div className="space-y-1 pt-2 border-t border-slate-800/80 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-400">Layer Opacity</span>
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
    </aside>
  );
};
