import React, { useState } from 'react';
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  Info,
  KeyRound,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  ShieldCheck,
  Truck,
  Utensils,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { OfflineCachedPickup, OfflineStorageManager } from '../services/offlineStorage';

interface OfflineVolunteerCardProps {
  pickup: OfflineCachedPickup;
  isOnline: boolean;
  onRefreshCache?: () => void;
}

export const OfflineVolunteerCard: React.FC<OfflineVolunteerCardProps> = ({
  pickup,
  isOnline,
  onRefreshCache,
}) => {
  const [offlineOtpInput, setOfflineOtpInput] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const handleOfflinePickupOtp = () => {
    if (!offlineOtpInput.trim()) return;

    // Check against cached pickup OTP
    if (pickup.pickupOtp && offlineOtpInput.trim() === pickup.pickupOtp) {
      OfflineStorageManager.enqueueOfflineAction({
        donationId: pickup.donationId,
        action: 'CONFIRM_PICKUP',
        payload: { enteredOtp: offlineOtpInput.trim() },
      });
      setActionFeedback('✓ Pickup OTP verified offline! Action recorded & queued for network sync.');
    } else {
      setActionFeedback('✕ Invalid OTP. Check the 4-digit code provided by the donor.');
    }
  };

  const handleOpenOfflineMaps = (lat: number, lng: number, label: string) => {
    // Geo URI works natively offline on Android/iOS mobile navigation apps
    const geoUrl = `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(label)})`;
    window.location.href = geoUrl;
  };

  return (
    <div className="bg-white rounded-3xl border border-amber-200/90 shadow-sm p-5 space-y-4 relative overflow-hidden ring-1 ring-amber-100">
      {/* Offline Status Ribbon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <WifiOff className="w-3 h-3 mr-1 text-amber-700" />
            OFFLINE CACHE READY
          </span>
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            {pickup.foodCategory} • {pickup.foodType}
          </span>
        </div>
        <span className="text-[10px] text-gray-400 font-mono">
          Cached: {new Date(pickup.cachedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Food Title & Quantities */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-base">{pickup.foodName}</h3>
          <p className="text-xs text-gray-500">
            {pickup.quantity} {pickup.unit} (~{pickup.estimatedMeals} meals)
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          {pickup.status.replace('_', ' ')}
        </span>
      </div>

      {/* Critical Addresses & Locations Available Offline */}
      <div className="space-y-2.5 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
        {/* Donor Pickup details */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
            <div>
              <div className="font-bold text-gray-900">Pickup: {pickup.donorName}</div>
              <div className="text-gray-600 text-[11px] leading-snug">{pickup.pickupAddress}</div>
              {pickup.donorPhone && (
                <a
                  href={`tel:${pickup.donorPhone}`}
                  className="inline-flex items-center text-emerald-700 font-semibold text-[11px] mt-0.5 hover:underline"
                >
                  <Phone className="w-3 h-3 mr-1" />
                  <span>Call Kitchen: {pickup.donorPhone}</span>
                </a>
              )}
            </div>
          </div>
          <button
            onClick={() => handleOpenOfflineMaps(pickup.donorLatitude, pickup.donorLongitude, pickup.donorName)}
            className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 shrink-0 text-[10px] font-bold flex items-center space-x-1"
            title="Launch in Mobile Maps App (Works Offline)"
          >
            <Navigation className="w-3 h-3" />
            <span>Map</span>
          </button>
        </div>

        <div className="border-t border-slate-200/60 my-1" />

        {/* Shelter Dropoff details */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shrink-0" />
            <div>
              <div className="font-bold text-gray-900">Dropoff: {pickup.shelterName}</div>
              <div className="text-gray-600 text-[11px] leading-snug">{pickup.shelterAddress}</div>
              {pickup.shelterPhone && (
                <a
                  href={`tel:${pickup.shelterPhone}`}
                  className="inline-flex items-center text-blue-700 font-semibold text-[11px] mt-0.5 hover:underline"
                >
                  <Phone className="w-3 h-3 mr-1" />
                  <span>Call Shelter: {pickup.shelterPhone}</span>
                </a>
              )}
            </div>
          </div>
          {pickup.shelterLatitude && pickup.shelterLongitude && (
            <button
              onClick={() =>
                handleOpenOfflineMaps(
                  pickup.shelterLatitude!,
                  pickup.shelterLongitude!,
                  pickup.shelterName
                )
              }
              className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 shrink-0 text-[10px] font-bold flex items-center space-x-1"
              title="Launch in Mobile Maps App (Works Offline)"
            >
              <Navigation className="w-3 h-3" />
              <span>Map</span>
            </button>
          )}
        </div>
      </div>

      {/* Offline Instructions & Windows */}
      <div className="flex items-center justify-between text-xs text-gray-600 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60">
        <span className="flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>Safe Window: <strong>{pickup.recommendedPickupWindow}</strong></span>
        </span>
        <span className="text-[11px] font-mono text-amber-900 font-bold">
          Exp: {new Date(pickup.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Offline OTP Reference Box */}
      <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-900 flex items-center space-x-1">
            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
            <span>Pickup OTP Verification (Offline)</span>
          </span>
          {pickup.pickupOtp && (
            <span className="text-[10px] font-mono bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded font-bold">
              Backup Code: {pickup.pickupOtp}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            maxLength={4}
            placeholder="Enter OTP"
            value={offlineOtpInput}
            onChange={(e) => setOfflineOtpInput(e.target.value)}
            className="w-28 px-3 py-1.5 text-center font-mono font-bold rounded-xl border border-amber-300 text-sm focus:ring-2 focus:ring-amber-500 bg-white"
          />
          <button
            onClick={handleOfflinePickupOtp}
            className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            Verify Offline
          </button>
        </div>

        {actionFeedback && (
          <div
            className={`text-xs p-2 rounded-lg font-medium ${
              actionFeedback.startsWith('✓')
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {actionFeedback}
          </div>
        )}
      </div>

      {/* Offline Info footnote */}
      <p className="text-[10px] text-gray-400 italic">
        * Stored in device local storage. Safe to view and navigate without cellular signal or active Wi-Fi.
      </p>
    </div>
  );
};
