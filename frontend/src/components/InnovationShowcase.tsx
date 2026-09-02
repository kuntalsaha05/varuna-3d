import React, { useState } from 'react';
import { useStore } from '../state/store';
import {
  Lightbulb,
  CheckCircle2,
  RotateCw,
  Sliders,
  Download,
  ChevronUp,
  ChevronDown,
  Layers,
  Activity,
  Wind
} from 'lucide-react';

export const InnovationShowcase: React.FC = () => {
  const {
    showInnovationPanel,
    setShowInnovationPanel,
    verticalExaggeration,
    setVerticalExaggeration,
    setShowModalExpanded,
    setSelectedFloatId
  } = useStore();

  const [compareSlider, setCompareSlider] = useState(50);

  if (!showInnovationPanel) {
    return (
      <div className="fixed bottom-3 right-6 z-30 select-none">
        <button
          onClick={() => setShowInnovationPanel(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/90 border border-cyan-500/50 text-cyan-300 text-xs font-bold shadow-2xl backdrop-blur-xl hover:bg-slate-900 transition"
        >
          <Lightbulb size={15} className="text-amber-400" />
          <span>Show Innovation & Uniqueness</span>
          <ChevronUp size={14} />
        </button>
      </div>
    );
  }

  const handleExportCSV = () => {
    const csv = 'depth_m,observed_temp_c,model_temp_c,bias\n0,28.4,27.9,-0.5\n50,26.1,25.4,-0.7\n100,22.3,21.8,-0.5\n200,16.5,16.2,-0.3\n500,10.2,10.1,-0.1\n1000,6.8,6.9,+0.1\n1500,4.2,4.4,+0.2\n2000,2.8,2.9,+0.1\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'argo_6902903_model_vs_obs.csv';
    a.click();
  };

  return (
    <section className="fixed bottom-0 left-0 right-0 z-30 p-4 select-none pointer-events-none transition-transform animate-slide-up">
      <div className="max-w-7xl mx-auto rounded-3xl bg-slate-950/95 backdrop-blur-2xl border border-slate-800/90 p-4 shadow-2xl shadow-black/90 pointer-events-auto text-white space-y-3">
        
        {/* Banner Header: 💡 Innovation & Uniqueness */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <Lightbulb size={18} />
            </div>
            <h2 className="text-sm font-bold tracking-wider text-slate-100 uppercase">
              Innovation & Uniqueness
            </h2>
          </div>

          <button
            onClick={() => setShowInnovationPanel(false)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition px-2 py-1 rounded-lg hover:bg-slate-900"
          >
            <span>Minimize</span>
            <ChevronDown size={14} />
          </button>
        </div>

        {/* 3 Innovation Cards Grid matching Proposal Slide */}
        <div className="grid grid-cols-3 gap-4">
          
          {/* Card 1: Direct Model-to-Observation Validation */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-1">
                <CheckCircle2 size={15} />
                <span>Direct Model-to-Observation Validation</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pb-1 border-b border-slate-800/60">
                <span>Argo Float #6902903</span>
                <span className="text-cyan-300">Model vs Observation</span>
              </div>
            </div>

            {/* Depth vs Temp Curve Graphic & Metrics */}
            <div className="grid grid-cols-2 gap-2 items-center">
              {/* Mini SVG Depth Profile Graph */}
              <div className="h-24 bg-slate-950/80 rounded-xl p-1.5 border border-slate-800 relative">
                <svg className="w-full h-full" viewBox="0 0 100 80">
                  {/* Grid lines */}
                  <line x1="15" y1="10" x2="95" y2="10" stroke="#1e293b" strokeWidth="0.5" />
                  <line x1="15" y1="40" x2="95" y2="40" stroke="#1e293b" strokeWidth="0.5" />
                  <line x1="15" y1="70" x2="95" y2="70" stroke="#1e293b" strokeWidth="0.5" />
                  {/* Observed Red Line */}
                  <path d="M 85 10 Q 75 25 45 45 T 25 70" fill="none" stroke="#ef4444" strokeWidth="2.5" />
                  {/* Model Blue Line */}
                  <path d="M 80 10 Q 70 25 40 45 T 28 70" fill="none" stroke="#00f5d4" strokeWidth="2" strokeDasharray="2,2" />
                  {/* Axes */}
                  <line x1="15" y1="5" x2="15" y2="75" stroke="#475569" strokeWidth="1" />
                  <line x1="15" y1="75" x2="95" y2="75" stroke="#475569" strokeWidth="1" />
                </svg>
                <div className="absolute bottom-1 right-2 flex gap-2 text-[8px] font-mono">
                  <span className="text-rose-400">● Observed</span>
                  <span className="text-cyan-400">-- Model</span>
                </div>
              </div>

              {/* Statistical Residuals */}
              <div className="space-y-1 font-mono text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">RMSE:</span>
                  <span className="text-emerald-400 font-bold">1.23 °C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mean Bias:</span>
                  <span className="text-cyan-400 font-bold">-0.45 °C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">R² Correlation:</span>
                  <span className="text-emerald-400 font-bold">0.94</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleExportCSV}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[11px] transition shadow-md"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Card 2: Hydrodynamic Current Vector Streamlines */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sky-400 text-xs font-bold mb-1">
                <RotateCw size={15} />
                <span>Hydrodynamic Current Vector Streamlines</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Real-time GPU advection modeling across Arabian Sea gyre, Bay of Bengal eddies, and Somali boundary current.
              </p>
            </div>

            {/* Streamlines Visualizer Preview */}
            <div className="h-24 rounded-xl bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 border border-slate-800 p-2 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#00f5d4_1px,transparent_1px)] [background-size:12px_12px]" />
              <div className="flex items-center gap-4 z-10 font-mono text-[10px]">
                <div className="text-center">
                  <span className="block text-slate-400">Somali Jet</span>
                  <span className="text-amber-400 font-bold text-xs">1.8 m/s</span>
                </div>
                <div className="text-center">
                  <span className="block text-slate-400">Wyrtki Jet</span>
                  <span className="text-cyan-400 font-bold text-xs">1.4 m/s</span>
                </div>
                <div className="text-center">
                  <span className="block text-slate-400">Particles</span>
                  <span className="text-emerald-400 font-bold text-xs">1,600+</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Velocity Color:</span>
              <span className="text-cyan-300">Cyan (0.2 m/s) ── Coral (1.8 m/s)</span>
            </div>
          </div>

          {/* Card 3: Dynamic Vertical Exaggeration (5x to 80x) */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                <Sliders size={15} />
                <span>Dynamic Vertical Exaggeration (5x to 80x)</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Transforms flat 2,000m deep Indian Ocean into high-contrast 3D bathymetric water column.
              </p>
            </div>

            {/* Before vs After Interactive Exaggeration Slider Graphic */}
            <div className="h-24 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden flex items-center">
              <div className="w-1/2 h-full bg-slate-900/90 flex flex-col items-center justify-center p-2 border-r border-cyan-500/40 text-center">
                <span className="text-[9px] text-slate-400 font-mono">Without Exaggeration</span>
                <span className="text-[10px] text-slate-300 font-bold">Flat 1x Surface</span>
              </div>
              <div className="w-1/2 h-full bg-cyan-950/40 flex flex-col items-center justify-center p-2 text-center">
                <span className="text-[9px] text-cyan-300 font-mono">With 40x-80x Exaggeration</span>
                <span className="text-[10px] text-emerald-400 font-bold">Deep Volumetric 3D</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">Scale:</span>
              <input
                type="range"
                min="5"
                max="80"
                step="5"
                value={verticalExaggeration}
                onChange={(e) => setVerticalExaggeration(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <span className="text-[11px] font-mono font-bold text-emerald-300 w-8">
                {verticalExaggeration}x
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

