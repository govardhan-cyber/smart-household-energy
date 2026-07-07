import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Zap, IndianRupee, ChevronRight, Lightbulb,
  Snowflake, Fan, Tv, Refrigerator, WashingMachine,
  Thermometer, Wind, Droplet, Monitor, Sparkles, ArrowRight,
  TrendingDown, TrendingUp, Sun
} from "lucide-react";
import type { ApplianceItem, TariffResult } from "../../utils/tariffCalculator";
import type { EnergyReport } from "../../utils/reportsService";
import { KpiCard } from "./DashboardHero";
import { LiveGridStatusWidget, CarbonSavingsWidget } from "./SidebarWidgets";
import { PowerFlowPanel } from "./PowerFlowPanel";

// ── Props ─────────────────────────────────────────────────────────────────────
export interface PremiumDashboardProps {
  userName?: string;
  savingsPotential: number;
  totalUnits: number;
  bill: TariffResult;
  activeAppliances: ApplianceItem[];
  reports: EnergyReport[];
  onRunAudit: () => void;
  tariffState?: string;
  momTrend?: { label: string; value: string; trend: "up" | "down" | "neutral"; type: "positive" | "negative" | "neutral" };
  vsAvgTrend?: { label: string; value: string; trend: "up" | "down" | "neutral"; type: "positive" | "negative" | "neutral" };
  solarOffsetPercent?: number;
}

interface Badge {
  label: string;
  type: "positive" | "negative" | "neutral";
  trend: "up" | "down" | "neutral";
  value: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function kwhPerMonth(a: ApplianceItem): number {
  return (a.watts * a.hours * 30 * (a.quantity ?? 1)) / 1000;
}

// ── Appliance icon ─────────────────────────────────────────────────────────────
function AppIcon({ name, cls = "w-6 h-6" }: { name: string; cls?: string }) {
  const n = name.toLowerCase();
  if (n.includes("air") || n.includes(" ac") || n.includes("conditioner")) return <Snowflake className={cls} />;
  if (n.includes("fan")) return <Fan className={cls} />;
  if (n.includes("tv") || n.includes("tele")) return <Tv className={cls} />;
  if (n.includes("fridge") || n.includes("refrig")) return <Refrigerator className={cls} />;
  if (n.includes("wash")) return <WashingMachine className={cls} />;
  if (n.includes("water") || n.includes("geyser") || n.includes("heat")) return <Droplet className={cls} />;
  if (n.includes("light") || n.includes("bulb") || n.includes("led")) return <Lightbulb className={cls} />;
  if (n.includes("monitor") || n.includes("laptop") || n.includes("computer")) return <Monitor className={cls} />;
  if (n.includes("wind") || n.includes("cooler")) return <Wind className={cls} />;
  return <Zap className={cls} />;
}

// ── Color palette ─────────────────────────────────────────────────────────────
const COLORS = [
  { bg: "bg-white/20 dark:bg-slate-900/30 backdrop-blur-md", icon: "text-blue-500 dark:text-blue-400",       bar: "bg-blue-500 dark:bg-blue-550",       border: "border-white/10 dark:border-white/5 hover:border-blue-500/30 dark:hover:border-blue-400/25",       glow: "card-client-blue"    },
  { bg: "bg-white/20 dark:bg-slate-900/30 backdrop-blur-md", icon: "text-emerald-600 dark:text-emerald-400",   bar: "bg-emerald-500 dark:bg-emerald-550", border: "border-white/10 dark:border-white/5 hover:border-emerald-500/30 dark:hover:border-emerald-400/25", glow: "card-client-emerald" },
  { bg: "bg-white/20 dark:bg-slate-900/30 backdrop-blur-md", icon: "text-orange-500 dark:text-orange-400",   bar: "bg-orange-500 dark:bg-orange-550",   border: "border-white/10 dark:border-white/5 hover:border-orange-500/30 dark:hover:border-orange-400/25",   glow: "card-client-amber"   },
  { bg: "bg-white/20 dark:bg-slate-900/30 backdrop-blur-md", icon: "text-purple-500 dark:text-purple-400",   bar: "bg-purple-500 dark:bg-purple-550",   border: "border-white/10 dark:border-white/5 hover:border-purple-500/30 dark:hover:border-purple-400/25",   glow: "card-client-purple"  },
  { bg: "bg-white/20 dark:bg-slate-900/30 backdrop-blur-md", icon: "text-slate-500 dark:text-slate-400",     bar: "bg-slate-400 dark:bg-slate-550",     border: "border-white/10 dark:border-white/5 hover:border-slate-400/30 dark:hover:border-slate-350/25",       glow: "card-client-slate"   },
];

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as any } 
  }
};

const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 24 } },
};

const savingsNumberVariants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { delay: 0.3, type: "spring" as const, stiffness: 220, damping: 18 }
  }
};

const heroBadgeVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.42 + i * 0.09, type: "spring" as const, stiffness: 220, damping: 22 }
  })
};

const biggestConsumerCardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as any, delay: 0.05 }
  }
};

const applianceTileVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.06 }
  })
};

const recommendationsPanelVariants = {
  hidden: { opacity: 0, x: 10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, delay: 0.12 }
  }
};

const recommendationItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.2 + i * 0.08 }
  })
};

const tipStripVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delay: 0.3 }
  }
};

// ── 1. Hero Card ───────────────────────────────────────────────────────────────
function HeroCard({
  userName, savingsPotential, onRunAudit, momTrend, vsAvgTrend,
}: {
  userName?: string;
  savingsPotential: number;
  onRunAudit: () => void;
  momTrend?: PremiumDashboardProps["momTrend"];
  vsAvgTrend?: PremiumDashboardProps["vsAvgTrend"];
}) {
  const hr = new Date().getHours();
  const greeting = hr < 12 ? "Good Morning" : hr < 17 ? "Good Afternoon" : hr < 20 ? "Good Evening" : "Good Night";
  const greetingEmoji = hr < 12 ? "☀️" : hr < 17 ? "🌤️" : hr < 20 ? "🌆" : "🌙";

  const firstName = userName?.split(" ")[0] ?? "User";

  const mom = momTrend ?? { label: "vs last month", value: "8%", trend: "down" as const, type: "positive" as const };
  const avg = vsAvgTrend ?? { label: "vs similar homes", value: "24%", trend: "up" as const, type: "negative" as const };
  const badges = [mom, avg];

  const formattedPotential = savingsPotential.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [wholePart, decimalPart] = formattedPotential.split(".");



  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="relative rounded-3xl overflow-hidden h-[330px] group border border-white/50 dark:border-slate-800/60 shadow-[0_8px_32px_rgba(31,38,135,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all duration-300 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4)] z-0"
      style={{
        boxShadow: `0 8px 32px 0 rgba(31, 38, 135, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.65), inset 0 -1px 0 0 rgba(255, 255, 255, 0.15)`,
      }}
    >
      {/* ── Background radial spotlight ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 35%, rgba(59,130,246,0.06) 0%, transparent 70%)`,
        }}
      />

      {/* ── Diagonal specular gloss reflection ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35] dark:opacity-15 bg-gradient-to-tr from-transparent via-white/10 to-white/25"
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 35%, 0 80%)",
        }}
      />

      {/* ── Shimmer specular highlight strip ── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-blue-400/0 via-blue-300/20 to-blue-400/0 opacity-70" />
      <div
        className="absolute top-0 left-8 right-8 h-[2px] blur-sm opacity-40"
        style={{ background: `linear-gradient(to right, transparent, #3b82f6, transparent)` }}
      />

      {/* ── Ambient corner glows ── */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute -bottom-16 right-1/3 w-56 h-56 bg-amber-300/15 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: "6s" }} />

      {/* Subtle dot-grid texture */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.3) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* ── Full-card background glass pane ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/35 via-slate-50/20 to-blue-50/10 dark:from-slate-900/30 dark:via-slate-950/20 dark:to-indigo-950/15 backdrop-blur-xl z-0" />

      {/* House illustration — covers whole card with a smooth gradient fade to ensure text legibility */}
      <div className="absolute inset-0 w-full overflow-hidden pointer-events-none z-10">
        {/* Smooth gradient mask from left (opaque glass) to right (transparent) */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/30 to-transparent dark:from-slate-950/95 dark:via-slate-950/30 dark:to-transparent z-10" />
        <motion.img
          src="/smart-house.png"
          alt="Smart Home"
          className="absolute right-0 bottom-0 h-full w-auto max-w-none object-contain object-right-bottom transition-transform duration-500 group-hover:scale-105 group-hover:translate-x-1 z-0"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white/20 to-transparent dark:from-slate-955/20 dark:to-transparent z-10" />
      </div>

      {/* ── Left: content panel — always above image ── */}
      <motion.div
        className="relative z-20 h-full flex flex-col justify-between p-7 sm:p-8 w-full sm:max-w-[50%] lg:max-w-[52%]"
        variants={heroContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Top: Greeting */}
        <motion.div variants={heroItemVariants} className="space-y-0.5">
          <p className="text-slate-550 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
            <span>{greetingEmoji}</span>
            <span>{greeting}</span>
          </p>
          <h1 className="text-3xl sm:text-[2rem] font-black tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
              {firstName}
            </span>
            {"  "}
            <motion.span
              animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
              transition={{ duration: 1.6, delay: 0.7, repeat: Infinity, repeatDelay: 4.5, ease: "easeInOut" }}
              style={{ display: "inline-block", transformOrigin: "70% 70%" }}
            >👋</motion.span>
          </h1>
        </motion.div>

        {/* Middle: Savings amount */}
        <motion.div variants={heroItemVariants} className="space-y-1">
          <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">
            Your home could save
          </p>
          <div className="flex items-baseline gap-1">
            <motion.span
              className="text-[2.6rem] sm:text-5xl font-black leading-none bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent tabular-nums"
              variants={savingsNumberVariants}
              initial="hidden"
              animate="visible"
            >
              ₹{wholePart}
              {decimalPart && (
                <span className="text-xl sm:text-2xl font-black align-baseline opacity-80 ml-0.5">.{decimalPart}</span>
              )}
            </motion.span>
            <span className="text-base sm:text-lg font-bold text-slate-400 dark:text-slate-550 leading-none">/mo</span>
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div className="flex flex-wrap gap-2" variants={heroItemVariants}>
          {badges.map((b: Badge, i: number) => {
            let badgeStyle = "bg-white/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 backdrop-blur-sm";
            if (b.type === "positive") {
              badgeStyle = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30 backdrop-blur-md shadow-[0_2px_10px_rgba(16,185,129,0.05)]";
            } else if (b.type === "negative") {
              badgeStyle = "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 dark:border-red-500/30 backdrop-blur-md shadow-[0_2px_10px_rgba(239,68,68,0.05)]";
            } else if (b.type === "neutral") {
              badgeStyle = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/30 backdrop-blur-md shadow-[0_2px_10px_rgba(245,158,11,0.05)]";
            }
            return (
              <motion.span
                key={i}
                custom={i}
                variants={heroBadgeVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.05 }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-black border shadow-sm cursor-default select-none transition-transform duration-200 uppercase tracking-[0.04em] ${badgeStyle}`}
              >
                {b.trend === "down" ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                <span>{b.value} {b.label}</span>
              </motion.span>
            );
          })}
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={heroItemVariants}>
          <motion.button
            whileHover={{
              scale: 1.04,
              boxShadow: "0 12px 28px -6px rgba(37,99,235,0.40), 0 6px 12px -4px rgba(37,99,235,0.25)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={onRunAudit}
            className="relative inline-flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 dark:from-emerald-500 dark:to-teal-600 dark:hover:from-emerald-400 dark:hover:to-teal-500 text-white dark:text-slate-900 text-xs uppercase tracking-widest font-extrabold rounded-2xl shadow-lg cursor-pointer overflow-hidden group/btn transition-all duration-300"
          >
            {/* Shimmer sweep */}
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2.8, ease: "easeInOut" }}
            />
            <Zap className="w-3.5 h-3.5 relative z-10 group-hover/btn:animate-pulse" />
            <span className="relative z-10">Run Energy Audit</span>
            <ArrowRight className="w-3.5 h-3.5 relative z-10 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}


// ── 2. Biggest Consumer Card ───────────────────────────────────────────────────
// ── 2. Biggest Consumer Card ───────────────────────────────────────────────────
function BiggestConsumerCard({ name, pct, savings }: { name: string; pct: number; savings: number }) {
  const roundedPct = Math.round(pct);

  // Appliance-aware color themes
  const getApplianceTheme = (appName: string) => {
    const n = appName.toLowerCase();
    if (n.includes("air") || n.includes(" ac") || n.includes("conditioner")) {
      return {
        outerGlow: "rgba(59,130,246,0.28)",
        outerGlowSoft: "rgba(59,130,246,0.06)",
        text: "text-blue-600 dark:text-blue-400",
        pctText: "text-blue-600 dark:text-blue-400",
        stroke: "#3b82f6",
        strokeGlow: "rgba(59,130,246,0.45)",
        strokeGlow2: "rgba(59,130,246,0.15)",
        trackColor: "rgba(59,130,246,0.08)",
        outerTrack: "rgba(59,130,246,0.04)",
        badge: "bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-400/20 dark:border-blue-500/30",
        cardGlow: "card-client-blue",
        iconShadow: "0 0 20px rgba(59,130,246,0.15)",
        savingsGlow: "rgba(59,130,246,0.08)",
        shimmer: "from-blue-400/0 via-blue-300/20 to-blue-400/0",
      };
    }
    if (n.includes("fan")) {
      return {
        outerGlow: "rgba(16,185,129,0.28)",
        outerGlowSoft: "rgba(16,185,129,0.06)",
        text: "text-emerald-600 dark:text-emerald-400",
        pctText: "text-emerald-600 dark:text-emerald-400",
        stroke: "#10b981",
        strokeGlow: "rgba(16,185,129,0.45)",
        strokeGlow2: "rgba(16,185,129,0.15)",
        trackColor: "rgba(16,185,129,0.08)",
        outerTrack: "rgba(16,185,129,0.04)",
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-400/20 dark:border-emerald-500/30",
        cardGlow: "card-client-emerald",
        iconShadow: "0 0 20px rgba(16,185,129,0.15)",
        savingsGlow: "rgba(16,185,129,0.08)",
        shimmer: "from-emerald-400/0 via-emerald-300/20 to-emerald-400/0",
      };
    }
    if (n.includes("fridge") || n.includes("refrig")) {
      return {
        outerGlow: "rgba(6,182,212,0.28)",
        outerGlowSoft: "rgba(6,182,212,0.06)",
        text: "text-cyan-600 dark:text-cyan-400",
        pctText: "text-cyan-600 dark:text-cyan-400",
        stroke: "#06b6d4",
        strokeGlow: "rgba(6,182,212,0.45)",
        strokeGlow2: "rgba(6,182,212,0.15)",
        trackColor: "rgba(6,182,212,0.08)",
        outerTrack: "rgba(6,182,212,0.04)",
        badge: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-400/20 dark:border-cyan-500/30",
        cardGlow: "card-client-cyan",
        iconShadow: "0 0 20px rgba(6,182,212,0.15)",
        savingsGlow: "rgba(6,182,212,0.08)",
        shimmer: "from-cyan-400/0 via-cyan-300/20 to-cyan-400/0",
      };
    }
    return {
      outerGlow: "rgba(245,158,11,0.28)",
      outerGlowSoft: "rgba(245,158,11,0.06)",
      text: "text-amber-600 dark:text-amber-400",
      pctText: "text-amber-600 dark:text-amber-400",
      stroke: "#f59e0b",
      strokeGlow: "rgba(245,158,11,0.45)",
      strokeGlow2: "rgba(245,158,11,0.15)",
      trackColor: "rgba(245,158,11,0.08)",
      outerTrack: "rgba(245,158,11,0.04)",
      badge: "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-400/20 dark:border-amber-500/30",
      cardGlow: "card-client-amber",
      iconShadow: "0 0 20px rgba(245,158,11,0.15)",
      savingsGlow: "rgba(245,158,11,0.08)",
      shimmer: "from-amber-400/0 via-amber-300/20 to-amber-400/0",
    };
  };

  const theme = getApplianceTheme(name);

  // Dual-ring gauge dimensions
  const size = 120;
  const cx = 60; const cy = 60;
  const outerR = 52; const innerR = 42;
  const strokeW = 5; const innerStrokeW = 7;
  const outerCirc = 2 * Math.PI * outerR;
  const innerCirc = 2 * Math.PI * innerR;
  const innerOffset = innerCirc - (Math.min(100, Math.max(0, roundedPct)) / 100) * innerCirc;

  return (
    <motion.div
      variants={biggestConsumerCardVariants}
      initial="hidden"
      animate="visible"
      className={`relative card-client motion-card ${theme.cardGlow} rounded-3xl h-[330px] overflow-hidden group cursor-default bg-white/35 dark:bg-slate-900/30 border border-white/50 dark:border-white/10 shadow-[0_8px_32px_rgba(31,38,135,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all duration-300 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4)] hover:border-white/60 dark:hover:border-white/20`}
      style={{
        boxShadow: `0 8px 32px 0 rgba(31, 38, 135, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.65), inset 0 -1px 0 0 rgba(255, 255, 255, 0.15)`,
      }}
    >
      {/* ── Background radial spotlight ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 35%, ${theme.outerGlowSoft} 0%, transparent 70%)`,
        }}
      />

      {/* ── Diagonal specular gloss reflection ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35] dark:opacity-15 bg-gradient-to-tr from-transparent via-white/10 to-white/25"
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 35%, 0 80%)",
        }}
      />

      {/* ── Shimmer specular highlight strip ── */}
      <div
        className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${theme.shimmer} opacity-70`}
      />
      <div
        className="absolute top-0 left-8 right-8 h-[2px] blur-sm opacity-40"
        style={{ background: `linear-gradient(to right, transparent, ${theme.stroke}, transparent)` }}
      />

      {/* ── Ambient corner glows ── */}
      <div
        className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none group-hover:opacity-35 transition-opacity duration-700"
        style={{ background: `radial-gradient(circle, ${theme.outerGlow} 0%, transparent 65%)` }}
      />
      <div
        className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full blur-2xl opacity-10 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${theme.outerGlow} 0%, transparent 65%)` }}
      />

      {/* Subtle dot-grid texture */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(148,163,184,0.3) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col h-full px-5 pt-4 pb-4 gap-0">

        {/* TOP CONSUMER badge */}
        <div className="flex justify-center mb-3">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10 shadow-[inset_0_0_12px_rgba(249,115,22,0.05)] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500" />
            </span>
            <Zap className="w-2.5 h-2.5 text-orange-550 dark:text-orange-455" fill="currentColor" />
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-600 dark:text-orange-300">
              Top Consumer
            </span>
          </div>
        </div>

        {/* ── Dual-ring gauge ── */}
        <div className="flex flex-col items-center justify-center flex-1">
          <div
            className="relative flex items-center justify-center"
            style={{ width: size, height: size }}
          >
            {/* Outer soft glow halo */}
            <div
              className="absolute rounded-full pointer-events-none opacity-20 dark:opacity-40 group-hover:opacity-65 transition-opacity duration-600"
              style={{
                inset: -6,
                background: `radial-gradient(circle, ${theme.outerGlow} 0%, transparent 65%)`,
                filter: "blur(6px)",
              }}
            />

            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="absolute inset-0"
              style={{ transform: "rotate(-90deg)" }}
            >
              {/* Outer decorative ring — track */}
              <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={theme.outerTrack} strokeWidth={strokeW} />
              {/* Outer decorative ring — filled ~75%, dashed feel */}
              <circle
                cx={cx} cy={cy} r={outerR}
                fill="none"
                stroke={theme.strokeGlow2}
                strokeWidth={strokeW}
                strokeLinecap="round"
                strokeDasharray={`${outerCirc * 0.75} ${outerCirc}`}
                strokeDashoffset={0}
                style={{ opacity: 0.6 }}
              />

              {/* Inner progress ring — track */}
              <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={theme.trackColor} strokeWidth={innerStrokeW} />
              {/* Inner progress ring — animated */}
              <motion.circle
                cx={cx} cy={cy} r={innerR}
                fill="none"
                stroke={theme.stroke}
                strokeWidth={innerStrokeW}
                strokeLinecap="round"
                strokeDasharray={innerCirc}
                initial={false}
                animate={{ strokeDashoffset: innerOffset }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
                style={{ filter: `drop-shadow(0 0 6px ${theme.strokeGlow})` }}
              />
            </svg>

            {/* Centre: icon + percentage */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-0.5">
              {/* Icon */}
              <div
                className={`flex items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 bg-white/80 dark:bg-slate-900/60 border border-white/60 dark:border-white/10 shadow-sm`}
                style={{
                  width: 38, height: 38,
                  borderColor: theme.strokeGlow2,
                  boxShadow: theme.iconShadow,
                }}
              >
                <div className={theme.text}>
                  <AppIcon name={name} cls="w-5 h-5" />
                </div>
              </div>
              {/* Percentage label */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className={`text-[13px] font-black leading-none ${theme.pctText}`}
                style={{ textShadow: `0 0 10px ${theme.strokeGlow}` }}
              >
                {roundedPct}%
              </motion.span>
            </div>
          </div>

          {/* Appliance name */}
          <div className="text-center mt-3 space-y-1.5">
            <h4 className="font-black text-slate-800 dark:text-white text-[22px] tracking-tight leading-none group-hover:scale-[1.03] transition-transform duration-300 origin-center">
              {name}
            </h4>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border ${theme.badge}`}
              style={{ background: `${theme.outerGlowSoft}` }}
            >
              <span
                className="inline-block w-[28px] h-1 rounded-full overflow-hidden"
                style={{ background: "rgba(0,0,0,0.06) dark:rgba(255,255,255,0.12)" }}
              >
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${roundedPct}%`, background: theme.stroke }}
                />
              </span>
              {roundedPct}% of total usage
            </span>
          </div>
        </div>

        {/* ── Savings footer ── */}
        <div
          className="flex items-center justify-between rounded-2xl px-4 py-3 mt-1 bg-white/30 dark:bg-slate-900/30 border border-white/40 dark:border-white/10 shadow-sm"
          style={{
            boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.4), inset 0 0 20px ${theme.savingsGlow}`,
          }}
        >
          <div className="flex flex-col">
            <span className="text-[8.5px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-555 leading-none mb-1">
              Potential Savings
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className="text-[26px] font-black leading-none"
                style={{
                  background: "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 2px 6px rgba(249,115,22,0.25))",
                }}
              >
                ₹{Math.round(savings).toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">/mo</span>
            </div>
          </div>
          {/* Trend arrow chip */}
          <div className="flex flex-col items-center justify-center rounded-xl px-3 py-2 gap-0.5 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30">
            <ArrowRight
              className="w-3.5 h-3.5 -rotate-45 text-emerald-600 dark:text-emerald-400"
              style={{ filter: "drop-shadow(0 0 4px rgba(34,197,94,0.3))" }}
            />
            <span className="text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wide leading-none">Save</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}


// ── 3. Appliance Breakdown ────────────────────────────────────────────────────
function ApplianceBreakdown({ items }: {
  items: { name: string; pct: number; cost: number; colorIdx: number }[];
}) {
  return (
    <div className="bg-white/40 dark:bg-slate-950/20 backdrop-blur-xl border border-white/20 dark:border-slate-800/40 rounded-2xl shadow-lg p-5 sm:p-6 transition-colors duration-300">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-5">Appliance Usage Breakdown</h3>

      {/* Appliance tiles */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-5">
        {items.map((item, i) => {
          const col = COLORS[item.colorIdx % COLORS.length];
          return (
            <motion.div
              key={item.name}
              custom={i}
              variants={applianceTileVariants}
              initial="hidden"
              animate="visible"
              className={`card-client motion-card ${col.glow} group ${col.bg} ${col.border} border rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-1.5 cursor-default transition-shadow duration-300 text-center w-full h-full`}
            >
              <div className="w-11 h-11 rounded-full bg-white/25 dark:bg-slate-900/40 border border-white/10 dark:border-white/5 flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                <AppIcon name={item.name} cls={`w-5 h-5 sm:w-5.5 sm:h-5.5 ${col.icon}`} />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 leading-none">
                {item.name}
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-0.5 leading-none">
                {Math.round(item.pct)}%
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-none mt-0.5">
                ₹{Math.round(item.cost)}/mo
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Multicolor usage bar */}
      <div className="relative rounded-full overflow-hidden h-3 bg-white/20 dark:bg-slate-900/40 flex gap-px p-[2px] border border-white/10 dark:border-slate-850 shadow-inner">
        {items.map((item) => (
          <div
            key={item.name}
            className={`${COLORS[item.colorIdx % COLORS.length].bar} h-full rounded-full transition-all duration-500 relative overflow-hidden`}
            style={{ width: `${item.pct}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/12 to-transparent pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 4. Power Flow Panel ───────────────────────────────────────────────────────
// @ts-ignore
function PowerFlowPanel_Deprecated({ totalUnits }: { totalUnits: number }) {
  const [gridPower, setGridPower] = useState(0.42);
  const [solarPower, setSolarPower] = useState(0.35);

  useEffect(() => {
    const interval = setInterval(() => {
      setGridPower(prev => {
        const drift = (Math.random() - 0.5) * 0.03;
        return Math.round(Math.min(0.95, Math.max(0.15, prev + drift)) * 100) / 100;
      });
      setSolarPower(prev => {
        const drift = (Math.random() - 0.5) * 0.04;
        return Math.round(Math.min(1.80, Math.max(0.10, prev + drift)) * 100) / 100;
      });
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const totalDemand = Math.round((gridPower + solarPower) * 100) / 100;

  return (
    <div className="relative bg-gradient-to-br from-white/95 via-slate-50/70 to-blue-50/30 dark:from-slate-900/90 dark:via-slate-950/60 dark:to-blue-950/20 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm p-6 hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Decorative Blur Glows */}
      <div className="absolute -left-10 -top-10 w-36 h-36 bg-blue-500/8 dark:bg-blue-600/6 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-indigo-500/8 dark:bg-indigo-600/6 rounded-full blur-2xl pointer-events-none" />
      
      {/* Blueprint Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.015] pointer-events-none bg-[linear-gradient(to_right,rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.1)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="relative z-10 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative flex shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            </div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-tight">Live Household Power Flow</h3>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Grid Active
          </span>
        </div>

        {/* Nodes and Flow Layout */}
        <div className="flex items-center justify-between gap-4 w-full">
          {/* Left Column: Power Sources (Grid & Solar) */}
          <div className="flex flex-col gap-6 shrink-0 z-10">
            {/* Grid Node */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-600/15 border border-blue-500/25 dark:border-blue-500/35 flex items-center justify-center shadow-inner hover:scale-105 transition-transform duration-300">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-500 dark:text-blue-400">
                  <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="5" y1="6" x2="19" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <line x1="12" y1="10" x2="6" y2="6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
                  <line x1="12" y1="10" x2="18" y2="6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
                  <circle cx="5" cy="6" r="2.2" className="fill-blue-500 dark:fill-blue-400 animate-pulse" />
                  <circle cx="19" cy="6" r="2.2" className="fill-blue-500 dark:fill-blue-400 animate-pulse" />
                  <circle cx="3" cy="12" r="2.2" className="fill-blue-500 dark:fill-blue-400 animate-pulse" />
                  <circle cx="21" cy="12" r="2.2" className="fill-blue-500 dark:fill-blue-400 animate-pulse" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Grid Import</p>
                <p className="text-sm font-black text-blue-600 dark:text-blue-400 mt-0.5 tracking-tight font-display">{gridPower.toFixed(2)} kW</p>
              </div>
            </div>

            {/* Solar Node */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-600/15 border border-amber-500/25 dark:border-amber-500/35 flex items-center justify-center shadow-inner hover:scale-105 transition-transform duration-300">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Glowing Sun rays & circle */}
                  <circle cx="17" cy="7" r="3" className="fill-amber-400 dark:fill-amber-300 stroke-amber-500 dark:stroke-amber-400" strokeWidth="1.2" />
                  <line x1="17" y1="2" x2="17" y2="3" className="stroke-amber-500 dark:stroke-amber-400" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="21" y1="3" x2="22" y2="2" className="stroke-amber-500 dark:stroke-amber-400" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="22" y1="7" x2="21" y2="7" className="stroke-amber-500 dark:stroke-amber-400" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="13" y1="11" x2="12" y2="12" className="stroke-amber-500 dark:stroke-amber-400" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
                  
                  {/* Solar Panel grid */}
                  <rect x="3" y="10" width="14" height="11" rx="1.5" transform="rotate(-10 3 10)" className="stroke-emerald-600 dark:stroke-emerald-400 fill-emerald-50/20 dark:fill-emerald-950/20" strokeWidth="1.6" />
                  <line x1="4.5" y1="13.5" x2="17.5" y2="11.2" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="1" opacity="0.8" />
                  <line x1="5.5" y1="18.5" x2="18.5" y2="16.2" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="1" opacity="0.8" />
                  <line x1="11" y1="10.5" x2="13.2" y2="21.5" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="1" opacity="0.8" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Solar Output</p>
                <p className="text-sm font-black text-emerald-600 dark:text-emerald-500 mt-0.5 tracking-tight font-display">{solarPower.toFixed(2)} kW</p>
              </div>
            </div>
          </div>

          {/* Center Column: Animated Curved Flow Paths */}
          <div className="flex-1 h-28 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 80" preserveAspectRatio="none">
              <defs>
                {/* Glow filter */}
                <filter id="glow-pf" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              
              {/* Grid to Home Path */}
              <path
                d="M 0 20 C 50 20, 50 40, 100 40"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.8"
                strokeOpacity="0.15"
              />
              <path
                d="M 0 20 C 50 20, 50 40, 100 40"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="1.5"
                strokeDasharray="4,6"
                strokeOpacity="0.8"
                style={{ animation: "flow-dash 1.2s linear infinite" }}
              />

              {/* Solar to Home Path */}
              <path
                d="M 0 60 C 50 60, 50 40, 100 40"
                fill="none"
                stroke="#10b981"
                strokeWidth="1.8"
                strokeOpacity="0.15"
              />
              <path
                d="M 0 60 C 50 60, 50 40, 100 40"
                fill="none"
                stroke="#34d399"
                strokeWidth="1.5"
                strokeDasharray="4,6"
                strokeOpacity="0.8"
                style={{ animation: "flow-dash 1.2s linear infinite" }}
              />

              {/* Glowing animated particles along paths */}
              <circle r="3.2" fill="#60a5fa" filter="url(#glow-pf)">
                <animateMotion dur="2.4s" repeatCount="indefinite" path="M 0 20 C 50 20, 50 40, 100 40" />
              </circle>
              <circle r="3.2" fill="#60a5fa" filter="url(#glow-pf)">
                <animateMotion dur="2.4s" begin="1.2s" repeatCount="indefinite" path="M 0 20 C 50 20, 50 40, 100 40" />
              </circle>

              <circle r="3.2" fill="#10b981" filter="url(#glow-pf)">
                <animateMotion dur="2.0s" repeatCount="indefinite" path="M 0 60 C 50 60, 50 40, 100 40" />
              </circle>
              <circle r="3.2" fill="#10b981" filter="url(#glow-pf)">
                <animateMotion dur="2.0s" begin="1.0s" repeatCount="indefinite" path="M 0 60 C 50 60, 50 40, 100 40" />
              </circle>
            </svg>
          </div>

          {/* Right Column: Home Destination */}
          <div className="flex items-center gap-3 shrink-0 z-10">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Home Load</p>
              <p className="text-base font-black text-slate-800 dark:text-white mt-0.5 tracking-tight font-display">{totalDemand.toFixed(2)} kW</p>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 leading-none">
                Cum. {Math.round(totalUnits)} kWh
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-600/15 border border-indigo-500/25 dark:border-indigo-500/35 flex flex-col items-center justify-center shadow-inner hover:scale-105 transition-transform duration-300">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* House Body */}
                <rect x="6" y="11" width="12" height="11" rx="1" className="stroke-indigo-500 dark:stroke-indigo-400 fill-indigo-50/40 dark:fill-indigo-950/30" strokeWidth="1.6" />
                {/* Roof */}
                <path d="M4 11L12 4L20 11" className="stroke-indigo-600 dark:stroke-indigo-400" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                {/* Door */}
                <rect x="10" y="16" width="4" height="6" rx="0.5" className="stroke-indigo-500 dark:stroke-indigo-400 fill-indigo-100 dark:fill-indigo-900" strokeWidth="1" />
                {/* Glowing Windows */}
                <rect x="8" y="13" width="2.5" height="2.5" rx="0.5" className="fill-amber-300 dark:fill-amber-400 glowing-window" />
                <rect x="13.5" y="13" width="2.5" height="2.5" rx="0.5" className="fill-amber-300 dark:fill-amber-400 glowing-window" />
                {/* WiFi Waves */}
                <path d="M9 3C10.5 1.8 13.5 1.8 15 3" className="stroke-emerald-500 dark:stroke-emerald-400" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M10.5 5C11.3 4.2 12.7 4.2 13.5 5" className="stroke-emerald-500 dark:stroke-emerald-400" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="12" cy="7" r="1" className="fill-emerald-500 dark:fill-emerald-400" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Inline styles for custom flowing path animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flow-dash {
          to {
            stroke-dashoffset: -20;
          }
        }
      `}} />
    </div>
  );
}

// ── 5. AI Recommendations ─────────────────────────────────────────────────────
function AIRecommendationsPanel({
  recs, totalSavings,
}: {
  recs: { icon: React.ReactNode; title: string; sub: string; saving: number; color: string; bg: string; border?: string; glow: string }[];
  totalSavings: number;
}) {
  const formattedSavings = totalSavings.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [wholePart, decimalPart] = formattedSavings.split(".");

  return (
    <motion.div
      variants={recommendationsPanelVariants}
      initial="hidden"
      animate="visible"
      className="relative bg-white/35 dark:bg-slate-900/30 backdrop-blur-xl border border-white/50 dark:border-slate-800/40 rounded-3xl shadow-[0_8px_32px_rgba(31,38,135,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-5 sm:p-6 flex flex-col gap-4 h-full hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4)] transition-all duration-300 group cursor-default"
      style={{
        boxShadow: `0 8px 32px 0 rgba(31, 38, 135, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.65), inset 0 -1px 0 0 rgba(255, 255, 255, 0.15)`,
      }}
    >
      {/* ── Background radial spotlight ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 35%, rgba(59,130,246,0.04) 0%, transparent 70%)`,
        }}
      />

      {/* ── Diagonal specular gloss reflection ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35] dark:opacity-15 bg-gradient-to-tr from-transparent via-white/10 to-white/25"
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 35%, 0 80%)",
        }}
      />

      {/* ── Shimmer specular highlight strip ── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-blue-400/0 via-blue-300/20 to-blue-400/0 opacity-70" />
      <div
        className="absolute top-0 left-8 right-8 h-[2px] blur-sm opacity-40"
        style={{ background: `linear-gradient(to right, transparent, #3b82f6, transparent)` }}
      />

      {/* Subtle dot-grid texture */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.3) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 dark:bg-slate-900/30 border border-white/10 dark:border-white/5 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">EnergyAI Recommendations</h3>
        </div>
        <Sparkles className="w-4 h-4 text-blue-300 dark:text-blue-500/50" />
      </div>

      {/* Rec rows */}
      <div className="relative z-10 flex-1 space-y-3.5">
        {recs.map((rec, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={recommendationItemVariants}
            initial="hidden"
            animate="visible"
            className={`card-client motion-card ${rec.glow} group bg-white/25 dark:bg-slate-955/15 border border-white/40 dark:border-slate-850/20 p-4 rounded-2xl flex items-center gap-4 cursor-default transition-all duration-300 shadow-sm hover:shadow-md hover:border-white/60 dark:hover:border-slate-700/30`}
          >
            <div className={`w-11 h-11 rounded-2xl ${rec.bg} border ${rec.border || "border-slate-200/40 dark:border-slate-800/40"} flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
              <div className={`${rec.color} transition-transform duration-300 group-hover:scale-110`}>{rec.icon}</div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-bold text-slate-750 dark:text-slate-100 leading-snug group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-200">{rec.title}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{rec.sub}</p>
            </div>
            <div className="text-right shrink-0 flex flex-col justify-center">
              <div className="text-base font-black text-emerald-600 dark:text-emerald-450 font-display leading-none">₹{rec.saving.toLocaleString("en-IN")}</div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider leading-none mt-1">/month</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Total savings box */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative z-10 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/10 dark:to-teal-950/10 rounded-2xl p-4 border border-emerald-500/25 dark:border-emerald-900/25 shadow-sm group-hover:border-emerald-500/40 dark:group-hover:border-emerald-900/40 transition-colors duration-300"
      >
        <p className="text-xs font-black text-emerald-600 dark:text-emerald-450 mb-1.5 uppercase tracking-wider text-[9px]">Total Potential Savings</p>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              ₹{wholePart}
              {decimalPart && (
                <span className="text-base font-black align-baseline opacity-80 ml-0.5">.{decimalPart}</span>
              )}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-555 font-bold uppercase tracking-wider ml-1">/month</span>
          </div>
          <motion.span
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-[1.6rem] cursor-default select-none filter drop-shadow-[0_2px_8px_rgba(16,185,129,0.2)]"
          >
            🌱
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── 6. Tip Strip ──────────────────────────────────────────────────────────────
function TipStrip({ tip }: { tip: string }) {
  return (
    <motion.div
      variants={tipStripVariants}
      initial="hidden"
      animate="visible"
      className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl px-4 sm:px-5 py-3 cursor-default hover:bg-blue-100/60 dark:hover:bg-blue-950/30 transition-colors group"
    >
      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/35 flex items-center justify-center shrink-0">
        <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </div>
      <p className="flex-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
        <span className="font-bold text-blue-700 dark:text-blue-400">Tip for today: </span>
        {tip}
      </p>
      <ChevronRight className="w-4 h-4 text-blue-400 dark:text-blue-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
    </motion.div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export const PremiumDashboard: React.FC<PremiumDashboardProps> = ({
  userName,
  savingsPotential,
  totalUnits,
  bill,
  activeAppliances,
  onRunAudit,
  momTrend,
  vsAvgTrend,
  tariffState,
  solarOffsetPercent,
}) => {
  // ── Compute per-appliance data ──────────────────────────────────────────────
  const applianceData = useMemo(() => {
    if (!activeAppliances.length) return [];
    const totalKwh = activeAppliances.reduce((s, a) => s + kwhPerMonth(a), 0) || 1;
    const ratePerUnit = (bill.netEnergyCharge || 1) / totalKwh;

    const enriched = activeAppliances.map((a, i) => {
      const kwh = kwhPerMonth(a);
      return { name: a.name, kwh, cost: kwh * ratePerUnit, pct: (kwh / totalKwh) * 100, _orig: i };
    });
    enriched.sort((a, b) => b.cost - a.cost);

    const top4 = enriched.slice(0, 4);
    const rest = enriched.slice(4);
    const result: { name: string; pct: number; cost: number; colorIdx: number }[] = top4.map((a, i) => ({
      name: a.name, pct: a.pct, cost: a.cost, colorIdx: i,
    }));

    if (rest.length > 0) {
      result.push({
        name: "Others",
        pct: rest.reduce((s, a) => s + a.pct, 0),
        cost: rest.reduce((s, a) => s + a.cost, 0),
        colorIdx: 4,
      });
    }
    return result;
  }, [activeAppliances, bill.netEnergyCharge]);

  // Biggest consumer (first individual appliance, not Others)
  const biggest = applianceData[0] ?? { name: "Air Conditioner", pct: 0, cost: 0 };
  const biggestSavings = biggest.cost * 0.52;

  // ── AI Recommendations ──────────────────────────────────────────────────────
  const recs = useMemo(() => {
    const has = (k: string) => activeAppliances.some(a => a.name.toLowerCase().includes(k));
    const sp = savingsPotential;
    const list: { icon: React.ReactNode; title: string; sub: string; saving: number; color: string; bg: string; border?: string; glow: string }[] = [];

    if (has("air") || has(" ac") || has("conditioner"))
      list.push({
        icon: <Thermometer className="w-4 h-4" />,
        title: "Set AC temperature to 24°C",
        sub: "Increasing temperature by 6°C can save up to 36% cooling energy.",
        saving: Math.round(sp * 0.36),
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50/60 dark:bg-blue-950/30",
        border: "border-blue-100 dark:border-blue-900/40",
        glow: "card-client-blue"
      });
    if (has("fan"))
      list.push({
        icon: <Wind className="w-4 h-4" />,
        title: "Use BLDC fans instead of normal fans",
        sub: "BLDC fans consume 50% less electricity compared to standard ones.",
        saving: Math.round(sp * 0.18),
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50/60 dark:bg-emerald-950/30",
        border: "border-emerald-100 dark:border-emerald-900/40",
        glow: "card-client-emerald"
      });
    if (has("wash"))
      list.push({
        icon: <WashingMachine className="w-4 h-4" />,
        title: "Run washing machine in eco mode",
        sub: "Reduces water consumption and saves up to 20% electricity.",
        saving: Math.round(sp * 0.08),
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-50/60 dark:bg-purple-950/30",
        border: "border-purple-100 dark:border-purple-900/40",
        glow: "card-client-purple"
      });
    if (list.length < 3 && (has("refrig") || has("fridge")))
      list.push({
        icon: <Refrigerator className="w-4 h-4" />,
        title: "Set refrigerator to optimal 4°C",
        sub: "Maintains food quality while reducing energy use by up to 12%.",
        saving: Math.round(sp * 0.08),
        color: "text-cyan-600 dark:text-cyan-400",
        bg: "bg-cyan-50/60 dark:bg-cyan-950/30",
        border: "border-cyan-100 dark:border-cyan-900/40",
        glow: "card-client-cyan"
      });
    if (list.length < 3 && (has("light") || has("bulb") || has("led")))
      list.push({
        icon: <Lightbulb className="w-4 h-4" />,
        title: "Switch to LED lighting",
        sub: "LEDs use 75% less energy and last significantly longer.",
        saving: Math.round(sp * 0.10),
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50/60 dark:bg-amber-950/30",
        border: "border-amber-100 dark:border-amber-900/40",
        glow: "card-client-amber"
      });
    while (list.length < 3)
      list.push({
        icon: <Zap className="w-4 h-4" />,
        title: "Avoid standby phantom loads",
        sub: "Unplugging standby electronics saves up to 10% phantom draw.",
        saving: Math.round(sp * 0.06),
        color: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-50/60 dark:bg-orange-950/30",
        border: "border-orange-100 dark:border-orange-900/40",
        glow: "card-client-amber"
      });

    return list.slice(0, 3);
  }, [activeAppliances, savingsPotential]);

  // ── Tip of the day ──────────────────────────────────────────────────────────
  const tips = [
    "Unplug devices when not in use. It can save up to ₹30/month.",
    "Use natural light during the day to reduce lighting costs.",
    "Clean your AC filter monthly to maintain peak efficiency.",
    "Set your geyser on a timer to avoid unnecessary heating.",
    "Enable power saver mode on electronics when not actively used.",
  ];
  const tip = tips[new Date().getDate() % tips.length];

  // ── Solar system calculation ───────────────────────────────────────────────
  const kwNeededByUsage = totalUnits / 120;
  const recommendedKw = Math.max(1, Math.round(Math.min(kwNeededByUsage, 3) * 2) / 2);

  // ── Carbon Savings Widget data calculation ─────────────────────────────────
  const estimatedSavedCo2 = Math.round((totalUnits * 0.15) * 0.82 * 10) / 10;
  const estimatedSavedTrees = Math.round((estimatedSavedCo2 / 1.83) * 10) / 10;
  const carbonSavingsData = { savedCo2: estimatedSavedCo2, savedTrees: estimatedSavedTrees };

  return (
    <div className="w-full py-0 space-y-4">
      {/* 3-Column Widescreen Layout Grid */}
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6 items-start relative w-full">
        
        {/* Left Sidebar Column - Sticky */}
        <aside className="hidden 2xl:flex 2xl:col-span-2 flex-col gap-6 sticky top-24 no-print select-none">
          <LiveGridStatusWidget />
        </aside>

        {/* Center Main Content Column */}
        <main className="col-span-1 2xl:col-span-8 space-y-5 w-full">
          {/* Row 1: Hero + Biggest Consumer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-stretch">
            <div className="sm:col-span-2">
              <HeroCard
                userName={userName}
                savingsPotential={savingsPotential}
                onRunAudit={onRunAudit}
                momTrend={momTrend}
                vsAvgTrend={vsAvgTrend}
              />
            </div>
            <div className="sm:col-span-1">
              <BiggestConsumerCard
                name={biggest.name}
                pct={biggest.pct}
                savings={biggestSavings}
              />
            </div>
          </div>

          {/* Row 2: KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 no-print">
            <KpiCard
              title="Monthly Consumption"
              value={totalUnits}
              subtext="Based on active audit configuration"
              icon={<Zap className="w-5 h-5 text-primary-blue dark:text-blue-400" />}
              borderColorClass="border-l-primary-blue"
            />
            <KpiCard
              title="Estimated Bill"
              value={bill.netEnergyCharge}
              subtext={`Calculated using ${(tariffState || "AP").toUpperCase()} rates`}
              icon={<IndianRupee className="w-5 h-5 text-warning-orange" />}
              borderColorClass="border-l-warning-orange"
              isCurrency={true}
            />
            <KpiCard
              title="Potential Savings"
              value={savingsPotential}
              subtext="Apply smart appliance settings"
              icon={<Sparkles className="w-5 h-5 text-primary-green animate-pulse" />}
              borderColorClass="border-l-primary-green"
              isCurrency={true}
            />
            <KpiCard
              title="Solar Offset"
              value={solarOffsetPercent || 0}
              subtext={`With recommended ${recommendedKw} kW system`}
              icon={<Sun className="w-5 h-5 text-amber-500" />}
              borderColorClass="border-l-amber-500"
              isPercent={true}
            />
          </div>

          {/* Row 3: Appliance breakdown + AI Recommendations */}
          {applianceData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left col: Appliance + Power Flow */}
              <div className="lg:col-span-2 space-y-5">
                <ApplianceBreakdown items={applianceData} />
                <PowerFlowPanel totalUnits={totalUnits} activeAppliances={activeAppliances} />
              </div>
              {/* Right col: AI Recommendations */}
              <div className="lg:col-span-1">
                <AIRecommendationsPanel recs={recs} totalSavings={savingsPotential} />
              </div>
            </div>
          )}

          {/* Row 4: Tip strip */}
          <TipStrip tip={tip} />
        </main>

        {/* Right Sidebar Column - Sticky */}
        <aside className="hidden 2xl:flex 2xl:col-span-2 flex-col gap-6 sticky top-24 no-print select-none">
          <CarbonSavingsWidget analysisResult={carbonSavingsData} />
        </aside>

      </div>
    </div>
  );
};
