import React from "react";
import { motion } from "framer-motion";
import type { ChatBotLogoProps } from "./types";

const ChatBotLogo: React.FC<ChatBotLogoProps> = ({ className = "w-10 h-10", isHovered = false }) => {
  return (
    <div className={`relative shrink-0 select-none ${className}`}>
      {/* 3D-like Vector Mascot Container with bob animation */}
      <motion.div
        animate={isHovered ? { scale: 1.12, y: -2 } : { scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="w-full h-full flex items-center justify-center relative z-10"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full filter drop-shadow-[0_8px_20px_rgba(6,182,212,0.22)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* SVG Definitions - Gradients & Glows defined at top to prevent browser lookup failures */}
          <defs>
            <linearGradient id="glassGrad" x1="22" y1="20" x2="78" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="white" stopOpacity="0.16" />
              <stop offset="0.6" stopColor="white" stopOpacity="0.03" />
              <stop offset="1" stopColor="#06B6D4" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="glassBorder" x1="22" y1="20" x2="78" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="white" stopOpacity="0.45" />
              <stop offset="0.5" stopColor="#3B82F6" stopOpacity="0.15" />
              <stop offset="1" stopColor="#10B981" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="porcelainHead" x1="32" y1="30" x2="68" y2="68" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="0.5" stopColor="#F8FAFC" />
              <stop offset="1" stopColor="#E2E8F0" />
            </linearGradient>
            <linearGradient id="porcelainStroke" x1="32" y1="30" x2="68" y2="68" gradientUnits="userSpaceOnUse">
              <stop stopColor="white" stopOpacity="0.6" />
              <stop offset="1" stopColor="#CBD5E1" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="silverMetal" x1="46" y1="65" x2="54" y2="77" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E2E8F0" />
              <stop offset="0.5" stopColor="#94A3B8" />
              <stop offset="1" stopColor="#64748B" />
            </linearGradient>
            <linearGradient id="lightningGrad" x1="47" y1="33" x2="53" y2="43" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F59E0B" />
              <stop offset="0.6" stopColor="#10B981" />
              <stop offset="1" stopColor="#06B6D4" />
            </linearGradient>
            <linearGradient id="energyFlow" x1="33" y1="48" x2="35" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#06B6D4" />
              <stop offset="1" stopColor="#10B981" />
            </linearGradient>
            <radialGradient id="cyanGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="1" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="emeraldGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="1" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Asymmetric Glass Speech Bubble (Background) */}
          <path
            d="M 22 24 
               C 22 16, 78 16, 78 24 
               C 78 32, 78 64, 78 64
               C 78 72, 60 76, 52 76
               C 46 76, 32 88, 28 90
               C 26 91, 25 89, 25 87
               C 25 80, 22 76, 22 72
               Z"
            fill="url(#glassGrad)"
            stroke="url(#glassBorder)"
            strokeWidth="1.5"
          />

          {/* Dual Lighting Glow Highlights (Electric Blue & Emerald Green) */}
          <ellipse cx="32" cy="30" rx="16" ry="12" fill="url(#cyanGlow)" opacity="0.3" />
          <ellipse cx="68" cy="62" rx="16" ry="12" fill="url(#emeraldGlow)" opacity="0.3" />

          {/* Robot Neck */}
          <rect x="46" y="65" width="8" height="12" rx="3.5" fill="url(#silverMetal)" stroke="#94A3B8" strokeWidth="0.5" />
          <line x1="47" y1="71" x2="53" y2="71" stroke="#475569" strokeWidth="1" />

          {/* Robot Head (Glossy Porcelain) */}
          <rect
            x="32"
            y="30"
            width="36"
            height="38"
            rx="12"
            fill="url(#porcelainHead)"
            stroke="url(#porcelainStroke)"
            strokeWidth="1.5"
          />

          {/* Holographic Visor */}
          <rect
            x="36"
            y="40"
            width="28"
            height="18"
            rx="5.5"
            fill="#090F21"
            stroke="#06B6D4"
            strokeWidth="1"
          />

          {/* Glowing Cyan Eyes */}
          <ellipse
            cx="44"
            cy="49"
            rx="2.5"
            ry="2.5"
            fill="#06B6D4"
            className="drop-shadow-[0_0_4px_#06B6D4]"
          />
          <ellipse
            cx="56"
            cy="49"
            rx="2.5"
            ry="2.5"
            fill="#06B6D4"
            className="drop-shadow-[0_0_4px_#06B6D4]"
          />

          {/* Integrated Lightning Bolt Emblem on Forehead */}
          <path
            d="M 51 33 L 47 38 H 51 L 49 43 L 53 37 H 49 L 51 33 Z"
            fill="url(#lightningGrad)"
            className="drop-shadow-[0_0_3px_#10B981]"
          />

          {/* Energy Flow lines (subtle details on sides of head) */}
          <path d="M 35 48 C 35 48, 33 52, 35 56" stroke="url(#energyFlow)" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
          <path d="M 65 48 C 65 48, 67 52, 65 56" stroke="url(#energyFlow)" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />

          {/* Glossy Speech Bubble Highlight Arc (Apple style glass reflection) */}
          <path
            d="M 23.5 24 
               C 23.5 18, 76.5 18, 76.5 24"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.35"
          />

        </svg>
      </motion.div>
    </div>
  );
};

export default ChatBotLogo;
