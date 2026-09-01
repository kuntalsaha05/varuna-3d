import React from 'react';
import { useStore } from '../state/store';
import { Globe, Box, Compass, RotateCcw, HelpCircle, Activity, Radio } from 'lucide-react';

export const TopNav: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    hoveredCoords,
    resetCamera,
    showHelpModal,
    setShowHelpModal
  } = useStore();

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-2.5 bg-slate-950/90 backdrop-blur-lg border-b border-slate-800/80 shadow-2xl">
      {/* Brand & MoES / INCOIS Title */}
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-400/30">
          <Globe className="w-5 h-5 text-slate-950 font-bold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-sm tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
              VARUNA-3D
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-400 border border-cyan-700/50">
              MoES / INCOIS
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            Operational Oceanographic 3D Digital Twin & Validation Workstation
          </p>
        </div>
      </div>

      {/* View Mode Switcher (Globe vs Box) */}
      <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
        <button
          onClick={() => setViewMode('globe')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            viewMode === 'globe'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe size={14} />
          <span>3D Earth Globe</span>
        </button>

        <button
          onClick={() => setViewMode('box')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            viewMode === 'box'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Box size={14} />
          <span>Volumetric Transect</span>
        </button>
      </div>

      {/* Action Controls & Telemetry Status */}
      <div className="flex items-center gap-3 text-xs text-slate-300">
        {/* Cursor Coordinates Readout */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
          <Compass size={13} className="text-cyan-400" />
          <span className="font-mono text-[11px] text-slate-300">
            {hoveredCoords
              ? `${hoveredCoords.lat.toFixed(2)}°N, ${hoveredCoords.lon.toFixed(2)}°E`
              : '75.00°E, 15.00°N'}
          </span>
        </div>

        {/* Backend / Data Health Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-700/40 text-emerald-400 font-medium text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50"></span>
          <span className="hidden md:inline">INCOIS API Active</span>
        </div>

        {/* Reset Camera Button */}
        <button
          onClick={resetCamera}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Reset Camera View"
        >
          <RotateCcw size={14} />
        </button>

        {/* Help / Guide Modal Button */}
        <button
          onClick={() => setShowHelpModal(!showHelpModal)}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Workstation Quick Guide"
        >
          <HelpCircle size={14} />
        </button>
      </div>
    </header>
  );
};
