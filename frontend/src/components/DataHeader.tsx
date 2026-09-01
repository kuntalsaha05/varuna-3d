import React from 'react';
import { useStore } from '../state/store';
import { getVariableMeta } from '../utils/colormaps';
import { Layers, Sliders, Calendar, MapPin, Database } from 'lucide-react';

export const DataHeader: React.FC = () => {
  const {
    activeVariable,
    selectedDepth,
    timeIndex,
    timeSteps,
    currentMinVal,
    currentMaxVal,
    viewMode
  } = useStore();

  const meta = getVariableMeta(activeVariable);
  const totalSteps = timeSteps.length || 92;
  const currentStep = timeIndex < 0 ? totalSteps - 1 : timeIndex;
  const activeDate = timeSteps[currentStep] || '2024-01-10 10-Day Analysis';


  return (
    <div className="absolute top-[52px] left-0 right-0 z-20 flex items-center justify-between px-6 py-2 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/70 text-xs text-slate-300 shadow-md pointer-events-auto select-none">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-semibold text-slate-100 shadow-inner">
          <Layers size={13} className="text-cyan-400" />
          <span>{meta.name}</span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono text-[11px] font-bold border border-cyan-800/50">
            {meta.unit}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
          <Sliders size={12} className="text-cyan-400" />
          <span>Depth:</span>
          <span className="font-mono font-bold text-cyan-300">
            {activeVariable === 'sst' ? 'Surface (0 m)' : `${selectedDepth} m`}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
          <Calendar size={12} className="text-cyan-400" />
          <span>Date:</span>
          <span className="font-mono text-slate-200">
            {activeDate.split('T')[0]}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800/60 text-slate-400 text-[11px]">
          <MapPin size={11} className="text-slate-400" />
          <span>Indian Ocean Basin</span>
        </div>
      </div>


      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/70 border border-slate-800/80 font-mono text-[11px]">
          <span className="text-slate-400">Field Range:</span>
          <span className="text-cyan-300 font-semibold">{currentMinVal.toFixed(1)} {meta.unit}</span>
          <span className="text-slate-500">→</span>
          <span className="text-rose-300 font-semibold">{currentMaxVal.toFixed(1)} {meta.unit}</span>
        </div>


        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-700/40 text-cyan-300 text-[11px] font-medium">
          <Database size={12} className="text-cyan-400" />
          <span className="hidden sm:inline">{meta.datasetName}</span>
          <span className="sm:hidden">INCOIS 3D</span>
        </div>


        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-900 border border-slate-700 text-slate-300">
          {viewMode === 'globe' ? 'Globe View' : 'Transect Box'}
        </span>
      </div>
    </div>
  );
};
