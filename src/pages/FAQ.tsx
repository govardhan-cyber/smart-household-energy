import React, { useState } from "react";
import { HelpCircle, Search, ChevronDown, Sparkles, Shield, Cpu, BadgeCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  id: string;
  category: "billing" | "privacy" | "usage" | "tips";
  question: string;
  answer: string;
}

export const FAQ: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: "faq_1",
      category: "usage",
      question: "How does the application calculate energy consumption?",
      answer: "The application calculates consumption by multiplying an appliance's power rating (wattage) by the quantity and the average daily usage hours. This daily consumption is converted to Kilowatt Hours (kWh) and multiplied by 30 days to obtain your estimated monthly units."
    },
    {
      id: "faq_2",
      category: "usage",
      question: "What is the mathematical formula used for calculations?",
      answer: "The formula is:\nMonthly Units (kWh) = [Wattage / 1000] * Quantity * Daily Usage (Hours) * 30 days.\nFor example, if you run one AC (1500 Watts) for 6 hours daily, its monthly consumption is: (1500 / 1000) * 1 * 6 * 30 = 270 kWh."
    },
    {
      id: "faq_3",
      category: "billing",
      question: "How is the electricity bill estimated?",
      answer: "The bill is estimated using the official AP LT-I domestic electricity tariff slabs. The app calculates the net energy charge by distributing your monthly unit consumption across these slabs, applying corresponding rates, and accounting for government subsidies."
    },
    {
      id: "faq_4",
      category: "billing",
      question: "What are the exact AP Domestic (LT-I) tariff rates used?",
      answer: "We apply the official AP LT-I slabs:\n• 0 – 30 units: ₹1.90 / unit\n• 31 – 75 units: ₹3.00 / unit\n• 76 – 125 units: ₹4.50 / unit\n• 126 – 225 units: ₹6.00 / unit\n• 226 – 400 units: ₹8.75 / unit\n• Above 400 units: ₹9.75 / unit."
    },
    {
      id: "faq_5",
      category: "billing",
      question: "How is the government subsidy calculated in my bill?",
      answer: "APDISCOM billing structures display a Gross Energy Charge minus a Government Subsidy, which yields the Net Energy Charge. The app calculates Net charges directly from the slab rules, then applies the scaling factor (Gross = Net * 1.402, Subsidy = Gross - Net) to replicate this exact APDISCOM billing format. For 132 units, this results in a ₹643.50 gross charge, ₹184.50 subsidy, and ₹459.00 net bill."
    },
    {
      id: "faq_6",
      category: "privacy",
      question: "Is my energy consumption data private and secure?",
      answer: "Yes, security is a priority. Every user has their own private dashboard. Your appliance data, calculations, and survey records are stored securely in your private account and cannot be accessed by other users. This isolation is strictly enforced by Firebase security rules."
    },
    {
      id: "faq_7",
      category: "privacy",
      question: "Do I need to create an account to use the application?",
      answer: "Yes. An account is required so that your custom appliances list, daily usage configurations, and calculation history can be saved securely in the cloud under your profile. This allows you to log in from any device and view your history."
    },
    {
      id: "faq_8",
      category: "usage",
      question: "How does the 'My Energy History' dashboard work?",
      answer: "Whenever you click the 'Analyze' button on the dashboard, the calculated energy profile is auto-saved as a record. You can search, sort by date/consumption/bill amount, delete past calculations, or load them to review previous configurations."
    },
    {
      id: "faq_9",
      category: "tips",
      question: "How are the energy-saving recommendations generated?",
      answer: "The system analyzes your active appliances list to identify items consuming the most energy. It then suggests specific changes—such as reducing AC usage by 2 hours, upgrading to BEE 5-star LEDs, or defroster optimizations—along with expected monthly savings."
    },
    {
      id: "faq_10",
      category: "tips",
      question: "How are the savings estimations calculated?",
      answer: "The savings are calculated by subtracting the recommended reduction in daily kWh from your active total consumption. The system recalculates the slab-rate bill for this lower consumption, and the difference from your original bill represents your estimated savings."
    },
    {
      id: "faq_11",
      category: "usage",
      question: "Which household appliances does the app currently support?",
      answer: "The app supports the most common household appliances: Air Conditioners (AC), Refrigerators, Water Heaters, Washing Machines, Televisions (TV), Fans, Laptops, and LED Lights."
    },
    {
      id: "faq_12",
      category: "privacy",
      question: "Can I export my calculation history or delete my data?",
      answer: "Yes. In the Settings panel, you can download a full backup of all your reports in JSON format. You can also permanently delete your entire reports calculation history with a single click."
    }
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-6 text-left">
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-7 h-7 text-primary-blue dark:text-primary-green" />
          Frequently Asked Questions
        </h1>
        <p className="text-sm font-semibold text-slate-550 dark:text-slate-450 mt-1">
          Have questions about calculations, AP Lt-I slabs, or data privacy? We've compiled detailed answers below.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search FAQs by keywords..."
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/10 dark:text-white shadow-sm"
        />
      </div>

      {/* Categories Badge row */}
      <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 px-2.5 py-1 rounded-full"><Sparkles className="w-3 h-3" /> Tips & Savings</span>
        <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 px-2.5 py-1 rounded-full"><Shield className="w-3 h-3" /> Privacy & Security</span>
        <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 px-2.5 py-1 rounded-full"><Cpu className="w-3 h-3" /> Technical Math</span>
        <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 px-2.5 py-1 rounded-full"><BadgeCheck className="w-3 h-3" /> AP LT-I Slabs</span>
      </div>

      {/* FAQs List */}
      {filteredFaqs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 font-semibold text-xs">
          No FAQs match your search keyword. Try typing another question.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-md hover:text-primary-blue dark:hover:text-primary-green focus:outline-none"
                >
                  <span className="pr-4">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 text-slate-400"
                  >
                    <ChevronDown className="w-4.5 h-4.5" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs sm:text-sm text-slate-550 dark:text-slate-400 leading-relaxed font-semibold whitespace-pre-line">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
