import React from 'react';
import { useStore } from '../state/store';
import { Activity } from 'lucide-react';

export const StatsHUD: React.FC = () => {
  const {
    viewMode,
    selectedDepth,
    verticalExaggeration,
    latRange,
    lonRange
  } = useStore();

  return (
    <div className="absolute bottom-6 left-4 z-10 bg-slate-900/85 backdrop-blur-md border border-slate-800/80 rounded-xl px-3.5 py-2.5 shadow-xl text-slate-300 text-[10px] space-y-1 select-none pointer-events-none hidden md:block">
      <div className="flex items-center gap-2 font-mono text-cyan-400 font-bold border-b border-slate-800 pb-1">
        <Activity size={11} />
        <span>VIEWPORT TELEMETRY</span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[9px] text-slate-400">
        <div>Mode: <span className="text-cyan-300 font-semibold">{viewMode === 'globe' ? '3D Earth Globe' : 'Regional Basin'}</span></div>
        <div>Domain: <span className="text-slate-200">{latRange[0]}° to {latRange[1]}°N</span></div>
        <div>Longitude: <span className="text-slate-200">{lonRange[0]}° to {lonRange[1]}°E</span></div>
        <div>Layer Depth: <span className="text-cyan-300 font-bold">{selectedDepth} m</span></div>
      </div>
    </div>
  );
};


