import React, { useEffect } from 'react';
import { useStore } from '../state/store';
import { Play, Pause, SkipBack, SkipForward, Clock } from 'lucide-react';

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

  // Animation Timer
  useEffect(() => {
    let timer: any;
    if (isPlayingTime) {
      timer = setInterval(() => {
        setTimeIndex((currentStep + 1) % totalSteps);
      }, 1500 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlayingTime, currentStep, totalSteps, playbackSpeed, setTimeIndex]);

  const activeDate = timeSteps[currentStep] || '2024-01-10 10-Day Forecast';

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl bg-slate-950/85 backdrop-blur-xl border border-slate-800/80 rounded-2xl px-6 py-3 shadow-2xl text-slate-100 flex items-center gap-5">
      {/* Play / Pause / Step Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTimeIndex(Math.max(0, currentStep - 1))}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Previous Time Step"
        >
          <SkipBack size={15} />
        </button>

        <button
          onClick={() => setIsPlayingTime(!isPlayingTime)}
          className={`p-2.5 rounded-xl font-bold transition shadow-lg ${
            isPlayingTime
              ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
              : 'bg-cyan-500 text-slate-950 shadow-cyan-500/30'
          }`}
          title={isPlayingTime ? 'Pause Simulation' : 'Play Simulation'}
        >
          {isPlayingTime ? <Pause size={17} /> : <Play size={17} />}
        </button>

        <button
          onClick={() => setTimeIndex((currentStep + 1) % totalSteps)}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Next Time Step"
        >
          <SkipForward size={15} />
        </button>
      </div>

      {/* Time Timeline Track & Timestamp */}
      <div className="flex-1 space-y-1">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Clock size={13} className="text-cyan-400" /> 4D FORECAST TIMESTAMP
          </span>
          <span className="font-mono text-cyan-400 font-bold">
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

      {/* Playback Speed Multiplier */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
        {[1, 2, 5].map((speed) => (
          <button
            key={speed}
            onClick={() => setPlaybackSpeed(speed)}
            className={`px-2 py-0.5 rounded-md font-mono font-bold transition ${
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
