import React from 'react';
import { useStore } from '../state/store';
import { Sliders } from 'lucide-react';

export const DepthSlider: React.FC = () => {
  const { selectedDepth, setSelectedDepth } = useStore();

  return (
    <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-2 rounded-xl text-xs text-slate-100">
      <Sliders size={14} className="text-cyan-400" />
      <input
        type="range"
        min="0"
        max="2000"
        step="10"
        value={selectedDepth}
        onChange={(e) => setSelectedDepth(Number(e.target.value))}
        className="h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
      />
      <span className="font-mono text-cyan-400 font-bold">{selectedDepth}m</span>
    </div>
  );
};
