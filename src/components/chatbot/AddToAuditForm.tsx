import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus, Check } from 'lucide-react';
import { CATEGORY_TO_AUDIT_ID } from '../../services/energyEstimator';
import type { ApplianceSpec } from '../../services/energyEstimator';

interface AddToAuditFormProps {
  spec: ApplianceSpec;
  onConfirm: () => void;
  onCancel: () => void;
}

const AddToAuditForm: React.FC<AddToAuditFormProps> = ({ spec, onConfirm, onCancel }) => {
  const [hours, setHours] = useState(spec.suggestedDailyHours);
  const [quantity, setQuantity] = useState(1);

  const handleConfirm = () => {
    const auditId = CATEGORY_TO_AUDIT_ID[spec.category] || spec.auditCategory || 'fan';
    window.dispatchEvent(new CustomEvent<AddApplianceEventDetail>('she_add_appliance', {
      detail: {
        applianceId: auditId,
        watts: spec.ratedPowerW,
        hours,
        quantity,
        displayName: spec.name
      }
    }));
    onConfirm();
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      <div className="bg-white/25 dark:bg-slate-900/25 border border-white/15 dark:border-slate-800/30 rounded-xl p-3 space-y-2.5">
        <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Configure for audit</div>

        {/* Pre-filled info */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="text-[9px]"><span className="text-slate-400 dark:text-slate-500 font-bold">Appliance:</span> <span className="text-slate-700 dark:text-slate-300 font-semibold">{spec.name}</span></div>
          <div className="text-[9px]"><span className="text-slate-400 dark:text-slate-500 font-bold">Category:</span> <span className="text-slate-700 dark:text-slate-300 font-semibold">{spec.category}</span></div>
          <div className="text-[9px]"><span className="text-slate-400 dark:text-slate-500 font-bold">Power:</span> <span className="text-slate-700 dark:text-slate-300 font-semibold">{spec.ratedPowerW}W</span></div>
          <div className="text-[9px]"><span className="text-slate-400 dark:text-slate-500 font-bold">Brand:</span> <span className="text-slate-700 dark:text-slate-300 font-semibold">{spec.brand}</span></div>
        </div>

        {/* Editable fields */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Hours/Day</label>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(Math.max(0.1, Math.min(24, parseFloat(e.target.value) || 0)))}
                step="0.5"
                min="0.1"
                max="24"
                className="w-full px-2 py-1.5 bg-white/30 dark:bg-slate-900/30 border border-white/15 dark:border-slate-800/35 rounded-lg text-[11px] font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-blue/30"
              />
            </div>
          </div>
          <div>
            <label className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Quantity</label>
            <div className="flex items-center gap-1">
              <Plus className="w-3 h-3 text-slate-400" />
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                min="1"
                max="20"
                className="w-full px-2 py-1.5 bg-white/30 dark:bg-slate-900/30 border border-white/15 dark:border-slate-800/35 rounded-lg text-[11px] font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-blue/30"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-3 py-1.5 bg-white/20 dark:bg-slate-900/20 border border-white/10 dark:border-slate-800/30 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 cursor-pointer transition-all hover:bg-white/40 dark:hover:bg-slate-900/40 active:scale-[0.97]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.97] shadow-sm"
          >
            <Check className="w-3 h-3" />
            Confirm & Add
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AddToAuditForm;
