import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { X, Send, AlertCircle, ThumbsUp, ThumbsDown, ChevronDown, Sparkles, ArrowRight, Table, Trash2, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loadTariffs, type TariffState } from "../utils/tariffService";
import type { EnergyReport } from "../utils/reportsService";
import type { BillRecord } from "../pages/BillAnalyzer";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/config";
import { useNavigate } from "react-router-dom";


interface ChatBotLogoProps {
  className?: string;
  isHovered?: boolean;
}

const ChatBotLogo: React.FC<ChatBotLogoProps> = ({ className = "w-10 h-10", isHovered = false }) => {
  return (
    <div className={`relative shrink-0 select-none ${className}`}>
      {/* 3D-like Vector Mascot Container with bob animation */}
      <motion.div
        animate={isHovered
          ? { scale: 1.15, y: -6, rotate: [0, -2, 2, 0] }
          : { y: [0, -4, 0], rotate: [-0.5, 0.8, -0.5] }
        }
        transition={isHovered
          ? { type: "spring", stiffness: 260, damping: 15 }
          : { repeat: Infinity, duration: 4, ease: "easeInOut" }
        }
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
          <motion.ellipse
            cx="44"
            cy="49"
            rx="2.5"
            ry="2.5"
            fill="#06B6D4"
            animate={isHovered ? { ry: [2.5, 0.5, 2.5] } : { ry: [2.5, 2.5, 0.5, 2.5] }}
            transition={isHovered ? { duration: 0.2, repeat: 1 } : { duration: 4.5, repeat: Infinity, repeatDelay: 3 }}
            className="drop-shadow-[0_0_4px_#06B6D4]"
          />
          <motion.ellipse
            cx="56"
            cy="49"
            rx="2.5"
            ry="2.5"
            fill="#06B6D4"
            animate={isHovered ? { ry: [2.5, 0.5, 2.5] } : { ry: [2.5, 2.5, 0.5, 2.5] }}
            transition={isHovered ? { duration: 0.2, repeat: 1 } : { duration: 4.5, repeat: Infinity, repeatDelay: 3 }}
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

interface Message {
  role: "user" | "model";
  text: string;
}

interface WelcomeDashboardProps {
  user: any;
  onSelectCategory: (prompt: string) => void;
}

const WelcomeDashboard: React.FC<WelcomeDashboardProps> = ({ user, onSelectCategory }) => {
  const schemeName = user?.tariffState === "ap"
    ? "AP Domestic"
    : user?.tariffState === "ts"
    ? "TS Domestic"
    : user?.tariffState === "ka"
    ? "KA Domestic"
    : "AP Domestic";

  const categories = [
    { label: "Tariff Slabs", icon: <Table className="w-3.5 h-3.5 text-cyan-500" />, prompt: "Explain my electricity bill and tariff charge breakdown" },
    { label: "Solar ROI", icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />, prompt: "Should I install solar panels? What size, cost, and payback is recommended?" },
    { label: "Saving Tips", icon: <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />, prompt: "How can I save ₹500 per month on my energy bill?" },
    { label: "Carbon Impact", icon: <Leaf className="w-3.5 h-3.5 text-teal-500" />, prompt: "Detail my household carbon footprint and environmental impact." }
  ];

  return (
    <div className="bg-white/20 dark:bg-slate-950/20 border border-white/20 dark:border-slate-800/40 rounded-2xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-md space-y-3.5 mt-2 max-w-[85%] rounded-tl-none">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Household Profile</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Synced
        </span>
      </div>
      
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="bg-white/35 dark:bg-slate-900/30 p-1.5 rounded-xl border border-white/10 dark:border-slate-800/30 flex flex-col justify-between">
          <span className="text-[8px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider leading-none">Budget Target</span>
          <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 mt-1 leading-none">₹{user?.monthlyBudgetBill || 3000}</span>
        </div>
        <div className="bg-white/35 dark:bg-slate-900/30 p-1.5 rounded-xl border border-white/10 dark:border-slate-800/30 flex flex-col justify-between">
          <span className="text-[8px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider leading-none">Usage Limit</span>
          <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 mt-1 leading-none">{user?.monthlyBudgetUnits || 400} kWh</span>
        </div>
        <div className="bg-white/35 dark:bg-slate-900/30 p-1.5 rounded-xl border border-white/10 dark:border-slate-800/30 flex flex-col justify-between">
          <span className="text-[8px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider leading-none">Tariff Scheme</span>
          <span className="text-[9px] font-black text-slate-800 dark:text-slate-100 mt-1 truncate leading-none">{schemeName}</span>
        </div>
      </div>

      {/* Quick Category Chips */}
      <div className="space-y-1.5 pt-0.5">
        <span className="text-[8px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest block">Quick Inquiries</span>
        <div className="grid grid-cols-2 gap-1.5">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectCategory(cat.prompt)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/30 hover:bg-white/60 dark:bg-slate-900/25 dark:hover:bg-slate-900/55 border border-white/10 dark:border-slate-800/30 rounded-xl text-left cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
            >
              {cat.icon}
              <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary-blue dark:group-hover:text-primary-green transition-colors">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ChatBot: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tariffs, setTariffs] = useState<Record<string, TariffState> | null>(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const [feedback, setFeedback] = useState<Record<number, "up" | "down">>({});
  const [confirmClear, setConfirmClear] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleClear = () => {
    if (confirmClear) {
      const firstName = user?.fullName ? user.fullName.trim().split(/\s+/)[0] : "";
      const nameStr = firstName ? ` ${firstName}` : "";
      const greetingText = `Hi${nameStr}! 👋\n\nHow can I help you optimize your savings today?`;
      setMessages([{ role: "model", text: greetingText }]);
      setFeedback({});
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  };

  useEffect(() => {
    if (confirmClear) {
      const timer = setTimeout(() => setConfirmClear(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmClear]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollBottom = target.scrollHeight - target.clientHeight - target.scrollTop;
    setShowScrollBottom(scrollBottom > 150);
  };

  const scrollContainerToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  const handleFeedback = (idx: number, type: "up" | "down") => {
    setFeedback(prev => {
      const current = prev[idx];
      if (current === type) {
        const next = { ...prev };
        delete next[idx];
        return next;
      }
      return { ...prev, [idx]: type };
    });
  };


  // Load tariffs when chatbot opens
  useEffect(() => {
    if (isOpen) {
      loadTariffs().then(setTariffs).catch(console.error);
    }
  }, [isOpen]);

  // Set greeting on load / when user changes
  useEffect(() => {
    const firstName = user?.fullName ? user.fullName.trim().split(/\s+/)[0] : "";
    const nameStr = firstName ? ` ${firstName}` : "";
    const greetingText = `Hi${nameStr}! 👋\n\nHow can I help you optimize your savings today?`;
    
    setMessages(prev => {
      // Set default greeting if messages is empty or has only the initial guest greeting
      if (
        prev.length === 0 || 
        (prev.length === 1 && prev[0].role === "model" && (prev[0].text.includes("Smart Energy Assistant") || prev[0].text.includes("Ask me anything about your energy usage") || prev[0].text.startsWith("Hi")))
      ) {
        return [{ role: "model", text: greetingText }];
      }
      return prev;
    });
  }, [user]);

  // Listen to bill uploaded events for proactive help
  useEffect(() => {
    const handleBillUploaded = async (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      const record = customEvent.detail;
      if (!record) return;

      // 1. Open the chatbot
      setIsOpen(true);

      // 2. Set loading & display detection steps
      setIsLoading(true);
      setError(null);
      
      // Stage 1: Uploading
      setMessages([{ role: "model", text: "*Uploading...*" }]);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Stage 2: AI Detected checklist
      const detectedMsgText = `AI detected:
✓ Units Consumed: **${record.parsedData.unitsConsumed || 0} kWh**
✓ Tariff Category: **${record.parsedData.tariffCategory || "Domestic"}**
✓ Bill Amount: **₹${record.parsedData.totalAmount || 0}**
✓ Due Date: **${record.parsedData.dueDate || "N/A"}**
✓ Carbon Impact: **${Math.round((record.parsedData.unitsConsumed || 0) * 0.82)} kg CO₂**`;

      setMessages([{ role: "model", text: detectedMsgText }]);

      // Stage 3: Generate Summary
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const proactivePrompt = `The user has uploaded an electricity bill:
- Units Consumed: ${record.parsedData.unitsConsumed} kWh
- Bill Amount: ₹${record.parsedData.totalAmount}
- Tariff Category: ${record.parsedData.tariffCategory}
- Due Date: ${record.parsedData.dueDate}
- Address: ${record.parsedData.address}

Provide a proactive "⚡ AI Summary". Explain why their usage/bill is high or how it compares to standard average baseline (250 kWh). Provide 3 concrete, personalized action items (e.g. AC temperature to 24°C, buy BLDC fans, shift washing machine off-peak) and estimate the monthly savings (e.g. Potential savings: ₹410/month). Keep it brief, conversational, and direct.`;

      try {
        const responseText = await queryGeminiDirect(proactivePrompt);
        setMessages(prev => [...prev, { role: "model", text: responseText }]);
      } catch (err: unknown) {
        console.error("Proactive assistant fail:", err);
        // Fallback to static smart template if Gemini fails
        const baselineDiff = (record.parsedData.unitsConsumed || 0) - 250;
        const baselineCompareText = baselineDiff > 0 
          ? `Your consumption is **${baselineDiff} kWh higher** than the average similar household baseline (250 kWh).` 
          : `Your consumption is **${Math.abs(baselineDiff)} kWh lower** than the average similar household baseline (250 kWh). Excellent!`;
        
        const fallbackSummary = `⚡ **AI Summary**

Your bill is **₹${record.parsedData.totalAmount || 0}** for **${record.parsedData.unitsConsumed || 0} kWh**. ${baselineCompareText}

**Recommended actions:**
1. **Increase AC temperature** to 24°C (Saves ~₹240/mo)
2. **Replace ceiling fans with BLDC** models (Saves ~₹180/mo)
3. **Shift heavy loads** (like washing machine) to off-peak hours (Saves ~₹90/mo)

**Potential savings:** ₹410–510/month`;

        setMessages(prev => [...prev, { role: "model", text: fallbackSummary }]);
      } finally {
        setIsLoading(false);
      }
    };

    window.addEventListener("she_bill_uploaded", handleBillUploaded);
    return () => window.removeEventListener("she_bill_uploaded", handleBillUploaded);
  }, [user, tariffs]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSuggestion = (question: string) => {
    handleSendMessage(question);
  };

  // Reusable helper to query Gemini
  const queryGeminiDirect = async (userPrompt: string): Promise<string> => {
    // 1. Gather context
    let reportsContext = "No energy audit reports found.";
    if (user?.uid) {
      const reportsKey = `she_reports_cache_${user.uid}`;
      const reportsData = localStorage.getItem(reportsKey);
      if (reportsData) {
        try {
          const reports: EnergyReport[] = JSON.parse(reportsData);
          if (reports && reports.length > 0) {
            const report = reports[0];
            reportsContext = `Latest Energy Audit Report (created on ${report.createdAt}):
- Total Monthly Usage: ${report.totalUnits} kWh
- Estimated Monthly Bill: ₹${report.estimatedBill}
- Monthly Savings Potential: ₹${report.savingsPotential}
- Highest Energy Consuming Appliance: ${report.highestConsumer}
- Carbon Footprint: ${report.beforeCo2} kg CO2/month (Can reduce to ${report.afterCo2} kg CO2/month, saving ${report.savedCo2} kg CO2/month, equivalent to ${report.savedTrees} trees/month)
- Appliances configured: ${report.appliances.map((app) => `${app.name} (Qty: ${app.quantity}, Running: ${app.hours} hrs/day, Watts: ${app.watts}W)`).join(", ")}`;
          }
        } catch (e) {
          // ignore
        }
      }
    }

    let solarContext = "No solar calculator data found. The user hasn't run the solar ROI simulation yet.";
    if (user?.uid) {
      const solarKey = `she_solar_cache_${user.uid}`;
      const solarData = localStorage.getItem(solarKey);
      if (solarData) {
        try {
          const solar = JSON.parse(solarData);
          solarContext = `Active Solar Calculator Simulation:
- Recommended System Size: ${solar.recommendedKw} kW
- Estimated Upfront Installation Cost (post-subsidy): ₹${solar.installationCost}
- Estimated Monthly Solar Generation: ${solar.monthlyGeneration} kWh
- Estimated Monthly Utility Bill Savings: ₹${solar.monthlySavings}
- Break-Even Payback Period: ${solar.paybackPeriodVal.toFixed(1)} years
- Solar Panel Count: ${solar.panelsNeeded} modules
- 10-Year Cumulative Net ROI Surplus: ₹${solar.tenYearNetSavings}
- 25-Year Cumulative Net ROI Surplus: ₹${solar.twentyFiveYearNetSavings}
- Simulated Location: ${solar.selectedCity}
- Solar Technology Chosen: ${solar.solarTech}
- Configured Roof Area: ${solar.roofArea} sq ft
- Configured Monthly Grid Bill: ₹${solar.monthlyBillInput}`;
        } catch (e) {
          // ignore
        }
      }
    }

    let billHistoryContext = "No extracted utility bill history logs found.";
    if (user?.uid) {
      const billHistoryKey = `she_bill_history_${user.uid}`;
      const billHistoryData = localStorage.getItem(billHistoryKey);
      if (billHistoryData) {
        try {
          const history: BillRecord[] = JSON.parse(billHistoryData);
          if (history && history.length > 0) {
            billHistoryContext = `Extracted Utility Bill Logs (previously uploaded bills):
` + history.slice(0, 3).map((h, idx) => `- Bill #${idx + 1}: uploaded on ${h.uploadDate}, billing period is ${h.parsedData.billingPeriod}, usage units is ${h.parsedData.unitsConsumed} kWh, bill amount is ₹${h.parsedData.totalAmount}, tariff categories is ${h.parsedData.tariffCategory}, consumer name is ${h.parsedData.consumerName}, service number is ${h.parsedData.serviceNumber}`).join("\n");
          }
        } catch (e) {
          // ignore
        }
      }
    }

    let tariffContext = "";
    if (tariffs) {
      tariffContext = Object.values(tariffs)
        .map((t: TariffState) => {
          const slabsStr = t.slabs.map((s) => `${s.limit}: ${s.rate}`).join(", ");
          const subsidyStr = t.subsidy.value > 0 
            ? `Subsidy: ${t.subsidy.type === 'fixed' ? '₹' : ''}${t.subsidy.value}${t.subsidy.type === 'percentage' ? '%' : ''} (min gross: ₹${t.subsidy.minGross || 0})` 
            : "No subsidy";
          return `- ${t.displayName} Slabs: ${slabsStr}. ${subsidyStr}.`;
        })
        .join("\n    ");
    } else {
      tariffContext = `- Andhra Pradesh (AP Domestic LT-I) Slabs: 0 – 30 units: ₹1.90, 31 – 75 units: ₹3.00, 76 – 125 units: ₹4.50, 126 – 225 units: ₹6.00, 226 – 400 units: ₹8.75, Above 400 units: ₹9.75. Subsidy: ₹184.50 (fixed) (min gross: ₹0).
    - Telangana (TSSPDCL Domestic) Slabs: 0 – 50 units: ₹1.95, 51 – 100 units: ₹3.10, 101 – 200 units: ₹4.80, 201 – 300 units: ₹7.70, 301 – 400 units: ₹9.00, 401 – 800 units: ₹9.50, Above 800 units: ₹10.00. Subsidy: 13% (percentage) (min gross: ₹0).
    - Karnataka (BESCOM Domestic) Slabs: 0 – 50 units: ₹4.15, 51 – 100 units: ₹5.60, 101 – 200 units: ₹7.15, Above 200 units: ₹8.20. Subsidy: 13% (percentage) (min gross: ₹0).`;
    }

    const systemInstruction = `You are the "Smart Household Energy AI Assistant". Your goal is to help users clear their doubts about domestic energy consumption, electricity tariffs/bills, appliance power ratings, carbon footprints, solar ROI investments, and household sustainability.
    
    Active User Environment Details (Automatically Extracted from Current Session):
    - User Profile: Name is ${user?.fullName || "Smart User"}, selected tariff state scheme is ${user?.tariffState || "ap"}, monthly budget bill target is ₹${user?.monthlyBudgetBill || 3000}, monthly units limit target is ${user?.monthlyBudgetUnits || 400} kWh.
    - ${reportsContext}
    - ${solarContext}
    - ${billHistoryContext}
    
    Tariff Slab Reference:
    ${tariffContext}
    - Carbon Footprint: Grid emission factor is 0.82 kg CO2 / kWh. Tree absorption is 1.83 kg CO2 / month.
    
    CRITICAL INSTRUCTIONS FOR RESPONSE STYLE:
    1. You have direct access to the user's home profile, appliances, recent calculations, bill history, and solar ROI data. Answer questions utilizing this data without asking the user to provide it.
    2. Always explicitly reference or state that you have direct access to their active appliance records, uploaded bills, or solar calculation outputs.
    3. Be conversational but extremely direct and brief. Use bullet points or key stats tables where appropriate.
    4. If the user asks "How am I doing?" or "Explain my energy score", calculate and explain their energy score based on their usage (e.g. usage usage vs 250 kWh average baseline, tariff slabs, and appliance runtime).
    5. Keep responses under 4 sentences or a concise list. Use bold formatting like **text** for emphasis.
    6. Always format currency in Rupees (e.g. ₹500) and units in kWh.
    7. You can suggest navigating to specific app pages by outputting action buttons in the format [Action: Page Name|/route] at the end of your response when relevant. For example:
       - To calculate solar: [Action: Solar Calculator|/dashboard?tab=solar]
       - To run home audit: [Action: AI Home Audit|/dashboard?tab=audit]
       - To upload a bill: [Action: Analyze Bill|/BillAnalyzer]
       - To check history: [Action: View Bill History|/history]
       - To check appliance survey: [Action: View Appliance Survey|/survey-data]
       - To modify profile settings: [Action: Edit Settings|/settings]
       - To modify profile: [Action: View Profile|/profile]`;

    const geminiContents = [
      ...messages.slice(1).map(msg => ({
        role: msg.role === "model" ? "model" : "user",
        parts: [{ text: msg.text }]
      })),
      {
        role: "user",
        parts: [{ text: userPrompt }]
      }
    ];

    const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"];
    let lastError: Error | null = null;
    let responseText = "";

    for (const model of modelsToTry) {
      try {
        // Attempt secure proxy first (requires Blaze plan + deployed function)
        if (functions) {
          try {
            const proxy = httpsCallable<unknown, Record<string, unknown>>(functions, "geminiProxy");
            const result = await proxy({
              model,
              contents: geminiContents,
              systemInstruction: { parts: [{ text: systemInstruction }] }
            });
            const data = result.data;
            responseText = (data?.candidates as { content: { parts: { text: string }[] } }[])?.[0]?.content?.parts?.[0]?.text || "";
            if (responseText) break;
            continue; // empty response, try next model via proxy
          } catch {
            // Proxy unavailable (Spark plan / not deployed) — fall through to direct call
          }
        }

        // Direct call fallback (dev mode or Spark plan)
        const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
        if (!geminiKey) throw new Error("No Gemini key available.");
        const chatUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        const response = await fetch(chatUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: geminiContents,
            systemInstruction: { parts: [{ text: systemInstruction }] }
          })
        });
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = await response.json();
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (responseText) break;
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    if (!responseText && lastError) {
      throw lastError;
    }
    return responseText;
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const userMessage: Message = { role: "user", text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    setError(null);

    try {
      const botResponseText = await queryGeminiDirect(textToSend);
      setMessages(prev => [...prev, { role: "model", text: botResponseText }]);
    } catch (err: unknown) {
      console.error(err);
      
      // Fallback answers when offline / missing API key
      const lower = textToSend.toLowerCase();
      let fallbackText = "I'm having trouble connecting to my live AI brain, but I'd love to help you! Feel free to click any of the suggested actions below (like **Explain My Bill**, **Solar Advice**, or **Compare Homes**) or ask about saving energy.";
      
      if (lower.includes("bill") || lower.includes("cost") || lower.includes("charge")) {
        fallbackText = `Based on your profile, your latest bill is computed using state slabs. Enter your appliance audit list or upload a bill to get a detailed tariff slab breakdown.`;
      } else if (lower.includes("save") || lower.includes("reduce")) {
        fallbackText = `Here is how you can save ₹500/month:
1. **Optimize AC**: Set AC temperature to 24°C instead of 18°C (Saves ₹250/mo).
2. **BLDC upgrade**: Replace 3 ceiling fans with BLDC models (Saves ₹120/mo).
3. **Standby loads**: Unplug chargers & TVs when not active (Saves ₹80/mo).`;
      } else if (lower.includes("solar")) {
        fallbackText = `Based on your monthly requirements, we recommend a **3kW Solar Panel installation** (approx. ₹1.5 Lakh cost post-subsidy). This saves about ₹32,000 annually with a payback of **4.8 years**.`;
      } else if (lower.includes("score") || lower.includes("doing")) {
        fallbackText = `Your energy health score is calculated based on appliance efficiency. Switch to 5-star ratings or BLDC fans to improve your score to Excellent!`;
      } else if (lower.includes("carbon") || lower.includes("footprint")) {
        fallbackText = `Each kWh of grid energy produces **0.82 kg of CO₂**. Switching to solar or high-efficiency LED lights can offset significant CO₂ emissions.`;
      } else if (lower.includes("compare") || lower.includes("home") || lower.includes("neighbor") || lower.includes("area")) {
        fallbackText = `Based on your profile, your energy usage is compared against the standard Indian household average baseline (250 kWh). Switching to solar panels or LED lights can help you benchmark below typical consumption in your neighborhood.`;
      }

      setMessages(prev => [...prev, { role: "model", text: fallbackText }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleTriggerChat = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string }>;
      setIsOpen(true);
      if (customEvent.detail?.message) {
        handleSendMessage(customEvent.detail.message);
      }
    };
    window.addEventListener("she_trigger_chat", handleTriggerChat);
    return () => window.removeEventListener("she_trigger_chat", handleTriggerChat);
  }, [handleSendMessage]);

  const suggestions = [
    { label: "Explain My Bill", prompt: "Explain my electricity bill and tariff charge breakdown" },
    { label: "Reduce My Costs", prompt: "How can I save ₹500 per month on my energy bill?" },
    { label: "Energy Score", prompt: "How is my energy score and general performance doing?" },
    { label: "Solar Advice", prompt: "Should I install solar panels? What size, cost, and payback is recommended?" },
    { label: "Carbon Footprint", prompt: "How environmentally friendly is my home? Detail my carbon footprint." },
    { label: "Compare Homes", prompt: "Compare my household energy usage with similar homes in my area." }
  ];

  // Rich Markdown, Table, Alert Callout, and Custom Action Link Parser
  const formatText = (text: string): React.ReactNode[] => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    
    let currentTableRows: string[][] = [];
    let inTable = false;
    
    let currentListItems: { text: string; type: "ordered" | "unordered" }[] = [];
    let inList = false;
    
    const parseInlineStyles = (content: string, keyPrefix: string): React.ReactNode[] => {
      const actualBoldRegex = /\*\*(.*?)\*\*/g;
      const codeRegex = /`(.*?)`/g;
      const actionRegex = /\[Action:\s*([^|\]]+)\s*\|\s*([^\]]+)\]/g;
      
      let segments: { type: "text" | "bold" | "code" | "action"; text: string; route?: string }[] = [
        { type: "text", text: content }
      ];
      
      let changed = true;
      while (changed) {
        changed = false;
        const nextSegments: typeof segments = [];
        for (const seg of segments) {
          if (seg.type === "text") {
            const match = actionRegex.exec(seg.text);
            if (match) {
              const startIdx = match.index;
              const endIdx = actionRegex.lastIndex;
              if (startIdx > 0) {
                nextSegments.push({ type: "text", text: seg.text.substring(0, startIdx) });
              }
              nextSegments.push({ type: "action", text: match[1].trim(), route: match[2].trim() });
              if (endIdx < seg.text.length) {
                nextSegments.push({ type: "text", text: seg.text.substring(endIdx) });
              }
              changed = true;
              actionRegex.lastIndex = 0;
              break;
            } else {
              nextSegments.push(seg);
            }
          } else {
            nextSegments.push(seg);
          }
        }
        segments = nextSegments;
      }
      
      changed = true;
      while (changed) {
        changed = false;
        const nextSegments: typeof segments = [];
        for (const seg of segments) {
          if (seg.type === "text") {
            const match = actualBoldRegex.exec(seg.text);
            if (match) {
              const startIdx = match.index;
              const endIdx = actualBoldRegex.lastIndex;
              if (startIdx > 0) {
                nextSegments.push({ type: "text", text: seg.text.substring(0, startIdx) });
              }
              nextSegments.push({ type: "bold", text: match[1] });
              if (endIdx < seg.text.length) {
                nextSegments.push({ type: "text", text: seg.text.substring(endIdx) });
              }
              changed = true;
              actualBoldRegex.lastIndex = 0;
              break;
            } else {
              nextSegments.push(seg);
            }
          } else {
            nextSegments.push(seg);
          }
        }
        segments = nextSegments;
      }

      changed = true;
      while (changed) {
        changed = false;
        const nextSegments: typeof segments = [];
        for (const seg of segments) {
          if (seg.type === "text") {
            const match = codeRegex.exec(seg.text);
            if (match) {
              const startIdx = match.index;
              const endIdx = codeRegex.lastIndex;
              if (startIdx > 0) {
                nextSegments.push({ type: "text", text: seg.text.substring(0, startIdx) });
              }
              nextSegments.push({ type: "code", text: match[1] });
              if (endIdx < seg.text.length) {
                nextSegments.push({ type: "text", text: seg.text.substring(endIdx) });
              }
              changed = true;
              codeRegex.lastIndex = 0;
              break;
            } else {
              nextSegments.push(seg);
            }
          } else {
            nextSegments.push(seg);
          }
        }
        segments = nextSegments;
      }
      
      return segments.map((seg, sIdx) => {
        const key = `${keyPrefix}-${sIdx}`;
        if (seg.type === "bold") {
          return <strong key={key} className="font-bold text-slate-900 dark:text-white">{seg.text}</strong>;
        }
        if (seg.type === "code") {
          return <code key={key} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50">{seg.text}</code>;
        }
        if (seg.type === "action" && seg.route) {
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate(seg.route!);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-2 bg-gradient-to-r from-primary-blue to-blue-600 dark:from-primary-green dark:to-emerald-500 text-white dark:text-slate-950 font-bold rounded-xl text-[10px] cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-all shadow-sm mr-2"
            >
              <span>{seg.text}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          );
        }
        return seg.text;
      });
    };

    const flushTable = (key: string) => {
      if (currentTableRows.length === 0) return null;
      
      let headers = currentTableRows[0];
      let rows = currentTableRows.slice(1);
      
      if (rows.length > 0 && rows[0].every(cell => /^:?-+:?$/.test(cell.trim()))) {
        rows = rows.slice(1);
      }
      
      const element = (
        <div key={key} className="overflow-x-auto my-3 rounded-xl border border-white/20 dark:border-slate-800/40 shadow-sm bg-white/25 dark:bg-slate-900/25 no-print">
          <table className="w-full text-[10px] border-collapse">
            <thead>
              <tr className="bg-white/20 dark:bg-slate-950/40 border-b border-white/10 dark:border-slate-800/40 text-slate-700 dark:text-slate-300 font-bold">
                {headers.map((cell, cIdx) => (
                  <th key={cIdx} className="px-3 py-2 text-left font-black tracking-wide border-r border-slate-200/30 dark:border-slate-800/30 last:border-r-0">
                    {parseInlineStyles(cell.trim(), `th-${cIdx}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-slate-100 dark:border-slate-900/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 last:border-b-0">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-slate-600 dark:text-slate-350 border-r border-slate-200/30 dark:border-slate-800/30 last:border-r-0 font-medium">
                      {parseInlineStyles(cell.trim(), `td-${rIdx}-${cIdx}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentTableRows = [];
      inTable = false;
      return element;
    };

    const flushList = (key: string) => {
      if (currentListItems.length === 0) return null;
      const ListTag = currentListItems[0].type === "ordered" ? "ol" : "ul";
      const element = (
        <ListTag key={key} className={`my-2.5 pl-5 space-y-1.5 ${ListTag === "ol" ? "list-decimal" : "list-disc"}`}>
          {currentListItems.map((item, idx) => (
            <li key={idx} className="text-slate-750 dark:text-slate-350 font-medium leading-relaxed">
              {parseInlineStyles(item.text, `li-${idx}`)}
            </li>
          ))}
        </ListTag>
      );
      currentListItems = [];
      inList = false;
      return element;
    };

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // 1. Table Row
      if (trimmed.startsWith("|")) {
        if (inList) {
          const listEl = flushList(`list-${i}`);
          if (listEl) elements.push(listEl);
        }
        inTable = true;
        const cells = line.split("|").slice(1, -1);
        currentTableRows.push(cells);
        i++;
        continue;
      } else if (inTable) {
        const tableEl = flushTable(`table-${i}`);
        if (tableEl) elements.push(tableEl);
      }
      
      // 2. List Items
      const unorderedMatch = line.match(/^(\s*)[*+-]\s+(.*)$/);
      const orderedMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
      
      if (unorderedMatch) {
        if (inTable) {
          const tableEl = flushTable(`table-${i}`);
          if (tableEl) elements.push(tableEl);
        }
        inList = true;
        currentListItems.push({ text: unorderedMatch[2], type: "unordered" });
        i++;
        continue;
      } else if (orderedMatch) {
        if (inTable) {
          const tableEl = flushTable(`table-${i}`);
          if (tableEl) elements.push(tableEl);
        }
        inList = true;
        currentListItems.push({ text: orderedMatch[2], type: "ordered" });
        i++;
        continue;
      } else if (inList) {
        const listEl = flushList(`list-${i}`);
        if (listEl) elements.push(listEl);
      }
      
      // 3. Visual Callouts
      const highlightHeaders = [
        { trigger: "⚡", style: "border-cyan-500/30 bg-cyan-500/5 dark:bg-cyan-500/5 dark:border-cyan-500/20 text-cyan-800 dark:text-cyan-400", title: "AI Summary", icon: <Sparkles className="w-4 h-4 text-cyan-500" /> },
        { trigger: "💡", style: "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/5 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400", title: "Recommendations", icon: <ArrowRight className="w-4 h-4 text-emerald-500" /> },
        { trigger: "☀️", style: "border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/5 dark:border-amber-500/20 text-amber-800 dark:text-amber-400", title: "Solar Advisor", icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
        { trigger: "📊", style: "border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/5 dark:border-blue-500/20 text-blue-800 dark:text-blue-400", title: "Usage Insights", icon: <Table className="w-4 h-4 text-blue-500" /> }
      ];
      
      const matchedHighlight = highlightHeaders.find(h => trimmed.startsWith(h.trigger));
      if (matchedHighlight) {
        const headerText = trimmed.replace(new RegExp(`^${matchedHighlight.trigger}\\s*\\*\\*?|\\*\\*?:?`, "g"), "").trim();
        const cardLines: string[] = [];
        let j = i + 1;
        while (j < lines.length) {
          const nextLine = lines[j].trim();
          const isNextHeader = highlightHeaders.some(h => nextLine.startsWith(h.trigger)) || nextLine.startsWith("|");
          if (isNextHeader) break;
          cardLines.push(lines[j]);
          j++;
        }
        
        const cardBodyText = cardLines.join("\n");
        
        elements.push(
          <div key={`callout-${i}`} className={`my-3.5 p-4 border rounded-2xl ${matchedHighlight.style} shadow-sm backdrop-blur-md space-y-1.5`}>
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider border-b border-current/10 pb-1.5 mb-1.5">
              {matchedHighlight.icon}
              <span className="font-display font-black">{headerText || matchedHighlight.title}</span>
            </div>
            <div className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
              {formatText(cardBodyText)}
            </div>
          </div>
        );
        i = j;
        continue;
      }
      
      // 4. Paragraph
      if (trimmed !== "") {
        elements.push(
          <p key={i} className="mt-1.5 leading-relaxed text-slate-755 dark:text-slate-350 font-medium">
            {parseInlineStyles(line, `p-${i}`)}
          </p>
        );
      } else {
        elements.push(<div key={i} className="h-2" />);
      }
      i++;
    }
    
    if (inTable) {
      const tableEl = flushTable(`table-end`);
      if (tableEl) elements.push(tableEl);
    }
    if (inList) {
      const listEl = flushList(`list-end`);
      if (listEl) elements.push(listEl);
    }
    
    return elements;
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        whileHover={{ y: -4, scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="fixed bottom-6 right-6 z-40 no-print"
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          aria-label={isOpen ? "Close Energy AI Chatbot" : "Open Energy AI Chatbot"}
          aria-expanded={isOpen}
          className={isOpen
            ? "w-14 h-14 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/60 backdrop-blur-[12px] flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:scale-110 transition-all cursor-pointer relative z-10 text-slate-800 dark:text-white"
            : "w-16 h-16 bg-transparent border-none flex items-center justify-center cursor-pointer relative z-10 focus:outline-none transition-transform hover:scale-110 duration-200"
          }
        >
          {isOpen ? (
            <X className="w-5.5 h-5.5 relative z-10" />
          ) : (
            <ChatBotLogo className="w-16 h-16" isHovered={isButtonHovered} />
          )}
          {messages.length === 1 && !isOpen && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-neon opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-neon border border-white dark:border-slate-900"></span>
            </span>
          )}
          <span className="absolute right-18 scale-0 group-hover:scale-100 bg-slate-900/90 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-md transition-all duration-200 backdrop-blur-sm">
            ⚡ Chat with Energy AI
          </span>
        </button>
      </motion.div>
 
      {/* Chat Interface Panel (Glassmorphism, 460px x 600px, rounded-3xl [28px]) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 35, scale: 0.96 }}
            role="dialog"
            aria-label="Energy AI Chatbot"
            className="fixed bottom-24 sm:bottom-28 left-4 right-4 sm:left-auto sm:right-6 w-auto sm:w-[460px] h-[550px] sm:h-[600px] max-w-[calc(100%-2rem)] bg-white/25 dark:bg-slate-950/30 backdrop-blur-[35px] border border-white/30 dark:border-white/10 rounded-[28px] shadow-[0_24px_64px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col z-40 text-left no-print transition-all duration-300"
          >
            {/* Top Specular Glass Sheen & Edge Highlight */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none z-20" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none rounded-[28px] z-20" />

            {/* Interactive Ambient Glows */}
            <div className="absolute top-12 left-10 w-44 h-44 rounded-full bg-cyan-500/8 dark:bg-cyan-500/5 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: "8s" }} />
            <div className="absolute bottom-20 right-8 w-40 h-40 rounded-full bg-emerald-500/8 dark:bg-emerald-500/5 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: "12s" }} />
 
            {/* Header */}
            <div className="bg-white/15 dark:bg-slate-955/20 p-4 flex items-center justify-between text-slate-800 dark:text-white border-b border-white/10 dark:border-slate-800/40 backdrop-blur-md relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="relative w-9.5 h-9.5 shrink-0">
                  <ChatBotLogo className="w-full h-full" isHovered={true} />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm tracking-tight bg-gradient-to-r from-primary-blue to-primary-green dark:from-primary-green dark:to-emerald-400 bg-clip-text text-transparent">
                    Energy Assistant
                  </h3>
                  <span className="text-[9px] font-bold text-slate-455 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online & Ready
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear chat session"
                  className="p-1.5 rounded-xl hover:bg-slate-105 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1 relative"
                >
                  <Trash2 className="w-4 h-4" />
                  {confirmClear && (
                    <span className="text-[8px] font-black text-red-500 dark:text-red-400 animate-pulse absolute -bottom-6 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded shadow-sm z-30 whitespace-nowrap">
                      Confirm?
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Chatbot"
                  className="p-1.5 rounded-xl hover:bg-slate-105 dark:hover:bg-slate-850 text-slate-505 dark:text-slate-450 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
 
            {/* Conversation Messages */}
            <div 
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-transparent relative z-10"
              aria-live="polite"
              aria-label="Chat messages history"
            >
              <div className="text-center text-[10px] font-semibold text-slate-400 dark:text-slate-555 uppercase tracking-widest pb-1 border-b border-slate-100 dark:border-slate-850">
                Context-Aware Assistant
              </div>
              
              {messages.map((msg, idx) => (
                <div key={idx} className="space-y-2">
                  <div
                    className={`flex flex-col group ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-primary-blue/85 to-blue-600/85 text-white rounded-tr-none shadow-[0_4px_12px_rgba(37,99,235,0.12)] font-semibold border border-white/10 dark:from-primary-green/80 dark:to-emerald-500/80 dark:text-slate-955 dark:shadow-[0_4px_12px_rgba(16,185,129,0.12)]"
                          : "bg-white/35 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 border border-white/30 dark:border-slate-800/40 rounded-2xl rounded-tl-none backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.03)] font-medium leading-relaxed"
                      }`}
                    >
                      {msg.role === "user" ? msg.text : formatText(msg.text)}
                    </div>
                    
                    {msg.role === "model" && idx > 0 && (
                      <div className="flex items-center gap-1.5 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleFeedback(idx, "up")}
                          className={`p-1 rounded hover:bg-slate-150 dark:hover:bg-slate-800 text-[10px] cursor-pointer transition-colors ${feedback[idx] === "up" ? "text-emerald-500" : "text-slate-400 dark:text-slate-500"}`}
                          aria-label="Thumbs up"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFeedback(idx, "down")}
                          className={`p-1 rounded hover:bg-slate-150 dark:hover:bg-slate-800 text-[10px] cursor-pointer transition-colors ${feedback[idx] === "down" ? "text-red-500" : "text-slate-400 dark:text-slate-500"}`}
                          aria-label="Thumbs down"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {idx === 0 && messages.length === 1 && (
                    <WelcomeDashboard user={user} onSelectCategory={handleSuggestion} />
                  )}
                </div>
              ))}
              
              {/* Typing indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/35 dark:bg-slate-900/40 rounded-2xl rounded-tl-none px-3.5 py-3 border border-white/20 dark:border-slate-800/40 flex items-center gap-1.5 shadow-sm backdrop-blur-md"
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-slate-450 dark:bg-slate-400"
                        animate={{
                          y: ["0px", "-4px", "0px"],
                          opacity: [0.4, 1, 0.4]
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </motion.div>
                </div>
              )}
 
              {error && (
                <div className="flex items-center gap-1.5 text-alert-red text-[11px] font-bold justify-center py-2 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-xl">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
 
            {/* Scroll-to-bottom helper button */}
            <AnimatePresence>
              {showScrollBottom && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={scrollContainerToBottom}
                  className="absolute bottom-36 right-6 z-20 p-2 bg-white/90 dark:bg-slate-900/90 border border-slate-200/50 dark:border-slate-800/60 rounded-full shadow-lg text-slate-700 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center backdrop-blur-md"
                  aria-label="Scroll to bottom"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
 
            {/* Suggested Quick Actions */}
            <div className="px-4 pb-2.5 border-t border-slate-200/30 dark:border-slate-800/30 pt-3.5 bg-transparent relative z-10">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Suggested Quick Actions</span>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestion(sug.prompt)}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/40 dark:bg-slate-900/25 dark:hover:bg-slate-900/55 border border-white/10 dark:border-slate-850/35 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-350 cursor-pointer transition-colors shadow-sm active:scale-95 transition-transform backdrop-blur-sm"
                  >
                    {sug.label}
                  </button>
                ))}
              </div>
            </div>
 
            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="p-3 border-t border-white/15 dark:border-slate-800/30 flex items-center gap-2 bg-transparent z-10"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about bills, tariffs, saving tips..."
                aria-label="Type your message to Energy AI"
                className="flex-1 px-4 py-2.5 bg-white/20 dark:bg-slate-900/25 border border-white/10 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/30 dark:focus:ring-primary-green/30 dark:text-white dark:placeholder-slate-500 backdrop-blur-sm transition-all focus:border-white/30 dark:focus:border-slate-700"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                aria-label="Send message"
                className="p-2.5 rounded-xl bg-primary-blue hover:bg-primary-blue/90 dark:bg-primary-green dark:hover:bg-primary-green/90 text-white dark:text-slate-950 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-sm active:scale-95 transition-transform"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
