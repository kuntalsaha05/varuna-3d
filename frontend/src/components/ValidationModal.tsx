import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import { useStore } from '../state/store';
import { X, Activity } from 'lucide-react';

export const ValidationModal: React.FC = () => {
  const { selectedFloatId, setSelectedFloatId, activeVariable } = useStore();
  const [valData, setValData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedFloatId) return;
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

  if (!selectedFloatId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative text-white">
        <button
          onClick={() => setSelectedFloatId(null)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <Activity className="text-cyan-400 w-6 h-6" />
          <div>
            <h2 className="text-lg font-bold">
              Argo Float WMO #{selectedFloatId} vs Numerical Model
            </h2>
            <p className="text-xs text-slate-400">Direct depth-resolved observation vs model prediction</p>
          </div>
        </div>

        {valData && (
          <div className="grid grid-cols-3 gap-3 mb-4 text-xs bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div>
              <span className="text-slate-400 block">Position</span>
              <span className="font-semibold text-slate-200">{valData.coordinates.lat}°N, {valData.coordinates.lon}°E</span>
            </div>
            <div>
              <span className="text-slate-400 block">RMSE Anomaly</span>
              <span className="text-emerald-400 font-bold text-sm">{valData.rmse ?? 'N/A'} °C</span>
            </div>
            <div>
              <span className="text-slate-400 block">Mean Bias</span>
              <span className="text-cyan-400 font-bold text-sm">{valData.mean_bias ?? 'N/A'} °C</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="h-80 flex items-center justify-center text-slate-400 text-sm">
            Extracting profile & computing statistical metrics...
          </div>
        ) : valData ? (
          <Plot
            data={[
              {
                x: valData.observed.temperature,
                y: valData.observed.depth,
                mode: 'lines+markers',
                name: 'In-Situ Observed (Argo)',
                line: { color: '#ffb703', width: 3 },
                marker: { size: 6 }
              },
              {
                x: valData.modeled.values,
                y: valData.modeled.depth,
                mode: 'lines',
                name: 'INCOIS Model Prediction',
                line: { color: '#00f5d4', width: 3, dash: 'dash' }
              }
            ]}
            layout={{
              autosize: true,
              height: 380,
              paper_bgcolor: 'transparent',
              plot_bgcolor: '#0b1329',
              yaxis: {
                title: 'Depth (meters)',
                autorange: 'reversed',
                gridcolor: '#1e293b',
                color: '#94a3b8'
              },
              xaxis: {
                title: activeVariable === 'temp' ? 'Temperature (°C)' : 'Salinity (PSU)',
                gridcolor: '#1e293b',
                color: '#94a3b8'
              },
              legend: { font: { color: '#ffffff' }, orientation: 'h', y: 1.15 },
              margin: { t: 30, r: 20, l: 60, b: 50 }
            }}
            style={{ width: '100%' }}
            config={{ responsive: true }}
          />
        ) : (
          <div className="text-rose-400 text-sm py-12 text-center">Unable to load validation data.</div>
        )}
      </div>
    </div>
  );
};
