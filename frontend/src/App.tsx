import React from 'react';
import { Viewport3D } from './components/Viewport3D';
import { ControlPanel } from './components/ControlPanel';
import { PaletteEditor } from './components/PaletteEditor';
import { TimeScrubber } from './components/TimeScrubber';
import { StatsHUD } from './components/StatsHUD';
import { ValidationModal } from './components/ValidationModal';

export default function App() {
  return (
    <main className="w-screen h-screen relative bg-slate-950 overflow-hidden font-sans">
      <Viewport3D />
      <ControlPanel />
      <PaletteEditor />
      <TimeScrubber />
      <StatsHUD />
      <ValidationModal />
    </main>
  );
}

