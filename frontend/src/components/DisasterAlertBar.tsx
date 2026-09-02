import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../state/store';
import { AlertTriangle, ShieldAlert, Radio, ChevronRight, BellRing } from 'lucide-react';

export const DisasterAlertBar: React.FC = () => {
  const { disasterMode, setShowWarningModal, setActiveAlert } = useStore();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activeAlertIdx, setActiveAlertIdx] = useState(0);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/disaster/alerts')
      .then(res => {
        if (res.data.alerts) setAlerts(res.data.alerts);
      })
      .catch(console.error);
  }, []);

  // Cycle alert ticker every 6 seconds
  useEffect(() => {
    if (!alerts.length) return;
    const timer = setInterval(() => {
      setActiveAlertIdx((prev) => (prev + 1) % alerts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [alerts]);

  if (!alerts.length) return null;
  const curr = alerts[activeAlertIdx] || alerts[0];
  if (!curr) return null;

  return (
    <div className={`absolute top-[96px] left-1/2 -translate-x-1/2 z-25 max-w-2xl w-full px-4 select-none pointer-events-auto transition-all ${disasterMode ? 'opacity-100 scale-100' : 'opacity-95'}`}>
      <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-rose-500/50 shadow-2xl shadow-rose-950/40 text-slate-100 text-xs gap-3">
        {/* Pulsing Alert Badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
          <span className="px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-700/60 flex items-center gap-1">
            <ShieldAlert size={12} />
            {curr.severity}: {curr.hazard_type}
          </span>
        </div>

        {/* Ticker Headline */}
        <div className="flex-1 truncate text-slate-300 text-[11px]">
          <span className="text-rose-400 font-semibold">{curr.state}: </span>
          <span>Wave Height {curr.significant_wave_height} · Gusts {curr.wind_speed_gusts}</span>
        </div>

        {/* View Details Button */}
        <button
          onClick={() => {
            setActiveAlert(curr);
            setShowWarningModal(true);
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-[11px] transition shadow-md flex-shrink-0"
        >
          <span>Situation Room</span>
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
};

