"use client";

import React, { useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, SkipBack, SkipForward, Volume2, VolumeX, Download } from 'lucide-react';

interface PlaybackControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  setStep: (step: number) => void;
  togglePlay: () => void;
  speed: number; // millisecond interval
  setSpeed: (speed: number) => void;
  muted: boolean;
  setMuted: (muted: boolean) => void;
  breakpointsCount: number;
  clearBreakpoints: () => void;
  disabled?: boolean;
  onExport?: () => void;
  isExporting?: boolean;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  setStep,
  togglePlay,
  speed,
  setSpeed,
  muted,
  setMuted,
  breakpointsCount,
  clearBreakpoints,
  disabled = false,
  onExport,
  isExporting = false,
}) => {
  
  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled || totalSteps === 0) return;

      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setStep(Math.max(0, currentStep - 1));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setStep(Math.min(totalSteps - 1, currentStep + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, totalSteps, isPlaying, disabled, togglePlay, setStep]);

  const speedText = speed < 400 ? 'Fast' : speed < 900 ? 'Normal' : 'Slow';

  return (
    <div className="flex flex-col gap-3 w-full bg-surface border border-border p-4 rounded-lg font-mono text-xs select-none">
      
      {/* Row 1: Action Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setStep(0)}
          disabled={disabled || currentStep === 0}
          className="px-2.5 py-1.5 rounded border border-border bg-transparent text-text-secondary hover:text-text-primary hover:border-accent disabled:opacity-30 transition-colors focus:outline-none"
          title="Jump to Start"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setStep(Math.max(0, currentStep - 1))}
          disabled={disabled || currentStep === 0}
          className="px-2.5 py-1.5 rounded border border-border bg-transparent text-text-secondary hover:text-text-primary hover:border-accent disabled:opacity-30 transition-colors focus:outline-none"
          title="Step Backward (◀)"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={togglePlay}
          disabled={disabled || totalSteps === 0}
          className="px-5 py-1.5 rounded bg-accent hover:bg-accent-hover text-white font-bold transition-all active:scale-95 focus:outline-none flex items-center gap-1.5"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current pl-0.5" />
              <span>Play</span>
            </>
          )}
        </button>

        <button
          onClick={() => setStep(Math.min(totalSteps - 1, currentStep + 1))}
          disabled={disabled || currentStep === totalSteps - 1}
          className="px-2.5 py-1.5 rounded border border-border bg-transparent text-text-secondary hover:text-text-primary hover:border-accent disabled:opacity-30 transition-colors focus:outline-none"
          title="Step Forward (▶)"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setStep(totalSteps - 1)}
          disabled={disabled || currentStep === totalSteps - 1}
          className="px-2.5 py-1.5 rounded border border-border bg-transparent text-text-secondary hover:text-text-primary hover:border-accent disabled:opacity-30 transition-colors focus:outline-none"
          title="Jump to End"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        <div className="flex-grow" />

        {/* Sound & Export hooks */}
        <button
          onClick={() => setMuted(!muted)}
          className="px-2.5 py-1.5 rounded border border-border bg-transparent text-text-secondary hover:text-text-primary hover:border-accent transition-colors focus:outline-none"
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5 text-accent" />}
        </button>

        {onExport && (
          <button
            onClick={onExport}
            disabled={disabled || totalSteps === 0 || isExporting}
            className="px-3 py-1.5 rounded border border-border bg-transparent text-text-secondary hover:text-text-primary hover:border-accent disabled:opacity-30 transition-colors focus:outline-none flex items-center gap-1"
            title="Export to GIF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>GIF</span>
          </button>
        )}
      </div>

      {/* Row 2: Range Scrubber Slider */}
      <div className="w-full">
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={currentStep}
          onChange={(e) => {
            if (isPlaying) togglePlay();
            setStep(Number(e.target.value));
          }}
          className="w-full h-1.5 bg-background rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
          style={{
            background: `linear-gradient(to right, var(--accent) ${
              totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0
            }%, var(--border) ${
              totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0
            }%)`
          }}
        />
      </div>

      {/* Row 3: Speed Range & Breakpoints */}
      <div className="flex items-center justify-between gap-4 text-[10px] text-text-secondary">
        <div className="flex items-center gap-2">
          <span>Speed</span>
          <input
            type="range"
            min={100}
            max={1500}
            value={1600 - speed}
            onChange={(e) => setSpeed(1600 - Number(e.target.value))}
            className="w-20 h-1 bg-background rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
            style={{
              background: `linear-gradient(to right, var(--accent) ${
                ((1600 - speed - 100) / 1400) * 100
              }%, var(--border) ${
                ((1600 - speed - 100) / 1400) * 100
              }%)`
            }}
          />
          <span className="font-bold text-accent">{speedText}</span>
        </div>

        <div className="flex items-center gap-2">
          {breakpointsCount > 0 && (
            <span className="text-red-500 font-bold">
              ● {breakpointsCount} Breakpoints
            </span>
          )}
          <button
            onClick={clearBreakpoints}
            className="underline hover:text-text-primary transition-colors focus:outline-none"
          >
            Clear breakpoints
          </button>
        </div>
      </div>

    </div>
  );
};

export default PlaybackControls;
