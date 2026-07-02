import React from "react";
import { motion } from "framer-motion";

export const EnergyMatrixBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none z-0">
      {/* Soft background glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-3xl" />

      {/* Futuristic SVG radar grid */}
      <svg className="w-full h-full opacity-60 dark:opacity-40" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gridGrad" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="beamGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Concentric grid circles */}
        <circle cx="200" cy="200" r="150" stroke="url(#gridGrad)" strokeWidth="1" strokeDasharray="3 6" />
        <circle cx="200" cy="200" r="110" stroke="url(#gridGrad)" strokeWidth="1.2" />
        <circle cx="200" cy="200" r="70" stroke="url(#gridGrad)" strokeWidth="1" strokeDasharray="6 4" />
        <circle cx="200" cy="200" r="30" stroke="url(#gridGrad)" strokeWidth="1.5" />

        {/* Crosshair lines */}
        <line x1="200" y1="30" x2="200" y2="370" stroke="url(#gridGrad)" strokeWidth="0.8" strokeDasharray="4 8" />
        <line x1="30" y1="200" x2="370" y2="200" stroke="url(#gridGrad)" strokeWidth="0.8" strokeDasharray="4 8" />
        
        {/* Diagonal guides */}
        <line x1="80" y1="80" x2="320" y2="320" stroke="url(#gridGrad)" strokeWidth="0.6" strokeOpacity="0.5" />
        <line x1="80" y1="320" x2="320" y2="80" stroke="url(#gridGrad)" strokeWidth="0.6" strokeOpacity="0.5" />

        {/* Animated Sweep Radar beam */}
        <motion.path
          d="M200 200 L200 50 A150 150 0 0 1 320 120 Z"
          fill="url(#beamGrad)"
          style={{ originX: "200px", originY: "200px" }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
        />

        {/* Floating grid node dots */}
        <circle cx="200" cy="50" r="3.5" fill="#06b6d4" className="animate-pulse" />
        <circle cx="320" cy="120" r="2.5" fill="#10b981" />
        <circle cx="120" cy="280" r="3" fill="#3b82f6" />
        <circle cx="90" cy="150" r="2" fill="#06b6d4" />
      </svg>
      
      {/* Interacting orbit particles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="w-[220px] h-[220px] rounded-full border border-dashed border-cyan-500/10 flex items-center justify-start"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
        </motion.div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
          className="w-[300px] h-[300px] rounded-full border border-dashed border-emerald-500/10 flex items-center justify-start"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
        </motion.div>
      </div>
    </div>
  );
};
