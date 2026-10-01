import React, { useEffect, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Compass,
  KeyRound,
  MapPin,
  Navigation,
  ShieldCheck,
  Sparkles,
  Truck,
  UserCheck,
  Utensils,
  AlertTriangle,
  FileCheck,
  Wifi,
  WifiOff,
  CloudOff,
  RefreshCw,
  Phone,
} from 'lucide-react';
import { FoodDonation, Volunteer } from '../types';
import { appStore } from '../services/api';
import { OfflineCachedPickup, OfflineStorageManager } from '../services/offlineStorage';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { OfflineStatusBanner } from './OfflineStatusBanner';
import { OfflineVolunteerCard } from './OfflineVolunteerCard';
import { QrVerificationModal } from './QrVerificationModal';
import { RescueLedgerModal } from './RescueLedgerModal';
import confetti from 'canvas-confetti';

interface VolunteerDashboardProps {
  onNavigateToMap: (donationId?: string) => void;
  onOpenQualityAssurance?: () => void;
}

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({
  onNavigateToMap,
  onOpenQualityAssurance,
}) => {
  const [donations, setDonations] = useState<FoodDonation[]>(appStore.getDonations());
  const [volunteers, setVolunteers] = useState<Volunteer[]>(appStore.getVolunteers());
  const [cachedPickups, setCachedPickups] = useState<OfflineCachedPickup[]>(
    OfflineStorageManager.getCachedPickups()
  );
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(
    OfflineStorageManager.getLastSyncTime()
  );
  const [otpInputs, setOtpInputs] = useState<{ [id: string]: string }>({});
  const [otpMessages, setOtpMessages] = useState<{ [id: string]: { success: boolean; text: string } }>({});
  const [activeChecklistDonation, setActiveChecklistDonation] = useState<FoodDonation | null>(null);

  // New features: Vehicle, Availability, Modals, Sorting
  const [vehicle, setVehicle] = useState<'Motorcycle' | 'Bicycle' | 'Car / Van' | 'EV Cargo Bike' | 'On Foot'>('Motorcycle');
  const [availability, setAvailability] = useState<'Available' | 'On Delivery' | 'Offline'>('Available');
  const [sortBy, setSortBy] = useState<'urgency' | 'distance' | 'deadline'>('urgency');
  const [activeQrDonation, setActiveQrDonation] = useState<FoodDonation | null>(null);
  const [activeLedgerDonation, setActiveLedgerDonation] = useState<FoodDonation | null>(null);

  const { isOnline } = useOnlineStatus();

  // 7 Food Safety Checklist Checkboxes state
  const [checklist, setChecklist] = useState({
    prepTimeVerified: true,
    packagingIntact: true,
    storedSafely: true,
    noContamination: true,
    expiryValid: true,
    handlerDeclared: true,
    quantityVerified: true,
  });

  const currentUser = appStore.getCurrentUser();
  const currentVolunteer =
    volunteers.find((v) => v.name === currentUser.name || v.user_id === currentUser.id) ||
    volunteers[0];

  // Sync state and automatically update offline localStorage cache on changes
  useEffect(() => {
    const unsub = appStore.subscribe(() => {
      setDonations([...appStore.getDonations()]);
      setVolunteers([...appStore.getVolunteers()]);
      appStore.syncVolunteerOfflineCache(currentVolunteer.id);
      setCachedPickups(OfflineStorageManager.getCachedPickups());
      setLastSyncTime(OfflineStorageManager.getLastSyncTime());
    });

    // Initial cache sync on mount
    appStore.syncVolunteerOfflineCache(currentVolunteer.id);
    setCachedPickups(OfflineStorageManager.getCachedPickups());
    setLastSyncTime(OfflineStorageManager.getLastSyncTime());

    return unsub;
  }, [currentVolunteer.id]);

  const handleManualSync = () => {
    appStore.syncVolunteerOfflineCache(currentVolunteer.id);
    setCachedPickups(OfflineStorageManager.getCachedPickups());
    setLastSyncTime(OfflineStorageManager.getLastSyncTime());
  };

  // Pickups available for this volunteer or anyone to grab
  const availablePickups = donations.filter(
    (d) => d.status === 'PUBLISHED' || d.status === 'MATCHED' || d.status === 'ACCEPTED'
  );

  // Pickups actively assigned to this volunteer
  const activePickups = donations.filter(
    (d) =>
      (d.assigned_volunteer_id === currentVolunteer.id ||
        d.assigned_volunteer_name === currentVolunteer.name) &&
      (d.status === 'VOLUNTEER_ASSIGNED' || d.status === 'PICKED_UP' || d.status === 'IN_TRANSIT')
  );

  const handleAcceptPickup = (donation: FoodDonation) => {
    appStore.assignVolunteer(donation.id, currentVolunteer.id, currentVolunteer.name);
    handleManualSync();
  };

  const handleVerifyPickupOtp = (donationId: string) => {
    const entered = otpInputs[donationId] || '';
    const res = appStore.confirmPickupWithOtp(donationId, entered);
    setOtpMessages((prev) => ({
      ...prev,
      [donationId]: { success: res.success, text: res.message },
    }));
    handleManualSync();
  };

  const handleVerifyDeliveryOtp = (donationId: string) => {
    const entered = otpInputs[donationId] || '';
    const res = appStore.confirmDeliveryWithOtp(donationId, entered);
    setOtpMessages((prev) => ({
      ...prev,
      [donationId]: { success: res.success, text: res.message },
    }));

    if (res.success) {
      handleManualSync();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore in non-browser environments
      }
    }
  };

  const submitSafetyChecklist = () => {
    if (!activeChecklistDonation) return;
    appStore.submitSafetyCheck(activeChecklistDonation.id, {
      id: `sc-${Date.now()}`,
      donation_id: activeChecklistDonation.id,
      temperature_checked: true,
      packaging_intact: checklist.packagingIntact,
      preparation_time_verified: checklist.prepTimeVerified,
      expiry_verified: checklist.expiryValid,
      contamination_check: checklist.noContamination,
      handler_verified: checklist.handlerDeclared,
      quantity_verified: checklist.quantityVerified,
      storage_method: 'Insulated thermal carrier bag',
      temperature_c: 62,
      overall_status: 'SAFE',
      checked_by: currentVolunteer.name,
      timestamp: new Date().toISOString(),
    });
    setActiveChecklistDonation(null);
    handleManualSync();
  };

  return (
    <div className="space-y-6 py-2">
      {/* Offline Status & Local Storage Sync Banner */}
      <OfflineStatusBanner lastSyncTime={lastSyncTime} onForceSync={handleManualSync} />

      {/* Top Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Volunteer Rapid Rescue Hub</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold border border-amber-200">
              Verified Courier
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
            <span>Courier: <strong className="text-gray-800 dark:text-gray-200">{currentVolunteer.name}</strong></span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <span>Vehicle:</span>
              <select
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value as any)}
                className="px-2 py-0.5 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-gray-800 dark:text-gray-200"
              >
                <option value="Motorcycle">Motorcycle</option>
                <option value="Bicycle">Bicycle</option>
                <option value="Scooter">EV Scooter</option>
                <option value="Car / Van">Car / Van</option>
                <option value="On Foot">On Foot</option>
              </select>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <span>Availability:</span>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as any)}
                className={`px-2 py-0.5 rounded border text-xs font-bold ${
                  availability === 'Available'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : availability === 'On Delivery'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-gray-100 text-gray-600 border-gray-300'
                }`}
              >
                <option value="Available">Available</option>
                <option value="On Delivery">Busy (On Delivery)</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
          </div>
        </div>

        {/* Badges & Food QA Action */}
        <div className="flex items-center space-x-2 flex-wrap">
          {onOpenQualityAssurance && (
            <button
              onClick={onOpenQualityAssurance}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-2xs"
              title="Open Food Quality Assurance Center"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Food QA Center</span>
            </button>
          )}

          {currentVolunteer.badges.map((b) => (
            <span
              key={b}
              className="text-[11px] px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-semibold flex items-center space-x-1"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>{b}</span>
            </span>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <Truck className="w-5 h-5" />
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">Runs</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">{currentVolunteer.completed_pickups}</div>
          <div className="text-xs text-gray-500 mt-0.5">Completed Deliveries</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-teal-600 mb-2">
            <Utensils className="w-5 h-5" />
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">Meals</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">
            {(currentVolunteer.completed_pickups * 45).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Meals Transported</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <Compass className="w-5 h-5" />
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">Distance</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">
            {Math.round(currentVolunteer.completed_pickups * 3.8)} km
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Total Distance Rescued</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Resilience</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">Offline PWA</div>
          <div className="text-xs text-gray-500 mt-0.5">Local Storage Enabled</div>
        </div>
      </div>

      {/* Active Missions (Assigned & In Progress) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <span>Active Rescue Assignments</span>
              {!isOnline && (
                <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full font-bold">
                  Viewing Offline Cache
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-500">
              Pick up food from donor, inspect safety, and deliver to shelter. Details accessible without internet connection.
            </p>
          </div>
          <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-200">
            {isOnline ? activePickups.length : cachedPickups.length} In Pipeline
          </span>
        </div>

        {/* When OFFLINE: Render Offline Cached Pickup Cards directly from localStorage */}
        {!isOnline ? (
          cachedPickups.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 space-y-2">
              <CloudOff className="w-8 h-8 text-amber-500 mx-auto" />
              <div className="text-sm font-semibold text-gray-700">No cached pickup missions found</div>
              <p className="text-xs text-gray-400">
                Connect to internet to refresh active courier manifest into local storage.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {cachedPickups.map((cached) => (
                <OfflineVolunteerCard
                  key={cached.donationId}
                  pickup={cached}
                  isOnline={false}
                  onRefreshCache={handleManualSync}
                />
              ))}
            </div>
          )
        ) : (
          /* When ONLINE: Standard interactive cards with real-time sync + offline caching */
          activePickups.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 space-y-2">
              <Truck className="w-8 h-8 text-gray-300 mx-auto" />
              <div className="text-sm font-semibold text-gray-600">No active assignment right now</div>
              <p className="text-xs text-gray-400">Select an available pickup below to start a rescue mission.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {activePickups.map((don) => (
                <div
                  key={don.id}
                  className="bg-white rounded-3xl border border-indigo-200 p-5 shadow-xs space-y-4 ring-2 ring-indigo-50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                        {don.status.replace('_', ' ')}
                      </span>
                      <h3 className="font-bold text-gray-900 text-base mt-1">{don.food_name}</h3>
                      <div className="text-xs text-gray-500">
                        Donor: <strong>{don.donor_name}</strong>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-indigo-900 bg-indigo-50 px-2 py-1 rounded-lg">
                        {don.quantity} {don.unit}
                      </span>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                        ~{don.estimated_meals} meals
                      </div>
                    </div>
                  </div>

                  {/* Route specs */}
                  <div className="p-3 bg-gray-50 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></div>
                      <span className="text-gray-500">Pickup:</span>
                      <span className="font-semibold text-gray-900 truncate">{don.pickup_address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></div>
                      <span className="text-gray-500">Dropoff:</span>
                      <span className="font-semibold text-gray-900 truncate">
                        {don.assigned_ngo_name || 'Annapurna Community Shelter'}
                      </span>
                    </div>
                  </div>

                  {/* Step 1: Pre-Pickup Safety Checklist Verification */}
                  <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="text-xs font-bold text-emerald-950">Food Safety Checklist</div>
                        <div className="text-[10px] text-emerald-700">
                          {don.safety_check ? 'Verified & Approved' : 'Requires Physical Verification Before Pickup'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveChecklistDonation(don)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors shadow-2xs"
                    >
                      {don.safety_check ? 'View Checklist' : 'Verify Safety'}
                    </button>
                  </div>

                  {/* Step 2: Pickup OTP Entry (when at donor) */}
                  {don.status === 'VOLUNTEER_ASSIGNED' && (
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900 flex items-center space-x-1">
                          <KeyRound className="w-4 h-4 text-amber-600" />
                          <span>Enter Donor's Pickup OTP:</span>
                        </span>
                        <span className="text-[10px] font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                          Donor's code: {don.pickup_otp}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="e.g. 4728"
                          value={otpInputs[don.id] || ''}
                          onChange={(e) => setOtpInputs((prev) => ({ ...prev, [don.id]: e.target.value }))}
                          className="w-28 px-3 py-1.5 text-center font-mono font-bold rounded-xl border border-amber-300 text-sm focus:ring-2 focus:ring-amber-500 bg-white"
                        />
                        <button
                          onClick={() => handleVerifyPickupOtp(don.id)}
                          className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs"
                        >
                          Confirm Pickup
                        </button>
                      </div>

                      {otpMessages[don.id] && (
                        <div
                          className={`text-xs p-2 rounded-lg font-medium ${
                            otpMessages[don.id].success
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {otpMessages[don.id].text}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Delivery OTP Entry (when at NGO) */}
                  {(don.status === 'PICKED_UP' || don.status === 'IN_TRANSIT') && (
                    <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-900 flex items-center space-x-1">
                          <KeyRound className="w-4 h-4 text-blue-600" />
                          <span>Enter NGO's Delivery OTP:</span>
                        </span>
                        <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                          Shelter's code: {don.delivery_otp}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="e.g. 8391"
                          value={otpInputs[don.id] || ''}
                          onChange={(e) => setOtpInputs((prev) => ({ ...prev, [don.id]: e.target.value }))}
                          className="w-28 px-3 py-1.5 text-center font-mono font-bold rounded-xl border border-blue-300 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                        <button
                          onClick={() => handleVerifyDeliveryOtp(don.id)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                        >
                          Complete Delivery
                        </button>
                      </div>

                      {otpMessages[don.id] && (
                        <div
                          className={`text-xs p-2 rounded-lg font-medium ${
                            otpMessages[don.id].success
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {otpMessages[don.id].text}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Navigate Button */}
                  <button
                    onClick={() => onNavigateToMap(don.id)}
                    className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Open Live Route Navigation</span>
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Available Pickups in the Network (Only relevant when online) */}
      {isOnline && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Nearby Available Surplus Pickups</h2>
              <p className="text-xs text-gray-500">Pickups awaiting courier assignment within Kolhapur zone.</p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-gray-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-gray-800 dark:text-gray-200"
              >
                <option value="urgency">Urgency (Critical First)</option>
                <option value="distance">Proximity (Closest First)</option>
                <option value="deadline">Pickup Window</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availablePickups
              .sort((a, b) => {
                if (sortBy === 'urgency') {
                  const scoreMap: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
                  return (scoreMap[b.priority_level] || 0) - (scoreMap[a.priority_level] || 0);
                }
                return b.quantity - a.quantity;
              })
              .map((don) => (
              <div
                key={don.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-5 shadow-xs hover:border-amber-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                      {don.priority_level} PRIORITY
                    </span>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mt-1">{don.food_name}</h4>
                    <div className="text-[11px] text-gray-500">{don.donor_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-gray-900 dark:text-white">{don.quantity} {don.unit}</div>
                    <div className="text-[10px] text-emerald-600 font-bold">~{don.estimated_meals} Meals</div>
                  </div>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{don.pickup_address}</div>

                <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-slate-800">
                  <span className="text-xs text-gray-500 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{don.recommended_pickup_window}</span>
                  </span>

                  <button
                    onClick={() => handleAcceptPickup(don)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    Accept Pickup
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <QrVerificationModal
        isOpen={!!activeQrDonation}
        onClose={() => setActiveQrDonation(null)}
        donation={activeQrDonation}
        mode="pickup"
      />

      <RescueLedgerModal
        isOpen={!!activeLedgerDonation}
        onClose={() => setActiveLedgerDonation(null)}
        donation={activeLedgerDonation}
      />

      {/* Food Safety Checklist Modal (Per Section #19) */}
      {activeChecklistDonation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-gray-100 overflow-hidden my-8">
            <div className="p-6 bg-gradient-to-r from-emerald-800 to-teal-800 text-white">
              <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Standard Food Safety Verification (7-Point Inspection)</span>
              </div>
              <h3 className="text-lg font-bold">Pre-Dispatch Inspection</h3>
              <p className="text-xs text-emerald-100">
                {activeChecklistDonation.food_name} • Donor: {activeChecklistDonation.donor_name}
              </p>
            </div>

            <div className="p-6 space-y-3">
              <p className="text-xs text-gray-500 mb-2">
                As an accredited FoodBridge courier, physically inspect all seven conditions prior to accepting custody:
              </p>

              {[
                { key: 'prepTimeVerified', label: 'Food preparation time verified with kitchen supervisor' },
                { key: 'packagingIntact', label: 'Packaging is airtight, clean, and without leakage' },
                { key: 'storedSafely', label: 'Food stored in insulated container (>60°C or <5°C)' },
                { key: 'noContamination', label: 'No foreign matter or signs of sensory degradation' },
                { key: 'expiryValid', label: 'Expiry window valid for redistribution duration' },
                { key: 'handlerDeclared', label: 'Donor food safety declaration confirmed on file' },
                { key: 'quantityVerified', label: 'Actual portion count matches digital manifest' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-start space-x-3 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={(checklist as any)[item.key]}
                    onChange={(e) =>
                      setChecklist((prev) => ({ ...prev, [item.key]: e.target.checked }))
                    }
                    className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-gray-800 font-medium">{item.label}</span>
                </label>
              ))}

              <div className="pt-3 flex items-center justify-between">
                <button
                  onClick={() => setActiveChecklistDonation(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitSafetyChecklist}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  Confirm Safety & Dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
