import React from 'react';
import { BookOpen, Calculator, Globe, Info, Scale, X } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="text-xs font-semibold tracking-wider text-emerald-300 uppercase">
                Environmental & Social Accounting
              </div>
              <h2 className="text-base font-bold text-white">Impact Calculation Methodology</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-gray-700 dark:text-gray-300">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>1. Food Weight & Meal Portions</span>
            </h3>
            <p className="leading-relaxed">
              Meals are converted into physical weight estimates using standardized catering portion conversions:
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-[11px] space-y-1">
              <div>1 Prepared Meal Portion ≈ 0.35 kg (350 grams cooked food)</div>
              <div>1 Standard Catering Tray ≈ 4.2 kg (12 adult meal portions)</div>
              <div>1 Packet / Box ≈ 1 standard meal portion</div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>2. Greenhouse Gas (CO₂e) Avoidance Factor</span>
            </h3>
            <p className="leading-relaxed">
              When cooked food degrades in municipal landfills, anaerobic decomposition generates methane gas (CH₄), which has a global warming potential 28 times greater than carbon dioxide over a 100-year horizon.
            </p>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-mono text-[11px]">
              <div>CO₂e Avoided (kg) = Diverted Food (kg) × 4.43</div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1">
                Source: UN Food and Agriculture Organization (FAO) Food Wastage Footprint &amp; US EPA WARM model for prepared mixed meals.
              </div>
            </div>
          </div>

          {/* Mandatory User Prompt Disclosure */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-xs">
              <Info className="w-4 h-4 text-amber-600" />
              <span>Illustrative Estimate Disclosure</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Illustrative estimate. Conversion factors can be configured based on the specific ecological methodology selected by the deployment municipal authority or NGO partner.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-gray-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
