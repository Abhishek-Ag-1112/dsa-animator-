"use client";

import React, { useRef, useEffect } from 'react';
import { Play, Code, BookOpen, Loader2 } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  activeLine: number; // 1-indexed
  isAnimating: boolean;
  setIsAnimating: (animating: boolean) => void;
  breakpoints: number[];
  toggleBreakpoint: (line: number) => void;
  onGenerate: () => void;
  isLoading: boolean;
  viewMode: 'code' | 'pseudo';
  setViewMode: (mode: 'code' | 'pseudo') => void;
  pseudocode: string[];
  activePseudoLine: number; // 1-indexed
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  setCode,
  activeLine,
  isAnimating,
  setIsAnimating,
  breakpoints,
  toggleBreakpoint,
  onGenerate,
  isLoading,
  viewMode,
  setViewMode,
  pseudocode,
  activePseudoLine,
}) => {
  const codeLines = code.split('\n');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Sync scroll position between textarea and line gutter
  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Scroll active line into view when it changes
  useEffect(() => {
    if (activeLineRef.current && gutterRef.current) {
      activeLineRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [activeLine]);

  return (
    <div className="flex flex-col h-full bg-surface border border-border rounded-lg overflow-hidden font-mono text-xs select-none">
      
      {/* Editor Header / Tab Switcher */}
      <div className="flex items-center justify-between border-b border-border bg-surface/50 px-4 py-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('code')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-bold transition-all focus:outline-none ${
              viewMode === 'code'
                ? 'bg-background text-accent border border-border'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Code View</span>
          </button>
          <button
            onClick={() => setViewMode('pseudo')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-bold transition-all focus:outline-none ${
              viewMode === 'pseudo'
                ? 'bg-background text-accent border border-border'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Pseudocode</span>
          </button>
        </div>

        {/* Status Badge */}
        {isAnimating && (
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-[10px] bg-accent-muted text-accent border border-accent/20 px-2 py-0.5 rounded font-bold uppercase">
              ▶ Line {viewMode === 'code' ? activeLine : activePseudoLine}
            </span>
          </div>
        )}
      </div>

      {/* Editor Content Area */}
      <div className="flex-grow relative min-h-[150px] bg-background/25 flex">
        {viewMode === 'code' ? (
          <>
            {/* Synchronized Line Numbers Gutter */}
            <div 
              ref={gutterRef}
              className="w-10 bg-surface border-r border-border overflow-hidden select-none py-[10px] flex flex-col transition-colors duration-300"
            >
              {codeLines.map((_, idx) => {
                const lineNum = idx + 1;
                const isActive = isAnimating && activeLine === lineNum;
                const hasBreakpoint = breakpoints.includes(lineNum);

                return (
                  <div
                    key={`gutter-line-${lineNum}`}
                    ref={isActive ? activeLineRef : null}
                    onClick={() => toggleBreakpoint(lineNum)}
                    style={{
                      height: '22px',
                    }}
                    className={`flex items-center justify-center text-[10px] cursor-pointer hover:text-accent font-bold transition-colors select-none ${
                      hasBreakpoint 
                        ? 'text-red-500 font-extrabold scale-110' 
                        : isActive 
                        ? 'text-accent bg-[var(--line-hl)] shadow-[inset_3px_0_0_var(--accent)]' 
                        : 'text-text-secondary opacity-60'
                    }`}
                  >
                    {hasBreakpoint ? '●' : lineNum}
                  </div>
                );
              })}
            </div>

            {/* Editable code textarea with scroll listener */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onScroll={handleScroll}
              spellCheck={false}
              placeholder="// Paste your DSA code here..."
              style={{
                lineHeight: '22px',
                padding: '10px 10px',
              }}
              className="flex-grow h-full bg-transparent text-text-primary placeholder-text-secondary/30 focus:outline-none resize-none leading-[22px] font-mono text-xs overflow-y-auto whitespace-pre select-text"
            />
          </>
        ) : (
          /* PSEUDOCODE VIEW */
          <div className="py-3 flex flex-col font-mono text-xs leading-relaxed overflow-x-auto min-w-full">
            {pseudocode.length === 0 ? (
              <div className="text-center text-text-secondary italic py-8 w-full">
                No pseudocode generated yet.<br />Generate an animation to see it.
              </div>
            ) : (
              pseudocode.map((line, idx) => {
                const lineNum = idx + 1;
                const isActive = activePseudoLine === lineNum;

                return (
                  <div
                    key={`pseudo-line-${lineNum}`}
                    className={`flex items-start transition-all min-w-max pr-4 ${
                      isActive
                        ? 'bg-accent-muted border-l-4 border-accent font-bold shadow-glow py-0.5'
                        : 'border-l-4 border-transparent'
                    }`}
                  >
                    {/* Gutter column */}
                    <div className="w-10 text-right pr-3 text-[10px] text-text-secondary shrink-0 font-semibold select-none">
                      {lineNum}
                    </div>

                    {/* Pseudocode line content */}
                    <pre className="text-text-primary font-mono text-xs select-text pl-1 whitespace-pre">
                      {line}
                    </pre>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Generate Button Container */}
      <div className="p-4 border-t border-border bg-surface/50">
        <button
          onClick={onGenerate}
          disabled={isLoading || !code.trim()}
          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-accent to-[#ff79c6] hover:from-accent-hover hover:to-[#ff5aa5] disabled:opacity-40 disabled:from-accent disabled:to-accent text-white font-bold transition-all flex items-center justify-center gap-2 focus:outline-none active:scale-95 shadow-md shadow-accent/10"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>🤖 Analyzing your code...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>⚡ Analyze & Animate</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default CodeEditor;
