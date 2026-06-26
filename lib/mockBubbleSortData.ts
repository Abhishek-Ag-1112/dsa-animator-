import { AnimationData } from './types';

export const MOCK_BUBBLE_SORT: AnimationData = {
  type: 'sorting',
  algorithm: 'Bubble Sort(sorting)',
  description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order, bubbling the largest unsorted element to its correct position each pass.',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)'
  },
  spaceComplexity: 'O(1)',
  pseudocode: [
    'function bubbleSort(arr):',
    '  n = length of arr',
    '  for i from 0 to n-2:',
    '    for j from 0 to n-i-2:',
    '      if arr[j] > arr[j+1]:',
    '        swap arr[j] and arr[j+1]',
    '  return arr'
  ],
  plainEnglishPseudocode: [
    'Define bubbleSort algorithm with list of numbers',
    '  Get the total count of numbers in the list',
    '  Loop i through each element from first to second-to-last:',
    '    Loop j from first to unsorted boundary:',
    '      If current number is larger than next number:',
    '        Swap the current and next numbers',
    '  Return the fully sorted list of numbers'
  ],
  variables: ['i', 'j', 'n', 'arr'],
  steps: [
    {
      codeLine: 9,
      pseudoLine: 1,
      description: 'Initialize bubbleSort with input array [5, 2, 4, 1].',
      variables: { arr: [5, 2, 4, 1], n: null, i: null, j: null },
      array: [5, 2, 4, 1],
      comparing: [],
      swapped: false,
      sorted: []
    },
    {
      codeLine: 10,
      pseudoLine: 2,
      description: 'Calculate list length: n = 4.',
      variables: { arr: [5, 2, 4, 1], n: 4, i: null, j: null },
      array: [5, 2, 4, 1],
      comparing: [],
      swapped: false,
      sorted: []
    },
    {
      codeLine: 11,
      pseudoLine: 3,
      description: 'Outer loop starts: i = 0.',
      variables: { arr: [5, 2, 4, 1], n: 4, i: 0, j: null },
      array: [5, 2, 4, 1],
      comparing: [],
      swapped: false,
      sorted: []
    },
    {
      codeLine: 12,
      pseudoLine: 4,
      description: 'Inner loop starts: j = 0. Compare arr[0] (5) and arr[1] (2).',
      variables: { arr: [5, 2, 4, 1], n: 4, i: 0, j: 0 },
      array: [5, 2, 4, 1],
      comparing: [0, 1],
      swapped: false,
      sorted: []
    },
    {
      codeLine: 13,
      pseudoLine: 5,
      description: 'Check: is arr[0] (5) > arr[1] (2)? Yes, condition is true.',
      variables: { arr: [5, 2, 4, 1], n: 4, i: 0, j: 0 },
      array: [5, 2, 4, 1],
      comparing: [0, 1],
      swapped: false,
      sorted: []
    },
    {
      codeLine: 14,
      pseudoLine: 6,
      description: 'Swap elements arr[0] and arr[1] to get [2, 5, 4, 1].',
      variables: { arr: [2, 5, 4, 1], n: 4, i: 0, j: 0 },
      array: [2, 5, 4, 1],
      comparing: [0, 1],
      swapped: true,
      sorted: []
    },
    {
      codeLine: 12,
      pseudoLine: 4,
      description: 'Increment j to 1. Compare arr[1] (5) and arr[2] (4).',
      variables: { arr: [2, 5, 4, 1], n: 4, i: 0, j: 1 },
      array: [2, 5, 4, 1],
      comparing: [1, 2],
      swapped: false,
      sorted: []
    },
    {
      codeLine: 14,
      pseudoLine: 6,
      description: 'Swap elements arr[1] and arr[2] to get [2, 4, 5, 1].',
      variables: { arr: [2, 4, 5, 1], n: 4, i: 0, j: 1 },
      array: [2, 4, 5, 1],
      comparing: [1, 2],
      swapped: true,
      sorted: []
    },
    {
      codeLine: 12,
      pseudoLine: 4,
      description: 'Increment j to 2. Compare arr[2] (5) and arr[3] (1).',
      variables: { arr: [2, 4, 5, 1], n: 4, i: 0, j: 2 },
      array: [2, 4, 5, 1],
      comparing: [2, 3],
      swapped: false,
      sorted: []
    },
    {
      codeLine: 14,
      pseudoLine: 6,
      description: 'Swap elements arr[2] and arr[3] to get [2, 4, 1, 5]. largest element (5) is sorted.',
      variables: { arr: [2, 4, 1, 5], n: 4, i: 0, j: 2 },
      array: [2, 4, 1, 5],
      comparing: [2, 3],
      swapped: true,
      sorted: [3]
    },
    {
      codeLine: 11,
      pseudoLine: 3,
      description: 'Outer loop: i = 1.',
      variables: { arr: [2, 4, 1, 5], n: 4, i: 1, j: null },
      array: [2, 4, 1, 5],
      comparing: [],
      swapped: false,
      sorted: [3]
    },
    {
      codeLine: 12,
      pseudoLine: 4,
      description: 'Inner loop starts: j = 0. Compare arr[0] (2) and arr[1] (4).',
      variables: { arr: [2, 4, 1, 5], n: 4, i: 1, j: 0 },
      array: [2, 4, 1, 5],
      comparing: [0, 1],
      swapped: false,
      sorted: [3]
    },
    {
      codeLine: 12,
      pseudoLine: 4,
      description: 'Increment j to 1. Compare arr[1] (4) and arr[2] (1).',
      variables: { arr: [2, 4, 1, 5], n: 4, i: 1, j: 1 },
      array: [2, 4, 1, 5],
      comparing: [1, 2],
      swapped: false,
      sorted: [3]
    },
    {
      codeLine: 14,
      pseudoLine: 6,
      description: 'Swap elements arr[1] and arr[2] to get [2, 1, 4, 5]. Element (4) is sorted.',
      variables: { arr: [2, 1, 4, 5], n: 4, i: 1, j: 1 },
      array: [2, 1, 4, 5],
      comparing: [1, 2],
      swapped: true,
      sorted: [2, 3]
    },
    {
      codeLine: 11,
      pseudoLine: 3,
      description: 'Outer loop: i = 2.',
      variables: { arr: [2, 1, 4, 5], n: 4, i: 2, j: null },
      array: [2, 1, 4, 5],
      comparing: [],
      swapped: false,
      sorted: [2, 3]
    },
    {
      codeLine: 12,
      pseudoLine: 4,
      description: 'Inner loop starts: j = 0. Compare arr[0] (2) and arr[1] (1).',
      variables: { arr: [2, 1, 4, 5], n: 4, i: 2, j: 0 },
      array: [2, 1, 4, 5],
      comparing: [0, 1],
      swapped: false,
      sorted: [2, 3]
    },
    {
      codeLine: 14,
      pseudoLine: 6,
      description: 'Swap elements arr[0] and arr[1] to get [1, 2, 4, 5]. All elements sorted.',
      variables: { arr: [1, 2, 4, 5], n: 4, i: 2, j: 0 },
      array: [1, 2, 4, 5],
      comparing: [0, 1],
      swapped: true,
      sorted: [1, 2, 3]
    },
    {
      codeLine: 20,
      pseudoLine: 7,
      description: 'Array is fully sorted! Returning [1, 2, 4, 5].',
      variables: { arr: [1, 2, 4, 5], n: 4, i: 3, j: null },
      array: [1, 2, 4, 5],
      comparing: [],
      swapped: false,
      sorted: [0, 1, 2, 3]
    }
  ]
};
