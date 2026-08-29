import React from 'react';
import { Viewport3D } from './components/Viewport3D';
import { TopNav } from './components/TopNav';
import { ControlPanel } from './components/ControlPanel';
import { TimeScrubber } from './components/TimeScrubber';
import { ValidationModal } from './components/ValidationModal';

export default function App() {
  return (
    <main className="w-screen h-screen relative bg-slate-950 overflow-hidden select-none">
      <TopNav />
      <Viewport3D />
      <ControlPanel />
      <TimeScrubber />
      <ValidationModal />
    </main>
  );
}
