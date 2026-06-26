"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Step } from '@/lib/types';

interface StackVizProps {
  step: Step;
}

export const StackViz: React.FC<StackVizProps> = ({ step }) => {
  const items = step.items || [];
  const topIndex = step.top !== undefined && step.top !== null ? step.top : items.length - 1;

  return (
    <div className="flex flex-col items-center justify-between h-full w-full p-4 font-mono">
      <div className="flex-grow flex items-center justify-center w-full h-[220px] max-h-[250px]">
        
        {/* Stack Container representation */}
        <div className="relative border-r-4 border-l-4 border-b-4 border-border rounded-b-lg w-[140px] h-[200px] flex flex-col justify-end p-1.5 gap-1.5 bg-surface/20">
          
          <AnimatePresence initial={false}>
            {items.map((item, idx) => {
              const isTop = idx === topIndex;

              return (
                <motion.div
                  key={`stack-item-${idx}-${item}`}
                  initial={{ y: -60, scale: 0.8, opacity: 0 }}
                  animate={{ y: 0, scale: 1, opacity: 1 }}
                  exit={{ y: -60, scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                  className={`w-full py-2.5 rounded text-center font-bold border transition-all duration-300 relative select-none ${
                    isTop
                      ? 'bg-accent/25 border-accent text-accent shadow-glow'
                      : 'bg-surface border-border text-text-primary'
                  }`}
                >
                  {/* Item Value */}
                  {item}

                  {/* Top Pointer Indicator */}
                  {isTop && (
                    <div className="absolute -left-16 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <span className="text-[10px] bg-accent text-white px-1.5 py-0.5 rounded font-bold uppercase shadow-sm">
                        TOP
                      </span>
                      <ArrowLeft className="w-4 h-4 text-accent animate-pulse" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {items.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-text-secondary text-xs italic">
              Stack Empty
            </div>
          )}
        </div>
      </div>

      {/* Legend / Stats */}
      <div className="flex flex-wrap gap-4 justify-center items-center mt-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-text-secondary">Size:</span>
          <span className="font-bold text-accent">{items.length}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 border border-accent bg-accent/25 rounded shadow-glow" />
          <span className="text-text-secondary">Top Element</span>
        </div>
      </div>
    </div>
  );
};

export default StackViz;
