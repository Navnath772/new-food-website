import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, Flame, Sparkles, Truck, Utensils, ChevronRight } from 'lucide-react';
import { FoodDonation } from '../types/index.ts';

interface RaceAgainstWasteBannerProps {
  urgentDonation: FoodDonation | null;
  onRescueNow: (donation: FoodDonation) => void;
  onNavigateToMap: (donationId?: string) => void;
}

export const RaceAgainstWasteBanner: React.FC<RaceAgainstWasteBannerProps> = ({
  urgentDonation,
  onRescueNow,
  onNavigateToMap,
}) => {
  const [minsRemaining, setMinsRemaining] = useState<number>(47);
  const [percentLeft, setPercentLeft] = useState<number>(38);

  useEffect(() => {
    if (!urgentDonation) return;

    const updateTimer = () => {
      const now = Date.now();
      const exp = new Date(urgentDonation.expiry_time).getTime();
      const diffMs = exp - now;
      if (diffMs <= 0) {
        setMinsRemaining(0);
        setPercentLeft(0);
        return;
      }
      const mins = Math.max(1, Math.round(diffMs / 60000));
      setMinsRemaining(mins);
      // Assume a 3-hour distribution window for percentage gauge
      const totalWindowMins = (urgentDonation.estimated_shelf_life_hours || 3) * 60;
      const pct = Math.min(100, Math.max(5, Math.round((mins / totalWindowMins) * 100)));
      setPercentLeft(pct);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 5000);
    return () => clearInterval(interval);
  }, [urgentDonation]);

  if (!urgentDonation) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-5 sm:p-6 shadow-xl border border-red-400/40 transform transition-all animate-in fade-in">
      {/* Background glow and subtle pulsing indicator */}
      <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 flex-1">
          <div className="flex items-center space-x-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <span className="text-[11px] uppercase font-black tracking-widest text-amber-100 bg-black/20 px-2.5 py-0.5 rounded-full border border-white/20">
              ⏱ Race Against Waste — Critical Urgency Clock
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center space-x-2">
            <span>{minsRemaining} MINUTES REMAINING</span>
            <span className="text-amber-200">·</span>
            <span className="text-amber-200 font-bold text-lg sm:text-xl">
              {urgentDonation.estimated_meals || urgentDonation.quantity} MEALS AT RISK
            </span>
          </h3>

          <p className="text-xs text-red-100 max-w-xl">
            Surplus cooked meal from <strong>{urgentDonation.donor_name}</strong> is nearing safe consumption deadline. Immediate courier dispatch is recommended.
          </p>

          {/* Progress Visual Bar */}
          <div className="space-y-1 pt-1 max-w-md">
            <div className="w-full bg-black/30 rounded-full h-2.5 overflow-hidden border border-white/20">
              <div
                className="h-full bg-gradient-to-r from-yellow-300 to-white rounded-full transition-all duration-1000 ease-out animate-pulse"
                style={{ width: `${percentLeft}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-amber-100 font-mono">
              <span>{urgentDonation.food_name}</span>
              <span>Distribution Deadline Approaching</span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateToMap(urgentDonation.id)}
            className="px-4 py-2.5 rounded-2xl bg-black/30 hover:bg-black/40 border border-white/30 text-white text-xs font-bold transition-all"
          >
            Locate on Radar
          </button>

          <button
            onClick={() => onRescueNow(urgentDonation)}
            className="px-5 py-2.5 rounded-2xl bg-white hover:bg-amber-50 text-red-700 hover:text-red-800 text-xs sm:text-sm font-black shadow-lg shadow-black/20 transition-all transform active:scale-95 flex items-center space-x-1.5"
          >
            <Flame className="w-4 h-4 text-red-600 animate-bounce" />
            <span>RESCUE NOW</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
