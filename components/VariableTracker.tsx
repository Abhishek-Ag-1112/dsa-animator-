"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { Step } from '@/lib/types';

interface VariableTrackerProps {
  step: Step;
}

export const VariableTracker: React.FC<VariableTrackerProps> = ({ step }) => {
  const [isOpen, setIsOpen] = useState(true);
  const variables = step.variables || {};
  const varKeys = Object.keys(variables);

  return (
    <div className="border border-border rounded-lg bg-surface/30 overflow-hidden font-mono text-xs">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-surface border-b border-border flex items-center justify-between font-bold text-text-secondary hover:text-text-primary transition-colors focus:outline-none select-none"
      >
        <div className="flex items-center gap-1.5 uppercase">
          <Layers className="w-4 h-4 text-accent" />
          <span>Variable Tracker</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-1 bg-background border border-border rounded font-normal text-text-secondary">
            {varKeys.length} active
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Variables Grid */}
      {isOpen && (
        <div className="p-4 bg-surface/10">
          {varKeys.length === 0 ? (
            <div className="text-center text-text-secondary italic py-2">
              No active variables in this step
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.entries(variables).map(([key, val]) => {
                const formattedVal = 
                  val === null || val === undefined 
                    ? 'null' 
                    : typeof val === 'object' 
                    ? JSON.stringify(val) 
                    : String(val);

                return (
                  <div
                    key={`var-box-${key}-${formattedVal}`} // Key forces remount & flash trigger on value change
                    className="flex flex-col p-2.5 rounded border border-border bg-surface/60 transition-all select-none flash-change"
                  >
                    <span className="text-[10px] text-text-secondary font-bold mb-1 border-b border-border/40 pb-0.5">
                      {key}
                    </span>
                    <span className="text-text-primary font-bold font-mono text-sm break-all">
                      {formattedVal}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VariableTracker;
