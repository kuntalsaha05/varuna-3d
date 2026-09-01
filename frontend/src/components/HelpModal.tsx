import React from 'react';
import { useStore } from '../state/store';
import { X, HelpCircle, Globe, Box, Wind, Anchor, Activity, Sliders } from 'lucide-react';

export const HelpModal: React.FC = () => {
  const { showHelpModal, setShowHelpModal } = useStore();

  if (!showHelpModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-6 select-none">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative text-white space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-700/50 text-cyan-400">
              <HelpCircle size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold">VARUNA-3D Workstation Guide</h2>
              <p className="text-xs text-slate-400">Operational Oceanographic Digital Twin & Validation System</p>
            </div>
          </div>

          <button
            onClick={() => setShowHelpModal(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Guide Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <Globe size={16} />
              <span>3D Globe vs Transect Box</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Toggle between the Photorealistic 3D Earth Globe and the Deep-Dive Volumetric Transect Box using the top-center mode switch.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <Anchor size={16} />
              <span>In-Situ ARGO Validation</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Click any pulsing yellow float marker on the ocean to inspect depth-resolved CTD profiles and compute RMSE, Mean Bias, and R² correlation.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold">
              <Wind size={16} />
              <span>Hydrodynamic Streamlines</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Observe 1,200+ GPU-advected particles modeling the Somali Jet, Arabian Sea Gyre, and Bay of Bengal circulation.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Sliders size={16} />
              <span>4D Temporal Playback</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Use the bottom timeline to animate through INCOIS 10-day forecast time steps at 0.5x, 1x, and 2x speeds.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2">
          <button
            onClick={() => setShowHelpModal(false)}
            className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

