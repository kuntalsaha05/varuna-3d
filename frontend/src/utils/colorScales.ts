import { PaletteType } from '../state/store';

type ColorStop = [number, [number, number, number]];

const PALETTES: Record<PaletteType, ColorStop[]> = {
  thermal: [
    [0.0, [15, 23, 42]],      // Deep abyssal navy
    [0.15, [14, 116, 144]],   // Dark cyan
    [0.35, [6, 182, 212]],    // Cyan
    [0.55, [16, 185, 129]],   // Emerald green
    [0.75, [234, 179, 8]],    // Amber yellow
    [0.9, [249, 115, 22]],    // Coral orange
    [1.0, [239, 68, 68]]      // Red / hot
  ],
  haline: [
    [0.0, [30, 27, 75]],      // Deep indigo
    [0.2, [29, 78, 216]],     // Ocean blue
    [0.4, [14, 165, 233]],    // Sky blue
    [0.6, [20, 184, 166]],    // Teal
    [0.8, [132, 204, 22]],    // Lime
    [1.0, [250, 204, 21]]     // Warm gold
  ],
  algae: [
    [0.0, [2, 44, 34]],       // Very dark green
    [0.2, [6, 78, 59]],       // Forest green
    [0.4, [16, 185, 129]],    // Emerald
    [0.6, [52, 211, 153]],    // Light mint
    [0.8, [163, 230, 53]],    // Chartreuse
    [1.0, [254, 240, 138]]    // Pale yellow
  ],
  turbo: [
    [0.0, [48, 18, 59]],
    [0.15, [70, 134, 251]],
    [0.35, [27, 229, 181]],
    [0.55, [164, 252, 60]],
    [0.75, [251, 185, 56]],
    [0.9, [227, 68, 10]],
    [1.0, [122, 4, 3]]
  ],
  viridis: [
    [0.0, [68, 1, 84]],
    [0.25, [59, 82, 139]],
    [0.5, [33, 145, 140]],
    [0.75, [94, 201, 98]],
    [1.0, [253, 231, 37]]
  ],
  coolwarm: [
    [0.0, [59, 76, 192]],
    [0.3, [147, 183, 246]],
    [0.5, [221, 221, 221]],
    [0.7, [244, 154, 123]],
    [1.0, [180, 4, 38]]
  ]
};

export function interpolateColor(
  palette: PaletteType,
  t: number
): [number, number, number] {
  const clampedT = Math.max(0, Math.min(1, t));
  const stops = PALETTES[palette] || PALETTES.thermal;

  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];

    if (clampedT >= t0 && clampedT <= t1) {
      const segmentT = (clampedT - t0) / (t1 - t0);
      const r = Math.round(c0[0] + segmentT * (c1[0] - c0[0]));
      const g = Math.round(c0[1] + segmentT * (c1[1] - c0[1]));
      const b = Math.round(c0[2] + segmentT * (c1[2] - c0[2]));
      return [r, g, b];
    }
  }

  return stops[stops.length - 1][1];
}

export function getPaletteGradientCSS(palette: PaletteType): string {
  const stops = PALETTES[palette] || PALETTES.thermal;
  const parts = stops.map(([t, [r, g, b]]) => `rgb(${r}, ${g}, ${b}) ${Math.round(t * 100)}%`);
  return `linear-gradient(to right, ${parts.join(', ')})`;
}
