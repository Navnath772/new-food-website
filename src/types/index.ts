export type UserRole = 'donor' | 'ngo' | 'volunteer' | 'admin';

export type FoodCategory =
  | 'Cooked Meal'
  | 'Raw Food'
  | 'Bakery'
  | 'Fruits'
  | 'Vegetables'
  | 'Packaged Food'
  | 'Dairy'
  | 'Other';

export type FoodType = 'Vegetarian' | 'Vegan' | 'Non-Vegetarian';

export type DonationStatus =
  | 'PUBLISHED'
  | 'MATCHED'
  | 'ACCEPTED'
  | 'VOLUNTEER_ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'CANCELLED';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  organization?: string;
  address: string;
  latitude: number;
  longitude: number;
  verified: boolean;
  avatar?: string;
  created_at: string;
}

export interface FoodSafetyCheck {
  id: string;
  donation_id: string;
  temperature_checked: boolean;
  packaging_intact: boolean;
  preparation_time_verified: boolean;
  expiry_verified: boolean;
  contamination_check: boolean;
  handler_verified: boolean;
  quantity_verified: boolean;
  storage_method: string;
  temperature_c?: number;
  overall_status: 'SAFE' | 'WARNING' | 'REJECTED';
  checked_by: string;
  timestamp: string;
}

export interface FoodDonation {
  id: string;
  donor_id: string;
  donor_name: string;
  food_name: string;
  food_category: FoodCategory;
  food_type: FoodType;
  quantity: number;
  unit: string; // Meals, kg, Packets, Trays
  preparation_time: string;
  expiry_time: string;
  dietary_label: string;
  description: string;
  image?: string;
  latitude: number;
  longitude: number;
  pickup_address: string;
  status: DonationStatus;
  safety_status: 'UNVERIFIED' | 'VERIFIED' | 'NEEDS_INSPECTION' | 'REJECTED' | 'DECLARED' | 'FLAGGED';
  storage_method?: string;
  temperature_c?: number;
  packaging_condition?: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  priority_level: PriorityLevel;
  estimated_meals: number;
  estimated_shelf_life_hours: number;
  recommended_pickup_window: string;
  pickup_otp?: string;
  delivery_otp?: string;
  assigned_ngo_id?: string;
  assigned_ngo_name?: string;
  assigned_volunteer_id?: string;
  assigned_volunteer_name?: string;
  safety_check?: FoodSafetyCheck;
  food_rescue_score?: number;
  food_rescue_score_breakdown?: FoodRescueScoreBreakdown;
  custody_ledger?: CustodyEvent[];
  qr_token?: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  type: 'NGO' | 'Shelter' | 'Orphanage' | 'Community Center' | 'Food Bank';
  address: string;
  latitude: number;
  longitude: number;
  capacity: number; // people capacity
  contact: string;
  phone: string;
  verified: boolean;
  required_food_types: FoodType[];
  accepted_categories: FoodCategory[];
  current_need_description?: string;
}

export interface Volunteer {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  vehicle_type: 'Motorcycle' | 'Bicycle' | 'Car / Van' | 'EV Cargo Bike' | 'On Foot';
  availability: 'Available' | 'On Delivery' | 'Offline';
  current_latitude: number;
  current_longitude: number;
  verified: boolean;
  completed_pickups: number;
  badges: string[];
}

export interface MatchRecommendation {
  id: string;
  donation_id: string;
  organization_id: string;
  organization_name: string;
  organization_type: string;
  distance_km: number;
  food_compatibility_score: number; // 0-100
  distance_score: number; // 0-100
  urgency_score: number; // 0-100
  capacity_score: number; // 0-100
  verification_score: number; // 0-100
  match_score: number; // 0-100 calculated
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  created_at: string;
}

export interface PickupRecord {
  id: string;
  donation_id: string;
  volunteer_id: string;
  volunteer_name: string;
  organization_id: string;
  organization_name: string;
  pickup_time?: string;
  delivery_time?: string;
  status: DonationStatus;
  pickup_otp: string;
  delivery_otp: string;
  proof_image?: string;
}

export interface CustodyEvent {
  id: string;
  timestamp: string;
  stage: string;
  actor: string;
  details: string;
  status: string;
}

export interface FoodRescueScoreBreakdown {
  totalScore: number;
  urgencyScore: number; // out of 30
  distanceScore: number; // out of 20
  quantityScore: number; // out of 15
  demandScore: number; // out of 20
  safetyScore: number; // out of 15
  priorityLabel: 'CRITICAL PRIORITY' | 'HIGH PRIORITY' | 'MEDIUM PRIORITY' | 'STANDARD';
  explanation: string[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  entity: string;
  entity_id: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  details: string;
}

export interface CommunityNeed {
  id: string;
  ngo_id: string;
  ngo_name: string;
  food_type: FoodType;
  category: FoodCategory;
  quantity_portions: number;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  required_before: string;
  status: 'OPEN' | 'MATCHED' | 'FULFILLED';
  created_at: string;
  description: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'URGENT';
  read_status: boolean;
  link_tab?: string;
  link_id?: string;
  created_at: string;
}

export interface PlatformAnalytics {
  meals_rescued: number;
  food_diverted_kg: number;
  verified_donors: number;
  partner_ngos: number;
  active_volunteers: number;
  successful_deliveries: number;
  co2e_avoided_kg: number;
  people_served: number;
  active_donations_count: number;
  expired_donations_count: number;
  category_distribution: { category: string; count: number; percentage: number }[];
  daily_trend: { day: string; meals: number; donations: number }[];
}

export interface SimulationStep {
  step: number;
  time: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  badgeColor?: string;
}

