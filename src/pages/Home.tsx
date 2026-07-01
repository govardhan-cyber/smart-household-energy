import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Cpu,
  LayoutList,
  Star,
  TrendingDown,
  Lightbulb,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  IndianRupee,
  Leaf,
  Sun,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThreeCanvas } from "../components/ThreeCanvas";
import { ThreeDCard } from "../components/ThreeDCard";





/* ── feature card ────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, description, color, gradient, delay }: {
  icon: React.ElementType; title: string; description: string;
  color: string; gradient: string; delay: number;
}) {
  let glowTypeClass = "";
  let innerGlow = "";
  let iconClass = "";

  if (color.includes("red-500")) {
    glowTypeClass = "card-client-red";
    innerGlow = "bg-[radial-gradient(circle_at_30%_30%,rgba(239,68,68,0.15),transparent_65%)]";
    iconClass = "icon-cpu";
  } else if (color.includes("emerald-500")) {
    glowTypeClass = "card-client-emerald";
    innerGlow = "bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.15),transparent_65%)]";
    iconClass = "icon-zap";
  } else if (color.includes("amber-500")) {
    glowTypeClass = "card-client-amber";
    innerGlow = "bg-[radial-gradient(circle_at_30%_30%,rgba(245,158,11,0.15),transparent_65%)]";
    iconClass = "icon-sun";
  } else if (color.includes("blue-500")) {
    glowTypeClass = "card-client-blue";
    innerGlow = "bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.15),transparent_65%)]";
    iconClass = "icon-list";
  } else if (color.includes("purple-500")) {
    glowTypeClass = "card-client-purple";
    innerGlow = "bg-[radial-gradient(circle_at_30%_30%,rgba(168,85,247,0.15),transparent_65%)]";
    iconClass = "icon-sparkles";
  } else if (color.includes("cyan-500")) {
    glowTypeClass = "card-client-cyan";
    innerGlow = "bg-[radial-gradient(circle_at_30%_30%,rgba(6,182,212,0.15),transparent_65%)]";
    iconClass = "icon-shield";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`relative group p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm card-client ${glowTypeClass} overflow-hidden text-left cursor-default w-full h-full`}
    >
      <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl`} />
      <div className={`absolute inset-0 ${innerGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl`} />
      <div className="relative z-10 space-y-4">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-sm ${iconClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-550 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

/* ── testimonial card ─────────────────────────────────── */
function TestimonialCard({ name, location, discom, avatar, savings, quote, rating, i }: {
  name: string; location: string; discom: string; avatar: string;
  savings: string; quote: string; rating: number; i: number;
}) {
  return (
    <ThreeDCard maxTilt={8}>
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: i * 0.1 }}
        className="relative flex flex-col justify-between p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-xl dark:hover:shadow-slate-950/60 transition-all duration-300 text-left overflow-hidden group w-full h-full"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-green/3 to-primary-blue/3 dark:from-primary-green/5 dark:to-accent-neon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10 space-y-4">
          <div className="flex gap-1 text-amber-400">
            {[...Array(rating)].map((_, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0, rotate: -20 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + idx * 0.06, type: "spring", stiffness: 300 }}
              >
                <Star className="w-4 h-4 fill-current" />
              </motion.div>
            ))}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-350 italic leading-relaxed">
            &ldquo;{quote}&rdquo;
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-850">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-green/20 to-primary-blue/20 dark:from-primary-green/30 dark:to-accent-neon/20 text-xs font-bold text-primary-green dark:text-accent-neon flex items-center justify-center border border-primary-green/20 dark:border-accent-neon/20">
            {avatar}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{name}</h4>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Verified User" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{location}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="text-primary-blue dark:text-blue-400 font-semibold">{discom}</span>
            </div>
          </div>
          <div className="ml-auto text-xs font-bold text-primary-green bg-green-50 dark:bg-green-950/30 px-2.5 py-1.5 rounded-full border border-green-150 dark:border-green-900/40 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            {savings}
          </div>
        </div>
      </motion.div>
    </ThreeDCard>
  );
}

/* ════════════════════════════════════════════════════ */
export const Home: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);




  // Interactive Live Estimator Simulator
  const [acHours, setAcHours] = useState(6);
  const [fanHours, setFanHours] = useState(8);

  const acUnits = acHours * 12;
  const fanUnits = fanHours * 3;
  const fridgeUnits = 36;
  const totalUnits = acUnits + fanUnits + fridgeUnits;

  // Calculate AP Slab Billing (official AP LT-I domestic tariff)
  const calculateAPBill = (units: number) => {
    let bill = 0;
    let remaining = units;
    
    // Slab 1: 0 - 30 (rate 1.90)
    const u1 = Math.min(remaining, 30);
    bill += u1 * 1.90;
    remaining -= u1;
    if (remaining <= 0) return bill;
    
    // Slab 2: 31 - 75 (45 units, rate 3.00)
    const u2 = Math.min(remaining, 45);
    bill += u2 * 3.00;
    remaining -= u2;
    if (remaining <= 0) return bill;
    
    // Slab 3: 76 - 125 (50 units, rate 4.50)
    const u3 = Math.min(remaining, 50);
    bill += u3 * 4.50;
    remaining -= u3;
    if (remaining <= 0) return bill;
    
    // Slab 4: 126 - 225 (100 units, rate 6.00)
    const u4 = Math.min(remaining, 100);
    bill += u4 * 6.00;
    remaining -= u4;
    if (remaining <= 0) return bill;
    
    // Slab 5: 226 - 400 (175 units, rate 8.75)
    const u5 = Math.min(remaining, 175);
    bill += u5 * 8.75;
    remaining -= u5;
    if (remaining <= 0) return bill;
    
    // Slab 6: Above 400 (rate 9.75)
    bill += remaining * 9.75;
    return bill;
  };

  const estimatedBill = calculateAPBill(totalUnits);
  const savingsPct = Math.round(((160 - totalUnits) / 160) * 100);

  // Active Slab Name
  let activeSlabName = "Slab: Low (₹1.90/u)";
  if (totalUnits > 400) activeSlabName = "Slab: Super-Peak (₹9.75/u)";
  else if (totalUnits > 225) activeSlabName = "Slab: Peak (₹8.75/u)";
  else if (totalUnits > 125) activeSlabName = "Slab: High (₹6.00/u)";
  else if (totalUnits > 75) activeSlabName = "Slab: Mid (₹4.50/u)";
  else if (totalUnits > 30) activeSlabName = "Slab: Low-Mid (₹3.00/u)";

  // Dynamic Tip based on usage
  let activeTip = "Shift AC to 26°C after 10 pm to drop a billing slab and save ₹312/month.";
  if (acHours > 7) {
    activeTip = "AC runtime is high. Turn to 26°C after 10 pm to save ₹312/mo and drop a slab.";
  } else if (fanHours > 12) {
    activeTip = "Upgrading fans to BLDC models will save ₹240/month at this runtime.";
  } else if (totalUnits > 200) {
    activeTip = "High total load! Shift laundry/EV charging to off-peak hours to avoid ₹8.75 slab.";
  } else {
    activeTip = "Optimal range! Shift heavy usage to solar hours (11am-2pm) to use green energy.";
  }


  const words = ["smarter.", "cheaper.", "greener."];
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setWordIdx(w => (w + 1) % words.length), 2400);
    return () => clearInterval(t);
  }, []);



  const testimonials = [
    {
      name: "Koteswara Rao", location: "Vijayawada, AP", discom: "APSPDCL", avatar: "KR",
      savings: "Saved ₹1,850/mo",
      quote: "Our AC usage was pushing us into the highest slab. By shifting our cooling schedule as advised, we cut our billing category in half!",
      rating: 5,
    },
    {
      name: "Gautami V.", location: "Gachibowli, Hyderabad", discom: "TSSPDCL", avatar: "GV",
      savings: "Saved ₹2,400/mo",
      quote: "The solar ROI calculator convinced us to set up a 3 kW rooftop panel. Payback period was spot on — we now generate a surplus every month.",
      rating: 5,
    },
    {
      name: "Anil Prasad", location: "Indiranagar, Bengaluru", discom: "BESCOM", avatar: "AP",
      savings: "Saved ₹1,200/mo",
      quote: "Didn't realize how much standby power was adding up. The visual breakdown made it obvious. Three new fans paid for themselves in 4 months.",
      rating: 5,
    },
  ];

  return (
    <div
      ref={heroRef}
      className="flex-1 bg-transparent transition-colors duration-300 relative overflow-hidden hero-dot-grid"
    >

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 lg:pt-20 lg:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">

        {/* Left column */}
        <div className="lg:col-span-7 space-y-7 text-left">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 border border-green-200 dark:border-green-900/60 text-xs font-bold text-primary-green shadow-sm"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Cpu className="w-3.5 h-3.5" />
            </motion.div>
            Built for AP DISCOM · LT-I Slab Billing
            <span className="w-1.5 h-1.5 rounded-full bg-primary-green animate-pulse" />
          </motion.div>

          {/* Headline with cycling word */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.08]"
          >
            Make your home energy{" "}
            <span className="relative inline-block">
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIdx}
                  initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
                  transition={{ duration: 0.38 }}
                  className="text-primary-green inline-block"
                >
                  {words[wordIdx]}
                </motion.span>
              </AnimatePresence>
              <motion.span
                className="absolute -bottom-1 left-0 h-[3px] w-full bg-gradient-to-r from-primary-green to-accent-neon rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                style={{ originX: 0 }}
              />
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed"
          >
            Pick your appliances, drag a slider, and get an instant monthly estimate with slab-accurate billing and personalized savings tips — tailored for Andhra Pradesh DISCOMs.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/login"
                className="px-7 py-4 flex items-center justify-center gap-2 text-base font-bold text-white bg-gradient-to-r from-primary-blue to-blue-600 dark:from-primary-green dark:to-emerald-600 dark:text-slate-955 rounded-2xl transition-all shadow-lg shadow-primary-blue/25 dark:shadow-primary-green/20 hover:shadow-xl hover:shadow-primary-blue/30 dark:hover:shadow-primary-green/25"
              >
                <Sparkles className="w-4.5 h-4.5" />
                Create free account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/login"
                className="px-7 py-4 flex items-center justify-center gap-2 text-base font-semibold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 transition-all"
              >
                I already have an account
                <ChevronRight className="w-4 h-4 opacity-60" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {[
                  { label: "AP", bg: "from-primary-green to-emerald-600", text: "text-slate-950" },
                  { label: "GV", bg: "from-primary-blue to-blue-700", text: "text-white" },
                  { label: "KR", bg: "from-accent-neon to-sky-500", text: "text-slate-950" },
                  { label: "+2k", bg: "from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800", text: "text-slate-600 dark:text-slate-300 text-[9px]" },
                ].map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.07 }}
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${a.bg} ${a.text} text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-950 shadow-sm`}
                  >
                    {a.label}
                  </motion.div>
                ))}
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Trusted by <span className="font-bold text-slate-800 dark:text-slate-200">2,000+ households</span> in AP
              </p>
            </div>
            <span className="hidden sm:block w-px h-5 bg-slate-200 dark:bg-slate-800" />

            <div className="flex items-center gap-2 flex-wrap">
              {[
                { icon: ShieldCheck, text: "DISCOM Verified" },
                { icon: Leaf, text: "Eco Focused" },
              ].map(({ icon: Icon, text }, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-2.5 py-1"
                >
                  <Icon className="w-3 h-3 text-primary-green" />
                  {text}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right column – Hero Visual 3D Canvas and Floating Tilt Card */}
        <div className="lg:col-span-5 relative flex flex-col items-center justify-center min-h-[500px]">
          <div className="absolute -inset-6 bg-gradient-to-tr from-primary-blue/12 to-primary-green/12 dark:from-primary-blue/20 dark:to-primary-green/20 rounded-[3rem] blur-3xl -z-10" />

          {/* 3D Canvas Background */}
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden rounded-[2.5rem]">
            <ThreeCanvas />
          </div>

          {/* Dedicated card wrapper that defines the coordinate system for the card and its floating badges */}
          <div className="relative w-full max-w-[480px] z-10 pointer-events-auto mt-6 lg:mt-0">
            
            {/* Floating badge top-right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, type: "spring", stiffness: 260 }}
              className="absolute -top-5 -right-4 bg-white/90 dark:bg-slate-850 border border-slate-200/50 dark:border-slate-700 shadow-xl rounded-2xl px-3.5 py-2 flex items-center gap-2 z-20"
            >
              <IndianRupee className="w-4 h-4 text-primary-green" />
              <span className="text-xs font-bold text-slate-850 dark:text-slate-200">₹{Math.round(estimatedBill)} estimated</span>
            </motion.div>
 
            {/* Floating badge bottom-left */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0, type: "spring", stiffness: 260 }}
              className="absolute -bottom-5 -left-4 bg-white/90 dark:bg-slate-850 border border-slate-200/50 dark:border-slate-700 shadow-xl rounded-2xl px-3.5 py-2 flex items-center gap-2 z-20"
            >
              <CheckCircle2 className="w-4 h-4 text-primary-green animate-pulse" />
              <span className="text-xs font-bold text-slate-850 dark:text-slate-200">{activeSlabName}</span>
            </motion.div>
 
            <ThreeDCard maxTilt={6} className="shadow-2xl shadow-slate-900/10 dark:shadow-slate-950/50">
              <div className="bg-white/60 dark:bg-slate-950/40 backdrop-blur-xl py-12 px-9 rounded-[2.2rem] border border-slate-200/50 dark:border-slate-850/60 select-none">
                <div className="flex items-center justify-between mb-9">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Interactive Simulator</p>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight">{totalUnits}</span>
                      <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">kWh</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-550 dark:text-slate-400 mt-1">
                      Estimated bill <span className="font-extrabold text-slate-900 dark:text-white font-display">₹{Math.round(estimatedBill)}</span>
                    </p>
                  </div>
                  
                  <motion.span
                    key={savingsPct}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border ${
                      savingsPct >= 0
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50"
                        : "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50"
                    }`}
                  >
                    <TrendingDown className={`w-3.5 h-3.5 ${savingsPct < 0 ? "rotate-180" : ""}`} />
                    {savingsPct >= 0 ? `−${savingsPct}%` : `+${Math.abs(savingsPct)}%`}
                  </motion.span>
                </div>

                {/* Animated progress bars with slider overrides */}
                <div className="space-y-7">
                  {/* AC Row */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-slate-600 dark:text-slate-400">AC Runtime</span>
                      <span className={acUnits > 90 ? "text-rose-500" : acUnits > 40 ? "text-warning-orange" : "text-primary-green"}>
                        {acUnits > 90 ? "High" : acUnits > 40 ? "Medium" : "Low"} · {acUnits} kWh
                      </span>
                    </div>
                    <div className="flex items-center mt-1.5">
                      <input 
                        type="range" 
                        min="0" 
                        max="12" 
                        value={acHours} 
                        onChange={(e) => setAcHours(Number(e.target.value))}
                        style={{
                          background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(acHours / 12) * 100}%, var(--slider-track-bg) ${(acHours / 12) * 100}%, var(--slider-track-bg) 100%)`
                        }}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-red-500"
                      />
                    </div>
                  </div>

                  {/* Refrigerator Row (Constant) */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-600 dark:text-slate-400">Refrigerator</span>
                      <span className="text-warning-orange">Medium · {fridgeUnits} kWh</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
                      <div
                        style={{ width: "45%" }}
                        className="h-full bg-gradient-to-r from-warning-orange to-amber-500 rounded-full"
                      />
                    </div>
                    <div className="text-[9px] text-slate-400 dark:text-slate-555 font-bold uppercase tracking-wider text-left pl-1">Constant baseline draw</div>
                  </div>

                  {/* Fans Row */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-slate-600 dark:text-slate-400">Ceiling Fans</span>
                      <span className={fanUnits > 45 ? "text-warning-orange" : "text-primary-green"}>
                        {fanUnits > 45 ? "Medium" : "Low"} · {fanUnits} kWh
                      </span>
                    </div>
                    <div className="flex items-center mt-1.5">
                      <input 
                        type="range" 
                        min="0" 
                        max="24" 
                        value={fanHours} 
                        onChange={(e) => setFanHours(Number(e.target.value))}
                        style={{
                          background: `linear-gradient(to right, #10b981 0%, #10b981 ${(fanHours / 24) * 100}%, var(--slider-track-bg) ${(fanHours / 24) * 100}%, var(--slider-track-bg) 100%)`
                        }}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary-green"
                      />
                    </div>
                  </div>
                </div>

                {/* Dynamic Recommendation Tip */}
                <motion.div
                  key={activeTip}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="mt-9 p-4.5 rounded-2xl bg-emerald-500/[0.04] dark:bg-emerald-500/[0.03] backdrop-blur-md border border-emerald-500/10 dark:border-emerald-500/10 shadow-[0_4px_20px_rgba(16,185,129,0.03)] flex items-start gap-3.5"
                >
                  <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-relaxed text-left pt-0.5">
                    <span className="font-display font-bold text-slate-800 dark:text-slate-200 mr-1.5">AI Suggestion:</span>
                    {activeTip}
                  </p>
                </motion.div>
              </div>
            </ThreeDCard>
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden border-t border-slate-200/50 dark:border-slate-800/30 bg-slate-50/20 dark:bg-transparent">
        {/* Background glow orb */}
        <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 dark:from-emerald-500/15 dark:to-cyan-500/15 rounded-full blur-[100px] -z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center space-y-4 mb-16"
          >
            <div className="inline-flex items-center gap-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 dark:border-emerald-500/30 px-3.5 py-1.5 rounded-full shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Why choose us
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-display font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight">
              Everything you need to <br />
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(16,185,129,0.15)]">
                cut your bill
              </span>
            </h2>
            
            <p className="text-slate-550 dark:text-slate-400 max-w-lg mx-auto text-base leading-relaxed">
              Precise calculations, smart tips and complete privacy — all in one place.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={Cpu} title="Slab Alert System" description="Get alerted before crossing tariff boundaries. Tracks APSPDCL / TSSPDCL domestic slab boundaries." color="bg-red-500/10 dark:bg-red-500/20 text-red-500" gradient="bg-gradient-to-br from-red-500/4 to-transparent" delay={0} />
            <FeatureCard icon={Zap} title="Appliance Profiling" description="Audit AC, refrigerator, lights, and water pumps. Understand decay factors and BEE efficiency savings." color="bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500" gradient="bg-gradient-to-br from-emerald-500/4 to-transparent" delay={0.1} />
            <FeatureCard icon={Sun} title="Solar Net Metering" description="Simulate rooftop solar setup size, calculate amortization paybacks, and evaluate grid net export yields." color="bg-amber-500/10 dark:bg-amber-500/20 text-amber-500" gradient="bg-gradient-to-br from-amber-500/4 to-transparent" delay={0.2} />
            <FeatureCard icon={LayoutList} title="Bill OCR Scans" description="Upload pdf/image bills. Auto-detect units, slab category charges, electricity taxes, and fuel adjustments." color="bg-blue-500/10 dark:bg-blue-500/20 text-blue-500" gradient="bg-gradient-to-br from-blue-500/4 to-transparent" delay={0.3} />
            <FeatureCard icon={Sparkles} title="AI Energy Coach" description="Chat with your AI coach. Evaluates household load profiles, flags standby power loss, and ranks savings steps." color="bg-purple-500/10 dark:bg-purple-500/20 text-purple-500" gradient="bg-gradient-to-br from-purple-500/4 to-transparent" delay={0.4} />
            <FeatureCard icon={ShieldCheck} title="Private By Default" description="Your appliance loads remain secure. No tracking, ads, or data resale. All files encrypted at rest." color="bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-500" gradient="bg-gradient-to-br from-cyan-500/4 to-transparent" delay={0.5} />
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════════════ */}
      <section className="py-20 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-3 mb-14"
          >
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 px-3 py-1.5 rounded-full">
              <Star className="w-3.5 h-3.5 fill-current" />
              5.0 · 2,000+ reviews
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white">
              Real Stories, Verified Savings
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm">
              Homeowners who optimized their slab categories and appliance usage.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {testimonials.map((t, i) => <TestimonialCard key={i} {...t} i={i} />)}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════ */}
      <section className="py-24 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-3 mb-16"
          >
            <div className="inline-flex items-center gap-2 text-xs font-bold text-primary-blue bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 px-3 py-1.5 rounded-full">
              <Zap className="w-3.5 h-3.5" />
              Super simple
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white">
              Simplify your energy decisions
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm">
              No complex engineering — just visual, immediate insights.
            </p>
          </motion.div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="hidden md:block absolute top-8 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-primary-blue via-primary-green to-secondary-teal opacity-30" />
            {[
              { number: "1", title: "Select Appliances", desc: "Pick AC, TV, Fridge, Fans, Washing Machine from our pre-defined icons.", border: "border-primary-blue", color: "text-primary-blue", glow: "hover:shadow-blue-500/20", delay: 0 },
              { number: "2", title: "Set Usage Sliders", desc: "Adjust quantity and hours per day. No complex typing needed.", border: "border-primary-green", color: "text-primary-green", glow: "hover:shadow-emerald-500/20", delay: 0.12 },
              { number: "3", title: "Analyze Results", desc: "Instantly see estimated bills, appliance splits and personalized savings advice.", border: "border-secondary-teal", color: "text-secondary-teal", glow: "hover:shadow-teal-500/20", delay: 0.24 },
            ].map((step, i) => (
              <ThreeDCard key={i} maxTilt={10}>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: step.delay }}
                  className="flex flex-col items-center space-y-4 p-6 bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-sm h-full hover:border-slate-350 dark:hover:border-slate-700 transition-colors duration-300"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className={`relative w-16 h-16 rounded-2xl border-2 ${step.border} bg-slate-50 dark:bg-slate-800 ${step.color} flex items-center justify-center font-display font-extrabold text-2xl shadow-lg transition-all ${step.glow}`}
                  >
                    {step.number}
                  </motion.div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">{step.title}</h4>
                  <p className="text-sm text-slate-550 dark:text-slate-400 max-w-[200px] leading-relaxed">{step.desc}</p>
                </motion.div>
              </ThreeDCard>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pt-14"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
              <Link
                to="/login"
                className="inline-flex items-center gap-2.5 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-primary-blue to-blue-600 dark:from-primary-green dark:to-emerald-600 dark:text-slate-955 rounded-2xl shadow-xl shadow-primary-blue/20 dark:shadow-primary-green/20 hover:shadow-2xl transition-all"
              >
                <Zap className="w-5 h-5" />
                Start Analyzing Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
              Free forever · No credit card · Sign up in 30 seconds
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
