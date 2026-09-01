import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../state/store';
import {
  ShieldAlert,
  X,
  Wind,
  Waves,
  MapPin,
  Clock,
  Download,
  AlertTriangle,
  LifeBuoy,
  FileText
} from 'lucide-react';

export const DisasterModal: React.FC = () => {
  const {
    showWarningModal,
    setShowWarningModal,
    activeAlert,
    setActiveAlert,
    setIsSarMode,
    setSarPoint
  } = useStore();

  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!showWarningModal) return;
    axios.get('http://127.0.0.1:8000/api/v1/disaster/alerts')
      .then(res => {
        if (res.data.alerts) {
          setAlerts(res.data.alerts);
          if (!activeAlert && res.data.alerts.length > 0) {
            setActiveAlert(res.data.alerts[0]);
          }
        }
      })
      .catch(console.error);
  }, [showWarningModal]);

  const handleExportSITREP = () => {
    if (!activeAlert) return;
    const sitrep = `==================================================================
INCOIS / MoES MARITIME DISASTER SITUATION REPORT (SITREP)
==================================================================
ALERT IDENTIFIER: ${activeAlert.id}
ISSUED BY: ${activeAlert.authority}
TIMESTAMP: ${activeAlert.issued_at}
SEVERITY LEVEL: ${activeAlert.severity}
HAZARD TYPE: ${activeAlert.hazard_type}

AFFECTED REGION:
State / Coastline: ${activeAlert.state} (${activeAlert.coastline})
Coastal Districts: ${activeAlert.coastal_districts.join(', ')}

OCEANOGRAPHIC PARAMETERS:
- Significant Wave Height (Hs): ${activeAlert.significant_wave_height}
- Wind Gusts: ${activeAlert.wind_speed_gusts}
- Central Atmospheric Pressure: ${activeAlert.central_pressure}
- Time of Impact Window: ${activeAlert.estimated_time_impact}

OPERATIONAL ADVISORY & COAST GUARD ACTIONS:
${activeAlert.advisory}
==================================================================
End of Official INCOIS Advisory Bulletin
`;

    const blob = new Blob([sitrep], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `INCOIS_SITREP_${activeAlert.id}.txt`;
    a.click();
  };

  if (!showWarningModal) return null;
  const current = activeAlert || alerts[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 select-none pointer-events-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative text-white space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-950/80 border border-rose-700/60 text-rose-400">
              <ShieldAlert size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">INCOIS Coastal Disaster & Hazard Situation Room</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-700/50">
                  Live Operations
                </span>
              </div>
              <p className="text-xs text-slate-400">Early Warning Network for Cyclones, Swell Surges, and Marine Emergencies</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSITREP}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition"
              title="Download Official SITREP Bulletin"
            >
              <Download size={14} /> Export SITREP
            </button>
            <button
              onClick={() => setShowWarningModal(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 2-Column Situation Room Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Left Column: Active Coastal Alert List */}
          <div className="space-y-2 border-r border-slate-800/80 pr-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Active Coastal Warnings</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {alerts.map((al) => (
                <button
                  key={al.id}
                  onClick={() => setActiveAlert(al)}
                  className={`w-full text-left p-3 rounded-2xl border transition ${
                    current?.id === al.id
                      ? 'bg-slate-900 border-rose-500/80 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
                    <span style={{ color: al.severity_color }}>{al.severity}</span>
                    <span className="text-slate-500 font-mono">{al.id}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 truncate">{al.state}</div>
                  <div className="text-[11px] text-slate-400 truncate">{al.hazard_type}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Right 2-Columns: Selected Alert Deep-Dive */}
          {current && (
            <div className="md:col-span-2 space-y-3.5">
              {/* Alert Banner Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase" style={{ backgroundColor: `${current.severity_color}22`, color: current.severity_color, borderColor: current.severity_color }}>
                    {current.severity}: {current.hazard_type}
                  </span>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Clock size={12} /> {current.issued_at}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">{current.state} · {current.coastline}</h4>
                <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                  <strong className="text-rose-400 block mb-1 uppercase text-[10px] tracking-wider">Operational Advisory:</strong>
                  {current.advisory}
                </div>
              </div>

              {/* Physical Threat Parameters Grid */}
              <div className="grid grid-cols-3 gap-2.5 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase flex items-center gap-1">
                    <Waves size={12} className="text-cyan-400" /> Wave Height (Hs)
                  </span>
                  <span className="font-bold text-cyan-300 text-sm">{current.significant_wave_height}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase flex items-center gap-1">
                    <Wind size={12} className="text-rose-400" /> Wind Gusts
                  </span>
                  <span className="font-bold text-rose-300 text-sm">{current.wind_speed_gusts}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase flex items-center gap-1">
                    <Clock size={12} className="text-amber-400" /> Time Window
                  </span>
                  <span className="font-bold text-amber-300 text-xs">{current.estimated_time_impact}</span>
                </div>
              </div>

              {/* Affected Coastal Districts */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-semibold text-[11px]">
                  <MapPin size={12} className="text-rose-400" /> HIGH-RISK COASTAL DISTRICTS:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {current.coastal_districts.map((d: string) => (
                    <span key={d} className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-700/80 text-slate-200 font-mono text-[11px]">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Launch Search & Rescue Action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400">Authority: {current.authority}</span>
                <button
                  onClick={() => {
                    setIsSarMode(true);
                    setSarPoint({ lat: 18.5, lon: 86.2 });
                    setShowWarningModal(false);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-500/20"
                >
                  <LifeBuoy size={14} />
                  <span>Launch 72h SAR Drift Simulation</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

