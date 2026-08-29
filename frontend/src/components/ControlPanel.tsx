import React, { useEffect } from 'react';
import axios from 'axios';
import { useStore, DatasetType } from '../state/store';
import { Layers, Sliders, Eye, Waves, Database, Compass, Mountain, MapPin, Activity } from 'lucide-react';

export const ControlPanel: React.FC = () => {
  const {
    activeDataset,
    setActiveDataset,
    activeVariable,
    setActiveVariable,
    selectedDepth,
    setSelectedDepth,
    verticalExaggeration,
    setVerticalExaggeration,
    showBathymetry,
    toggleBathymetry,
    showCoastlines,
    toggleCoastlines,
    showTrajectories,
    toggleTrajectories,
    showCurrents,
    toggleCurrents,
    showIsoSurfaces,
    toggleIsoSurfaces,
    setMetadata
  } = useStore();

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/v1/slice/metadata?dataset_type=${activeDataset}`)
      .then(res => {
        setMetadata({
          depths: res.data.depth_levels,
          times: res.data.time_steps,
          vars: res.data.variables,
          units: res.data.units,
          latRange: [res.data.lat_range[0], res.data.lat_range[1]],
          lonRange: [res.data.lon_range[0], res.data.lon_range[1]]
        });
        if (res.data.variables && !res.data.variables.includes(activeVariable)) {
          setActiveVariable(res.data.default_variable);
        }
      })
      .catch(console.error);
  }, [activeDataset, setMetadata, setActiveVariable]);

  const handleDatasetChange = (d: DatasetType) => {
    setActiveDataset(d);
  };

  return (
    <div className="absolute top-4 left-4 z-10 w-84 max-w-[340px] bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-4 select-none">
      {/* Title & Brand */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
          <Waves className="text-cyan-400 w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-base leading-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
            VARUNA-3D
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">INCOIS Indian Ocean Digital Twin</p>
        </div>
      </div>

      {/* Dataset Selector */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
          <Database size={13} className="text-cyan-400" /> OCEAN DATASET
        </label>
        <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => handleDatasetChange('model_3d')}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold transition ${
              activeDataset === 'model_3d'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3D Model
          </button>
          <button
            onClick={() => handleDatasetChange('sst')}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold transition ${
              activeDataset === 'sst'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Weekly SST
          </button>
          <button
            onClick={() => handleDatasetChange('chlorophyll')}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold transition ${
              activeDataset === 'chlorophyll'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Chlorophyll
          </button>
        </div>
      </div>

      {/* Variable Selector (if 3D model) */}
      {activeDataset === 'model_3d' && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Layers size={13} className="text-cyan-400" /> VARIABLE
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setActiveVariable('temp')}
              className={`py-1.5 px-3 rounded-lg text-xs font-medium transition ${
                activeVariable === 'temp'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-md shadow-orange-500/20'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              Temperature (°C)
            </button>
            <button
              onClick={() => setActiveVariable('sal')}
              className={`py-1.5 px-3 rounded-lg text-xs font-medium transition ${
                activeVariable === 'sal'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              Salinity (PSU)
            </button>
          </div>
        </div>
      )}

      {/* Depth Scrubber (enabled for 3D model) */}
      {activeDataset === 'model_3d' && (
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-400 flex items-center gap-1.5">
              <Sliders size={13} className="text-cyan-400" /> DEPTH SLICE
            </span>
            <span className="font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              {selectedDepth} m
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="2000"
            step="10"
            value={selectedDepth}
            onChange={(e) => setSelectedDepth(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          {/* Preset Buttons for Thermoclines */}
          <div className="flex flex-wrap gap-1">
            {[
              { d: 5, label: '0m' },
              { d: 50, label: 'MLD 50m' },
              { d: 150, label: 'Thermocline' },
              { d: 500, label: '500m' },
              { d: 1000, label: '1000m' },
              { d: 2000, label: '2000m' }
            ].map(({ d, label }) => (
              <button
                key={d}
                onClick={() => setSelectedDepth(d)}
                className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition ${
                  selectedDepth === d
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800/70 hover:bg-slate-700 text-slate-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Vertical Exaggeration Slider */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-400 flex items-center gap-1.5">
            <Eye size={13} className="text-cyan-400" /> VERTICAL SCALE
          </span>
          <span className="font-mono text-cyan-400 font-bold">{verticalExaggeration}x</span>
        </div>
        <input
          type="range"
          min="5"
          max="80"
          step="1"
          value={verticalExaggeration}
          onChange={(e) => setVerticalExaggeration(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* 3D Scene Layer Toggles */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 block">3D LAYERS</span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={toggleBathymetry}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition ${
              showBathymetry ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300' : 'bg-slate-800/60 text-slate-500'
            }`}
          >
            <Mountain size={12} /> Seafloor Bathymetry
          </button>
          <button
            onClick={toggleCoastlines}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition ${
              showCoastlines ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300' : 'bg-slate-800/60 text-slate-500'
            }`}
          >
            <Compass size={12} /> Coastlines
          </button>
          <button
            onClick={toggleTrajectories}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition ${
              showTrajectories ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300' : 'bg-slate-800/60 text-slate-500'
            }`}
          >
            <MapPin size={12} /> Argo Drift Paths
          </button>
          <button
            onClick={toggleCurrents}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition ${
              showCurrents ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300' : 'bg-slate-800/60 text-slate-500'
            }`}
          >
            <Waves size={12} /> Current Flow
          </button>
        </div>
      </div>

      {/* Legend & Instructions */}
      <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></span>
          <span>Yellow pins: In-situ Argo floats (Click to validate)</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-400 font-mono">
          <Activity size={11} />
          <span>Real-time RMSE & Mean Bias calculation</span>
        </div>
      </div>
    </div>
  );
};

