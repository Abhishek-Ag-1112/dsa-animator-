import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  LogIn, 
  UserPlus, 
  ChevronRight, 
  Activity, 
  GitBranch, 
  Layers, 
  Layers3, 
  Database,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface LandingPageProps {
  onAuthSuccess: (user: any) => void;
}

export default function LandingPage({ onAuthSuccess }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('abhishek040478@gmail.com'); // Prefilled as requested
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess(userCredential.user);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        onAuthSuccess(userCredential.user);
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = `Authentication failed (${err.code || 'Error'}): ${err.message || 'Please try again.'}`;
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errMsg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = 'This email is already registered.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Password must be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Please enter a valid email address.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'Email/Password sign-in method is disabled. Please go to Firebase Console -> Authentication -> Sign-in method and enable Email/Password provider.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Activity className="w-5 h-5 text-indigo-400" />,
      title: 'Sorting Algorithms',
      desc: 'Trace bubble sort, quick sort, merge sort, and insertion sort with dynamic visual bars and stats.'
    },
    {
      icon: <GitBranch className="w-5 h-5 text-pink-400" />,
      title: 'Graphs & Trees',
      desc: 'Visualize Breadth-First Search (BFS), Depth-First Search (DFS), and Binary Tree traversals in real-time.'
    },
    {
      icon: <Layers className="w-5 h-5 text-emerald-400" />,
      title: 'Linear Structures',
      desc: 'Watch Stacks, Queues, and Linked Lists dynamically push, pop, enqueue, dequeue, and traverse.'
    },
    {
      icon: <Database className="w-5 h-5 text-violet-400" />,
      title: 'Cloud Synchronization',
      desc: 'Automatically save your custom algorithm setups and generation history securely to Firestore.'
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#070913] text-gray-100 overflow-x-hidden flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Background Orbs / Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-pink-600/10 blur-[120px] pointer-events-none" />
      
      {/* Glowing Mesh Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Header */}
      <header className="relative w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1.5px]">
            <div className="w-full h-full bg-[#070913] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-wider">
            AlgoVis<span className="text-indigo-400">.AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 hidden sm:inline-block">Logged in as: abhishek040478@gmail.com</span>
          <a 
            href="#auth-card" 
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition text-sm font-semibold"
          >
            Sign In
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-6 py-12 lg:py-24 grid lg:grid-cols-12 gap-12 items-center z-10 flex-grow">
        
        {/* Left Side: Copy/Features */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 w-fit">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Next-Gen Algorithm Visualizer</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-400">
            Learn Algorithms <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Through AI Animation
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 max-w-xl leading-relaxed">
            Write your code in plain Javascript, and watch our AI compiler construct step-by-step interactive animations with line-by-line pseudocode execution, stack visualization, and custom controls.
          </p>

          {/* Feature Grid */}
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            {features.map((feat, i) => (
              <div 
                key={i} 
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08] transition duration-300 flex flex-col gap-2"
              >
                <div className="p-2 rounded-lg bg-white/[0.03] w-fit">
                  {feat.icon}
                </div>
                <h3 className="font-bold text-sm text-gray-200">{feat.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Auth Card (Glassmorphic) */}
        <div id="auth-card" className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-md p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col gap-6">
            
            {/* Glowing border effects */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-[40px] opacity-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500 to-indigo-500 rounded-full blur-[40px] opacity-20 pointer-events-none" />

            <div className="flex flex-col gap-2 relative z-10">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-xs text-gray-400">
                {activeTab === 'login' 
                  ? 'Sign in to access your dashboard and sync histories.' 
                  : 'Register a new account to begin saving algorithm tracing datasets.'}
              </p>
            </div>

            {/* Auth Tab Buttons */}
            <div className="flex bg-white/[0.03] p-1 rounded-lg border border-white/[0.05] relative z-10">
              <button
                onClick={() => { setActiveTab('login'); setError(null); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition duration-200 ${
                  activeTab === 'login' 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setActiveTab('register'); setError(null); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition duration-200 ${
                  activeTab === 'register' 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 relative z-10"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] focus:border-indigo-500 focus:bg-white/[0.04] focus:ring-1 focus:ring-indigo-500 rounded-lg outline-none transition text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Password</label>
                  {activeTab === 'login' && (
                    <button 
                      type="button" 
                      onClick={() => alert("Please register a new user or login with details provided.")} 
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] focus:border-indigo-500 focus:bg-white/[0.04] focus:ring-1 focus:ring-indigo-500 rounded-lg outline-none transition text-sm text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:brightness-110 active:brightness-95 disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-sm shadow-lg shadow-indigo-500/10 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <span>{activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Help */}
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px] text-gray-400 text-left relative z-10 flex flex-col gap-1">
              <span className="font-bold text-gray-300">Quick Start Hint:</span>
              <span>1. Enter a password (e.g. <code className="text-pink-300 bg-white/[0.04] px-1 py-0.5 rounded">123456</code>) and click <strong className="text-indigo-300">Create Account</strong> to register your test account.</span>
              <span>2. If it is already registered, click <strong className="text-indigo-300">Sign In</strong> with your password instead.</span>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative max-w-7xl mx-auto px-6 py-6 border-t border-white/[0.03] w-full text-center text-xs text-gray-500 z-10">
        <p>© 2026 AlgoVis AI. Built with premium design standards. Active account configuration: abhishek040478@gmail.com.</p>
      </footer>

    </div>
  );
}
