import React, { useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../state/store';
import { Layers, Sliders, Eye, Waves, Database } from 'lucide-react';

export const ControlPanel: React.FC = () => {
  const {
    activeVariable,
    setActiveVariable,
    selectedDepth,
    setSelectedDepth,
    verticalExaggeration,
    setVerticalExaggeration,
    availableDepths,
    setMetadata
  } = useStore();

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/slice/metadata')
      .then(res => setMetadata(res.data.depth_levels, res.data.time_steps, res.data.variables))
      .catch(console.error);
  }, []);

  return (
    <div className="absolute top-4 left-4 z-10 w-80 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-2xl text-slate-100 space-y-5">
      {/* Title & Brand */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <Waves className="text-cyan-400 w-6 h-6" />
        <div>
          <h1 className="font-bold text-lg leading-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            VARUNA-3D
          </h1>
          <p className="text-xs text-slate-400">INCOIS Numerical Model & In-Situ Twin</p>
        </div>
      </div>

      {/* Variable Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
          <Layers size={14} className="text-cyan-400" /> OCEAN VARIABLE
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveVariable('temp')}
            className={`py-2 px-3 rounded-lg text-xs font-medium transition ${
              activeVariable === 'temp' ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30' : 'bg-slate-800 hover:bg-slate-700'
            }`}
          >
            Temperature (°C)
          </button>
          <button
            onClick={() => setActiveVariable('sal')}
            className={`py-2 px-3 rounded-lg text-xs font-medium transition ${
              activeVariable === 'sal' ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30' : 'bg-slate-800 hover:bg-slate-700'
            }`}
          >
            Salinity (PSU)
          </button>
        </div>
      </div>

      {/* Depth Scrubber */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="font-semibold text-slate-400 flex items-center gap-1.5">
            <Sliders size={14} className="text-cyan-400" /> DEPTH SLICE
          </span>
          <span className="font-mono text-cyan-400 font-bold">{selectedDepth} m</span>
        </div>
        <input
          type="range"
          min="0"
          max="2000"
          step="10"
          value={selectedDepth}
          onChange={(e) => setSelectedDepth(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[0, 50, 100, 200, 500, 1000, 2000].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDepth(d)}
              className={`text-[10px] px-2 py-0.5 rounded ${
                selectedDepth === d ? 'bg-cyan-600 text-white' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400'
              }`}
            >
              {d}m
            </button>
          ))}
        </div>
      </div>

      {/* Vertical Exaggeration Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="font-semibold text-slate-400 flex items-center gap-1.5">
            <Eye size={14} className="text-cyan-400" /> VERTICAL EXAGGERATION
          </span>
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

      {/* Legend & Instructions */}
      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></span>
          <span>Yellow pins: In-situ Argo floats (Click to validate)</span>
        </div>
        <div className="flex items-center gap-2">
          <Database size={12} className="text-cyan-400" />
          <span>INCOIS McCreary 10-Day Objective Analysis</span>
        </div>
      </div>
    </div>
  );
};
