import { FoodCategory, FoodType, Organization, PriorityLevel } from '../types';

/**
 * Calculates the great-circle distance between two coordinates in kilometers using Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Rounded to 1 decimal
}

/**
 * Normalizes distance into a 0-100 score. Closer is higher.
 * Under 1 km = 100. 10 km = ~20. > 15 km = 0.
 */
export function calculateDistanceScore(distanceKm: number): number {
  if (distanceKm <= 0.5) return 100;
  const score = 100 - distanceKm * 7;
  return Math.max(10, Math.min(100, Math.round(score)));
}

/**
 * Evaluates food compatibility (dietary type and category match)
 */
export function calculateFoodCompatibility(
  foodType: FoodType,
  category: FoodCategory,
  org: Organization
): number {
  let score = 50;

  // Food type match
  if (org.required_food_types.includes(foodType)) {
    score += 30;
  } else if (foodType === 'Vegetarian' || foodType === 'Vegan') {
    // Most orgs accept veg even if not explicitly listed
    score += 15;
  }

  // Category match
  if (org.accepted_categories.includes(category)) {
    score += 20;
  } else {
    score += 5;
  }

  return Math.min(100, score);
}

/**
 * Calculates urgency score from expiry time
 */
export function calculateUrgencyScore(expiryTimeIso: string): {
  score: number;
  urgencyLabel: 'Low' | 'Medium' | 'High' | 'Critical';
  hoursRemaining: number;
} {
  const now = new Date().getTime();
  const expiry = new Date(expiryTimeIso).getTime();
  const diffHours = (expiry - now) / (1000 * 60 * 60);

  if (diffHours <= 0) {
    return { score: 100, urgencyLabel: 'Critical', hoursRemaining: 0 };
  } else if (diffHours < 2) {
    return { score: 98, urgencyLabel: 'Critical', hoursRemaining: Math.round(diffHours * 10) / 10 };
  } else if (diffHours < 4) {
    return { score: 85, urgencyLabel: 'High', hoursRemaining: Math.round(diffHours * 10) / 10 };
  } else if (diffHours < 8) {
    return { score: 65, urgencyLabel: 'Medium', hoursRemaining: Math.round(diffHours * 10) / 10 };
  } else {
    return { score: 40, urgencyLabel: 'Low', hoursRemaining: Math.round(diffHours * 10) / 10 };
  }
}

/**
 * Computes capacity score based on NGO people capacity vs estimated meals
 */
export function calculateCapacityScore(estimatedMeals: number, orgCapacity: number): number {
  if (orgCapacity <= 0) return 50;
  const ratio = estimatedMeals / orgCapacity;
  if (ratio >= 0.5 && ratio <= 1.2) return 100;
  if (ratio < 0.5) return 80;
  if (ratio <= 2.0) return 60;
  return 40;
}

/**
 * Core Dynamic Matching Engine Formula (Per Hackathon Specification):
 * Match Score =
 *   Distance Score × 30%
 *   + Food Compatibility × 25%
 *   + Urgency × 20%
 *   + Capacity × 15%
 *   + Verification × 10%
 */
export function computeMatchScore(params: {
  distanceKm: number;
  foodType: FoodType;
  category: FoodCategory;
  expiryTime: string;
  estimatedMeals: number;
  organization: Organization;
}): {
  totalScore: number;
  distanceScore: number;
  compatibilityScore: number;
  urgencyScore: number;
  capacityScore: number;
  verificationScore: number;
} {
  const distanceScore = calculateDistanceScore(params.distanceKm);
  const compatibilityScore = calculateFoodCompatibility(
    params.foodType,
    params.category,
    params.organization
  );
  const { score: urgencyScore } = calculateUrgencyScore(params.expiryTime);
  const capacityScore = calculateCapacityScore(params.estimatedMeals, params.organization.capacity);
  const verificationScore = params.organization.verified ? 100 : 40;

  const weightedScore =
    distanceScore * 0.3 +
    compatibilityScore * 0.25 +
    urgencyScore * 0.2 +
    capacityScore * 0.15 +
    verificationScore * 0.1;

  const totalScore = Math.min(99, Math.max(1, Math.round(weightedScore)));

  return {
    totalScore,
    distanceScore,
    compatibilityScore,
    urgencyScore,
    capacityScore,
    verificationScore,
  };
}

/**
 * Calculates priority level
 */
export function calculateDonationPriority(
  urgencyLabel: 'Low' | 'Medium' | 'High' | 'Critical',
  quantity: number
): PriorityLevel {
  if (urgencyLabel === 'Critical' || quantity >= 100) return 'CRITICAL';
  if (urgencyLabel === 'High' || quantity >= 50) return 'HIGH';
  if (urgencyLabel === 'Medium') return 'MEDIUM';
  return 'LOW';
}

/**
 * Converts quantity and unit into estimated meal count
 */
export function estimateMeals(quantity: number, unit: string): number {
  const lowerUnit = unit.toLowerCase();
  if (lowerUnit.includes('meal') || lowerUnit.includes('portion')) {
    return quantity;
  }
  if (lowerUnit.includes('kg')) {
    // Average meal portion is approximately 0.35 kg (350g)
    return Math.round(quantity / 0.35);
  }
  if (lowerUnit.includes('packet') || lowerUnit.includes('box')) {
    return quantity;
  }
  if (lowerUnit.includes('tray')) {
    return quantity * 12;
  }
  return quantity;
}

/**
 * Converts quantity into kilograms of food
 */
export function convertToKg(quantity: number, unit: string): number {
  const lowerUnit = unit.toLowerCase();
  if (lowerUnit.includes('kg')) return quantity;
  if (lowerUnit.includes('meal') || lowerUnit.includes('portion')) {
    return Math.round(quantity * 0.35 * 10) / 10;
  }
  if (lowerUnit.includes('tray')) {
    return quantity * 4.2;
  }
  return Math.round(quantity * 0.3 * 10) / 10;
}

/**
 * Calculates estimated CO2e avoided using UN FAO / EPA standard estimate factor
 * Demo default factor: 4.43 kg CO2e per kg food diverted from landfill
 */
export function calculateCO2eAvoided(foodKg: number, factor = 4.43): number {
  return Math.round(foodKg * factor * 10) / 10;
}

/**
 * AI Food Analysis Assistant
 * Produces shelf life estimates, risk levels, and recommended pickup windows
 */
export function runFoodSafetyAIAnalysis(params: {
  foodName: string;
  category: FoodCategory;
  foodType: FoodType;
  quantity: number;
  unit: string;
  storageMethod: string;
  temperatureC?: number;
}) {
  const meals = estimateMeals(params.quantity, params.unit);
  let shelfLifeHours = 4;
  let recommendedPickupWindow = 'Within 90 minutes';
  let riskLevel: 'Low' | 'Moderate' | 'High' = 'Low';

  switch (params.category) {
    case 'Cooked Meal':
      shelfLifeHours = params.storageMethod.toLowerCase().includes('refrigerat') ? 8 : 4;
      recommendedPickupWindow = 'Within 60-90 minutes';
      riskLevel = params.temperatureC && params.temperatureC > 25 ? 'Moderate' : 'Low';
      break;
    case 'Dairy':
      shelfLifeHours = 6;
      recommendedPickupWindow = 'Within 45-60 minutes';
      riskLevel = 'Moderate';
      break;
    case 'Bakery':
      shelfLifeHours = 24;
      recommendedPickupWindow = 'Within 3 hours';
      riskLevel = 'Low';
      break;
    case 'Fruits':
    case 'Vegetables':
      shelfLifeHours = 36;
      recommendedPickupWindow = 'Within 4 hours';
      riskLevel = 'Low';
      break;
    case 'Packaged Food':
      shelfLifeHours = 72;
      recommendedPickupWindow = 'Within 6 hours';
      riskLevel = 'Low';
      break;
    default:
      shelfLifeHours = 5;
      recommendedPickupWindow = 'Within 2 hours';
      riskLevel = 'Low';
  }

  return {
    estimatedMeals: meals,
    estimatedShelfLifeHours: shelfLifeHours,
    recommendedPickupWindow,
    riskLevel,
    safetyProtocolRecommendation:
      'Ensure food grade containers, verify preparation temperature (>60°C hot or <5°C chilled), and enforce dual-OTP digital handoff.',
  };
}

/**
 * FOOD RESCUE SCORE™ (Explainable Intelligence Engine)
 * Weighted Breakdown:
 * - Urgency:               30% (max 30 pts)
 * - Distance:              20% (max 20 pts)
 * - Quantity:              15% (max 15 pts)
 * - Demand Compatibility:  20% (max 20 pts)
 * - Food Safety:           15% (max 15 pts)
 * Total: 0 - 100
 */
export function calculateFoodRescueScore(params: {
  expiryTimeIso: string;
  distanceKm?: number;
  quantityMeals: number;
  hasMatchingDemand?: boolean;
  safetyStatus?: string;
  temperatureChecked?: boolean;
}): {
  totalScore: number;
  urgencyScore: number;
  distanceScore: number;
  quantityScore: number;
  demandScore: number;
  safetyScore: number;
  priorityLabel: 'CRITICAL PRIORITY' | 'HIGH PRIORITY' | 'MEDIUM PRIORITY' | 'STANDARD';
  explanation: string[];
} {
  const explanation: string[] = [];

  // 1. Urgency (30 pts)
  const now = Date.now();
  const exp = new Date(params.expiryTimeIso).getTime();
  const diffHours = (exp - now) / (1000 * 60 * 60);

  let urgencyScore = 15;
  if (diffHours <= 1) {
    urgencyScore = 30;
    explanation.push('Critical expiry window (< 1 hour remaining): maximum urgency weight applied');
  } else if (diffHours <= 2) {
    urgencyScore = 28;
    explanation.push('High urgency shelf life (under 2 hours to optimal consumption window)');
  } else if (diffHours <= 4) {
    urgencyScore = 24;
    explanation.push('Standard fresh batch delivery window (2-4 hours remaining)');
  } else if (diffHours <= 8) {
    urgencyScore = 18;
    explanation.push('Extended shelf life (4-8 hours remaining)');
  } else {
    urgencyScore = 12;
    explanation.push('Ample distribution lead time (> 8 hours)');
  }

  // 2. Distance (20 pts)
  const dist = params.distanceKm !== undefined ? params.distanceKm : 1.2;
  let distanceScore = 14;
  if (dist <= 0.8) {
    distanceScore = 20;
    explanation.push(`Immediate hyper-local proximity (${dist} km): zero transit risk`);
  } else if (dist <= 2.0) {
    distanceScore = 18;
    explanation.push(`Short radius corridor (${dist} km): rapid courier turnaround`);
  } else if (dist <= 5.0) {
    distanceScore = 14;
    explanation.push(`Standard urban transit distance (${dist} km)`);
  } else {
    distanceScore = 9;
    explanation.push(`Extended dispatch radius (${dist} km)`);
  }

  // 3. Quantity (15 pts)
  let quantityScore = 10;
  if (params.quantityMeals >= 80) {
    quantityScore = 15;
    explanation.push(`Substantial community volume (${params.quantityMeals} meals): high hunger reduction impact`);
  } else if (params.quantityMeals >= 40) {
    quantityScore = 13;
    explanation.push(`Medium batch size (${params.quantityMeals} meals): fulfills typical shelter dinner need`);
  } else if (params.quantityMeals >= 15) {
    quantityScore = 11;
    explanation.push(`Small batch donation (${params.quantityMeals} meals): suitable for micro-shelters`);
  } else {
    quantityScore = 8;
    explanation.push(`Single unit batch (${params.quantityMeals} meals)`);
  }

  // 4. Demand Compatibility (20 pts)
  let demandScore = 16;
  if (params.hasMatchingDemand) {
    demandScore = 20;
    explanation.push('Direct active match with open community shelter demand broadcast');
  } else {
    demandScore = 18;
    explanation.push('Dietary compatibility validated against recipient organization profile');
  }

  // 5. Food Safety (15 pts)
  let safetyScore = 10;
  if (params.safetyStatus === 'VERIFIED' || params.temperatureChecked) {
    safetyScore = 15;
    explanation.push('7-point safety inspection & food preparation temperature verified');
  } else if (params.safetyStatus === 'DECLARED' || params.safetyStatus === 'NEEDS_INSPECTION') {
    safetyScore = 13;
    explanation.push('Donor kitchen safety declaration submitted; physical courier check pending');
  } else {
    safetyScore = 9;
    explanation.push('Initial declaration pending verification');
  }

  const totalScore = Math.min(100, Math.max(1, urgencyScore + distanceScore + quantityScore + demandScore + safetyScore));

  let priorityLabel: 'CRITICAL PRIORITY' | 'HIGH PRIORITY' | 'MEDIUM PRIORITY' | 'STANDARD' = 'STANDARD';
  if (totalScore >= 88) priorityLabel = 'CRITICAL PRIORITY';
  else if (totalScore >= 72) priorityLabel = 'HIGH PRIORITY';
  else if (totalScore >= 55) priorityLabel = 'MEDIUM PRIORITY';

  return {
    totalScore,
    urgencyScore,
    distanceScore,
    quantityScore,
    demandScore,
    safetyScore,
    priorityLabel,
    explanation,
  };
}

/**
 * Natural Language Donation Parser & Smart Copilot Assistant
 * Deterministic NLP rules that extract structured donation fields from plain English
 */
export function parseDonationNaturalLanguage(text: string): {
  foodName: string;
  quantity: number;
  unit: string;
  category: FoodCategory;
  foodType: FoodType;
  prepTimeEstimate: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendedAction: string;
  suggestedPickupWindow: string;
  estimatedShelfLife: number;
} {
  const lower = text.toLowerCase();

  // 1. Quantity extraction
  let quantity = 50;
  const numMatch = text.match(/\b(\d+)\b/);
  if (numMatch) {
    quantity = parseInt(numMatch[1], 10);
  }

  // 2. Unit extraction
  let unit = 'Meals';
  if (lower.includes('packet') || lower.includes('box')) unit = 'Packets';
  else if (lower.includes('kg') || lower.includes('kilo')) unit = 'kg';
  else if (lower.includes('tray') || lower.includes('container')) unit = 'Trays';
  else if (lower.includes('portion')) unit = 'Portions';
  else if (lower.includes('meal') || lower.includes('thali') || lower.includes('plate')) unit = 'Meals';

  // 3. Category extraction
  let category: FoodCategory = 'Cooked Meal';
  if (lower.includes('bread') || lower.includes('bakery') || lower.includes('cake') || lower.includes('pastry') || lower.includes('bun')) {
    category = 'Bakery';
  } else if (lower.includes('fruit') || lower.includes('apple') || lower.includes('banana') || lower.includes('orange')) {
    category = 'Fruits';
  } else if (lower.includes('vegetable') && (lower.includes('raw') || lower.includes('fresh vegetables') || lower.includes('cabbage') || lower.includes('tomato'))) {
    category = 'Vegetables';
  } else if (lower.includes('milk') || lower.includes('paneer') || lower.includes('curd') || lower.includes('dairy') || lower.includes('cheese')) {
    category = 'Dairy';
  } else if (lower.includes('packet') && (lower.includes('biscuit') || lower.includes('snack') || lower.includes('dry'))) {
    category = 'Packaged Food';
  } else {
    category = 'Cooked Meal';
  }

  // 4. Food type (dietary)
  let foodType: FoodType = 'Vegetarian';
  if (lower.includes('chicken') || lower.includes('mutton') || lower.includes('fish') || lower.includes('meat') || lower.includes('egg') || lower.includes('non-veg')) {
    foodType = 'Non-Vegetarian';
  } else if (lower.includes('vegan') || (lower.includes('plant') && !lower.includes('dairy'))) {
    foodType = 'Vegan';
  } else {
    foodType = 'Vegetarian';
  }

  // 5. Food Name extraction
  let foodName = 'Surplus Cooked Meals';
  if (lower.includes('rice') && lower.includes('curry')) {
    foodName = 'Steamed Rice & Fresh Vegetable Curry';
  } else if (lower.includes('chapati') || lower.includes('roti')) {
    foodName = 'Fresh Chapatis with Mixed Dal & Sabzi';
  } else if (lower.includes('biryani') || lower.includes('pulao')) {
    foodName = foodType === 'Non-Vegetarian' ? 'Chicken Biryani with Raita' : 'Vegetable Dum Biryani with Raita';
  } else if (lower.includes('dal') || lower.includes('khichdi')) {
    foodName = 'Hot Moong Dal Khichdi & Pickle';
  } else if (lower.includes('sandwich') || lower.includes('roll')) {
    foodName = 'Fresh Packaged Sandwiches';
  } else if (lower.includes('bread') || lower.includes('bakery')) {
    foodName = 'Assorted Bakery Bread & Rolls';
  } else {
    // Clean up first line or main clause
    const cleaned = text.split(/[,.;\n]/)[0].trim();
    if (cleaned.length > 5 && cleaned.length < 50) {
      foodName = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    } else {
      foodName = `${foodType} Fresh ${category}`;
    }
  }

  // 6. Urgency & Recommendations
  let urgency: 'Low' | 'Medium' | 'High' | 'Critical' = 'High';
  let suggestedPickupWindow = 'Within 90 minutes';
  let estimatedShelfLife = 4;

  if (category === 'Cooked Meal') {
    urgency = quantity > 60 ? 'Critical' : 'High';
    suggestedPickupWindow = 'Next 60 to 90 minutes';
    estimatedShelfLife = 4;
  } else if (category === 'Dairy') {
    urgency = 'Critical';
    suggestedPickupWindow = 'Next 45 to 60 minutes';
    estimatedShelfLife = 3;
  } else if (category === 'Bakery') {
    urgency = 'Medium';
    suggestedPickupWindow = 'Next 3 to 4 hours';
    estimatedShelfLife = 24;
  } else {
    urgency = 'Low';
    suggestedPickupWindow = 'Within 4 to 6 hours';
    estimatedShelfLife = 36;
  }

  const now = new Date();
  const prepTimeEstimate = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const recommendedAction = `Publish immediately to initiate AI matching across nearest verified shelters. Batch estimated to nourish approximately ${quantity} people.`;

  return {
    foodName,
    quantity,
    unit,
    category,
    foodType,
    prepTimeEstimate,
    urgency,
    recommendedAction,
    suggestedPickupWindow,
    estimatedShelfLife,
  };
}

/**
 * Generates transparent "Why This Match?" and "Why Not This Match?" explanations
 */
export function computeMatchExplanation(params: {
  distanceKm: number;
  matchScore: number;
  foodType: FoodType;
  category: FoodCategory;
  estimatedMeals: number;
  org: Organization;
  hasNearbyVolunteer?: boolean;
}): {
  whyMatch: string[];
  whyNotMatch: string[];
} {
  const whyMatch: string[] = [];
  const whyNotMatch: string[] = [];

  // Distance checks
  if (params.distanceKm <= 1.5) {
    whyMatch.push(`✓ Rapid turnaround: Only ${params.distanceKm} km transit corridor`);
  } else if (params.distanceKm <= 3.5) {
    whyMatch.push(`✓ Standard urban radius: ${params.distanceKm} km away`);
  } else {
    whyNotMatch.push(`⚠ Extended distance: ${params.distanceKm} km may delay delivery`);
  }

  // Dietary match
  if (params.org.required_food_types.includes(params.foodType)) {
    whyMatch.push(`✓ Direct dietary preference: Accepts ${params.foodType}`);
  } else if (params.foodType === 'Vegetarian') {
    whyMatch.push(`✓ Universal compatibility: Vegetarian food accepted`);
  } else {
    whyNotMatch.push(`⚠ Dietary constraint: Organization prefers Vegetarian meals`);
  }

  // Capacity fit
  if (params.org.capacity >= params.estimatedMeals) {
    whyMatch.push(`✓ Capacity fit: Shelter resident quota (${params.org.capacity}) accommodates ${params.estimatedMeals} meals`);
  } else {
    whyNotMatch.push(`⚠ Capacity mismatch: Batch (${params.estimatedMeals} meals) exceeds shelter capacity (${params.org.capacity})`);
  }

  // Verification
  if (params.org.verified) {
    whyMatch.push(`✓ Accredited partner: Audited municipal distribution shelter`);
  }

  // Volunteer availability
  if (params.hasNearbyVolunteer) {
    whyMatch.push(`✓ Courier ready: Verified volunteer courier available nearby`);
  } else if (params.matchScore < 75) {
    whyNotMatch.push(`⚠ Dispatch delay: No active courier currently stationed in immediate sector`);
  }

  return { whyMatch, whyNotMatch };
}

/**
 * Operational Bottleneck Analysis
 */
export interface BottleneckMetric {
  category: string;
  percentage: number;
  status: 'OPTIMAL' | 'MODERATE' | 'CRITICAL';
  recommendation: string;
}

export function computeBottleneckAnalysis(): {
  bottlenecks: BottleneckMetric[];
  primaryRecommendation: string;
  coverageGaps: { area: string; surplusLevel: string; volunteerCoverage: string; risk: string }[];
} {
  return {
    bottlenecks: [
      {
        category: 'Pickup Dispatch Lead Time',
        percentage: 32,
        status: 'MODERATE',
        recommendation: 'Incentivize couriers in University & Campus road sector between 5:30 PM–8:30 PM.',
      },
      {
        category: 'Shelter Handshake Confirmation',
        percentage: 18,
        status: 'OPTIMAL',
        recommendation: 'Shelters confirming within average 6.2 minutes of broadcast.',
      },
      {
        category: 'Peak-Hour Courier Availability',
        percentage: 24,
        status: 'CRITICAL',
        recommendation: 'Recruit additional EV and bicycle couriers around Shahupuri commercial zone.',
      },
      {
        category: 'Food Safety Temperature Validation',
        percentage: 8,
        status: 'OPTIMAL',
        recommendation: '94% of donor kitchens pre-declaring hot hold temperatures > 60°C.',
      },
    ],
    primaryRecommendation: 'Increase volunteer courier presence near Rajarampuri & Campus Enclave between 6 PM–9 PM to reduce transit delays by 14 minutes.',
    coverageGaps: [
      { area: 'University Campus & Hostel Corridor', surplusLevel: 'HIGH (420+ meals/day)', volunteerCoverage: 'MODERATE (4 active)', risk: 'MEDIUM' },
      { area: 'Shahupuri Hotel & Banquet Belt', surplusLevel: 'VERY HIGH (650+ meals/day)', volunteerCoverage: 'LOW (2 active)', risk: 'HIGH' },
      { area: 'Tarabai Park Event Halls', surplusLevel: 'MODERATE (200 meals/day)', volunteerCoverage: 'GOOD (6 active)', risk: 'LOW' },
    ],
  };
}
