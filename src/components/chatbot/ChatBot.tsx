import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { X, Send, Square, AlertCircle, ChevronDown, Sparkles, ArrowRight, Table, Trash2, Leaf, Zap, ExternalLink, Home, Search } from "lucide-react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { loadTariffs, type TariffState } from "../../utils/tariffService";
import type { EnergyReport } from "../../utils/reportsService";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import { parseApplianceQuery, isApplianceQuery } from "../../services/applianceParser";
import { searchAppliance } from "../../services/searchService";

// Sub-components
import ChatBotLogo from "./ChatBotLogo";
import CopilotInsightsBar from "./CopilotInsightsBar";
import QuickActionsGrid from "./QuickActionsGrid";
import CopilotPromptsLaunchpad from "./CopilotPromptsLaunchpad";
import SearchPipelineSteps, { SEARCH_STEPS } from "./SearchPipelineSteps";
import TypingIndicator from "./TypingIndicator";
import MessageBubble from "./MessageBubble";
import type { Message } from "./types";


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

  // Appliance search state
  const [searchPipelineStep, setSearchPipelineStep] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [activeAddForm, setActiveAddForm] = useState<number | null>(null);
  const [copilotMode, setCopilotMode] = useState<'dashboard' | 'chat'>('dashboard');

  const [feedback, setFeedback] = useState<Record<number, "up" | "down">>({});
  const [confirmClear, setConfirmClear] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stoppedRef = useRef(false);

  // Derive user initial for avatar
  const userInitial = user?.fullName ? user.fullName.trim().charAt(0).toUpperCase() : "U";

  const handlePromptFindAppliance = () => {
    setCopilotMode('chat');
    setIsSearching(false);
    setSearchPipelineStep(-1);
    setActiveAddForm(null);

    setMessages(prev => [
      ...prev,
      {
        role: "model",
        text: "🔍 **Appliance Wattage & Specification Finder**\n\nSearch any appliance brand, model, or category to look up its rated wattage and add it to your household energy audit.\n\n**Popular Presets (tap to search):**",
        interactiveChips: [
          "LG 1.5 Ton Dual Inverter AC",
          "Samsung 253L Refrigerator",
          "Dell Inspiron 15 Laptop",
          "Whirlpool 7kg Washing Machine",
          "Crompton BLDC Ceiling Fan",
          "Havells 15L Water Heater"
        ],
        timestamp: Date.now()
      }
    ]);

    setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 200);
  };

  const handleClear = () => {
    if (confirmClear) {
      const firstName = user?.fullName ? user.fullName.trim().split(/\s+/)[0] : "";
      const nameStr = firstName ? ` ${firstName}` : "";
      const greetingText = `Hi${nameStr}! 👋\n\nHow can I help you optimize your savings today?`;
      setMessages([{ role: "model", text: greetingText, timestamp: Date.now() }]);
      setFeedback({});
      setCopilotMode('dashboard');
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

  const handlePanelScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop !== 0) {
      e.currentTarget.scrollTop = 0;
    }
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

  // Auto-focus the input once the panel finishes opening
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    if (isOpen) {
      t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 260);
    }
    return () => { if (t) clearTimeout(t); };
  }, [isOpen]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
        return [{ role: "model", text: greetingText, timestamp: Date.now() }];
      }
      return prev;
    });
  }, [user]);



  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && copilotMode === 'chat') {
      scrollToBottom();
      const timer = setTimeout(scrollToBottom, 250);
      return () => clearTimeout(timer);
    }
  }, [messages, isOpen, copilotMode, isSearching, isLoading]);

  const handleSuggestion = (question: string) => {
    if (question === "FIND_APPLIANCE_PROMPT") {
      handlePromptFindAppliance();
    } else {
      handleSendMessage(question);
    }
  };

  const suggestions = [
    { label: "🔍 Find Appliance", prompt: "FIND_APPLIANCE_PROMPT", icon: <Search className="w-3 h-3" /> },
    { label: "⚡ Tariff Rates", prompt: "Explain my domestic electricity tariff rates and slab breakdown", icon: <Zap className="w-3 h-3" /> },
    { label: "☀️ Solar ROI", prompt: "Should I install solar panels? What size, cost, and payback?", icon: <Sparkles className="w-3 h-3" /> },
    { label: "💡 Save Money", prompt: "How can I save ₹500 per month on my energy bill?", icon: <Leaf className="w-3 h-3" /> },
    { label: "📊 Usage Report", prompt: "Give me a detailed analysis of my household energy consumption", icon: <Table className="w-3 h-3" /> },
    { label: "🌱 Carbon Impact", prompt: "What is my household carbon footprint and how can I reduce it?", icon: <ExternalLink className="w-3 h-3" /> }
  ];

  const queryGeminiDirect = async (
    userPrompt: string,
    onChunk?: (textSoFar: string) => void
  ): Promise<string> => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const isAborted = () => ctrl.signal.aborted;
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
        } catch {
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
        } catch {
          // ignore
        }
      }
    }

    const tariffContext = tariffs
      ? Object.values(tariffs)
          .map((t: TariffState) => {
            const slabsStr = t.slabs.map((s) => `${s.limit}: ${s.rate}`).join(", ");
            const subsidyStr = t.subsidy.value > 0 
              ? `Subsidy: ${t.subsidy.type === 'fixed' ? '₹' : ''}${t.subsidy.value}${t.subsidy.type === 'percentage' ? '%' : ''} (min gross: ₹${t.subsidy.minGross || 0})` 
              : "No subsidy";
            return `- ${t.displayName} Slabs: ${slabsStr}. ${subsidyStr}.`;
          })
          .join("\n    ")
      : `- Andhra Pradesh (AP Domestic LT-I) Slabs: 0 – 30 units: ₹1.90, 31 – 75 units: ₹3.00, 76 – 125 units: ₹4.50, 126 – 225 units: ₹6.00, 226 – 400 units: ₹8.75, Above 400 units: ₹9.75. Subsidy: ₹184.50 (fixed) (min gross: ₹0).
    - Telangana (TSSPDCL Domestic) Slabs: 0 – 50 units: ₹1.95, 51 – 100 units: ₹3.10, 101 – 200 units: ₹4.80, 201 – 300 units: ₹7.70, 301 – 400 units: ₹9.00, 401 – 800 units: ₹9.50, Above 800 units: ₹10.00. Subsidy: 13% (percentage) (min gross: ₹0).
    - Karnataka (BESCOM Domestic) Slabs: 0 – 50 units: ₹4.15, 51 – 100 units: ₹5.60, 101 – 200 units: ₹7.15, Above 200 units: ₹8.20. Subsidy: 13% (percentage) (min gross: ₹0).`;

    const systemInstruction = `You are the "Smart Household Energy AI Assistant". Your goal is to help users clear their doubts about domestic energy consumption, electricity tariffs/bills, appliance power ratings, carbon footprints, solar ROI investments, and household sustainability.
    
    Active User Environment Details (Automatically Extracted from Current Session):
    - User Profile: Name is ${user?.fullName || "Smart User"}, selected tariff state scheme is ${user?.tariffState || "ap"}, monthly budget bill target is ₹${user?.monthlyBudgetBill || 3000}, monthly units limit target is ${user?.monthlyBudgetUnits || 400} kWh.
    - ${reportsContext}
    - ${solarContext}
    
    Tariff Slab Reference:
    ${tariffContext}
    - Carbon Footprint: Grid emission factor is 0.82 kg CO2 / kWh. Tree absorption is 1.83 kg CO2 / month.
    
    CRITICAL INSTRUCTIONS FOR RESPONSE STYLE:
    1. You have direct access to the user's home profile, appliances, recent calculations, audit reports, and solar ROI data. Answer questions utilizing this data without asking the user to provide it.
    2. Always explicitly reference or state that you have direct access to their active appliance records, energy reports, or solar calculation outputs.
    3. Be conversational but extremely direct and brief. Use bullet points or key stats tables where appropriate.
    4. If the user asks "How am I doing?" or "Explain my energy score", calculate and explain their energy score based on their usage (e.g. usage usage vs 250 kWh average baseline, tariff slabs, and appliance runtime).
    5. Keep responses under 4 sentences or a concise list. Use bold formatting like **text** for emphasis.
    6. Always format currency in Rupees (e.g. ₹500) and units in kWh.
    7. You can suggest navigating to specific app pages by outputting action buttons in the format [Action: Page Name|/route] at the end of your response when relevant. For example:
       - To calculate solar: [Action: Solar Calculator|/dashboard?tab=solar]
       - To run home audit: [Action: AI Home Audit|/dashboard?tab=audit]
       - To check history: [Action: View Audit History|/history]
       - To check appliance survey: [Action: View Appliance Survey|/survey-data]
       - To modify profile settings: [Action: Edit Settings|/settings]
       - To modify profile: [Action: View Profile|/profile]`;

    // OPTIMIZATION 2: Prune conversation history to last 6 turns for optimal token efficiency & fast inference
    const prunedHistory = messages.slice(1).slice(-6);
    const geminiContents = [
      ...prunedHistory.map(msg => ({
        role: msg.role === "model" ? "model" : "user",
        parts: [{ text: msg.text }]
      })),
      {
        role: "user",
        parts: [{ text: userPrompt }]
      }
    ];

    const modelsToTry = ["gemini-2.5-flash", "gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest"];
    let lastError: Error | null = null;
    let responseText = "";

    for (const model of modelsToTry) {
      if (isAborted()) break;
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
            if (responseText) {
              // Stream response word-by-word for instant visual feedback
              if (onChunk) {
                const words = responseText.split(" ");
                let curr = "";
                for (let i = 0; i < words.length; i++) {
                  if (isAborted()) break;
                  curr += (i === 0 ? "" : " ") + words[i];
                  onChunk(curr);
                  await new Promise(r => setTimeout(r, 16));
                }
              }
              break;
            }
            continue;
          } catch {
            // Proxy unavailable — fall through to direct call
          }
        }

        // Direct call fallback (dev mode or Spark plan) with stream or REST
        const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
        if (!geminiKey) throw new Error("No Gemini key available.");

        const streamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${geminiKey}`;
        const response = await fetch(streamUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ctrl.signal,
          body: JSON.stringify({
            contents: geminiContents,
            systemInstruction: { parts: [{ text: systemInstruction }] }
          })
        });

        if (response.ok && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder("utf-8");
          let done = false;
          let buffer = "";

          while (!done) {
            if (isAborted()) break;
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
              buffer += decoder.decode(value, { stream: true });
              try {
                const matches = buffer.match(/"text":\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g);
                if (matches) {
                  const extracted = matches.map(m => {
                    try { return JSON.parse(`{${m}}`).text; } catch { return ""; }
                  }).join("");
                  if (extracted && extracted.length > responseText.length) {
                    responseText = extracted;
                    if (onChunk) onChunk(responseText);
                  }
                }
              } catch { /* buffer parsing fallback */ }
            }
          }

          if (responseText) break;
        }

        // Direct fallback standard fetch
        const chatUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        const res = await fetch(chatUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ctrl.signal,
          body: JSON.stringify({
            contents: geminiContents,
            systemInstruction: { parts: [{ text: systemInstruction }] }
          })
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (responseText) {
          if (onChunk) {
            const words = responseText.split(" ");
            let curr = "";
            for (let i = 0; i < words.length; i++) {
              if (isAborted()) break;
              curr += (i === 0 ? "" : " ") + words[i];
              onChunk(curr);
              await new Promise(r => setTimeout(r, 16));
            }
          }
          break;
        }
      } catch (err: unknown) {
        if (isAborted()) break;
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    if (isAborted()) {
      abortRef.current = null;
      return "";
    }
    if (!responseText && lastError) {
      abortRef.current = null;
      throw lastError;
    }
    abortRef.current = null;
    return responseText;
  };

  const queryGeminiSpec = async (specPrompt: string): Promise<string> => {
    const modelsToTry = ["gemini-2.5-flash", "gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest"];
    let lastError: Error | null = null;

    // 1. Attempt secure Firebase proxy first if available
    if (functions) {
      for (const model of modelsToTry) {
        try {
          const proxy = httpsCallable<unknown, Record<string, unknown>>(functions, "geminiProxy");
          const result = await proxy({
            model,
            contents: [{ role: "user", parts: [{ text: specPrompt }] }],
            systemInstruction: {
              parts: [{ text: "You are an appliance technical specification database. Return strictly a raw JSON object matching the requested schema. No conversational text or markdown code fences." }]
            }
          });
          const data = result.data;
          const text = (data?.candidates as { content: { parts: { text: string }[] } }[])?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        } catch (proxyErr: unknown) {
          // If unauthenticated or forbidden, break immediately rather than trying other models
          const code = (proxyErr as { code?: string })?.code;
          if (code === 'unauthenticated' || code === 'permission-denied') {
            break;
          }
        }
      }
    }

    // 2. Direct Gemini API call fallback (with responseMimeType: "application/json")
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    if (geminiKey) {
      for (const model of modelsToTry) {
        try {
          const chatUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
          const res = await fetch(chatUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: specPrompt }] }],
              systemInstruction: {
                parts: [{ text: "You are an appliance technical specification database. Return strictly a raw JSON object matching the requested schema. No conversational text." }]
              },
              generationConfig: {
                responseMimeType: "application/json"
              }
            })
          });
          if (res.ok) {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return text;
          }
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
        }
      }
    }

    if (lastError) throw lastError;
    throw new Error("Unable to reach Gemini specification database.");
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    stoppedRef.current = false;

    // Reset transient search and form states
    setIsSearching(false);
    setSearchPipelineStep(-1);
    setActiveAddForm(null);

    // If user asked to find appliances or opened finder command
    const lowerTrim = textToSend.trim().toLowerCase();
    if (
      lowerTrim === 'find appliance' ||
      lowerTrim === 'search appliance' ||
      lowerTrim === 'find appliances' ||
      lowerTrim === 'appliance finder'
    ) {
      handlePromptFindAppliance();
      return;
    }

    if (copilotMode === 'dashboard') setCopilotMode('chat');
    
    const userMessage: Message = { role: "user", text: textToSend, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setError(null);

    // Check if this is an appliance query
    const parsed = parseApplianceQuery(textToSend);
    const isAppliance = isApplianceQuery(parsed, textToSend);

    if (isAppliance) {
      // Appliance search pipeline
      setIsSearching(true);
      setSearchPipelineStep(0);

      try {
        // Animate through pipeline steps smoothly
        const stepDelays = [400, 900, 1400, 1900];
        const stepTimers = stepDelays.map((delay, idx) =>
          setTimeout(() => setSearchPipelineStep(idx + 1), delay)
        );

        const result = await searchAppliance(textToSend, queryGeminiSpec);
        
        // Clear step timers
        stepTimers.forEach(clearTimeout);
        setSearchPipelineStep(SEARCH_STEPS.length - 1);

        // Append result message with clean spec card and informative header
        setMessages(prev => [
          ...prev,
          {
            role: "model",
            text: `Found specifications for **${result.spec.name}** (${result.spec.ratedPowerW}W):`,
            applianceSpec: result.spec,
            timestamp: Date.now()
          }
        ]);

        // Short delay then hide pipeline
        setTimeout(() => {
          setIsSearching(false);
          setSearchPipelineStep(-1);
        }, 500);

      } catch (err: unknown) {
        console.error('Appliance search failed:', err);
        setIsSearching(false);
        setSearchPipelineStep(-1);
        if (stoppedRef.current) return;
        setMessages(prev => [...prev, {
          role: "model",
          text: `I couldn't find specific data for that appliance. Try entering a more specific brand or model number (e.g. *LG 1.5 Ton AC*, *Samsung Refrigerator*), or ask me general energy questions.`,
          timestamp: Date.now()
        }]);
      }
    } else {
      // Normal chat flow with OPTIMIZATION 1: Real-time Word-by-Word Streaming
      setIsLoading(true);
      let createdMsg = false;

      const onChunk = (chunkText: string) => {
        setIsLoading(false); // Remove thinking indicator as soon as text streams in!
        if (!createdMsg) {
          createdMsg = true;
          setMessages(prev => [...prev, { role: "model", text: chunkText, timestamp: Date.now() }]);
        } else {
          setMessages(prev => {
            const next = [...prev];
            next[next.length - 1] = { ...next[next.length - 1], text: chunkText };
            return next;
          });
        }
      };

      try {
        const botResponseText = await queryGeminiDirect(textToSend, onChunk);
        if (!createdMsg && botResponseText) {
          setMessages(prev => [...prev, { role: "model", text: botResponseText, timestamp: Date.now() }]);
        }
      } catch (err: unknown) {
        console.error(err);
        if (stoppedRef.current) return;

        // Fallback answers when offline / missing API key
        const lower = textToSend.toLowerCase();
        let fallbackText = "I'm having trouble connecting to my live AI brain, but I'd love to help you! Feel free to click any of the suggested actions below (like **Explain My Bill**, **Solar Advice**, or **Compare Homes**) or ask about saving energy.";
        
        if (lower.includes("bill") || lower.includes("cost") || lower.includes("charge")) {
          fallbackText = `Based on your profile, your latest bill is computed using state slabs. Enter your appliance audit list in the Dashboard to get a detailed tariff slab breakdown.`;
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

        setMessages(prev => [...prev, { role: "model", text: fallbackText, timestamp: Date.now() }]);
      } finally {
        setIsLoading(false);
      }
    }
  };


  const handleStop = () => {
    stoppedRef.current = true;
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
    setIsSearching(false);
    setSearchPipelineStep(-1);
    setActiveAddForm(null);
    setMessages(prev => [
      ...prev,
      { role: "model", text: "Stopped generating. Ask me something else, or pick a quick action below.", timestamp: Date.now() }
    ]);
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
      
      const headers = currentTableRows[0];
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

  // Character count for input
  const charCount = inputText.length;
  const showCharCount = charCount > 100;

  return (
    <MotionConfig reducedMotion="user">
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
          aria-label={isOpen ? "Close AI Energy Copilot" : "Open AI Energy Copilot"}
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
            ⚡ AI Energy Copilot
          </span>
        </button>
      </motion.div>
 
      {/* Chat Interface Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 450, damping: 24 }}
            role="dialog"
            aria-label="AI Energy Copilot"
            onScroll={handlePanelScroll}
            className="fixed bottom-20 sm:bottom-24 left-3 right-3 sm:left-auto sm:right-6 w-auto sm:w-[540px] md:w-[560px] h-[580px] sm:h-[700px] max-w-[calc(100%-1.5rem)] md:max-w-[600px] max-h-[calc(100vh-6rem)] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-[32px] shadow-[0_30px_90px_-15px_rgba(15,23,42,0.3)] dark:shadow-[0_35px_100px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col z-50 text-left no-print transition-all duration-200 will-change-transform"
          >
            {/* Scoped CSS for Ultra-High Fidelity Manual Background System */}
            <style>
              {`
                .manual-chatbot-bg {
                  position: absolute;
                  inset: 0;
                  overflow: hidden;
                  border-radius: 32px;
                  pointer-events: none;
                  z-index: 0;
                }

                .manual-bg-base {
                  position: absolute;
                  inset: 0;
                }

                :root.dark .manual-bg-base {
                  background:
                    radial-gradient(ellipse 140% 80% at 50% -10%, rgba(15, 23, 42, 0.98) 0%, transparent 75%),
                    radial-gradient(ellipse 100% 60% at 100% 100%, rgba(10, 15, 30, 0.9) 0%, transparent 65%),
                    linear-gradient(160deg, #030712 0%, #090d16 50%, #030712 100%);
                }

                :root:not(.dark) .manual-bg-base {
                  background:
                    radial-gradient(ellipse 120% 60% at 50% -5%, rgba(224, 242, 254, 0.85) 0%, transparent 70%),
                    radial-gradient(ellipse 80% 50% at 95% 95%, rgba(207, 250, 254, 0.6) 0%, transparent 60%),
                    linear-gradient(160deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
                }

                .manual-bg-orb {
                  position: absolute;
                  border-radius: 50%;
                  filter: blur(55px);
                  will-change: transform;
                }

                :root.dark .manual-bg-orb { opacity: 0.95; }
                :root:not(.dark) .manual-bg-orb { opacity: 0.65; }

                /* Orb 1 — Top-Left Cyan/Indigo Glow */
                .manual-bg-orb--1 {
                  width: 380px;
                  height: 380px;
                  top: -90px;
                  left: -70px;
                  background: radial-gradient(circle, rgba(6, 182, 212, 0.28) 0%, rgba(99, 102, 241, 0.18) 50%, transparent 70%);
                  animation: manual-orb-drift-1 18s ease-in-out infinite;
                }
                :root:not(.dark) .manual-bg-orb--1 {
                  background: radial-gradient(circle, rgba(6, 182, 212, 0.18) 0%, rgba(99, 102, 241, 0.12) 50%, transparent 70%);
                }

                /* Orb 2 — Right Emerald Glow */
                .manual-bg-orb--2 {
                  width: 420px;
                  height: 420px;
                  top: 15%;
                  right: -90px;
                  background: radial-gradient(circle, rgba(16, 185, 129, 0.24) 0%, rgba(56, 189, 248, 0.14) 50%, transparent 70%);
                  animation: manual-orb-drift-2 22s ease-in-out infinite;
                }
                :root:not(.dark) .manual-bg-orb--2 {
                  background: radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, rgba(56, 189, 248, 0.10) 50%, transparent 70%);
                }

                /* Orb 3 — Bottom Violet Glow */
                .manual-bg-orb--3 {
                  width: 340px;
                  height: 340px;
                  bottom: -70px;
                  left: 5%;
                  background: radial-gradient(circle, rgba(139, 92, 246, 0.22) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 70%);
                  animation: manual-orb-drift-3 26s ease-in-out infinite;
                }
                :root:not(.dark) .manual-bg-orb--3 {
                  background: radial-gradient(circle, rgba(139, 92, 246, 0.14) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 70%);
                }

                /* Orb 4 — Warm Amber Glow */
                .manual-bg-orb--4 {
                  width: 280px;
                  height: 280px;
                  top: 50%;
                  left: 35%;
                  background: radial-gradient(circle, rgba(245, 158, 11, 0.16) 0%, rgba(249, 115, 22, 0.10) 50%, transparent 70%);
                  animation: manual-orb-drift-4 30s ease-in-out infinite;
                }
                :root:not(.dark) .manual-bg-orb--4 {
                  background: radial-gradient(circle, rgba(245, 158, 11, 0.10) 0%, rgba(249, 115, 22, 0.06) 50%, transparent 70%);
                }

                @keyframes manual-orb-drift-1 {
                  0%, 100% { transform: translate(0px, 0px) scale(1); }
                  33%       { transform: translate(30px, 20px) scale(1.06); }
                  66%       { transform: translate(-15px, 35px) scale(0.96); }
                }
                @keyframes manual-orb-drift-2 {
                  0%, 100% { transform: translate(0px, 0px) scale(1); }
                  40%       { transform: translate(-40px, 30px) scale(1.08); }
                  75%       { transform: translate(20px, -20px) scale(0.94); }
                }
                @keyframes manual-orb-drift-3 {
                  0%, 100% { transform: translate(0px, 0px) scale(1); }
                  30%       { transform: translate(35px, -25px) scale(1.1); }
                  70%       { transform: translate(-20px, 15px) scale(0.92); }
                }
                @keyframes manual-orb-drift-4 {
                  0%, 100% { transform: translate(0px, 0px) scale(1); }
                  50%       { transform: translate(-30px, -40px) scale(1.12); }
                }

                .manual-bg-beam {
                  position: absolute;
                  top: -20%;
                  left: 25%;
                  width: 1.5px;
                  height: 140%;
                  background: linear-gradient(to bottom,
                    transparent 0%,
                    rgba(6, 182, 212, 0.10) 20%,
                    rgba(16, 185, 129, 0.20) 50%,
                    rgba(139, 92, 246, 0.10) 80%,
                    transparent 100%);
                  transform: rotate(-25deg);
                  transform-origin: top center;
                  filter: blur(1px);
                  animation: manual-beam-pulse 8s ease-in-out infinite;
                }

                :root:not(.dark) .manual-bg-beam {
                  background: linear-gradient(to bottom,
                    transparent 0%,
                    rgba(6, 182, 212, 0.06) 20%,
                    rgba(16, 185, 129, 0.12) 50%,
                    rgba(139, 92, 246, 0.06) 80%,
                    transparent 100%);
                }

                @keyframes manual-beam-pulse {
                  0%, 100% { opacity: 0.5; transform: rotate(-25deg) scaleX(1); }
                  50%       { opacity: 1;   transform: rotate(-25deg) scaleX(1.8); }
                }

                .manual-bg-dot-grid {
                  position: absolute;
                  inset: 0;
                  background-image: radial-gradient(circle, rgba(6, 182, 212, 0.25) 1px, transparent 1px);
                  background-size: 30px 30px;
                  mask-image: radial-gradient(ellipse 85% 85% at 50% 50%, black 20%, transparent 80%);
                  -webkit-mask-image: radial-gradient(ellipse 85% 85% at 50% 50%, black 25%, transparent 75%);
                }

                :root.dark .manual-bg-dot-grid { opacity: 0.35; }
                :root:not(.dark) .manual-bg-dot-grid { opacity: 0.22; }

                .manual-bg-vignette {
                  position: absolute;
                  inset: 0;
                  background: radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(2, 2, 10, 0.4) 100%);
                  opacity: 0.6;
                }
              `}
            </style>

            {/* Premium Multi-Layer Manual Background System */}
            <div className="manual-chatbot-bg">
              <div className="manual-bg-base" />
              <div className="manual-bg-orb manual-bg-orb--1" />
              <div className="manual-bg-orb manual-bg-orb--2" />
              <div className="manual-bg-orb manual-bg-orb--3" />
              <div className="manual-bg-orb manual-bg-orb--4" />
              <div className="manual-bg-beam" />
              <div className="manual-bg-dot-grid" />
              <div className="manual-bg-vignette" />
            </div>

            {/* Top Multi-Stop Rainbow Accent Border Sheen */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-cyan-400 via-emerald-400 via-violet-400 to-indigo-500 pointer-events-none z-30" />
            <div className="bg-white/85 dark:bg-slate-900/85 p-3.5 sm:p-4 flex items-center justify-between text-slate-800 dark:text-white border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl sticky top-0 z-30 shadow-xs shrink-0 relative">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 p-0.5 bg-white/90 dark:bg-slate-900/90 rounded-xl flex items-center justify-center z-10 shrink-0">
                  <ChatBotLogo className="w-full h-full" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm tracking-tight bg-gradient-to-r from-cyan-600 via-blue-600 to-emerald-600 dark:from-cyan-400 dark:via-blue-400 dark:to-emerald-400 bg-clip-text text-transparent flex items-center gap-1.5">
                    AI Energy Copilot
                    {/* Shimmer AI badge */}
                    <span className="relative text-[9px] font-black bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider leading-none shadow-[0_0_10px_rgba(6,182,212,0.3)] overflow-hidden">
                      <span className="relative z-10">AI</span>
                      <motion.span
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent z-0"
                      />
                    </span>
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Powered by AI · Ready
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                {/* View Mode Toggle Switch */}
                <div className="flex items-center p-0.5 bg-slate-200/60 dark:bg-slate-800/80 rounded-xl border border-slate-300/60 dark:border-slate-700/60 mr-1">
                  <button
                    type="button"
                    onClick={() => setCopilotMode('dashboard')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                      copilotMode === 'dashboard'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    Menu
                  </button>
                  <button
                    type="button"
                    onClick={() => setCopilotMode('chat')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                      copilotMode === 'chat'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    Chat
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear chat session"
                  className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/70 hover:bg-red-500/15 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer flex items-center gap-1 relative hover:scale-105 active:scale-95"
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
                  aria-label="Close AI Energy Copilot"
                  className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer hover:rotate-90 duration-200 hover:scale-105 active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mode Views Container with AnimatePresence Transition */}
            <AnimatePresence mode="wait">
              {copilotMode === 'dashboard' ? (
                <motion.div
                  key="dashboard-view"
                  initial={{ opacity: 0, scale: 0.98, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -8 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="flex-1 flex flex-col overflow-y-auto relative z-10"
                >
                  <CopilotInsightsBar 
                    compact={false} 
                    userId={user?.uid} 
                    onNavigate={(path) => {
                      setIsOpen(false);
                      navigate(path);
                    }}
                    onAction={(prompt) => {
                      handleSendMessage(prompt);
                    }}
                  />

                  {/* Animated Gradient Divider */}
                  <div className="px-4 py-1">
                    <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                  </div>

                  <QuickActionsGrid
                    onAction={(prompt) => {
                      handleSendMessage(prompt);
                    }}
                    onNavigate={(path) => {
                      setIsOpen(false);
                      navigate(path);
                    }}
                    onPromptFindAppliance={handlePromptFindAppliance}
                  />

                  {/* Animated Gradient Divider */}
                  <div className="px-4 py-1">
                    <div className="h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                  </div>

                  <CopilotPromptsLaunchpad
                    onSelectPrompt={(prompt) => {
                      handleSendMessage(prompt);
                    }}
                    user={user}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="chat-view"
                  initial={{ opacity: 0, scale: 0.98, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -8 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10"
                >
                  <CopilotInsightsBar 
                    compact={true} 
                    userId={user?.uid} 
                    onNavigate={(path) => {
                      setIsOpen(false);
                      navigate(path);
                    }}
                    onAction={(prompt) => {
                      handleSendMessage(prompt);
                    }}
                  />

                  {/* Conversation Messages */}
                  <div 
                    ref={chatContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-transparent relative z-10"
                    aria-live="polite"
                    aria-label="Chat messages history"
                  >
                    <div className="text-center text-[11px] font-semibold text-slate-400 dark:text-slate-555 uppercase tracking-wide pb-1 border-b border-slate-100 dark:border-slate-850">
                      AI Energy Copilot · Chat
                    </div>
                    
                    {messages.map((msg, idx) => (
                      <MessageBubble
                        key={idx}
                        message={msg}
                        index={idx}
                        isFirstMessage={idx === 0}
                        feedback={feedback[idx]}
                        onFeedback={(type) => handleFeedback(idx, type)}
                        formatText={formatText}
                        showAddForm={activeAddForm === idx}
                        onToggleAddForm={() => setActiveAddForm(activeAddForm === idx ? null : idx)}
                        onAddToAudit={() => {
                          setActiveAddForm(null);
                          if (msg.applianceSpec) {
                            setMessages(prev => [
                              ...prev,
                              {
                                role: "model",
                                text: `✅ Added **${msg.applianceSpec?.name}** (${msg.applianceSpec?.ratedPowerW}W) to your household energy audit!\n\n[Action: View in Audit Wizard|/dashboard]`,
                                timestamp: Date.now()
                              }
                            ]);
                          }
                        }}
                        onViewProduct={() => {
                          if (msg.applianceSpec?.productUrl) {
                            window.open(msg.applianceSpec.productUrl, "_blank", "noopener,noreferrer");
                          }
                        }}
                        onSelectChip={(chip) => handleSendMessage(chip)}
                        userInitial={userInitial}
                      />
                    ))}

                    {/* Appliance Search Pipeline Steps */}
                    {isSearching && (
                      <SearchPipelineSteps currentStep={searchPipelineStep} />
                    )}

                    {/* Premium Typing Indicator */}
                    <AnimatePresence>
                      {isLoading && <TypingIndicator />}
                    </AnimatePresence>
   
                    {error && (
                      <div className="flex items-center gap-1.5 text-alert-red text-[11px] font-bold justify-center py-2 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-xl">
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
 
            {/* Scroll-to-bottom Floating Circle Button */}
            <AnimatePresence>
              {showScrollBottom && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  onClick={scrollContainerToBottom}
                  className="absolute bottom-36 left-1/2 -translate-x-1/2 z-20 w-8 h-8 bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 rounded-full shadow-md text-slate-700 dark:text-slate-300 hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center backdrop-blur-md"
                  aria-label="Scroll to bottom"
                >
                  <ChevronDown className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                </motion.button>
              )}
            </AnimatePresence>
 
            {/* Quick Actions (chat mode only) — Horizontally scrollable ribbon */}
            {copilotMode === 'chat' && (
              <div className="px-4 pb-2 border-t border-slate-200/40 dark:border-slate-800/40 pt-2.5 bg-transparent relative z-10">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide">Quick Actions</span>
                  <button
                    type="button"
                    onClick={() => setCopilotMode('dashboard')}
                    className="text-[10px] font-bold text-primary-blue dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Home className="w-3 h-3" />
                    Dashboard
                  </button>
                </div>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5 -mx-1 px-1">
                  {suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestion(sug.prompt)}
                      disabled={isLoading || isSearching}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 hover:bg-emerald-500/15 dark:bg-slate-900/60 dark:hover:bg-emerald-500/25 border border-slate-200/60 dark:border-slate-800 hover:border-emerald-500/40 rounded-full text-[11px] font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition-all shadow-xs hover:scale-105 active:scale-95 backdrop-blur-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none whitespace-nowrap shrink-0"
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
 
            {/* ─── Enhanced Input Footer ─── */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="p-3.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2 bg-white/40 dark:bg-slate-955/40 backdrop-blur-md z-10 relative"
            >
              {/* Animated gradient border glow when focused */}
              {inputFocused && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none z-0"
                >
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
                </motion.div>
              )}
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder={isLoading || isSearching ? "Generating answer…" : "Ask about your energy, appliances, or bills…"}
                  aria-label="Search appliance or ask AI Energy Copilot"
                  className={`w-full px-4 py-2.5 bg-white/90 dark:bg-slate-900/80 border rounded-xl text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/40 dark:focus:ring-cyan-400/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 backdrop-blur-md transition-all shadow-inner ${
                    inputFocused
                      ? "border-cyan-500 dark:border-cyan-400"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                  disabled={isLoading || isSearching}
                />
                {/* Character count */}
                {showCharCount && (
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold transition-colors ${
                    charCount > 500 ? "text-red-400" : "text-slate-400 dark:text-slate-600"
                  }`}>
                    {charCount}
                  </span>
                )}
              </div>
              <button
                type={isLoading || isSearching ? "button" : "submit"}
                onClick={isLoading || isSearching ? handleStop : undefined}
                disabled={!isLoading && !isSearching && !inputText.trim()}
                aria-label={isLoading || isSearching ? "Stop generating" : "Send message"}
                className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black transition-all shadow-[0_0_18px_rgba(6,182,212,0.35)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 hover:scale-108 active:scale-95 flex items-center justify-center"
              >
                {isLoading || isSearching ? <Square className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
};
