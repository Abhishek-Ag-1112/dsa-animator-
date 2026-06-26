"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Step } from '@/lib/types';

interface GraphVizProps {
  step: Step;
  inputValue: string;
}

interface NodePos {
  id: string;
  x: number;
  y: number;
}

interface Edge {
  from: string;
  to: string;
}

export const GraphViz: React.FC<GraphVizProps> = ({ step, inputValue }) => {
  const visited = step.visited || [];
  const current = step.current;
  const queue = step.queue || [];
  const frontier = step.frontier || [];

  // Parse nodes and edges from custom input: e.g. "A-B, B-C, A-C"
  const graphData = useMemo(() => {
    const nodesSet = new Set<string>();
    const edges: Edge[] = [];

    const pairs = inputValue
      ? inputValue.split(',').map(s => s.trim()).filter(Boolean)
      : ['A-B', 'B-C', 'C-D', 'D-A', 'A-C']; // Fallback

    pairs.forEach(pair => {
      const parts = pair.split('-');
      if (parts.length === 2) {
        const from = parts[0].trim();
        const to = parts[1].trim();
        if (from && to) {
          nodesSet.add(from);
          nodesSet.add(to);
          edges.push({ from, to });
        }
      }
    });

    const nodesList = Array.from(nodesSet);
    
    // Calculate circular coordinates in a 400x260 SVG coordinate space
    const cx = 200;
    const cy = 125;
    const radius = 90;
    const nodeCount = nodesList.length;

    const nodePositions: Record<string, NodePos> = {};
    nodesList.forEach((node, idx) => {
      const angle = (2 * Math.PI * idx) / (nodeCount || 1) - Math.PI / 2; // start top
      nodePositions[node] = {
        id: node,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    });

    return {
      nodes: nodesList,
      edges,
      positions: nodePositions,
    };
  }, [inputValue]);

  // Render edge line with arrowhead offset
  const renderEdge = (edge: Edge, idx: number) => {
    const fromNode = graphData.positions[edge.from];
    const toNode = graphData.positions[edge.to];
    
    if (!fromNode || !toNode) return null;

    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist === 0) return null;

    const r = 20; // Node radius
    const arrowPadding = 6; // Padding so arrowhead doesn't clip
    const startX = fromNode.x + (dx / dist) * r;
    const startY = fromNode.y + (dy / dist) * r;
    const endX = toNode.x - (dx / dist) * (r + arrowPadding);
    const endY = toNode.y - (dy / dist) * (r + arrowPadding);

    const isEdgeActive = 
      (current === edge.from && (frontier.includes(edge.to) || visited.includes(edge.to))) ||
      (current === edge.to && (frontier.includes(edge.from) || visited.includes(edge.from)));

    return (
      <line
        key={`edge-${idx}`}
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        className={`stroke-2 transition-all duration-300 ${
          isEdgeActive ? 'stroke-accent' : 'stroke-border'
        }`}
        markerEnd="url(#arrowhead)"
      />
    );
  };

  return (
    <div className="flex flex-col items-center justify-between h-full w-full p-4 font-mono">
      <div className="relative w-full flex-grow flex items-center justify-center h-[240px]">
        <svg className="w-full h-full max-w-[400px] max-h-[260px]">
          <defs>
            {/* Arrowhead marker */}
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="6"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0 0, 8 3, 0 6" fill="var(--accent)" className="fill-accent transition-colors duration-300" />
            </marker>
          </defs>

          {/* Draw Edges */}
          {graphData.edges.map((edge, idx) => renderEdge(edge, idx))}

          {/* Draw Nodes */}
          {graphData.nodes.map((nodeId) => {
            const pos = graphData.positions[nodeId];
            if (!pos) return null;

            const isCurrent = current === nodeId;
            const isVisited = visited.includes(nodeId);
            const isFrontier = frontier.includes(nodeId) || queue.includes(nodeId);

            let strokeColor = 'stroke-border';
            let fillColor = 'fill-surface';
            let glow = false;

            if (isCurrent) {
              strokeColor = 'stroke-accent';
              fillColor = 'fill-accent-muted';
              glow = true;
            } else if (isVisited) {
              strokeColor = 'stroke-[#10b981]';
              fillColor = 'fill-[rgba(16,185,129,0.15)]';
            } else if (isFrontier) {
              strokeColor = 'stroke-[#f59e0b]';
              fillColor = 'fill-[rgba(245,158,11,0.15)]';
            }

            return (
              <g key={`node-${nodeId}`} className="select-none">
                {/* Glow ring */}
                {glow && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={26}
                    className="stroke-1 stroke-accent opacity-40 fill-none animate-ping"
                    style={{ animationDuration: '2s' }}
                  />
                )}
                
                {/* Main Node */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={20}
                  className={`stroke-2 ${strokeColor} ${fillColor} transition-colors duration-300 cursor-pointer`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />

                {/* Node Label */}
                <text
                  x={pos.x}
                  y={pos.y}
                  dy=".3em"
                  textAnchor="middle"
                  className="fill-text-primary text-xs font-bold pointer-events-none"
                >
                  {nodeId}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Queue/Frontier Text Box */}
      <div className="w-full flex flex-col gap-2 mt-4 text-xs">
        <div className="flex gap-2 items-center bg-background border border-border p-2 rounded-md">
          <span className="text-text-secondary">Queue/Frontier:</span>
          <div className="flex gap-1.5 flex-wrap">
            {queue.length === 0 ? (
              <span className="text-text-secondary italic">Empty</span>
            ) : (
              queue.map((val, idx) => (
                <span
                  key={`q-${idx}`}
                  className="px-2 py-0.5 rounded bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40 font-bold"
                >
                  {val}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center items-center text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full border border-border bg-surface" />
            <span className="text-text-secondary">Unvisited</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full border border-accent bg-accent/20" />
            <span className="text-text-secondary">Current</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full border border-[#10b981] bg-[#10b981]/20" />
            <span className="text-text-secondary">Visited</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full border border-[#f59e0b] bg-[#f59e0b]/20" />
            <span className="text-text-secondary">Frontier</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphViz;
