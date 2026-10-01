import React from 'react';
import { CheckCircle2, Clock, FileText, ShieldCheck, X, ArrowDown } from 'lucide-react';
import { FoodDonation } from '../types/index.ts';

interface RescueLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  donation: FoodDonation | null;
}

export const RescueLedgerModal: React.FC<RescueLedgerModalProps> = ({
  isOpen,
  onClose,
  donation,
}) => {
  if (!isOpen || !donation) return null;

  const ledger = donation.custody_ledger || [
    {
      id: 'cust-fallback-1',
      timestamp: donation.created_at,
      stage: 'DONATION_PUBLISHED',
      actor: donation.donor_name,
      details: `Published ${donation.quantity} ${donation.unit} of ${donation.food_name}`,
      status: 'COMPLETED',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                Digital Chain of Custody
              </div>
              <h2 className="text-lg font-bold text-white">Food Rescue Ledger #{donation.id.toUpperCase()}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Food Description</span>
              <span className="font-bold text-gray-900 dark:text-white text-sm">{donation.food_name}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Portions</span>
              <span className="font-bold text-gray-900 dark:text-white">{donation.estimated_meals} Meals</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Dual-OTP Handshake</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                P-OTP: {donation.pickup_otp || '••••'} / D-OTP: {donation.delivery_otp || '••••'}
              </span>
            </div>
          </div>

          {/* Timeline Ledger */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-emerald-200 dark:before:bg-emerald-900">
            {ledger.map((event, index) => (
              <div key={event.id || index} className="relative group">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] text-gray-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                      {event.stage}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    Responsible Actor: <span className="font-bold text-emerald-600 dark:text-emerald-400">{event.actor}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{event.details}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300">
            <strong>Chain of Custody Guarantee:</strong> Every physical transfer of surplus food is authenticated with digital timestamps and dual-party PIN handshakes to eliminate lost deliveries and ensure public health compliance.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-gray-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors"
          >
            Close Ledger
          </button>
        </div>
      </div>
    </div>
  );
};
