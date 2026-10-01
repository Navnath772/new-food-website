import React, { useEffect, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Cpu,
  KeyRound,
  MapPin,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  Utensils,
  X,
  FastForward,
} from 'lucide-react';
import { appStore } from '../services/api';
import confetti from 'canvas-confetti';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SIMULATION_STAGES = [
  {
    step: 1,
    time: '18:00',
    title: 'Surplus Food Generated',
    description: 'ABC College Mess finishes dinner service with 50 fresh vegetarian meals in insulated warmers.',
    badge: 'DONOR',
    color: 'bg-emerald-500',
  },
  {
    step: 2,
    time: '18:05',
    title: 'Food Safety AI Analysis',
    description: 'AI model evaluates shelf life (4 hrs), risk level (Low), and recommends pickup within 90 minutes.',
    badge: 'AI ENGINE',
    color: 'bg-teal-500',
  },
  {
    step: 3,
    time: '18:06',
    title: 'Urgency & Priority Calculation',
    description: 'Expiry set to 21:00 (3 hrs remaining). Priority automatically elevated to HIGH.',
    badge: 'PRIORITY',
    color: 'bg-amber-500',
  },
  {
    step: 4,
    time: '18:07',
    title: 'Nearby NGO Proximity Search',
    description: 'Platform scans 8 registered NGOs within a 5 km radius using GPS coordinates.',
    badge: 'RADAR',
    color: 'bg-blue-500',
  },
  {
    step: 5,
    time: '18:08',
    title: 'Haversine Distance Matrix',
    description: 'Annapurna Shelter: 0.8 km | Shanti Balgram: 1.4 km | Jeevan Jyoti: 2.1 km computed.',
    badge: 'HAVERSINE',
    color: 'bg-indigo-500',
  },
  {
    step: 6,
    time: '18:09',
    title: 'Weighted Match Score Generated',
    description: 'Annapurna Shelter achieves 94/100 score (Distance: 30%, Compatibility: 25%, Urgency: 20%).',
    badge: 'MATCH 94',
    color: 'bg-emerald-600',
  },
  {
    step: 7,
    time: '18:12',
    title: 'NGO Accepts Allocation',
    description: 'Annapurna Shelter supervisor confirms requirement for 50 resident evening meals.',
    badge: 'ACCEPTED',
    color: 'bg-blue-600',
  },
  {
    step: 8,
    time: '18:13',
    title: 'Courier Dispatch Engine Triggered',
    description: 'Nearest verified volunteer Rahul Patil (Motorcycle, 0.4 km away) notified with navigation route.',
    badge: 'DISPATCH',
    color: 'bg-amber-600',
  },
  {
    step: 9,
    time: '18:14',
    title: 'Volunteer Accepts Mission',
    description: 'Rahul accepts pickup assignment with estimated arrival at donor kitchen in 8 minutes.',
    badge: 'EN ROUTE',
    color: 'bg-orange-500',
  },
  {
    step: 10,
    time: '18:22',
    title: 'Pickup OTP Generated & Verified',
    description: 'Donor provides Pickup OTP "4728". Courier enters OTP to verify physical custody.',
    badge: 'OTP 4728',
    color: 'bg-purple-600',
  },
  {
    step: 11,
    time: '18:25',
    title: '7-Point Food Safety Inspection',
    description: 'Temperature checked (64°C), packaging intact, and sanitary checklist digitally signed.',
    badge: 'SAFETY SAFE',
    color: 'bg-emerald-700',
  },
  {
    step: 12,
    time: '18:32',
    title: 'In-Transit GPS Tracking',
    description: 'Volunteer transports meals in insulated thermal bags across 0.8 km route.',
    badge: 'IN TRANSIT',
    color: 'bg-blue-700',
  },
  {
    step: 13,
    time: '18:41',
    title: 'Delivery OTP Handshake',
    description: 'Annapurna Shelter staff confirms safe receipt by verifying Delivery OTP "8391".',
    badge: 'OTP 8391',
    color: 'bg-indigo-700',
  },
  {
    step: 14,
    time: '18:42',
    title: 'Donation Marked COMPLETED',
    description: 'Status updated to COMPLETED in database. Digital receipt archived.',
    badge: 'COMPLETED',
    color: 'bg-emerald-800',
  },
  {
    step: 15,
    time: '18:43',
    title: 'SDG 2 Impact Recorded',
    description: 'Platform registers +50 meals served, 17.5 kg food diverted, and 77.5 kg CO₂e avoided!',
    badge: 'IMPACT +50',
    color: 'bg-teal-600',
  },
];

export const SimulationModal: React.FC<SimulationModalProps> = ({ isOpen, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;

    let timer: NodeJS.Timeout;
    if (isPlaying && currentStepIndex < SIMULATION_STAGES.length - 1) {
      timer = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, 1600);
    } else if (currentStepIndex === SIMULATION_STAGES.length - 1) {
      setIsPlaying(false);
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch {
        // ignore
      }
    }

    return () => clearTimeout(timer);
  }, [isOpen, isPlaying, currentStepIndex]);

  if (!isOpen) return null;

  const currentStage = SIMULATION_STAGES[currentStepIndex];

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  const handleStepForward = () => {
    if (currentStepIndex < SIMULATION_STAGES.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-gray-100 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-teal-900 via-emerald-900 to-gray-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Real-Time Autonomous Simulation Mode</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">15-Stage Food Rescue Simulation</h2>
            <p className="text-xs text-teal-100">
              Simulating 50 surplus college mess meals rescued before expiry in Kolhapur.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Progress Bar */}
        <div className="w-full bg-gray-100 h-2">
          <div
            className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / SIMULATION_STAGES.length) * 100}%` }}
          />
        </div>

        {/* Active Stage Callout Card */}
        <div className="p-6 bg-teal-50/50 border-b border-teal-100 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold bg-teal-200 text-teal-900 px-2 py-0.5 rounded-md">
                Stage {currentStage.step} of 15 • {currentStage.time}
              </span>
              <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${currentStage.color}`}>
                {currentStage.badge}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{currentStage.title}</h3>
            <p className="text-xs text-gray-700 max-w-xl">{currentStage.description}</p>
          </div>

          <div className="shrink-0 text-center pl-4">
            <div className="text-3xl font-black text-teal-700">
              {Math.round(((currentStepIndex + 1) / SIMULATION_STAGES.length) * 100)}%
            </div>
            <div className="text-[10px] font-bold uppercase text-gray-400">Complete</div>
          </div>
        </div>

        {/* Scrollable Timeline */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {SIMULATION_STAGES.map((s, idx) => {
            const isPassed = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={s.step}
                className={`p-3.5 rounded-2xl border transition-all flex items-start space-x-3.5 ${
                  isCurrent
                    ? 'border-teal-500 bg-white shadow-md ring-2 ring-teal-200'
                    : isPassed
                    ? 'border-gray-200 bg-gray-50/70 opacity-80'
                    : 'border-dashed border-gray-200 bg-white/40 opacity-40'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isPassed
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-teal-600 text-white animate-pulse'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">{s.title}</span>
                    <span className="text-[10px] font-mono text-gray-400">{s.time}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{s.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleRestart}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-white flex items-center space-x-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Simulation</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs"
            >
              <span>{isPlaying ? 'Pause' : 'Play Simulation'}</span>
            </button>

            <button
              onClick={handleStepForward}
              disabled={currentStepIndex >= SIMULATION_STAGES.length - 1}
              className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 disabled:opacity-40 text-gray-800 text-xs font-semibold flex items-center space-x-1 transition-colors"
            >
              <span>Next Step</span>
              <FastForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
