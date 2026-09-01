// Scientific Oceanographic Colormaps (cmocean, Turbo, Viridis, Haline)

export type PaletteName = 'thermal' | 'haline' | 'turbo' | 'viridis' | 'coolwarm' | 'algae';

export interface VariableMeta {
  key: string;
  name: string;
  unit: string;
  datasetName: string;
  resolution: string;
  description: string;
  defaultPalette: PaletteName;
}

export const VARIABLE_METADATA: Record<string, VariableMeta> = {
  temp: {
    key: 'temp',
    name: 'Sub-surface Temperature',
    unit: '°C',
    datasetName: 'INCOIS McCreary 10-Day OA 3D Grid',
    resolution: '0.5° × 0.5° × 24 Depth Levels',
    description: '3D objective analysis potential temperature across water column',
    defaultPalette: 'thermal'
  },
  sal: {
    key: 'sal',
    name: 'Sub-surface Salinity',
    unit: 'PSU',
    datasetName: 'INCOIS McCreary 10-Day OA 3D Grid',
    resolution: '0.5° × 0.5° × 24 Depth Levels',
    description: '3D practical salinity fields across depth',
    defaultPalette: 'haline'
  },
  sst: {
    key: 'sst',
    name: 'Sea Surface Temperature',
    unit: '°C',
    datasetName: 'INCOIS Weekly SST Analysis',
    resolution: '0.25° × 0.25° High-Resolution',
    description: 'Satellite & in-situ blended surface thermal analysis',
    defaultPalette: 'thermal'
  },
  chlorophyll: {
    key: 'chlorophyll',
    name: 'Chlorophyll-a Concentration',
    unit: 'mg/m³',
    datasetName: 'IRS-P4 OCM Ocean Color Grid',
    resolution: '0.1° × 0.1° Bio-Optical',
    description: 'Biogeochemical primary productivity / phytoplankton concentration',
    defaultPalette: 'algae'
  }
};

export function getVariableMeta(key: string): VariableMeta {
  return VARIABLE_METADATA[key] || VARIABLE_METADATA.temp;
}

export function getColorRamp(valNorm: number, palette: PaletteName): [number, number, number, number] {
  const t = Math.max(0, Math.min(1, valNorm));

  switch (palette) {
    case 'thermal': {
      const r = Math.floor(Math.min(255, Math.max(0, 255 * (1.5 * t - 0.2))));
      const g = Math.floor(Math.min(255, Math.max(0, 255 * (2.0 * t * (1.0 - t) + (t > 0.6 ? 2.5 * (t - 0.6) : 0)))));
      const b = Math.floor(Math.min(255, Math.max(0, 255 * (1.2 * (1.0 - t) - 0.1))));
      return [r, g, b, 230];
    }
    case 'haline': {
      const r = Math.floor(255 * Math.pow(t, 1.8));
      const g = Math.floor(255 * Math.sin(t * Math.PI * 0.9));
      const b = Math.floor(255 * (1.0 - t * 0.8));
      return [r, g, b, 230];
    }
    case 'algae': {
      const r = Math.floor(255 * (t > 0.5 ? (t - 0.5) * 2.0 : 0.05));
      const g = Math.floor(255 * Math.pow(t, 0.7));
      const b = Math.floor(255 * (1.0 - t) * 0.8);
      return [r, g, b, 230];
    }
    case 'viridis': {
      const r = Math.floor(255 * (0.2 + 0.8 * Math.pow(t, 2.0)));
      const g = Math.floor(255 * (0.1 + 0.9 * Math.sin(t * Math.PI * 0.85)));
      const b = Math.floor(255 * (0.4 + 0.6 * (1.0 - t)));
      return [r, g, b, 230];
    }
    case 'coolwarm': {
      const r = Math.floor(255 * (t > 0.5 ? 1.0 : t * 2.0));
      const g = Math.floor(255 * (1.0 - Math.abs(t - 0.5) * 1.5));
      const b = Math.floor(255 * (t < 0.5 ? 1.0 : (1.0 - t) * 2.0));
      return [r, g, b, 230];
    }
    case 'turbo':
    default: {
      const r = Math.floor(255 * Math.min(1.0, Math.max(0.0, 0.1357 + t * (4.5155 + t * (-8.9837 + t * (12.358 + t * -7.025))))));
      const g = Math.floor(255 * Math.min(1.0, Math.max(0.0, 0.0914 + t * (2.1941 + t * (4.8429 + t * (-14.185 + t * 7.054))))));
      const b = Math.floor(255 * Math.min(1.0, Math.max(0.0, 0.1066 + t * (12.585 + t * (-30.165 + t * (24.775 + t * -6.302))))));
      return [r, g, b, 230];
    }
  }
}

export function getPaletteGradientCSS(palette: PaletteName): string {
  const steps = [0, 0.25, 0.5, 0.75, 1.0];
  const colors = steps.map(s => {
    const [r, g, b] = getColorRamp(s, palette);
    return `rgb(${r}, ${g}, ${b})`;
  });
  return `linear-gradient(to right, ${colors.join(', ')})`;
}
