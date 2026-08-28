import { create } from 'zustand';

interface AppState {
  activeVariable: string;
  selectedDepth: number;
  timeIndex: number;
  verticalExaggeration: number;
  colorPalette: 'turbo' | 'viridis' | 'thermal' | 'coolwarm';
  availableDepths: number[];
  timeSteps: string[];
  variables: string[];
  selectedFloatId: number | null;
  
  setActiveVariable: (v: string) => void;
  setSelectedDepth: (d: number) => void;
  setTimeIndex: (t: number) => void;
  setVerticalExaggeration: (scale: number) => void;
  setColorPalette: (p: 'turbo' | 'viridis' | 'thermal' | 'coolwarm') => void;
  setMetadata: (depths: number[], times: string[], vars: string[]) => void;
  setSelectedFloatId: (id: number | null) => void;
}

export const useStore = create<AppState>((set) => ({
  activeVariable: 'temp',
  selectedDepth: 0.0,
  timeIndex: -1,
  verticalExaggeration: 30,
  colorPalette: 'turbo',
  availableDepths: [0, 10, 20, 50, 75, 100, 150, 200, 300, 500, 1000, 1500, 2000],
  timeSteps: [],
  variables: ['temp', 'sal'],
  selectedFloatId: null,
  
  setActiveVariable: (v) => set({ activeVariable: v }),
  setSelectedDepth: (d) => set({ selectedDepth: d }),
  setTimeIndex: (t) => set({ timeIndex: t }),
  setVerticalExaggeration: (scale) => set({ verticalExaggeration: scale }),
  setColorPalette: (p) => set({ colorPalette: p }),
  setMetadata: (depths, times, vars) => set({ availableDepths: depths, timeSteps: times, variables: vars }),
  setSelectedFloatId: (id) => set({ selectedFloatId: id }),
}));
