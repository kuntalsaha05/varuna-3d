import React, { useState } from 'react';
import { useStore } from '../state/store';
import {
  Layers,
  X,
  Wind,
  Droplets,
  Thermometer,
  Trees,
  Mountain,
  Cloud,
  ChevronDown
} from 'lucide-react';

export const FloatingLayerManager: React.FC = () => {
  const {
    activeVariable,
    setActiveVariable,
    selectedDepth,
    setSelectedDepth,
    showCurrents,
    setShowCurrents,
    showClouds,
    setShowClouds,
    showBathymetry,
    setShowBathymetry,
    availableDepths
  } = useStore();

  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-28 left-6 z-25 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-cyan-500/40 text-cyan-300 text-xs font-bold shadow-2xl hover:bg-slate-900 transition select-none"
      >
        <Layers size={14} />
        <span>Layers</span>
      </button>
    );
  }

  return (
    <div className="absolute top-28 left-6 z-25 w-60 rounded-3xl bg-slate-950/95 backdrop-blur-2xl border border-slate-800/90 p-4 shadow-2xl shadow-black/80 text-white select-none pointer-events-auto space-y-3.5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Layers size={15} className="text-cyan-400" />
          <h3 className="text-xs font-bold tracking-wider text-slate-200">Layers</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
        >
          <X size={14} />
        </button>
      </div>

      {/* Layer List Matching Prototype Slide */}
      <div className="space-y-2 text-xs">
        {/* 1. SST */}
        <label
          onClick={() => setActiveVariable('sst')}
          className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition ${
            activeVariable === 'sst'
              ? 'bg-cyan-950/50 border-cyan-500/60 text-cyan-200'
              : 'bg-slate-900/40 border-slate-800/60 text-slate-300 hover:bg-slate-900/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activeVariable === 'sst'}
              onChange={() => setActiveVariable('sst')}
              className="rounded accent-cyan-400 cursor-pointer"
            />
            <span className="font-semibold text-[11px]">SST (°C)</span>
          </div>
          <div
            className="w-8 h-2 rounded-full border border-slate-700/60"
            style={{
              background: 'linear-gradient(to right, #00f5d4, #ffb703, #ef4444)'
            }}
          />
        </label>

        {/* 2. Salinity */}
        <label
          onClick={() => setActiveVariable('sal')}
          className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition ${
            activeVariable === 'sal'
              ? 'bg-cyan-950/50 border-cyan-500/60 text-cyan-200'
              : 'bg-slate-900/40 border-slate-800/60 text-slate-300 hover:bg-slate-900/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activeVariable === 'sal'}
              onChange={() => setActiveVariable('sal')}
              className="rounded accent-cyan-400 cursor-pointer"
            />
            <span className="font-semibold text-[11px]">Salinity (PSU)</span>
          </div>
          <div
            className="w-8 h-2 rounded-full border border-slate-700/60"
            style={{
              background: 'linear-gradient(to right, #3a0ca3, #4361ee, #4cc9f0)'
            }}
          />
        </label>

        {/* 3. Chlorophyll-a */}
        <label
          onClick={() => setActiveVariable('chlorophyll')}
          className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition ${
            activeVariable === 'chlorophyll'
              ? 'bg-cyan-950/50 border-cyan-500/60 text-cyan-200'
              : 'bg-slate-900/40 border-slate-800/60 text-slate-300 hover:bg-slate-900/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activeVariable === 'chlorophyll'}
              onChange={() => setActiveVariable('chlorophyll')}
              className="rounded accent-cyan-400 cursor-pointer"
            />
            <span className="font-semibold text-[11px]">Chlorophyll-a</span>
          </div>
          <div
            className="w-8 h-2 rounded-full border border-slate-700/60"
            style={{
              background: 'linear-gradient(to right, #004b23, #38b000, #ccff33)'
            }}
          />
        </label>

        {/* 4. Currents (m/s) */}
        <label
          onClick={() => setShowCurrents(!showCurrents)}
          className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition ${
            showCurrents
              ? 'bg-cyan-950/50 border-cyan-500/60 text-cyan-200'
              : 'bg-slate-900/40 border-slate-800/60 text-slate-300 hover:bg-slate-900/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showCurrents}
              onChange={(e) => setShowCurrents(e.target.checked)}
              className="rounded accent-cyan-400 cursor-pointer"
            />
            <span className="font-semibold text-[11px]">Currents (m/s)</span>
          </div>
          <Wind size={13} className="text-cyan-400 animate-pulse" />
        </label>

        {/* 5. Bathymetry */}
        <label
          onClick={() => setShowBathymetry(!showBathymetry)}
          className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition ${
            showBathymetry
              ? 'bg-cyan-950/50 border-cyan-500/60 text-cyan-200'
              : 'bg-slate-900/40 border-slate-800/60 text-slate-300 hover:bg-slate-900/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showBathymetry}
              onChange={(e) => setShowBathymetry(e.target.checked)}
              className="rounded accent-cyan-400 cursor-pointer"
            />
            <span className="font-semibold text-[11px]">Bathymetry</span>
          </div>
          <Mountain size={13} className="text-sky-400" />
        </label>

        {/* 6. Cloud Cover */}
        <label
          onClick={() => setShowClouds(!showClouds)}
          className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition ${
            showClouds
              ? 'bg-cyan-950/50 border-cyan-500/60 text-cyan-200'
              : 'bg-slate-900/40 border-slate-800/60 text-slate-300 hover:bg-slate-900/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showClouds}
              onChange={(e) => setShowClouds(e.target.checked)}
              className="rounded accent-cyan-400 cursor-pointer"
            />
            <span className="font-semibold text-[11px]">Cloud Cover</span>
          </div>
          <Cloud size={13} className="text-slate-400" />
        </label>
      </div>

      {/* Integrated Depth Slider: Depth - 0 m */}
      <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-300">Depth</span>
          <span className="font-mono font-bold text-cyan-400 text-[11px]">
            {selectedDepth} m
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="2000"
          step="25"
          value={selectedDepth}
          onChange={(e) => setSelectedDepth(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <div className="flex justify-between text-[9px] font-mono text-slate-500">
          <span>0 m</span>
          <span>2000 m</span>
        </div>
      </div>
    </div>
  );
};

