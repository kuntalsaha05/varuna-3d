import React from 'react';
import { Viewport3D } from './components/Viewport3D';
import { ControlPanel } from './components/ControlPanel';
import { ValidationModal } from './components/ValidationModal';

export default function App() {
  return (
    <main className="w-screen h-screen relative bg-slate-950 overflow-hidden">
      <Viewport3D />
      <ControlPanel />
      <ValidationModal />
    </main>
  );
}
