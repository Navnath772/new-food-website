import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  ShieldAlert,
  ShieldCheck,
  Thermometer,
  X,
  Info,
} from 'lucide-react';
import { FoodDonation } from '../types/index.ts';

interface FoodSafetyCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  donation?: FoodDonation | null;
  onSubmitDeclaration?: (safetyData: any) => void;
}

export const FoodSafetyCenterModal: React.FC<FoodSafetyCenterModalProps> = ({
  isOpen,
  onClose,
  donation,
  onSubmitDeclaration,
}) => {
  const [temperature, setTemperature] = useState<number>(65);
  const [storageMethod, setStorageMethod] = useState<'Hot Hold' | 'Refrigerated' | 'Ambient' | 'Insulated Container'>('Hot Hold');
  const [packagingCondition, setPackagingCondition] = useState<'Intact & Food Grade' | 'Damaged'>('Intact & Food Grade');
  const [preparationVerified, setPreparationVerified] = useState(true);
  const [noContamination, setNoContamination] = useState(true);
  const [handlerConfirmed, setHandlerConfirmed] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  // Temperature safety logic
  const isTempCritical = storageMethod === 'Hot Hold' ? temperature < 60 : storageMethod === 'Refrigerated' ? temperature > 8 : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isTempCritical || packagingCondition === 'Damaged' || !noContamination) {
      alert('SAFETY ALERT: Donation parameters violate food safety protocol. Dispatch will be blocked.');
      return;
    }

    if (onSubmitDeclaration) {
      onSubmitDeclaration({
        donation_id: donation?.id,
        temperature_c: temperature,
        storage_method: storageMethod,
        packaging_intact: packagingCondition === 'Intact & Food Grade',
        preparation_time_verified: preparationVerified,
        contamination_check: noContamination,
        handler_verified: handlerConfirmed,
        overall_status: 'SAFE',
      });
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="text-xs font-semibold tracking-wider text-emerald-300 uppercase">
                Zero-Compromise Public Health Protocol
              </div>
              <h2 className="text-base font-bold text-white">Food Safety Inspection Center</h2>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {donation && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Auditing Batch</span>
                <span className="font-bold text-gray-900 dark:text-white">{donation.food_name}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {donation.safety_status}
              </span>
            </div>
          )}

          {/* Critical Temperature Check */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <label className="flex items-center text-gray-700 dark:text-gray-300">
                <Thermometer className="w-4 h-4 mr-1 text-emerald-600" />
                Food Storage & Temperature (°C)
              </label>
              <span className={`font-mono font-bold ${isTempCritical ? 'text-rose-600' : 'text-emerald-600'}`}>
                {temperature}°C ({storageMethod})
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {(['Hot Hold', 'Refrigerated', 'Ambient', 'Insulated Container'] as const).map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => {
                    setStorageMethod(method);
                    if (method === 'Hot Hold') setTemperature(65);
                    if (method === 'Refrigerated') setTemperature(4);
                    if (method === 'Ambient') setTemperature(22);
                  }}
                  className={`p-2 rounded-lg border text-center transition-colors ${
                    storageMethod === method
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            <input
              type="range"
              min={0}
              max={100}
              value={temperature}
              onChange={(e) => setTemperature(parseInt(e.target.value))}
              className="w-full accent-emerald-600"
            />
            {isTempCritical && (
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Temperature danger zone: Hot foods must be &gt;60°C; chilled foods must be &lt;8°C.
                </span>
              </div>
            )}
          </div>

          {/* 7-Point Safety Verification Toggles */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Safety Verification Checklist
            </h4>
            <div className="space-y-2 text-xs">
              <label className="flex items-center space-x-2.5 p-2 rounded-lg border border-gray-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60">
                <input
                  type="checkbox"
                  checked={packagingCondition === 'Intact & Food Grade'}
                  onChange={(e) => setPackagingCondition(e.target.checked ? 'Intact & Food Grade' : 'Damaged')}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Food packaging is sealed, clean, and food-grade standard
                </span>
              </label>

              <label className="flex items-center space-x-2.5 p-2 rounded-lg border border-gray-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60">
                <input
                  type="checkbox"
                  checked={preparationVerified}
                  onChange={(e) => setPreparationVerified(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Preparation timestamp verified within authorized kitchen shift
                </span>
              </label>

              <label className="flex items-center space-x-2.5 p-2 rounded-lg border border-gray-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60">
                <input
                  type="checkbox"
                  checked={noContamination}
                  onChange={(e) => setNoContamination(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  No signs of sensory spoilage, cross-contamination, or physical debris
                </span>
              </label>

              <label className="flex items-center space-x-2.5 p-2 rounded-lg border border-gray-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60">
                <input
                  type="checkbox"
                  checked={handlerConfirmed}
                  onChange={(e) => setHandlerConfirmed(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Authorized kitchen supervisor signature & personal hygiene declaration confirmed
                </span>
              </label>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start space-x-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Legal Notice:</strong> Distribution window estimate. Final food-safety responsibility remains with the donor kitchen supervisor and authorized courier handlers.
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isTempCritical || packagingCondition === 'Damaged' || !noContamination}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
            >
              {submitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Declaration Recorded!</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>Submit Safety Declaration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
