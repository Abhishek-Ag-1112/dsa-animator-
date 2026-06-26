"use client";

import React, { useEffect } from 'react';
import { HelpCircle, Shuffle } from 'lucide-react';
import { VisualizerType } from '@/lib/types';

interface CustomInputPanelProps {
  inputType: VisualizerType;
  value: string;
  onChange: (val: string) => void;
}

export const CustomInputPanel: React.FC<CustomInputPanelProps> = ({
  inputType,
  value,
  onChange,
}) => {
  
  // Set default values when inputType changes if the input value is empty or generic
  useEffect(() => {
    if (!value) {
      handleRandomize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputType]);

  const handleRandomize = () => {
    let newVal = '';
    
    switch (inputType) {
      case 'sorting': {
        // 5 to 8 random numbers between 1 and 20
        const len = Math.floor(Math.random() * 4) + 5; // 5-8
        const nums = Array.from({ length: len }, () => Math.floor(Math.random() * 19) + 2);
        newVal = nums.join(', ');
        break;
      }
      case 'tree': {
        // BST input values (root, left sub-branch, right sub-branch)
        // Set standard keys to make a nice balanced BST
        const templates = [
          [12, 6, 18, 3, 9, 15, 21],
          [10, 5, 15, 3, 7, 12, 18],
          [15, 8, 20, 4, 11, 16, 25],
        ];
        const selected = templates[Math.floor(Math.random() * templates.length)];
        newVal = selected.join(', ');
        break;
      }
      case 'graph': {
        // Random graph edges
        const templates = [
          'A-B, B-C, C-D, D-A, A-C',
          'A-B, A-C, B-D, C-D, D-E, C-E',
          '1-2, 2-3, 3-4, 4-1, 1-3, 3-5',
        ];
        newVal = templates[Math.floor(Math.random() * templates.length)];
        break;
      }
      case 'linkedlist': {
        // 4 to 6 elements
        const len = Math.floor(Math.random() * 3) + 4; // 4-6
        const list = Array.from({ length: len }, (_, i) => (i + 1) * 10);
        newVal = list.join(', ');
        break;
      }
      case 'stack':
      case 'queue': {
        // 3 to 5 items
        const len = Math.floor(Math.random() * 3) + 3; // 3-5
        const items = Array.from({ length: len }, () => Math.floor(Math.random() * 90) + 10);
        newVal = items.join(', ');
        break;
      }
      default:
        newVal = '1, 2, 3, 4, 5';
    }

    onChange(newVal);
  };

  const getHelpText = () => {
    switch (inputType) {
      case 'sorting':
        return 'Enter comma-separated numbers (e.g. 5, 3, 8, 1, 9)';
      case 'tree':
        return 'Enter values to insert into a Binary Search Tree (e.g. 10, 5, 15, 3, 7)';
      case 'graph':
        return 'Enter comma-separated node pairs representing edges (e.g. A-B, B-C, A-C)';
      case 'linkedlist':
        return 'Enter comma-separated node values (e.g. 10, 20, 30, 40)';
      case 'stack':
      case 'queue':
        return 'Enter comma-separated initial values (e.g. 10, 20, 30)';
      default:
        return '';
    }
  };

  const getPlaceholder = () => {
    switch (inputType) {
      case 'sorting': return '5, 3, 8, 1, 9';
      case 'tree': return '10, 5, 15, 3, 7';
      case 'graph': return 'A-B, B-C, A-C';
      case 'linkedlist': return '10, 20, 30, 40';
      default: return '10, 20, 30';
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-surface/50 border border-border rounded-lg font-mono text-xs mb-3">
      <div className="flex items-center justify-between">
        <label className="font-bold text-text-secondary uppercase flex items-center gap-1.5 select-none">
          Custom Input Data
        </label>
        
        <button
          type="button"
          onClick={handleRandomize}
          className="flex items-center gap-1 text-accent hover:text-accent-hover transition-colors font-bold"
          title="Randomize Values"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Randomize</span>
        </button>
      </div>

      <div className="relative">
        {inputType === 'graph' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={getPlaceholder()}
            rows={2}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent font-mono text-xs resize-none"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent font-mono text-xs"
          />
        )}
      </div>

      <div className="flex items-center gap-1 text-[10px] text-text-secondary leading-normal">
        <HelpCircle className="w-3 h-3 text-accent shrink-0" />
        <span>{getHelpText()}</span>
      </div>
    </div>
  );
};

export default CustomInputPanel;
