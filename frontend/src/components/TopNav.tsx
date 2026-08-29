import React from 'react';
import { useStore } from '../state/store';
import { Globe, Box, Compass } from 'lucide-react';

export const TopNav: React.FC = () => {
  const { viewMode, setViewMode, hoveredCoords } = useStore();

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-3 bg-slate-950/75 backdrop-blur-lg border-b border-slate-800/80 shadow-2xl">
      {/* Brand & MoES / INCOIS Title */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-400/30">
          <Globe className="w-6 h-6 text-slate-950 font-bold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-base tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              VARUNA-3D
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-400 border border-cyan-700/50">
              MoES / INCOIS
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            3D Ocean Numerical Model & In-Situ Argo Digital Twin
          </p>
        </div>
      </div>

      {/* View Mode Toggle (Globe vs Box) */}
      <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
        <button
          onClick={() => setViewMode('globe')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            viewMode === 'globe'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe size={15} />
          <span>3D Earth Globe</span>
        </button>

        <button
          onClick={() => setViewMode('box')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            viewMode === 'box'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Box size={15} />
          <span>Volumetric Transect</span>
        </button>
      </div>

      {/* Telemetry Status Bar */}
      <div className="flex items-center gap-5 text-xs text-slate-300">
        {/* Cursor Coordinates Readout */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <Compass size={14} className="text-cyan-400" />
          <span className="font-mono text-slate-300">
            {hoveredCoords
              ? `${hoveredCoords.lat.toFixed(2)}°N, ${hoveredCoords.lon.toFixed(2)}°E`
              : 'Indian Ocean (75.0°E, 15.0°N)'}
          </span>
        </div>

        {/* Live In-situ Telemetry Badge */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50"></span>
          <span className="font-semibold text-emerald-400 text-xs">350+ Active Floats</span>
        </div>
      </div>
    </header>
  );
};
