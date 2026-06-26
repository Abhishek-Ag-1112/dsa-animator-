"use client";

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  History, 
  Trash2, 
  LayoutGrid, 
  Sparkles,
  AlertCircle,
  Loader2,
  BookOpen,
  Share2
} from 'lucide-react';

import { useTheme } from '@/lib/themeContext';
import { AnimationData, VisualizerType, CodeConfig, Step } from '@/lib/types';
import EXAMPLES from '@/lib/exampleAlgorithms';
import { audioEngine } from '@/lib/audioEngine';

// Firebase imports
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  writeBatch,
  doc
} from 'firebase/firestore';
import LandingPage from '@/components/LandingPage';

// Components
import CodeEditor from '@/components/CodeEditor';
import VariableTracker from '@/components/VariableTracker';
import CallStackPanel from '@/components/CallStackPanel';
import ComplexityBar from '@/components/ComplexityBar';
import PlaybackControls from '@/components/controls/PlaybackControls';
import CustomInputPanel from '@/components/controls/CustomInputPanel';
import ThemeSwitcher from '@/components/controls/ThemeSwitcher';
import SoundToggle from '@/components/controls/SoundToggle';
import ExportButton from '@/components/controls/ExportButton';

// Renderers
import SortingViz from '@/components/renderers/SortingViz';
import GraphViz from '@/components/renderers/GraphViz';
import LinkedListViz from '@/components/renderers/LinkedListViz';
import StackViz from '@/components/renderers/StackViz';
import QueueViz from '@/components/renderers/QueueViz';
import TreeViz from '@/components/renderers/TreeViz';

interface HistoryItem {
  id: string;
  name: string;
  code: string;
  inputType: VisualizerType;
  inputValue: string;
  timestamp: number;
}

export default function MainPage() {
  const { currentTheme } = useTheme();

  // Auth States
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Core Editor States
  const [codeA, setCodeA] = useState('');
  const [inputTypeA, setInputTypeA] = useState<VisualizerType>('sorting');
  const [inputValue, setInputValue] = useState('');

  // Comparison Algorithm States
  const [codeB, setCodeB] = useState('');
  const [inputTypeB, setInputTypeB] = useState<VisualizerType>('sorting');
  
  // Tab/UI States
  const [viewModeA, setViewModeA] = useState<'code' | 'pseudo'>('code');
  const [viewModeB, setViewModeB] = useState<'code' | 'pseudo'>('code');
  const [isAnimatingA, setIsAnimatingA] = useState(false);
  const [isAnimatingB, setIsAnimatingB] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  
  // API Fetch States
  const [isLoadingA, setIsLoadingA] = useState(false);
  const [isLoadingB, setIsLoadingB] = useState(false);
  const [errorA, setErrorA] = useState<{ message: string; raw?: string } | null>(null);
  const [errorB, setErrorB] = useState<{ message: string; raw?: string } | null>(null);
  const [animationDataA, setAnimationDataA] = useState<AnimationData | null>(null);
  const [animationDataB, setAnimationDataB] = useState<AnimationData | null>(null);

  // Playback States
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(700); // interval in ms (default 700ms)
  const [muted, setMuted] = useState(false);
  const [breakpointsA, setBreakpointsA] = useState<number[]>([]);
  const [breakpointsB, setBreakpointsB] = useState<number[]>([]);

  // History & Sidebar
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Playback loop timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync mute state with audioEngine
  useEffect(() => {
    audioEngine.setMuted(muted);
  }, [muted]);

  // --- API Response Sanitizer/Translator ---
  // Maps alternative schema keys (vars -> variables, highlighted -> comparing)
  const sanitizeAnimationData = (data: any): AnimationData => {
    if (!data) return data;
    
    const type = data.type || 'sorting';
    const algorithm = data.algorithm || 'Algorithm';
    const description = data.description || '';
    const timeComplexity = data.timeComplexity || { best: 'N/A', average: 'N/A', worst: 'N/A' };
    const spaceComplexity = data.spaceComplexity || 'N/A';
    const pseudocode = data.pseudocode || [];
    const plainEnglishPseudocode = data.plainEnglishPseudocode || [];
    const variables = data.variables || [];
    
    let lastSeenArray: number[] = [];
    let lastSeenNodes: any[] = [];

    const steps = (data.steps || []).map((step: any) => {
      // Map vars -> variables
      const vars = step.vars || step.variables || {};
      
      // Map highlighted -> comparing
      const comparing = step.highlighted || step.comparing || [];
      
      // Map type === "swap" -> swapped
      const swapped = step.swapped || step.type === 'swap' || false;
      
      // Fallback for missing/empty arrays to prevent elements disappearing in later/final steps
      let stepArray = step.array || [];
      if (stepArray.length === 0) {
        if (lastSeenArray.length > 0) {
          stepArray = [...lastSeenArray];
        } else if (vars.arr && Array.isArray(vars.arr)) {
          stepArray = [...vars.arr];
        } else if (vars.array && Array.isArray(vars.array)) {
          stepArray = [...vars.array];
        }
      } else {
        lastSeenArray = [...stepArray];
      }

      // Fallback for missing/empty nodes (linked lists, trees)
      let stepNodes = step.nodes || step.treeNodes || [];
      if (stepNodes.length === 0) {
        if (lastSeenNodes.length > 0) {
          stepNodes = [...lastSeenNodes];
        }
      } else {
        lastSeenNodes = [...stepNodes];
      }

      return {
        codeLine: step.codeLine || 1,
        pseudoLine: step.pseudoLine || step.codeLine || 1,
        description: step.description || '',
        variables: vars,
        callStack: step.callStack || [],
        array: stepArray,
        comparing,
        swapped,
        sorted: step.sorted || [],
        visited: step.visited || [],
        current: step.current || null,
        queue: step.queue || [],
        frontier: step.frontier || [],
        nodes: stepNodes,
        highlighted: step.highlighted || step.comparing || [],
        head: step.head || null,
        items: step.items || [],
        top: step.top || null
      } as Step;
    });

    return {
      type,
      algorithm,
      description,
      timeComplexity,
      spaceComplexity,
      pseudocode,
      plainEnglishPseudocode,
      variables,
      steps
    };
  };

  // --- Base64 Share Link Initialization ---
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      try {
        const base64 = window.location.hash.substring(1);
        if (base64) {
          const decoded = atob(base64);
          const config = JSON.parse(decoded);
          if (config.code) setCodeA(config.code);
          if (config.inputType) setInputTypeA(config.inputType);
          if (config.inputValue) setInputValue(config.inputValue);
        }
      } catch (err) {
        console.error('Failed to parse share hash:', err);
      }
    }
  }, []);

  // --- Firebase Auth State Observer & Sync ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      
      if (firebaseUser) {
        fetchFirestoreHistory(firebaseUser.uid);
      } else {
        const savedHistory = localStorage.getItem('dsa-animator-history');
        if (savedHistory) {
          try {
            setHistory(JSON.parse(savedHistory));
          } catch (e) {
            console.error('Failed to parse history:', e);
          }
        } else {
          setHistory([]);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchFirestoreHistory = async (uid: string) => {
    try {
      const historyRef = collection(db, 'users', uid, 'history');
      const q = query(historyRef, orderBy('timestamp', 'desc'), limit(5));
      const querySnapshot = await getDocs(q);
      const items: HistoryItem[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          name: data.name || 'Custom Algorithm',
          code: data.code || '',
          inputType: data.inputType || 'sorting',
          inputValue: data.inputValue || '',
          timestamp: data.timestamp || Date.now(),
        });
      });

      // If Firestore history is empty, sync local history to Firestore
      if (items.length === 0) {
        const savedHistory = localStorage.getItem('dsa-animator-history');
        if (savedHistory) {
          try {
            const localItems: HistoryItem[] = JSON.parse(savedHistory);
            if (localItems.length > 0) {
              const batch = writeBatch(db);
              localItems.forEach((item) => {
                const newDocRef = doc(collection(db, 'users', uid, 'history'));
                batch.set(newDocRef, {
                  name: item.name,
                  code: item.code,
                  inputType: item.inputType,
                  inputValue: item.inputValue,
                  timestamp: item.timestamp,
                });
              });
              await batch.commit();
              fetchFirestoreHistory(uid);
              return;
            }
          } catch (e) {
            console.error('Failed to sync local history to Firestore:', e);
          }
        }
      }

      setHistory(items);
    } catch (e) {
      console.error('Error fetching history from Firestore:', e);
    }
  };

  // --- Share Link Generator ---
  const handleShareLink = () => {
    try {
      const config = {
        code: codeA,
        inputType: inputTypeA,
        inputValue: inputValue,
      };
      const base64 = btoa(JSON.stringify(config));
      const shareUrl = `${window.location.origin}${window.location.pathname}#${base64}`;
      navigator.clipboard.writeText(shareUrl);
      alert('Shareable link copied to clipboard!');
    } catch (e) {
      alert('Failed to generate share link');
    }
  };

  // --- Example Algorithm Prefill ---
  const loadExample = (key: keyof typeof EXAMPLES) => {
    const ex = EXAMPLES[key];
    setCodeA(ex.code);
    setInputTypeA(ex.inputType);
    setInputValue(ex.inputValue);
    setIsAnimatingA(false);
    setAnimationDataA(null);
    setErrorA(null);

    // Prefill second editor with bubble sort for a good comparison baseline
    if (comparisonMode) {
      setCodeB(EXAMPLES.bubbleSort.code);
      setInputTypeB(EXAMPLES.bubbleSort.inputType);
    }
  };



  // --- Breakpoint Click Toggle ---
  const toggleBreakpointA = (line: number) => {
    setBreakpointsA(prev =>
      prev.includes(line) ? prev.filter(l => l !== line) : [...prev, line]
    );
  };

  const toggleBreakpointB = (line: number) => {
    setBreakpointsB(prev =>
      prev.includes(line) ? prev.filter(l => l !== line) : [...prev, line]
    );
  };

  // --- Code Change Handlers (auto-resets state on type) ---
  const handleCodeChangeA = (newCode: string) => {
    setCodeA(newCode);
    setAnimationDataA(null);
    setIsAnimatingA(false);
    setIsPlaying(false);
    setErrorA(null);
  };

  const handleCodeChangeB = (newCode: string) => {
    setCodeB(newCode);
    setAnimationDataB(null);
    setIsAnimatingB(false);
    setIsPlaying(false);
    setErrorB(null);
  };

  // --- Generate Animation API Call ---
  const generateAnimation = async (
    code: string,
    type: VisualizerType,
    valStr: string,
    isPanelB: boolean = false
  ) => {
    const setLoader = isPanelB ? setIsLoadingB : setIsLoadingA;
    const setError = isPanelB ? setErrorB : setErrorA;
    const setData = isPanelB ? setAnimationDataB : setAnimationDataA;
    const setAnimActive = isPanelB ? setIsAnimatingB : setIsAnimatingA;

    setLoader(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch('/api/animate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, inputType: type, inputValue: valStr }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        // Sanitize data before setting state
        const sanitized = sanitizeAnimationData(result.data);
        setData(sanitized);
        setAnimActive(true);
        setCurrentStep(0);

        // Add to history if Panel A
        if (!isPanelB) {
          saveToHistory(sanitized.algorithm || 'Custom Algorithm', code, type, valStr);
        }
      } else {
        setError({
          message: result.error || 'Failed to generate animation.',
          raw: result.raw || result.details || JSON.stringify(result),
        });
      }
    } catch (err: any) {
      setError({
        message: 'Network or internal server error.',
        raw: err.message || String(err),
      });
    } finally {
      setLoader(false);
    }
  };

  // --- Save to History (Firestore or Local) ---
  const saveToHistory = async (name: string, code: string, type: VisualizerType, val: string) => {
    const newItem = {
      name,
      code,
      inputType: type,
      inputValue: val,
      timestamp: Date.now(),
    };

    if (user) {
      try {
        const historyRef = collection(db, 'users', user.uid, 'history');
        const docRef = await addDoc(historyRef, newItem);
        
        setHistory(prev => {
          const filtered = prev.filter(h => h.code !== code || h.inputType !== type);
          const updated = [{ id: docRef.id, ...newItem }, ...filtered].slice(0, 5);
          return updated;
        });
      } catch (e) {
        console.error('Error saving history to Firestore:', e);
      }
    } else {
      const localItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        ...newItem,
      };
      setHistory(prev => {
        const filtered = prev.filter(h => h.code !== code || h.inputType !== type);
        const updated = [localItem, ...filtered].slice(0, 5);
        localStorage.setItem('dsa-animator-history', JSON.stringify(updated));
        return updated;
      });
    }
  };

  // --- Reload History Item ---
  const loadHistoryItem = (item: HistoryItem) => {
    setCodeA(item.code);
    setInputTypeA(item.inputType);
    setInputValue(item.inputValue);
    setIsAnimatingA(false);
    setAnimationDataA(null);
    setErrorA(null);
    setShowHistory(false);
  };

  // --- Delete History ---
  const clearHistory = async () => {
    if (user) {
      try {
        const historyRef = collection(db, 'users', user.uid, 'history');
        const querySnapshot = await getDocs(historyRef);
        const batch = writeBatch(db);
        querySnapshot.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
        setHistory([]);
      } catch (e) {
        console.error('Error clearing Firestore history:', e);
      }
    } else {
      localStorage.removeItem('dsa-animator-history');
      setHistory([]);
    }
  };

  // --- Playback State Controllers ---
  const totalStepsA = animationDataA?.steps?.length || 0;
  const totalStepsB = comparisonMode ? (animationDataB?.steps?.length || 0) : 0;
  const maxTotalSteps = Math.max(totalStepsA, totalStepsB);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // --- Operations Counters (Swaps / Comparisons) ---
  const getOperationsCount = (
    data: AnimationData | null,
    limitStep: number
  ) => {
    let comparisons = 0;
    let swaps = 0;

    if (!data || !data.steps) return { comparisons, swaps };

    const maxIndex = Math.min(limitStep, data.steps.length - 1);
    for (let i = 0; i <= maxIndex; i++) {
      const step = data.steps[i];
      if (step.comparing && step.comparing.length > 0) {
        comparisons++;
      }
      if (step.swapped) {
        swaps++;
      }
    }

    return { comparisons, swaps };
  };

  const opsA = getOperationsCount(animationDataA, currentStep);
  const opsB = getOperationsCount(animationDataB, currentStep);

  // Playback tick logic
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Interval speed matches raw ms value directly
    timerRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = prev + 1;

        // End Check
        if (nextStep >= maxTotalSteps) {
          setIsPlaying(false);
          audioEngine.playCompletion();

          if (comparisonMode && animationDataA && animationDataB) {
            const finishA = animationDataA.steps.length;
            const finishB = animationDataB.steps.length;
            
            let winnerTitle = '';
            if (finishA < finishB) {
              winnerTitle = `${animationDataA.algorithm} Wins! 🏆`;
            } else if (finishB < finishA) {
              winnerTitle = `${animationDataB.algorithm} Wins! 🏆`;
            } else {
              winnerTitle = "It's a Tie! 🤝";
            }

            confetti({
              particleCount: 150,
              spread: 80,
              origin: { y: 0.6 }
            });

            alert(`🏁 Race Finished!\n${winnerTitle}\n\n${animationDataA.algorithm}: ${finishA} steps\n${animationDataB.algorithm}: ${finishB} steps`);
          } else {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
          }

          if (timerRef.current) clearInterval(timerRef.current);
          return prev;
        }

        // Breakpoints Check
        const stepA = animationDataA?.steps?.[nextStep];
        if (stepA && breakpointsA.includes(stepA.codeLine)) {
          setIsPlaying(false);
          if (timerRef.current) clearInterval(timerRef.current);
          alert(`🛑 Breakpoint hit in Algorithm A at line ${stepA.codeLine}`);
          return prev;
        }

        if (comparisonMode) {
          const stepB = animationDataB?.steps?.[nextStep];
          if (stepB && breakpointsB.includes(stepB.codeLine)) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            alert(`🛑 Breakpoint hit in Algorithm B at line ${stepB.codeLine}`);
            return prev;
          }
        }

        // Audio Beeps
        const activeStepA = animationDataA?.steps?.[nextStep];
        if (activeStepA && !muted) {
          if (activeStepA.swapped) {
            audioEngine.playSwap();
          } else if (activeStepA.comparing && activeStepA.comparing.length > 0) {
            audioEngine.playComparison();
          }
        }

        return nextStep;
      });
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, maxTotalSteps, speed, comparisonMode, animationDataA, animationDataB, breakpointsA, breakpointsB, muted]);

  // Ensure currentStep is safe
  const activeStepA = animationDataA?.steps?.[Math.min(currentStep, totalStepsA - 1)] || null;
  const activeStepB = comparisonMode ? (animationDataB?.steps?.[Math.min(currentStep, totalStepsB - 1)] || null) : null;

  const prevStepA = currentStep > 0 && animationDataA ? animationDataA.steps[currentStep - 1] : undefined;
  const prevStepB = currentStep > 0 && animationDataB ? animationDataB.steps[currentStep - 1] : undefined;

  // --- Visualizer Renderer Picker ---
  const renderVisualizer = (
    step: any,
    prevStep: any,
    type: VisualizerType,
    valStr: string,
    isLastStep: boolean = false
  ) => {
    if (!step) return null;

    switch (type) {
      case 'sorting':
        return <SortingViz step={step} prevStep={prevStep} isLastStep={isLastStep} />;
      case 'graph':
        return <GraphViz step={step} inputValue={valStr} />;
      case 'linkedlist':
        return <LinkedListViz step={step} />;
      case 'stack':
        return <StackViz step={step} />;
      case 'queue':
        return <QueueViz step={step} />;
      case 'tree':
        return <TreeViz step={step} />;
      default:
        return <div className="text-center text-text-secondary">No visualizer specified</div>;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070913] flex flex-col items-center justify-center gap-4 text-gray-400">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-sm font-mono tracking-wider">Verifying authentication...</span>
      </div>
    );
  }

  if (!user) {
    return <LandingPage onAuthSuccess={(usr) => setUser(usr)} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      
      {/* --- TOP GLOBAL HEADER --- */}
      <header className="border-b border-border bg-surface px-6 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 select-none">
          <div className="w-8 h-8 rounded bg-gradient-to-r from-accent to-[#ff79c6] flex items-center justify-center font-black text-white text-lg">
            ⚡
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text">
              DSA Animator
            </h1>
            <p className="text-[10px] text-text-secondary font-mono tracking-wider font-semibold">
              PASTE YOUR CODE. WATCH IT THINK.
            </p>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-2 pr-2 border-r border-border mr-2 select-none">
              <span className="text-[11px] font-mono text-text-secondary hidden lg:inline-block">
                {user.email}
              </span>
              <button
                onClick={() => signOut(auth)}
                className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-mono text-[9px] font-bold transition-colors focus:outline-none"
              >
                Sign Out
              </button>
            </div>
          )}

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 rounded bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-accent transition-colors flex items-center gap-1.5 font-mono text-xs focus:outline-none"
            title="Algorithm History"
          >
            <History className="w-4 h-4" />
            <span className="hidden md:inline">History</span>
          </button>

          <button
            onClick={() => {
              setComparisonMode(!comparisonMode);
              setIsAnimatingA(false);
              setIsAnimatingB(false);
              setAnimationDataA(null);
              setAnimationDataB(null);
              setCurrentStep(0);
              setErrorA(null);
              setErrorB(null);
              if (!comparisonMode && !codeB) {
                setCodeB(EXAMPLES.bubbleSort.code);
                setInputTypeB(EXAMPLES.bubbleSort.inputType);
              }
            }}
            className={`p-2 rounded border transition-colors flex items-center gap-1.5 font-mono text-xs focus:outline-none ${
              comparisonMode
                ? 'bg-accent/15 border-accent text-accent font-bold'
                : 'bg-surface border-border text-text-secondary hover:text-text-primary hover:border-accent'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>{comparisonMode ? 'Single Mode' : 'Comparison Mode'}</span>
          </button>

          <ThemeSwitcher />

          <button
            onClick={handleShareLink}
            disabled={!codeA}
            className="p-2 rounded bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-accent disabled:opacity-40 transition-colors focus:outline-none"
            title="Copy Share Link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* --- SIDEBAR HISTORY PANEL --- */}
      {showHistory && (
        <div className="fixed inset-y-0 right-0 w-80 bg-surface border-l border-border shadow-2xl z-40 p-5 flex flex-col gap-4 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <History className="w-4 h-4 text-accent" />
              <span>Generation History</span>
            </h2>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-[10px] text-red-500 hover:text-red-600 flex items-center gap-1 font-mono font-bold"
                title="Clear all history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="flex-grow overflow-y-auto flex flex-col gap-2">
            {history.length === 0 ? (
              <div className="text-center text-text-secondary italic text-xs py-8">
                No generated history yet.
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => loadHistoryItem(item)}
                  className="p-3 rounded border border-border hover:border-accent bg-background/50 cursor-pointer transition-all flex flex-col gap-1 font-mono text-xs group"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-text-primary group-hover:text-accent transition-colors">
                      {item.name}
                    </span>
                    <span className="text-[9px] bg-surface px-1.5 py-0.5 rounded border border-border text-text-secondary">
                      {item.inputType}
                    </span>
                  </div>
                  <div className="text-[10px] text-text-secondary line-clamp-1 italic">
                    Input: {item.inputValue}
                  </div>
                  <div className="text-[9px] text-text-secondary mt-1.5 text-right">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setShowHistory(false)}
            className="w-full py-2 bg-background hover:bg-border border border-border text-text-secondary text-xs rounded font-bold transition-colors focus:outline-none"
          >
            Close Panel
          </button>
        </div>
      )}

      {/* --- MAIN PAGE WORKSPACE (2 Columns Grid Split: Left = Editor, Right = Visualizer) --- */}
      <main className="flex-grow p-4 md:p-6 flex flex-col gap-4">
        
        {comparisonMode ? (
          /* --- COMPARISON MODE (Two Panels side-by-side) --- */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-grow">
            
            {/* PANEL A */}
            <div className="flex flex-col gap-3.5 border border-border rounded-xl p-4 bg-surface/20">
              <div className="flex flex-col gap-1 border-b border-border/80 pb-2 select-none">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-accent/20 border border-accent/40 text-accent font-bold font-mono text-[10px] uppercase">
                      Algorithm A
                    </span>
                    <h2 className="text-sm font-bold truncate max-w-[150px]">
                      {animationDataA?.algorithm || inputTypeA.toUpperCase()}
                    </h2>
                  </div>

                  {animationDataA && (
                    <div className="flex gap-2 text-[10px] font-mono">
                      <span className="text-text-secondary">
                        Comparisons: <strong className="text-accent">{opsA.comparisons}</strong>
                      </span>
                      <span className="text-text-secondary">
                        Swaps: <strong className="text-[#ef4444]">{opsA.swaps}</strong>
                      </span>
                    </div>
                  )}
                </div>
                {animationDataA?.description && (
                  <p className="text-[11px] text-text-secondary font-mono leading-relaxed mt-0.5">
                    {animationDataA.description}
                  </p>
                )}
              </div>

              <div className="h-[350px]">
                <CodeEditor
                  code={codeA}
                  setCode={handleCodeChangeA}
                  activeLine={activeStepA?.codeLine || 0}
                  isAnimating={isAnimatingA}
                  setIsAnimating={setIsAnimatingA}
                  breakpoints={breakpointsA}
                  toggleBreakpoint={toggleBreakpointA}
                  onGenerate={() => generateAnimation(codeA, inputTypeA, inputValue, false)}
                  isLoading={isLoadingA}
                  viewMode={viewModeA}
                  setViewMode={setViewModeA}
                  pseudocode={animationDataA?.pseudocode || []}
                  activePseudoLine={activeStepA?.pseudoLine || 0}
                />
              </div>

              <div className="flex-grow min-h-[300px] border border-border rounded-lg bg-surface/40 flex items-center justify-center relative overflow-hidden">
                {isLoadingA ? (
                  <div className="flex flex-col items-center gap-3 animate-pulse">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                    <span className="text-xs font-mono text-text-secondary">🤖 Thinking...</span>
                  </div>
                ) : errorA ? (
                  <div className="p-6 text-center max-w-md flex flex-col items-center gap-3">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                    <h3 className="text-sm font-bold text-red-500">{errorA.message}</h3>
                  </div>
                ) : animationDataA && activeStepA ? (
                  renderVisualizer(activeStepA, prevStepA, inputTypeA, inputValue, currentStep >= totalStepsA - 1)
                ) : (
                  <div className="text-text-secondary italic text-xs">Algorithm A visualizer empty.</div>
                )}
              </div>

              {animationDataA && activeStepA && (
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-mono py-1.5 px-3 rounded bg-background border border-border flex justify-between select-none">
                    <span className="text-text-secondary">STEP {currentStep + 1} OF {totalStepsA}</span>
                    <span className="text-text-primary text-right font-bold truncate max-w-[200px]">{activeStepA.description}</span>
                  </div>
                  <ComplexityBar timeComplexity={animationDataA.timeComplexity} spaceComplexity={animationDataA.spaceComplexity} />
                  <VariableTracker step={activeStepA} />
                  <CallStackPanel step={activeStepA} />
                </div>
              )}
            </div>

            {/* PANEL B */}
            <div className="flex flex-col gap-3.5 border border-border rounded-xl p-4 bg-surface/20">
              <div className="flex flex-col gap-1 border-b border-border/80 pb-2 select-none">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-accent/20 border border-accent/40 text-accent font-bold font-mono text-[10px] uppercase">
                      Algorithm B
                    </span>
                    <h2 className="text-sm font-bold truncate max-w-[150px]">
                      {animationDataB?.algorithm || inputTypeB.toUpperCase()}
                    </h2>
                  </div>

                  {animationDataB && (
                    <div className="flex gap-2 text-[10px] font-mono">
                      <span className="text-text-secondary">
                        Comparisons: <strong className="text-accent">{opsB.comparisons}</strong>
                      </span>
                      <span className="text-text-secondary">
                        Swaps: <strong className="text-[#ef4444]">{opsB.swaps}</strong>
                      </span>
                    </div>
                  )}
                </div>
                {animationDataB?.description && (
                  <p className="text-[11px] text-text-secondary font-mono leading-relaxed mt-0.5">
                    {animationDataB.description}
                  </p>
                )}
              </div>

              <div className="h-[350px]">
                <CodeEditor
                  code={codeB}
                  setCode={handleCodeChangeB}
                  activeLine={activeStepB?.codeLine || 0}
                  isAnimating={isAnimatingB}
                  setIsAnimating={setIsAnimatingB}
                  breakpoints={breakpointsB}
                  toggleBreakpoint={toggleBreakpointB}
                  onGenerate={() => generateAnimation(codeB, inputTypeB, inputValue, true)}
                  isLoading={isLoadingB}
                  viewMode={viewModeB}
                  setViewMode={setViewModeB}
                  pseudocode={animationDataB?.pseudocode || []}
                  activePseudoLine={activeStepB?.pseudoLine || 0}
                />
              </div>

              <div className="flex-grow min-h-[300px] border border-border rounded-lg bg-surface/40 flex items-center justify-center relative overflow-hidden">
                {isLoadingB ? (
                  <div className="flex flex-col items-center gap-3 animate-pulse">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                    <span className="text-xs font-mono text-text-secondary">🤖 Thinking...</span>
                  </div>
                ) : errorB ? (
                  <div className="p-6 text-center max-w-md flex flex-col items-center gap-3">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                    <h3 className="text-sm font-bold text-red-500">{errorB.message}</h3>
                  </div>
                ) : animationDataB && activeStepB ? (
                  renderVisualizer(activeStepB, prevStepB, inputTypeB, inputValue, currentStep >= totalStepsB - 1)
                ) : (
                  <div className="text-text-secondary italic text-xs">Algorithm B visualizer empty.</div>
                )}
              </div>

              {animationDataB && activeStepB && (
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-mono py-1.5 px-3 rounded bg-background border border-border flex justify-between select-none">
                    <span className="text-text-secondary">STEP {currentStep + 1} OF {totalStepsB}</span>
                    <span className="text-text-primary text-right font-bold truncate max-w-[200px]">{activeStepB.description}</span>
                  </div>
                  <ComplexityBar timeComplexity={animationDataB.timeComplexity} spaceComplexity={animationDataB.spaceComplexity} />
                  <VariableTracker step={activeStepB} />
                  <CallStackPanel step={activeStepB} />
                </div>
              )}
            </div>

          </div>
        ) : (
          /* --- STANDARD LAYOUT SPLIT (Left Column: Editor, Right Column: Visualizer) --- */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow">
            
            {/* LEFT COLUMN: EDITOR, CHIPS & INPUTS */}
            <div className="flex flex-col gap-4 h-full">
              
              {/* Algorithm preset chips (always shown at top of left panel) */}
              <div className="flex flex-wrap gap-2 p-3 bg-surface/50 border border-border rounded-lg select-none">
                <span className="text-[10px] font-bold text-text-secondary w-full mb-1 uppercase font-mono tracking-wider">Example Presets:</span>
                {Object.entries(EXAMPLES).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => loadExample(key as any)}
                    className="px-2.5 py-1.5 bg-background border border-border hover:border-accent hover:text-accent rounded text-[10px] font-bold font-mono transition-all focus:outline-none"
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              {/* Data Type switcher when editing */}
              {!isAnimatingA && (
                <div className="flex gap-1.5 p-1 bg-surface border border-border rounded-lg select-none">
                  {(['sorting', 'tree', 'graph', 'linkedlist', 'stack', 'queue'] as VisualizerType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setInputTypeA(t)}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-md transition-all focus:outline-none ${
                        inputTypeA === t
                          ? 'bg-accent text-white shadow-sm'
                          : 'text-text-secondary hover:text-text-primary hover:bg-background/40'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}

              {/* Custom input panel */}
              <CustomInputPanel
                inputType={inputTypeA}
                value={inputValue}
                onChange={setInputValue}
              />

              {/* Editor Component */}
              <div className="flex-grow min-h-[300px]">
                <CodeEditor
                  code={codeA}
                  setCode={handleCodeChangeA}
                  activeLine={activeStepA?.codeLine || 0}
                  isAnimating={isAnimatingA}
                  setIsAnimating={setIsAnimatingA}
                  breakpoints={breakpointsA}
                  toggleBreakpoint={toggleBreakpointA}
                  onGenerate={() => generateAnimation(codeA, inputTypeA, inputValue, false)}
                  isLoading={isLoadingA}
                  viewMode={viewModeA}
                  setViewMode={setViewModeA}
                  pseudocode={animationDataA?.pseudocode || []}
                  activePseudoLine={activeStepA?.pseudoLine || 0}
                />
              </div>

              {/* Time/Space Complexity Card Bar */}
              {animationDataA && (
                <ComplexityBar
                  timeComplexity={animationDataA.timeComplexity}
                  spaceComplexity={animationDataA.spaceComplexity}
                />
              )}
            </div>

            {/* RIGHT COLUMN: VISUALIZER CANVAS, SCROLLER, DESCRIPTION, TRACKER, PSEUDOCODE */}
            <div className="flex flex-col gap-4">
              
              {/* Empty visualizer state (before generate) */}
              {!animationDataA && !isLoadingA && (
                <div className="flex-grow border border-border rounded-xl bg-surface/20 flex flex-col items-center justify-center p-8 text-center gap-4 select-none min-h-[400px]">
                  <div className="w-14 h-14 rounded-full bg-surface/80 border border-border flex items-center justify-center shadow-lg relative group">
                    <Sparkles className="w-7 h-7 text-accent group-hover:rotate-12 transition-transform duration-300" />
                    <div className="absolute inset-0 rounded-full border border-accent opacity-30 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary mb-1">
                      Visualizer Dashboard Empty
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed font-mono max-w-sm mb-4">
                      Select one of the algorithm preset chips on the left or paste your own code, then click **Generate Animation** to start.
                    </p>

                  </div>
                </div>
              )}

              {/* Shimmer thinking loading state */}
              {isLoadingA && (
                <div className="flex-grow border border-border rounded-xl bg-surface/20 flex flex-col items-center justify-center p-8 min-h-[400px] animate-pulse">
                  <div className="w-12 h-12 rounded-full border-4 border-t-accent border-r-accent border-b-border border-l-border animate-spin mb-4" />
                  <span className="text-xs font-mono text-text-secondary">🤖 Analyzing your code & constructing frames...</span>
                </div>
              )}

              {/* Error boundary card */}
              {errorA && !isLoadingA && (
                <div className="flex-grow border border-border rounded-xl bg-surface/20 flex flex-col items-center justify-center p-6 text-center gap-4 min-h-[400px] font-mono">
                  <AlertCircle className="w-12 h-12 text-red-500 animate-bounce" />
                  <h3 className="text-sm font-bold text-red-500">{errorA.message}</h3>
                  {errorA.raw && (
                    <details className="w-full text-left text-[10px] bg-background border border-border rounded p-2.5 overflow-auto max-h-48">
                      <summary className="cursor-pointer text-text-secondary font-bold select-none">Raw Response Dump</summary>
                      <pre className="mt-1.5 text-red-400 whitespace-pre-wrap">{errorA.raw}</pre>
                    </details>
                  )}
                </div>
              )}

              {/* Main Visualizer Render Block */}
              {animationDataA && activeStepA && !isLoadingA && (
                <div className="flex flex-col gap-4 border border-border rounded-xl p-5 bg-surface/20 flex-grow">
                  
                  {/* Visualizer header & Export buttons */}
                  <div className="flex flex-col gap-1 border-b border-border/60 pb-3 select-none">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-accent-muted text-accent border border-accent/20 font-bold font-mono text-[10px] uppercase">
                        {animationDataA.type}
                      </span>
                      <h2 className="text-sm font-bold tracking-tight">
                        {animationDataA.algorithm}
                      </h2>
                    </div>
                    {animationDataA.description && (
                      <p className="text-xs text-text-secondary font-mono leading-relaxed mt-1">
                        {animationDataA.description}
                      </p>
                    )}
                  </div>

                  {/* Step Description Card */}
                  <div className="text-xs font-mono py-2.5 px-3.5 rounded bg-background border border-border flex justify-between items-center select-none gap-4">
                    <span className="text-text-primary font-bold italic leading-relaxed">
                      {activeStepA.description}
                    </span>
                    <span className="text-accent font-bold shrink-0 text-right">
                      STEP {currentStep + 1}/{totalStepsA} · LINE {activeStepA.codeLine}
                    </span>
                  </div>

                  {/* Main Visualizer Canvas area */}
                  <div 
                    id="primary-visualizer-canvas"
                    className="flex-grow min-h-[220px] border border-border rounded-lg bg-background/40 flex items-center justify-center relative overflow-hidden"
                  >
                    {renderVisualizer(activeStepA, prevStepA, inputTypeA, inputValue, currentStep >= totalStepsA - 1)}
                  </div>

                  {/* Variable Tracker table */}
                  <VariableTracker step={activeStepA} />

                  {/* Call stack frame panel (only shows up for recursive) */}
                  <CallStackPanel step={activeStepA} />

                  {/* Playback Controls Component */}
                  <PlaybackControls
                    currentStep={currentStep}
                    totalSteps={totalStepsA}
                    isPlaying={isPlaying}
                    setStep={setCurrentStep}
                    togglePlay={togglePlay}
                    speed={speed}
                    setSpeed={setSpeed}
                    muted={muted}
                    setMuted={setMuted}
                    breakpointsCount={breakpointsA.length}
                    clearBreakpoints={() => setBreakpointsA([])}
                    disabled={isLoadingA}
                  />

                  {/* Pseudocode panel below visualizer */}
                  {animationDataA.pseudocode && animationDataA.pseudocode.length > 0 && (
                    <div className="border border-border rounded-lg bg-surface/30 overflow-hidden font-mono text-xs">
                      <div className="px-4 py-2 bg-surface border-b border-border flex items-center gap-1.5 font-bold text-text-secondary select-none uppercase">
                        <BookOpen className="w-4 h-4 text-accent" />
                        <span>Pseudocode Outline</span>
                      </div>
                      <div className="p-3 bg-surface/10 max-h-[140px] overflow-y-auto leading-relaxed select-text">
                        {animationDataA.pseudocode.map((line, idx) => {
                          const isLineActive = activeStepA.pseudoLine === idx + 1;
                          return (
                            <div 
                              key={`ps-outline-${idx}`} 
                              className={`flex gap-3 px-2 py-0.5 rounded transition-colors ${
                                isLineActive ? 'bg-accent-muted text-accent font-bold border-l-2 border-accent' : 'text-text-secondary'
                              }`}
                            >
                              <span className="text-text-secondary/40 text-right min-w-[15px]">{idx + 1}</span>
                              <pre className="font-mono text-xs">{line}</pre>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-[10px] font-mono text-text-secondary select-none mt-auto">
        DSA Animator — Paste your code. Watch it think. Made with AI assistance.
      </footer>
    </div>
  );
}
