import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Zap, ShieldCheck, ArrowRight, Sparkles, Brain, Leaf, TrendingUp, Sun, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThreeDCard } from "../components/ThreeDCard";

/* ── animated floating orb ─────────────────────────────────────── */
const Orb = ({ className }: { className: string }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    animate={{ scale: [1, 1.18, 1], opacity: [0.2, 0.42, 0.2] }}
    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
  />
);

/* ── animated number counter ────────────────────────────────────── */
const Counter = ({ to, suffix = "" }: { to: number; suffix?: string }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let cur = 0;
    const step = to / 60;
    const timer = setInterval(() => {
      cur += step;
      if (cur >= to) { setVal(to); clearInterval(timer); }
      else setVal(Math.floor(cur));
    }, 22);
    return () => clearInterval(timer);
  }, [to]);
  return <>{val.toLocaleString()}{suffix}</>;
};


export const Login: React.FC = () => {
  const { login, loginWithGoogle, user } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = (location.state as any)?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [rememberMe, setRememberMe]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState<string | null>(null);
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
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError(null); setIsSubmitting(true);
    try { await login(email, password, rememberMe); navigate(from, { replace: true }); }
    catch (err: any) { setError(err.message || "Failed to log in. Please check your credentials."); }
    finally { setIsSubmitting(false); }
  };

  const handleGoogleSignIn = async () => {
    setError(null); setIsSubmitting(true);
    try { await loginWithGoogle(); navigate(from, { replace: true }); }
    catch (err: any) { setError(err.message || "Failed to sign in with Google."); }
    finally { setIsSubmitting(false); }
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
      <div className="hidden lg:flex lg:w-[70%] relative overflow-hidden flex-col justify-between p-10 xl:p-12 z-10 border-r border-slate-200/45 dark:border-slate-800/35 bg-white/5 dark:bg-slate-950/5">

        {/* Deep ambient orbs */}
        <Orb className="w-[520px] h-[520px] bg-blue-500/6 dark:bg-blue-500/10 -top-40 -left-40" />
        <Orb className="w-[380px] h-[380px] bg-emerald-500/5 dark:bg-emerald-500/8 bottom-0 right-10" />
        <Orb className="w-56 h-56 bg-violet-500/4 dark:bg-cyan-500/6 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        {/* ══ HERO ══ */}
        <div className="space-y-7 w-full text-left">

          {/* Brand badge */}
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65 }}
            className="flex items-center gap-3.5">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-500 to-emerald-400 blur-md opacity-50" />
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-emerald-500 flex items-center justify-center shadow-xl shadow-blue-500/25">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <span className="font-display font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">EnergyAI</span>
              <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 tracking-widest uppercase">Smart Household Platform</p>
            </div>
          </motion.div>

          {/* Main 12-col grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start w-full">

            {/* ── LEFT COLUMN ── */}
            <div className="xl:col-span-4 space-y-5">
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }}
                className="space-y-4">
                {/* AI pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border border-blue-200/70 dark:border-cyan-800/50 text-blue-700 dark:text-cyan-400 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                  AI-Powered Energy Intelligence
                </div>
                {/* Headline */}
                <div className="space-y-1">
                  <h2 className="text-4xl xl:text-[2.55rem] font-display font-black text-slate-900 dark:text-white leading-[1.12] tracking-tight">
                    Transform<br />Energy Data
                  </h2>
                  <h2 className="text-4xl xl:text-[2.55rem] font-display font-black leading-[1.12] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-cyan-600 to-emerald-600 dark:from-blue-400 dark:via-cyan-400 dark:to-emerald-400">
                    Into Savings
                  </h2>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[13px] leading-relaxed">
                  Monitor consumption, predict bills, receive AI-powered recommendations, and reduce electricity costs with intelligent analytics.
                </p>
              </motion.div>

              {/* Feature pills */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.2 }}
                className="grid grid-cols-1 gap-2.5">
                {[
                  { icon: Zap,   hue: "blue",   title: "Smart Monitoring", desc: "Real-time energy tracking",  dot: "bg-blue-500"    },
                  { icon: Brain, hue: "violet",  title: "AI Predictions",  desc: "Accurate bill forecasts",    dot: "bg-violet-500"  },
                  { icon: Leaf,  hue: "emerald", title: "Eco Friendly",    desc: "Reduce carbon footprint",    dot: "bg-emerald-500" },
                  { icon: Sun,   hue: "amber",   title: "Solar Ready",     desc: "Rooftop PV optimisation",    dot: "bg-amber-500"   },
                ].map((item, idx) => (
                  <motion.div key={idx}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + idx * 0.07 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/40 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-900/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group cursor-default">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.hue === "blue" ? "bg-blue-100 dark:bg-blue-900/40" :
                      item.hue === "violet" ? "bg-violet-100 dark:bg-violet-900/40" :
                      item.hue === "emerald" ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-amber-100 dark:bg-amber-900/40"
                    }`}>
                      <item.icon className={`w-4 h-4 ${
                        item.hue === "blue" ? "text-blue-600 dark:text-blue-400" :
                        item.hue === "violet" ? "text-violet-600 dark:text-violet-400" :
                        item.hue === "emerald" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                      }`} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[12px] font-bold text-slate-850 dark:text-slate-200 leading-none">{item.title}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    <span className={`ml-auto w-1.5 h-1.5 rounded-full ${item.dot} opacity-55 group-hover:opacity-100 transition-opacity shrink-0`} />
                  </motion.div>
                ))}
              </motion.div>

            </div>

            {/* ── RIGHT COLUMN: widgets ── */}
            <div className="xl:col-span-8 space-y-3.5 w-full">

              {/* Energy Overview */}
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="bg-white/72 dark:bg-slate-900/35 border border-slate-200/65 dark:border-slate-800/45 p-4 rounded-[22px] shadow-sm backdrop-blur-md">
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100/80 dark:border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-500 dark:text-emerald-400" />
                    <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Energy Overview</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">Today</span>
                  </div>
                </div>
                <div className="flex items-end justify-between gap-4">
                  {/* Animated bar chart – now on the LEFT */}
                  <div className="flex-1 h-[70px] flex items-end justify-between gap-1 pt-1">
                    {chartData.map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                        <div className="absolute bottom-full mb-1.5 bg-slate-900 dark:bg-slate-800 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-20">
                          {val}%
                        </div>
                        <div className="w-full transition-all duration-500"
                          style={{
                            height: `${val}%`,
                            background: isDark ? `linear-gradient(to top, #10b981, #22d3ee)` : `linear-gradient(to top, #2563eb, #06b6d4)`,
                            opacity: 0.5 + (val / 100) * 0.5,
                            borderRadius: "3px 3px 2px 2px",
                            boxShadow: isDark ? "0 0 6px rgba(34,211,238,0.2)" : "0 0 6px rgba(37,99,235,0.18)",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  {/* Stat block – now on the RIGHT */}
                  <div className="text-right shrink-0 space-y-1.5">
                    <p className="text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Today's Usage</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                      12.4 <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">kWh</span>
                    </p>
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
                        ▲ +12% vs yesterday
                      </span>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 px-2 py-0.5 rounded-full">
                        <Sun className="w-2.5 h-2.5" />Solar: ON
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* AI Recommendation */}
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
                className="bg-white/72 dark:bg-slate-900/35 border border-slate-200/65 dark:border-slate-800/45 p-4 rounded-[22px] shadow-sm backdrop-blur-md flex items-center gap-4">
                <div className="text-left space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 border border-violet-200/60 dark:border-violet-700/40">
                      <Brain className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                      <span className="text-[9px] font-extrabold text-violet-700 dark:text-violet-400 uppercase tracking-wider">AI Recommendation</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                    Usage is higher than usual. Suggest AC to{" "}
                    <span className="font-black text-blue-600 dark:text-emerald-400 bg-blue-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-md">24°C</span>
                    {" — "}save up to{" "}
                    <span className="font-black text-slate-900 dark:text-white">₹120</span> today.
                  </p>
                  <div className="flex items-center gap-2">
                    <button type="button"
                      className="text-[10px] font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-emerald-500 dark:to-cyan-500 px-3.5 py-1.5 rounded-lg shadow-md shadow-blue-500/20 hover:opacity-90 hover:shadow-lg transition-all cursor-pointer">
                      ⚡ Optimize Now
                    </button>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">Confidence: 94%</span>
                  </div>
                </div>
                {/* Robot */}
                <div className="w-20 h-20 shrink-0 overflow-visible">
                  <svg viewBox="0 0 100 120" className="w-20 h-24 overflow-visible">
                    <defs>
                      <linearGradient id="rh2" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#E2E8F0" />
                      </linearGradient>
                      <linearGradient id="rb2" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#CBD5E1" />
                      </linearGradient>
                      <linearGradient id="rs2" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#1E293B" /><stop offset="100%" stopColor="#0F172A" />
                      </linearGradient>
                      <filter id="rg2"><feGaussianBlur stdDeviation="2" result="b" /><feComposite in="SourceGraphic" in2="b" operator="over" /></filter>
                    </defs>
                    <style>{`
                      .rf2{animation:rfloat2 4s ease-in-out infinite}
                      .rsh2{animation:rshadow2 4s ease-in-out infinite;transform-origin:50px 115px}
                      .rbl2{animation:rblink2 5s ease-in-out infinite;transform-origin:50% 27px}
                      .ral2{animation:rarm2 4s ease-in-out infinite;transform-origin:22px 55px}
                      .rar2{animation:rarmr2 4s ease-in-out infinite;transform-origin:78px 55px}
                      @keyframes rfloat2{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
                      @keyframes rshadow2{0%,100%{transform:scale(1);opacity:.15}50%{transform:scale(.7);opacity:.08}}
                      @keyframes rblink2{0%,96%,100%{transform:scaleY(1)}98%{transform:scaleY(.1)}}
                      @keyframes rarm2{0%,100%{transform:rotate(0deg)}50%{transform:rotate(4deg)}}
                      @keyframes rarmr2{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-4deg)}}
                    `}</style>
                    <ellipse cx="50" cy="115" rx="20" ry="3" fill="#000" className="rsh2" />
                    <g className="rf2">
                      <rect x="8" y="24" width="10" height="20" rx="5" fill="#E2E8F0" />
                      <rect x="82" y="24" width="10" height="20" rx="5" fill="#E2E8F0" />
                      <path d="M 20 54 C 10 65,8 85,14 92 C 20 98,25 85,23 65 Z" fill="#CBD5E1" className="ral2" />
                      <path d="M 80 54 C 90 65,92 85,86 92 C 80 98,75 85,77 65 Z" fill="#CBD5E1" className="rar2" />
                      <path d="M 30 50 C 30 45,70 45,70 50 C 70 65,75 100,50 100 C 25 100,30 65,30 50 Z" fill="url(#rb2)" />
                      <rect x="42" y="40" width="16" height="8" rx="3" fill="#94A3B8" />
                      <rect x="15" y="10" width="70" height="42" rx="20" fill="url(#rh2)" stroke="#E2E8F0" strokeWidth="1" />
                      <rect x="21" y="15" width="58" height="30" rx="14" fill="url(#rs2)" />
                      <g filter="url(#rg2)">
                        <ellipse cx="38" cy="27" rx="6" ry="5" fill="#22D3EE" className="rbl2" />
                        <ellipse cx="62" cy="27" rx="6" ry="5" fill="#22D3EE" className="rbl2" />
                        <path d="M 45 34 Q 50 39 55 34" fill="none" stroke="#22D3EE" strokeWidth="3" strokeLinecap="round" />
                      </g>
                    </g>
                  </svg>
                </div>
              </motion.div>

              {/* Stats row – colored gradient cards */}
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.30 }}
                className="grid grid-cols-3 gap-3">
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 p-3.5 rounded-[20px] text-left flex flex-col justify-between h-[90px] shadow-lg shadow-blue-500/20 cursor-default">
                  <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10 blur-lg" />
                  <span className="text-[8px] font-extrabold text-blue-100 uppercase tracking-wider">Est Savings</span>
                  <div>
                    <p className="text-[17px] font-black text-white leading-none">₹1,250<span className="text-[9px] font-bold text-blue-200">/mo</span></p>
                    <span className="text-[8px] text-blue-200 font-bold block mt-1">▲ +14% vs last mo</span>
                  </div>
                </div>
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 p-3.5 rounded-[20px] text-left flex flex-col justify-between h-[90px] shadow-lg shadow-emerald-500/20 cursor-default">
                  <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10 blur-lg" />
                  <span className="text-[8px] font-extrabold text-emerald-100 uppercase tracking-wider">Carbon Reduc.</span>
                  <div>
                    <p className="text-[17px] font-black text-white leading-none">28%</p>
                    <span className="text-[8px] text-emerald-200 font-bold block mt-1">🌱 142 kg CO₂ saved</span>
                  </div>
                </div>
                <div className="bg-white/72 dark:bg-slate-900/35 border border-slate-200/65 dark:border-slate-800/50 p-3 rounded-[20px] flex items-center justify-between h-[90px] gap-2 cursor-default">
                  <div>
                    <span className="text-[8px] font-extrabold text-slate-600 dark:text-slate-450 uppercase tracking-wider block">Efficiency</span>
                    <p className="text-[12px] font-black text-slate-800 dark:text-slate-200 mt-1">Excellent</p>
                  </div>
                  <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" stroke="currentColor" strokeWidth="3.5" fill="none" className="text-slate-200 dark:text-slate-800" />
                      <circle cx="18" cy="18" r="15" stroke="currentColor" strokeWidth="3.5" fill="none"
                        strokeDasharray={2 * Math.PI * 15} strokeDashoffset={2 * Math.PI * 15 * 0.08}
                        strokeLinecap="round" className="text-emerald-500 drop-shadow-[0_0_4px_rgba(16,185,129,0.7)]" />
                    </svg>
                    <span className="absolute text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">92%</span>
                  </div>
                </div>
              </motion.div>

              {/* Bottom row */}
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
                className="grid grid-cols-2 gap-3">
                {/* Top Appliances */}
                <div className="bg-white/72 dark:bg-slate-900/35 border border-slate-200/65 dark:border-slate-800/45 p-3.5 rounded-[22px] text-left flex flex-col h-[150px] backdrop-blur-md">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Wifi className="w-3 h-3 text-blue-500 dark:text-cyan-400" />
                    <span className="text-[8px] font-extrabold text-slate-600 dark:text-slate-450 uppercase tracking-wider">Top Appliances</span>
                  </div>
                  <div className="space-y-2 flex-1 flex flex-col justify-center">
                    {[
                      { name: "Air Conditioner", kwh: "5.6 kWh", pct: 75 },
                      { name: "Refrigerator",    kwh: "2.1 kWh", pct: 40 },
                      { name: "Washing Machine", kwh: "1.3 kWh", pct: 25 },
                    ].map((app, i) => (
                      <div key={i} className="space-y-0.5">
                        <div className="flex justify-between text-[9px] font-bold">
                          <span className="text-slate-700 dark:text-slate-350">{i + 1}. {app.name}</span>
                          <span className="text-slate-900 dark:text-white">{app.kwh}</span>
                        </div>
                        <div className="h-1.5 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${app.pct}%` }}
                            transition={{ delay: 0.5 + i * 0.12, duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ background: isDark ? "linear-gradient(to right,#10b981,#22d3ee)" : "linear-gradient(to right,#2563eb,#06b6d4)" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Status */}
                <div className="bg-white/72 dark:bg-slate-900/35 border border-slate-200/65 dark:border-slate-800/45 p-3.5 rounded-[22px] text-left flex flex-col h-[150px] backdrop-blur-md">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[8px] font-extrabold text-slate-600 dark:text-slate-450 uppercase tracking-wider">Live Status</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-450">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Operational
                      </span>
                      <span className={`flex items-center gap-1 text-[9px] font-bold transition-colors ${solarCharge ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${solarCharge ? "bg-amber-500 animate-ping" : "bg-slate-300"}`} />☀️
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 flex justify-center items-center">
                    <svg viewBox="0 0 100 70" className="w-28 h-20 overflow-visible">
                      <defs>
                        <pattern id="hg2" width="8" height="8" patternUnits="userSpaceOnUse">
                          <path d="M 8 0 L 0 0 0 8" fill="none" stroke={isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"} strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100" height="70" fill="url(#hg2)" />
                      <path d="M 15 45 L 50 33 L 70 43 M 50 33 L 50 13 M 50 13 L 15 25 M 50 13 L 70 23 M 50 13 L 60 3" fill="none" stroke={isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"} strokeWidth="0.8" strokeDasharray="2 2" />
                      {[
                        "M 15 45 L 35 55 L 70 43","M 15 25 L 35 35 L 70 23","M 15 25 L 25 15 L 35 35",
                      ].map((d, i) => <path key={i} d={d} fill="none" stroke={isDark ? "rgba(34,211,238,0.55)" : "rgba(37,99,235,0.55)"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />)}
                      <line x1="15" y1="45" x2="15" y2="25" stroke={isDark ? "rgba(34,211,238,0.55)" : "rgba(37,99,235,0.55)"} strokeWidth="1.2" strokeLinecap="round" />
                      <line x1="35" y1="55" x2="35" y2="35" stroke={isDark ? "rgba(34,211,238,0.55)" : "rgba(37,99,235,0.55)"} strokeWidth="1.2" strokeLinecap="round" />
                      <line x1="70" y1="43" x2="70" y2="23" stroke={isDark ? "rgba(34,211,238,0.55)" : "rgba(37,99,235,0.55)"} strokeWidth="1.2" strokeLinecap="round" />
                      <line x1="25" y1="15" x2="60" y2="3" stroke={isDark ? "rgba(34,211,238,0.55)" : "rgba(37,99,235,0.55)"} strokeWidth="1.2" strokeLinecap="round" />
                      <line x1="60" y1="3" x2="70" y2="23" stroke={isDark ? "rgba(34,211,238,0.55)" : "rgba(37,99,235,0.55)"} strokeWidth="1.2" strokeLinecap="round" />
                      <path d="M 22 48.5 L 28 51.5 L 28 41.5 L 22 38.5 Z" fill="none" stroke={isDark ? "rgba(34,211,238,0.5)" : "rgba(37,99,235,0.5)"} strokeWidth="1" />
                      <path d="M 45 46.5 L 58 42 L 58 34 L 45 38.5 Z" fill="none" stroke={isDark ? "rgba(34,211,238,0.5)" : "rgba(37,99,235,0.5)"} strokeWidth="1" />
                      <line x1="51.5" y1="44.25" x2="51.5" y2="36.25" stroke={isDark ? "rgba(34,211,238,0.3)" : "rgba(37,99,235,0.3)"} strokeWidth="0.8" />
                      <line x1="45" y1="42.5" x2="58" y2="38" stroke={isDark ? "rgba(34,211,238,0.3)" : "rgba(37,99,235,0.3)"} strokeWidth="0.8" />
                      <polygon points="26,16 59,4.5 68,22.5 34,34" fill={solarCharge ? "rgba(245,158,11,0.18)" : "rgba(16,185,129,0.07)"} stroke={solarCharge ? "#f59e0b" : "#10b981"} strokeWidth="1.2" className="transition-colors duration-500" />
                      <line x1="42.5" y1="10.25" x2="51" y2="28.25" stroke={solarCharge ? "rgba(245,158,11,0.65)" : "rgba(16,185,129,0.45)"} strokeWidth="0.8" />
                      <line x1="30" y1="25" x2="63.5" y2="13.5" stroke={solarCharge ? "rgba(245,158,11,0.65)" : "rgba(16,185,129,0.45)"} strokeWidth="0.8" />
                      {solarCharge && (
                        <>
                          <circle r="2" fill="#f59e0b"><animateMotion dur="2.5s" repeatCount="indefinite" path="M 35 55 L 35 35 L 25 15 L 60 3" /></circle>
                          <circle r="1.5" fill="#f59e0b"><animateMotion dur="2.5s" begin="1.25s" repeatCount="indefinite" path="M 35 55 L 35 35 L 25 15 L 60 3" /></circle>
                        </>
                      )}
                      <circle cx="25" cy="15" r="2.5" fill={solarCharge ? "#f59e0b" : "#10b981"} className="animate-ping" style={{ transformOrigin: "25px 15px" }} />
                      <circle cx="25" cy="15" r="1.5" fill={solarCharge ? "#f59e0b" : "#10b981"} />
                    </svg>
                  </div>
                </div>
              </motion.div>

            </div>{/* end right column */}
          </div>{/* end grid */}
        </div>{/* end hero */}

        {/* ══ FOOTER ══ */}
        <div className="mt-7 pt-5 border-t border-slate-200/40 dark:border-slate-800/40 space-y-5 w-full text-left">
          {/* Animated stat counters */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {[
              { to: 10000, suffix: "+",    label: "Households Monitored",  color: "blue"    },
              { to: 95,    suffix: "%",    label: "AI Prediction Accuracy", color: "violet"  },
              { to: 2500,  suffix: " kWh", label: "Energy Saved (K)",       color: "emerald" },
              { to: 5200,  suffix: " T",   label: "CO₂ Reduced",            color: "cyan"    },
            ].map((stat, idx) => (
              <motion.div key={idx}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + idx * 0.08 }}
                className="relative overflow-hidden p-3 rounded-2xl bg-white/65 dark:bg-slate-900/30 border border-slate-200/55 dark:border-slate-800/40 backdrop-blur-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                <div className={`absolute top-0 right-0 w-12 h-12 rounded-full opacity-10 blur-xl ${
                  stat.color === "blue" ? "bg-blue-500" : stat.color === "violet" ? "bg-violet-500" :
                  stat.color === "emerald" ? "bg-emerald-500" : "bg-cyan-500"
                }`} />
                <p className={`text-[18px] font-display font-black leading-none ${
                  stat.color === "blue" ? "text-blue-700 dark:text-blue-400" :
                  stat.color === "violet" ? "text-violet-700 dark:text-violet-400" :
                  stat.color === "emerald" ? "text-emerald-700 dark:text-emerald-400" : "text-cyan-700 dark:text-cyan-400"
                }`}>
                  <Counter to={stat.to} suffix={stat.suffix} />
                </p>
                <p className="text-[8px] font-extrabold text-slate-550 dark:text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Partners */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
              <p className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest shrink-0">Trusted Partner Integration</p>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 opacity-35 dark:opacity-25 grayscale hover:grayscale-0 hover:opacity-65 dark:hover:opacity-55 transition-all duration-500">
              <span className="text-[10px] font-black uppercase tracking-tighter text-slate-900 dark:text-white">TATA POWER</span>
              <span className="text-[11px] font-extrabold lowercase text-slate-900 dark:text-white">adani</span>
              <span className="text-[10px] font-black tracking-wide text-slate-900 dark:text-white">▲ Azure</span>
              <span className="text-[10px] font-black tracking-widest italic text-slate-900 dark:text-white">SIEMENS</span>
              <span className="text-[10px] font-bold tracking-wide text-slate-900 dark:text-white">Schneider <span className="text-emerald-500">Electric</span></span>
            </div>
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] tracking-wide">
            © 2026 EnergyAI · Enterprise-grade Encryption · Secure &amp; Private
          </p>
        </div>
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
                Welcome back 👋
              </h1>
              <p className="text-xs text-slate-550 dark:text-slate-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-bold text-blue-600 dark:text-emerald-455 hover:underline underline-offset-2 transition-colors"
                >
                  Create one free →
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
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-955/30 border border-red-200 dark:border-red-800/50 text-red-655 dark:text-red-400 text-xs text-left"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium leading-snug">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
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
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-emerald-455 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focusedField === "password" ? "text-blue-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-555"}`} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
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
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me Checkbox */}
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    disabled={isSubmitting}
                    className="w-4 h-4 rounded border-slate-350 dark:border-slate-700 text-emerald-500 bg-slate-105/50 dark:bg-slate-950/20 focus:ring-emerald-500/20 cursor-pointer"
                  />
                </div>
                <label htmlFor="remember-me" className="text-sm font-semibold text-slate-500 dark:text-slate-400 select-none cursor-pointer">
                  Keep me signed in
                </label>
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
                    Signing in…
                  </>
                ) : (
                  <>Sign in <ArrowRight className="w-4 h-4" /></>
                )}
              </motion.button>

              {/* OR divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                <span className="text-[9px] font-bold text-slate-405 dark:text-slate-550 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* Google Social Button */}
              <motion.button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950/30 text-sm font-bold text-slate-800 dark:text-slate-300 hover:bg-slate-50/80 dark:hover:bg-slate-850 dark:hover:border-slate-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.1.85-2.22 3.02v2.51h3.58c2.09-1.92 3.29-4.75 3.29-7.38z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.58-2.51c-.99.66-2.26 1.06-3.76 1.06-2.9 0-5.35-1.97-6.22-4.63H2.82v2.59C4.8 21.09 8.16 24 12 24z" />
                  <path fill="#FBBC05" d="M5.78 14.97c-.22-.66-.35-1.37-.35-2.1s.13-1.44.35-2.1V8.18H2.82C2.04 9.73 1.6 11.47 1.6 13.3c0 1.83.44 3.57 1.22 5.12l2.96-2.45z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.96 1.19 15.24 0 12 0 8.16 0 4.8 2.91 2.82 7.02l2.96 2.45c.87-2.66 3.32-4.63 6.22-4.63z" />
                </svg>
                Continue with Google
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
