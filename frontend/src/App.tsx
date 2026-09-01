import React from 'react';
import { Viewport3D } from './components/Viewport3D';
import { TopNav } from './components/TopNav';
import { DataHeader } from './components/DataHeader';
import { DisasterAlertBar } from './components/DisasterAlertBar';
import { ControlPanel } from './components/ControlPanel';
import { InspectorPanel } from './components/InspectorPanel';
import { TimeScrubber } from './components/TimeScrubber';
import { ScientificLegend } from './components/ScientificLegend';
import { ValidationModal } from './components/ValidationModal';
import { DisasterModal } from './components/DisasterModal';
import { StoryTourModal } from './components/StoryTourModal';
import { AiCopilotModal } from './components/AiCopilotModal';
import { HelpModal } from './components/HelpModal';

export default function App() {
  return (
    <main className="w-screen h-screen relative bg-slate-950 overflow-hidden select-none">
      {/* 1. Global Navigation & Status Bar */}
      <TopNav />

      {/* 2. Permanent Scientific Data Header Strip */}
      <DataHeader />

      {/* 3. Live INCOIS Coastal Disaster Alert Ticker */}
      <DisasterAlertBar />

      {/* 4. Central 3D Ocean Visualizer */}
      <Viewport3D />

      {/* 5. Left Sidebar Workstation Controls */}
      <ControlPanel />

      {/* 6. Right-Side Contextual Float Inspector */}
      <InspectorPanel />

      {/* 7. Bottom 4D Temporal Timeline Bar */}
      <TimeScrubber />

      {/* 8. Bottom-Right Scientific Colormap Legend */}
      <ScientificLegend />

      {/* 9. In-Situ Float Expanded Validation Modal */}
      <ValidationModal />

      {/* 10. INCOIS Coastal Disaster Situation Room Modal */}
      <DisasterModal />

      {/* 11. Public Outreach & Science Communication Guided Tour */}
      <StoryTourModal />

      {/* 12. Varuna-AI Oceanographic Copilot Assistant */}
      <AiCopilotModal />

      {/* 13. Workstation Guide & Help Modal */}
      <HelpModal />
    </main>
  );
}
