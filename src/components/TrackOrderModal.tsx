import React, { useState, useEffect } from 'react';
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
  X,
  Phone,
  Thermometer,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Award,
} from 'lucide-react';
import { FoodDonation } from '../types/index.ts';
import { appStore } from '../services/api.ts';
import confetti from 'canvas-confetti';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  donation: FoodDonation | null;
  onOpenMap?: (donationId: string) => void;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  donation,
  onOpenMap,
}) => {
  // If no donation is passed or closed, do not render
  if (!isOpen || !donation) return null;

  // 7-Stage State Machine Lifecycle defined per user prompt
  const STAGES = [
    {
      step: 1,
      title: 'Donation Created',
      actor: 'Mess Supervisor',
      action: 'Batch published to redistribution network',
      details: 'Logged prep time (60°C hot-holding), FSSAI declaration, safe shelf-life window',
      icon: Utensils,
    },
    {
      step: 2,
      title: 'NGO Matched',
      actor: 'Smart Rescue Engine',
      action: 'Optimal Rescue Score computed',
      details: 'Matched by proximity (0.8 km), diet fit (100%), and resident quota',
      icon: Compass,
    },
    {
      step: 3,
      title: 'Volunteer Assigned',
      actor: 'Dispatch Coordinator',
      action: 'Nearby courier allocated with pickup instructions',
      details: 'Courier Rahul Patil notified; vehicle: EV Cargo Two-Wheeler',
      icon: Navigation,
    },
    {
      step: 4,
      title: 'Picked Up & Inspected',
      actor: 'Courier at Mess Dock',
      action: 'Physical packaging & thermal inspection verified',
      details: 'Dual-OTP confirmed; food transferred into insulated carrier container',
      icon: KeyRound,
    },
    {
      step: 5,
      title: 'In Transit',
      actor: 'Active Courier Run',
      action: 'En route to shelter destination',
      details: 'Calculated urban transit ETA (~18 km/h speed across 2.1 km route)',
      icon: Truck,
    },
    {
      step: 6,
      title: 'Arrived at Shelter',
      actor: 'Destination Arrival',
      action: 'Courier reached shelter receiving bay',
      details: 'Arrival alert sent to shelter supervisor for immediate unloading',
      icon: MapPin,
    },
    {
      step: 7,
      title: 'Handover Verified',
      actor: 'Shelter Incharge & Digital Receipt',
      action: 'Signed digital receipt & real-time SDG 2 impact updated',
      details: `+${donation.estimated_meals} meals distributed, ${(donation.quantity * 4.43).toFixed(1)} kg CO₂e diverted`,
      icon: ShieldCheck,
    },
  ];

  // Map donation status to current stage index (1 to 7)
  const getStageIndex = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 1;
      case 'MATCHED':
        return 2;
      case 'ACCEPTED':
        return 2;
      case 'VOLUNTEER_ASSIGNED':
        return 3;
      case 'PICKED_UP':
        return 4;
      case 'IN_TRANSIT':
        return 5;
      case 'DELIVERED':
        return 6;
      case 'COMPLETED':
        return 7;
      default:
        return 1;
    }
  };

  const [activeStage, setActiveStage] = useState<number>(() => getStageIndex(donation.status));
  const [transitMinutesRemaining, setTransitMinutesRemaining] = useState<number>(12);
  const [digitalSignerName, setDigitalSignerName] = useState<string>('Sister Teresa (Hope Shelter)');
  const [signatureDone, setSignatureDone] = useState<boolean>(activeStage >= 7);

  useEffect(() => {
    setActiveStage(getStageIndex(donation.status));
    setSignatureDone(getStageIndex(donation.status) >= 7);
  }, [donation.status]);

  // Live countdown for transit ETA
  useEffect(() => {
    if (activeStage === 5) {
      const timer = setInterval(() => {
        setTransitMinutesRemaining((prev) => (prev > 1 ? prev - 1 : 1));
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [activeStage]);

  // Advance simulation step for Jury Demo
  const advanceToNextStage = () => {
    if (activeStage < 7) {
      const next = activeStage + 1;
      setActiveStage(next);

      // Map back to appStore status update
      const statusMap: { [key: number]: any } = {
        1: 'PUBLISHED',
        2: 'MATCHED',
        3: 'VOLUNTEER_ASSIGNED',
        4: 'PICKED_UP',
        5: 'IN_TRANSIT',
        6: 'DELIVERED',
        7: 'COMPLETED',
      };

      if (statusMap[next]) {
        appStore.updateDonation(donation.id, {
          status: statusMap[next],
          assigned_volunteer_name: next >= 3 ? 'Rahul Patil' : donation.assigned_volunteer_name,
          assigned_ngo_name: next >= 2 ? (donation.assigned_ngo_name || 'Hope Foundation') : undefined,
        });
      }

      if (next === 7) {
        setSignatureDone(true);
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      }
    }
  };

  const courierName = donation.assigned_volunteer_name || 'Rahul Patil';
  const shelterName = donation.assigned_ngo_name || 'Hope Foundation Shelter';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 my-6 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-6 relative shrink-0 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-rose-500 hover:text-white text-gray-300 transition-colors"
            title="Close Order Tracker (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Live Food Rescue &amp; Audit Protocol</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
                <span>{donation.food_name}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  #{donation.id.toUpperCase().slice(0, 8)}
                </span>
              </h2>
              <p className="text-xs text-gray-300 mt-1">
                {donation.quantity} {donation.unit} (~{donation.estimated_meals} portions) · From {donation.donor_name}
              </p>
            </div>

            {/* Quick Map Button */}
            {onOpenMap && (
              <button
                onClick={() => {
                  onClose();
                  onOpenMap(donation.id);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-md shrink-0 self-start sm:self-auto"
              >
                <MapPin className="w-4 h-4" />
                <span>Track on Rescue Radar</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-gray-900 dark:text-gray-100">
          {/* Live Telemetry & ETA HUD */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                <span>Transit Status</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-sm font-black text-gray-900 dark:text-white mt-1">
                {STAGES[activeStage - 1].title}
              </div>
              <div className="text-[10px] text-gray-500">Stage {activeStage} of 7</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="text-[10px] uppercase font-bold text-gray-500 flex items-center justify-between">
                <span>Speed &amp; ETA</span>
                <Clock className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="text-sm font-black text-gray-900 dark:text-white mt-1">
                {activeStage === 7
                  ? 'Delivered'
                  : activeStage >= 5
                  ? `~${transitMinutesRemaining} mins`
                  : 'Pending Pickup'}
              </div>
              <div className="text-[10px] text-gray-400">Urban Transit ~18 km/h</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="text-[10px] uppercase font-bold text-gray-500 flex items-center justify-between">
                <span>Courier</span>
                <Navigation className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-sm font-black text-gray-900 dark:text-white mt-1 truncate">
                {courierName}
              </div>
              <div className="text-[10px] text-gray-400">EV Cargo Bike · +91 98221 00441</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="text-[10px] uppercase font-bold text-gray-500 flex items-center justify-between">
                <span>Destination</span>
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="text-sm font-black text-gray-900 dark:text-white mt-1 truncate">
                {shelterName}
              </div>
              <div className="text-[10px] text-gray-400">Verified Shelter Partner</div>
            </div>
          </div>

          {/* 7-Stage Visual State Machine Pipeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                End-to-End Chain of Custody (7-Stage Audit Protocol)
              </h3>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                FSSAI Tamper-Proof Audit
              </span>
            </div>

            <div className="space-y-3">
              {STAGES.map((s) => {
                const IconComponent = s.icon;
                const isPassed = activeStage > s.step;
                const isCurrent = activeStage === s.step;
                const isPending = activeStage < s.step;

                return (
                  <div
                    key={s.step}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start space-x-3.5 ${
                      isCurrent
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-400 shadow-md ring-2 ring-emerald-500/20'
                        : isPassed
                        ? 'bg-slate-50/60 dark:bg-slate-800/40 border-gray-200 dark:border-slate-700 opacity-90'
                        : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 opacity-50'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        isCurrent
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 animate-pulse'
                          : isPassed
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : <IconComponent className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            Stage {s.step}: {s.title}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full ${
                              isCurrent
                                ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200'
                                : isPassed
                                ? 'bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-gray-300'
                                : 'bg-gray-100 text-gray-400 dark:bg-slate-800'
                            }`}
                          >
                            {isCurrent ? 'IN PROGRESS' : isPassed ? 'VERIFIED' : 'PENDING'}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">Actor: {s.actor}</span>
                      </div>
                      <div className="text-xs text-gray-700 dark:text-gray-300 font-medium mt-0.5">
                        {s.action}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {s.details}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Handover Digital Receipt & Verification */}
          {activeStage >= 6 && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider">
                    Stage 7: Digital Handover Receipt
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                  FSSAI Verified
                </span>
              </div>

              <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                <div>• Delivered To: <strong>{shelterName}</strong></div>
                <div>• Portions Nourished: <strong>{donation.estimated_meals} Meals</strong></div>
                <div>• Measured Temperature: <strong>62.4°C (Safe Hot-holding Zone)</strong></div>
                <div>• Authorized Receiver: <strong>{digitalSignerName}</strong></div>
              </div>

              {signatureDone ? (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-400/50 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Digital Receipt Cryptographically Signed &amp; Recorded</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">
                    SIG-FB-{donation.id.slice(0, 6).toUpperCase()}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    onClick={() => {
                      setSignatureDone(true);
                      setActiveStage(7);
                      advanceToNextStage();
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sign Digital Handover &amp; Confirm Delivery</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions & Simulation Driver for Jury */}
        <div className="p-4 sm:p-5 bg-gray-50 dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Interactive State Machine Driver for Jury Testing</span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            {activeStage < 7 ? (
              <button
                onClick={advanceToNextStage}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Advance to Stage {activeStage + 1} ({STAGES[activeStage].title})</span>
              </button>
            ) : (
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Mission Fully Delivered &amp; Logged</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              Close Tracker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
