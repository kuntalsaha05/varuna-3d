import React from 'react';
import { useStore } from '../state/store';
import {
  Globe,
  Box,
  Compass,
  RotateCcw,
  HelpCircle,
  ShieldAlert,
  GraduationCap,
  LifeBuoy
} from 'lucide-react';

export const TopNav: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    hoveredCoords,
    resetCamera,
    showHelpModal,
    setShowHelpModal,
    showWarningModal,
    setShowWarningModal,
    showStoryTour,
    setShowStoryTour,
    isSarMode,
    setIsSarMode,
    setSarPoint
  } = useStore();

  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-2.5 bg-slate-950/90 backdrop-blur-lg border-b border-slate-800/80 shadow-2xl">
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
            Operational Oceanographic 3D Digital Twin & Disaster Warning System
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
          <span>3D Globe</span>
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
          <span>Volumetric Box</span>
        </button>
      </div>

      {/* Action Controls & Operational Modules */}
      <div className="flex items-center gap-2 text-xs text-slate-300">
        
        {/* 1. Science Tour / Outreach Button */}
        <button
          onClick={() => setShowStoryTour(!showStoryTour)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
            showStoryTour
              ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/30'
              : 'bg-slate-900 border-slate-800 text-cyan-300 hover:bg-slate-800'
          }`}
          title="Public Outreach & Science Communication Tour"
        >
          <GraduationCap size={15} />
          <span className="hidden sm:inline">Science Tour</span>
        </button>

        {/* 2. Search & Rescue (SAR) Drift Tool Toggle */}
        <button
          onClick={() => {
            const nextMode = !isSarMode;
            setIsSarMode(nextMode);
            if (nextMode && !useStore.getState().sarPoint) {
              setSarPoint({ lat: 17.5, lon: 86.0 });
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
            isSarMode
              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/30'
              : 'bg-slate-900 border-slate-800 text-amber-300 hover:bg-slate-800'
          }`}
          title="72-Hour Search & Rescue Drift Simulator"
        >
          <LifeBuoy size={14} />
          <span className="hidden sm:inline">SAR Drift</span>
        </button>

        {/* 3. Coastal Disaster Situation Room Trigger */}
        <button
          onClick={() => setShowWarningModal(!showWarningModal)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900/80 border border-rose-600/60 text-rose-300 text-xs font-semibold transition shadow-md shadow-rose-950/40"
          title="INCOIS Coastal Disaster Warnings & Situation Room"
        >
          <ShieldAlert size={14} className="text-rose-400 animate-pulse" />
          <span className="hidden md:inline">Coastal Alerts</span>
        </button>

        {/* Cursor Coordinates Readout */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800">
          <Compass size={13} className="text-cyan-400" />
          <span className="font-mono text-[11px] text-slate-300">
            {hoveredCoords
              ? `${hoveredCoords.lat.toFixed(2)}°N, ${hoveredCoords.lon.toFixed(2)}°E`
              : '75.00°E, 15.00°N'}
          </span>
        </div>

        {/* Reset Camera Button */}
        <button
          onClick={resetCamera}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Reset Camera View"
        >
          <RotateCcw size={14} />
        </button>

        {/* Help / Guide Modal Button */}
        <button
          onClick={() => setShowHelpModal(!showHelpModal)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Workstation Quick Guide"
        >
          <HelpCircle size={14} />
        </button>
      </div>
    </header>
  );
};
