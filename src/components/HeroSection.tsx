import React from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Cpu,
  Heart,
  MapPin,
  Play,
  RotateCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
  Utensils,
  Leaf,
} from 'lucide-react';
import { appStore } from '../services/api';

interface HeroSectionProps {
  onOpenDonationWizard: () => void;
  onOpenSimulation: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenDonationWizard,
  onOpenSimulation,
  onNavigateToTab,
}) => {
  const analytics = appStore.getAnalytics();

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-900 via-emerald-950 to-teal-950 text-white p-6 sm:p-12 shadow-2xl border border-emerald-800/40">
        {/* Background glow orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          {/* Tagline Badge per prompt */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs sm:text-sm font-semibold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>“Food that can feed people, shouldn’t become waste.”</span>
          </div>

          {/* Title & Tagline per prompt */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Turn Surplus Food Into <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-green-400 bg-clip-text text-transparent">
                Someone's Next Meal.
              </span>
            </h1>
            <p className="text-base sm:text-xl text-emerald-100/90 max-w-3xl mx-auto font-light leading-relaxed">
              Connect restaurants, hotels, canteens and event organizers with verified NGOs and community organizations
              before surplus food goes to waste.
            </p>
          </div>

          {/* Action CTAs per prompt */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <button
              onClick={onOpenDonationWizard}
              className="px-7 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm sm:text-base transition-all transform hover:-translate-y-0.5 shadow-xl shadow-emerald-500/30 flex items-center space-x-2"
            >
              <Utensils className="w-5 h-5" />
              <span>Donate Surplus Food</span>
            </button>

            <button
              onClick={() => onNavigateToTab('ngo')}
              className="px-7 py-3.5 rounded-2xl bg-white text-slate-900 hover:bg-emerald-50 font-bold text-sm sm:text-base transition-all transform hover:-translate-y-0.5 shadow-md flex items-center space-x-2"
            >
              <Users className="w-5 h-5 text-emerald-600" />
              <span>Request Food</span>
            </button>

            <button
              onClick={onOpenSimulation}
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-emerald-400/30 text-white font-semibold text-sm transition-all backdrop-blur-md flex items-center space-x-2 shadow-sm"
            >
              <Play className="w-4 h-4 text-emerald-300 fill-emerald-300" />
              <span>Run Rescue Simulation</span>
            </button>
          </div>

          {/* Prompt 1 Impact Row: Immediately show live impact */}
          <div className="pt-4 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-2xl bg-emerald-950/70 border border-emerald-700/60 backdrop-blur-md text-center">
              <div className="p-2">
                <div className="text-lg sm:text-2xl font-black text-white">🍱 12,480</div>
                <div className="text-[11px] text-emerald-200/80 font-medium">Meals Rescued</div>
              </div>
              <div className="p-2">
                <div className="text-lg sm:text-2xl font-black text-white">🏪 184</div>
                <div className="text-[11px] text-emerald-200/80 font-medium">Donors</div>
              </div>
              <div className="p-2">
                <div className="text-lg sm:text-2xl font-black text-white">🤝 67</div>
                <div className="text-[11px] text-emerald-200/80 font-medium">NGOs</div>
              </div>
              <div className="p-2">
                <div className="text-lg sm:text-2xl font-black text-white">🚚 3,420</div>
                <div className="text-[11px] text-emerald-200/80 font-medium">Successful Pickups</div>
              </div>
              <div className="p-2 col-span-2 sm:col-span-1">
                <div className="text-lg sm:text-2xl font-black text-emerald-300">🌱 8.7 Tons</div>
                <div className="text-[11px] text-emerald-200/80 font-medium">Food Diverted</div>
              </div>
            </div>
          </div>

          {/* Hero Visual: End-to-End Rescue Connection Flow */}
          <div className="pt-8">
            <div className="p-5 rounded-2xl bg-emerald-900/40 border border-emerald-700/50 backdrop-blur-lg">
              <div className="text-xs uppercase tracking-widest text-emerald-300/80 font-bold mb-4">
                Hyper-Local Rescue Lifecycle (Real-Time Automated Matching)
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-center">
                {/* 1. Donor */}
                <div className="p-3.5 rounded-xl bg-emerald-800/40 border border-emerald-500/30 text-center space-y-1">
                  <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                    01
                  </div>
                  <div className="font-bold text-xs text-white">Food Donor</div>
                  <div className="text-[11px] text-emerald-200/70">Messes, Hotels, Banquets</div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex flex-col items-center justify-center text-emerald-400">
                  <div className="text-[10px] font-mono text-emerald-300">Publish</div>
                  <ArrowRight className="w-4 h-4 animate-pulse" />
                </div>

                {/* 2. AI Matching */}
                <div className="p-3.5 rounded-xl bg-teal-800/50 border border-teal-400/40 text-center space-y-1 ring-2 ring-teal-400/30">
                  <div className="w-8 h-8 mx-auto rounded-lg bg-teal-400 text-teal-950 flex items-center justify-center font-bold text-xs shadow-md">
                    <Cpu className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="font-bold text-xs text-white">AI Engine</div>
                  <div className="text-[11px] text-teal-200/80">Distance & Expiry Match</div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex flex-col items-center justify-center text-emerald-400">
                  <div className="text-[10px] font-mono text-emerald-300">Dispatch</div>
                  <ArrowRight className="w-4 h-4 animate-pulse" />
                </div>

                {/* 3. Volunteer & NGO */}
                <div className="p-3.5 rounded-xl bg-emerald-800/40 border border-emerald-500/30 text-center space-y-1 col-span-2 md:col-span-1">
                  <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                    03
                  </div>
                  <div className="font-bold text-xs text-white">Verified NGO</div>
                  <div className="text-[11px] text-emerald-200/70">Shelters & Communities</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Landing Page Statistics Section (Section #7) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Live Rescue Impact Metrics</h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Aggregated real-time metrics loaded from the FoodBridge backend API.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Data Sync Active</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Stat 1: Meals Rescued */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:border-emerald-200 transition-all">
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <Utensils className="w-5 h-5" />
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                SDG 2.1
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {analytics.meals_rescued.toLocaleString()}+
            </div>
            <div className="text-xs font-semibold text-gray-600 mt-0.5">Meals Rescued</div>
            <div className="text-[10px] text-gray-400 mt-1">Direct community nourishment</div>
          </div>

          {/* Stat 2: Food Diverted */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:border-emerald-200 transition-all">
            <div className="flex items-center justify-between text-teal-600 mb-2">
              <RotateCw className="w-5 h-5" />
              <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                Diverted
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {analytics.food_diverted_kg.toLocaleString()} kg
            </div>
            <div className="text-xs font-semibold text-gray-600 mt-0.5">Food Saved</div>
            <div className="text-[10px] text-gray-400 mt-1">From landfill decay</div>
          </div>

          {/* Stat 3: Verified Donors */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:border-emerald-200 transition-all">
            <div className="flex items-center justify-between text-blue-600 mb-2">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                Donors
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {analytics.verified_donors}
            </div>
            <div className="text-xs font-semibold text-gray-600 mt-0.5">Verified Donors</div>
            <div className="text-[10px] text-gray-400 mt-1">Colleges & Caterers</div>
          </div>

          {/* Stat 4: Partner NGOs */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:border-emerald-200 transition-all">
            <div className="flex items-center justify-between text-amber-600 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                Shelters
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {analytics.partner_ngos}
            </div>
            <div className="text-xs font-semibold text-gray-600 mt-0.5">Partner NGOs</div>
            <div className="text-[10px] text-gray-400 mt-1">Active receiving hubs</div>
          </div>

          {/* Stat 5: Successful Deliveries */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:border-emerald-200 transition-all">
            <div className="flex items-center justify-between text-indigo-600 mb-2">
              <Truck className="w-5 h-5" />
              <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                OTP verified
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {analytics.successful_deliveries.toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-gray-600 mt-0.5">Completed Runs</div>
            <div className="text-[10px] text-gray-400 mt-1">100% digital chain of custody</div>
          </div>

          {/* Stat 6: CO2e Avoided */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:border-emerald-200 transition-all">
            <div className="flex items-center justify-between text-green-600 mb-2">
              <Leaf className="w-5 h-5" />
              <span className="text-[10px] uppercase font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                Climate
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {Math.round(analytics.co2e_avoided_kg).toLocaleString()} kg
            </div>
            <div className="text-xs font-semibold text-gray-600 mt-0.5">CO₂e Avoided</div>
            <div className="text-[10px] text-gray-400 mt-1">Illustrative estimate (4.43×)</div>
          </div>
        </div>
      </section>

      {/* How It Works Section (Section #33) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase font-bold text-emerald-600 tracking-wider">Simple & Transparent</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How FoodBridge AI Operates</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            A battle-tested 4-step workflow connecting institutions to beneficiaries before safe consumable food degrades.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-all space-y-3 relative group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-lg border border-emerald-100">
              01
            </div>
            <h3 className="font-bold text-base text-gray-900">DONATE</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Food donor registers surplus food with portion count, prep time, expiry window, and food safety
              checklist declarations.
            </p>
            <div className="pt-2 flex items-center space-x-1.5 text-xs text-emerald-600 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Multi-step wizard</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-all space-y-3 relative group">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-black text-lg border border-teal-100">
              02
            </div>
            <h3 className="font-bold text-base text-gray-900">AI MATCH</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Our 5-factor matching engine evaluates Haversine distance (30%), food compatibility (25%), expiry urgency
              (20%), capacity (15%), and NGO verification (10%).
            </p>
            <div className="pt-2 flex items-center space-x-1.5 text-xs text-teal-600 font-semibold">
              <Cpu className="w-4 h-4" />
              <span>Weighted scoring 0-100</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-all space-y-3 relative group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-lg border border-blue-100">
              03
            </div>
            <h3 className="font-bold text-base text-gray-900">RESCUE</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Nearby verified volunteer courier is dispatched. Food safety inspection is verified at the pickup point,
              and a secure 4-digit Pickup OTP is confirmed.
            </p>
            <div className="pt-2 flex items-center space-x-1.5 text-xs text-blue-600 font-semibold">
              <Truck className="w-4 h-4" />
              <span>Dual-OTP verification</span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-all space-y-3 relative group">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-black text-lg border border-purple-100">
              04
            </div>
            <h3 className="font-bold text-base text-gray-900">DELIVER</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Food arrives fresh at the shelter or community center. Delivery OTP is exchanged, immediately updating
              meals served and avoided carbon footprint.
            </p>
            <div className="pt-2 flex items-center space-x-1.5 text-xs text-purple-600 font-semibold">
              <Award className="w-4 h-4" />
              <span>Real-time impact update</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
