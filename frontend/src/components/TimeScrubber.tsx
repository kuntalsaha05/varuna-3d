import React, { useEffect } from 'react';
import { useStore } from '../state/store';
import { Play, Pause, SkipBack, SkipForward, Clock, Radio } from 'lucide-react';

export const TimeScrubber: React.FC = () => {
  const {
    timeIndex,
    setTimeIndex,
    isPlayingTime,
    setIsPlayingTime,
    playbackSpeed,
    setPlaybackSpeed,
    timeSteps
  } = useStore();

  const totalSteps = timeSteps.length || 92;
  const currentStep = timeIndex < 0 ? totalSteps - 1 : timeIndex;

  // 4D Temporal Animation Timer
  useEffect(() => {
    let timer: any;
    if (isPlayingTime) {
      timer = setInterval(() => {
        setTimeIndex((currentStep + 1) % totalSteps);
      }, 1800 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlayingTime, currentStep, totalSteps, playbackSpeed, setTimeIndex]);

  const activeDate = timeSteps[currentStep] || '2024-01-10 10-Day Forecast';

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl bg-slate-950/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl px-5 py-3 shadow-2xl text-slate-100 flex items-center gap-4 select-none pointer-events-auto">
      {/* Play / Pause / Step Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setTimeIndex(Math.max(0, currentStep - 1))}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Previous Time Step"
        >
          <SkipBack size={14} />
        </button>

        <button
          onClick={() => setIsPlayingTime(!isPlayingTime)}
          className={`p-2 rounded-xl font-bold transition shadow-lg ${
            isPlayingTime
              ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
              : 'bg-cyan-500 text-slate-950 shadow-cyan-500/30'
          }`}
          title={isPlayingTime ? 'Pause Simulation' : 'Play 4D Simulation'}
        >
          {isPlayingTime ? <Pause size={15} /> : <Play size={15} />}
        </button>

        <button
          onClick={() => setTimeIndex((currentStep + 1) % totalSteps)}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Next Time Step"
        >
          <SkipForward size={14} />
        </button>
      </div>

      {/* Timeline Track & Timestamp Readout */}
      <div className="flex-1 space-y-1">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
            <Clock size={12} className="text-cyan-400" />
            <span>FORECAST STEP {currentStep + 1}/{totalSteps}</span>
          </span>
          <span className="font-mono text-cyan-300 font-bold text-xs">
            {activeDate.replace('T', ' ')}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max={totalSteps - 1}
          value={currentStep}
          onChange={(e) => setTimeIndex(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* Playback Speed Multipliers: 0.5x, 1x, 2x */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
        {[0.5, 1, 2].map((speed) => (
          <button
            key={speed}
            onClick={() => setPlaybackSpeed(speed)}
            className={`px-1.5 py-0.5 rounded font-mono text-[11px] font-bold transition ${
              playbackSpeed === speed
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  );
};
