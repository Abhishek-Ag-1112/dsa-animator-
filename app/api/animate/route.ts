import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are a DSA animation JSON engine. Return ONLY valid JSON — no markdown, no backticks, no explanation.

CRITICAL: Do not output any thinking process, reasoning, <think> tags, or conversational text. Start your response immediately with '{' and end with '}'.

Schema:
{
  "type": "sorting",
  "algorithm": "Algorithm Name",
  "description": "One sentence description",
  "timeComplexity": { "best": "O(...)", "average": "O(...)", "worst": "O(...)" },
  "spaceComplexity": "O(...)",
  "pseudocode": ["line 1", "line 2"],
  "plainEnglishPseudocode": ["line 1", "line 2"],
  "variables": ["i", "j", "n"],
  "steps": [
    {
      "codeLine": 1,
      "pseudoLine": 1,
      "description": "What is happening in this specific step",
      "variables": { "i": 0, "j": 1, "n": 7 },
      "callStack": [{ "fn": "mergeSort", "args": { "l": 0, "r": 3 } }],
      "array": [5, 3, 8, 1],
      "comparing": [0, 1],
      "swapped": false,
      "sorted": [],
      "visited": ["A"],
      "current": "B",
      "queue": ["C"],
      "frontier": ["C"],
      "nodes": [{"val": 10, "next": "node2_id", "id": "node1_id"}],
      "highlighted": ["node1_id"],
      "head": "node1_id",
      "items": [10, 20, 30],
      "top": 2
    }
  ]
}

Note:
- The "type" field must be one of: "sorting", "graph", "linkedlist", "stack", "queue", "tree".
- The "algorithm" field must be formatted exactly as "Algorithm Name(type of code)" (e.g., "Bubble Sort(sorting)", "BST Insertion(tree)", "Graph DFS(graph)").
- The "description" field must give a clear high-level summary of what the algorithm does (e.g. "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order, bubbling the largest unsorted element to its correct position each pass.").
- The "pseudocode" array: Write clear pseudocode lines using simple, plain English that mimics Pythonic syntax. Each line should represent a meaningful step, including function definitions, variable assignments, loops, conditions, and operations (e.g., 'function bubbleSort(arr):', 'n = length of arr', 'for i from 0 to n-2:', 'for j from 0 to n-i-2:', 'if arr[j] > arr[j+1]:', 'swap arr[j] and arr[j+1]', 'return arr'). Use indentation with spaces to show nesting. Do NOT use strict programming language syntax (like semicolons, braces, var/let, or math symbols where English words fit better).
- The "plainEnglishPseudocode" array: Write clear, easy-to-understand plain English pseudocode lines describing the high-level logic of the algorithm. Each line should be extremely easy to understand, language-agnostic, and represent a meaningful step (including variable initialization, e.g., 'Define the list of numbers and get its length', 'Set loop counters i and j to empty / null', 'Loop i through each element in the list', '  Loop j from the start up to the unsorted portion', '    If current element is greater than the next element, swap them'). Use indentation with spaces to show nesting. Do NOT use programming language syntax or complex code expressions.
- For every step, the 'variables' object must contain ALL keys defined in the top-level 'variables' array. If a variable is not yet initialized or does not have a value in a particular step, set its value to null. Update values as they change during execution.
- Include ONLY the fields that correspond to the matching visualizer type in each step (e.g. for "sorting" type, include "array", "comparing", "swapped", "sorted". For "linkedlist" type, include "nodes", "highlighted", "head").
- Linked List nodes must contain: "val", "next" (next node's id or null), "id" (unique string ID).
- Tree nodes must contain: "val", "left" (left node's id or null), "right" (right node's id or null), "id" (unique string ID).
- CRITICAL: Keep animations concise and limit output to a maximum of 15-20 steps to avoid output truncation. Group sequential operations (like multi-line swaps or temporary assignments) into a single step rather than mapping each individual assignment line to its own separate step. For instance, show the entire swap operation in a single step with 'swapped: true' instead of rendering 3 separate steps for storing, shifting, and restoring variables. If the algorithm naturally takes more than 20 steps, omit middle redundant iterations to keep the JSON output complete and valid.`;

/**
 * Strips comments (both single-line and multi-line) and trailing commas
 * from a JSON string, ensuring it can be parsed cleanly by JSON.parse.
 */
function cleanJSONString(str: string): string {
  let result = '';
  let inString = false;
  let escape = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const nextChar = str[i + 1] || '';

    if (inLineComment) {
      if (char === '\n' || char === '\r') {
        inLineComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && nextChar === '/') {
        inBlockComment = false;
        i++; // skip '/'
      }
      continue;
    }

    if (inString) {
      result += char;
      if (escape) {
        escape = false;
      } else if (char === '\\') {
        escape = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    // Outside string literal, check for comment markers
    if (char === '/' && nextChar === '/') {
      inLineComment = true;
      i++; // skip second '/'
      continue;
    }

    if (char === '/' && nextChar === '*') {
      inBlockComment = true;
      i++; // skip '*'
      continue;
    }

    if (char === '"') {
      inString = true;
      result += char;
      continue;
    }

    // If we encounter a closing brace or bracket, strip any preceding comma
    if (char === '}' || char === ']') {
      let j = result.length - 1;
      while (j >= 0 && (result[j] === ' ' || result[j] === '\t' || result[j] === '\r' || result[j] === '\n')) {
        j--;
      }
      if (j >= 0 && result[j] === ',') {
        result = result.slice(0, j) + result.slice(j + 1);
      }
    }

    result += char;
  }

  return result;
}

export async function POST(req: NextRequest) {
  try {
    const { code, inputType, inputValue } = await req.json();

    if (!code) {
      return NextResponse.json({ success: false, error: 'Code is required' }, { status: 400 });
    }

    const userPrompt = `Generate the step-by-step animation sequence for the following algorithm code and custom input.

Algorithm Type: ${inputType}
Custom Input: ${inputValue}

Code:
\`\`\`
${code}
\`\`\`

Make sure the animation steps simulate the execution of this code line-by-line.
Use the provided custom input to populate the initial structure. 
For example:
- If sorting: parse "${inputValue}" as numbers and animate sorting them.
- If graph: use "${inputValue}" (e.g., A-B, B-C) to define nodes and edges and animate a search (like DFS/BFS).
- If tree: use "${inputValue}" (e.g., 10, 5, 15) to build a BST and animate insert or traversal.
- If linkedlist/stack/queue: use "${inputValue}" to initialize elements.

Return ONLY the raw JSON output matching the schema. Do not write any think blocks, <think> tags, explanation, reasoning, or markdown code blocks. Start your response with '{' and end with '}'.`;

    const models = [
      process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      'groq/compound',
      'groq/compound-mini'
    ];

    let lastErrorText = '';
    let lastStatus = 500;
    let rawContent = '';

    // Loop through candidate models in order of fallback priority
    for (const model of models) {
      console.log(`Attempting generation with model: ${model}`);
      
      const formatAttempts = [true, false];
      let modelSucceeded = false;

      for (const useJsonFormat of formatAttempts) {
        try {
          const bodyPayload: any = {
            model: model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.1,
            max_tokens: 4000,
          };

          if (useJsonFormat) {
            bodyPayload.response_format = { type: 'json_object' };
          }

          const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyPayload),
          });

          if (!groqResponse.ok) {
            lastErrorText = await groqResponse.text();
            lastStatus = groqResponse.status;
            console.warn(`Groq attempt (model=${model}, json=${useJsonFormat}) failed with status ${lastStatus}: ${lastErrorText}`);
            continue; 
          }

          const data = await groqResponse.json();
          const content = data.choices?.[0]?.message?.content;

          if (content) {
            rawContent = content;
            modelSucceeded = true;
            break; 
          } else {
            lastErrorText = 'Empty choices in response';
            lastStatus = 500;
          }
        } catch (err: any) {
          lastErrorText = err.message || String(err);
          lastStatus = 500;
          console.warn(`Error connecting to Groq (model=${model}, json=${useJsonFormat}):`, err);
        }
      }

      if (modelSucceeded) {
        break; 
      }
    }

    if (!rawContent) {
      return NextResponse.json({
        success: false,
        error: 'All candidate Groq models failed or are over capacity',
        details: lastErrorText,
      }, { status: lastStatus });
    }

    // Try parsing the returned string as JSON, stripping think blocks and extracting the JSON object
    try {
      let cleanedContent = rawContent.trim();

      // Remove think blocks (commonly generated by reasoning models)
      cleanedContent = cleanedContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

      // Extract the JSON block by finding the first '{' and last '}'
      const firstBrace = cleanedContent.indexOf('{');
      const lastBrace = cleanedContent.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanedContent = cleanedContent.substring(firstBrace, lastBrace + 1);
      }

      // Remove comments and trailing commas using state machine
      cleanedContent = cleanJSONString(cleanedContent);

      const parsedData = JSON.parse(cleanedContent);
      return NextResponse.json({ success: true, data: parsedData });
    } catch (parseError: any) {
      console.error("JSON parsing failed. Raw response:", rawContent);
      console.error("Parse error:", parseError);
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON returned by AI model',
        raw: rawContent,
        details: parseError?.message || String(parseError)
      }, { status: 200 }); // Status 200 so the client can capture the raw text inside response body
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error?.message || String(error),
    }, { status: 500 });
  }
}
