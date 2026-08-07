import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ExternalLink, Plus } from 'lucide-react';
import AddToAuditForm from './AddToAuditForm';
import type { ApplianceSpec } from '../../services/energyEstimator';

interface ApplianceResultCardProps {
  spec: ApplianceSpec;
  onAddToAudit: () => void;
  onViewProduct: () => void;
  showAddForm: boolean;
  onToggleAddForm: () => void;
}

const ApplianceResultCard: React.FC<ApplianceResultCardProps> = ({ spec, onAddToAudit, onViewProduct, showAddForm, onToggleAddForm }) => {
  const confidenceConfig = {
    high: { emoji: "🟢", label: "High", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
    medium: { emoji: "🟡", label: "Medium", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
    low: { emoji: "🔴", label: "Low", color: "text-red-500 dark:text-red-400", bg: "bg-red-500/10" }
  };
  const conf = confidenceConfig[spec.confidence];

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <span className="text-amber-500 text-xs tracking-tight">
        {Array.from({ length: rating }, (_, i) => <span key={i}>★</span>)}
        {Array.from({ length: 5 - rating }, (_, i) => <span key={i} className="text-slate-300 dark:text-slate-600">★</span>)}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="my-2.5 rounded-2xl overflow-hidden border border-white/25 dark:border-slate-800/50 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md"
    >
      {/* Gradient top accent */}
      <div className="h-1 bg-gradient-to-r from-primary-blue via-cyan-500 to-primary-green" />

      <div className="p-3.5 bg-white/30 dark:bg-slate-900/35 space-y-3">
        {/* Header */}
        <div>
          <h4 className="text-[13px] font-display font-black text-slate-800 dark:text-white leading-tight">{spec.name}</h4>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{spec.category}</p>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/40 dark:bg-slate-900/30 p-2 rounded-xl border border-white/15 dark:border-slate-800/30">
            <span className="text-[8px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider block">Power</span>
            <span className="text-[12px] font-black text-slate-800 dark:text-white">{spec.ratedPowerW}W</span>
          </div>
          {spec.annualEnergyKwh && (
            <div className="bg-white/40 dark:bg-slate-900/30 p-2 rounded-xl border border-white/15 dark:border-slate-800/30">
              <span className="text-[8px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider block">Annual</span>
              <span className="text-[12px] font-black text-slate-800 dark:text-white">{spec.annualEnergyKwh} kWh</span>
            </div>
          )}
          {spec.energyStarRating && (
            <div className="bg-white/40 dark:bg-slate-900/30 p-2 rounded-xl border border-white/15 dark:border-slate-800/30">
              <span className="text-[8px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider block">Rating</span>
              {renderStars(spec.energyStarRating)}
            </div>
          )}
        </div>

        {/* Confidence */}
        <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl ${conf.bg}`}>
          <span className="text-xs">{conf.emoji}</span>
          <span className={`text-[10px] font-bold ${conf.color}`}>Confidence: {conf.label}</span>
          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">— {spec.confidenceReason}</span>
        </div>

        {/* Source */}
        <div className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-450 dark:text-slate-500">
          <span>Source:</span>
          <span className="text-primary-blue dark:text-primary-green">{spec.source}</span>
        </div>

        {/* AI Explanation */}
        <div className="bg-cyan-500/5 dark:bg-cyan-500/5 border border-cyan-500/15 dark:border-cyan-500/10 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3 h-3 text-cyan-500" />
            <span className="text-[9px] font-black text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">Why this value?</span>
          </div>
          <p className="text-[10px] text-slate-600 dark:text-slate-350 font-medium leading-relaxed">
            This appliance's {spec.confidence === 'high' ? 'official specification lists' : spec.confidence === 'medium' ? 'closest matching model suggests' : 'category average estimates'} a rated operating power of approximately <strong className="text-slate-800 dark:text-white">{spec.ratedPowerW}W</strong>.
            {spec.category === 'Refrigerator' && ' Actual consumption depends on compressor duty cycle and ambient temperature.'}
            {spec.category === 'Air Conditioner' && ' Actual consumption varies with room size, insulation, and set temperature.'}
            {spec.category === 'Laptop' && ' Actual consumption varies with workload, screen brightness, and battery state.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {spec.productUrl && (
            <button
              type="button"
              onClick={onViewProduct}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/30 hover:bg-white/50 dark:bg-slate-900/25 dark:hover:bg-slate-900/50 border border-white/15 dark:border-slate-800/35 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ExternalLink className="w-3 h-3" />
              View Product
            </button>
          )}
          <button
            type="button"
            onClick={onToggleAddForm}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-primary-blue to-primary-green dark:from-primary-green dark:to-emerald-500 text-white dark:text-slate-950 rounded-xl text-[10px] font-bold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
          >
            <Plus className="w-3 h-3" />
            {showAddForm ? 'Hide Form' : 'Add to Energy Audit'}
          </button>
        </div>

        {/* Add to Audit Form */}
        <AnimatePresence>
          {showAddForm && (
            <AddToAuditForm spec={spec} onConfirm={onAddToAudit} onCancel={onToggleAddForm} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ApplianceResultCard;
