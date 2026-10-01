import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  KeyRound,
  MapPin,
  Navigation,
  Phone,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Truck,
  Upload,
  UserCheck,
  Utensils,
  X,
} from 'lucide-react';
import { FoodDonation } from '../types/index.ts';
import { appStore } from '../services/api.ts';
import confetti from 'canvas-confetti';

export type MissionStep =
  | 'ASSIGNED'
  | 'NAVIGATING_TO_DONOR'
  | 'ARRIVED_AT_DONOR'
  | 'SAFETY_VERIFIED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'ARRIVED_AT_NGO'
  | 'DELIVERED'
  | 'MISSION_COMPLETE';

interface VolunteerMissionModeProps {
  donation: FoodDonation;
  onClose: () => void;
  onMissionComplete: (donation: FoodDonation) => void;
}

export const VolunteerMissionMode: React.FC<VolunteerMissionModeProps> = ({
  donation,
  onClose,
  onMissionComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<MissionStep>(
    donation.status === 'DELIVERED' || donation.status === 'COMPLETED'
      ? 'MISSION_COMPLETE'
      : donation.status === 'PICKED_UP' || donation.status === 'IN_TRANSIT'
      ? 'IN_TRANSIT'
      : 'ASSIGNED'
  );

  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);

  // 7-Point Safety verification checklist state
  const [checklist, setChecklist] = useState({
    prepTimeVerified: true,
    packagingIntact: true,
    storedSafely: true,
    noContamination: true,
    expiryValid: true,
    handlerDeclared: true,
    quantityVerified: true,
  });

  const etaMinutes = 11;
  const distanceKm = 2.4;
  const foodExpiresInMinutes = 45; // Safe window check

  const isRouteAtRisk = etaMinutes > foodExpiresInMinutes;

  const handleAdvanceStep = (next: MissionStep) => {
    setCurrentStep(next);
  };

  const handleVerifyPickupOtp = () => {
    if (!otpInput.trim()) {
      setOtpError('Please enter the 4-digit Pickup PIN.');
      return;
    }
    const expected = donation.pickup_otp || '4821';
    if (otpInput.trim() !== expected.trim()) {
      setOtpError(`Invalid PIN '${otpInput}'. Ask the kitchen supervisor for their code.`);
      return;
    }
    setOtpError(null);
    appStore.updatePickupStatus(donation.id, 'PICKED_UP', otpInput.trim());
    setCurrentStep('PICKED_UP');
  };

  const handleVerifyDeliveryOtp = () => {
    if (!otpInput.trim()) {
      setOtpError('Please enter the 4-digit Delivery PIN.');
      return;
    }
    const expected = donation.delivery_otp || '7193';
    if (otpInput.trim() !== expected.trim()) {
      setOtpError(`Invalid PIN '${otpInput}'. Ask the receiving shelter director.`);
      return;
    }
    setOtpError(null);
    appStore.updatePickupStatus(donation.id, 'COMPLETED', otpInput.trim());
    setCurrentStep('MISSION_COMPLETE');

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // non-browser environments
    }

    onMissionComplete(donation);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProofPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const allSafetyChecked = Object.values(checklist).every(Boolean);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95">
        {/* Sticky Mobile Mission Bar Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
              <Truck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-300">
                  Rescue Mission
                </span>
                <span className="font-mono text-xs font-bold text-gray-400">#{donation.id.toUpperCase()}</span>
              </div>
              <h2 className="text-base font-bold text-white">{donation.food_name}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mission Progress Indicator Strip */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between text-[11px] font-bold">
          <span className="text-emerald-700 dark:text-emerald-300 flex items-center space-x-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>Phase: {currentStep.replace(/_/g, ' ')}</span>
          </span>
          <span className="text-gray-500 font-mono">
            {distanceKm} km · ETA {etaMinutes}m
          </span>
        </div>

        {/* Route Risk Warning Alert if ETA exceeds safe window */}
        {isRouteAtRisk && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 text-rose-800 dark:text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <div>
              <strong>ROUTE RISK:</strong> Estimated arrival exceeds remaining food shelf life. Expedite transit!
            </div>
          </div>
        )}

        {/* Scrollable Mission Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Summary Route Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Pickup Location (Donor)</span>
                <span className="font-bold text-gray-900 dark:text-white text-sm">{donation.donor_name}</span>
                <p className="text-gray-500 text-[11px]">{donation.pickup_address}</p>
              </div>
              <a
                href={`tel:+919822144550`}
                className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                title="Call Donor Kitchen"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex items-start justify-between">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Delivery Location (Shelter)</span>
                <span className="font-bold text-gray-900 dark:text-white text-sm">
                  {donation.assigned_ngo_name || 'Annapurna Community Shelter'}
                </span>
                <p className="text-gray-500 text-[11px]">Rajarampuri 5th Lane, Kolhapur</p>
              </div>
              <a
                href={`tel:+919822077112`}
                className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 hover:bg-blue-100 transition-colors"
                title="Call Shelter Director"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>

            {/* Turn-by-Turn External GPS Navigation button */}
            <a
              href={`https://maps.google.com/?q=${donation.latitude},${donation.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold flex items-center justify-center space-x-2 transition-all shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Open in Google Maps / Turn-by-Turn GPS</span>
            </a>
          </div>

          {/* Phase 1: ASSIGNED */}
          {currentStep === 'ASSIGNED' && (
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center">
                <Truck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Ready to Start Mission?</h3>
                <p className="text-gray-500 max-w-xs mx-auto mt-1">
                  Ensure insulated container bags are strapped to your vehicle before heading to the donor kitchen.
                </p>
              </div>
              <button
                onClick={() => handleAdvanceStep('NAVIGATING_TO_DONOR')}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <span>START MISSION &amp; NAVIGATE TO DONOR</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Phase 2: NAVIGATING_TO_DONOR */}
          {currentStep === 'NAVIGATING_TO_DONOR' && (
            <div className="space-y-4 text-center py-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-900 dark:text-amber-200 space-y-1">
                <div className="font-bold text-sm">En Route to Donor Kitchen</div>
                <div className="text-[11px]">Distance: {distanceKm} km · Estimated Transit: {etaMinutes} mins</div>
              </div>
              <p className="text-gray-500">
                When you arrive at the donor site ({donation.donor_name}), tap below to initiate physical safety inspection:
              </p>
              <button
                onClick={() => handleAdvanceStep('ARRIVED_AT_DONOR')}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all"
              >
                I HAVE ARRIVED AT DONOR KITCHEN
              </button>
            </div>
          )}

          {/* Phase 3: ARRIVED_AT_DONOR -> Safety Verification */}
          {currentStep === 'ARRIVED_AT_DONOR' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm border-b pb-2">
                <ShieldCheck className="w-5 h-5" />
                <span>Physical 7-Point Safety Verification</span>
              </div>
              <p className="text-gray-500">
                Inspect conditions prior to accepting physical custody of containers:
              </p>

              <div className="space-y-2">
                {[
                  { key: 'prepTimeVerified', label: 'Preparation time confirmed with kitchen chef' },
                  { key: 'packagingIntact', label: 'Food-grade stainless/sealed packaging is intact' },
                  { key: 'storedSafely', label: 'Food stored in thermal insulation (>60°C or <5°C)' },
                  { key: 'noContamination', label: 'No visual contamination or sensory degradation' },
                  { key: 'expiryValid', label: 'Expiry deadline is sufficient for transit window' },
                  { key: 'handlerDeclared', label: 'Chef hygiene and handler declaration confirmed' },
                  { key: 'quantityVerified', label: 'Portion count matches manifest (~' + donation.quantity + ' ' + donation.unit + ')' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start space-x-2.5 p-2 rounded-xl border border-gray-200 dark:border-slate-800 hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={(checklist as any)[item.key]}
                      onChange={(e) =>
                        setChecklist((prev) => ({ ...prev, [item.key]: e.target.checked }))
                      }
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{item.label}</span>
                  </label>
                ))}
              </div>

              <button
                disabled={!allSafetyChecked}
                onClick={() => handleAdvanceStep('SAFETY_VERIFIED')}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-md transition-all"
              >
                SAFETY VERIFIED — ENTER PICKUP PIN
              </button>
            </div>
          )}

          {/* Phase 4: SAFETY_VERIFIED -> Pickup PIN Handshake */}
          {currentStep === 'SAFETY_VERIFIED' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-amber-950 dark:text-amber-200 text-sm">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>Enter Donor Kitchen Pickup PIN</span>
                </div>
                <p className="text-amber-800 dark:text-amber-300 text-[11px]">
                  Ask the donor kitchen supervisor for their 4-digit Pickup PIN code to verify custody transfer:
                </p>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter 4-digit PIN"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-amber-300 dark:border-slate-700 font-mono text-center text-base font-bold bg-white dark:bg-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <button
                    onClick={handleVerifyPickupOtp}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm"
                  >
                    Verify PIN
                  </button>
                </div>
                {otpError && <div className="text-rose-600 text-xs font-semibold">{otpError}</div>}
              </div>

              {/* Optional Photo Proof */}
              <div className="p-3 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center space-x-1">
                    <Camera className="w-4 h-4 text-gray-500" />
                    <span>Upload Pickup Photo Proof (Optional)</span>
                  </span>
                  {proofPhoto && <span className="text-emerald-600 font-bold">✓ Attached</span>}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>
            </div>
          )}

          {/* Phase 5: PICKED_UP / IN_TRANSIT */}
          {(currentStep === 'PICKED_UP' || currentStep === 'IN_TRANSIT') && (
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 mx-auto flex items-center justify-center animate-pulse">
                <Truck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Food In Transit to Shelter</h3>
                <p className="text-gray-500 max-w-xs mx-auto mt-1">
                  Food containers securely loaded. Proceed to <strong>{donation.assigned_ngo_name || 'Annapurna Community Shelter'}</strong>.
                </p>
              </div>

              <button
                onClick={() => {
                  setOtpInput('');
                  handleAdvanceStep('ARRIVED_AT_NGO');
                }}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all"
              >
                I HAVE ARRIVED AT RECIPIENT SHELTER
              </button>
            </div>
          )}

          {/* Phase 6: ARRIVED_AT_NGO -> Delivery PIN Handshake */}
          {currentStep === 'ARRIVED_AT_NGO' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-blue-950 dark:text-blue-200 text-sm">
                  <KeyRound className="w-4 h-4 text-blue-600" />
                  <span>Enter Shelter Director's Delivery PIN</span>
                </div>
                <p className="text-blue-800 dark:text-blue-300 text-[11px]">
                  Present food containers to the receiving supervisor and enter their 4-digit Delivery PIN:
                </p>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter 4-digit PIN"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-blue-300 dark:border-slate-700 font-mono text-center text-base font-bold bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    onClick={handleVerifyDeliveryOtp}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm"
                  >
                    Complete Handover
                  </button>
                </div>
                {otpError && <div className="text-rose-600 text-xs font-semibold">{otpError}</div>}
              </div>

              {/* Delivery Proof */}
              <div className="p-3 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center space-x-1">
                    <Camera className="w-4 h-4 text-gray-500" />
                    <span>Upload Handover Proof Photo</span>
                  </span>
                  {proofPhoto && <span className="text-emerald-600 font-bold">✓ Attached</span>}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          )}

          {/* Phase 7: MISSION_COMPLETE */}
          {currentStep === 'MISSION_COMPLETE' && (
            <div className="space-y-4 text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">🎉 RESCUE COMPLETE!</h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-xs mx-auto mt-1 font-medium">
                  {donation.quantity} {donation.unit} (~{donation.estimated_meals} meals) safely delivered to {donation.assigned_ngo_name || 'Annapurna Community Shelter'}.
                </p>
              </div>
              <button
                onClick={() => onMissionComplete(donation)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md transition-all"
              >
                VIEW RESCUE STORY &amp; SOCIAL SHARE CARD
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
