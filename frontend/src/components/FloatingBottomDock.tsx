import React from 'react';
import { useStore } from '../state/store';
import {
  Home,
  Layers,
  Ruler,
  Sliders,
  Settings,
  Sparkles,
  Calendar,
  Compass
} from 'lucide-react';

export const FloatingBottomDock: React.FC = () => {
  const {
    resetCamera,
    showAiCopilot,
    setShowAiCopilot,
    showHelpModal,
    setShowHelpModal,
    timeSteps,
    timeIndex
  } = useStore();

  const formattedDate = React.useMemo(() => {
    if (!timeSteps || timeSteps.length === 0) return '28 Aug 2026 • 12:00 UTC';
    const idx = timeIndex >= 0 && timeIndex < timeSteps.length ? timeIndex : timeSteps.length - 1;
    const raw = timeSteps[idx];
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return `${raw} • 12:00 UTC`;
      const day = d.getUTCDate().toString().padStart(2, '0');
      const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
      const year = d.getUTCFullYear();
      return `${day} ${month} ${year} • 12:00 UTC`;
    } catch {
      return `${raw} • 12:00 UTC`;
    }
  }, [timeSteps, timeIndex]);

  return (
    <div className="absolute bottom-6 left-6 right-6 z-25 flex items-center justify-between pointer-events-none select-none">
      {/* 1. Center Floating Glass Tool Dock */}
      <div className="flex items-center gap-1 p-1.5 rounded-full bg-slate-950/90 backdrop-blur-2xl border border-slate-800/90 shadow-2xl shadow-black/80 pointer-events-auto">
        <button
          onClick={resetCamera}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-900/90 transition text-[10px] font-semibold"
          title="Reset Camera Target"
        >
          <Home size={15} className="text-cyan-400" />
          <span>Home</span>
        </button>

        <button
          onClick={() => {
            const btn = document.querySelector('[data-panel="layers"]') as HTMLElement;
            if (btn) btn.click();
          }}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-900/90 transition text-[10px] font-semibold"
          title="Toggle Layers"
        >
          <Layers size={15} className="text-sky-400" />
          <span>Layers</span>
        </button>

        <button
          onClick={() => setShowHelpModal(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-900/90 transition text-[10px] font-semibold"
          title="Measurement & Tools"
        >
          <Ruler size={15} className="text-amber-400" />
          <span>Measure</span>
        </button>

        <button
          onClick={() => {
            const scrubber = document.getElementById('time-scrubber');
            if (scrubber) scrubber.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-900/90 transition text-[10px] font-semibold"
          title="4D Time Timeline"
        >
          <Sliders size={15} className="text-emerald-400" />
          <span>Time Slider</span>
        </button>

        <button
          onClick={() => setShowAiCopilot(!showAiCopilot)}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-900/60 transition text-[10px] font-bold shadow-lg"
          title="Varuna-AI Copilot"
        >
          <Sparkles size={15} className="text-cyan-300 animate-spin" />
          <span>Varuna-AI</span>
        </button>

        <button
          onClick={() => setShowHelpModal(!showHelpModal)}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-900/90 transition text-[10px] font-semibold"
          title="Settings & Guide"
        >
          <Settings size={15} className="text-slate-400" />
          <span>Settings</span>
        </button>
      </div>

      {/* 2. Floating Date Tag on Right */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/90 backdrop-blur-2xl border border-slate-800/90 text-xs font-mono font-bold text-slate-200 shadow-2xl pointer-events-auto">
        <Calendar size={13} className="text-cyan-400" />
        <span>{formattedDate}</span>
      </div>
    </div>
  );
};

