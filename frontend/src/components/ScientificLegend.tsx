import React, { useState } from 'react';
import { useStore } from '../state/store';
import { getVariableMeta, getPaletteGradientCSS } from '../utils/colormaps';
import { Info, HelpCircle, X, Navigation } from 'lucide-react';

export const ScientificLegend: React.FC = () => {
  const {
    activeVariable,
    colorPalette,
    currentMinVal,
    currentMaxVal,
    selectedDepth,
    viewMode
  } = useStore();

  const [showHint, setShowHint] = useState(true);
  const meta = getVariableMeta(activeVariable);
  const gradient = getPaletteGradientCSS(colorPalette);

  return (
    <div className="absolute bottom-6 right-6 z-10 flex flex-col items-end gap-2 pointer-events-auto select-none">
      
      {/* 1. Dismissible Interaction Guide Hint */}
      {showHint && (
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 shadow-xl animate-fade-in">
          <Navigation size={12} className="text-cyan-400 animate-spin-slow" />
          <span>
            <strong>Drag</strong> to rotate · <strong>Scroll</strong> to zoom · <strong>Click</strong> yellow float to inspect
          </span>
          <button
            onClick={() => setShowHint(false)}
            className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition"
            title="Dismiss Hint"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* 2. Scientific Colormap Scale & Symbology Card */}
      <div className="w-72 bg-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-3.5 shadow-2xl text-slate-100 space-y-2.5">
        {/* Header & Units */}
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-300">{meta.name}</span>
          <span className="font-mono text-cyan-300 font-bold bg-cyan-950/70 px-1.5 py-0.2 rounded border border-cyan-800/40 text-[11px]">
            {meta.unit}
          </span>
        </div>

        {/* Continuous Colorbar Gradient Ramp */}
        <div className="space-y-1">
          <div
            className="w-full h-3 rounded-md shadow-inner border border-slate-700/60"
            style={{ background: gradient }}
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400 font-medium">
            <span>{currentMinVal.toFixed(1)} {meta.unit}</span>
            <span className="text-slate-500">
              {activeVariable === 'sst' ? 'Surface' : `${selectedDepth}m`}
            </span>
            <span>{currentMaxVal.toFixed(1)} {meta.unit}</span>
          </div>
        </div>

        {/* Symbology Guide */}
        <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></span>
            <span>Argo Float (In-situ)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-cyan-400 shadow-sm shadow-cyan-400/50"></span>
            <span>Ocean Current Flow</span>
          </div>
        </div>
      </div>
    </div>
  );
};
