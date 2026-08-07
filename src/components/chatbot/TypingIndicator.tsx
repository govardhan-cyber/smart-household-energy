import React from "react";
import { motion } from "framer-motion";
import ChatBotLogo from "./ChatBotLogo";

const TypingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex justify-start mb-4"
    >
      <div 
        className="flex items-center gap-2 px-3.5 py-2.5 bg-white/35 dark:bg-slate-900/40 rounded-2xl rounded-tl-none border border-white/20 dark:border-slate-800/40 shadow-sm backdrop-blur-md relative overflow-hidden"
      >
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.08) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s infinite linear"
          }}
        />
        <style>
          {`
            @keyframes shimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}
        </style>
        
        <ChatBotLogo className="w-5 h-5 z-10" isHovered={true} />
        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 z-10 tracking-wide">
          Copilot is thinking...
        </span>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;
