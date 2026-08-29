import { create } from 'zustand';
import { PaletteName } from '../utils/colormaps';

export type ViewMode = 'globe' | 'box';
export type OceanVariable = 'temp' | 'sal' | 'sst' | 'chlorophyll';

interface AppState {
  // Mode & Layer Controls
  viewMode: ViewMode;
  activeVariable: OceanVariable;
  selectedDepth: number;
  timeIndex: number;
  verticalExaggeration: number;
  colorPalette: PaletteName;
  layerOpacity: number;
  
  // Layer Toggles
  showCurrents: boolean;
  showClouds: boolean;
  showAtmosphere: boolean;
  showBathymetry: boolean;
  
  // 4D Temporal Playback
  isPlayingTime: boolean;
  playbackSpeed: number;
  timeSteps: string[];
  
  // Metadata & Dimension Levels
  availableDepths: number[];
  variables: string[];
  
  // In-Situ & Hover Telemetry
  selectedFloatId: number | null;
  hoveredCoords: { lat: number; lon: number; depth?: number; val?: number } | null;
  cameraTarget: [number, number, number] | null;
  
  // Actions
  setViewMode: (mode: ViewMode) => void;
  setActiveVariable: (v: OceanVariable) => void;
  setSelectedDepth: (d: number) => void;
  setTimeIndex: (t: number) => void;
  setVerticalExaggeration: (scale: number) => void;
  setColorPalette: (p: PaletteName) => void;
  setLayerOpacity: (op: number) => void;
  setShowCurrents: (show: boolean) => void;
  setShowClouds: (show: boolean) => void;
  setShowAtmosphere: (show: boolean) => void;
  setIsPlayingTime: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setMetadata: (depths: number[], times: string[], vars: string[]) => void;
  setSelectedFloatId: (id: number | null) => void;
  setHoveredCoords: (coords: { lat: number; lon: number; depth?: number; val?: number } | null) => void;
  setCameraTarget: (target: [number, number, number] | null) => void;
}

export const useStore = create<AppState>((set) => ({
  viewMode: 'globe',
  activeVariable: 'temp',
  selectedDepth: 5.0,
  timeIndex: -1,
  verticalExaggeration: 30,
  colorPalette: 'thermal',
  layerOpacity: 0.88,
  
  showCurrents: true,
  showClouds: true,
  showAtmosphere: true,
  showBathymetry: true,
  
  isPlayingTime: false,
  playbackSpeed: 1,
  timeSteps: [],
  
  availableDepths: [5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1400, 1600, 1800, 2000],
  variables: ['temp', 'sal', 'sst', 'chlorophyll'],
  
  selectedFloatId: null,
  hoveredCoords: null,
  cameraTarget: null,
  
  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveVariable: (v) => set({ 
    activeVariable: v,
    colorPalette: v === 'sal' ? 'haline' : (v === 'chlorophyll' ? 'algae' : 'thermal')
  }),
  setSelectedDepth: (d) => set({ selectedDepth: d }),
  setTimeIndex: (t) => set({ timeIndex: t }),
  setVerticalExaggeration: (scale) => set({ verticalExaggeration: scale }),
  setColorPalette: (p) => set({ colorPalette: p }),
  setLayerOpacity: (op) => set({ layerOpacity: op }),
  setShowCurrents: (show) => set({ showCurrents: show }),
  setShowClouds: (show) => set({ showClouds: show }),
  setShowAtmosphere: (show) => set({ showAtmosphere: show }),
  setIsPlayingTime: (playing) => set({ isPlayingTime: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setMetadata: (depths, times, vars) => set({ availableDepths: depths, timeSteps: times, variables: vars }),
  setSelectedFloatId: (id) => set({ selectedFloatId: id }),
  setHoveredCoords: (coords) => set({ hoveredCoords: coords }),
  setCameraTarget: (target) => set({ cameraTarget: target }),
}));
