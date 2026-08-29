import React from 'react';
import { useStore, PaletteType } from '../state/store';
import { getPaletteGradientCSS } from '../utils/colorScales';
import { Palette } from 'lucide-react';

export const PaletteEditor: React.FC = () => {
  const {
    activeVariable,
    colorPalette,
    setColorPalette,
    units
  } = useStore();

  const palettes: { key: PaletteType; label: string }[] = [
    { key: 'thermal', label: 'Thermal (Temp)' },
    { key: 'haline', label: 'Haline (Salinity)' },
    { key: 'algae', label: 'Algae (Chlorophyll)' },
    { key: 'turbo', label: 'Turbo (Rainbow)' },
    { key: 'viridis', label: 'Viridis' },
    { key: 'coolwarm', label: 'CoolWarm' }
  ];

  const gradientCSS = getPaletteGradientCSS(colorPalette);

  // Dynamic variable label and typical bounds
  const getMinMaxLabels = () => {
    if (activeVariable === 'temp' || activeVariable === 'sst') return { min: '2°C', max: '32°C' };
    if (activeVariable === 'sal') return { min: '32 PSU', max: '37 PSU' };
    if (activeVariable === 'chlorophyll') return { min: '0.01', max: '10.0 mg/m³' };
    return { min: 'Low', max: 'High' };
  };

  const { min, max } = getMinMaxLabels();

  return (
    <div className="absolute top-4 right-4 z-10 w-64 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3.5 shadow-2xl text-slate-100 space-y-2.5 select-none">
      {/* Header with Palette Selector */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-400 flex items-center gap-1.5">
          <Palette size={13} className="text-cyan-400" /> COLOR PALETTE
        </span>
        <select
          value={colorPalette}
          onChange={(e) => setColorPalette(e.target.value as PaletteType)}
          className="bg-slate-950 border border-slate-700 text-slate-200 text-[10px] rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-400 cursor-pointer"
        >
          {palettes.map(p => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Colorbar Gradient Display */}
      <div className="space-y-1">
        <div
          className="w-full h-3.5 rounded-lg border border-slate-700/60 shadow-inner"
          style={{ background: gradientCSS }}
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>{min}</span>
          <span className="text-cyan-400 font-bold">{units}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
};

