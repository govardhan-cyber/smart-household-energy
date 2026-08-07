import React from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import ChatBotLogo from './ChatBotLogo';
import ApplianceResultCard from './ApplianceResultCard';
import type { Message } from './types';

interface MessageBubbleProps {
  message: Message;
  index: number;
  isFirstMessage: boolean;
  feedback: 'up' | 'down' | undefined;
  onFeedback: (type: 'up' | 'down') => void;
  formatText: (text: string) => React.ReactNode[];
  showAddForm: boolean;
  onToggleAddForm: () => void;
  onAddToAudit: () => void;
  onViewProduct: () => void;
  userInitial: string;
}

function getRelativeTime(timestamp?: number) {
  if (!timestamp) return null;
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  index,
  isFirstMessage,
  feedback,
  onFeedback,
  formatText,
  showAddForm,
  onToggleAddForm,
  onAddToAudit,
  onViewProduct,
  userInitial
}) => {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: isFirstMessage ? 0.3 : 0 }}
      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
    >
      <div className={`group flex items-end gap-2 max-w-full ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        
        {/* Avatars */}
        {isUser ? (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-blue to-emerald-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-sm">
            {userInitial}
          </div>
        ) : (
          <div className="shrink-0">
            <ChatBotLogo className="w-6 h-6" />
          </div>
        )}

        <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
          <div
            className={`max-w-[88%] px-3.5 py-2.5 text-[13px] leading-relaxed font-medium ${
              isUser
                ? "bg-gradient-to-r from-primary-blue to-emerald-500 dark:from-emerald-500 dark:to-teal-400 text-white dark:text-slate-950 font-bold rounded-2xl rounded-br-none shadow-md"
                : "bg-white/60 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-none border border-white/40 dark:border-slate-800/60 shadow-sm backdrop-blur-md"
            }`}
          >
            {isUser ? message.text : formatText(message.text)}
          </div>
          
          {/* Feedback controls for model messages */}
          {!isUser && index > 0 && (
            <div className="flex items-center gap-1 mt-1 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onFeedback("up")}
                className={`p-1 rounded-lg text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 cursor-pointer ${
                  feedback === "up" ? "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10" : ""
                }`}
                aria-label="Thumbs up"
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onFeedback("down")}
                className={`p-1 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 cursor-pointer ${
                  feedback === "down" ? "text-red-500 dark:text-red-400 bg-red-500/10" : ""
                }`}
                aria-label="Thumbs down"
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Timestamp */}
      {message.timestamp && (
        <div className={`text-[9px] text-slate-400 dark:text-slate-600 font-medium mt-0.5 ${isUser ? "mr-8" : "ml-8"}`}>
          {getRelativeTime(message.timestamp)}
        </div>
      )}

      {/* Appliance Result Card */}
      {message.applianceSpec && (
        <div className={isUser ? "mr-8" : "ml-8 mt-1"}>
          <ApplianceResultCard
            spec={message.applianceSpec}
            showAddForm={showAddForm}
            onToggleAddForm={onToggleAddForm}
            onAddToAudit={onAddToAudit}
            onViewProduct={onViewProduct}
          />
        </div>
      )}
    </motion.div>
  );
};

export default MessageBubble;
