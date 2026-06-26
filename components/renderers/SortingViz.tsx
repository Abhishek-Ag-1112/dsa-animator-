"use client";

import React from 'react';
import { Step } from '@/lib/types';
import { useTheme } from '@/lib/themeContext';

interface SortingVizProps {
  step: Step;
  prevStep?: Step;
  isLastStep?: boolean;
}

const THEME_COLORS: Record<string, { barDef: string; barComp: string; barAct: string; barSwap: string; text: string; muted: string }> = {
  'default-dark': { barDef: '#3a3760', barComp: '#22c55e', barAct: '#f59e0b', barSwap: '#ef4444', text: '#e2e0f0', muted: '#8b89a8' },
  'github-dark': { barDef: '#2d333b', barComp: '#58a6ff', barAct: '#f59e0b', barSwap: '#ef4444', text: '#adbac7', muted: '#768390' },
  'dracula': { barDef: '#44475a', barComp: '#50fa7b', barAct: '#ffb86c', barSwap: '#ff5555', text: '#f8f8f2', muted: '#6272a4' },
  'monokai': { barDef: '#49483e', barComp: '#a6e22e', barAct: '#f92672', barSwap: '#f92672', text: '#f8f8f2', muted: '#75715e' },
  'light': { barDef: '#c4c2e0', barComp: '#16a34a', barAct: '#d97706', barSwap: '#dc2626', text: '#1a1a2e', muted: '#6b6b8a' },
};

export const SortingViz: React.FC<SortingVizProps> = ({ step, isLastStep = false }) => {
  const { currentTheme } = useTheme();
  const T = THEME_COLORS[currentTheme.id] || THEME_COLORS['default-dark'];

  const array = step.array || [];
  const comparing = step.comparing || [];
  const swapped = step.swapped || false;
  const sorted = step.sorted || [];
  
  // Find the maximum value to scale heights proportionally
  const maxBar = array.length > 0 ? Math.max(...array) : 10;

  return (
    <div className="flex flex-col items-center justify-between h-full w-full p-4 font-mono select-none">
      {/* Chart container */}
      <div className="flex items-end justify-center gap-1.5 w-full flex-grow h-[180px] max-h-[220px] pb-2 border-b border-border">
        {array.map((val, idx) => {
          const isHL = comparing.includes(idx);
          const isSorted = sorted.includes(idx) || isLastStep;
          const isSwap = swapped && isHL;

          // Color selection matching the exact theme settings
          const color = isSorted ? T.barComp : isSwap ? T.barSwap : isHL ? T.barAct : T.barDef;

          // Direct pixel height calculation to avoid collapsing in auto-height wrappers
          const h = Math.max(8, (val / maxBar) * 130);

          return (
            <div
              key={`bar-${idx}`}
              className="flex flex-col items-center flex-grow flex-shrink min-w-[8px] max-w-[45px] gap-1.5"
            >
              {/* Value Label */}
              <span 
                style={{ fontSize: '10px', color: isHL ? T.text : T.muted, fontWeight: isHL ? 700 : 400 }}
                className="transition-all duration-200"
              >
                {val}
              </span>

              {/* Bar element with direct pixel height and transitions */}
              <div
                style={{
                  height: `${h}px`,
                  backgroundColor: color,
                  boxShadow: isHL ? `0 0 8px ${color}88` : 'none',
                  transition: 'height 0.25s, background-color 0.2s',
                }}
                className="w-full rounded-t-[3px]"
              />

              {/* Index Label */}
              <span className="text-[8px] font-mono text-text-secondary opacity-50">
                {idx}
              </span>
            </div>
          );
        })}
      </div>

      {/* Color Legend */}
      <div className="flex flex-wrap gap-4 justify-center items-center mt-3 text-[10px]">
        <div className="flex items-center gap-1.5">
          <div style={{ backgroundColor: T.barDef }} className="w-2.5 h-2.5 rounded-sm border border-border" />
          <span className="text-text-secondary">Default</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div style={{ backgroundColor: T.barAct }} className="w-2.5 h-2.5 rounded-sm shadow-[0_0_4px_rgba(245,158,11,0.5)]" />
          <span className="text-text-secondary">Comparing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div style={{ backgroundColor: T.barSwap }} className="w-2.5 h-2.5 rounded-sm shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
          <span className="text-text-secondary">Swapping</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div style={{ backgroundColor: T.barComp }} className="w-2.5 h-2.5 rounded-sm" />
          <span className="text-text-secondary">Sorted</span>
        </div>
      </div>
    </div>
  );
};

export default SortingViz;
