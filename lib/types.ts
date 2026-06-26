export type VisualizerType = 'sorting' | 'graph' | 'linkedlist' | 'stack' | 'queue' | 'tree';

export interface StackFrame {
  fn: string;
  args: Record<string, any>;
}

export interface Step {
  codeLine: number; // 1-indexed
  pseudoLine: number; // 1-indexed
  description: string;
  variables: Record<string, any>;
  callStack?: StackFrame[];

  // type-specific properties
  // Sorting:
  array?: number[];
  comparing?: number[]; // indices currently compared
  swapped?: boolean;
  sorted?: number[]; // indices that are final sorted

  // Graph:
  visited?: (string | number)[];
  current?: string | number | null;
  queue?: (string | number)[];
  frontier?: (string | number)[];

  // LinkedList & Tree generic nodes field:
  nodes?: any[];
  highlighted?: (string | number)[];
  head?: string | number | null;

  // Stack/Queue:
  items?: any[];
  top?: number | null; // index for top stack element
}


export interface AnimationData {
  type: VisualizerType;
  algorithm: string;
  description: string;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  pseudocode: string[];
  plainEnglishPseudocode?: string[];
  variables: string[];
  steps: Step[];
}

export interface Theme {
  id: string;
  name: string;
  background: string;
  surface: string;
  accent: string;
}

export interface CodeConfig {
  code: string;
  inputType: VisualizerType;
  inputValue: string;
}
