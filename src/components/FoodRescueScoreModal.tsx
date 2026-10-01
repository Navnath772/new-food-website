import React from 'react';
import { AlertTriangle, CheckCircle, Info, Sparkles, X, ShieldCheck, Clock, MapPin, Scale, Heart } from 'lucide-react';
import { FoodRescueScoreBreakdown } from '../types/index.ts';

interface FoodRescueScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodName: string;
  breakdown?: FoodRescueScoreBreakdown;
}

export const FoodRescueScoreModal: React.FC<FoodRescueScoreModalProps> = ({
  isOpen,
  onClose,
  foodName,
  breakdown,
}) => {
  if (!isOpen || !breakdown) return null;

  const getPriorityColor = (label: string) => {
    switch (label) {
      case 'CRITICAL PRIORITY':
        return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'HIGH PRIORITY':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'MEDIUM PRIORITY':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="text-xs font-semibold tracking-wider text-emerald-300 uppercase">
                Explainable Intelligence Engine
              </div>
              <h2 className="text-lg font-bold text-white">Food Rescue Score™ Analysis</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Target Food & Score Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Analyzed Surplus Batch</div>
              <div className="text-base font-bold text-gray-900 dark:text-white">{foodName}</div>
              <div className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getPriorityColor(breakdown.priorityLabel)}`}>
                {breakdown.priorityLabel}
              </div>
            </div>

            {/* Circular Progress Gauge */}
            <div className="flex items-center space-x-3">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200 dark:text-slate-700"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500 transition-all duration-1000 ease-out"
                    strokeDasharray={`${breakdown.totalScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-base font-black text-gray-900 dark:text-white leading-none">
                    {breakdown.totalScore}
                  </span>
                  <span className="block text-[8px] text-gray-400 font-semibold">/ 100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transparent Scoring Formula */}
          <div>
            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
              5-Factor Score Breakdown
            </h3>
            <div className="space-y-3">
              {/* Urgency */}
              <div className="p-3 rounded-lg border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center text-gray-700 dark:text-gray-200">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                    Urgency & Shelf-Life Window (30%)
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {breakdown.urgencyScore} / 30 pts
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full"
                    style={{ width: `${(breakdown.urgencyScore / 30) * 100}%` }}
                  />
                </div>
              </div>

              {/* Distance */}
              <div className="p-3 rounded-lg border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center text-gray-700 dark:text-gray-200">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                    Proximity & Transit Radius (20%)
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {breakdown.distanceScore} / 20 pts
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{ width: `${(breakdown.distanceScore / 20) * 100}%` }}
                  />
                </div>
              </div>

              {/* Demand Compatibility */}
              <div className="p-3 rounded-lg border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center text-gray-700 dark:text-gray-200">
                    <Heart className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
                    Demand Compatibility & Diet Match (20%)
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {breakdown.demandScore} / 20 pts
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5">
                  <div
                    className="bg-rose-500 h-1.5 rounded-full"
                    style={{ width: `${(breakdown.demandScore / 20) * 100}%` }}
                  />
                </div>
              </div>

              {/* Quantity */}
              <div className="p-3 rounded-lg border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center text-gray-700 dark:text-gray-200">
                    <Scale className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                    Portion Quantity & Meal Impact (15%)
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {breakdown.quantityScore} / 15 pts
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{ width: `${(breakdown.quantityScore / 15) * 100}%` }}
                  />
                </div>
              </div>

              {/* Food Safety */}
              <div className="p-3 rounded-lg border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center text-gray-700 dark:text-gray-200">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-teal-500" />
                    Food Safety Inspection & Temp Verification (15%)
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {breakdown.safetyScore} / 15 pts
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5">
                  <div
                    className="bg-teal-500 h-1.5 rounded-full"
                    style={{ width: `${(breakdown.safetyScore / 15) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reasoning Insights */}
          <div>
            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Explainable Decision Factors
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
              {breakdown.explanation.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Clarification Disclosure */}
          <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start space-x-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Transparent Explainability Disclosure:</span> The Food Rescue Score™ is computed by a multi-factor deterministic algorithm designed to prioritize rapid delivery before cooked meals spoil. It is not an unverified black-box model.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-gray-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
