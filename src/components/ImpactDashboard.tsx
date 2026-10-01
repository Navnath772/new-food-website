import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Cpu,
  Download,
  Globe2,
  Heart,
  HelpCircle,
  Leaf,
  RotateCw,
  Scale,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  Utensils,
} from 'lucide-react';
import { appStore } from '../services/api';
import { CommunityLeaderboard } from './CommunityLeaderboard';
import { FoodRescueCertificateModal } from './FoodRescueCertificateModal';
import { MethodologyModal } from './MethodologyModal';

export const ImpactDashboard: React.FC = () => {
  const analytics = appStore.getAnalytics();
  const currentUser = appStore.getCurrentUser();
  const [co2Factor, setCo2Factor] = useState<number>(4.43);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  const calculatedCo2 = Math.round(analytics.food_diverted_kg * co2Factor * 10) / 10;

  return (
    <div className="space-y-12 py-2">
      {/* Top Banner: UN SDG 2 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 text-white p-8 shadow-xl border border-emerald-700/40">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Globe2 className="w-3.5 h-3.5" />
            <span>United Nations Sustainable Development Goal 2</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Zero Hunger & Responsible Consumption</h1>
          <p className="text-sm sm:text-base text-emerald-100 font-light leading-relaxed">
            Every day, edible surplus food is discarded while vulnerable community members go to sleep hungry. FoodBridge
            AI converts perishable surplus into immediate nourishment using hyper-local coordination and real-time food safety
            audits.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setIsCertificateOpen(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
            >
              <Award className="w-4 h-4" />
              <span>Download Impact Certificate</span>
            </button>
            <button
              onClick={() => setIsMethodologyOpen(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 flex items-center space-x-1.5 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Scientific Methodology &amp; Formulas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Impact Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-1">
          <div className="text-xs uppercase font-bold text-emerald-600">Meals Rescued</div>
          <div className="text-3xl sm:text-4xl font-black text-gray-900">{analytics.meals_rescued.toLocaleString()}+</div>
          <p className="text-[11px] text-gray-400">Nutritionally dense cooked meals served</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-1">
          <div className="text-xs uppercase font-bold text-teal-600">Food Diverted</div>
          <div className="text-3xl sm:text-4xl font-black text-gray-900">{analytics.food_diverted_kg.toLocaleString()} kg</div>
          <p className="text-[11px] text-gray-400">Diverted from municipal landfill decomposition</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-1">
          <div className="text-xs uppercase font-bold text-blue-600">People Nourished</div>
          <div className="text-3xl sm:text-4xl font-black text-gray-900">{analytics.people_served.toLocaleString()}</div>
          <p className="text-[11px] text-gray-400">Shelter residents and daily wage workers</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-1">
          <div className="text-xs uppercase font-bold text-green-600">CO₂e Avoided</div>
          <div className="text-3xl sm:text-4xl font-black text-gray-900">{calculatedCo2.toLocaleString()} kg</div>
          <p className="text-[11px] text-gray-400">Illustrative estimate (configurable)</p>
        </div>
      </div>

      {/* Section #25: Circular Redistribution Diagram */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xs space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs uppercase font-bold text-emerald-600 tracking-wider">Circular Ecosystem Model</span>
          <h2 className="text-2xl font-bold text-gray-900">End-to-End Circular Redistribution Loop</h2>
          <p className="text-xs text-gray-500">
            Closing the gap between institutional food waste and urban food insecurity.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-4">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Utensils className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-gray-900">Surplus Food</div>
            <p className="text-[10px] text-gray-500">College Mess, Banquet, Caterer</p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-gray-900">AI Matching</div>
            <p className="text-[10px] text-gray-500">Distance, Expiry & Diet Match</p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-gray-900">Local NGO</div>
            <p className="text-[10px] text-gray-500">Verified Shelter Partner</p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-gray-900">Volunteer</div>
            <p className="text-[10px] text-gray-500">Insulated Rapid Transport</p>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Heart className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-gray-900">Community</div>
            <p className="text-[10px] text-gray-500">Vulnerable Children & Workers</p>
          </div>

          {/* Step 6 */}
          <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-green-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-gray-900">Meals Rescued</div>
            <p className="text-[10px] text-gray-500">Zero Hunger Achieved</p>
          </div>
        </div>
      </div>

      {/* Carbon Offset Methodology & Interactive Configurator (Per Prompt #24 & #54) */}
      <div className="p-6 rounded-3xl bg-gray-50 border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-green-700">
              <Scale className="w-4 h-4" />
              <span>Transparent Carbon Avoidance Methodology</span>
            </div>
            <h3 className="text-base font-bold text-gray-900 mt-1">Configurable Emission Conversion Factor</h3>
          </div>
          <span className="text-[11px] bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-bold border border-amber-200">
            Illustrative estimate — methodology configurable
          </span>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed max-w-3xl">
          When food rots anaerobically in landfills, it produces methane (CH₄)—a greenhouse gas with 28× higher global
          warming potential than CO₂ over 100 years. Based on UN FAO and US EPA WARM models, diverting mixed prepared food
          averages <strong>~4.43 kg CO₂e per kg of food saved</strong>.
        </p>

        {/* Interactive Factor Slider */}
        <div className="pt-2 max-w-md space-y-2">
          <div className="flex justify-between text-xs font-semibold text-gray-700">
            <span>Emission Factor (kg CO₂e / kg Food):</span>
            <span className="font-mono text-emerald-700 font-bold">{co2Factor}×</span>
          </div>
          <input
            type="range"
            min="2.0"
            max="6.5"
            step="0.1"
            value={co2Factor}
            onChange={(e) => setCo2Factor(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>Conservative (2.0×)</span>
            <span>FAO Standard (4.43×)</span>
            <span>High Methane (6.5×)</span>
          </div>
        </div>
      </div>

      {/* Gamification Badges Section (Per Prompt #47) */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">Ecosystem Recognition & Gamification Badges</h3>
          <p className="text-xs text-gray-500">Badges awarded dynamically based on verified pickup milestones.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2 text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              🏆
            </div>
            <div className="font-bold text-xs text-gray-900">Food Hero</div>
            <p className="text-[10px] text-gray-500">Completed &gt; 50 rescue missions</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2 text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              ⚡
            </div>
            <div className="font-bold text-xs text-gray-900">Rapid Responder</div>
            <p className="text-[10px] text-gray-500">Pickups under 30 minutes from match</p>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2 text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              🌱
            </div>
            <div className="font-bold text-xs text-gray-900">Zero Waste Partner</div>
            <p className="text-[10px] text-gray-500">Colleges with zero food landfill dumps</p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2 text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-purple-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              🌟
            </div>
            <div className="font-bold text-xs text-gray-900">Community Champion</div>
            <p className="text-[10px] text-gray-500">Partner shelter feeding &gt; 1,000 residents</p>
          </div>
        </div>
      </div>

      {/* Community Leaderboard */}
      <div className="space-y-4">
        <CommunityLeaderboard />
      </div>

      {/* Methodology Modal */}
      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />

      {/* Certificate Modal */}
      <FoodRescueCertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
};
