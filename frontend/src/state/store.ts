import { create } from 'zustand';
import { PaletteName } from '../utils/colormaps';

export type ViewMode = 'globe' | 'box';
export type OceanVariable = 'temp' | 'sal' | 'sst' | 'chlorophyll';
export type PresetRegion = 'all' | 'arabian_sea' | 'bay_of_bengal' | 'equator';

interface AppState {
  // Mode & Layer Controls
  viewMode: ViewMode;
  activeVariable: OceanVariable;
  selectedDepth: number;
  timeIndex: number;
  verticalExaggeration: number;
  colorPalette: PaletteName;
  layerOpacity: number;
  
  // Real-time Data Bounds for Legend & Headers
  currentMinVal: number;
  currentMaxVal: number;
  
  // Layer Toggles
  showCurrents: boolean;
  showClouds: boolean;
  showAtmosphere: boolean;
  showBathymetry: boolean;
  particleDensity: number;
  
  // 4D Temporal Playback
  isPlayingTime: boolean;
  playbackSpeed: number;
  timeSteps: string[];
  
  // Metadata & Dimension Levels
  availableDepths: number[];
  variables: string[];
  
  // In-Situ & Hover Telemetry
  selectedFloatId: number | null;
  inspectorOpen: boolean;
  showModalExpanded: boolean;
  hoveredCoords: { lat: number; lon: number; depth?: number; val?: number } | null;
  cameraTarget: [number, number, number] | null;
  activePresetRegion: PresetRegion;
  showHelpModal: boolean;
  
  // Disaster Management & Early Warning States
  disasterMode: boolean;
  showWarningModal: boolean;
  activeAlert: any | null;
  isSarMode: boolean;
  sarPoint: { lat: number; lon: number } | null;
  sarResult: any | null;
  sarObjectType: string;
  showGlider: boolean;
  selectedGlider: any | null;
  showStoryTour: boolean;
  tourStep: number;
  
  // Varuna-AI Ocean Intelligence States
  showAiCopilot: boolean;
  showAiAnomalies: boolean;
  aiAnomalies: any[];
  selectedAnomaly: any | null;
  
  // Actions
  setViewMode: (mode: ViewMode) => void;
  setActiveVariable: (v: OceanVariable) => void;
  setSelectedDepth: (d: number) => void;
  setTimeIndex: (t: number) => void;
  setVerticalExaggeration: (scale: number) => void;
  setColorPalette: (p: PaletteName) => void;
  setLayerOpacity: (op: number) => void;
  setRangeVals: (min: number, max: number) => void;
  setShowCurrents: (show: boolean) => void;
  setShowClouds: (show: boolean) => void;
  setShowAtmosphere: (show: boolean) => void;
  setParticleDensity: (density: number) => void;
  setIsPlayingTime: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setMetadata: (depths: number[], times: string[], vars: string[]) => void;
  setSelectedFloatId: (id: number | null) => void;
  setInspectorOpen: (open: boolean) => void;
  setShowModalExpanded: (show: boolean) => void;
  setHoveredCoords: (coords: { lat: number; lon: number; depth?: number; val?: number } | null) => void;
  setCameraTarget: (target: [number, number, number] | null) => void;
  setActivePresetRegion: (region: PresetRegion) => void;
  setShowHelpModal: (show: boolean) => void;
  setDisasterMode: (active: boolean) => void;
  setShowWarningModal: (show: boolean) => void;
  setActiveAlert: (alert: any | null) => void;
  setIsSarMode: (active: boolean) => void;
  setSarPoint: (pt: { lat: number; lon: number } | null) => void;
  setSarResult: (res: any | null) => void;
  setSarObjectType: (type: string) => void;
  setShowGlider: (show: boolean) => void;
  setSelectedGlider: (glider: any | null) => void;
  setShowStoryTour: (show: boolean) => void;
  setTourStep: (step: number) => void;
  setShowAiCopilot: (show: boolean) => void;
  setShowAiAnomalies: (show: boolean) => void;
  setAiAnomalies: (anomalies: any[]) => void;
  setSelectedAnomaly: (anomaly: any | null) => void;
  resetCamera: () => void;
}

export const useStore = create<AppState>((set) => ({
  viewMode: 'globe',
  activeVariable: 'temp',
  selectedDepth: 5.0,
  timeIndex: -1,
  verticalExaggeration: 30,
  colorPalette: 'thermal',
  layerOpacity: 0.88,
  
  currentMinVal: 10.0,
  currentMaxVal: 31.5,
  
  showCurrents: true,
  showClouds: true,
  showAtmosphere: true,
  showBathymetry: true,
  particleDensity: 1200,
  
  isPlayingTime: false,
  playbackSpeed: 1,
  timeSteps: [],
  
  availableDepths: [5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1400, 1600, 1800, 2000],
  variables: ['temp', 'sal', 'sst', 'chlorophyll'],
  
  selectedFloatId: null,
  inspectorOpen: false,
  showModalExpanded: false,
  hoveredCoords: null,
  cameraTarget: null,
  activePresetRegion: 'all',
  showHelpModal: false,
  
  disasterMode: false,
  showWarningModal: false,
  activeAlert: null,
  isSarMode: false,
  sarPoint: null,
  sarResult: null,
  sarObjectType: 'life_raft',
  showGlider: true,
  selectedGlider: null,
  showStoryTour: false,
  tourStep: 0,
  
  showAiCopilot: false,
  showAiAnomalies: true,
  aiAnomalies: [],
  selectedAnomaly: null,
  
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
  setRangeVals: (min, max) => set({ currentMinVal: min, currentMaxVal: max }),
  setShowCurrents: (show) => set({ showCurrents: show }),
  setShowClouds: (show) => set({ showClouds: show }),
  setShowAtmosphere: (show) => set({ showAtmosphere: show }),
  setParticleDensity: (density) => set({ particleDensity: density }),
  setIsPlayingTime: (playing) => set({ isPlayingTime: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setMetadata: (depths, times, vars) => set({ availableDepths: depths, timeSteps: times, variables: vars }),
  setSelectedFloatId: (id) => set({ selectedFloatId: id, inspectorOpen: id !== null }),
  setInspectorOpen: (open) => set({ inspectorOpen: open }),
  setShowModalExpanded: (show) => set({ showModalExpanded: show }),
  setHoveredCoords: (coords) => set({ hoveredCoords: coords }),
  setCameraTarget: (target) => set({ cameraTarget: target }),
  setActivePresetRegion: (region) => set({ activePresetRegion: region }),
  setShowHelpModal: (show) => set({ showHelpModal: show }),
  setDisasterMode: (active) => set({ disasterMode: active }),
  setShowWarningModal: (show) => set({ showWarningModal: show }),
  setActiveAlert: (alert) => set({ activeAlert: alert }),
  setIsSarMode: (active) => set({ isSarMode: active }),
  setSarPoint: (pt) => set({ sarPoint: pt }),
  setSarResult: (res) => set({ sarResult: res }),
  setSarObjectType: (type) => set({ sarObjectType: type }),
  setShowGlider: (show) => set({ showGlider: show }),
  setSelectedGlider: (glider) => set({ selectedGlider: glider }),
  setShowStoryTour: (show) => set({ showStoryTour: show, tourStep: 0 }),
  setTourStep: (step) => set({ tourStep: step }),
  setShowAiCopilot: (show) => set({ showAiCopilot: show }),
  setShowAiAnomalies: (show) => set({ showAiAnomalies: show }),
  setAiAnomalies: (anomalies) => set({ aiAnomalies: anomalies }),
  setSelectedAnomaly: (anomaly) => set({ selectedAnomaly: anomaly }),
  resetCamera: () => set({ cameraTarget: [22, 18, 38] }),
}));
