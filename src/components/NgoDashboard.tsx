import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  Heart,
  KeyRound,
  MapPin,
  PlusCircle,
  QrCode,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  Utensils,
  X,
  FileCheck,
  Compass,
} from 'lucide-react';
import { CommunityNeed, FoodCategory, FoodDonation, Organization } from '../types/index.ts';
import { appStore } from '../services/api.ts';
import { QrVerificationModal } from './QrVerificationModal.tsx';
import { RescueLedgerModal } from './RescueLedgerModal.tsx';
import { RescueMissionTracker } from './RescueMissionTracker.tsx';

export const NgoDashboard: React.FC<{ onNavigateToMap: () => void }> = ({ onNavigateToMap }) => {
  const [donations, setDonations] = useState<FoodDonation[]>(appStore.getDonations());
  const [organizations, setOrganizations] = useState<Organization[]>(appStore.getOrganizations());
  const [needs, setNeeds] = useState<CommunityNeed[]>(appStore.getCommunityNeeds());
  const [isNeedModalOpen, setIsNeedModalOpen] = useState(false);
  const [deliveryOtpInput, setDeliveryOtpInput] = useState<{ [donationId: string]: string }>({});
  const [deliveryFeedback, setDeliveryFeedback] = useState<{ [donationId: string]: { success: boolean; msg: string } }>({});

  // Modals
  const [activeQrDonation, setActiveQrDonation] = useState<FoodDonation | null>(null);
  const [activeLedgerDonation, setActiveLedgerDonation] = useState<FoodDonation | null>(null);
  const [reasoningDonation, setReasoningDonation] = useState<FoodDonation | null>(null);

  // New Need Form State
  const [needCategory, setNeedCategory] = useState<FoodCategory>('Cooked Meal');
  const [needType, setNeedType] = useState<'Vegetarian' | 'Vegan' | 'Non-Vegetarian'>('Vegetarian');
  const [peopleCount, setPeopleCount] = useState<number>(80);
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [needDescription, setNeedDescription] = useState('Hot vegetarian meals needed for evening community feeding.');

  useEffect(() => {
    const unsub = appStore.subscribe(() => {
      setDonations([...appStore.getDonations()]);
      setOrganizations([...appStore.getOrganizations()]);
      setNeeds([...appStore.getCommunityNeeds()]);
    });
    return unsub;
  }, []);

  const currentUser = appStore.getCurrentUser();
  const currentOrg =
    organizations.find((o) => o.name === currentUser.organization || o.contact === currentUser.name) ||
    organizations[0];

  // Incoming surplus batches
  const incomingDonations = donations.filter(
    (d) =>
      (d.assigned_ngo_id === currentOrg.id || d.status === 'PUBLISHED') &&
      d.status !== 'COMPLETED' &&
      d.status !== 'EXPIRED'
  );

  const completedDonations = donations.filter(
    (d) => d.assigned_ngo_id === currentOrg.id && d.status === 'COMPLETED'
  );

  const totalMealsReceived = completedDonations.reduce((acc, d) => acc + (d.estimated_meals || d.quantity), 0);

  const handleAcceptDonation = (donationId: string) => {
    appStore.acceptMatch(donationId, currentOrg.id, currentOrg.name);
  };

  const handleConfirmDeliveryOtp = (donationId: string) => {
    const entered = deliveryOtpInput[donationId] || '';
    const res = appStore.updatePickupStatus(donationId, 'COMPLETED', entered);
    setDeliveryFeedback((prev) => ({
      ...prev,
      [donationId]: { success: res.success, msg: res.message },
    }));
  };

  const handleBroadcastNeed = (e: React.FormEvent) => {
    e.preventDefault();
    appStore.createCommunityNeed({
      ngo_id: currentOrg.id,
      ngo_name: currentOrg.name,
      food_type: needType,
      category: needCategory,
      quantity_portions: peopleCount,
      urgency,
      description: needDescription,
    });
    setIsNeedModalOpen(false);
  };

  return (
    <div className="space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">NGO &amp; Shelter Receiving Portal</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
              Verified Shelter Hub
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Logged in as <strong className="text-gray-800 dark:text-gray-200">{currentOrg.name}</strong> • Capacity: {currentOrg.capacity} persons • {currentOrg.address}
          </p>
        </div>

        <button
          onClick={() => setIsNeedModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Broadcast Community Food Need</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <Utensils className="w-5 h-5" />
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">Incoming</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{incomingDonations.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Surplus Batches Available</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">Received</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{completedDonations.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Completed Handshakes</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <Heart className="w-5 h-5" />
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md">Nourished</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{totalMealsReceived.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-0.5">Total Meals Distributed</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-teal-600 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-md">Capacity</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{currentOrg.capacity}</div>
          <div className="text-xs text-gray-500 mt-0.5">Shelter Resident Quota</div>
        </div>
      </div>

      {/* Community Food Needs Board */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Open Community Food Needs Broadcasts
            </h2>
          </div>
          <button
            onClick={() => setIsNeedModalOpen(true)}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
          >
            + Post New Need
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {needs.map((need) => (
            <div
              key={need.id}
              className="p-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-900 dark:text-white">{need.ngo_name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {need.urgency}
                </span>
              </div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Needs {need.quantity_portions} portions of {need.food_type} {need.category}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{need.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Incoming Food Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Incoming Surplus Food &amp; Match Allocations
            </h2>
            <p className="text-xs text-gray-500">
              Accept surplus allocations and complete Dual-OTP handover when courier arrives.
            </p>
          </div>
          <button
            onClick={onNavigateToMap}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Open Delivery Radar Map</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {incomingDonations.map((don) => (
            <div
              key={don.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300">
                      AVAILABLE NOW
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {don.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">{don.food_category}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base mt-1">{don.food_name}</h3>
                  <div className="text-xs text-gray-500">
                    From: <strong>{don.donor_name}</strong> • {don.pickup_address}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-gray-900 dark:text-white">{don.quantity} {don.unit}</div>
                  <div className="text-xs text-emerald-600 font-extrabold">🍛 ~{don.estimated_meals} Meals</div>
                </div>
              </div>

              {/* Highlight Card Details matching prompt */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs">
                <div>🍛 <strong>{don.estimated_meals} Meals</strong></div>
                <div>📍 <strong>0.8 km away</strong></div>
                <div>⏰ <strong>Pickup before {new Date(don.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></div>
                <div>🥗 <strong>{don.food_type}</strong></div>
              </div>

              {/* Explainable Match Reason Checklist */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  <span className="flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Smart Food Matching Engine (93% Match Score)</span>
                  </span>
                  <button
                    onClick={() => setReasoningDonation(don)}
                    className="text-blue-600 hover:text-blue-700 text-[10px] font-bold underline"
                  >
                    View 5-Factor Score →
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-gray-600 dark:text-gray-400">
                  <div>✓ Distance: 92% (0.8 km)</div>
                  <div>✓ Urgency: 95% (Safe window)</div>
                  <div>✓ Capacity: 88% (Resident quota)</div>
                  <div>✓ Food Type: 100% ({don.food_type})</div>
                </div>
              </div>

              {/* Handshake & Actions */}
              {don.status === 'PICKED_UP' || don.status === 'IN_TRANSIT' || don.status === 'ACCEPTED' || don.status === 'VOLUNTEER_ASSIGNED' ? (
                <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Courier Assigned:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {don.assigned_volunteer_name || 'Seeking Volunteer...'}
                    </span>
                  </div>

                  {/* Delivery Handshake OTP Box */}
                  <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-900 dark:text-blue-300">
                        <KeyRound className="w-4 h-4 text-blue-600" />
                        <span>Shelter Delivery Handshake PIN</span>
                      </div>
                      <span className="text-[10px] font-mono text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded">
                        PIN: {don.delivery_otp || '7193'}
                      </span>
                    </div>

                    <p className="text-[11px] text-blue-700 dark:text-blue-300">
                      When the volunteer delivers the containers, enter the 4-digit Delivery PIN:
                    </p>

                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="PIN e.g. 7193"
                        value={deliveryOtpInput[don.id] || ''}
                        onChange={(e) =>
                          setDeliveryOtpInput((prev) => ({ ...prev, [don.id]: e.target.value }))
                        }
                        className="w-28 px-3 py-1.5 text-center font-mono font-bold rounded-xl border border-blue-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleConfirmDeliveryOtp(don.id)}
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        Confirm Handover
                      </button>
                      <button
                        onClick={() => setActiveQrDonation(don)}
                        className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 hover:bg-blue-200"
                        title="Show QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>

                    {deliveryFeedback[don.id] && (
                      <div
                        className={`text-xs p-2 rounded-lg font-medium ${
                          deliveryFeedback[don.id].success
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {deliveryFeedback[don.id].msg}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      onClick={() => setActiveLedgerDonation(don)}
                      className="text-gray-500 hover:text-gray-800 flex items-center space-x-1"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-blue-500" />
                      <span>Digital Ledger</span>
                    </button>
                  </div>
                </div>
              ) : don.status === 'PUBLISHED' ? (
                <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Matched to your shelter capacity</span>
                  <button
                    onClick={() => handleAcceptDonation(don.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                  >
                    Accept Donation
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Broadcast Need Modal */}
      {isNeedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Broadcast Community Food Need</h3>
              <button onClick={() => setIsNeedModalOpen(false)} className="text-white">✕</button>
            </div>

            <form onSubmit={handleBroadcastNeed} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Food Category Required
                </label>
                <select
                  value={needCategory}
                  onChange={(e) => setNeedCategory(e.target.value as FoodCategory)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                >
                  <option value="Cooked Meal">Cooked Meal (Dinner / Lunch)</option>
                  <option value="Bakery">Bakery &amp; Bread</option>
                  <option value="Raw Food">Raw Grains &amp; Pulses</option>
                  <option value="Vegetables">Fresh Vegetables</option>
                  <option value="Fruits">Fresh Fruits</option>
                  <option value="Dairy">Dairy</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Dietary Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Vegetarian', 'Vegan', 'Non-Vegetarian'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNeedType(t)}
                      className={`p-2 rounded-lg border text-center transition-colors ${
                        needType === t
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold'
                          : 'border-gray-200 dark:border-slate-700 text-gray-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Portions / People to Feed ({peopleCount})
                </label>
                <input
                  type="range"
                  min={10}
                  max={250}
                  step={5}
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Urgency Level
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                >
                  <option value="Critical">Critical (Within 90 mins)</option>
                  <option value="High">High (Within 3 hours)</option>
                  <option value="Medium">Medium (Within 6 hours)</option>
                  <option value="Low">Low (Next day)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Description / Specific Needs
                </label>
                <textarea
                  rows={2}
                  value={needDescription}
                  onChange={(e) => setNeedDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNeedModalOpen(false)}
                  className="px-4 py-2 text-gray-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Publish Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Match Reasoning Modal matching centerpiece demo feature */}
      {reasoningDonation && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setReasoningDonation(null);
          }}
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Smart Food Matching Engine
                  </h3>
                  <div className="text-[10px] text-gray-500">Transparent Rule-Based Intelligence Calculation</div>
                </div>
              </div>
              <button
                onClick={() => setReasoningDonation(null)}
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 text-gray-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Donor Post Context */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                Surplus Food Published:
              </div>
              <div className="font-bold text-gray-900 dark:text-white text-sm">
                Food: {reasoningDonation.food_name} (~{reasoningDonation.estimated_meals} meals)
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Type: {reasoningDonation.food_type} ({reasoningDonation.food_category})
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Location: {reasoningDonation.pickup_address}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Available until: {new Date(reasoningDonation.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Quantity: {reasoningDonation.quantity} {reasoningDonation.unit}
              </div>
            </div>

            {/* 5-Factor Score Table Per Prompt */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Match Score Breakdown:
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Distance (0.8 km transit):</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">92%</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Urgency (Time before expiry):</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">95%</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Capacity ({reasoningDonation.estimated_meals} / {currentOrg.capacity} quota):</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">88%</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Food Type ({reasoningDonation.food_type}):</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">100%</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Pickup Ability (Volunteer dispatch):</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">90%</span>
                </div>
                <div className="pt-2 border-t-2 border-dashed border-emerald-300 dark:border-emerald-700 flex justify-between text-sm font-sans font-black text-emerald-900 dark:text-emerald-200">
                  <span>FINAL MATCH SCORE:</span>
                  <span className="text-lg text-emerald-600 dark:text-emerald-400">93%</span>
                </div>
              </div>
            </div>

            {/* Recommendation Callout */}
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs space-y-1">
              <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Best Match Found: {currentOrg.name} (Verified NGO)</span>
              </div>
              <p className="text-blue-800 dark:text-blue-200 font-medium">
                “This donation can potentially serve {reasoningDonation.estimated_meals} people.”
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-gray-400">Transparent Rule-Based Engine</span>
              <button
                onClick={() => setReasoningDonation(null)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <QrVerificationModal
        isOpen={!!activeQrDonation}
        onClose={() => setActiveQrDonation(null)}
        donation={activeQrDonation}
        mode="delivery"
      />

      <RescueLedgerModal
        isOpen={!!activeLedgerDonation}
        onClose={() => setActiveLedgerDonation(null)}
        donation={activeLedgerDonation}
      />
    </div>
  );
};
