import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, Zap, ShieldCheck, Sparkles, Brain, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThreeDCard } from "../components/ThreeDCard";

/* ── animated floating orb ─────────────────────────────────────── */
const Orb = ({ className }: { className: string }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
  />
);

export const Register: React.FC = () => {
  const { register, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, []);

  // Custom states for interactive left-panel demo
  const [solarCharge, setSolarCharge] = useState(true);
  const [chartData, setChartData] = useState<number[]>([30, 45, 35, 60, 40, 55, 45, 70, 50, 65, 55, 80]);

  // Animate the spline graph with randomized real-time fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => [...prev.slice(1), Math.floor(35 + Math.random() * 50)]);
      setSolarCharge(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await register(fullName, email, password);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create account. Email might be already in use.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase = (field: string) =>
    `block w-full pl-11 pr-4 py-2.5 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 outline-none border bg-white/85 dark:bg-slate-955/55 border-slate-250 dark:border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed ${
      focusedField === field
        ? "border-blue-600 dark:border-emerald-500 shadow-[0_0_0_4px_rgba(37,99,235,0.12)] dark:shadow-[0_0_0_4px_rgba(16,185,129,0.12)]"
        : "hover:border-slate-400 dark:hover:border-slate-700"
    }`;

  return (
    <div className="flex-1 flex min-h-screen bg-transparent transition-colors duration-300 relative overflow-hidden select-none">
      {/* --- LEFT PANEL: Interactive Product Showcase (70%) --- */}
      <div className="hidden lg:flex lg:w-[70%] relative overflow-hidden flex-col justify-between p-10 z-10 border-r border-slate-200/60 dark:border-slate-900/60 bg-slate-50/10 dark:bg-transparent">
        
        {/* Animated Orbs for glow depth */}
        <Orb className="w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 -top-24 -left-24" />
        <Orb className="w-80 h-80 bg-emerald-500/5 bottom-0 right-0" />

        {/* Top Header & Feature Section */}
        <div className="space-y-6 w-full text-left">
          {/* Brand Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-5.5 h-5.5 text-white animate-pulse" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
              EnergyAI
            </span>
          </motion.div>

          {/* Grid for Hero + Badges & Dashboard widgets */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start w-full">
            
            {/* Left side: branding copy & core features */}
            <div className="xl:col-span-4 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-slate-900/60 border border-slate-250 dark:border-slate-800 text-blue-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                  <span>AI-POWERED ENERGY INTELLIGENCE</span>
                </div>
                
                <h2 className="text-4xl xl:text-5xl font-display font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                  Transform Energy Data <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-emerald-600 dark:from-blue-400 dark:via-cyan-400 dark:to-emerald-400">Into Savings</span>
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Monitor consumption, predict bills, receive AI-powered recommendations, and reduce electricity costs with intelligent analytics.
                </p>
              </motion.div>

              {/* Three clean feature items */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                {[
                  { icon: Zap, color: 'blue', title: 'Smart Monitoring', desc: 'Real-time energy tracking' },
                  { icon: Brain, color: 'purple', title: 'AI Predictions', desc: 'Accurate bill forecasts' },
                  { icon: Leaf, color: 'emerald', title: 'Eco Friendly', desc: 'Reduce carbon footprint' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3.5 p-3 rounded-xl bg-white/65 dark:bg-slate-955/20 border border-slate-200/65 dark:border-slate-900/45 backdrop-blur-sm transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-955/45 hover:scale-[1.02] hover:shadow-sm">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${item.color === 'blue' ? 'blue-500' : item.color === 'purple' ? 'purple-500' : 'emerald-500'}/10 border border-${item.color === 'blue' ? 'blue-500' : item.color === 'purple' ? 'purple-500' : 'emerald-500'}/20 shadow-inner`}>
                      <item.icon className={`w-4.5 h-4.5 text-${item.color === 'blue' ? 'blue-600' : item.color === 'purple' ? 'purple-600' : 'emerald-600'} dark:text-${item.color === 'blue' ? 'blue-400' : item.color === 'purple' ? 'purple-400' : 'emerald-400'}`} />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-slate-850 dark:text-slate-200">{item.title}</h4>
                      <p className="text-[11px] text-slate-555 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: high fidelity live twin layout widgets */}
            <div className="xl:col-span-8 space-y-4 w-full">
              
              {/* Row 1: Energy Overview Widget */}
              <div className="bg-white/65 dark:bg-slate-955/20 border border-slate-200/60 dark:border-slate-900/40 p-4 rounded-[20px] shadow-sm backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-850/60 pb-2 mb-3">
                  <span className="text-[10px] font-extrabold text-slate-655 dark:text-slate-400 uppercase tracking-wider">Energy Overview</span>
                  <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-md">Today</span>
                </div>
                
                <div className="flex items-center justify-between gap-4">
                  <div className="text-left shrink-0">
                    <p className="text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase leading-none">Today's Usage</p>
                    <p className="text-2.5xl font-black text-slate-900 dark:text-white mt-1.5 leading-none">12.4 <span className="text-xs font-semibold text-slate-555">kWh</span></p>
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-2 bg-emerald-100/60 dark:bg-emerald-955/20 px-1.5 py-0.5 rounded">
                      ▲ +12% vs yesterday
                    </span>
                  </div>
                  
                  {/* Miniature Spark/Bar Chart */}
                  <div className="flex-1 h-20 flex items-end justify-between gap-1.5 pt-2">
                    {chartData.map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                        <div className="absolute bottom-full mb-1 bg-slate-900 dark:bg-slate-800 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-20">
                          {val}%
                        </div>
                        <div 
                          className="w-full bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400 dark:from-emerald-500 dark:via-emerald-450 dark:to-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(37,99,235,0.15)] dark:shadow-[0_0_8px_rgba(16,185,129,0.15)]"
                          style={{ height: `${val}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: AI Recommendation Widget */}
              <div className="bg-white/65 dark:bg-slate-955/20 border border-slate-200/60 dark:border-slate-900/40 p-4 rounded-[20px] shadow-sm backdrop-blur-md flex items-center justify-between gap-4">
                <div className="text-left space-y-2.5">
                  <span className="text-[10px] font-extrabold text-slate-655 dark:text-slate-400 uppercase tracking-wider">AI Recommendation</span>
                  <p className="text-[11px] text-slate-705 dark:text-slate-350 leading-relaxed max-w-sm">
                    Your usage is higher than usual. AI suggests setting AC to <span className="font-bold text-blue-600 dark:text-emerald-400">24°C</span> to save up to <span className="font-bold text-slate-900 dark:text-white">₹120</span> today.
                  </p>
                  <button type="button" className="text-[10px] font-bold text-white dark:text-slate-950 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-emerald-400 dark:to-cyan-400 px-3.5 py-1.5 rounded-lg shadow-sm hover:shadow-md hover:shadow-blue-500/20 dark:hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                    Optimize Now
                  </button>
                </div>

                {/* Animated Robot Assistant */}
                <div className="w-20 h-20 flex items-center justify-center shrink-0 overflow-visible">
                  <svg viewBox="0 0 100 120" className="w-20 h-24 overflow-visible">
                    <defs>
                      <linearGradient id="robot-head-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor="#E2E8F0" />
                      </linearGradient>
                      <linearGradient id="robot-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor="#CBD5E1" />
                      </linearGradient>
                      <linearGradient id="robot-screen-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#1E293B" />
                        <stop offset="100%" stopColor="#0F172A" />
                      </linearGradient>
                      <filter id="robot-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    <style>{`
                      @keyframes robot-float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-8px); }
                      }
                      @keyframes robot-shadow {
                        0%, 100% { transform: scale(1); opacity: 0.15; }
                        50% { transform: scale(0.7); opacity: 0.08; }
                      }
                      @keyframes robot-blink {
                        0%, 96%, 100% { transform: scaleY(1); }
                        98% { transform: scaleY(0.1); }
                      }
                      @keyframes robot-arm-left {
                        0%, 100% { transform: rotate(0deg); }
                        50% { transform: rotate(4deg); }
                      }
                      @keyframes robot-arm-right {
                        0%, 100% { transform: rotate(0deg); }
                        50% { transform: rotate(-4deg); }
                      }
                      .anim-float {
                        animation: robot-float 4s ease-in-out infinite;
                      }
                      .anim-shadow {
                        animation: robot-shadow 4s ease-in-out infinite;
                        transform-origin: 50px 115px;
                      }
                      .anim-blink {
                        animation: robot-blink 5s ease-in-out infinite;
                        transform-origin: 50% 27px;
                      }
                      .anim-arm-left {
                        animation: robot-arm-left 4s ease-in-out infinite;
                        transform-origin: 22px 55px;
                      }
                      .anim-arm-right {
                        animation: robot-arm-right 4s ease-in-out infinite;
                        transform-origin: 78px 55px;
                      }
                    `}</style>
                    
                    {/* Floating Shadow */}
                    <ellipse cx="50" cy="115" rx="20" ry="3" fill="#000" className="anim-shadow" />
                    
                    {/* Robot body + head (floating) */}
                    <g className="anim-float">
                      {/* Ears/Side Capsules */}
                      <rect x="8" y="24" width="10" height="20" rx="5" fill="#E2E8F0" />
                      <rect x="82" y="24" width="10" height="20" rx="5" fill="#E2E8F0" />

                      {/* Arms */}
                      <path d="M 20 54 C 10 65, 8 85, 14 92 C 20 98, 25 85, 23 65 Z" fill="#CBD5E1" className="anim-arm-left" />
                      <path d="M 80 54 C 90 65, 92 85, 86 92 C 80 98, 75 85, 77 65 Z" fill="#CBD5E1" className="anim-arm-right" />

                      {/* Body */}
                      <path d="M 30 50 C 30 45, 70 45, 70 50 C 70 65, 75 100, 50 100 C 25 100, 30 65, 30 50 Z" fill="url(#robot-body-grad)" />
                      <path d="M 32 68 C 32 68, 50 78, 68 68 C 68 68, 62 90, 50 90 C 38 90, 32 68, 32 68 Z" fill="none" stroke="#94A3B8" strokeWidth="1" />
                      
                      {/* Neck */}
                      <rect x="42" y="40" width="16" height="8" rx="3" fill="#94A3B8" />
                      
                      {/* Head */}
                      <rect x="15" y="10" width="70" height="42" rx="20" fill="url(#robot-head-grad)" stroke="#E2E8F0" strokeWidth="1" />
                      
                      {/* Screen */}
                      <rect x="21" y="15" width="58" height="30" rx="14" fill="url(#robot-screen-grad)" />
                      
                      {/* Face elements */}
                      <g filter="url(#robot-glow)">
                        {/* Eyes */}
                        <ellipse cx="38" cy="27" rx="6" ry="5" fill="#22D3EE" className="anim-blink" />
                        <ellipse cx="62" cy="27" rx="6" ry="5" fill="#22D3EE" className="anim-blink" />
                        {/* Smile */}
                        <path d="M 45 34 Q 50 39 55 34" fill="none" stroke="#22D3EE" strokeWidth="3" strokeLinecap="round" />
                      </g>
                    </g>
                  </svg>
                </div>
              </div>

              {/* Row 3: Split Savings, Carbon, and circular Progress */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/65 dark:bg-slate-955/20 border border-slate-200/60 dark:border-slate-900/40 p-3 rounded-[20px] text-left flex flex-col justify-between h-[85px] card-client card-client-blue">
                  <span className="text-[8px] font-extrabold text-slate-600 dark:text-slate-450 uppercase tracking-wider block">Est Savings</span>
                  <div className="mt-1">
                    <p className="text-[15px] font-black text-slate-900 dark:text-white leading-none">₹1,250<span className="text-[9px] text-slate-500 font-bold">/mo</span></p>
                    <span className="text-[8px] text-blue-600 dark:text-cyan-400 font-bold leading-none block mt-1">▲ +14% vs last mo</span>
                  </div>
                </div>

                <div className="bg-white/65 dark:bg-slate-955/20 border border-slate-200/60 dark:border-slate-900/40 p-3 rounded-[20px] text-left flex flex-col justify-between h-[85px] card-client card-client-emerald">
                  <span className="text-[8px] font-extrabold text-slate-600 dark:text-slate-455 uppercase tracking-wider block">Carbon Reduc.</span>
                  <div className="mt-1">
                    <p className="text-[15px] font-black text-slate-900 dark:text-white leading-none">28%</p>
                    <span className="text-[8px] text-emerald-600 dark:text-emerald-450 font-bold leading-none block mt-1">🌱 142 kg CO₂ saved</span>
                  </div>
                </div>

                <div className="bg-white/65 dark:bg-slate-955/20 border border-slate-200/60 dark:border-slate-900/40 p-2.5 rounded-[20px] text-left flex items-center justify-between h-[85px] gap-2 card-client card-client-cyan">
                  <div className="min-w-0">
                    <span className="text-[8px] font-extrabold text-slate-600 dark:text-slate-450 uppercase tracking-wider block">Efficiency</span>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-250 mt-1 leading-none">Excellent</p>
                  </div>
                  <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-200 dark:text-slate-850" />
                      <circle cx="18" cy="18" r="15" stroke="currentColor" strokeWidth="3" fill="transparent"
                        strokeDasharray={2 * Math.PI * 15}
                        strokeDashoffset={2 * Math.PI * 15 * (1 - 0.92)}
                        strokeLinecap="round"
                        className="text-emerald-500 dark:text-emerald-400 drop-shadow-[0_0_3px_rgba(16,185,129,0.6)]"
                      />
                    </svg>
                    <span className="absolute text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400">92%</span>
                  </div>
                </div>
              </div>

              {/* Row 4: Top Appliances & Live Status */}
              <div className="grid grid-cols-2 gap-3">
                {/* Top Appliances widget */}
                <div className="bg-white/65 dark:bg-slate-955/20 border border-slate-200/60 dark:border-slate-900/40 p-4 rounded-[20px] text-left space-y-3 flex flex-col justify-between h-[155px] card-client card-client-blue">
                  <span className="text-[8px] font-extrabold text-slate-600 dark:text-slate-455 uppercase tracking-wider block">Top Appliances</span>
                  <div className="space-y-2 flex-1 flex flex-col justify-center">
                    {/* AC */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[9px] font-bold">
                        <span className="text-slate-800 dark:text-slate-350">1. Air Conditioner</span>
                        <span className="text-slate-900 dark:text-white font-black">5.6 kWh</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-emerald-500 dark:to-cyan-400 rounded-full" style={{ width: "75%" }} />
                      </div>
                    </div>
                    {/* Refrigerator */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[9px] font-bold">
                        <span className="text-slate-800 dark:text-slate-350">2. Refrigerator</span>
                        <span className="text-slate-900 dark:text-white font-black">2.1 kWh</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-emerald-500 dark:to-cyan-400 rounded-full" style={{ width: "40%" }} />
                      </div>
                    </div>
                    {/* Washing Machine */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[9px] font-bold">
                        <span className="text-slate-800 dark:text-slate-350">3. Washing Machine</span>
                        <span className="text-slate-900 dark:text-white font-black">1.3 kWh</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-emerald-500 dark:to-cyan-400 rounded-full" style={{ width: "25%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Status widget */}
                <div className="bg-white/65 dark:bg-slate-955/20 border border-slate-200/60 dark:border-slate-900/40 p-4 rounded-[20px] text-left flex flex-col justify-between h-[155px] card-client card-client-emerald">
                  <div className="space-y-1">
                    <span className="text-[8px] font-extrabold text-slate-655 dark:text-slate-455 uppercase tracking-wider block">Live Status</span>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-455 uppercase">Operational</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold transition-all duration-300 ${solarCharge ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${solarCharge ? 'bg-amber-500 animate-ping' : 'bg-slate-400'}`} />
                        ☀️ Solar
                      </span>
                    </div>
                  </div>
                  
                  {/* Miniature Blueprint house wireframe */}
                  <div className="flex justify-center items-center py-2 flex-1">
                    <svg viewBox="0 0 100 70" className="w-28 h-20 overflow-visible">
                      <defs>
                        <pattern id="house-grid-3d" width="8" height="8" patternUnits="userSpaceOnUse">
                          <path d="M 8 0 L 0 0 0 8" fill="none" stroke={isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"} strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100" height="70" fill="url(#house-grid-3d)" />
                      
                      {/* Wireframe Back Edges (Low Opacity/Dashed) */}
                      <path d="M 15 45 L 50 33 L 70 43 M 50 33 L 50 13 M 50 13 L 15 25 M 50 13 L 70 23 M 50 13 L 60 3" fill="none" stroke={isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)"} strokeWidth="0.8" strokeDasharray="2 2" />

                      {/* Main House Outline */}
                      {/* Floor Base */}
                      <path d="M 15 45 L 35 55 L 70 43" fill="none" stroke={isDark ? "rgba(34, 211, 238, 0.5)" : "rgba(37, 99, 235, 0.5)"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      {/* Vertical Pillars */}
                      <line x1="15" y1="45" x2="15" y2="25" stroke={isDark ? "rgba(34, 211, 238, 0.5)" : "rgba(37, 99, 235, 0.5)"} strokeWidth="1.2" strokeLinecap="round" />
                      <line x1="35" y1="55" x2="35" y2="35" stroke={isDark ? "rgba(34, 211, 238, 0.5)" : "rgba(37, 99, 235, 0.5)"} strokeWidth="1.2" strokeLinecap="round" />
                      <line x1="70" y1="43" x2="70" y2="23" stroke={isDark ? "rgba(34, 211, 238, 0.5)" : "rgba(37, 99, 235, 0.5)"} strokeWidth="1.2" strokeLinecap="round" />
                      {/* Top Wall Plates */}
                      <path d="M 15 25 L 35 35 L 70 23" fill="none" stroke={isDark ? "rgba(34, 211, 238, 0.5)" : "rgba(37, 99, 235, 0.5)"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

                      {/* Roof Gable & Ridge */}
                      <path d="M 15 25 L 25 15 L 35 35" fill="none" stroke={isDark ? "rgba(34, 211, 238, 0.5)" : "rgba(37, 99, 235, 0.5)"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="25" y1="15" x2="60" y2="3" stroke={isDark ? "rgba(34, 211, 238, 0.5)" : "rgba(37, 99, 235, 0.5)"} strokeWidth="1.2" strokeLinecap="round" />
                      <line x1="60" y1="3" x2="70" y2="23" stroke={isDark ? "rgba(34, 211, 238, 0.5)" : "rgba(37, 99, 235, 0.5)"} strokeWidth="1.2" strokeLinecap="round" />

                      {/* Door (Isometric) */}
                      <path d="M 22 48.5 L 28 51.5 L 28 41.5 L 22 38.5 Z" fill="none" stroke={isDark ? "rgba(34, 211, 238, 0.5)" : "rgba(37, 99, 235, 0.5)"} strokeWidth="1" />

                      {/* Window (Isometric) */}
                      <path d="M 45 46.5 L 58 42 L 58 34 L 45 38.5 Z" fill="none" stroke={isDark ? "rgba(34, 211, 238, 0.5)" : "rgba(37, 99, 235, 0.5)"} strokeWidth="1" />
                      <line x1="51.5" y1="44.25" x2="51.5" y2="36.25" stroke={isDark ? "rgba(34, 211, 238, 0.3)" : "rgba(37, 99, 235, 0.3)"} strokeWidth="0.8" />
                      <line x1="45" y1="42.5" x2="58" y2="38" stroke={isDark ? "rgba(34, 211, 238, 0.3)" : "rgba(37, 99, 235, 0.3)"} strokeWidth="0.8" />

                      {/* Solar Panel (Isometric Grid on Roof Slope) */}
                      <polygon points="26,16 59,4.5 68,22.5 34,34" fill={solarCharge ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.05)"} stroke={solarCharge ? "#f59e0b" : "#10b981"} strokeWidth="1.2" className="transition-colors duration-500" />
                      <line x1="42.5" y1="10.25" x2="51" y2="28.25" stroke={solarCharge ? "rgba(245, 158, 11, 0.6)" : "rgba(16, 185, 129, 0.4)"} strokeWidth="0.8" />
                      <line x1="30" y1="25" x2="63.5" y2="13.5" stroke={solarCharge ? "rgba(245, 158, 11, 0.6)" : "rgba(16, 185, 129, 0.4)"} strokeWidth="0.8" />

                      {/* Glowing Energy Flow Node Animation */}
                      {solarCharge && (
                        <>
                          <circle r="2" fill="#f59e0b" className="drop-shadow-[0_0_3px_#f59e0b]">
                            <animateMotion dur="2.5s" repeatCount="indefinite" path="M 35 55 L 35 35 L 25 15 L 60 3" />
                          </circle>
                          <circle r="1.5" fill="#f59e0b" className="drop-shadow-[0_0_3px_#f59e0b]">
                            <animateMotion dur="2.5s" begin="1.25s" repeatCount="indefinite" path="M 35 55 L 35 35 L 25 15 L 60 3" />
                          </circle>
                        </>
                      )}

                      {/* Front Peak Node */}
                      <circle cx="25" cy="15" r="2.5" fill={solarCharge ? "#f59e0b" : "#10b981"} className="animate-ping" style={{ transformOrigin: "25px 15px" }} />
                      <circle cx="25" cy="15" r="1.5" fill={solarCharge ? "#f59e0b" : "#10b981"} />
                    </svg>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Footer Metrics & Partner Logos */}
        <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-900/60 space-y-6 w-full text-left">
          {/* Stats grid */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { val: "10,000+", label: "Households Monitored" },
              { val: "95%", label: "AI Prediction Accuracy" },
              { val: "2.5M kWh", label: "Energy Saved" },
              { val: "5,200 Tons", label: "CO₂ Reduced" }
            ].map((stat, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white/60 dark:bg-slate-955/10 border border-slate-200/50 dark:border-slate-900/20 backdrop-blur-sm hover:shadow-sm transition-all duration-300">
                <p className="text-xl font-display font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-600 dark:from-emerald-450 dark:to-cyan-400">{stat.val}</p>
                <p className="text-[8px] font-extrabold text-slate-655 dark:text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Partner Brand Logos */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
              <p className="text-[8px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center shrink-0">
                Trusted Partner Integration
              </p>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 opacity-40 dark:opacity-30 select-none grayscale hover:grayscale-0 hover:opacity-70 dark:hover:opacity-60 transition-all duration-300">
              <span className="text-[10px] font-black tracking-tighter font-sans uppercase text-slate-900 dark:text-white">TATA POWER</span>
              <span className="text-[11px] font-extrabold tracking-tight lowercase text-slate-900 dark:text-white">adani</span>
              <span className="text-[10px] font-black tracking-wide text-slate-900 dark:text-white">▲ Azure</span>
              <span className="text-[10px] font-black tracking-widest italic text-slate-900 dark:text-white">SIEMENS</span>
              <span className="text-[10px] font-bold tracking-wide text-slate-900 dark:text-white">Schneider <span className="text-emerald-500">Electric</span></span>
            </div>
          </div>
        </div>
        {/* Footer info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-slate-455 dark:text-slate-500 text-[10px] tracking-wide mt-4"
        >
          © 2026 EnergyAI · Enterprise-grade Encryption · Secure & Private
        </motion.p>
      </div>

      {/* --- RIGHT PANEL: Premium Glass Form (30%) --- */}
      <div className="flex-1 lg:w-[30%] lg:flex-none flex items-center lg:items-start justify-center px-4 sm:px-8 lg:px-12 py-12 lg:pt-28 z-10 relative bg-slate-100/10 dark:bg-slate-955/20">
        
        {/* Floating gradient colors on right side too */}
        <Orb className="w-80 h-80 bg-blue-500/5 -bottom-24 -right-24" />
        
        {/* Card size decreased: max-w-md -> max-w-[370px] */}
        {/* Opaque container avoids the standard backdrop-filter blurriness bug in 3D rotations */}
        <ThreeDCard maxTilt={5} className="w-full max-w-[370px] shadow-xl dark:shadow-2xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/60 p-6 rounded-[24px] space-y-4 shadow-sm"
          >
            {/* Brand Logo for Mobile Layout */}
            <div className="flex lg:hidden items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <Zap className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-display font-extrabold text-lg text-slate-900 dark:text-white">EnergyAI</span>
            </div>

            {/* Header Titles */}
            <div className="space-y-1 text-left">
              <h1 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                Create account
              </h1>
              <p className="text-xs text-slate-550 dark:text-slate-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-blue-600 dark:text-emerald-455 hover:underline underline-offset-2 transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>

            {/* Error notifications */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  role="alert"
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-955/30 border border-red-200 dark:border-red-800/50 text-red-655 dark:text-red-400 text-xs text-left"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium leading-snug">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} aria-label="Registration form" className="space-y-4 text-left">
              {/* Full Name */}
              <div className="space-y-1">
                <label htmlFor="name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focusedField === "name" ? "text-blue-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-555"}`} />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    disabled={isSubmitting}
                    className={inputBase("name")}
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focusedField === "email" ? "text-blue-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-555"}`} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    disabled={isSubmitting}
                    className={inputBase("email")}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focusedField === "password" ? "text-blue-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-555"}`} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    disabled={isSubmitting}
                    className={`${inputBase("password")} pr-11`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={0}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focusedField === "confirmPassword" ? "text-blue-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-550"}`} />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                    disabled={isSubmitting}
                    className={`${inputBase("confirmPassword")} pr-11`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Submit CTA button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white dark:text-slate-955 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-emerald-400 dark:via-emerald-300 dark:to-cyan-400 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-emerald-400 transition-all shadow-md shadow-blue-500/10 dark:shadow-emerald-500/10 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 dark:border-slate-950/30 border-t-white dark:border-t-slate-950 rounded-full animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>Sign up</>
                )}
              </motion.button>

              {/* OR divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* Google Social Button */}
              <motion.button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                whileTap={{ scale: 0.98 }}
                whileHover="hover"
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950/30 text-sm font-bold text-slate-800 dark:text-slate-300 hover:bg-slate-50/80 dark:hover:bg-slate-850 dark:hover:border-slate-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer group"
              >
                <motion.svg 
                  variants={{
                    hover: { scale: 1.25, rotate: [0, -15, 10, 0] }
                  }}
                  transition={{ duration: 0.45 }}
                  className="h-4.5 w-4.5 shrink-0" 
                  viewBox="0 0 24 24"
                >
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.1.85-2.22 3.02v2.51h3.58c2.09-1.92 3.29-4.75 3.29-7.38z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.58-2.51c-.99.66-2.26 1.06-3.76 1.06-2.9 0-5.35-1.97-6.22-4.63H2.82v2.59C4.8 21.09 8.16 24 12 24z" />
                  <path fill="#FBBC05" d="M5.78 14.97c-.22-.66-.35-1.37-.35-2.1s.13-1.44.35-2.1V8.18H2.82C2.04 9.73 1.6 11.47 1.6 13.3c0 1.83.44 3.57 1.22 5.12l2.96-2.45z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.96 1.19 15.24 0 12 0 8.16 0 4.8 2.91 2.82 7.02l2.96 2.45c.87-2.66 3.32-4.63 6.22-4.63z" />
                </motion.svg>
                <motion.span
                  variants={{
                    hover: { x: 3 }
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                >
                  Sign up with Google
                </motion.span>
              </motion.button>
            </form>

            {/* Security Note Footer */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-550">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Secure data isolation · Firebase encrypted</span>
            </div>
          </motion.div>
        </ThreeDCard>
      </div>
    </div>
  );
};
