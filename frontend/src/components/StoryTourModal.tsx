import React from 'react';
import { useStore } from '../state/store';
import {
  GraduationCap,
  X,
  ChevronRight,
  ChevronLeft,
  Compass,
  Flame,
  Wind,
  ShieldAlert,
  Anchor,
  Play
} from 'lucide-react';

export const StoryTourModal: React.FC = () => {
  const {
    showStoryTour,
    setShowStoryTour,
    tourStep,
    setTourStep,
    setActiveVariable,
    setSelectedDepth,
    setViewMode,
    setCameraTarget,
    setShowCurrents,
    setDisasterMode
  } = useStore();

  if (!showStoryTour) return null;

  const chapters = [
    {
      chapter: 1,
      title: 'The Great Somali Jet & Monsoonal Upwelling',
      subtitle: 'Arabian Sea Hydrodynamic Engine',
      icon: Wind,
      badge: 'Physical Oceanography',
      badgeColor: 'text-sky-400 border-sky-700/50 bg-sky-950/80',
      description:
        'During the Southwest Monsoon (June-September), south-westerly winds drive the intense Somali Current along the western boundary of the Arabian Sea (>1.5 m/s). This wind-stress curl induces severe coastal upwelling, bringing cold, nutrient-rich deep water to the surface, lowering SST to ~23°C and driving massive phytoplankton blooms.',
      actionSummary: 'Setting Camera to Arabian Sea (12°N, 62°E) · Depth: 20m · Variable: Temperature',
      applyScene: () => {
        setViewMode('globe');
        setActiveVariable('temp');
        setSelectedDepth(20);
        setShowCurrents(true);
        setCameraTarget([12, 16, 26]);
      }
    },
    {
      chapter: 2,
      title: 'Bay of Bengal Cyclone Heat Engines (TCHP)',
      subtitle: 'Tropical Cyclone Rapid Intensification',
      icon: Flame,
      badge: 'Disaster Hazard Assessment',
      badgeColor: 'text-rose-400 border-rose-700/50 bg-rose-950/80',
      description:
        'The Bay of Bengal acts as a colossal thermal reservoir with sea surface temperatures exceeding 29.5°C and deep thermocline layers (>100m). Cyclones drawing energy from this Tropical Cyclone Heat Potential (TCHP) can rapidly intensify from a Category 1 Cyclonic Storm to a Super Cyclone within 24 hours.',
      actionSummary: 'Setting Camera to Bay of Bengal (16°N, 88°E) · Depth: 100m · Variable: SST',
      applyScene: () => {
        setViewMode('globe');
        setActiveVariable('sst');
        setSelectedDepth(100);
        setCameraTarget([28, 16, 26]);
      }
    },
    {
      chapter: 3,
      title: 'The 2,000m Abyssal Ocean & Argo Float Network',
      subtitle: 'Deep-Ocean Vertical Stratification',
      icon: Anchor,
      badge: 'Autonomous Observing Fleet',
      badgeColor: 'text-amber-400 border-amber-700/50 bg-amber-950/80',
      description:
        'Below the warm mixed layer lies the main thermocline (150m-300m) where temperatures plunge from 28°C to <10°C. In the abyssal zone at 2,000m depth, the deep Indian Ocean maintains a near-freezing ~2.4°C. Over 350 active autonomous Argo floats profile this water column every 10 days.',
      actionSummary: 'Switching to Volumetric Transect Box · Depth: 500m · Vertical Exaggeration: 35x',
      applyScene: () => {
        setViewMode('box');
        setActiveVariable('temp');
        setSelectedDepth(500);
        setCameraTarget([28, 22, 38]);
      }
    },
    {
      chapter: 4,
      title: 'Operational Disaster & 72h SAR Command',
      subtitle: 'Maritime Rescue & Early Warning System',
      icon: ShieldAlert,
      badge: 'Decision-Support Command',
      badgeColor: 'text-emerald-400 border-emerald-700/50 bg-emerald-950/80',
      description:
        'INCOIS operational systems ingest real-time ocean current velocity matrices to predict the forward drift trajectory of missing vessels, life rafts, and oil slicks. Coast Guard rescue coordinates (24h, 48h, 72h search datums) are calculated with Lagrangian leeway advection models.',
      actionSummary: 'Activating Disaster Situation Mode · 72h Drift Trajectory Enabled',
      applyScene: () => {
        setViewMode('globe');
        setDisasterMode(true);
        setCameraTarget([22, 18, 38]);
      }
    }
  ];

  const currentCh = chapters[tourStep];
  const Icon = currentCh.icon;

  const handleNext = () => {
    const nextStep = (tourStep + 1) % chapters.length;
    setTourStep(nextStep);
    chapters[nextStep].applyScene();
  };

  const handlePrev = () => {
    const prevStep = (tourStep - 1 + chapters.length) % chapters.length;
    setTourStep(prevStep);
    chapters[prevStep].applyScene();
  };

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-xl w-full px-4 select-none pointer-events-auto animate-fade-in">
      <div className="bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/50 rounded-3xl p-5 shadow-2xl shadow-cyan-950/50 text-white space-y-3.5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-700/50 text-cyan-400">
              <GraduationCap size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  PUBLIC OUTREACH & SCIENCE TOUR
                </h3>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  {tourStep + 1} / {chapters.length}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Interactive 3D Educational Storytelling Engine</p>
            </div>
          </div>

          <button
            onClick={() => setShowStoryTour(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Chapter Content Card */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${currentCh.badgeColor}`}>
              {currentCh.badge}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">{currentCh.subtitle}</span>
          </div>

          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Icon size={16} className="text-cyan-400" />
            <span>{currentCh.title}</span>
          </h4>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/70 p-3 rounded-2xl border border-slate-800/80">
            {currentCh.description}
          </p>

          <div className="flex items-center gap-2 text-[10px] text-cyan-300 font-mono bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-800/40">
            <Compass size={12} className="text-cyan-400" />
            <span className="truncate">{currentCh.actionSummary}</span>
          </div>
        </div>

        {/* Navigation Toolbar */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handlePrev}
            disabled={tourStep === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-300 transition"
          >
            <ChevronLeft size={14} /> Previous
          </button>

          <button
            onClick={currentCh.applyScene}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-cyan-300 transition flex items-center gap-1"
          >
            <Play size={12} /> Jump to Scene
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-500/20"
          >
            {tourStep === chapters.length - 1 ? 'Finish Tour' : 'Next Chapter'} <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

