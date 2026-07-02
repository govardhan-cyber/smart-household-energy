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
  BarChart3,
  Lightbulb,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  IndianRupee,
  Leaf,
} from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

/* ── animated counter hook ─────────────────────────── */
function useCountUp(end: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

/* ── floating particle component ───────────────────── */
function Particle({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-primary-green/20 dark:bg-accent-neon/15 pointer-events-none"
      style={{ left: x, top: y, width: size, height: size }}
      animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }}
      transition={{ duration: 4 + delay, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

/* ── stat item with counter ─────────────────────────── */
function StatItem({ label, suffix, prefix, value, sub, color, delay, inView }: {
  label: string; suffix?: string; prefix?: string; value: number;
  sub: string; color: string; delay: number; inView: boolean;
}) {
  const count = useCountUp(value, 1800, inView);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="space-y-1.5 text-center"
    >
      <div className={`text-4xl sm:text-5xl font-display font-extrabold ${color} tabular-nums`}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{label}</div>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[160px] mx-auto">{sub}</p>
    </motion.div>
  );
}

/* ── feature card ────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, description, color, gradient, delay }: {
  icon: React.ElementType; title: string; description: string;
  color: string; gradient: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="relative group p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:shadow-slate-900/50 transition-all duration-300 overflow-hidden text-left cursor-default"
    >
      <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl`} />
      <div className="relative z-10 space-y-4">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
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
    <motion.div
      key={i}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: i * 0.1 }}
      whileHover={{ y: -6 }}
      className="relative flex flex-col justify-between p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-xl dark:hover:shadow-slate-950/60 transition-all duration-300 text-left overflow-hidden group"
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
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{name}</h4>
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
  );
}

/* ════════════════════════════════════════════════════ */
export const Home: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsInView, setStatsInView] = useState(false);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsInView(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const words = ["smarter.", "cheaper.", "greener."];
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setWordIdx(w => (w + 1) % words.length), 2400);
    return () => clearInterval(t);
  }, []);

  const particles = [
    { delay: 0, x: "8%", y: "12%", size: 8 },
    { delay: 0.8, x: "85%", y: "18%", size: 6 },
    { delay: 1.5, x: "15%", y: "72%", size: 10 },
    { delay: 0.3, x: "70%", y: "60%", size: 7 },
    { delay: 2.1, x: "50%", y: "85%", size: 5 },
    { delay: 1.1, x: "92%", y: "45%", size: 9 },
  ];

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
      className="flex-1 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden hero-dot-grid hero-mesh-bg"
    >
      {/* Ambient glow blobs */}
      <motion.div
        style={{ y: heroY }}
        className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10"
      >
        <div className="absolute top-10 left-[5%] w-80 h-80 rounded-full bg-primary-green/6 dark:bg-primary-green/10 blur-[120px]" />
        <div className="absolute top-32 right-[5%] w-[28rem] h-[28rem] rounded-full bg-primary-blue/5 dark:bg-accent-neon/8 blur-[140px]" />
        <div className="absolute bottom-32 left-[35%] w-64 h-64 rounded-full bg-accent-neon/4 dark:bg-primary-green/6 blur-[100px]" />
      </motion.div>

      {/* Floating particles */}
      {particles.map((p, i) => <Particle key={i} {...p} />)}

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">

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
                to="/register"
                className="px-7 py-4 flex items-center justify-center gap-2 text-base font-bold text-white bg-gradient-to-r from-primary-blue to-blue-600 dark:from-primary-green dark:to-emerald-600 dark:text-slate-950 rounded-2xl transition-all shadow-lg shadow-primary-blue/25 dark:shadow-primary-green/20 hover:shadow-xl hover:shadow-primary-blue/30 dark:hover:shadow-primary-green/25"
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

        {/* Right column – Hero Visual Card */}
        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="lg:col-span-5 relative flex justify-center"
        >
          <div className="absolute -inset-6 bg-gradient-to-tr from-primary-blue/12 to-primary-green/12 dark:from-primary-blue/20 dark:to-primary-green/20 rounded-[3rem] blur-3xl -z-10" />

          {/* Glass card */}
          <div className="w-full max-w-sm bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-7 rounded-[2.2rem] border border-slate-200/80 dark:border-slate-700/60 shadow-2xl shadow-slate-900/10 dark:shadow-slate-950/50">

            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">This Month</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-display font-extrabold text-slate-900 dark:text-white">132</span>
                  <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">kWh</span>
                </div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Estimated bill <span className="font-bold text-slate-900 dark:text-white">₹459</span>
                </p>
              </div>
              <motion.span
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 text-xs font-bold text-primary-green border border-green-200 dark:border-green-900/50"
              >
                <TrendingDown className="w-3.5 h-3.5" />
                −18%
              </motion.span>
            </div>

            {/* Animated bar chart */}
            <div className="space-y-5">
              {[
                { label: "AC", value: 72, pct: 70, color: "bg-gradient-to-r from-red-500 to-rose-500", text: "text-red-500", tag: "High", delay: 0.5 },
                { label: "Fridge", value: 36, pct: 45, color: "bg-gradient-to-r from-warning-orange to-amber-500", text: "text-warning-orange", tag: "Medium", delay: 0.7 },
                { label: "Fan", value: 24, pct: 25, color: "bg-gradient-to-r from-primary-green to-emerald-500", text: "text-primary-green", tag: "Low", delay: 0.9 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                    <span className={item.text}>{item.tag} · {item.value} kWh</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      transition={{ duration: 1, delay: item.delay, ease: "easeOut" }}
                      className={`h-full ${item.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Tip */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.4 }}
              className="mt-6 p-3 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-150 dark:border-green-900/40 flex items-start gap-2.5"
            >
              <Lightbulb className="w-4 h-4 text-primary-green flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <span className="font-bold text-slate-800 dark:text-slate-200">Tip:</span> Shift AC to 26°C after 10 pm to drop a billing slab and save <span className="font-bold text-primary-green">₹312/month</span>.
              </p>
            </motion.div>
          </div>

          {/* Floating badge top-right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, type: "spring", stiffness: 260 }}
            className="absolute -top-4 -right-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl px-3 py-2 flex items-center gap-2"
          >
            <IndianRupee className="w-4 h-4 text-primary-green" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">₹459 estimated</span>
          </motion.div>

          {/* Floating badge bottom-left */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, type: "spring", stiffness: 260 }}
            className="absolute -bottom-4 -left-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl px-3 py-2 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-primary-green" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Slab-accurate</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ══ STATISTICS BANNER ═════════════════════════════════ */}
      <section
        ref={statsRef}
        className="relative border-y border-slate-200/60 dark:border-slate-800 py-14 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-100/80 via-white/60 to-slate-100/80 dark:from-slate-900/50 dark:via-slate-900/30 dark:to-slate-900/50 backdrop-blur-sm" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <StatItem inView={statsInView} value={12000} suffix="+" label="Households Analyzed" sub="Across AP, Telangana & Karnataka" color="text-primary-green" delay={0} />
            <div className="relative border-y md:border-y-0 md:border-x border-slate-200/70 dark:border-slate-800 py-8 md:py-0">
              <StatItem inView={statsInView} value={520000} prefix="₹" suffix="+" label="Estimated Savings" sub="From slab optimization across users" color="text-primary-blue dark:text-blue-400" delay={0.12} />
            </div>
            <StatItem inView={statsInView} value={987} suffix="%" label="Billing Accuracy" sub="Verified against actual DISCOM bills" color="text-accent-neon" delay={0.24} />
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-3 mb-14"
          >
            <div className="inline-flex items-center gap-2 text-xs font-bold text-primary-green bg-green-50 dark:bg-green-950/30 border border-green-150 dark:border-green-900/40 px-3 py-1.5 rounded-full">
              <BarChart3 className="w-3.5 h-3.5" />
              Why choose us
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white">
              Everything you need to <br />
              <span className="text-primary-green">cut your bill</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm">
              Precise calculations, smart tips and complete privacy — all in one place.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard icon={LayoutList} title="Real AP Slab Billing" description="Follows LT-I domestic tariff exactly. Estimates match your actual APSPDCL / TSSPDCL bill down to the last rupee." color="bg-primary-blue/10 dark:bg-primary-blue/20 text-primary-blue" gradient="bg-gradient-to-br from-primary-blue/4 to-transparent" delay={0} />
            <FeatureCard icon={Zap} title="Personalized AI Tips" description="We rank your top consumers and surface the single change that saves you the most — specific to your usage pattern." color="bg-primary-green/10 dark:bg-primary-green/20 text-primary-green" gradient="bg-gradient-to-br from-primary-green/4 to-transparent" delay={0.1} />
            <FeatureCard icon={ShieldCheck} title="Private by Default" description="Your data lives in your account, encrypted at rest. No ads, no sharing. Your home energy is yours alone." color="bg-secondary-teal/10 dark:bg-secondary-teal/20 text-secondary-teal" gradient="bg-gradient-to-br from-secondary-teal/4 to-transparent" delay={0.2} />
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
              { number: "1", title: "Select Appliances", desc: "Pick AC, TV, Fridge, Fans, Washing Machine from our pre-defined icons.", border: "border-primary-blue", color: "text-primary-blue", delay: 0 },
              { number: "2", title: "Set Usage Sliders", desc: "Adjust quantity and hours per day. No complex typing needed.", border: "border-primary-green", color: "text-primary-green", delay: 0.12 },
              { number: "3", title: "Analyze Results", desc: "Instantly see estimated bills, appliance splits and personalized savings advice.", border: "border-secondary-teal", color: "text-secondary-teal", delay: 0.24 },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: step.delay }}
                className="flex flex-col items-center space-y-4"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className={`relative w-16 h-16 rounded-2xl border-2 ${step.border} bg-white dark:bg-slate-900 ${step.color} flex items-center justify-center font-display font-extrabold text-2xl shadow-lg`}
                >
                  {step.number}
                </motion.div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">{step.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[200px] leading-relaxed">{step.desc}</p>
              </motion.div>
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
                to="/register"
                className="inline-flex items-center gap-2.5 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-primary-blue to-blue-600 dark:from-primary-green dark:to-emerald-600 dark:text-slate-950 rounded-2xl shadow-xl shadow-primary-blue/20 dark:shadow-primary-green/20 hover:shadow-2xl transition-all"
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
