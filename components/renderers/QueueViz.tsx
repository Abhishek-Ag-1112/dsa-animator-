"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { Step } from '@/lib/types';

interface QueueVizProps {
  step: Step;
}

export const QueueViz: React.FC<QueueVizProps> = ({ step }) => {
  const items = step.items || [];

  return (
    <div className="flex flex-col items-center justify-between h-full w-full p-4 font-mono">
      <div className="flex-grow flex items-center justify-center w-full h-[220px] max-h-[250px] overflow-x-auto">
        
        {/* Queue Lane representation */}
        <div className="relative border-t-2 border-b-2 border-border flex items-center p-2 gap-2 bg-surface/10 min-w-[280px] max-w-full justify-start h-[100px] rounded">
          
          <AnimatePresence initial={false}>
            {items.map((item, idx) => {
              const isFront = idx === 0;
              const isRear = idx === items.length - 1;

              return (
                <motion.div
                  key={`queue-item-${idx}-${item}`}
                  initial={{ x: 60, scale: 0.8, opacity: 0 }}
                  animate={{ x: 0, scale: 1, opacity: 1 }}
                  exit={{ x: -60, scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                  className={`w-[60px] h-[60px] rounded flex items-center justify-center font-bold border transition-all duration-300 relative select-none shrink-0 ${
                    isFront
                      ? 'bg-accent/25 border-accent text-accent shadow-glow'
                      : isRear
                      ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-[#f59e0b]'
                      : 'bg-surface border-border text-text-primary'
                  }`}
                >
                  {/* Item Value */}
                  {item}

                  {/* Front/Rear Pointer Indicators */}
                  {(isFront || isRear) && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shadow-sm ${
                        isFront ? 'bg-accent text-white' : 'bg-[#f59e0b] text-background'
                      }`}>
                        {isFront ? 'FRONT' : 'REAR'}
                      </span>
                      <ArrowDown className={`w-3.5 h-3.5 ${isFront ? 'text-accent' : 'text-[#f59e0b]'} animate-pulse`} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {items.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-text-secondary text-xs italic">
              Queue Empty
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
          <div className="w-3.5 h-3.5 border border-accent bg-accent/25 rounded" />
          <span className="text-text-secondary">Front (Exit)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 border border-[#f59e0b] bg-[#f59e0b]/20 rounded" />
          <span className="text-text-secondary">Rear (Entrance)</span>
        </div>
      </div>
    </div>
  );
};

export default QueueViz;
