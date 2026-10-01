import React from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  ShieldCheck,
  Truck,
  UserCheck,
  Utensils,
  ChevronRight,
  Compass,
  KeyRound,
} from 'lucide-react';
import { FoodDonation } from '../types/index.ts';

interface RescueMissionTrackerProps {
  donation: FoodDonation;
  onOpenLiveMap?: (donationId: string) => void;
  onOpenLedger?: (donation: FoodDonation) => void;
}

export const RescueMissionTracker: React.FC<RescueMissionTrackerProps> = ({
  donation,
  onOpenLiveMap,
  onOpenLedger,
}) => {
  const stages = [
    { key: 'PUBLISHED', label: 'Donation Created', icon: Utensils },
    { key: 'MATCHED', label: 'AI Analyzed', icon: Compass },
    { key: 'ACCEPTED', label: 'NGO Accepted', icon: UserCheck },
    { key: 'VOLUNTEER_ASSIGNED', label: 'Courier Assigned', icon: Navigation },
    { key: 'PICKED_UP', label: 'Pickup Verified (OTP)', icon: KeyRound },
    { key: 'IN_TRANSIT', label: 'In Transit', icon: Truck },
    { key: 'COMPLETED', label: 'Delivered', icon: ShieldCheck },
  ];

  const getStageStatus = (stageKey: string): 'completed' | 'active' | 'pending' => {
    const statusOrder = [
      'PUBLISHED',
      'MATCHED',
      'ACCEPTED',
      'VOLUNTEER_ASSIGNED',
      'PICKED_UP',
      'IN_TRANSIT',
      'DELIVERED',
      'COMPLETED',
    ];

    const currentIdx = statusOrder.indexOf(donation.status === 'DELIVERED' ? 'COMPLETED' : donation.status);
    let stageIdx = statusOrder.indexOf(stageKey);
    if (stageKey === 'MATCHED') stageIdx = 1;

    if (currentIdx > stageIdx) return 'completed';
    if (currentIdx === stageIdx) return 'active';
    return 'pending';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-5 space-y-4">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
              Live Mission
            </span>
            <span className="text-xs font-mono font-bold text-gray-500">#{donation.id.toUpperCase()}</span>
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">
            {donation.food_name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {donation.quantity} {donation.unit} · {donation.estimated_meals} portions · From {donation.donor_name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenLedger && (
            <button
              onClick={() => onOpenLedger(donation)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Digital Custody Ledger
            </button>
          )}
          {onOpenLiveMap && (
            <button
              onClick={() => onOpenLiveMap(donation.id)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Track on Map</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="relative pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {stages.map((stage, idx) => {
            const status = getStageStatus(stage.key);
            const Icon = stage.icon;

            return (
              <div
                key={stage.key}
                className={`p-3 rounded-xl border transition-all ${
                  status === 'completed'
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                    : status === 'active'
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/20 animate-pulse'
                    : 'bg-gray-50/70 dark:bg-slate-800/40 border-gray-100 dark:border-slate-800 text-gray-400 dark:text-gray-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold">0{idx + 1}</span>
                  {status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {status === 'active' && <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />}
                </div>
                <div className="text-xs font-bold leading-tight">{stage.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mission Key Attributes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-xs">
        <div>
          <span className="text-gray-400 block text-[10px] uppercase font-bold">Estimated Meals</span>
          <span className="font-bold text-gray-800 dark:text-gray-200">{donation.estimated_meals} Portions</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px] uppercase font-bold">Priority Status</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{donation.priority_level}</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px] uppercase font-bold">Recipient Shelter</span>
          <span className="font-bold text-gray-800 dark:text-gray-200 truncate block">
            {donation.assigned_ngo_name || 'Allocating Candidate...'}
          </span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px] uppercase font-bold">Assigned Courier</span>
          <span className="font-bold text-gray-800 dark:text-gray-200 truncate block">
            {donation.assigned_volunteer_name || 'Seeking Courier...'}
          </span>
        </div>
      </div>
    </div>
  );
};
