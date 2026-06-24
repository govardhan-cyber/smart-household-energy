import React, { useState } from "react";
import { HelpCircle, Search, ChevronDown, Sparkles, Shield, Cpu, BadgeCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  id: string;
  category: "billing" | "privacy" | "usage" | "tips";
  question: string;
  answer: string;
}

const CATEGORIES = [
  { key: "all",     label: "All Topics",        icon: HelpCircle,  color: "text-slate-500",        bg: "bg-slate-100 dark:bg-slate-800",           active: "bg-slate-900 dark:bg-white text-white dark:text-slate-900" },
  { key: "usage",   label: "How It Works",      icon: Cpu,         color: "text-blue-600",          bg: "bg-blue-50 dark:bg-blue-950/40",            active: "bg-primary-blue text-white" },
  { key: "billing", label: "AP LT-I Slabs",     icon: BadgeCheck,  color: "text-violet-600",        bg: "bg-violet-50 dark:bg-violet-950/40",        active: "bg-violet-600 text-white" },
  { key: "privacy", label: "Privacy",           icon: Shield,      color: "text-emerald-600",       bg: "bg-emerald-50 dark:bg-emerald-950/40",      active: "bg-emerald-600 text-white" },
  { key: "tips",    label: "Tips & Savings",    icon: Sparkles,    color: "text-amber-600",         bg: "bg-amber-50 dark:bg-amber-950/40",          active: "bg-amber-500 text-white" },
] as const;

const CATEGORY_ACCENT: Record<string, { border: string; badge: string; badgeText: string; dot: string }> = {
  usage:   { border: "border-blue-200 dark:border-blue-900/50",    badge: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",       badgeText: "How It Works",   dot: "bg-primary-blue" },
  billing: { border: "border-violet-200 dark:border-violet-900/50",badge: "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400",badgeText: "AP LT-I Slabs", dot: "bg-violet-500" },
  privacy: { border: "border-emerald-200 dark:border-emerald-900/50",badge:"bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",badgeText:"Privacy",    dot: "bg-emerald-500" },
  tips:    { border: "border-amber-200 dark:border-amber-900/50",   badge: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",   badgeText: "Tips & Savings", dot: "bg-amber-500" },
};

export const FAQ: React.FC = () => {
  const [searchQuery, setSearchQuery]   = useState("");
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const faqs: FAQItem[] = [
    { id: "faq_1",  category: "usage",   question: "How does the application calculate energy consumption?", answer: "The application calculates consumption by multiplying an appliance's power rating (wattage) by the quantity and the average daily usage hours. This daily consumption is converted to Kilowatt Hours (kWh) and multiplied by 30 days to obtain your estimated monthly units." },
    { id: "faq_2",  category: "usage",   question: "What is the mathematical formula used for calculations?", answer: "The formula is:\nMonthly Units (kWh) = [Wattage / 1000] × Quantity × Daily Usage (Hours) × 30 days.\n\nFor example, if you run one AC (1500W) for 6 hours daily:\n(1500 / 1000) × 1 × 6 × 30 = 270 kWh." },
    { id: "faq_3",  category: "billing", question: "How is the electricity bill estimated?", answer: "The bill is estimated using the official AP LT-I domestic electricity tariff slabs. The app calculates the net energy charge by distributing your monthly unit consumption across these slabs, applying corresponding rates, and accounting for government subsidies." },
    { id: "faq_4",  category: "billing", question: "What are the exact AP Domestic (LT-I) tariff rates used?", answer: "We apply the official AP LT-I slabs:\n• 0 – 30 units: ₹1.90 / unit\n• 31 – 75 units: ₹3.00 / unit\n• 76 – 125 units: ₹4.50 / unit\n• 126 – 225 units: ₹6.00 / unit\n• 226 – 400 units: ₹8.75 / unit\n• Above 400 units: ₹9.75 / unit" },
    { id: "faq_5",  category: "billing", question: "How is the government subsidy calculated in my bill?", answer: "APDISCOM billing structures display a Gross Energy Charge minus a Government Subsidy, which yields the Net Energy Charge. The app calculates Net charges directly from slab rules, then applies the scaling factor (Gross = Net × 1.402, Subsidy = Gross − Net) to replicate the exact APDISCOM billing format.\n\nExample for 132 units: ₹643.50 gross charge, ₹184.50 subsidy → ₹459.00 net bill." },
    { id: "faq_6",  category: "privacy", question: "Is my energy consumption data private and secure?", answer: "Yes, security is a top priority. Every user has their own private dashboard. Your appliance data, calculations, and survey records are stored securely in your private account and cannot be accessed by other users. This isolation is strictly enforced by Firebase security rules." },
    { id: "faq_7",  category: "privacy", question: "Do I need to create an account to use the application?", answer: "Yes. An account is required so that your custom appliances list, daily usage configurations, and calculation history can be saved securely in the cloud under your profile. This allows you to log in from any device and view your history." },
    { id: "faq_8",  category: "usage",   question: "How does the 'My Energy History' dashboard work?", answer: "Whenever you click the 'Analyze' button on the dashboard, the calculated energy profile is auto-saved as a record. You can search, sort by date/consumption/bill amount, delete past calculations, or load them to review previous configurations." },
    { id: "faq_9",  category: "tips",    question: "How are the energy-saving recommendations generated?", answer: "The system analyzes your active appliances list to identify items consuming the most energy. It then suggests specific changes — such as reducing AC usage by 2 hours, upgrading to BEE 5-star LEDs, or defroster optimizations — along with expected monthly savings." },
    { id: "faq_10", category: "tips",    question: "How are the savings estimations calculated?", answer: "The savings are calculated by subtracting the recommended reduction in daily kWh from your active total consumption. The system recalculates the slab-rate bill for this lower consumption, and the difference from your original bill represents your estimated savings." },
    { id: "faq_11", category: "usage",   question: "Which household appliances does the app currently support?", answer: "The app supports the most common household appliances: Air Conditioners (AC), Refrigerators, Water Heaters, Washing Machines, Televisions (TV), Fans, Laptops, and LED Lights." },
    { id: "faq_12", category: "privacy", question: "Can I export my calculation history or delete my data?", answer: "Yes. In the Settings panel, you can download a full backup of all your reports in JSON format. You can also permanently delete your entire reports calculation history with a single click." },
  ];

  const filtered = faqs.filter((faq) => {
    const matchSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = activeCategory === "all" || faq.category === activeCategory;
    return matchSearch && matchCat;
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex-1 bg-transparent transition-colors duration-300 min-h-screen">

      {/* ── Hero Header (Card Style with Curved Edges) ── */}
      <div className="mx-4 sm:mx-6 lg:mx-8 xl:mx-12 mt-6">
        <div className="relative overflow-hidden bg-gradient-to-tr from-blue-700 via-indigo-650 to-emerald-500 py-16 px-6 sm:px-8 lg:px-12 rounded-[2rem] border border-white/15 shadow-xl">
          {/* Decorative blobs */}
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.03] rounded-full blur-2xl pointer-events-none" />

          <div className="relative max-w-4xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">
              <Zap className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              Help Center
            </div>
            <h1 className="text-3xl sm:text-4.5xl font-display font-extrabold text-white leading-tight tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-sm text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about calculations, AP LT-I tariff slabs, data privacy, and energy-saving tips.
            </p>

            {/* Search bar inside hero */}
            <div className="relative max-w-xl mx-auto mt-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions…"
                className="w-full pl-11 pr-4 py-3.5 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 focus:border-white/40 focus:bg-white/15 rounded-2xl text-sm font-medium text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/25 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 space-y-8 text-left">

        {/* Category filter pills */}
        <div className="flex justify-center w-full">
          <div className="inline-flex flex-wrap justify-center gap-2 p-1.5 bg-slate-100/40 dark:bg-slate-900/30 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm">
            {CATEGORIES.map(({ key, label, icon: Icon, bg, active }) => {
              const isActive = activeCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isActive
                      ? `${active} shadow-md scale-[1.03]`
                      : `${bg} text-slate-500 dark:text-slate-400 hover:bg-slate-200/55 dark:hover:bg-slate-800/55 hover:scale-[1.02] active:scale-[0.97]`
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  <span className={`ml-1 text-[10px] font-black ${isActive ? "opacity-90" : "opacity-50"}`}>
                    {key === "all" ? faqs.length : faqs.filter(f => f.category === key).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results count */}
        <p className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          {filtered.length} {filtered.length === 1 ? "question" : "questions"} found
        </p>

        {/* FAQ Grid list */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-14 text-center space-y-3 shadow-sm">
            <HelpCircle className="w-10 h-10 text-slate-350 dark:text-slate-700 mx-auto" />
            <p className="text-sm font-bold text-slate-450 dark:text-slate-550">No questions match your search.</p>
            <p className="text-xs text-slate-400">Try different keywords or clear the search field.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {filtered.map((faq, index) => {
              const isExpanded = expandedId === faq.id;
              const accent = CATEGORY_ACCENT[faq.category];
              return (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  className={`bg-white/45 dark:bg-slate-900/45 backdrop-blur-md border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${
                    isExpanded
                      ? `${accent.border} bg-white/90 dark:bg-slate-900/90 shadow-md ring-1 ring-offset-0 ${
                          faq.category === "usage"
                            ? "ring-blue-100/50 dark:ring-blue-950/50"
                            : faq.category === "billing"
                            ? "ring-violet-100/50 dark:ring-violet-950/50"
                            : faq.category === "privacy"
                            ? "ring-emerald-100/50 dark:ring-emerald-950/50"
                            : "ring-amber-100/50 dark:ring-amber-950/50"
                        }`
                      : "border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5"
                  }`}
                >
                  {/* Question row */}
                  <button
                    onClick={() => toggleExpand(faq.id)}
                    className="w-full flex items-start gap-4 p-5 text-left focus:outline-none group cursor-pointer"
                  >
                    {/* Index dot indicator */}
                    <span className="shrink-0 w-6 h-6 mt-0.5 flex items-center justify-center">
                      <span className={`w-2 h-2 rounded-full ${accent.dot} ${isExpanded ? "scale-150" : ""} transition-transform duration-200`} />
                    </span>

                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Category badge */}
                      <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${accent.badge}`}>
                        {accent.badgeText}
                      </span>
                      {/* Question text */}
                      <p className={`text-sm font-bold leading-snug transition-colors duration-150 ${
                        isExpanded
                          ? "text-primary-blue dark:text-primary-green"
                          : "text-slate-800 dark:text-slate-200 group-hover:text-primary-blue dark:group-hover:text-primary-green"
                      }`}>
                        {faq.question}
                      </p>
                    </div>

                    {/* Chevron */}
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className={`shrink-0 mt-1 transition-colors duration-150 ${
                        isExpanded ? "text-primary-blue dark:text-primary-green" : "text-slate-400"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </button>

                  {/* Answer panel */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 pl-[3.75rem]">
                          <div className={`border-t pt-4 ${accent.border}`}>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer tip */}
        <div className="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/10 dark:to-emerald-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5">
          <Sparkles className="w-5 h-5 text-primary-blue dark:text-primary-green shrink-0 mt-0.5 animate-pulse" />
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Still have questions?</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Use the <span className="font-bold text-primary-blue dark:text-primary-green">⚡ Energy AI chatbot</span> at the bottom-right corner — it can explain tariff slabs, interpret your bill, and give personalised saving tips instantly.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
