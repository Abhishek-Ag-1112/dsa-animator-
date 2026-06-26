"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Step } from '@/lib/types';

interface TreeVizProps {
  step: Step;
}

interface TreeNode {
  id: string;
  val: any;
  left: string | null;
  right: string | null;
}

interface PositionedNode extends TreeNode {
  x: number;
  y: number;
}

export const TreeViz: React.FC<TreeVizProps> = ({ step }) => {
  const highlighted = useMemo(() => {
    return (step.highlighted || []).map(h => String(h));
  }, [step.highlighted]);

  const treeData = useMemo(() => {
    const rawNodes = step.nodes || [];
    if (rawNodes.length === 0) return { nodes: [], positions: {}, edges: [] };

    // Standardize nodes
    const nodesMap: Record<string, TreeNode> = {};
    const childIds = new Set<string>();

    const nodesList: TreeNode[] = rawNodes.map((node, index) => {
      let id = String(index);
      let val = node;
      let left: string | number | null = null;
      let right: string | number | null = null;

      if (typeof node === 'object' && node !== null) {
        id = node.id !== undefined ? String(node.id) : String(index);
        val = node.val !== undefined ? node.val : '';
        left = node.left !== undefined && node.left !== null ? String(node.left) : null;
        right = node.right !== undefined && node.right !== null ? String(node.right) : null;
      }

      const standardNode = { id, val, left, right };
      nodesMap[id] = standardNode;

      if (left !== null) childIds.add(String(left));
      if (right !== null) childIds.add(String(right));

      return standardNode;
    });

    // Find root (node that is not a child of any other node)
    let rootId = nodesList[0]?.id;
    for (const node of nodesList) {
      if (!childIds.has(node.id)) {
        rootId = node.id;
        break;
      }
    }

    if (!rootId) return { nodes: [], positions: {}, edges: [] };

    // Recursive layout calculator
    const positions: Record<string, PositionedNode> = {};
    const edges: { from: string; to: string }[] = [];
    const svgWidth = 400;
    const levelHeight = 50;

    const layout = (nodeId: string, x: number, y: number, spread: number) => {
      const node = nodesMap[nodeId];
      if (!node) return;

      positions[nodeId] = { ...node, x, y };

      if (node.left !== null && nodesMap[String(node.left)]) {
        const leftId = String(node.left);
        const nextX = x - spread;
        const nextY = y + levelHeight;
        edges.push({ from: nodeId, to: leftId });
        layout(leftId, nextX, nextY, spread * 0.5);
      }

      if (node.right !== null && nodesMap[String(node.right)]) {
        const rightId = String(node.right);
        const nextX = x + spread;
        const nextY = y + levelHeight;
        edges.push({ from: nodeId, to: rightId });
        layout(rightId, nextX, nextY, spread * 0.5);
      }
    };

    // Begin layout from center top (x = 200, y = 35)
    layout(rootId, svgWidth / 2, 35, 90);

    return {
      nodes: Object.values(positions),
      positions,
      edges,
    };
  }, [step.nodes]);

  return (
    <div className="flex flex-col items-center justify-between h-full w-full p-4 font-mono">
      <div className="relative w-full flex-grow flex items-center justify-center h-[230px]">
        {treeData.nodes.length === 0 ? (
          <div className="text-text-secondary text-xs italic">Empty Tree</div>
        ) : (
          <svg className="w-full h-full max-w-[400px] max-h-[250px]">
            {/* Render connections */}
            {treeData.edges.map((edge, idx) => {
              const parent = treeData.positions[edge.from];
              const child = treeData.positions[edge.to];
              if (!parent || !child) return null;

              // Check if edge is part of highlighted traversal path
              const isHighlighted =
                highlighted.includes(parent.id) && highlighted.includes(child.id);

              return (
                <line
                  key={`edge-${idx}`}
                  x1={parent.x}
                  y1={parent.y}
                  x2={child.x}
                  y2={child.y}
                  className={`stroke-2 transition-all duration-300 ${
                    isHighlighted ? 'stroke-accent' : 'stroke-border'
                  }`}
                />
              );
            })}

            {/* Render node circles */}
            {treeData.nodes.map((node) => {
              const isNodeHighlighted = highlighted.includes(node.id);

              return (
                <g key={`tree-node-${node.id}`} className="select-none">
                  {/* Glow circle */}
                  {isNodeHighlighted && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={21}
                      className="stroke-1 stroke-accent opacity-40 fill-none animate-ping"
                      style={{ animationDuration: '2s' }}
                    />
                  )}

                  {/* Main Circle */}
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={15}
                    className={`stroke-2 transition-colors duration-300 cursor-pointer ${
                      isNodeHighlighted
                        ? 'stroke-accent fill-accent-muted shadow-glow'
                        : 'stroke-border fill-surface'
                    }`}
                    whileHover={{ scale: 1.15 }}
                  />

                  {/* Node Value Label */}
                  <text
                    x={node.x}
                    y={node.y}
                    dy=".3em"
                    textAnchor="middle"
                    className="fill-text-primary text-[10px] font-bold pointer-events-none"
                  >
                    {node.val}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 justify-center items-center mt-3 text-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border border-border bg-surface" />
          <span className="text-text-secondary">Node</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border border-accent bg-accent/20 shadow-glow" />
          <span className="text-text-secondary">Highlighted (Traversal Path)</span>
        </div>
      </div>
    </div>
  );
};

export default TreeViz;
