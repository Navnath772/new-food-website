import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  Eye,
  FileCheck,
  Heart,
  KeyRound,
  MapPin,
  Mic,
  MicOff,
  PlusCircle,
  QrCode,
  RotateCcw,
  Scale,
  Send,
  ShieldCheck,
  Sparkles,
  Thermometer,
  TrendingUp,
  Truck,
  Users,
  Utensils,
  ChevronRight,
  Info,
} from 'lucide-react';
import { CommunityNeed, FoodDonation, MatchRecommendation } from '../types/index.ts';
import { appStore } from '../services/api.ts';
import { parseDonationNaturalLanguage } from '../services/intelligenceEngine.ts';
import { FoodRescueScoreModal } from './FoodRescueScoreModal.tsx';
import { RescueLedgerModal } from './RescueLedgerModal.tsx';
import { QrVerificationModal } from './QrVerificationModal.tsx';
import { FoodSafetyCenterModal } from './FoodSafetyCenterModal.tsx';
import { FoodRescueCertificateModal } from './FoodRescueCertificateModal.tsx';

interface DonorDashboardProps {
  onOpenDonationWizard: (initialData?: any) => void;
  onOpenLiveMapForDonation: (donationId: string) => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({
  onOpenDonationWizard,
  onOpenLiveMapForDonation,
}) => {
  const [donations, setDonations] = useState<FoodDonation[]>(appStore.getDonations());
  const [communityNeeds, setCommunityNeeds] = useState<CommunityNeed[]>(appStore.getCommunityNeeds());
  const [selectedDonationForMatches, setSelectedDonationForMatches] = useState<FoodDonation | null>(null);
  const [matches, setMatches] = useState<(MatchRecommendation & { reasons: string[] })[]>([]);

  // Modals state
  const [activeScoreDonation, setActiveScoreDonation] = useState<FoodDonation | null>(null);
  const [activeLedgerDonation, setActiveLedgerDonation] = useState<FoodDonation | null>(null);
  const [activeQrDonation, setActiveQrDonation] = useState<FoodDonation | null>(null);
  const [activeSafetyDonation, setActiveSafetyDonation] = useState<FoodDonation | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  // Copilot & Quick Donate NLP state
  const [quickText, setQuickText] = useState('');
  const [copilotAnalysis, setCopilotAnalysis] = useState<ReturnType<typeof parseDonationNaturalLanguage> | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);

  const currentUser = appStore.getCurrentUser();

  useEffect(() => {
    const unsubscribe = appStore.subscribe(() => {
      setDonations([...appStore.getDonations()]);
      setCommunityNeeds([...appStore.getCommunityNeeds()]);
    });
    return unsubscribe;
  }, []);

  // Web Speech API Voice Input
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      alert('Voice input is not supported in this browser. Please type your surplus food description instead.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuickText(transcript);
        const parsed = parseDonationNaturalLanguage(transcript);
        setCopilotAnalysis(parsed);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceSupported(false);
    }
  };

  const handleQuickAnalyze = () => {
    if (!quickText.trim()) return;
    const parsed = parseDonationNaturalLanguage(quickText);
    setCopilotAnalysis(parsed);
  };

  const handleLaunchFromCopilot = () => {
    if (!copilotAnalysis) return;
    onOpenDonationWizard({
      food_name: copilotAnalysis.foodName,
      quantity: copilotAnalysis.quantity,
      unit: copilotAnalysis.unit,
      food_category: copilotAnalysis.category,
      food_type: copilotAnalysis.foodType,
      urgency: copilotAnalysis.urgency,
      description: `Surplus food parsed via FoodBridge Copilot: ${quickText}`,
    });
  };

  const handleMatchCommunityNeed = (need: CommunityNeed) => {
    onOpenDonationWizard({
      food_name: `${need.food_type} ${need.category}`,
      quantity: need.quantity_portions,
      unit: 'Meals',
      food_category: need.category,
      food_type: need.food_type,
      urgency: need.urgency,
      description: `Matched to community need broadcast by ${need.ngo_name}: ${need.description}`,
    });
  };

  const handleViewMatches = (donation: FoodDonation) => {
    setSelectedDonationForMatches(donation);
    const calculatedMatches = appStore.getMatchesForDonation(donation.id);
    setMatches(calculatedMatches);
  };

  const handleAssignNgo = (donationId: string, orgId: string, orgName: string) => {
    appStore.acceptMatch(donationId, orgId, orgName);
    if (selectedDonationForMatches) {
      setMatches(appStore.getMatchesForDonation(donationId));
    }
  };

  // Filter donor's active and history donations
  const donorDonations = donations.filter((d) => d.donor_id === currentUser.id || currentUser.role === 'admin');
  const activeDonations = donorDonations.filter((d) => d.status !== 'COMPLETED' && d.status !== 'EXPIRED');
  const pastDonations = donorDonations.filter((d) => d.status === 'COMPLETED' || d.status === 'EXPIRED');

  // Metrics
  const totalMeals = donorDonations.reduce((acc, d) => acc + (d.estimated_meals || d.quantity), 0);
  const totalKg = Math.round(totalMeals * 0.35);
  const totalCO2e = Math.round(totalKg * 4.43);

  return (
    <div className="space-y-8 py-2">
      {/* Top Header & Certificate CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Donor Redistribution Hub</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
              Verified Partner
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Logged in as <strong className="text-gray-800 dark:text-gray-200">{currentUser.organization || currentUser.name}</strong> • {currentUser.address}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCertificate(true)}
            className="px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 font-bold text-xs flex items-center space-x-1.5 transition-colors"
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>Rescue Certificate</span>
          </button>

          <button
            onClick={() => onOpenDonationWizard()}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Surplus Batch</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <Utensils className="w-5 h-5" />
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">Live</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{activeDonations.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Active Surplus Batches</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-teal-600 mb-2">
            <Scale className="w-5 h-5" />
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-md">Diverted</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{totalKg.toLocaleString()} <span className="text-sm font-normal text-gray-400">kg</span></div>
          <div className="text-xs text-gray-500 mt-0.5">Food Saved from Landfill</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">SDG 2</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{totalMeals.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-0.5">Estimated Meals Provided</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">Climate</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{totalCO2e.toLocaleString()} <span className="text-sm font-normal text-gray-400">kg</span></div>
          <div className="text-xs text-gray-500 mt-0.5">CO₂e Avoided (FAO factor)</div>
        </div>
      </div>

      {/* NEW FEATURE: FoodBridge Copilot & Natural Language Quick Donate */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>FoodBridge Copilot</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    Smart Donation Assistant
                  </span>
                </h3>
                <p className="text-xs text-gray-300">
                  Type or speak your surplus food in plain English. Our explainable NLP engine structures it in seconds.
                </p>
              </div>
            </div>

            <button
              onClick={handleVoiceInput}
              disabled={isListening}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all self-start sm:self-auto ${
                isListening
                  ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-emerald-200'
              }`}
              title="Voice donation input via Web Speech API"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isListening ? 'Listening...' : 'Speak Donation'}</span>
            </button>
          </div>

          {/* Quick Input Textarea */}
          <div className="relative">
            <textarea
              rows={2}
              value={quickText}
              onChange={(e) => {
                setQuickText(e.target.value);
                if (e.target.value.length > 10) {
                  const parsed = parseDonationNaturalLanguage(e.target.value);
                  setCopilotAnalysis(parsed);
                } else {
                  setCopilotAnalysis(null);
                }
              }}
              placeholder="e.g. 'I have 80 packets of vegetable rice prepared at 6 PM from college dinner mess.' or '100 fresh chapatis and vegetable curry available immediately.'"
              className="w-full p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
            />
            <div className="absolute right-3 bottom-3 flex items-center space-x-2">
              <button
                onClick={handleQuickAnalyze}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center space-x-1.5"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Analyze with Copilot</span>
              </button>
            </div>
          </div>

          {/* Copilot Extracted Preview */}
          {copilotAnalysis && (
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-emerald-500/30 space-y-3 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  ✓ Extracted Food Manifest
                </span>
                <span className="text-[11px] text-gray-300">
                  Recommended Action: <strong className="text-emerald-200">{copilotAnalysis.recommendedAction}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-2 rounded-lg bg-black/20">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Food Item</span>
                  <span className="font-bold text-white truncate block">{copilotAnalysis.foodName}</span>
                </div>
                <div className="p-2 rounded-lg bg-black/20">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Quantity</span>
                  <span className="font-bold text-white">{copilotAnalysis.quantity} {copilotAnalysis.unit}</span>
                </div>
                <div className="p-2 rounded-lg bg-black/20">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Category</span>
                  <span className="font-bold text-white">{copilotAnalysis.category}</span>
                </div>
                <div className="p-2 rounded-lg bg-black/20">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Dietary</span>
                  <span className="font-bold text-white">{copilotAnalysis.foodType}</span>
                </div>
                <div className="p-2 rounded-lg bg-black/20 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Pickup Window</span>
                  <span className="font-bold text-amber-300">{copilotAnalysis.suggestedPickupWindow}</span>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleLaunchFromCopilot}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold text-xs shadow-md transition-transform active:scale-95 flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Analyze &amp; Review in Donation Wizard</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NEW FEATURE: Matching Community Food Needs Broadcast by NGOs */}
      {communityNeeds.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-rose-500" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Live Community Food Needs (Shelter Requests)
              </h2>
            </div>
            <span className="text-xs text-gray-400">{communityNeeds.length} open broadcasts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {communityNeeds.map((need) => (
              <div
                key={need.id}
                className="p-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-900 dark:text-white truncate">{need.ngo_name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                      {need.urgency}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Needs {need.quantity_portions} portions of {need.food_type} {need.category}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {need.description}
                  </p>
                </div>

                <button
                  onClick={() => handleMatchCommunityNeed(need)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                >
                  Match My Donation
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Surplus Batches with Expiry & Rescue Score */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <span>Active Surplus Batches</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
              {activeDonations.length}
            </span>
          </h2>
          <span className="text-xs text-gray-400">
            Real-time shelf-life monitoring &amp; 5-factor AI matching
          </span>
        </div>

        {activeDonations.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <Utensils className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">No Active Surplus Batches</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                You have no pending donations. Click &quot;New Surplus Batch&quot; or use the Copilot above to rescue food.
              </p>
            </div>
            <button
              onClick={() => onOpenDonationWizard()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Publish Surplus Food
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeDonations.map((donation) => (
              <DonationCard
                key={donation.id}
                donation={donation}
                onViewMatches={() => handleViewMatches(donation)}
                onViewMap={() => onOpenLiveMapForDonation(donation.id)}
                onOpenScoreModal={() => setActiveScoreDonation(donation)}
                onOpenLedgerModal={() => setActiveLedgerDonation(donation)}
                onOpenQrModal={() => setActiveQrDonation(donation)}
                onOpenSafetyModal={() => setActiveSafetyDonation(donation)}
              />
            ))}
          </div>
        )}
      </div>

      {/* AI Candidate Matching Drawer / Modal */}
      {selectedDonationForMatches && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                  AI Dynamic Matching Engine
                </span>
                <h3 className="text-lg font-bold text-white">
                  Ranked Recipient Shelters for {selectedDonationForMatches.food_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDonationForMatches(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 divide-y divide-gray-100 dark:divide-slate-800">
              {matches.map((m, idx) => (
                <div
                  key={m.id}
                  className={`pt-4 first:pt-0 p-4 rounded-2xl border transition-all ${
                    m.status === 'ACCEPTED'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-200'
                      : 'border-gray-200 dark:border-slate-800 hover:border-emerald-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800">
                          Rank #{idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{m.organization_name}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-medium">
                          {m.organization_type}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 pt-1">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span><strong>{m.distance_km} km</strong> away</span>
                        </span>
                        <span>Compatibility: <strong>{m.food_compatibility_score}%</strong></span>
                        <span>Capacity Match: <strong>{m.capacity_score}%</strong></span>
                        <span>Verification: <strong>{m.verification_score}%</strong></span>
                      </div>
                      {m.reasons && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {m.reasons.map((r, rIdx) => (
                            <span key={rIdx} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                              ✓ {r}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="text-right">
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{m.match_score}</div>
                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          Match Score
                        </div>
                      </div>

                      {m.status === 'ACCEPTED' ? (
                        <div className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Assigned</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAssignNgo(selectedDonationForMatches.id, m.organization_id, m.organization_name)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                        >
                          Select Match
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setSelectedDonationForMatches(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-semibold"
              >
                Close Matches
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <FoodRescueScoreModal
        isOpen={!!activeScoreDonation}
        onClose={() => setActiveScoreDonation(null)}
        foodName={activeScoreDonation?.food_name || ''}
        breakdown={activeScoreDonation?.food_rescue_score_breakdown}
      />

      <RescueLedgerModal
        isOpen={!!activeLedgerDonation}
        onClose={() => setActiveLedgerDonation(null)}
        donation={activeLedgerDonation}
      />

      <QrVerificationModal
        isOpen={!!activeQrDonation}
        onClose={() => setActiveQrDonation(null)}
        donation={activeQrDonation}
        mode="pickup"
      />

      <FoodSafetyCenterModal
        isOpen={!!activeSafetyDonation}
        onClose={() => setActiveSafetyDonation(null)}
        donation={activeSafetyDonation}
        onSubmitDeclaration={(safetyData) => {
          if (activeSafetyDonation) {
            appStore.updateDonation(activeSafetyDonation.id, { safety_status: 'VERIFIED' });
          }
        }}
      />

      <FoodRescueCertificateModal
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        donorUser={currentUser}
        metrics={{
          mealsRescued: totalMeals,
          kgSaved: totalKg,
          co2eAvoided: totalCO2e,
        }}
      />
    </div>
  );
};

// --- Individual Donation Card Component with Expiry Intelligence & Quick Actions ---
interface DonationCardProps {
  donation: FoodDonation;
  onViewMatches: () => void;
  onViewMap: () => void;
  onOpenScoreModal: () => void;
  onOpenLedgerModal: () => void;
  onOpenQrModal: () => void;
  onOpenSafetyModal: () => void;
}

const DonationCard: React.FC<DonationCardProps> = ({
  donation,
  onViewMatches,
  onViewMap,
  onOpenScoreModal,
  onOpenLedgerModal,
  onOpenQrModal,
  onOpenSafetyModal,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [windowState, setWindowState] = useState<'SAFE' | 'WARNING' | 'CRITICAL' | 'EXPIRED'>('SAFE');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(donation.expiry_time).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        setWindowState('EXPIRED');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
          .toString()
          .padStart(2, '0')}`
      );

      if (diff < 30 * 60 * 1000) {
        setWindowState('CRITICAL');
      } else if (diff < 60 * 60 * 1000) {
        setWindowState('WARNING');
      } else {
        setWindowState('SAFE');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [donation.expiry_time]);

  const score = donation.food_rescue_score || 88;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all space-y-4">
      {/* Header with Title & Expiry Countdown */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {donation.status.replace('_', ' ')}
            </span>
            <span className="text-[10px] text-gray-500 font-medium">
              {donation.food_category} • {donation.food_type}
            </span>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base mt-1">{donation.food_name}</h3>
        </div>

        {/* Smart Expiry Engine Window Display */}
        <div
          className={`shrink-0 px-2.5 py-1.5 rounded-xl border text-center font-mono font-bold text-xs ${
            windowState === 'EXPIRED'
              ? 'bg-red-100 text-red-800 border-red-300'
              : windowState === 'CRITICAL'
              ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
              : windowState === 'WARNING'
              ? 'bg-amber-50 text-amber-700 border-amber-300'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <div className="text-[8px] uppercase font-sans tracking-widest text-gray-400">
            {windowState === 'EXPIRED'
              ? 'EXPIRED'
              : windowState === 'CRITICAL'
              ? 'CRITICAL WINDOW'
              : windowState === 'WARNING'
              ? 'SAFE WARNING'
              : 'SAFE WINDOW'}
          </div>
          <div className="text-xs">{timeLeft || 'Calculating...'}</div>
        </div>
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{donation.description}</p>

      {/* Info Grid & Food Rescue Score Meter */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="p-2 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
          <div className="text-[10px] text-gray-400 uppercase font-bold">Quantity</div>
          <div className="font-bold text-gray-800 dark:text-gray-200">
            {donation.quantity} {donation.unit}
          </div>
        </div>

        <div className="p-2 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
          <div className="text-[10px] text-gray-400 uppercase font-bold">Shelter</div>
          <div className="font-bold text-gray-800 dark:text-gray-200 truncate">
            {donation.assigned_ngo_name || 'Matching...'}
          </div>
        </div>

        {/* Clickable Food Rescue Score Meter */}
        <button
          onClick={onOpenScoreModal}
          className="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-left hover:bg-emerald-100 transition-colors group"
        >
          <div className="text-[10px] text-emerald-700 dark:text-emerald-300 uppercase font-bold flex items-center justify-between">
            <span>Rescue Score™</span>
            <Sparkles className="w-3 h-3 text-emerald-500" />
          </div>
          <div className="font-bold text-emerald-800 dark:text-emerald-200 text-sm">
            {score} <span className="text-[10px] text-gray-400 font-normal">/ 100</span>
          </div>
        </button>
      </div>

      {/* Pickup OTP Box with QR trigger */}
      {donation.pickup_otp && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <div>
              <div className="text-[11px] font-bold text-amber-900 dark:text-amber-200">Pickup Handshake PIN</div>
              <div className="text-[10px] text-amber-700 dark:text-amber-400">Provide to volunteer on arrival:</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-white dark:bg-slate-800 rounded-xl border border-amber-300 dark:border-amber-700 font-mono font-black text-sm text-amber-900 dark:text-amber-200 tracking-widest">
              {donation.pickup_otp}
            </div>
            <button
              onClick={onOpenQrModal}
              className="p-1.5 rounded-lg bg-amber-200 dark:bg-amber-900/60 hover:bg-amber-300 text-amber-900 dark:text-amber-100 transition-colors"
              title="Show QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 dark:border-slate-800 text-xs font-semibold">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onViewMatches}
            className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 text-teal-800 dark:text-teal-300 flex items-center space-x-1 transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-teal-600" />
            <span>AI Matches</span>
          </button>

          <button
            onClick={onOpenSafetyModal}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 flex items-center space-x-1 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Safety Center</span>
          </button>

          <button
            onClick={onOpenLedgerModal}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 flex items-center space-x-1 transition-colors"
          >
            <FileCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Custody</span>
          </button>
        </div>

        <button
          onClick={onViewMap}
          className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 flex items-center space-x-1 transition-colors"
        >
          <MapPin className="w-3.5 h-3.5 text-gray-500" />
          <span>Track</span>
        </button>
      </div>

      <div className="text-[9px] text-gray-400 italic">
        Distribution window estimate. Final food-safety responsibility remains with the donor kitchen authorized handler.
      </div>
    </div>
  );
};
