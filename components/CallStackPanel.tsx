"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Database } from 'lucide-react';
import { Step } from '@/lib/types';

interface CallStackPanelProps {
  step: Step;
}

export const CallStackPanel: React.FC<CallStackPanelProps> = ({ step }) => {
  const [isOpen, setIsOpen] = useState(true);
  const callStack = step.callStack || [];

  // If no stack frames, do not render this panel (per requirement: only shown for recursive algorithms)
  if (callStack.length === 0) return null;

  return (
    <div className="border border-border rounded-lg bg-surface/30 overflow-hidden font-mono text-xs animate-in fade-in duration-200">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-surface border-b border-border flex items-center justify-between font-bold text-text-secondary hover:text-text-primary transition-colors focus:outline-none select-none"
      >
        <div className="flex items-center gap-1.5 uppercase">
          <Database className="w-4 h-4 text-accent" />
          <span>Call Stack Frames</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-1 bg-background border border-border rounded font-normal text-text-secondary">
            {callStack.length} depth
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Stack Items */}
      {isOpen && (
        <div className="p-4 bg-surface/10 flex flex-col justify-end min-h-[100px] gap-1.5 border-b border-border/10">
          <div className="flex flex-col-reverse gap-1.5 w-full max-w-md mx-auto">
            {callStack.map((frame, idx) => {
              const isActive = idx === callStack.length - 1;
              const argsStr = Object.entries(frame.args)
                .map(([name, val]) => `${name}=${val}`)
                .join(', ');

              return (
                <div
                  key={`frame-${idx}-${frame.fn}`}
                  className={`px-3 py-2.5 rounded border transition-all duration-300 font-mono text-xs flex justify-between items-center select-none ${
                    isActive
                      ? 'bg-accent/20 border-accent text-accent shadow-glow font-bold'
                      : 'bg-surface/50 border-border text-text-secondary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-secondary">[{idx}]</span>
                    <span>{frame.fn}({argsStr})</span>
                  </div>
                  
                  {isActive && (
                    <span className="text-[9px] bg-accent text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      Active
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CallStackPanel;
