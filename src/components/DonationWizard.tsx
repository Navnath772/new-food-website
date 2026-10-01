import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Cpu,
  Info,
  MapPin,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Utensils,
  X,
} from 'lucide-react';
import { FoodCategory, FoodType } from '../types';
import { appStore } from '../services/api';
import { runFoodSafetyAIAnalysis } from '../services/intelligenceEngine';
import { AiFoodVerificationAssistant } from './AiFoodVerificationAssistant';

interface DonationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (donationId: string) => void;
  initialData?: Partial<any>;
  onOpenQualityAssurance?: () => void;
}

export const DonationWizard: React.FC<DonationWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  onOpenQualityAssurance,
}) => {
  const [step, setStep] = useState<number>(1);

  // Step 1: Food Details
  const [foodName, setFoodName] = useState('Vegetable Biryani with Raita');
  const [category, setCategory] = useState<FoodCategory>('Cooked Meal');
  const [foodType, setFoodType] = useState<FoodType>('Vegetarian');
  const [quantity, setQuantity] = useState<number>(50);
  const [unit, setUnit] = useState<string>('Meals');
  const [dietaryLabel, setDietaryLabel] = useState('Vegetarian, Halal-compliant, Mildly spiced');
  const [description, setDescription] = useState(
    'Freshly cooked hot meal prepared in university mess. Sealed in hygienic stainless insulated containers.'
  );

  useEffect(() => {
    if (initialData && isOpen) {
      if (initialData.food_name) setFoodName(initialData.food_name);
      if (initialData.quantity) setQuantity(initialData.quantity);
      if (initialData.unit) setUnit(initialData.unit);
      if (initialData.food_category) setCategory(initialData.food_category);
      if (initialData.food_type) setFoodType(initialData.food_type);
      if (initialData.description) setDescription(initialData.description);
    }
  }, [initialData, isOpen]);

  // Global ESC key listener to close wizard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Step 2: Time & Safety
  const [prepTime, setPrepTime] = useState(
    new Date(Date.now() - 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [expiryTime, setExpiryTime] = useState(
    new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [storageMethod, setStorageMethod] = useState('Insulated hot-food warmer');
  const [temperatureC, setTemperatureC] = useState<number>(65);
  const [packagingCondition, setPackagingCondition] = useState('Sanitized stainless container with secure lid');
  const [safetyDeclared, setSafetyDeclared] = useState(true);

  // Step 3: Location
  const [pickupAddress, setPickupAddress] = useState(
    'ABC College Hostel Dining Block B, Campus Road, Kolhapur'
  );
  const [latitude, setLatitude] = useState(16.7042);
  const [longitude, setLongitude] = useState(74.2441);

  if (!isOpen) return null;

  // Calculate live AI analysis for review step
  const aiAnalysis = runFoodSafetyAIAnalysis({
    foodName,
    category,
    foodType,
    quantity,
    unit,
    storageMethod,
    temperatureC,
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    const donation = appStore.createDonation({
      food_name: foodName,
      food_category: category,
      food_type: foodType,
      quantity,
      unit,
      preparation_time: new Date(prepTime).toISOString(),
      expiry_time: new Date(expiryTime).toISOString(),
      dietary_label: dietaryLabel,
      description,
      pickup_address: pickupAddress,
      latitude,
      longitude,
      storage_method: storageMethod,
      temperature_c: temperatureC,
    });

    onSuccess(donation.id);
    onClose();
  };

  const setLocationPreset = (preset: 'college' | 'hotel' | 'caterer') => {
    if (preset === 'college') {
      setPickupAddress('ABC College Hostel Dining Block B, Campus Road, Kolhapur');
      setLatitude(16.7042);
      setLongitude(74.2441);
    } else if (preset === 'hotel') {
      setPickupAddress('Grand Heritage Hotel Banquets, Service Gate 3, Shahupuri, Kolhapur');
      setLatitude(16.7015);
      setLongitude(74.2389);
    } else {
      setPickupAddress('Annapurna Caterers Central Kitchen, Tarabai Park, Kolhapur');
      setLatitude(16.7112);
      setLongitude(74.2345);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full border border-gray-100 dark:border-slate-800 overflow-hidden my-8 flex flex-col max-h-[90vh] text-gray-900 dark:text-white">
        {/* Wizard Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Smart Redistribution Wizard</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">Donate Surplus Food</h2>
          <p className="text-xs text-emerald-100 mt-1">
            Publish safe surplus food to be matched instantly with nearby shelters & NGOs.
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-between mt-5 max-w-md">
            {[
              { num: 1, label: 'Food Details' },
              { num: 2, label: 'Safety' },
              { num: 3, label: 'Location' },
              { num: 4, label: 'AI Review' },
            ].map((s) => (
              <div key={s.num} className="flex items-center space-x-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s.num
                      ? 'bg-white text-emerald-900 shadow-md ring-2 ring-emerald-300'
                      : step > s.num
                      ? 'bg-emerald-400 text-emerald-950'
                      : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                  }`}
                >
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className="text-[11px] font-medium hidden sm:inline text-emerald-100">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* STEP 1: FOOD DETAILS */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-2 flex items-center space-x-2">
                <Utensils className="w-4 h-4 text-emerald-600" />
                <span>Step 1: Food Description & Quantities</span>
              </h3>

              {onOpenQualityAssurance && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs text-emerald-950 dark:text-emerald-200">
                      Want to verify freshness, ingredients & estimate servings with AI first?
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenQualityAssurance();
                    }}
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline shrink-0"
                  >
                    Open Food QA →
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Food Item Name *</label>
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g. Vegetable Biryani, 80 Chapatis, Dal Khichdi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 placeholder:opacity-100 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FoodCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-medium"
                  >
                    <option value="Cooked Meal">Cooked Meal</option>
                    <option value="Raw Food">Raw Food / Grains</option>
                    <option value="Bakery">Bakery & Breads</option>
                    <option value="Fruits">Fresh Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Packaged Food">Packaged / Dry Food</option>
                    <option value="Dairy">Dairy Products</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Food Type / Diet *</label>
                  <select
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value as FoodType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-medium"
                  >
                    <option value="Vegetarian">Vegetarian (Pure Veg)</option>
                    <option value="Vegan">Vegan (100% Plant-based)</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm font-semibold bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Unit *</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-medium"
                  >
                    <option value="Meals">Meals / Portions</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="Packets">Packets / Boxes</option>
                    <option value="Trays">Catering Trays</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Dietary Labels & Allergens</label>
                <input
                  type="text"
                  value={dietaryLabel}
                  onChange={(e) => setDietaryLabel(e.target.value)}
                  placeholder="e.g. Vegetarian, Nut-free, Mild spice"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 placeholder:opacity-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Detailed Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide preparation details, contents, and handling requirements"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 placeholder:opacity-100 font-medium"
                />
              </div>
            </div>
          )}

          {/* STEP 2: TIME & SAFETY */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-2 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Step 2: Timings, Temperature & Food Safety Declaration</span>
              </h3>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start space-x-2.5 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Food Safety Requirement:</span>
                  <p className="mt-0.5 text-amber-800 dark:text-amber-300">
                    &quot;Only safe, uncontaminated and legally distributable food should be submitted.&quot; Hot food must be held
                    above 60°C or chilled food below 5°C.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Preparation Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm font-mono bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Expected Safe Expiry Time *</label>
                  <input
                    type="datetime-local"
                    value={expiryTime}
                    onChange={(e) => setExpiryTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm font-mono bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Current Storage Method</label>
                  <select
                    value={storageMethod}
                    onChange={(e) => setStorageMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-medium"
                  >
                    <option value="Insulated hot-food warmer">Insulated hot-food warmer (≥60°C)</option>
                    <option value="Commercial refrigeration">Commercial refrigeration (≤4°C)</option>
                    <option value="Covered room temperature">Covered room temperature (ambient)</option>
                    <option value="Sealed vacuum packaging">Sealed vacuum packaging</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Food Temperature (°C)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={temperatureC}
                      onChange={(e) => setTemperatureC(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-semibold"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-gray-400">°C</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Packaging Condition</label>
                <input
                  type="text"
                  value={packagingCondition}
                  onChange={(e) => setPackagingCondition(e.target.value)}
                  placeholder="e.g. Clean food-grade stainless vessels with airtight lid"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              {/* Strict safety declaration checkbox */}
              <div className="pt-2">
                <label className="flex items-start space-x-3 p-3 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={safetyDeclared}
                    onChange={(e) => setSafetyDeclared(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                  />
                  <span className="text-xs text-gray-700 leading-snug">
                    I solemnly declare that this food was prepared under sanitary conditions, stored safely, and has
                    not been exposed to contamination or guest touch. I agree to digital OTP verification upon volunteer
                    pickup.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 3: LOCATION */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Step 3: Pickup Location & Coordinates</span>
              </h3>

              {/* Demo Location Presets */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Select Demo Location Preset:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLocationPreset('college')}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                      latitude === 16.7042
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-bold">ABC College Mess</div>
                    <div className="text-[10px] text-gray-500">Campus Road</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocationPreset('hotel')}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                      latitude === 16.7015
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-bold">Grand Heritage Hotel</div>
                    <div className="text-[10px] text-gray-500">Shahupuri</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocationPreset('caterer')}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                      latitude === 16.7112
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-bold">Annapurna Kitchen</div>
                    <div className="text-[10px] text-gray-500">Tarabai Park</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Pickup Address *</label>
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="Full street address and gate instructions"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 placeholder:opacity-100 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-slate-700 text-xs font-mono bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-slate-700 text-xs font-mono bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Proximity matching will search verified NGOs & food banks within a 5 km radius of this pin.
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & AI FOOD ANALYSIS */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <span>Step 4: AI Food Safety & Redistribution Review</span>
              </h3>

              {/* Dedicated AI Food Verification Assistant Embed */}
              <AiFoodVerificationAssistant
                foodData={{
                  foodName,
                  category,
                  foodType,
                  quantity,
                  unit,
                  preparationTime: new Date(prepTime).toISOString(),
                  storageMethod,
                  temperatureC,
                  dietaryNotes: dietaryLabel,
                }}
                embedded={true}
              />

              {/* Review Summary */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Food Item:</span>
                  <span className="font-bold text-gray-900">{foodName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Quantity & Diet:</span>
                  <span className="font-semibold text-gray-800">
                    {quantity} {unit} ({foodType})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pickup Address:</span>
                  <span className="font-medium text-gray-800 text-right max-w-xs">{pickupAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Security:</span>
                  <span className="text-emerald-700 font-semibold">Dual-OTP Handshake Active</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 sm:p-5 bg-gray-50 dark:bg-slate-800/90 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs sm:text-sm font-semibold hover:bg-white transition-colors flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={step === 2 && !safetyDeclared}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-emerald-600/20 flex items-center space-x-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Donation</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
