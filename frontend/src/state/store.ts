import { create } from 'zustand';

export type DatasetType = 'model_3d' | 'sst' | 'chlorophyll';
export type PaletteType = 'turbo' | 'viridis' | 'thermal' | 'haline' | 'algae' | 'coolwarm';

interface AppState {
  // Dataset & variables
  activeDataset: DatasetType;
  activeVariable: string;
  selectedDepth: number;
  timeIndex: number;
  currentTimeStr: string | null;
  units: string;
  
  // Visuals & Palettes
  verticalExaggeration: number;
  colorPalette: PaletteType;
  paletteMin: number | null;
  paletteMax: number | null;
  
  // Layer Toggles
  showBathymetry: boolean;
  showCoastlines: boolean;
  showTrajectories: boolean;
  showCurrents: boolean;
  showIsoSurfaces: boolean;

  // 4D Time Playback
  isPlaying: boolean;
  playbackSpeedMs: number;

  // Metadata
  availableDepths: number[];
  timeSteps: string[];
  variables: string[];
  latRange: [number, number];
  lonRange: [number, number];

  // Argo float selection
  selectedFloatId: number | null;
  selectedFloatCycle: number | null;

  // Actions
  setActiveDataset: (d: DatasetType) => void;
  setActiveVariable: (v: string) => void;
  setSelectedDepth: (d: number) => void;
  setTimeIndex: (t: number) => void;
  setCurrentTimeStr: (s: string | null) => void;
  setVerticalExaggeration: (scale: number) => void;
  setColorPalette: (p: PaletteType) => void;
  setPaletteRange: (min: number | null, max: number | null) => void;
  toggleBathymetry: () => void;
  toggleCoastlines: () => void;
  toggleTrajectories: () => void;
  toggleCurrents: () => void;
  toggleIsoSurfaces: () => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeedMs: (ms: number) => void;
  setMetadata: (data: {
    depths?: number[];
    times?: string[];
    vars?: string[];
    units?: string;
    latRange?: [number, number];
    lonRange?: [number, number];
  }) => void;
  setSelectedFloatId: (id: number | null) => void;
  setSelectedFloatCycle: (c: number | null) => void;
}

export const useStore = create<AppState>((set) => ({
  activeDataset: 'model_3d',
  activeVariable: 'temp',
  selectedDepth: 0.0,
  timeIndex: -1,
  currentTimeStr: null,
  units: '°C',

  verticalExaggeration: 30,
  colorPalette: 'thermal',
  paletteMin: null,
  paletteMax: null,

  showBathymetry: true,
  showCoastlines: true,
  showTrajectories: true,
  showCurrents: true,
  showIsoSurfaces: false,

  isPlaying: false,
  playbackSpeedMs: 1200,

  availableDepths: [5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1400, 1600, 1800, 2000],
  timeSteps: [],
  variables: ['temp', 'sal'],
  latRange: [-29.5, 29.5],
  lonRange: [30.5, 119.5],

  selectedFloatId: null,
  selectedFloatCycle: null,

  setActiveDataset: (d) => set({ activeDataset: d }),
  setActiveVariable: (v) => {
    let defaultPalette: PaletteType = 'thermal';
    let units = '°C';
    if (v === 'sal') {
      defaultPalette = 'haline';
      units = 'PSU';
    } else if (v === 'chlorophyll') {
      defaultPalette = 'algae';
      units = 'mg/m³';
    } else if (v === 'sst') {
      defaultPalette = 'thermal';
      units = '°C';
    }
    set({ activeVariable: v, colorPalette: defaultPalette, units });
  },
  setSelectedDepth: (d) => set({ selectedDepth: d }),
  setTimeIndex: (t) => set({ timeIndex: t }),
  setCurrentTimeStr: (s) => set({ currentTimeStr: s }),
  setVerticalExaggeration: (scale) => set({ verticalExaggeration: scale }),
  setColorPalette: (p) => set({ colorPalette: p }),
  setPaletteRange: (min, max) => set({ paletteMin: min, paletteMax: max }),
  toggleBathymetry: () => set((state) => ({ showBathymetry: !state.showBathymetry })),
  toggleCoastlines: () => set((state) => ({ showCoastlines: !state.showCoastlines })),
  toggleTrajectories: () => set((state) => ({ showTrajectories: !state.showTrajectories })),
  toggleCurrents: () => set((state) => ({ showCurrents: !state.showCurrents })),
  toggleIsoSurfaces: () => set((state) => ({ showIsoSurfaces: !state.showIsoSurfaces })),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackSpeedMs: (ms) => set({ playbackSpeedMs: ms }),
  setMetadata: (data) => set((state) => ({
    availableDepths: data.depths || state.availableDepths,
    timeSteps: data.times || state.timeSteps,
    variables: data.vars || state.variables,
    units: data.units || state.units,
    latRange: data.latRange || state.latRange,
    lonRange: data.lonRange || state.lonRange,
  })),
  setSelectedFloatId: (id) => set({ selectedFloatId: id, selectedFloatCycle: null }),
  setSelectedFloatCycle: (c) => set({ selectedFloatCycle: c }),
}));

