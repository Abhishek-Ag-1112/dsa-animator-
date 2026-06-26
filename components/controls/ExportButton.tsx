"use client";

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { exportVisualizerToGif, ExportProgress } from '@/lib/exportUtils';

interface ExportButtonProps {
  elementId: string;
  totalSteps: number;
  setStep: (step: number) => void;
  isPlaying: boolean;
  pause: () => void;
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  elementId,
  totalSteps,
  setStep,
  isPlaying,
  pause,
  disabled = false,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);

  const handleExport = async () => {
    if (totalSteps <= 0) return;

    // Pause playback before exporting
    if (isPlaying) {
      pause();
    }

    setIsExporting(true);
    setExportProgress({ percent: 0, message: 'Preparing visualizer for capture...' });

    try {
      const gifBlob = await exportVisualizerToGif(
        elementId,
        totalSteps,
        setStep,
        (progress) => setExportProgress(progress),
        0.4 // 400ms interval for GIF frames
      );

      if (gifBlob) {
        const url = URL.createObjectURL(gifBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dsa-animation-${Date.now()}.gif`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('GIF Export failed:', error);
      alert('Failed to generate GIF. Please try again.');
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  return (
    <>
      <button
        onClick={handleExport}
        disabled={disabled || isExporting || totalSteps === 0}
        className={`px-3 py-1.5 rounded bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-accent transition-all flex items-center gap-1.5 text-xs font-semibold focus:outline-none ${
          isExporting ? 'opacity-85 cursor-not-allowed border-accent' : ''
        }`}
        title="Export Animation as GIF"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 text-accent animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>{isExporting ? 'Exporting...' : 'Export GIF'}</span>
      </button>

      {/* Progress Modal/Overlay */}
      {isExporting && exportProgress && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-lg max-w-md w-full p-6 shadow-xl flex flex-col gap-4 font-mono text-xs">
            <h3 className="text-sm font-bold text-text-primary">Compiling GIF Animation</h3>
            
            {/* Loader indicator */}
            <div className="flex items-center gap-2 text-text-secondary">
              <Loader2 className="w-4 h-4 text-accent animate-spin shrink-0" />
              <span>{exportProgress.message}</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-background rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-gradient-to-r from-accent to-[#ff79c6] transition-all duration-300"
                style={{ width: `${exportProgress.percent}%` }}
              />
            </div>

            {/* Progress Percentage */}
            <div className="text-right text-[10px] text-text-secondary">
              {exportProgress.percent}% Complete
            </div>
            
            <p className="text-[10px] text-text-secondary italic leading-relaxed border-t border-border pt-3">
              We are moving step-by-step to capture snapshot frames of the canvas. Please keep this tab active for best results.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ExportButton;
