import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import { useStore } from '../state/store';
import { X, Activity, Download, Layers, Compass, BarChart2, RefreshCw } from 'lucide-react';

export const ValidationModal: React.FC = () => {
  const {
    selectedFloatId,
    setSelectedFloatId,
    selectedFloatCycle,
    setSelectedFloatCycle,
    activeVariable
  } = useStore();

  const [valData, setValData] = useState<any>(null);
  const [cycles, setCycles] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'ts_diagram'>('profile');

  // Fetch available cycles for float
  useEffect(() => {
    if (!selectedFloatId) return;
    axios.get(`http://127.0.0.1:8000/api/v1/observations/cycles?platform_number=${selectedFloatId}`)
      .then(res => setCycles(res.data.cycles || []))
      .catch(() => setCycles([]));
  }, [selectedFloatId]);

  // Fetch validation data
  useEffect(() => {
    if (!selectedFloatId) return;
    setLoading(true);
    axios.get('http://127.0.0.1:8000/api/v1/validation/profile', {
      params: {
        platform_number: selectedFloatId,
        variable: activeVariable === 'sal' ? 'sal' : 'temp',
        cycle_number: selectedFloatCycle || undefined
      }
    })
      .then(res => {
        setValData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setValData(null);
        setLoading(false);
      });
  }, [selectedFloatId, selectedFloatCycle, activeVariable]);

  if (!selectedFloatId) return null;

  const handleDownloadCSV = () => {
    const varKey = activeVariable === 'sal' ? 'sal' : 'temp';
    const cycleParam = selectedFloatCycle ? `&cycle_number=${selectedFloatCycle}` : '';
    const url = `http://127.0.0.1:8000/api/v1/validation/export?platform_number=${selectedFloatId}&variable=${varKey}${cycleParam}`;
    window.open(url, '_blank');
  };

  const isTemp = activeVariable !== 'sal';
  const unitLabel = isTemp ? '°C' : 'PSU';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative text-white max-h-[90vh] flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => {
            setSelectedFloatId(null);
            setSelectedFloatCycle(null);
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <Activity className="text-cyan-400 w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Argo Float WMO #{selectedFloatId}
                <span className="text-xs font-normal text-slate-400">vs INCOIS Numerical Model</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Collocated in-situ vertical sensor profile comparison & water mass validation
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 mr-8">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition shadow-sm"
              title="Download CSV Validation Report"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Float Cycle & Metadata Bar */}
        {valData && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4 text-[11px] bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-slate-400 block text-[10px]">Position</span>
              <span className="font-semibold text-slate-200">
                {valData.coordinates.lat}°N, {valData.coordinates.lon}°E
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Grid Collocation</span>
              <span className="font-semibold text-slate-200">
                Δ {valData.coordinates.distance_km ?? 0} km
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">RMSE Error</span>
              <span className="text-emerald-400 font-bold text-xs">
                {valData.rmse !== null ? `${valData.rmse} ${unitLabel}` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Mean Bias</span>
              <span className="text-cyan-400 font-bold text-xs">
                {valData.mean_bias !== null ? `${valData.mean_bias} ${unitLabel}` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Water Mass</span>
              <span className="text-amber-400 font-semibold text-[10px] truncate block" title={valData.water_mass}>
                {valData.water_mass || 'Indian Ocean'}
              </span>
            </div>
          </div>
        )}

        {/* Tab Switcher & Cycle Scrubber */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-xs">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 size={13} />
              <span>Depth Profile Curve</span>
            </button>
            <button
              onClick={() => setActiveTab('ts_diagram')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTab === 'ts_diagram'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass size={13} />
              <span>T-S Water Mass Diagram</span>
            </button>
          </div>

          {/* Cycle Dropdown */}
          {cycles.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">Cycle:</span>
              <select
                value={valData?.cycle_number || cycles[cycles.length - 1]}
                onChange={(e) => setSelectedFloatCycle(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md px-2 py-1 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {cycles.map(c => (
                  <option key={c} value={c}>Cycle #{c}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Chart Content Area */}
        <div className="flex-1 min-h-[360px] overflow-hidden flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-slate-400 text-sm">
              <RefreshCw className="animate-spin text-cyan-400 w-6 h-6" />
              <span>Extracting collocated 3D model columns & in-situ profiles...</span>
            </div>
          ) : valData ? (
            activeTab === 'profile' ? (
              <Plot
                data={[
                  {
                    x: isTemp ? valData.observed.temperature : valData.observed.salinity,
                    y: valData.observed.depth,
                    mode: 'lines+markers',
                    name: `In-Situ Observed (${isTemp ? 'Temp' : 'Salinity'})`,
                    line: { color: '#fbbf24', width: 3 },
                    marker: { size: 5, color: '#f59e0b' }
                  },
                  {
                    x: valData.modeled.values,
                    y: valData.modeled.depth,
                    mode: 'lines+markers',
                    name: 'INCOIS McCreary Model',
                    line: { color: '#06b6d4', width: 3, dash: 'dash' },
                    marker: { size: 6, symbol: 'diamond', color: '#0891b2' }
                  }
                ]}
                layout={{
                  autosize: true,
                  height: 350,
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: '#0b1329',
                  font: { family: 'sans-serif', color: '#94a3b8' },
                  yaxis: {
                    title: 'Depth (meters)',
                    autorange: 'reversed',
                    gridcolor: '#1e293b',
                    color: '#94a3b8'
                  },
                  xaxis: {
                    title: isTemp ? 'Temperature (°C)' : 'Salinity (PSU)',
                    gridcolor: '#1e293b',
                    color: '#94a3b8'
                  },
                  legend: { font: { color: '#f8fafc' }, orientation: 'h', y: 1.15 },
                  margin: { t: 30, r: 20, l: 60, b: 45 }
                }}
                style={{ width: '100%' }}
                config={{ responsive: true, displayModeBar: false }}
              />
            ) : (
              <Plot
                data={[
                  {
                    x: valData.observed.salinity,
                    y: valData.observed.temperature,
                    mode: 'markers+lines',
                    name: 'Observed T-S Curve',
                    line: { color: '#38bdf8', width: 2 },
                    marker: {
                      size: 7,
                      color: valData.observed.depth,
                      colorscale: 'Viridis',
                      colorbar: {
                        title: 'Depth (m)',
                        len: 0.8,
                        thickness: 12,
                        tickfont: { color: '#94a3b8' }
                      }
                    }
                  }
                ]}
                layout={{
                  autosize: true,
                  height: 350,
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: '#0b1329',
                  font: { family: 'sans-serif', color: '#94a3b8' },
                  xaxis: {
                    title: 'Practical Salinity (PSU)',
                    gridcolor: '#1e293b',
                    color: '#94a3b8'
                  },
                  yaxis: {
                    title: 'Potential Temperature (°C)',
                    gridcolor: '#1e293b',
                    color: '#94a3b8'
                  },
                  margin: { t: 30, r: 40, l: 60, b: 45 }
                }}
                style={{ width: '100%' }}
                config={{ responsive: true, displayModeBar: false }}
              />
            )
          ) : (
            <div className="text-rose-400 text-sm py-12 text-center">
              Unable to load validation data for this Argo float.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

