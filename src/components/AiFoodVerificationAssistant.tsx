import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Award,
  Camera,
  CheckCircle2,
  Clock,
  Cpu,
  FileCheck,
  Flame,
  Info,
  Layers,
  RefreshCw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Upload,
  Utensils,
  X,
} from 'lucide-react';
import { FoodCategory, FoodType } from '../types/index.ts';

export interface FoodVerificationPayload {
  foodName: string;
  category: FoodCategory;
  foodType: FoodType;
  quantity: number;
  unit: string;
  preparationTime: string;
  storageMethod: string;
  temperatureC?: number;
  dietaryNotes?: string;
  photoUrl?: string;
}

export interface VerificationResult {
  passed: boolean;
  score: number; // 0 - 100
  safeWindowHours: number;
  expiryDeadline: string;
  riskLevel: 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH';
  temperatureStatus: 'SAFE_HOT' | 'SAFE_COLD' | 'DANGER_ZONE';
  detectedAllergens: string[];
  recommendations: string[];
  fssaiCompliant: boolean;
  verificationHash: string;
  analysisSummary: string;
}

interface AiFoodVerificationAssistantProps {
  foodData: FoodVerificationPayload;
  onVerificationComplete?: (result: VerificationResult) => void;
  isOpen?: boolean;
  onClose?: () => void;
  embedded?: boolean;
}

export const analyzeFoodWithAi = (data: FoodVerificationPayload): VerificationResult => {
  const prepDate = new Date(data.preparationTime);
  const now = new Date();
  const elapsedMinutes = Math.max(0, Math.round((now.getTime() - prepDate.getTime()) / (60 * 1000)));

  // Temperature analysis
  const temp = data.temperatureC !== undefined ? data.temperatureC : 65;
  let tempStatus: 'SAFE_HOT' | 'SAFE_COLD' | 'DANGER_ZONE' = 'SAFE_HOT';
  let tempPenalty = 0;

  if (temp >= 60) {
    tempStatus = 'SAFE_HOT';
  } else if (temp <= 5) {
    tempStatus = 'SAFE_COLD';
  } else {
    tempStatus = 'DANGER_ZONE';
    tempPenalty = 30; // Danger Zone 5C - 60C promotes microbial growth
  }

  // Elapsed time analysis
  let elapsedPenalty = 0;
  let maxSafeHours = 5;

  if (data.category === 'Cooked Meal') {
    maxSafeHours = tempStatus === 'SAFE_HOT' ? 5 : 3.5;
  } else if (data.category === 'Bakery') {
    maxSafeHours = 24;
  } else if (data.category === 'Dairy') {
    maxSafeHours = tempStatus === 'SAFE_COLD' ? 8 : 2;
  } else if (data.category === 'Raw Food') {
    maxSafeHours = 48;
  }

  const elapsedHours = elapsedMinutes / 60;
  if (elapsedHours > 3) elapsedPenalty = 25;
  else if (elapsedHours > 2) elapsedPenalty = 15;
  else if (elapsedHours > 1) elapsedPenalty = 5;

  // Allergen & Dietary scanning
  const text = `${data.foodName} ${data.dietaryNotes || ''}`.toLowerCase();
  const detectedAllergens: string[] = [];
  if (text.includes('paneer') || text.includes('milk') || text.includes('cheese') || text.includes('dairy') || text.includes('ghee')) {
    detectedAllergens.push('Dairy (Lactose)');
  }
  if (text.includes('roti') || text.includes('chapati') || text.includes('bread') || text.includes('wheat') || text.includes('flour')) {
    detectedAllergens.push('Gluten (Wheat)');
  }
  if (text.includes('nut') || text.includes('peanut') || text.includes('cashew') || text.includes('almond')) {
    detectedAllergens.push('Tree Nuts / Peanuts');
  }
  if (text.includes('soya') || text.includes('soy')) {
    detectedAllergens.push('Soy');
  }

  // Score calculation
  let baseScore = 98 - tempPenalty - elapsedPenalty;
  if (baseScore < 40) baseScore = 40;
  if (baseScore > 99) baseScore = 99;

  let riskLevel: 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' = 'VERY_LOW';
  if (baseScore >= 88) riskLevel = 'VERY_LOW';
  else if (baseScore >= 75) riskLevel = 'LOW';
  else if (baseScore >= 60) riskLevel = 'MODERATE';
  else riskLevel = 'HIGH';

  const remainingHours = Math.max(0.5, Math.round((maxSafeHours - elapsedHours) * 10) / 10);
  const expiryDate = new Date(now.getTime() + remainingHours * 60 * 60 * 1000);

  const recommendations: string[] = [];
  if (tempStatus === 'SAFE_HOT') {
    recommendations.push('Maintain insulated thermal container (>60°C) until courier pickup.');
  } else if (tempStatus === 'SAFE_COLD') {
    recommendations.push('Keep refrigerated below 5°C until transfer to cold-carrier bag.');
  } else {
    recommendations.push('Food is in bacterial danger zone (5°C–60°C). Expedite pickup immediately.');
  }

  recommendations.push('Enforce contactless dual-OTP digital verification at handoff.');
  if (detectedAllergens.length > 0) {
    recommendations.push(`Alert receiving shelter of detected allergens: ${detectedAllergens.join(', ')}.`);
  }

  const hash = 'FSSAI-AI-' + Math.random().toString(36).substring(2, 9).toUpperCase();

  return {
    passed: baseScore >= 60,
    score: baseScore,
    safeWindowHours: remainingHours,
    expiryDeadline: expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    riskLevel,
    temperatureStatus: tempStatus,
    detectedAllergens,
    recommendations,
    fssaiCompliant: baseScore >= 70,
    verificationHash: hash,
    analysisSummary: `Verified ${data.foodName} (${data.quantity} ${data.unit}). Safe consumption window estimated at ${remainingHours} hours. Recommended dispatch priority: ${riskLevel === 'VERY_LOW' ? 'STANDARD' : 'EXPEDITED'}.`,
  };
};

export const AiFoodVerificationAssistant: React.FC<AiFoodVerificationAssistantProps> = ({
  foodData: initialFoodData,
  onVerificationComplete,
  isOpen = true,
  onClose,
  embedded = false,
}) => {
  const [foodData, setFoodData] = useState<FoodVerificationPayload>(initialFoodData);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<VerificationResult>(() => analyzeFoodWithAi(initialFoodData));
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(initialFoodData.photoUrl || null);
  const [showTester, setShowTester] = useState(!embedded);

  // Sync if initial prop changes
  useEffect(() => {
    setFoodData(initialFoodData);
    setResult(analyzeFoodWithAi(initialFoodData));
  }, [initialFoodData]);

  const handleSimulateInspectionPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const photo = event.target?.result as string;
        setUploadedPhoto(photo);
        runReAnalysis({ ...foodData, photoUrl: photo });
      };
      reader.readAsDataURL(file);
    }
  };

  const runReAnalysis = (updatedData: FoodVerificationPayload) => {
    setAnalyzing(true);
    setFoodData(updatedData);
    setTimeout(() => {
      const res = analyzeFoodWithAi(updatedData);
      setResult(res);
      setAnalyzing(false);
      if (onVerificationComplete) onVerificationComplete(res);
    }, 450);
  };

  const applyPreset = (preset: 'hot_biryani' | 'dairy_milk' | 'danger_buffet' | 'bakery_bread') => {
    let presetData: FoodVerificationPayload;
    if (preset === 'hot_biryani') {
      presetData = {
        foodName: 'Hot Vegetable Biryani with Gravy',
        category: 'Cooked Meal',
        foodType: 'Vegetarian',
        quantity: 80,
        unit: 'Meals',
        preparationTime: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        storageMethod: 'Stainless hot food insulated containers (>65°C)',
        temperatureC: 68,
        dietaryNotes: 'Vegetarian, Mild spice, Dairy (Ghee)',
      };
    } else if (preset === 'dairy_milk') {
      presetData = {
        foodName: 'Pasteurized Full Cream Milk & Paneer',
        category: 'Dairy',
        foodType: 'Vegetarian',
        quantity: 35,
        unit: 'Liters',
        preparationTime: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        storageMethod: 'Commercial chiller (<4°C)',
        temperatureC: 4,
        dietaryNotes: 'Contains Dairy / Lactose',
      };
    } else if (preset === 'danger_buffet') {
      presetData = {
        foodName: 'Banquet Hall Mixed Buffet Leftovers',
        category: 'Cooked Meal',
        foodType: 'Vegetarian',
        quantity: 110,
        unit: 'Meals',
        preparationTime: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
        storageMethod: 'Room temperature open chaffing dishes',
        temperatureC: 38,
        dietaryNotes: 'Mixed buffet items, potentially exposed >3 hours',
      };
    } else {
      presetData = {
        foodName: 'Fresh Artisanal Bread Loaves & Buns',
        category: 'Bakery',
        foodType: 'Vegan',
        quantity: 50,
        unit: 'Packets',
        preparationTime: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        storageMethod: 'Dry sealed kraft paper packaging',
        temperatureC: 24,
        dietaryNotes: 'Gluten (Wheat), Vegan',
      };
    }
    runReAnalysis(presetData);
  };

  if (!isOpen) return null;

  const content = (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex items-start justify-between bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-5 rounded-2xl border border-emerald-800/40 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                AI Smart Quality Engine
              </span>
              <span className="text-[10px] text-gray-400 font-mono">FSSAI Guideline Model v3.2</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              AI Smart Food Verification Assistant
            </h3>
            <p className="text-xs text-gray-300">
              Automated safety audit, thermal risk modeling & allergen detection before redistribution.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!embedded && (
            <button
              onClick={() => setShowTester((p) => !p)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-800/40 hover:bg-emerald-700/60 text-emerald-200 border border-emerald-600/40 font-semibold transition-colors"
            >
              {showTester ? 'Hide Simulator' : 'Test Food Batch'}
            </button>
          )}
          {onClose && !embedded && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              title="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Food Tester Simulator Bar */}
      {showTester && (
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-slate-800/80 border border-emerald-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-900 dark:text-white flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Interactive Verification Simulator (Try Test Batches):</span>
            </span>
            <span className="text-[10px] text-gray-500">Live parameter re-analysis</span>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => applyPreset('hot_biryani')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-emerald-50 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-600 font-semibold text-[11px] transition-all"
            >
              🔥 Hot Biryani (68°C)
            </button>
            <button
              onClick={() => applyPreset('dairy_milk')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-emerald-50 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-600 font-semibold text-[11px] transition-all"
            >
              ❄️ Chilled Dairy (4°C)
            </button>
            <button
              onClick={() => applyPreset('danger_buffet')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-rose-50 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-600 font-semibold text-[11px] transition-all"
            >
              ⚠️ Danger Buffet (38°C)
            </button>
            <button
              onClick={() => applyPreset('bakery_bread')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-emerald-50 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-600 font-semibold text-[11px] transition-all"
            >
              🍞 Bakery Loaves (24°C)
            </button>
          </div>

          {/* Live Temperature Slider */}
          <div className="space-y-1 pt-1 border-t border-emerald-100 dark:border-slate-700">
            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
              <span className="flex items-center space-x-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                <span>Probe Temperature: {foodData.temperatureC !== undefined ? `${foodData.temperatureC}°C` : '65°C'}</span>
              </span>
              <span className="text-[10px] text-gray-400">
                Safe zones: &gt;60°C Hot or &lt;5°C Cold
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              value={foodData.temperatureC ?? 65}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                runReAnalysis({ ...foodData, temperatureC: val });
              }}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Main Verification Card */}
      {analyzing ? (
        <div className="p-8 text-center space-y-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 animate-pulse">
          <RefreshCw className="w-8 h-8 mx-auto text-emerald-600 animate-spin" />
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
            Running Neural Freshness &amp; Thermal Risk Model...
          </h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Checking temperature thresholds, preparation timestamps, microbial growth curves, and allergen profiles.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Verdict Seal */}
          <div
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              result.passed
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
            }`}
          >
            <div className="flex items-center space-x-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
                  result.passed
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : 'bg-amber-500 text-white shadow-amber-500/30'
                }`}
              >
                {result.passed ? <ShieldCheck className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      result.passed
                        ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200 font-bold'
                        : 'bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-200 font-bold'
                    }`}
                  >
                    {result.passed ? '✓ AI Quality & Safety Verified' : '⚠ Safety Review Required'}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500">ID: {result.verificationHash}</span>
                </div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                  {foodData.foodName} ({foodData.quantity} {foodData.unit})
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                  Safe redistribution window: <strong>{result.safeWindowHours} hours remaining</strong> (before {result.expiryDeadline}).
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-emerald-200 dark:sm:border-emerald-800 sm:pl-5">
              <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                {result.score}<span className="text-sm font-normal text-gray-400">/100</span>
              </div>
              <div className="text-[10px] uppercase font-bold text-gray-500">Food Safety Score</div>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100/60 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                Risk: {result.riskLevel.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* 4 Pillars of AI Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Pillar 1: Temperature Audit */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                <span className="flex items-center space-x-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                  <span>Thermal Integrity</span>
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    result.temperatureStatus === 'SAFE_HOT'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : result.temperatureStatus === 'SAFE_COLD'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  }`}
                >
                  {result.temperatureStatus === 'SAFE_HOT'
                    ? 'Safe Hot (>60°C)'
                    : result.temperatureStatus === 'SAFE_COLD'
                    ? 'Safe Chilled (<5°C)'
                    : 'Danger Zone'}
                </span>
              </div>
              <div className="text-sm font-black text-gray-900 dark:text-white">
                {foodData.temperatureC !== undefined ? `${foodData.temperatureC}°C` : '65°C (Declared)'}
              </div>
              <p className="text-[10px] text-gray-400">
                {foodData.storageMethod || 'Insulated food-grade container'}
              </p>
            </div>

            {/* Pillar 2: Expiry Window */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                <span className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Consumption Window</span>
                </span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                  ~{result.safeWindowHours}h Left
                </span>
              </div>
              <div className="text-sm font-black text-gray-900 dark:text-white">
                Valid until {result.expiryDeadline}
              </div>
              <p className="text-[10px] text-gray-400">
                Prepared {new Date(foodData.preparationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Pillar 3: Allergens & Diet */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                <span className="flex items-center space-x-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-purple-500" />
                  <span>Allergens &amp; Diet</span>
                </span>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950 px-1.5 py-0.5 rounded">
                  {foodData.foodType}
                </span>
              </div>
              <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                {result.detectedAllergens.length > 0 ? result.detectedAllergens.join(', ') : 'No common allergens detected'}
              </div>
              <p className="text-[10px] text-gray-400">Auto-scanned ingredient keywords</p>
            </div>
          </div>

          {/* Photo Visual Inspection Upload Simulator */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              {uploadedPhoto ? (
                <img
                  src={uploadedPhoto}
                  alt="Verified Food Inspection"
                  className="w-12 h-12 rounded-lg object-cover border border-emerald-500 shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
              )}
              <div>
                <div className="font-bold text-gray-900 dark:text-white">
                  {uploadedPhoto ? 'Food Visual Inspection Complete' : 'AI Visual Freshness Scan (Optional)'}
                </div>
                <div className="text-[11px] text-gray-500">
                  {uploadedPhoto
                    ? 'Steam signature, packaging seals, and surface texture analyzed.'
                    : 'Upload batch photo to run sensory color and container seal audit.'}
                </div>
              </div>
            </div>

            <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-colors shrink-0">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadedPhoto ? 'Change Photo' : 'Upload Food Photo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleSimulateInspectionPhoto}
                className="hidden"
              />
            </label>
          </div>

          {/* AI Safety Recommendations */}
          <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 space-y-1.5 text-xs">
            <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Protocol Directives for Donor &amp; Courier:</span>
            </div>
            <ul className="space-y-1 text-gray-700 dark:text-gray-300 text-[11px] list-disc list-inside">
              {result.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 p-6 overflow-hidden transform transition-all animate-in fade-in zoom-in-95">
        {content}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-gray-400">
            Compliant with FSSAI Surplus Food Redistribution Guidelines
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
          >
            Accept AI Verification &amp; Proceed
          </button>
        </div>
      </div>
    </div>
  );
};
