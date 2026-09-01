import React from 'react';
import { Viewport3D } from './components/Viewport3D';
import { TopNav } from './components/TopNav';
import { DataHeader } from './components/DataHeader';
import { ControlPanel } from './components/ControlPanel';
import { InspectorPanel } from './components/InspectorPanel';
import { TimeScrubber } from './components/TimeScrubber';
import { ScientificLegend } from './components/ScientificLegend';
import { ValidationModal } from './components/ValidationModal';
import { HelpModal } from './components/HelpModal';

export default function App() {
  return (
    <main className="w-screen h-screen relative bg-slate-950 overflow-hidden select-none">
      {/* 1. Global Navigation & Status Bar */}
      <TopNav />

      {/* 2. Permanent Scientific Data Header Strip */}
      <DataHeader />

      {/* 3. Central 3D Ocean Visualizer */}
      <Viewport3D />

      {/* 4. Left Sidebar Workstation Controls (Accordion) */}
      <ControlPanel />

      {/* 5. Right-Side Contextual Float Inspector */}
      <InspectorPanel />

      {/* 6. Bottom 4D Temporal Timeline Bar */}
      <TimeScrubber />

      {/* 7. Bottom-Right Scientific Colormap Legend */}
      <ScientificLegend />

      {/* 8. Full Expanded Validation Modal */}
      <ValidationModal />

      {/* 9. Workstation Guide & Help Modal */}
      <HelpModal />
    </main>
  );
}
