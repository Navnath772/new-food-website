import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Thermometer,
  Package,
  Layers,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  FileCheck,
  Download,
  Printer,
  ArrowRight,
  ExternalLink,
  Info,
  Check,
  Calendar,
  Search,
  Filter,
  Flame,
  Snowflake,
  HelpCircle,
  ChefHat,
  Users,
  Copy,
  FileText,
  BadgeAlert,
  Sliders,
} from 'lucide-react';
import {
  FoodCategory,
  FoodType,
  RawCookedStatus,
  FoodQualityStatus,
  Ingredient,
  ServingBreakdownItem,
  SafetyChecklistItem,
  FoodQualityAssessment,
  UserRole,
} from '../types/index.ts';
import { qualityApi, appStore } from '../services/api.ts';

interface FoodQualityAssuranceProps {
  onNavigateToWizard?: (prefillData: any) => void;
  onNavigateToTab?: (tab: string) => void;
  initialDonationId?: string;
}

const COMMON_ALLERGENS_LIST = [
  'Milk',
  'Dairy',
  'Nuts',
  'Peanuts',
  'Gluten',
  'Wheat',
  'Soy',
  'Egg',
  'Fish',
  'Shellfish',
  'Sesame',
  'Mustard',
  'Other',
];

const FOOD_CATEGORIES: FoodCategory[] = [
  'Rice',
  'Roti / Chapati',
  'Dal',
  'Sabzi',
  'Curry',
  'Biryani',
  'Pulao',
  'Bread',
  'Fruits',
  'Vegetables',
  'Dairy',
  'Snacks',
  'Sweets',
  'Packaged Food',
  'Cooked Meal',
  'Other',
];

const INITIAL_CHECKLIST_ITEMS: Omit<SafetyChecklistItem, 'id'>[] = [
  // Preparation
  { category: 'Preparation', label: 'Preparation date recorded', checked: true },
  { category: 'Preparation', label: 'Preparation time recorded', checked: true },
  { category: 'Preparation', label: 'Food identity verified and labeled', checked: true },
  // Storage
  { category: 'Storage', label: 'Storage method recorded', checked: true },
  { category: 'Storage', label: 'Temperature recorded with calibrated probe', checked: true },
  { category: 'Storage', label: 'Food was properly covered / sealed', checked: true },
  { category: 'Storage', label: 'Storage conditions meet local FSSAI requirements', checked: true },
  // Handling
  { category: 'Handling', label: 'No visible contamination or foreign particles', checked: true },
  { category: 'Handling', label: 'No unusual smell or odor reported', checked: true },
  { category: 'Handling', label: 'No unusual discoloration or slime texture', checked: true },
  { category: 'Handling', label: 'Packaging container is food-grade and intact', checked: true },
  { category: 'Handling', label: 'Cross-contamination concerns checked & isolated', checked: true },
  // Allergen
  { category: 'Allergen', label: 'Ingredient list recorded and disclosed', checked: true },
  { category: 'Allergen', label: 'Potential allergens identified & flagged', checked: true },
  { category: 'Allergen', label: 'Allergen guidance communicated to logistics', checked: true },
  // Pickup
  { category: 'Pickup', label: 'Pickup schedule and transit window planned', checked: true },
  { category: 'Pickup', label: 'Insulated carrier prepared for hot/cold chain', checked: true },
];

export const FoodQualityAssurance: React.FC<FoodQualityAssuranceProps> = ({
  onNavigateToWizard,
  onNavigateToTab,
  initialDonationId,
}) => {
  // Current user & active tab inside QA module
  const currentUser = appStore.getCurrentUser();
  const [activeTab, setActiveTab] = useState<'assessment' | 'history' | 'protocol'>('assessment');

  // Form State: 1. Food Information
  const [foodName, setFoodName] = useState('Vegetable Dum Biryani');
  const [category, setCategory] = useState<FoodCategory>('Biryani');
  const [foodType, setFoodType] = useState<FoodType>('Vegetarian');
  const [rawOrCooked, setRawOrCooked] = useState<RawCookedStatus>('Cooked');
  const [containerCount, setContainerCount] = useState<number>(3);
  const [containerType, setContainerType] = useState('Insulated Stainless Steel Warmer');
  const [itemCount, setItemCount] = useState<number>(1);

  // Form State: 2. Quantity & Weight
  const [totalWeight, setTotalWeight] = useState<number>(12);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'g' | 'lbs'>('kg');

  // Form State: 3. Dynamic Ingredients
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: 'ing-1', name: 'Basmati Rice', quantity: 6, unit: 'kg', optional: false },
    { id: 'ing-2', name: 'Mixed Vegetables (Carrot, Peas, Beans)', quantity: 3, unit: 'kg', optional: false },
    { id: 'ing-3', name: 'Paneer (Cottage Cheese)', quantity: 1.5, unit: 'kg', optional: false },
    { id: 'ing-4', name: 'Pure Ghee & Edible Oil', quantity: 0.8, unit: 'L', optional: false },
    { id: 'ing-5', name: 'Biryani Spices, Saffron & Herbs', quantity: 300, unit: 'g', optional: false },
    { id: 'ing-6', name: 'Fried Cashews & Raisins', quantity: 200, unit: 'g', optional: true },
  ]);

  // Form State: 4. Allergen Information
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(['Milk', 'Dairy', 'Nuts']);
  const [customAllergenInput, setCustomAllergenInput] = useState('');

  // Form State: 5. Food Preparation Date & Time
  const now = new Date();
  const defaultPrepDate = new Date(now.getTime() - 3.5 * 3600 * 1000);
  const [prepDate, setPrepDate] = useState(defaultPrepDate.toISOString().slice(0, 10));
  const [prepTime, setPrepTime] = useState(defaultPrepDate.toTimeString().slice(0, 5));
  const [systemAssessmentTime, setSystemAssessmentTime] = useState(new Date().toLocaleTimeString());

  // Form State: 6. Storage Information
  const [storageMethod, setStorageMethod] = useState<
    'Hot Holding' | 'Refrigerator' | 'Freezer' | 'Room Temperature' | 'Insulated Container' | 'Other' | 'Unknown'
  >('Hot Holding');
  const [temperature, setTemperature] = useState<number>(64);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [packagingCondition, setPackagingCondition] = useState<'Sealed' | 'Covered' | 'Open' | 'Damaged' | 'Unknown'>('Covered');
  const [handlingStatus, setHandlingStatus] = useState<'Properly handled' | 'Uncertain' | 'Improper handling suspected'>('Properly handled');

  // Form State: 7. Interactive Checklist
  const [checklist, setChecklist] = useState<SafetyChecklistItem[]>(() =>
    INITIAL_CHECKLIST_ITEMS.map((item, idx) => ({
      id: `chk-${idx}`,
      ...item,
      timestamp: item.checked ? new Date().toISOString() : undefined,
      verifiedBy: item.checked ? currentUser.name : undefined,
    }))
  );

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<FoodQualityAssessment | null>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<FoodQualityAssessment[]>([]);
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'VERIFIED' | 'CAUTION' | 'SAFETY_HOLD' | 'EXPIRED'>('ALL');
  const [searchHistory, setSearchHistory] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [redistributionDecision, setRedistributionDecision] = useState<
    'APPROVED' | 'CONDITIONAL' | 'HOLD' | 'INELIGIBLE' | null
  >('APPROVED');

  // Refresh system clock every 10 seconds for live Food Age calculation
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemAssessmentTime(new Date().toLocaleTimeString());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Load history from store/API on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const records = await qualityApi.getAssessments();
        setAssessmentHistory(records);
      } catch (err) {
        console.warn('Failed to load QA history', err);
      }
    };
    loadHistory();
  }, []);

  // Compute live Food Age
  const foodAgeStats = useMemo(() => {
    try {
      const prepDateTime = new Date(`${prepDate}T${prepTime}:00`);
      const currentTime = new Date();
      const elapsedMs = Math.max(0, currentTime.getTime() - prepDateTime.getTime());
      const elapsedHoursTotal = elapsedMs / (1000 * 60 * 60);
      const hours = Math.floor(elapsedHoursTotal);
      const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
      const is24HourExceeded = elapsedHoursTotal >= 24;
      const isCriticalAge = elapsedHoursTotal >= 48;

      // Safe window remaining (assuming 24h baseline or 6h for hot ambient)
      let recommendedMaxHours = 24;
      if (storageMethod === 'Room Temperature') recommendedMaxHours = 4;
      else if (storageMethod === 'Hot Holding') recommendedMaxHours = 6;
      else if (storageMethod === 'Refrigerator') recommendedMaxHours = 48;
      else if (storageMethod === 'Freezer') recommendedMaxHours = 120;

      const remainingHours = Math.max(0, recommendedMaxHours - elapsedHoursTotal);

      return {
        hours,
        minutes,
        totalHours: Math.round(elapsedHoursTotal * 10) / 10,
        is24HourExceeded,
        isCriticalAge,
        recommendedMaxHours,
        remainingHours: Math.round(remainingHours * 10) / 10,
      };
    } catch {
      return {
        hours: 0,
        minutes: 0,
        totalHours: 0,
        is24HourExceeded: false,
        isCriticalAge: false,
        recommendedMaxHours: 24,
        remainingHours: 24,
      };
    }
  }, [prepDate, prepTime, storageMethod]);

  // Automated Allergen Detection based on ingredients & food name
  const detectedPotentialAllergens = useMemo(() => {
    const textPool = `${foodName} ${category} ${ingredients.map((i) => i.name).join(' ')}`.toLowerCase();
    const detected = new Set<string>();

    if (textPool.includes('milk') || textPool.includes('paneer') || textPool.includes('ghee') || textPool.includes('curd') || textPool.includes('butter') || textPool.includes('cheese') || textPool.includes('dairy')) {
      detected.add('Milk');
      detected.add('Dairy');
    }
    if (textPool.includes('peanut') || textPool.includes('groundnut')) {
      detected.add('Peanuts');
    }
    if (textPool.includes('cashew') || textPool.includes('almond') || textPool.includes('walnut') || textPool.includes('pista') || textPool.includes('nut')) {
      detected.add('Nuts');
    }
    if (textPool.includes('wheat') || textPool.includes('flour') || textPool.includes('maida') || textPool.includes('atta') || textPool.includes('roti') || textPool.includes('bread') || textPool.includes('chapati')) {
      detected.add('Gluten');
      detected.add('Wheat');
    }
    if (textPool.includes('soy') || textPool.includes('soya') || textPool.includes('tofu')) {
      detected.add('Soy');
    }
    if (textPool.includes('egg') || foodType === 'Egg') {
      detected.add('Egg');
    }
    if (textPool.includes('fish')) {
      detected.add('Fish');
    }
    if (textPool.includes('prawn') || textPool.includes('shrimp') || textPool.includes('crab') || textPool.includes('shellfish')) {
      detected.add('Shellfish');
    }
    if (textPool.includes('sesame') || textPool.includes('til')) {
      detected.add('Sesame');
    }
    if (textPool.includes('mustard') || textPool.includes('rai')) {
      detected.add('Mustard');
    }

    return Array.from(detected);
  }, [foodName, category, ingredients, foodType]);

  // Auto-sync detected allergens with selected allergens
  useEffect(() => {
    if (detectedPotentialAllergens.length > 0) {
      setSelectedAllergens((prev) => Array.from(new Set([...prev, ...detectedPotentialAllergens])));
    }
  }, [detectedPotentialAllergens]);

  // Dynamic Ingredient Handlers
  const handleAddIngredient = () => {
    const newId = `ing-${Date.now()}`;
    setIngredients((prev) => [...prev, { id: newId, name: '', quantity: 1, unit: 'kg', optional: false }]);
  };

  const handleUpdateIngredient = (id: string, updates: Partial<Ingredient>) => {
    setIngredients((prev) => prev.map((ing) => (ing.id === id ? { ...ing, ...updates } : ing)));
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  };

  const handleClearIngredients = () => {
    setIngredients([]);
  };

  // Quick Ingredient Presets
  const applyPreset = (presetName: string) => {
    if (presetName === 'Biryani') {
      setFoodName('Vegetable Dum Biryani');
      setCategory('Biryani');
      setFoodType('Vegetarian');
      setTotalWeight(12);
      setWeightUnit('kg');
      setStorageMethod('Hot Holding');
      setTemperature(64);
      setContainerType('Insulated Stainless Steel Warmer');
      setIngredients([
        { id: 'ing-1', name: 'Basmati Rice', quantity: 6, unit: 'kg', optional: false },
        { id: 'ing-2', name: 'Mixed Vegetables', quantity: 3, unit: 'kg', optional: false },
        { id: 'ing-3', name: 'Paneer Cubes', quantity: 1.5, unit: 'kg', optional: false },
        { id: 'ing-4', name: 'Pure Desi Ghee', quantity: 0.8, unit: 'L', optional: false },
        { id: 'ing-5', name: 'Biryani Whole Spices & Herbs', quantity: 300, unit: 'g', optional: false },
      ]);
    } else if (presetName === 'DalTadka') {
      setFoodName('Yellow Dal Tadka');
      setCategory('Dal');
      setFoodType('Vegetarian');
      setTotalWeight(8);
      setWeightUnit('kg');
      setStorageMethod('Hot Holding');
      setTemperature(68);
      setContainerType('Food Grade Covered Handi');
      setIngredients([
        { id: 'ing-1', name: 'Toor Dal (Pigeon Pea)', quantity: 3.5, unit: 'kg', optional: false },
        { id: 'ing-2', name: 'Tomato & Onion Gravy', quantity: 2.5, unit: 'kg', optional: false },
        { id: 'ing-3', name: 'Ghee Tadka with Cumin & Garlic', quantity: 0.5, unit: 'L', optional: false },
        { id: 'ing-4', name: 'Coriander & Green Chilli', quantity: 200, unit: 'g', optional: false },
      ]);
    } else if (presetName === 'RotiSabzi') {
      setFoodName('Whole Wheat Chapatis & Aloo Gobi');
      setCategory('Roti / Chapati');
      setFoodType('Vegetarian');
      setTotalWeight(10);
      setWeightUnit('kg');
      setStorageMethod('Insulated Container');
      setTemperature(58);
      setContainerType('Catering Casserole with Foil Lining');
      setIngredients([
        { id: 'ing-1', name: 'Whole Wheat Flour Chapatis (80 pcs)', quantity: 4.5, unit: 'kg', optional: false },
        { id: 'ing-2', name: 'Potato & Cauliflower Sabzi', quantity: 5.5, unit: 'kg', optional: false },
      ]);
    } else if (presetName === 'FruitPlatter') {
      setFoodName('Seasonal Cut Fruit Platter');
      setCategory('Fruits');
      setFoodType('Vegan');
      setRawOrCooked('Raw');
      setTotalWeight(6);
      setWeightUnit('kg');
      setStorageMethod('Refrigerator');
      setTemperature(4);
      setContainerType('Lidded Clamshell Food Boxes');
      setIngredients([
        { id: 'ing-1', name: 'Fresh Apples & Pears', quantity: 2.5, unit: 'kg', optional: false },
        { id: 'ing-2', name: 'Watermelon Cubes', quantity: 2, unit: 'kg', optional: false },
        { id: 'ing-3', name: 'Pomegranate Seeds', quantity: 1.5, unit: 'kg', optional: false },
      ]);
    }
  };

  // Checklist verification toggle
  const handleToggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextChecked = !item.checked;
          return {
            ...item,
            checked: nextChecked,
            timestamp: nextChecked ? new Date().toISOString() : undefined,
            verifiedBy: nextChecked ? currentUser.name : undefined,
          };
        }
        return item;
      })
    );
  };

  const handleSelectAllChecklist = () => {
    const timeIso = new Date().toISOString();
    setChecklist((prev) =>
      prev.map((item) => ({
        ...item,
        checked: true,
        timestamp: item.timestamp || timeIso,
        verifiedBy: item.verifiedBy || currentUser.name,
      }))
    );
  };

  // Allergen tag toggle
  const handleToggleAllergen = (allergen: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]
    );
  };

  const handleAddCustomAllergen = () => {
    if (customAllergenInput.trim() && !selectedAllergens.includes(customAllergenInput.trim())) {
      setSelectedAllergens((prev) => [...prev, customAllergenInput.trim()]);
      setCustomAllergenInput('');
    }
  };

  // Perform AI-Assisted Assessment
  const handleRunAssessment = async () => {
    setIsAnalyzing(true);
    try {
      const prepTimestamp = `${prepDate}T${prepTime}:00`;
      const payload = {
        foodName,
        category,
        foodType,
        rawOrCooked,
        totalWeight,
        weightUnit,
        containerCount,
        containerType,
        ingredients,
        preparedAt: prepTimestamp,
        storageMethod,
        storageTemperature: temperature,
        temperatureUnit: tempUnit,
        packagingCondition,
        handlingStatus,
        donationId: initialDonationId,
      };

      const result = await qualityApi.analyze(payload);

      // Merge verified checklist
      result.checklist = checklist;
      result.verifiedBy = currentUser.name;
      result.verificationRole = currentUser.role;
      result.verificationStatus = 'COMPLETED';

      // Save to server database / local store
      const saved = await qualityApi.saveAssessment(result);
      setCurrentAssessment(saved);

      // Update history list
      setAssessmentHistory((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)]);

      // Auto-set decision recommendation based on status
      if (saved.assessmentStatus === 'VERIFIED') {
        setRedistributionDecision('APPROVED');
      } else if (saved.assessmentStatus === 'CAUTION' || saved.assessmentStatus === 'SAFETY_REVIEW') {
        setRedistributionDecision('CONDITIONAL');
      } else if (saved.assessmentStatus === 'SAFETY_HOLD') {
        setRedistributionDecision('HOLD');
      } else if (saved.assessmentStatus === 'EXPIRED') {
        setRedistributionDecision('INELIGIBLE');
      }
    } catch (error) {
      console.error('Failed to run QA assessment:', error);
      // Run fallback
      const localResult = appStore.calculateLocalQualityAssessment({
        foodName,
        category,
        foodType,
        rawOrCooked,
        totalWeight,
        weightUnit,
        containerCount,
        containerType,
        ingredients,
        preparedAt: `${prepDate}T${prepTime}:00`,
        storageMethod,
        storageTemperature: temperature,
        temperatureUnit: tempUnit,
        packagingCondition,
        handlingStatus,
        donationId: initialDonationId,
      });
      setCurrentAssessment(localResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Execute initial assessment on mount if no current assessment
  useEffect(() => {
    if (!currentAssessment) {
      handleRunAssessment();
    }
  }, []);

  // Quick Action: Proceed to Donation Wizard
  const handleProceedToDonationWizard = () => {
    if (!currentAssessment) return;
    const prefill = {
      food_name: currentAssessment.foodName,
      food_category: currentAssessment.category,
      food_type: currentAssessment.foodType,
      quantity: currentAssessment.totalWeight,
      unit: currentAssessment.weightUnit,
      estimated_meals: currentAssessment.estimatedServingsMax,
      quality_assessment: currentAssessment,
      dietary_label: currentAssessment.foodType,
      description: `Verified via Food Quality Assurance Center (${currentAssessment.assessmentStatus}). Serves ~${currentAssessment.estimatedServingsMin}–${currentAssessment.estimatedServingsMax} people. Stored via ${currentAssessment.storageMethod} at ${currentAssessment.storageTemperature ?? 'N/A'}°${currentAssessment.temperatureUnit}.`,
    };
    if (onNavigateToWizard) {
      onNavigateToWizard(prefill);
    } else if (onNavigateToTab) {
      onNavigateToTab('donor');
    }
  };

  // Copy QA Report to Clipboard
  const handleCopyReport = () => {
    if (!currentAssessment) return;
    const textReport = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ FOODBRIDGE AI – FOOD QUALITY ASSURANCE REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Audit ID: ${currentAssessment.id}
Food Name: ${currentAssessment.foodName}
Category: ${currentAssessment.category} (${currentAssessment.rawOrCooked})
Dietary: ${currentAssessment.foodType}
Total Quantity: ${currentAssessment.totalWeight} ${currentAssessment.weightUnit} (${currentAssessment.containerCount} x ${currentAssessment.containerType})

🍱 AI ESTIMATED SERVINGS:
${currentAssessment.estimatedServingsMin} – ${currentAssessment.estimatedServingsMax} people
(Actual servings may vary depending on portion size and meal composition)

⏱️ FOOD AGE & PREPARATION:
Prepared: ${new Date(currentAssessment.preparedAt).toLocaleString()}
Current Food Age: ${currentAssessment.foodAgeHours} hours
24-Hour Threshold Check: ${currentAssessment.is24HourExceeded ? '⚠️ EXCEEDS 24 HOURS (Secondary inspection mandatory)' : '✓ Within standard 24h baseline'}

❄️ STORAGE & TEMPERATURE:
Storage Method: ${currentAssessment.storageMethod}
Temperature: ${currentAssessment.storageTemperature ?? 'Not recorded'}°${currentAssessment.temperatureUnit}
Packaging Condition: ${currentAssessment.packagingCondition}
Custody Handling: ${currentAssessment.handlingStatus}

⚠️ ALLERGEN INFORMATION:
Potential Allergens: ${currentAssessment.potentialAllergens.length > 0 ? currentAssessment.potentialAllergens.join(', ') : 'None detected from provided ingredients'}
(AI-assisted identification. Verify ingredients manually before serving.)

🚦 FRESHNESS ASSESSMENT STATUS:
${currentAssessment.assessmentStatus}
Explanation: ${currentAssessment.aiExplanation}

RISK FACTORS & NOTES:
${currentAssessment.riskFactors.length > 0 ? currentAssessment.riskFactors.map((r) => `• ${r}`).join('\n') : '• No active critical risk factors detected.'}

GUARDRAIL NOTICE:
AI-assisted assessment based on structured information provided. Does not constitute a biological laboratory certification. All food must be physically inspected by volunteer couriers prior to final handover.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
    navigator.clipboard.writeText(textReport.trim());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Status Badge UI Helper
  const renderStatusBadge = (status: FoodQualityStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>🟢 LOWER RISK / REVIEW PASSED</span>
          </div>
        );
      case 'CAUTION':
        return (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-2xs animate-pulse">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>🟡 CAUTION – ADDITIONAL VERIFICATION REQUIRED</span>
          </div>
        );
      case 'SAFETY_REVIEW':
        return (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border border-orange-300 dark:border-orange-800 shadow-2xs">
            <BadgeAlert className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span>🟠 SAFETY REVIEW REQUIRED</span>
          </div>
        );
      case 'SAFETY_HOLD':
        return (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 shadow-2xs">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>🔴 SAFETY HOLD – DO NOT REDISTRIBUTE</span>
          </div>
        );
      case 'EXPIRED':
        return (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-900 text-gray-100 dark:bg-black dark:text-gray-300 border border-gray-700 shadow-2xs">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>⚫ EXPIRED / NOT ELIGIBLE</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300">
            <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
            <span>ASSESSMENT PENDING</span>
          </div>
        );
    }
  };

  // Filtered History
  const filteredHistory = useMemo(() => {
    return assessmentHistory.filter((item) => {
      const matchesFilter = historyFilter === 'ALL' || item.assessmentStatus === historyFilter;
      const matchesSearch =
        !searchHistory ||
        item.foodName.toLowerCase().includes(searchHistory.toLowerCase()) ||
        item.category.toLowerCase().includes(searchHistory.toLowerCase()) ||
        item.id.toLowerCase().includes(searchHistory.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [assessmentHistory, historyFilter, searchHistory]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-800/60">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-400/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Public Health & Zero-Hunger Integrity Protocol</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Food Quality Assurance Center</span>
              <span className="text-xs bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2.5 py-0.5 rounded-full font-mono">
                AI + Rule-Based Engine
              </span>
            </h1>
            <p className="text-emerald-100/90 text-sm max-w-3xl leading-relaxed">
              Verify food information, estimate servings, assess freshness, and determine redistribution readiness before surplus food is dispatched to communities.
            </p>
          </div>

          {/* Quick Stats / Action Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/10 text-right">
              <span className="block text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Live System Clock</span>
              <span className="text-sm font-mono font-bold text-white">{systemAssessmentTime}</span>
            </div>

            <button
              onClick={() => setActiveTab('assessment')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                activeTab === 'assessment'
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              New QA Assessment
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 ${
                activeTab === 'history'
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>QA History ({assessmentHistory.length})</span>
            </button>
          </div>
        </div>

        {/* Global Safety Guardrail Banner */}
        <div className="mt-6 pt-4 border-t border-emerald-800/60 flex items-start space-x-3 text-xs text-emerald-200/90 bg-emerald-900/30 p-3 rounded-xl">
          <Info className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
          <div>
            <strong className="text-emerald-200 font-semibold">FoodBridge Safety Assurance Standard:</strong>{' '}
            AI-assisted assessment based on structured donor-provided information. Does not make an absolute medical guarantee or replace sensory verification. Volunteer couriers perform secondary organoleptic checks upon physical custody transfer.
          </div>
        </div>
      </div>

      {activeTab === 'assessment' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Data Entry & Configuration (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quick Preset Toolbar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ChefHat className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Quick Test Presets (Instant Simulation)</span>
                </span>
                <span className="text-[11px] text-gray-400">Click to autofill sample meal</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('Biryani')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
                >
                  🍚 Veg Biryani (12kg Hot)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('DalTadka')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition-colors"
                >
                  🍲 Yellow Dal (8kg Hot)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('RotiSabzi')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors"
                >
                  🫓 Roti & Aloo Gobi (10kg)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('FruitPlatter')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors"
                >
                  🍎 Fresh Fruit Box (6kg Chilled)
                </button>
              </div>
            </div>

            {/* SECTION 1: FOOD INFORMATION FORM */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Food Information</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Basic identification, category, and diet classification</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  Required
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Food Name / Dish Title *
                  </label>
                  <input
                    type="text"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="e.g. Vegetable Dum Biryani with Raita"
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Food Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FoodCategory)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {FOOD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Diet Classification *
                  </label>
                  <select
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value as FoodType)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Vegetarian">Vegetarian (Lacto/Ovo-lacto)</option>
                    <option value="Vegan">100% Plant-Based Vegan</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Egg">Egg-based (Eggetarian)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Food State *
                  </label>
                  <select
                    value={rawOrCooked}
                    onChange={(e) => setRawOrCooked(e.target.value as RawCookedStatus)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Cooked">Cooked Meal / Prepared Dish</option>
                    <option value="Raw">Raw Produce / Ingredients</option>
                    <option value="Ready-to-Eat">Ready-to-Eat / Packaged</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Number of Distinct Items
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={itemCount}
                    onChange={(e) => setItemCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: QUANTITY, WEIGHT & CONTAINERS */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Quantity, Weight & Containers</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total volume and tare packaging containers</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Total Weight / Mass *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={totalWeight}
                    onChange={(e) => setTotalWeight(Math.max(0.1, parseFloat(e.target.value) || 1))}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Weight Unit *
                  </label>
                  <select
                    value={weightUnit}
                    onChange={(e) => setWeightUnit(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="lbs">Pounds (lbs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Number of Containers
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={containerCount}
                    onChange={(e) => setContainerCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Container Type & Material
                  </label>
                  <input
                    type="text"
                    value={containerType}
                    onChange={(e) => setContainerType(e.target.value)}
                    placeholder="e.g. Insulated Stainless Steel Warmer, Food-grade PP tubs"
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: INGREDIENT LIST (DYNAMIC) */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Ingredient Breakdown</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Structured recipe ingredients for allergen detection & portion math</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Ingredient</span>
                  </button>
                  {ingredients.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearIngredients}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {ingredients.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
                  <p className="text-xs text-gray-500 mb-2">No individual ingredients entered.</p>
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    + Add your first ingredient
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {ingredients.map((ing, idx) => (
                    <div
                      key={ing.id}
                      className="flex items-center space-x-2 bg-gray-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700"
                    >
                      <span className="text-xs font-mono text-gray-400 w-5 text-center">{idx + 1}</span>
                      <input
                        type="text"
                        value={ing.name}
                        onChange={(e) => handleUpdateIngredient(ing.id, { name: e.target.value })}
                        placeholder="Ingredient name (e.g. Paneer)"
                        className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                      />
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={ing.quantity}
                        onChange={(e) => handleUpdateIngredient(ing.id, { quantity: parseFloat(e.target.value) || 0 })}
                        className="w-20 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                        placeholder="Qty"
                      />
                      <select
                        value={ing.unit}
                        onChange={(e) => handleUpdateIngredient(ing.id, { unit: e.target.value })}
                        className="w-18 px-2 py-1.5 text-xs bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="L">L</option>
                        <option value="ml">ml</option>
                        <option value="pcs">pcs</option>
                        <option value="cups">cups</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(ing.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
                        title="Remove Ingredient"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 4: ALLERGEN INFORMATION & AI DETECTION */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Allergen Information</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Select declared allergens & view automated ingredient scan</p>
                  </div>
                </div>
              </div>

              {/* AI Detection Banner */}
              {detectedPotentialAllergens.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 p-3.5 rounded-xl space-y-1">
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Potential Allergens Detected by AI Ingredient Scanner:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {detectedPotentialAllergens.map((alg) => (
                      <span
                        key={alg}
                        className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-200/70 text-amber-900 dark:bg-amber-900 dark:text-amber-200 border border-amber-300"
                      >
                        ⚠️ {alg}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-400/90 italic pt-1">
                    AI-assisted identification. Verify ingredients manually before serving.
                  </p>
                </div>
              )}

              {/* Common allergen chips */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Select All That Apply:</span>
                <div className="flex flex-wrap gap-2">
                  {COMMON_ALLERGENS_LIST.map((item) => {
                    const isSelected = selectedAllergens.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleToggleAllergen(item)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-700 shadow-2xs'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-slate-800 dark:text-gray-400 dark:border-slate-700'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom allergen input */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  value={customAllergenInput}
                  onChange={(e) => setCustomAllergenInput(e.target.value)}
                  placeholder="Other allergen (e.g. Saffron, MSG, Sulphites)"
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddCustomAllergen}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white hover:bg-gray-300 transition-colors"
                >
                  Add Custom
                </button>
              </div>
            </div>

            {/* SECTION 5: PREPARATION DATE & LIVE FOOD AGE */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                    5
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Food Preparation & Age Calculation</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Time elapsed since cooking and 24-hour verification gate</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Food Prepared Date *
                  </label>
                  <input
                    type="date"
                    value={prepDate}
                    onChange={(e) => setPrepDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Food Prepared Time *
                  </label>
                  <input
                    type="time"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* LIVE AGE CALCULATION CARD */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Real-Time Elapsed Age:</span>
                  </span>
                  <span className="font-mono text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                    {foodAgeStats.hours}h {foodAgeStats.minutes}m ({foodAgeStats.totalHours} hours)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                    <span className="block text-[10px] text-gray-400">Elapsed Hours</span>
                    <span className="font-bold font-mono text-gray-900 dark:text-white">{foodAgeStats.totalHours} hrs</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                    <span className="block text-[10px] text-gray-400">Remaining Window</span>
                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {foodAgeStats.remainingHours} hrs
                    </span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                    <span className="block text-[10px] text-gray-400">24-Hour Rule</span>
                    <span
                      className={`font-bold font-mono ${
                        foodAgeStats.is24HourExceeded ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      {foodAgeStats.is24HourExceeded ? 'EXCEEDED' : 'PASSED'}
                    </span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                    <span className="block text-[10px] text-gray-400">Operational Gate</span>
                    <span
                      className={`font-bold ${
                        foodAgeStats.isCriticalAge ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {foodAgeStats.isCriticalAge ? 'RESTRICTED' : 'ACTIVE'}
                    </span>
                  </div>
                </div>

                {/* 24-Hour Food Age Warning Threshold */}
                {foodAgeStats.is24HourExceeded && (
                  <div className="bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 p-3 rounded-lg flex items-start space-x-2 text-xs text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">⚠️ CAUTION – FOOD AGE EXCEEDS 24 HOURS</strong>
                      <span>
                        This food requires additional safety verification. Food age alone cannot determine whether food is safe to consume. Multi-factor verification (temperature, packaging integrity, and sensory check) is required before redistribution.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 6: STORAGE INFORMATION & TEMPERATURE */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                    6
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Storage & Handling Conditions</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Thermal storage method, measured probe temperature, and custody</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Storage Method *
                  </label>
                  <select
                    value={storageMethod}
                    onChange={(e) => setStorageMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Hot Holding">🔥 Hot Holding (&gt;60°C / &gt;140°F)</option>
                    <option value="Refrigerator">❄️ Refrigerator (1°C–5°C)</option>
                    <option value="Freezer">🧊 Freezer (&lt;-18°C)</option>
                    <option value="Room Temperature">🌡️ Room Temperature (Ambient)</option>
                    <option value="Insulated Container">📦 Insulated Thermobox</option>
                    <option value="Other">Other</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Current Food Temperature *
                    </label>
                    <div className="flex items-center space-x-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setTempUnit('C')}
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          tempUnit === 'C' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        °C
                      </button>
                      <span>/</span>
                      <button
                        type="button"
                        onClick={() => setTempUnit('F')}
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          tempUnit === 'F' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        °F
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden pr-10"
                    />
                    <Thermometer className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Packaging Condition *
                  </label>
                  <select
                    value={packagingCondition}
                    onChange={(e) => setPackagingCondition(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Sealed">Sealed (Tamper-evident / Airtight)</option>
                    <option value="Covered">Covered (Food-grade lid / Foil)</option>
                    <option value="Open">Open (Needs immediate packaging)</option>
                    <option value="Damaged">Damaged / Compromised</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Hygienic Food Handling Custody *
                  </label>
                  <select
                    value={handlingStatus}
                    onChange={(e) => setHandlingStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Properly handled">Properly handled (Gloves, sanitized tools)</option>
                    <option value="Uncertain">Uncertain (Requires courier audit)</option>
                    <option value="Improper handling suspected">Improper handling suspected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 7: INTERACTIVE FOOD SAFETY CHECKLIST */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                    7
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Food Safety Inspection Checklist</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Timestamped 5-pillar operational verification protocol</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSelectAllChecklist}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Verify All Items
                </button>
              </div>

              <div className="space-y-4">
                {(['Preparation', 'Storage', 'Handling', 'Allergen', 'Pickup'] as const).map((catName) => {
                  const itemsInCat = checklist.filter((item) => item.category === catName);
                  const verifiedCount = itemsInCat.filter((i) => i.checked).length;
                  return (
                    <div key={catName} className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <span>{catName} Protocol</span>
                        <span>
                          {verifiedCount}/{itemsInCat.length} verified
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {itemsInCat.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleToggleChecklist(item.id)}
                            className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start space-x-2 ${
                              item.checked
                                ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800 text-gray-900 dark:text-white'
                                : 'bg-gray-50 border-gray-200 dark:bg-slate-800 dark:border-slate-700 text-gray-500'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={() => {}}
                              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 pointer-events-none"
                            />
                            <div className="flex-1">
                              <span className={item.checked ? 'font-medium' : ''}>{item.label}</span>
                              {item.checked && item.timestamp && (
                                <span className="block text-[9px] text-gray-400 font-mono mt-0.5">
                                  ✓ Verified {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Run Assessment Trigger Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleRunAssessment}
                disabled={isAnalyzing}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all transform active:scale-98 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Analyzing Food Safety & Estimating Servings with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-emerald-200" />
                    <span>Run AI Food Quality & Servings Assessment</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: AI Evaluation Report & Redistribution Readiness (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* AI SERVING ESTIMATION HERO CARD */}
            <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white p-6 rounded-3xl shadow-xl border border-teal-800/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>AI Estimated Servings</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30">
                  Volumetric Algorithm
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
                  <span>
                    ~{currentAssessment?.estimatedServingsMin || 40}–{currentAssessment?.estimatedServingsMax || 60}
                  </span>
                  <span className="text-base font-medium text-teal-200">People Nourished</span>
                </div>
                <p className="text-xs text-teal-100/80">
                  Approximate complete meal portions based on {totalWeight} {weightUnit} of {category}.
                </p>
              </div>

              {/* Breakdown of Servings */}
              <div className="p-3 bg-white/10 rounded-2xl space-y-2 text-xs border border-white/10">
                <span className="font-bold text-teal-200 block text-[11px] uppercase tracking-wider">
                  Item Portion Estimates
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-teal-100">
                    <span>{foodName} ({totalWeight} {weightUnit})</span>
                    <span className="font-mono font-bold">
                      ~{currentAssessment?.estimatedServingsMin || 40}–{currentAssessment?.estimatedServingsMax || 60} servings
                    </span>
                  </div>
                  {ingredients.slice(0, 3).map((ing) => (
                    <div key={ing.id} className="flex justify-between items-center text-teal-200/80 text-[11px]">
                      <span className="truncate max-w-[180px]">• {ing.name} ({ing.quantity} {ing.unit})</span>
                      <span className="font-mono">
                        ~{Math.max(5, Math.round(ing.quantity * 6))}–{Math.round(ing.quantity * 9)} portions
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crucial Disclaimer */}
              <p className="text-[10px] text-teal-200/70 italic leading-tight">
                Important: AI Estimated Serving Range. Actual servings may vary depending on serving size, meal accompaniments, and individual consumption.
              </p>
            </div>

            {/* AI QUALITY REPORT CARD */}
            {currentAssessment && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-md space-y-5">
                {/* Header with Status */}
                <div className="space-y-3 pb-4 border-b border-gray-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      AI Freshness Assessment
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">ID: {currentAssessment.id.slice(0, 14)}</span>
                  </div>

                  {renderStatusBadge(currentAssessment.assessmentStatus)}

                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    {currentAssessment.aiExplanation}
                  </p>
                </div>

                {/* Report Card Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Food Age</span>
                    <span className="font-bold text-gray-900 dark:text-white font-mono">
                      {currentAssessment.foodAgeHours} hours
                    </span>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Storage Temp</span>
                    <span className="font-bold text-gray-900 dark:text-white font-mono">
                      {currentAssessment.storageTemperature ?? 'N/A'}°{currentAssessment.temperatureUnit} ({currentAssessment.storageMethod})
                    </span>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Packaging</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {currentAssessment.packagingCondition} ({currentAssessment.containerCount}x)
                    </span>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Custody Chain</span>
                    <span className="font-bold text-gray-900 dark:text-white truncate block">
                      {currentAssessment.handlingStatus}
                    </span>
                  </div>
                </div>

                {/* Why this assessment? Transparent Reason Engine */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Why this assessment? Transparent Analysis</span>
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>Preparation timestamp logged ({foodAgeStats.totalHours}h elapsed)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>Structured ingredient list disclosed ({ingredients.length} items recorded)</span>
                    </div>
                    {currentAssessment.storageTemperature !== undefined && (
                      <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>Storage temperature within operating range ({currentAssessment.storageTemperature}°{currentAssessment.temperatureUnit})</span>
                      </div>
                    )}
                    {currentAssessment.riskFactors.map((rf, i) => (
                      <div key={i} className="flex items-start space-x-2 text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{rf}</span>
                      </div>
                    ))}
                    {currentAssessment.missingInformation.map((mi, i) => (
                      <div key={i} className="flex items-start space-x-2 text-blue-700 dark:text-blue-400">
                        <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{mi}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Allergens In Report */}
                <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-xs">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">
                    Allergens Communicated in Custody Ledger:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {currentAssessment.potentialAllergens.length > 0 ? (
                      currentAssessment.potentialAllergens.map((alg) => (
                        <span
                          key={alg}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        >
                          {alg}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 text-xs">None flagged from declared recipe</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons for Report */}
                <div className="pt-2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleCopyReport}
                    className="flex-1 py-2 px-3 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center space-x-1.5"
                  >
                    {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copySuccess ? 'Report Copied!' : 'Copy Summary'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="py-2 px-3 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center space-x-1.5"
                    title="Print Assessment"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 10: REDISTRIBUTION READINESS DECISION */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-md space-y-5">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-100 dark:border-slate-800">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Redistribution Decision</h2>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Select Platform Action:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRedistributionDecision('APPROVED')}
                    className={`p-3 rounded-xl text-left border text-xs font-bold transition-all ${
                      redistributionDecision === 'APPROVED'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500'
                        : 'bg-gray-50 border-gray-200 dark:bg-slate-800 dark:border-slate-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 mb-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Approved</span>
                    </div>
                    <span className="text-[10px] font-normal text-gray-500 block">Dispatch volunteers</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRedistributionDecision('CONDITIONAL')}
                    className={`p-3 rounded-xl text-left border text-xs font-bold transition-all ${
                      redistributionDecision === 'CONDITIONAL'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 dark:bg-amber-950 dark:text-amber-200 ring-2 ring-amber-500'
                        : 'bg-gray-50 border-gray-200 dark:bg-slate-800 dark:border-slate-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Conditional</span>
                    </div>
                    <span className="text-[10px] font-normal text-gray-500 block">Requires visual check</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRedistributionDecision('HOLD')}
                    className={`p-3 rounded-xl text-left border text-xs font-bold transition-all ${
                      redistributionDecision === 'HOLD'
                        ? 'bg-rose-50 border-rose-500 text-rose-900 dark:bg-rose-950 dark:text-rose-200 ring-2 ring-rose-500'
                        : 'bg-gray-50 border-gray-200 dark:bg-slate-800 dark:border-slate-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 text-rose-600 dark:text-rose-400 mb-1">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Safety Hold</span>
                    </div>
                    <span className="text-[10px] font-normal text-gray-500 block">Pause redistribution</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRedistributionDecision('INELIGIBLE')}
                    className={`p-3 rounded-xl text-left border text-xs font-bold transition-all ${
                      redistributionDecision === 'INELIGIBLE'
                        ? 'bg-gray-900 border-gray-700 text-white ring-2 ring-gray-600'
                        : 'bg-gray-50 border-gray-200 dark:bg-slate-800 dark:border-slate-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 text-gray-400 mb-1">
                      <XCircle className="w-4 h-4" />
                      <span>Ineligible</span>
                    </div>
                    <span className="text-[10px] font-normal text-gray-400 block">Route to compost</span>
                  </button>
                </div>
              </div>

              {/* Auditor notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Verification Sign-off Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="e.g. Verified by ABC College Mess Chef; insulated thermobox packed at 12:30 PM."
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-hidden"
                />
              </div>

              {/* Master CTA: Proceed to Donation Wizard */}
              <button
                type="button"
                onClick={handleProceedToDonationWizard}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 transition-all"
              >
                <span>Proceed to Create Donation with QA Certificate</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : activeTab === 'history' ? (
        /* SECTION 11: QUALITY ASSURANCE HISTORY */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Quality Assurance Audit History</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Immutable ledger of all AI and rule-based safety assessments
              </p>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                  placeholder="Search dish or ID..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-hidden"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              </div>

              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-hidden"
              >
                <option value="ALL">All Statuses</option>
                <option value="VERIFIED">Verified / Low Risk</option>
                <option value="CAUTION">Caution</option>
                <option value="SAFETY_HOLD">Safety Hold</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs space-y-2">
              <FileCheck className="w-8 h-8 mx-auto text-gray-300" />
              <p className="font-semibold text-gray-600 dark:text-gray-300">No QA evaluation records found.</p>
              <button
                type="button"
                onClick={() => setActiveTab('assessment')}
                className="text-emerald-600 font-bold hover:underline"
              >
                Start an assessment now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        {item.category} • {item.foodType}
                      </span>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white">{item.foodName}</h3>
                    </div>
                    {renderStatusBadge(item.assessmentStatus)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-gray-200/60 dark:border-slate-700">
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase">Quantity</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {item.totalWeight} {item.weightUnit}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase">Servings</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400">
                        ~{item.estimatedServingsMin}–{item.estimatedServingsMax} people
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase">Food Age</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200 font-mono">
                        {item.foodAgeHours} hrs
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase">Storage</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {item.storageMethod} ({item.storageTemperature ?? 'N/A'}°)
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 italic">
                    "{item.aiExplanation}"
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-gray-200/60 dark:border-slate-700 text-[10px]">
                    <span className="text-gray-400 font-mono">
                      {new Date(item.assessedAt).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentAssessment(item);
                        setFoodName(item.foodName);
                        setCategory(item.category);
                        setFoodType(item.foodType);
                        setTotalWeight(item.totalWeight);
                        setWeightUnit(item.weightUnit as any);
                        setIngredients(item.ingredients || []);
                        setActiveTab('assessment');
                      }}
                      className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                    >
                      Load into Form →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
