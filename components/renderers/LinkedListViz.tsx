"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Step } from '@/lib/types';

interface LinkedListVizProps {
  step: Step;
}

interface LinkedListNode {
  id: string | number;
  val: any;
  next: string | number | null;
}

export const LinkedListViz: React.FC<LinkedListVizProps> = ({ step }) => {
  const highlighted = step.highlighted || [];
  const head = step.head;
  const variables = step.variables || {};

  // Standardize nodes from the step
  const listNodes = useMemo(() => {
    const rawNodes = step.nodes || [];
    if (rawNodes.length === 0) return [];

    // Map raw nodes and ensure we have id, val, next
    return rawNodes.map((node, index) => {
      if (typeof node === 'object' && node !== null) {
        return {
          id: node.id !== undefined ? node.id : index,
          val: node.val !== undefined ? node.val : String(node),
          next: node.next !== undefined ? node.next : (index < rawNodes.length - 1 ? index + 1 : null),
        } as LinkedListNode;
      }
      return {
        id: index,
        val: node,
        next: index < rawNodes.length - 1 ? index + 1 : null,
      } as LinkedListNode;
    });
  }, [step.nodes]);

  // Find pointers pointing to each node (e.g., prev, curr, head, temp)
  const getNodePointers = (node: LinkedListNode, index: number) => {
    const ptrs: string[] = [];
    
    // Head pointer
    if (head !== undefined && head !== null) {
      if (String(head) === String(node.id) || (typeof head === 'number' && head === index)) {
        ptrs.push('HEAD');
      }
    } else if (index === 0) {
      // Default fallback
      ptrs.push('HEAD');
    }

    // Live variables matching this node's ID or value or index
    Object.entries(variables).forEach(([key, val]) => {
      // Muted common helpers we don't want as pointer markers (like array lengths)
      if (['n', 'length', 'count', 'size'].includes(key.toLowerCase())) return;

      if (String(val) === String(node.id) || (typeof val === 'number' && val === index)) {
        ptrs.push(key);
      }
    });

    return ptrs;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4 font-mono overflow-x-auto min-h-[260px]">
      <div className="flex items-center justify-start gap-1 py-10 min-w-full px-4 select-none">
        
        {/* Linked List Chain */}
        {listNodes.length === 0 ? (
          <div className="w-full text-center text-text-secondary italic">
            No linked list nodes present
          </div>
        ) : (
          listNodes.map((node, idx) => {
            const isHighlighted = highlighted.includes(node.id) || highlighted.includes(idx);
            const pointers = getNodePointers(node, idx);

            return (
              <React.Fragment key={`ll-node-${node.id}-${idx}`}>
                {/* Node Box */}
                <div className="flex flex-col items-center relative">
                  
                  {/* Top Pointer Indicators */}
                  <div className="absolute -top-9 flex flex-col items-center gap-0.5 min-h-[30px] justify-end">
                    {pointers.map((ptr) => (
                      <span
                        key={`ptr-${ptr}`}
                        className={`px-1.5 py-0.5 text-[10px] rounded font-bold uppercase ${
                          ptr === 'HEAD' 
                            ? 'bg-accent text-white' 
                            : 'bg-surface border border-accent text-accent'
                        }`}
                      >
                        {ptr}
                      </span>
                    ))}
                    {pointers.length > 0 && (
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce mt-0.5" />
                    )}
                  </div>

                  {/* Node Container: [ Val | Next ] */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className={`flex rounded border bg-surface overflow-hidden ${
                      isHighlighted 
                        ? 'border-accent shadow-glow scale-105' 
                        : 'border-border'
                    }`}
                  >
                    {/* Data Field */}
                    <div className="px-4 py-3 flex items-center justify-center font-bold border-r border-border min-w-[50px] bg-background/30 text-text-primary">
                      {node.val}
                    </div>
                    {/* Next Pointer Field */}
                    <div className="px-2.5 py-3 flex items-center justify-center text-[10px] text-text-secondary bg-surface min-w-[30px]">
                      {node.next !== null ? '•' : 'Ø'}
                    </div>
                  </motion.div>
                </div>

                {/* Arrow Connector */}
                <div className="flex items-center justify-center px-1">
                  {node.next !== null ? (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      className="text-accent flex items-center"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-1 text-text-secondary pl-1">
                      <ArrowRight className="w-5 h-5 text-border" />
                      <span className="text-xs font-bold text-red-500">NULL</span>
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 justify-center items-center mt-4 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-5 h-3.5 border border-border bg-surface rounded-sm" />
          <span className="text-text-secondary">Node (Data | Pointer)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-5 h-3.5 border border-accent bg-surface rounded-sm shadow-glow" />
          <span className="text-text-secondary">Highlighted</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 text-[9px] rounded bg-accent text-white font-bold">PTR</span>
          <span className="text-text-secondary">Pointer Variable</span>
        </div>
      </div>
    </div>
  );
};

export default LinkedListViz;
