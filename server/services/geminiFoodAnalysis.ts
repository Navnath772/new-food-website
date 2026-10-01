import { GoogleGenAI } from '@google/genai';
import { FoodQualityAssessment, Ingredient, FoodCategory, FoodType, RawCookedStatus, FoodQualityStatus, ServingBreakdownItem } from '../../src/types/index.ts';

export interface QualityAnalysisRequestPayload {
  foodName: string;
  category: FoodCategory;
  foodType: FoodType;
  rawOrCooked: RawCookedStatus;
  totalWeight: number;
  weightUnit: string;
  containerCount?: number;
  containerType?: string;
  ingredients: Ingredient[];
  preparedAt: string;
  storageMethod: string;
  storageTemperature?: number;
  temperatureUnit?: 'C' | 'F';
  packagingCondition: 'Sealed' | 'Covered' | 'Open' | 'Damaged' | 'Unknown';
  handlingStatus: 'Properly handled' | 'Uncertain' | 'Improper handling suspected';
  donationId?: string;
}

/**
 * Common allergen keyword lookup dictionary for deterministic scanning & verification
 */
const ALLERGEN_MAP: { [keyword: string]: string } = {
  milk: 'Milk / Dairy (Lactose)',
  dairy: 'Milk / Dairy (Lactose)',
  cheese: 'Milk / Dairy (Lactose)',
  paneer: 'Milk / Dairy (Lactose)',
  ghee: 'Milk / Dairy (Lactose)',
  butter: 'Milk / Dairy (Lactose)',
  cream: 'Milk / Dairy (Lactose)',
  curd: 'Milk / Dairy (Lactose)',
  yogurt: 'Milk / Dairy (Lactose)',
  wheat: 'Gluten (Wheat)',
  flour: 'Gluten (Wheat)',
  maida: 'Gluten (Wheat)',
  atta: 'Gluten (Wheat)',
  bread: 'Gluten (Wheat)',
  roti: 'Gluten (Wheat)',
  chapati: 'Gluten (Wheat)',
  pasta: 'Gluten (Wheat)',
  peanut: 'Peanuts',
  groundnut: 'Peanuts',
  nut: 'Tree Nuts',
  cashew: 'Tree Nuts (Cashew)',
  almond: 'Tree Nuts (Almond)',
  walnut: 'Tree Nuts (Walnut)',
  pista: 'Tree Nuts (Pistachio)',
  soy: 'Soy / Soya',
  soya: 'Soy / Soya',
  tofu: 'Soy / Soya',
  egg: 'Egg',
  fish: 'Fish',
  prawn: 'Shellfish',
  shrimp: 'Shellfish',
  crab: 'Shellfish',
  sesame: 'Sesame (Til)',
  til: 'Sesame (Til)',
  mustard: 'Mustard (Rai)',
};

/**
 * Standard typical portion weights in kilograms for complete meal / single dish serving estimates
 */
const CATEGORY_PORTION_ESTIMATES: { [key: string]: { minKg: number; maxKg: number; unitLabel: string } } = {
  'Rice': { minKg: 0.12, maxKg: 0.18, unitLabel: 'cooked rice portions' },
  'Biryani': { minKg: 0.28, maxKg: 0.38, unitLabel: 'complete biryani meals' },
  'Pulao': { minKg: 0.22, maxKg: 0.30, unitLabel: 'pulao portions' },
  'Dal': { minKg: 0.10, maxKg: 0.16, unitLabel: 'dal cups / bowls' },
  'Sabzi': { minKg: 0.10, maxKg: 0.15, unitLabel: 'vegetable sabzi portions' },
  'Curry': { minKg: 0.15, maxKg: 0.22, unitLabel: 'curry gravy portions' },
  'Roti / Chapati': { minKg: 0.04, maxKg: 0.05, unitLabel: 'pieces (approx 2-3 per person)' },
  'Bread': { minKg: 0.06, maxKg: 0.10, unitLabel: 'bread servings' },
  'Fruits': { minKg: 0.15, maxKg: 0.25, unitLabel: 'fresh fruit portions' },
  'Vegetables': { minKg: 0.15, maxKg: 0.25, unitLabel: 'vegetable portions' },
  'Dairy': { minKg: 0.15, maxKg: 0.25, unitLabel: 'servings' },
  'Snacks': { minKg: 0.08, maxKg: 0.15, unitLabel: 'snack packs' },
  'Sweets': { minKg: 0.05, maxKg: 0.10, unitLabel: 'sweet portions' },
  'Packaged Food': { minKg: 0.15, maxKg: 0.25, unitLabel: 'packaged meals' },
  'Cooked Meal': { minKg: 0.30, maxKg: 0.40, unitLabel: 'complete hot meals' },
  'Raw Food': { minKg: 0.30, maxKg: 0.45, unitLabel: 'cooked meal equivalents' },
  'Bakery': { minKg: 0.08, maxKg: 0.15, unitLabel: 'bakery items' },
  'Other': { minKg: 0.25, maxKg: 0.35, unitLabel: 'general portions' },
};

/**
 * Deterministic fallback serving & quality calculator
 */
export function calculateRuleBasedQualityAssessment(payload: QualityAnalysisRequestPayload): FoodQualityAssessment {
  const now = new Date();
  const prepDate = new Date(payload.preparedAt || now.toISOString());
  const elapsedMs = Math.max(0, now.getTime() - prepDate.getTime());
  const foodAgeHours = Math.round((elapsedMs / (1000 * 60 * 60)) * 10) / 10;
  const is24HourExceeded = foodAgeHours >= 24;

  // Weight normalization to KG
  let totalKg = payload.totalWeight || 0;
  const unitLower = (payload.weightUnit || 'kg').toLowerCase();
  if (unitLower.includes('g') && !unitLower.includes('kg')) {
    totalKg = totalKg / 1000;
  } else if (unitLower.includes('lb')) {
    totalKg = totalKg * 0.453592;
  }

  // Estimated Servings Calculation
  const catConfig = CATEGORY_PORTION_ESTIMATES[payload.category] || CATEGORY_PORTION_ESTIMATES['Cooked Meal'];
  let minServings = 0;
  let maxServings = 0;

  if (totalKg > 0) {
    minServings = Math.max(1, Math.floor(totalKg / catConfig.maxKg));
    maxServings = Math.max(minServings, Math.ceil(totalKg / catConfig.minKg));
  }

  const servingBreakdown: ServingBreakdownItem[] = [
    {
      itemName: payload.foodName,
      quantity: payload.totalWeight,
      unit: payload.weightUnit,
      estimatedPortionsMin: minServings,
      estimatedPortionsMax: maxServings,
    },
  ];

  // If structured ingredients were entered, calculate individual portion contributions
  if (payload.ingredients && payload.ingredients.length > 0) {
    for (const ing of payload.ingredients) {
      let ingKg = ing.quantity;
      const iUnit = (ing.unit || '').toLowerCase();
      if (iUnit === 'g' || iUnit === 'ml') ingKg = ingKg / 1000;
      const portions = Math.max(1, Math.round(ingKg / 0.15));
      servingBreakdown.push({
        itemName: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        estimatedPortionsMin: Math.max(1, Math.round(portions * 0.8)),
        estimatedPortionsMax: Math.round(portions * 1.2),
      });
    }
  }

  // Potential Allergens Detection
  const allergensFound = new Set<string>();
  const searchPool = `${payload.foodName} ${payload.category} ${payload.ingredients.map((i) => i.name).join(' ')}`.toLowerCase();

  for (const [kw, allergenLabel] of Object.entries(ALLERGEN_MAP)) {
    if (searchPool.includes(kw)) {
      allergensFound.add(allergenLabel);
    }
  }

  // Risk Factors & Missing Information Analysis
  const riskFactors: string[] = [];
  const missingInformation: string[] = [];

  if (!payload.storageTemperature && payload.storageTemperature !== 0) {
    missingInformation.push('Storage temperature not recorded with calibrated probe');
  }

  if (!payload.containerType || payload.containerType.trim() === '') {
    missingInformation.push('Container specifications and lid sealing status incomplete');
  }

  if (is24HourExceeded) {
    riskFactors.push('Food age exceeds 24-hour baseline threshold. Multi-factor verification mandatory.');
  }

  // Temperature evaluation
  let tempC = payload.storageTemperature;
  if (tempC !== undefined && payload.temperatureUnit === 'F') {
    tempC = ((tempC - 32) * 5) / 9;
  }

  if (tempC !== undefined) {
    if (payload.storageMethod === 'Hot Holding' && tempC < 60) {
      riskFactors.push(`Hot holding temperature (${tempC.toFixed(1)}°C) is below FSSAI regulatory threshold (60°C). Microbial hazard window active.`);
    } else if ((payload.storageMethod === 'Refrigerator' || payload.storageMethod === 'Insulated Container') && tempC > 8) {
      riskFactors.push(`Chilled holding temperature (${tempC.toFixed(1)}°C) is above safe threshold (5°C).`);
    } else if (payload.storageMethod === 'Room Temperature' && foodAgeHours > 2) {
      riskFactors.push('Food held at ambient room temperature in bacterial danger zone (5°C–60°C) for over 2 hours.');
    }
  }

  if (payload.packagingCondition === 'Open' || payload.packagingCondition === 'Damaged') {
    riskFactors.push('Packaging seal damaged or open to atmosphere; risk of airborne particulate contamination.');
  }

  if (payload.handlingStatus === 'Improper handling suspected') {
    riskFactors.push('Suspected break in hygienic food handling custody chain reported.');
  }

  // Assessment Status determination
  let status: FoodQualityStatus = 'VERIFIED';
  let explanation = 'Based on the structured information provided, storage parameters and food age meet operational screening guidelines. Food appears suitable for verified redistribution.';

  if (payload.handlingStatus === 'Improper handling suspected' || (tempC !== undefined && payload.storageMethod === 'Hot Holding' && tempC < 45 && foodAgeHours > 4)) {
    status = 'SAFETY_HOLD';
    explanation = 'Safety Hold applied: critical risk factors identified in food handling custody or prolonged bacterial danger zone exposure. Do not dispatch without administrative clearance.';
  } else if (foodAgeHours > 48 || (payload.category === 'Cooked Meal' && foodAgeHours > 16 && payload.storageMethod === 'Room Temperature')) {
    status = 'EXPIRED';
    explanation = 'Food exceeds acceptable safe surplus redistribution operational lifetime. Ineligible for volunteer transport.';
  } else if (riskFactors.length > 0) {
    status = is24HourExceeded ? 'CAUTION' : 'SAFETY_REVIEW';
    explanation = `Caution: ${riskFactors.join('; ')}. Additional physical inspection by volunteer courier required at dock.`;
  } else if (missingInformation.length > 0) {
    status = 'INCOMPLETE';
    explanation = `Assessment incomplete due to missing data: ${missingInformation.join(', ')}. Complete verification checklist to proceed.`;
  }

  return {
    id: `qa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    donationId: payload.donationId || `don-temp-${Date.now()}`,
    foodName: payload.foodName,
    category: payload.category,
    foodType: payload.foodType,
    rawOrCooked: payload.rawOrCooked,
    totalWeight: payload.totalWeight,
    weightUnit: payload.weightUnit,
    containerCount: payload.containerCount || 1,
    containerType: payload.containerType || 'Insulated stainless warmer',
    ingredients: payload.ingredients || [],
    preparedAt: payload.preparedAt,
    assessedAt: now.toISOString(),
    foodAgeHours,
    is24HourExceeded,
    storageMethod: payload.storageMethod,
    storageTemperature: payload.storageTemperature,
    temperatureUnit: payload.temperatureUnit || 'C',
    storageDurationHours: foodAgeHours,
    packagingCondition: payload.packagingCondition,
    handlingStatus: payload.handlingStatus,
    potentialAllergens: Array.from(allergensFound),
    estimatedServingsMin: minServings,
    estimatedServingsMax: maxServings,
    servingBreakdown,
    servingEstimationAssumptions: [
      `Assumed ${catConfig.minKg * 1000}g–${catConfig.maxKg * 1000}g average portion size for ${payload.category}`,
      'Calculated based on edible prepared mass excluding container tare weight',
      'Actual servings may vary depending on serving size, meal accompaniments, and recipient demographics',
    ],
    assessmentStatus: status,
    riskFactors,
    missingInformation,
    aiExplanation: explanation,
    isAiGenerated: false,
    confidenceScore: 88,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

/**
 * Primary AI Analysis function calling Gemini API securely on backend with automatic rule-based fallback
 */
export async function analyzeFoodQualityWithGemini(payload: QualityAnalysisRequestPayload): Promise<FoodQualityAssessment> {
  const fallback = calculateRuleBasedQualityAssessment(payload);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    fallback.aiExplanation = `[RULE-BASED ENGINE] ${fallback.aiExplanation}`;
    return fallback;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `
You are the Food Quality Assurance Intelligence Engine for FoodBridge AI (UN SDG 2 Zero Hunger Surplus Food Redistribution).
Analyze this food donation record carefully and provide an explainable safety and serving assessment:

Food Details:
- Name: ${payload.foodName}
- Category: ${payload.category}
- Diet Type: ${payload.foodType}
- State: ${payload.rawOrCooked}
- Total Weight: ${payload.totalWeight} ${payload.weightUnit}
- Containers: ${payload.containerCount || 1} x ${payload.containerType || 'Not specified'}
- Ingredients: ${JSON.stringify(payload.ingredients || [])}
- Prepared Timestamp: ${payload.preparedAt}
- Current Assessment Timestamp: ${new Date().toISOString()}
- Storage Method: ${payload.storageMethod}
- Food Temperature: ${payload.storageTemperature ?? 'Not measured'} ${payload.temperatureUnit || 'C'}
- Packaging: ${payload.packagingCondition}
- Handling: ${payload.handlingStatus}

MANDATORY SAFETY GUARDRAILS:
1. Do NOT make an absolute medical guarantee or claim "100% safe to eat". Use wording such as: "Based on the information provided, this food appears suitable for further safety verification."
2. Implement the 24-hour food age logic:
   - Food age < 24 hours: Continue safety assessment with storage, temperature, handling, and food type.
   - Food age >= 24 hours: Highlight "CAUTION – FOOD AGE EXCEEDS 24 HOURS" requiring mandatory additional verification.
3. Identify potential allergens from ingredients (e.g. Milk, Dairy, Nuts, Peanuts, Gluten, Wheat, Soy, Egg, Fish, Shellfish, Sesame).
4. Estimate servings range (min and max) transparently with assumptions based on food category and typical portion sizes.
5. Provide a clear status from one of: "VERIFIED", "CAUTION", "SAFETY_REVIEW", "INCOMPLETE", "SAFETY_HOLD", "EXPIRED".

Respond strictly with a JSON object matching this schema (no markdown, no extra commentary):
{
  "estimatedServingRange": {
    "minimum": number,
    "maximum": number
  },
  "servingAssumptions": [string],
  "potentialAllergens": [string],
  "foodAgeHours": number,
  "is24HourExceeded": boolean,
  "riskFactors": [string],
  "missingInformation": [string],
  "assessmentStatus": "VERIFIED" | "CAUTION" | "SAFETY_REVIEW" | "INCOMPLETE" | "SAFETY_HOLD" | "EXPIRED",
  "recommendedAction": string,
  "explanation": string,
  "confidenceScore": number
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '';
    if (!text) {
      fallback.aiExplanation = `[RULE-BASED ENGINE] Empty AI response; used verified deterministic safety model. ${fallback.aiExplanation}`;
      return fallback;
    }

    const parsed = JSON.parse(text);

    return {
      ...fallback,
      estimatedServingsMin: parsed.estimatedServingRange?.minimum || fallback.estimatedServingsMin,
      estimatedServingsMax: parsed.estimatedServingRange?.maximum || fallback.estimatedServingsMax,
      servingEstimationAssumptions: parsed.servingAssumptions || fallback.servingEstimationAssumptions,
      potentialAllergens: Array.isArray(parsed.potentialAllergens) && parsed.potentialAllergens.length > 0 ? parsed.potentialAllergens : fallback.potentialAllergens,
      riskFactors: Array.isArray(parsed.riskFactors) ? parsed.riskFactors : fallback.riskFactors,
      missingInformation: Array.isArray(parsed.missingInformation) ? parsed.missingInformation : fallback.missingInformation,
      assessmentStatus: parsed.assessmentStatus || fallback.assessmentStatus,
      aiExplanation: parsed.explanation || fallback.aiExplanation,
      confidenceScore: parsed.confidenceScore || 94,
      isAiGenerated: true,
    };
  } catch (error) {
    console.warn('Gemini API call failed, falling back to deterministic FoodBridge engine:', error);
    fallback.aiExplanation = `[AI SERVICE FALLBACK] ${fallback.aiExplanation} (AI service offline – showing rule-based assessment).`;
    return fallback;
  }
}
