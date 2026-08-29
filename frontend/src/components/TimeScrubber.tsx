import React, { useEffect } from 'react';
import { useStore } from '../state/store';
import { Play, Pause, SkipBack, SkipForward, Clock, Zap } from 'lucide-react';

export const TimeScrubber: React.FC = () => {
  const {
    timeIndex,
    setTimeIndex,
    timeSteps,
    isPlaying,
    setIsPlaying,
    playbackSpeedMs,
    setPlaybackSpeedMs,
    currentTimeStr
  } = useStore();

  const totalSteps = timeSteps.length || 1;
  const currentIdx = timeIndex < 0 ? totalSteps - 1 : Math.min(timeIndex, totalSteps - 1);

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTimeIndex((currentIdx + 1) % totalSteps);
    }, playbackSpeedMs);

    return () => clearInterval(interval);
  }, [isPlaying, currentIdx, totalSteps, playbackSpeedMs, setTimeIndex]);

  const formatDate = (isoStr: string | null) => {
    if (!isoStr) return 'Latest Model Step';
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return isoStr;
    }
  };

  if (timeSteps.length <= 1) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3.5 shadow-2xl text-slate-100 flex flex-col gap-2.5 select-none">
      {/* Top row: Playback controls & Date HUD */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {/* Step Back */}
          <button
            onClick={() => {
              setIsPlaying(false);
              setTimeIndex(Math.max(0, currentIdx - 1));
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Previous 10-day step"
          >
            <SkipBack size={14} />
          </button>

          {/* Play / Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                : 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
            }`}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            <span className="text-[11px]">{isPlaying ? 'Pause' : 'Play 4D'}</span>
          </button>

          {/* Step Forward */}
          <button
            onClick={() => {
              setIsPlaying(false);
              setTimeIndex(Math.min(totalSteps - 1, currentIdx + 1));
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Next 10-day step"
          >
            <SkipForward size={14} />
          </button>

          {/* Playback Speed Toggles */}
          <div className="flex items-center gap-1 bg-slate-950/60 p-0.5 rounded-lg border border-slate-800 ml-2">
            <Zap size={11} className="text-cyan-400 ml-1" />
            {[
              { label: '0.5x', ms: 2000 },
              { label: '1x', ms: 1200 },
              { label: '2x', ms: 600 }
            ].map(({ label, ms }) => (
              <button
                key={label}
                onClick={() => setPlaybackSpeedMs(ms)}
                className={`text-[9px] px-1.5 py-0.5 rounded font-semibold transition ${
                  playbackSpeedMs === ms ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Display */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1 rounded-xl border border-slate-800 font-mono text-cyan-400">
          <Clock size={12} className="text-slate-400" />
          <span className="font-bold text-xs">
            {formatDate(currentTimeStr || timeSteps[currentIdx])}
          </span>
          <span className="text-[10px] text-slate-500">
            ({currentIdx + 1}/{totalSteps})
          </span>
        </div>
      </div>

      {/* Bottom row: Timeline Slider */}
      <input
        type="range"
        min="0"
        max={totalSteps - 1}
        step="1"
        value={currentIdx}
        onChange={(e) => {
          setIsPlaying(false);
          setTimeIndex(Number(e.target.value));
        }}
        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
      />
    </div>
  );
};

