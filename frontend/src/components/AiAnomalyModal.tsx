import React from 'react';
import { useStore } from '../state/store';
import {
  Flame,
  Sparkles,
  Droplets,
  X,
  Compass,
  Layers,
  Thermometer,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

export const AiAnomalyModal: React.FC = () => {
  const {
    selectedAnomaly,
    setSelectedAnomaly,
    setActiveVariable,
    setSelectedDepth,
    setCameraTarget,
    setShowCurrents
  } = useStore();

  if (!selectedAnomaly) return null;

  const isHot = selectedAnomaly?.type?.includes('Heatwave') ?? false;
  const isUpwelling = selectedAnomaly?.type?.includes('Upwelling') ?? false;
  const isSalinity = (selectedAnomaly?.type?.includes('Barrier') || selectedAnomaly?.type?.includes('Salinity')) ?? false;

  const handleInspectIn3D = () => {
    if (selectedAnomaly.lat && selectedAnomaly.lon) {
      if (isSalinity) {
        setActiveVariable('sal');
        setSelectedDepth(10);
      } else if (isHot) {
        setActiveVariable('sst');
        setSelectedDepth(5);
      } else {
        setActiveVariable('temp');
        setSelectedDepth(20);
        setShowCurrents(true);
      }
      setSelectedAnomaly(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-6 select-none pointer-events-auto animate-fade-in">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-white space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-2xl border"
              style={{
                backgroundColor: `${selectedAnomaly.color || '#00f5d4'}20`,
                borderColor: selectedAnomaly.color || '#00f5d4',
                color: selectedAnomaly.color || '#00f5d4'
              }}
            >
              {isHot ? <Flame size={22} /> : isUpwelling ? <Sparkles size={22} /> : <Droplets size={22} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{selectedAnomaly.type}</h3>
                <span
                  className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold uppercase"
                  style={{
                    backgroundColor: `${selectedAnomaly.color || '#00f5d4'}33`,
                    color: selectedAnomaly.color || '#00f5d4'
                  }}
                >
                  {selectedAnomaly.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">AI Extreme Value & Statistical Anomaly Diagnostic</p>
            </div>
          </div>

          <button
            onClick={() => setSelectedAnomaly(null)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Anomaly Metrics Grid */}
        <div className="grid grid-cols-3 gap-2.5 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Anomaly Deviation</span>
            <span
              className="font-bold text-sm"
              style={{ color: selectedAnomaly.color || '#00f5d4' }}
            >
              {selectedAnomaly.anomaly_delta}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Observed Value</span>
            <span className="font-bold text-slate-200 text-sm">
              {selectedAnomaly.value} {isSalinity ? 'PSU' : '°C'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Location</span>
            <span className="font-bold text-cyan-300 text-xs">
              {selectedAnomaly.lat}°N, {selectedAnomaly.lon}°E
            </span>
          </div>
        </div>

        {/* Scientific Oceanographic Description */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-xs">
          <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider">
            Oceanographic Physical Mechanism:
          </span>
          <p className="text-slate-300 leading-relaxed">
            {selectedAnomaly.description}
          </p>
        </div>

        {/* Severity & Action Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldAlert size={14} className="text-amber-400" />
            <span>Severity: <strong className="text-slate-200">{selectedAnomaly.severity}</strong></span>
          </div>

          <button
            onClick={handleInspectIn3D}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-500/20"
          >
            <span>Focus 3D Viewport</span>
            <ChevronRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
};

