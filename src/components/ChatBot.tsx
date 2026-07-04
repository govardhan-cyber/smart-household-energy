import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { X, Send, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loadTariffs, type TariffState } from "../utils/tariffService";
import chatbotLogo from "../assets/chatbot-logo.png";
import type { EnergyReport } from "../utils/reportsService";
import type { BillRecord } from "../pages/BillAnalyzer";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/config";
interface ChatBotLogoProps {
  className?: string;
  isHovered?: boolean;
}

const ChatBotLogo: React.FC<ChatBotLogoProps> = ({ className = "w-10 h-10", isHovered = false }) => {
  return (
    <div className={`relative shrink-0 select-none rounded-full overflow-hidden ${className}`}>
      {/* Translucent Glassmorphic Background */}
      <div className="absolute inset-0 rounded-full bg-white/15 dark:bg-white/10 backdrop-blur-[6px]" />
      
      {/* Soft Ambient Internal Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/15 via-blue-500/5 to-emerald-500/15 opacity-80" />

      {/* Avatar Image container with bob animation */}
      <motion.div
        animate={isHovered
          ? { scale: 1.1, rotate: [0, -5, 5, 0] }
          : { y: [0, -3, 0], rotate: [0, 1, -1, 0] }
        }
        transition={isHovered
          ? { duration: 0.4 }
          : { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
        }
        className="absolute inset-[1.5px] rounded-full overflow-hidden flex items-center justify-center z-[2]"
      >
        <img
          src={chatbotLogo}
          alt="AI Energy Assistant"
          className="w-[90%] h-[90%] object-contain"
        />
      </motion.div>
    </div>
  );
};

interface Message {
  role: "user" | "model";
  text: string;
}

export const ChatBot: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tariffs, setTariffs] = useState<Record<string, TariffState> | null>(null);

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
    const greetingText = `Hi${nameStr}! 👋\n\nI am your **Energy AI Assistant**. I have secure, direct access to your **appliance logs, uploaded utility bills, and solar simulations**.\n\nHow can I help you optimize your savings today?`;
    
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
    4. If the user asks "How am I doing?" or "Explain my energy score", calculate and explain their energy score based on their usage (e.g. usage vs 250 kWh average baseline, tariff slabs, and appliance runtime).
    5. Keep responses under 4 sentences or a concise list. Use bold formatting like **text** for emphasis.
    6. Always format currency in Rupees (e.g. ₹500) and units in kWh.`;

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
        // Use Firebase Function proxy — key stays server-side
        if (functions) {
          const proxy = httpsCallable<unknown, Record<string, unknown>>(functions, "geminiProxy");
          const result = await proxy({
            model,
            contents: geminiContents,
            systemInstruction: { parts: [{ text: systemInstruction }] }
          });
          const data = result.data;
          responseText = (data?.candidates as { content: { parts: { text: string }[] } }[])?.[0]?.content?.parts?.[0]?.text || "";
        } else {
          // Fallback: direct call (dev mode without Firebase)
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
        }
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

  // Simple Markdown formatter for rendering response text nicely
  const formatText = (text: string) => {
    return text.split("\n").map((line, idx) => {
      let content = line;
      // Handle bold tags **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-bold text-slate-900 dark:text-white">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }

      const isBullet = line.trim().startsWith("*") || line.trim().startsWith("-");
      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc mt-1 pl-1 text-slate-700 dark:text-slate-350">
            {parts.length > 0 ? parts : line.replace(/^[*-\s]+/, "")}
          </li>
        );
      }
      
      return (
        <p key={idx} className={line.trim() === "" ? "h-2" : "mt-1.5 leading-relaxed text-slate-750 dark:text-slate-350"}>
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        animate={isOpen ? { y: 0 } : { y: [0, -6, 0] }}
        transition={isOpen ? {} : {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="fixed bottom-6 right-6 z-40 no-print"
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close Energy AI Chatbot" : "Open Energy AI Chatbot"}
          aria-expanded={isOpen}
          className="w-13 h-13 rounded-full bg-white/10 dark:bg-slate-900/35 backdrop-blur-[12px] flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all cursor-pointer relative group overflow-hidden text-slate-800 dark:text-white"
        >
          {isOpen ? (
            <X className="w-5 h-5 relative z-10" />
          ) : (
            <ChatBotLogo className="w-full h-full" isHovered={false} />
          )}
          {messages.length === 1 && !isOpen && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-neon opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-neon border border-white dark:border-slate-900"></span>
            </span>
          )}
          <span className="absolute right-16 scale-0 group-hover:scale-100 bg-slate-900/90 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-md transition-all duration-200 backdrop-blur-sm">
            ⚡ Chat with Energy AI
          </span>
        </button>
      </motion.div>
 
      {/* Chat Interface Panel (Glassmorphism, 380px x 600px, rounded-3xl [24px], blur-20) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 35, scale: 0.96 }}
            role="dialog"
            aria-label="Energy AI Chatbot"
            className="fixed bottom-24 sm:bottom-28 left-4 right-4 sm:left-auto sm:right-6 w-auto sm:w-[380px] h-[550px] sm:h-[600px] max-w-[calc(100%-2rem)] bg-white/75 dark:bg-slate-950/75 backdrop-blur-[20px] border border-white/20 dark:border-slate-800/40 rounded-[24px] shadow-2xl overflow-hidden flex flex-col z-40 text-left no-print"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-blue to-primary-green p-4 flex items-center justify-between text-white border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="relative w-9 h-9 shrink-0">
                  <ChatBotLogo className="w-full h-full" isHovered={true} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm">⚡ Energy Assistant</h3>
                  <span className="text-[10px] font-semibold text-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online & Ready
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Chatbot"
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conversation Messages */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-transparent"
              aria-live="polite"
              aria-label="Chat messages history"
            >
              <div className="text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-100 dark:border-slate-850">
                Context-Aware Assistant
              </div>
              
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary-blue text-white rounded-tr-none dark:bg-primary-green dark:text-slate-950 font-semibold"
                        : "bg-slate-50 dark:bg-slate-850 text-slate-850 dark:text-slate-200 border border-slate-150 dark:border-slate-800/50 rounded-tl-none font-medium"
                    }`}
                  >
                    {msg.role === "user" ? msg.text : formatText(msg.text)}
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 dark:bg-slate-850 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-150 dark:border-slate-800/50 flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
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

            {/* Suggested Quick Actions */}
            <div className="px-4 pb-2 border-t border-slate-100/40 dark:border-slate-800/40 pt-2.5 bg-transparent">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block mb-1.5">Suggested Quick Actions</span>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestion(sug.prompt)}
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-655 dark:text-slate-350 cursor-pointer transition-colors"
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
              className="p-3 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center gap-2 bg-transparent z-10"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about bills, tariffs, saving tips..."
                aria-label="Type your message to Energy AI"
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-850/80 border border-slate-255 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/10 dark:text-white"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                aria-label="Send message"
                className="p-2.5 rounded-xl bg-primary-blue hover:bg-primary-blue/95 dark:bg-primary-green dark:hover:bg-primary-green/95 text-white dark:text-slate-950 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
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
