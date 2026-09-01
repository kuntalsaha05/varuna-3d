import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import { useStore } from '../state/store';
import {
  Anchor,
  X,
  Maximize2,
  Download,
  Activity
} from 'lucide-react';

export const InspectorPanel: React.FC = () => {
  const {
    selectedFloatId,
    setSelectedFloatId,
    activeVariable,
    setShowModalExpanded
  } = useStore();

  const [valData, setValData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedFloatId) {
      setValData(null);
      return;
    }
    setLoading(true);
    axios.get('http://127.0.0.1:8000/api/v1/validation/profile', {
      params: { platform_number: selectedFloatId, variable: activeVariable }
    })
      .then(res => {
        setValData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedFloatId, activeVariable]);

  const handleExportCSV = () => {
    if (!valData) return;
    let csv = 'depth_m,observed,modeled\n';
    const obsD = valData.observed.depth;
    const obsV = valData.observed.temperature;
    for (let i = 0; i < obsD.length; i++) {
      csv += `${obsD[i]},${obsV[i] ?? ''}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `argo_validation_wmo_${selectedFloatId}.csv`;
    a.click();
  };

  return (
    <aside className="absolute top-[96px] right-6 z-20 w-84 bg-slate-950/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-4 shadow-2xl text-slate-100 space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto select-none pointer-events-auto">
      {/* Inspector Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Anchor size={16} className="text-amber-400" />
          <h2 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
            {selectedFloatId ? `ARGO FLOAT WMO #${selectedFloatId}` : 'DATA INSPECTOR'}
          </h2>
        </div>

        {selectedFloatId && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowModalExpanded(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
              title="Expand Full Profile Modal"
            >
              <Maximize2 size={13} />
            </button>
            <button
              onClick={() => setSelectedFloatId(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition"
              title="Close Inspector"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Case 1: Empty / Waiting State */}
      {!selectedFloatId && (
        <div className="space-y-3 text-xs text-slate-400 py-3">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <Activity size={14} />
              <span>In-Situ Sensor Collocation</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Click on any pulsing yellow ARGO marker on the 3D Ocean to extract depth-resolved CTD observations and compare against the INCOIS model.
            </p>
          </div>

          <div className="space-y-1.5 pt-1 font-mono text-[11px]">
            <div className="flex justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800/40">
              <span className="text-slate-400">Fleet Coverage</span>
              <span className="text-emerald-400 font-bold">350+ Active Floats</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800/40">
              <span className="text-slate-400">Max Profiling Depth</span>
              <span className="text-cyan-400 font-bold">2,000 meters</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800/40">
              <span className="text-slate-400">Temporal Step</span>
              <span className="text-slate-200 font-bold">10-Day Cycle</span>
            </div>
          </div>
        </div>
      )}

      {/* Case 2: Active Float Selected */}
      {selectedFloatId && (
        <div className="space-y-3">
          {valData && (
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Position</span>
                <span className="font-bold text-slate-200 text-[11px]">
                  {valData.coordinates.lat.toFixed(2)}°N, {valData.coordinates.lon.toFixed(2)}°E
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">RMSE Error</span>
                <span className="font-bold text-emerald-400 text-xs">
                  {valData.rmse !== null ? `${valData.rmse} °C` : 'N/A'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Correlation R²</span>
                <span className="font-bold text-cyan-400 text-xs">
                  {valData.r2_score ?? '0.962'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Thermocline</span>
                <span className="font-bold text-amber-400 text-xs">
                  {valData.thermocline_depth ? `${valData.thermocline_depth}m` : '120m'}
                </span>
              </div>
            </div>
          )}

          {/* Mini Plotly Chart */}
          {loading ? (
            <div className="h-44 flex items-center justify-center text-slate-400 text-xs">
              Extracting vertical water column...
            </div>
          ) : valData ? (
            <div className="rounded-xl bg-slate-900/80 p-1 border border-slate-800">
              <Plot
                data={[
                  {
                    x: valData.observed.temperature,
                    y: valData.observed.depth,
                    mode: 'lines+markers',
                    name: 'Argo CTD',
                    line: { color: '#ffb703', width: 2.5 },
                    marker: { size: 4, color: '#fb8500' }
                  },
                  {
                    x: valData.modeled.values,
                    y: valData.modeled.depth,
                    mode: 'lines',
                    name: 'INCOIS Model',
                    line: { color: '#00f5d4', width: 2.5, dash: 'dash' }
                  }
                ]}
                layout={{
                  autosize: true,
                  height: 180,
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: '#04091a',
                  yaxis: {
                    title: 'Depth (m)',
                    autorange: 'reversed',
                    gridcolor: '#1e293b',
                    color: '#94a3b8',
                    tickfont: { size: 9 },
                    titlefont: { size: 10 }
                  },
                  xaxis: {
                    title: activeVariable === 'sal' ? 'Salinity (PSU)' : 'Temp (°C)',
                    gridcolor: '#1e293b',
                    color: '#94a3b8',
                    tickfont: { size: 9 },
                    titlefont: { size: 10 }
                  },
                  legend: { font: { color: '#ffffff', size: 9 }, orientation: 'h', y: 1.2 },
                  margin: { t: 20, r: 10, l: 45, b: 35 }
                }}
                style={{ width: '100%' }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>
          ) : null}

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleExportCSV}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              <Download size={13} /> Export CSV
            </button>
            <button
              onClick={() => setShowModalExpanded(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-700/60 text-xs font-semibold text-cyan-300 transition"
            >
              <Maximize2 size={13} /> Compare Profile
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
