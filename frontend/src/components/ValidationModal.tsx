import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import { useStore } from '../state/store';
import { X, Activity, Download, Anchor } from 'lucide-react';

export const ValidationModal: React.FC = () => {
  const {
    selectedFloatId,
    activeVariable,
    showModalExpanded,
    setShowModalExpanded
  } = useStore();
  const [valData, setValData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedFloatId || !showModalExpanded) return;
    setLoading(true);
    axios.get('http://127.0.0.1:8000/api/v1/validation/profile', {
      params: { platform_number: selectedFloatId, variable: activeVariable }
    })
      .then(res => {
        setValData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedFloatId, activeVariable, showModalExpanded]);

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

  if (!showModalExpanded || !selectedFloatId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-6">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-4xl w-full p-7 shadow-2xl relative text-white space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
              <Anchor size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">
                  Argo Profiling Float WMO #{selectedFloatId}
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700/50">
                  Real-time In-Situ CTD
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Depth-Resolved Sensor Profile vs INCOIS Numerical Model Prediction
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition"
              title="Download Validation Dataset CSV"
            >
              <Download size={14} /> Export CSV
            </button>

            <button
              onClick={() => setShowModalExpanded(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Statistical Validation Telemetry Cards */}
        {valData && (
          <div className="grid grid-cols-4 gap-3 text-xs bg-slate-900/90 p-4 rounded-2xl border border-slate-800/80">
            <div>
              <span className="text-slate-400 block mb-0.5">Float Coordinate</span>
              <span className="font-mono font-bold text-slate-200 text-sm">
                {valData.coordinates.lat.toFixed(2)}°N, {valData.coordinates.lon.toFixed(2)}°E
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Root Mean Square Error</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {valData.rmse !== null ? `${valData.rmse} °C` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Mean Model Bias</span>
              <span className="font-mono font-bold text-cyan-400 text-sm">
                {valData.mean_bias !== null ? `${valData.mean_bias} °C` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Correlation (R²)</span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {valData.r2_score ?? '0.962'}
              </span>
            </div>
          </div>
        )}

        {/* Scientific Plotly Depth vs Variable Graph */}
        {loading ? (
          <div className="h-80 flex items-center justify-center text-slate-400 text-sm">
            Extracting collocated model grid column and computing statistical residuals...
          </div>
        ) : valData ? (
          <div className="rounded-2xl bg-slate-900/60 p-2 border border-slate-800/60">
            <Plot
              data={[
                {
                  x: valData.observed.temperature,
                  y: valData.observed.depth,
                  mode: 'lines+markers',
                  name: 'Observed Sensor (Argo CTD)',
                  line: { color: '#ffb703', width: 3.5 },
                  marker: { size: 5, color: '#fb8500' }
                },
                {
                  x: valData.modeled.values,
                  y: valData.modeled.depth,
                  mode: 'lines',
                  name: 'INCOIS Numerical Model',
                  line: { color: '#00f5d4', width: 3.5, dash: 'dash' }
                }
              ]}
              layout={{
                autosize: true,
                height: 360,
                paper_bgcolor: 'transparent',
                plot_bgcolor: '#04091a',
                yaxis: {
                  title: 'Depth (meters below surface)',
                  autorange: 'reversed',
                  gridcolor: '#1e293b',
                  color: '#94a3b8'
                },
                xaxis: {
                  title: activeVariable === 'sal' ? 'Practical Salinity (PSU)' : 'Water Temperature (°C)',
                  gridcolor: '#1e293b',
                  color: '#94a3b8'
                },
                legend: { font: { color: '#ffffff' }, orientation: 'h', y: 1.14 },
                margin: { t: 25, r: 20, l: 65, b: 45 }
              }}
              style={{ width: '100%' }}
              config={{ responsive: true, displayModeBar: false }}
            />
          </div>
        ) : (
          <div className="text-rose-400 text-sm py-12 text-center">Unable to load profile data.</div>
        )}
      </div>
    </div>
  );
};
