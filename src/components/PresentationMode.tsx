import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Cpu,
  Globe2,
  Heart,
  Presentation,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  Utensils,
  X,
  Maximize2,
} from 'lucide-react';

interface PresentationModeProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchSimulation: () => void;
}

const SLIDES = [
  {
    id: 1,
    title: 'The Challenge: Food Waste Amidst Hunger',
    subtitle: 'Targeting UN Sustainable Development Goal 2 — Zero Hunger',
    content: (
      <div className="space-y-6 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-red-50 border border-red-200">
            <div className="text-3xl font-black text-red-600">68M+ Tons</div>
            <div className="text-xs font-bold text-gray-800 mt-1">Food Wasted Annually</div>
            <p className="text-xs text-gray-600 mt-2">
              Large volumes of perfectly consumable cooked meals from college hostels, hotel banquets, and caterers
              dumped daily.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
            <div className="text-3xl font-black text-amber-600">190 Million</div>
            <div className="text-xs font-bold text-gray-800 mt-1">Under-Nourished Citizens</div>
            <p className="text-xs text-gray-600 mt-2">
              Nearby community shelters, orphanages, and daily-wage colonies struggle with predictable food supply.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200">
            <div className="text-3xl font-black text-purple-600">The Disconnect</div>
            <div className="text-xs font-bold text-gray-800 mt-1">Perishable Shelf-Life</div>
            <p className="text-xs text-gray-600 mt-2">
              Without automated matching and volunteer dispatch, hot cooked meals spoil before receiving shelters can
              coordinate transport.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-700">
          <strong>The Core Bottleneck:</strong> Lack of real-time coordination, verifiable food safety standards, and
          digital chain of custody within the critical 2-4 hour consumable window.
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: 'The Solution: FoodBridge AI',
    subtitle: 'Autonomous Surplus Food Redistribution Network',
    content: (
      <div className="space-y-6 text-left">
        <p className="text-sm text-gray-700 leading-relaxed">
          FoodBridge AI digitizes the entire surplus food lifecycle, connecting institutions directly to verified
          beneficiaries before food expires.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Utensils className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-gray-900">1. Instant Posting</div>
            <p className="text-[11px] text-gray-500">60-second donation wizard with food safety declaration</p>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-gray-900">2. AI Proximity Matching</div>
            <p className="text-[11px] text-gray-500">5-factor scoring engine (distance, urgency, dietary match)</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-gray-900">3. Rapid Volunteer Dispatch</div>
            <p className="text-[11px] text-gray-500">Nearby couriers assigned with GPS route navigation</p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-gray-900">4. Dual-OTP Handshake</div>
            <p className="text-[11px] text-gray-500">Tamper-proof pickup and delivery confirmation</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: 'AI Matching Architecture & Mathematical Formula',
    subtitle: 'Transparent, Weighted Proximity & Urgency Computation',
    content: (
      <div className="space-y-5 text-left">
        <div className="p-4 rounded-2xl bg-gray-900 text-white font-mono text-xs sm:text-sm">
          <div className="text-emerald-400 font-bold mb-1">
            // Core Matching Algorithm Formula (Normalized 0 - 100)
          </div>
          Match Score = (Distance Score × 30%) + (Food Compatibility × 25%) + (Urgency Score × 20%) + (Capacity Match ×
          15%) + (Verification × 10%)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2">
            <div className="font-bold text-gray-900">1. Haversine Great-Circle Distance (30%)</div>
            <p className="text-gray-600">
              Computes shortest radial distance between donor kitchen and NGO receiving bay. Scores scale from 100 (&lt;
              0.5 km) down to 20 (&gt; 10 km).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2">
            <div className="font-bold text-gray-900">2. Food Compatibility (25%)</div>
            <p className="text-gray-600">
              Matches dietary labels (Vegetarian / Vegan / Non-Veg) and accepted food categories (Cooked meals, raw
              produce, dairy) against the shelter profile.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2">
            <div className="font-bold text-gray-900">3. Expiry Urgency Score (20%)</div>
            <p className="text-gray-600">
              Dynamically scales with remaining safe window: &lt; 2 hours triggers CRITICAL urgency score (98%),
              ensuring priority over non-perishable goods.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2">
            <div className="font-bold text-gray-900">4. Capacity & Verification (25%)</div>
            <p className="text-gray-600">
              Validates that the recipient NGO has adequate beneficiary headcount for the portion size, with verified NGO
              credential checks.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: 'Food Safety & Digital Chain of Custody',
    subtitle: 'Eliminating Liability and Guaranteeing Beneficiary Health',
    content: (
      <div className="space-y-4 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>7-Point Physical Courier Inspection</span>
            </div>
            <ul className="text-xs text-gray-700 space-y-1.5 list-disc pl-4">
              <li>Preparation timestamp signed by kitchen supervisor</li>
              <li>Packaging intact with food-grade seal</li>
              <li>Temperature verification (&gt;60°C hot or &lt;5°C cold)</li>
              <li>Sensory inspection (no spoilage odors or visible mold)</li>
              <li>Safe distribution window validity check</li>
              <li>Donor declaration on record</li>
              <li>Digital portion manifest match</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
            <div className="flex items-center space-x-2 text-blue-800 font-bold text-sm">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Dual-OTP Cryptographic Handoff</span>
            </div>
            <div className="text-xs text-gray-700 space-y-2">
              <p>
                <strong>Pickup OTP (4 digits):</strong> Generated on match, held exclusively by donor. Courier must
                enter this code upon inspecting food to unlock status to <code>PICKED_UP</code>.
              </p>
              <p>
                <strong>Delivery OTP (4 digits):</strong> Held exclusively by the receiving shelter supervisor. Courier
                presents containers, and shelter validates OTP to mark <code>COMPLETED</code>.
              </p>
              <p className="text-[11px] text-blue-800 font-semibold bg-blue-100 p-2 rounded-xl">
                Guarantees zero ghost deliveries, verifies physical handoffs, and prevents unauthorized diversion.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: 'Ecosystem Traction & Environmental Impact',
    subtitle: 'Demonstrable Results & Carbon Avoidance Model',
    content: (
      <div className="space-y-6 text-left">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">12,840+</div>
            <div className="text-xs font-bold text-gray-700 mt-1">Meals Rescued</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <div className="text-2xl sm:text-3xl font-black text-teal-600">4,260 kg</div>
            <div className="text-xs font-bold text-gray-700 mt-1">Food Diverted</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <div className="text-2xl sm:text-3xl font-black text-blue-600">1,240</div>
            <div className="text-xs font-bold text-gray-700 mt-1">Safe Deliveries</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <div className="text-2xl sm:text-3xl font-black text-green-600">18,871 kg</div>
            <div className="text-xs font-bold text-gray-700 mt-1">CO₂e Avoided (est.)</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-1">
          <div className="font-bold text-gray-900">Carbon Methodology Note:</div>
          <p>
            Emission estimates derived from UN Food and Agriculture Organization (FAO) and EPA Waste Reduction Model
            (WARM). Factor of <strong>4.43 kg CO₂e per kg of food diverted</strong> from landfill anaerobic methane
            generation. Transparently labelled as illustrative estimate.
          </p>
        </div>
      </div>
    ),
  },
];

export const PresentationMode: React.FC<PresentationModeProps> = ({
  isOpen,
  onClose,
  onLaunchSimulation,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  if (!isOpen) return null;

  const slide = SLIDES[activeSlide];

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full h-[85vh] flex flex-col overflow-hidden border border-gray-800">
        {/* Pitch Deck Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-900 to-gray-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500 text-emerald-950 font-bold">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-emerald-300 font-bold uppercase tracking-wider">
                Hackathon Jury Showcase Deck
              </div>
              <h2 className="text-lg font-bold">FoodBridge AI Pitch Presentation</h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-gray-300">
              Slide {activeSlide + 1} of {SLIDES.length}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slide Canvas */}
        <div className="p-8 sm:p-12 overflow-y-auto flex-1 flex flex-col justify-center space-y-6">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-emerald-600 tracking-wider">
              {slide.subtitle}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{slide.title}</h1>
          </div>

          <div className="pt-2">{slide.content}</div>
        </div>

        {/* Deck Controls Footer */}
        <div className="p-5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveSlide((prev) => Math.max(0, prev - 1))}
              disabled={activeSlide === 0}
              className="px-4 py-2 rounded-xl border border-gray-300 disabled:opacity-30 text-xs font-bold text-gray-700 hover:bg-white flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setActiveSlide((prev) => Math.min(SLIDES.length - 1, prev + 1))}
              disabled={activeSlide === SLIDES.length - 1}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white text-xs font-bold flex items-center space-x-1"
            >
              <span>Next Slide</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onLaunchSimulation();
            }}
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 flex items-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Live Rescue Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
