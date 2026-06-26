import { CodeConfig } from './types';

export const EXAMPLES: Record<string, CodeConfig & { name: string; desc: string }> = {
  bubbleSort: {
    name: 'Bubble Sort',
    desc: 'Classic sorting algorithm swapping adjacent elements.',
    inputType: 'sorting',
    inputValue: '8, 3, 5, 1, 9',
    code: `function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`
  },
  bstInsert: {
    name: 'BST Insertion',
    desc: 'Insert values hierarchically into a Binary Search Tree.',
    inputType: 'tree',
    inputValue: '12, 6, 18, 3, 9, 15, 21',
    code: `class Node {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

function insertBST(root, val) {
  if (!root) return new Node(val);
  
  if (val < root.val) {
    root.left = insertBST(root.left, val);
  } else {
    root.right = insertBST(root.right, val);
  }
  return root;
}`
  },
  graphDFS: {
    name: 'Graph DFS',
    desc: 'Depth First Search traversal visiting nodes via recursion.',
    inputType: 'graph',
    inputValue: 'A-B, B-C, C-D, D-A, A-C',
    code: `function dfs(graph, node, visited = new Set()) {
  visited.add(node);
  console.log("Visited node: " + node);
  
  for (let neighbor of graph[node]) {
    if (!visited.has(neighbor)) {
      dfs(graph, neighbor, visited);
    }
  }
}`
  },
  linkedListReverse: {
    name: 'LinkedList Reverse',
    desc: 'Reverse a singly linked list in-place by updating pointers.',
    inputType: 'linkedlist',
    inputValue: '10, 20, 30, 40',
    code: `function reverseList(head) {
  let prev = null;
  let curr = head;
  
  while (curr !== null) {
    let nextNode = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nextNode;
  }
  
  return prev;
}`
  },
  stackPushPop: {
    name: 'Stack Push/Pop',
    desc: 'LIFO (Last In First Out) operations adding and removing items.',
    inputType: 'stack',
    inputValue: '12, 24, 36',
    code: `class Stack {
  constructor() {
    this.items = [];
  }
  push(element) {
    this.items.push(element);
  }
  pop() {
    if (this.items.length === 0) return "Underflow";
    return this.items.pop();
  }
}`
  }
};
export default EXAMPLES;
