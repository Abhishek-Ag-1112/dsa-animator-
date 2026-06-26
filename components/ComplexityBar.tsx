"use client";

import React from 'react';

interface ComplexityBarProps {
  timeComplexity?: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity?: string;
}

export const ComplexityBar: React.FC<ComplexityBarProps> = ({
  timeComplexity,
  spaceComplexity,
}) => {
  const best = timeComplexity?.best || 'N/A';
  const average = timeComplexity?.average || 'N/A';
  const worst = timeComplexity?.worst || 'N/A';
  const space = spaceComplexity || 'N/A';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full font-mono text-xs select-none">
      {/* Best */}
      <div className="flex flex-col p-2 bg-[#10b981]/5 border border-[#10b981]/25 rounded items-center text-center">
        <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-0.5">Time: Best</span>
        <span className="text-[#10b981] font-bold text-sm">{best}</span>
      </div>

      {/* Avg */}
      <div className="flex flex-col p-2 bg-[#f59e0b]/5 border border-[#f59e0b]/25 rounded items-center text-center">
        <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-0.5">Time: Avg</span>
        <span className="text-[#f59e0b] font-bold text-sm">{average}</span>
      </div>

      {/* Worst */}
      <div className="flex flex-col p-2 bg-[#ef4444]/5 border border-[#ef4444]/25 rounded items-center text-center">
        <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-0.5">Time: Worst</span>
        <span className="text-[#ef4444] font-bold text-sm">{worst}</span>
      </div>

      {/* Space */}
      <div className="flex flex-col p-2 bg-[#bd93f9]/5 border border-[#bd93f9]/25 rounded items-center text-center">
        <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-0.5">Space Complexity</span>
        <span className="text-[#bd93f9] font-bold text-sm">{space}</span>
      </div>
    </div>
  );
};

export default ComplexityBar;
