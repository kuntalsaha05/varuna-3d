// Scientific Oceanographic Colormaps (cmocean, Turbo, Viridis, Haline)

export type PaletteName = 'thermal' | 'haline' | 'turbo' | 'viridis' | 'coolwarm' | 'algae';

export function getColorRamp(valNorm: number, palette: PaletteName): [number, number, number, number] {
  const t = Math.max(0, Math.min(1, valNorm));

  switch (palette) {
    case 'thermal': {
      // Dark blue -> cyan -> yellow -> orange -> red
      const r = Math.floor(Math.min(255, Math.max(0, 255 * (1.5 * t - 0.2))));
      const g = Math.floor(Math.min(255, Math.max(0, 255 * (2.0 * t * (1.0 - t) + (t > 0.6 ? 2.5 * (t - 0.6) : 0)))));
      const b = Math.floor(Math.min(255, Math.max(0, 255 * (1.2 * (1.0 - t) - 0.1))));
      return [r, g, b, 230];
    }
    case 'haline': {
      // Salinity palette: dark blue -> sea green -> yellowish gold
      const r = Math.floor(255 * Math.pow(t, 1.8));
      const g = Math.floor(255 * Math.sin(t * Math.PI * 0.9));
      const b = Math.floor(255 * (1.0 - t * 0.8));
      return [r, g, b, 230];
    }
    case 'algae': {
      // Chlorophyll palette: deep blue -> teal -> vibrant emerald green -> pale yellow
      const r = Math.floor(255 * (t > 0.5 ? (t - 0.5) * 2.0 : 0.05));
      const g = Math.floor(255 * Math.pow(t, 0.7));
      const b = Math.floor(255 * (1.0 - t) * 0.8);
      return [r, g, b, 230];
    }
    case 'viridis': {
      // Viridis standard
      const r = Math.floor(255 * (0.2 + 0.8 * Math.pow(t, 2.0)));
      const g = Math.floor(255 * (0.1 + 0.9 * Math.sin(t * Math.PI * 0.85)));
      const b = Math.floor(255 * (0.4 + 0.6 * (1.0 - t)));
      return [r, g, b, 230];
    }
    case 'coolwarm': {
      // Blue -> White -> Red
      const r = Math.floor(255 * (t > 0.5 ? 1.0 : t * 2.0));
      const g = Math.floor(255 * (1.0 - Math.abs(t - 0.5) * 1.5));
      const b = Math.floor(255 * (t < 0.5 ? 1.0 : (1.0 - t) * 2.0));
      return [r, g, b, 230];
    }
    case 'turbo':
    default: {
      // Google Turbo Colormap
      const r = Math.floor(255 * Math.min(1.0, Math.max(0.0, 0.1357 + t * (4.5155 + t * (-8.9837 + t * (12.358 + t * -7.025))))));
      const g = Math.floor(255 * Math.min(1.0, Math.max(0.0, 0.0914 + t * (2.1941 + t * (4.8429 + t * (-14.185 + t * 7.054))))));
      const b = Math.floor(255 * Math.min(1.0, Math.max(0.0, 0.1066 + t * (12.585 + t * (-30.165 + t * (24.775 + t * -6.302))))));
      return [r, g, b, 230];
    }
  }
}
