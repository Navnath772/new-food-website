import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  INITIAL_ANALYTICS,
  INITIAL_DONATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORGANIZATIONS,
  INITIAL_USERS,
  INITIAL_VOLUNTEERS,
} from '../services/mockData.ts';
import {
  calculateCO2eAvoided,
  calculateFoodRescueScore,
  calculateHaversineDistance,
  computeMatchScore,
  convertToKg,
  estimateMeals,
} from '../services/intelligenceEngine.ts';
import {
  AuditEvent,
  CommunityNeed,
  CustodyEvent,
  FoodDonation,
  Organization,
  PlatformAnalytics,
  User,
  Volunteer,
  AppNotification,
} from '../types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'foodbridge_db.json');

export interface DatabaseSchema {
  users: User[];
  donations: FoodDonation[];
  organizations: Organization[];
  volunteers: Volunteer[];
  needs: CommunityNeed[];
  notifications: AppNotification[];
  auditLogs: AuditEvent[];
  analytics: PlatformAnalytics;
  lastResetAt: string;
}

const INITIAL_NEEDS: CommunityNeed[] = [
  {
    id: 'need-1',
    ngo_id: 'org-ngo-1',
    ngo_name: 'Annapurna Community Shelter',
    food_type: 'Vegetarian',
    category: 'Cooked Meal',
    quantity_portions: 60,
    urgency: 'High',
    required_before: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    status: 'OPEN',
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
    description: 'Evening community dinner for 60 unhoused individuals. Warm vegetarian meals preferred.',
  },
  {
    id: 'need-2',
    ngo_id: 'org-ngo-2',
    ngo_name: 'Shanti Balgram Orphanage',
    food_type: 'Vegetarian',
    category: 'Cooked Meal',
    quantity_portions: 45,
    urgency: 'Medium',
    required_before: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    status: 'OPEN',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    description: 'Nutritious dinner for resident children (rice, dal, sabzi, or chapatis).',
  },
  {
    id: 'need-3',
    ngo_id: 'org-ngo-3',
    ngo_name: 'Snehalaya Senior Care & Night Shelter',
    food_type: 'Vegetarian',
    category: 'Cooked Meal',
    quantity_portions: 35,
    urgency: 'High',
    required_before: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    status: 'OPEN',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    description: 'Soft cooked meals with low spice for senior citizens.',
  },
];

const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'audit-1',
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    actor: 'ABC College Mess Administration',
    role: 'donor',
    action: 'DONATION_CREATED',
    entity: 'FoodDonation',
    entity_id: 'don-1',
    status: 'SUCCESS',
    details: 'Published 50 portions of Vegetable Dum Biryani with 7-point safety declaration.',
  },
  {
    id: 'audit-2',
    timestamp: new Date(Date.now() - 3.8 * 3600 * 1000).toISOString(),
    actor: 'Explainable Intelligence Engine',
    role: 'system',
    action: 'AI_MATCH_GENERATED',
    entity: 'MatchRecommendation',
    entity_id: 'don-1',
    status: 'SUCCESS',
    details: 'Matched with Annapurna Community Shelter (Score: 94/100, Proximity: 0.8 km).',
  },
  {
    id: 'audit-3',
    timestamp: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
    actor: 'Annapurna Community Shelter',
    role: 'ngo',
    action: 'MATCH_ACCEPTED',
    entity: 'FoodDonation',
    entity_id: 'don-1',
    status: 'SUCCESS',
    details: 'Shelter confirmed acceptance. Volunteer courier requested.',
  },
  {
    id: 'audit-4',
    timestamp: new Date(Date.now() - 3.2 * 3600 * 1000).toISOString(),
    actor: 'Rahul Patil',
    role: 'volunteer',
    action: 'MISSION_ACCEPTED',
    entity: 'FoodDonation',
    entity_id: 'don-1',
    status: 'SUCCESS',
    details: 'Courier accepted rescue mission with Motorcycle. Route calculated.',
  },
  {
    id: 'audit-5',
    timestamp: new Date(Date.now() - 2.8 * 3600 * 1000).toISOString(),
    actor: 'Rahul Patil',
    role: 'volunteer',
    action: 'PICKUP_OTP_VERIFIED',
    entity: 'FoodDonation',
    entity_id: 'don-1',
    status: 'SUCCESS',
    details: 'Dual-OTP pickup verification successful (OTP entered & verified with donor).',
  },
];

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private getInitialData(): DatabaseSchema {
    // Enhance initial donations with Food Rescue Score and Custody Ledgers
    const enhancedDonations = INITIAL_DONATIONS.map((d) => {
      const breakdown = calculateFoodRescueScore({
        expiryTimeIso: d.expiry_time,
        distanceKm: 0.8,
        quantityMeals: d.estimated_meals,
        hasMatchingDemand: true,
        safetyStatus: d.safety_status,
      });

      const custodyLedger: CustodyEvent[] = [
        {
          id: `cust-${d.id}-1`,
          timestamp: d.created_at,
          stage: 'DONATION_PUBLISHED',
          actor: d.donor_name,
          details: `Published ${d.quantity} ${d.unit} of ${d.food_name}`,
          status: 'COMPLETED',
        },
        {
          id: `cust-${d.id}-2`,
          timestamp: new Date(new Date(d.created_at).getTime() + 120000).toISOString(),
          stage: 'SAFETY_DECLARED',
          actor: d.donor_name,
          details: 'Kitchen temperature verified (>65°C), packaging intact, clean handling declared.',
          status: 'COMPLETED',
        },
      ];

      if (d.status === 'VOLUNTEER_ASSIGNED' || d.status === 'PICKED_UP' || d.status === 'IN_TRANSIT' || d.status === 'DELIVERED' || d.status === 'COMPLETED') {
        custodyLedger.push({
          id: `cust-${d.id}-3`,
          timestamp: new Date(new Date(d.created_at).getTime() + 600000).toISOString(),
          stage: 'COURIER_ASSIGNED',
          actor: d.assigned_volunteer_name || 'Volunteer Courier',
          details: 'Courier accepted transit mission',
          status: 'COMPLETED',
        });
      }

      if (d.status === 'PICKED_UP' || d.status === 'IN_TRANSIT' || d.status === 'DELIVERED' || d.status === 'COMPLETED') {
        custodyLedger.push({
          id: `cust-${d.id}-4`,
          timestamp: new Date(new Date(d.created_at).getTime() + 1200000).toISOString(),
          stage: 'PICKUP_VERIFIED',
          actor: d.assigned_volunteer_name || 'Volunteer Courier',
          details: `Dual-OTP handshake verified with donor kitchen (${d.pickup_otp || '4821'})`,
          status: 'COMPLETED',
        });
      }

      if (d.status === 'DELIVERED' || d.status === 'COMPLETED') {
        custodyLedger.push({
          id: `cust-${d.id}-5`,
          timestamp: new Date(new Date(d.created_at).getTime() + 2400000).toISOString(),
          stage: 'DELIVERY_CONFIRMED',
          actor: d.assigned_ngo_name || 'Recipient Shelter',
          details: `Shelter supervisor accepted handover with delivery OTP (${d.delivery_otp || '7193'})`,
          status: 'COMPLETED',
        });
      }

      return {
        ...d,
        food_rescue_score: breakdown.totalScore,
        food_rescue_score_breakdown: breakdown,
        custody_ledger: custodyLedger,
        qr_token: `FB-${d.id}-${d.pickup_otp || '4821'}`,
      };
    });

    return {
      users: [...INITIAL_USERS],
      donations: enhancedDonations,
      organizations: [...INITIAL_ORGANIZATIONS],
      volunteers: [...INITIAL_VOLUNTEERS],
      needs: [...INITIAL_NEEDS],
      notifications: [...INITIAL_NOTIFICATIONS],
      auditLogs: [...INITIAL_AUDIT_LOGS],
      analytics: { ...INITIAL_ANALYTICS },
      lastResetAt: new Date().toISOString(),
    };
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.donations && parsed.users && parsed.organizations) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read existing database file, initializing fresh store:', e);
    }

    const initial = this.getInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file:', e);
    }
  }

  // --- Users & Auth ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(userData: Partial<User>): User {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name || 'Anonymous User',
      email: userData.email || `user_${Date.now()}@example.com`,
      phone: userData.phone || '+91 98000 00000',
      role: userData.role || 'donor',
      organization: userData.organization || userData.name,
      address: userData.address || 'Kolhapur, Maharashtra',
      latitude: userData.latitude || 16.705,
      longitude: userData.longitude || 74.243,
      verified: true,
      created_at: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.logAuditEvent({
      actor: newUser.name,
      role: newUser.role,
      action: 'USER_REGISTERED',
      entity: 'User',
      entity_id: newUser.id,
      status: 'SUCCESS',
      details: `New account registered as ${newUser.role}`,
    });
    this.saveData();
    return newUser;
  }

  // --- Donations ---
  public getDonations(filter?: { status?: string; donorId?: string }): FoodDonation[] {
    let result = [...this.data.donations];
    if (filter?.status) {
      result = result.filter((d) => d.status === filter.status);
    }
    if (filter?.donorId) {
      result = result.filter((d) => d.donor_id === filter.donorId);
    }
    return result;
  }

  public getDonationById(id: string): FoodDonation | undefined {
    return this.data.donations.find((d) => d.id === id);
  }

  public createDonation(data: Partial<FoodDonation>): FoodDonation {
    const id = `don-${Date.now()}`;
    const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const nowIso = new Date().toISOString();
    const estMeals = estimateMeals(data.quantity || 50, data.unit || 'Meals');

    const scoreBreakdown = calculateFoodRescueScore({
      expiryTimeIso: data.expiry_time || new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
      distanceKm: 0.8,
      quantityMeals: estMeals,
      hasMatchingDemand: true,
      safetyStatus: data.safety_status || 'DECLARED',
    });

    const newDonation: FoodDonation = {
      id,
      donor_id: data.donor_id || 'user-donor-1',
      donor_name: data.donor_name || 'ABC College Mess Administration',
      food_name: data.food_name || 'Fresh Cooked Meals',
      food_category: data.food_category || 'Cooked Meal',
      food_type: data.food_type || 'Vegetarian',
      quantity: data.quantity || 50,
      unit: data.unit || 'Meals',
      preparation_time: data.preparation_time || nowIso,
      expiry_time: data.expiry_time || new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
      dietary_label: data.dietary_label || `${data.food_type || 'Vegetarian'} · Fresh Kitchen Batch`,
      description: data.description || 'Surplus prepared fresh food from kitchen.',
      image: data.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      latitude: data.latitude || 16.7042,
      longitude: data.longitude || 74.2441,
      pickup_address: data.pickup_address || 'Campus Road, University Enclave, Kolhapur',
      status: 'PUBLISHED',
      safety_status: data.safety_status || 'DECLARED',
      urgency: data.urgency || 'High',
      priority_level: scoreBreakdown.priorityLabel === 'CRITICAL PRIORITY' ? 'CRITICAL' : 'HIGH',
      estimated_meals: estMeals,
      estimated_shelf_life_hours: data.estimated_shelf_life_hours || 4,
      recommended_pickup_window: data.recommended_pickup_window || 'Within 90 minutes',
      pickup_otp: pickupOtp,
      delivery_otp: deliveryOtp,
      food_rescue_score: scoreBreakdown.totalScore,
      food_rescue_score_breakdown: scoreBreakdown,
      qr_token: `FB-${id}-${pickupOtp}`,
      custody_ledger: [
        {
          id: `cust-${id}-1`,
          timestamp: nowIso,
          stage: 'DONATION_PUBLISHED',
          actor: data.donor_name || 'Donor Kitchen',
          details: `Published ${data.quantity} ${data.unit} of ${data.food_name}. Rescue Score: ${scoreBreakdown.totalScore}/100.`,
          status: 'COMPLETED',
        },
      ],
      created_at: nowIso,
    };

    this.data.donations.unshift(newDonation);

    // Update real-time analytics
    this.data.analytics.meals_rescued += estMeals;
    const kg = convertToKg(newDonation.quantity, newDonation.unit);
    this.data.analytics.food_diverted_kg += Math.round(kg);
    this.data.analytics.co2e_avoided_kg = calculateCO2eAvoided(this.data.analytics.food_diverted_kg);
    this.data.analytics.active_donations_count = this.data.donations.filter((d) => d.status !== 'COMPLETED' && d.status !== 'EXPIRED').length;

    // Create notifications for NGOs
    this.createNotification({
      user_id: 'user-ngo-1',
      title: '🚨 New Surplus Food Batch Nearby',
      message: `${newDonation.donor_name} published ${newDonation.quantity} ${newDonation.unit} of ${newDonation.food_name}. Food Rescue Score: ${scoreBreakdown.totalScore}/100.`,
      type: 'URGENT',
      link_tab: 'ngo',
      link_id: newDonation.id,
    });

    this.logAuditEvent({
      actor: newDonation.donor_name,
      role: 'donor',
      action: 'DONATION_PUBLISHED',
      entity: 'FoodDonation',
      entity_id: newDonation.id,
      status: 'SUCCESS',
      details: `Created surplus donation: ${newDonation.food_name} (${newDonation.quantity} ${newDonation.unit}). Rescue Score: ${scoreBreakdown.totalScore}/100`,
    });

    this.saveData();
    return newDonation;
  }

  public updateDonation(id: string, updates: Partial<FoodDonation>): FoodDonation | undefined {
    const index = this.data.donations.findIndex((d) => d.id === id);
    if (index === -1) return undefined;

    const current = this.data.donations[index];
    const updated: FoodDonation = {
      ...current,
      ...updates,
    };

    // If status changed, record in digital custody ledger
    if (updates.status && updates.status !== current.status) {
      if (!updated.custody_ledger) updated.custody_ledger = [];
      updated.custody_ledger.push({
        id: `cust-${id}-${Date.now()}`,
        timestamp: new Date().toISOString(),
        stage: `STATUS_${updates.status}`,
        actor: updates.assigned_volunteer_name || updates.assigned_ngo_name || 'System Operator',
        details: `Donation status updated from ${current.status} to ${updates.status}`,
        status: 'COMPLETED',
      });
    }

    this.data.donations[index] = updated;
    this.saveData();
    return updated;
  }

  public deleteDonation(id: string): boolean {
    const initialLen = this.data.donations.length;
    this.data.donations = this.data.donations.filter((d) => d.id !== id);
    if (this.data.donations.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- NGOs & Matches ---
  public getOrganizations(): Organization[] {
    return this.data.organizations;
  }

  public getMatchesForDonation(donationId: string) {
    const donation = this.getDonationById(donationId);
    if (!donation) return [];

    return this.data.organizations
      .map((org) => {
        const distanceKm = calculateHaversineDistance(
          donation.latitude,
          donation.longitude,
          org.latitude,
          org.longitude
        );

        const scoring = computeMatchScore({
          distanceKm,
          foodType: donation.food_type,
          category: donation.food_category,
          expiryTime: donation.expiry_time,
          estimatedMeals: donation.estimated_meals,
          organization: org,
        });

        const whyMatchReasons: string[] = [];
        if (distanceKm <= 1.5) whyMatchReasons.push(`Hyper-local proximity (${distanceKm} km away)`);
        else whyMatchReasons.push(`${distanceKm} km transit corridor`);

        if (org.required_food_types.includes(donation.food_type)) {
          whyMatchReasons.push(`Direct dietary match: accepts ${donation.food_type}`);
        }
        if (org.capacity >= donation.estimated_meals) {
          whyMatchReasons.push(`Sufficient capacity (Serves ${org.capacity} people)`);
        }
        if (org.verified) whyMatchReasons.push('Verified partner organization');

        return {
          organization_id: org.id,
          organization_name: org.name,
          organization_type: org.type,
          address: org.address,
          phone: org.phone,
          distance_km: distanceKm,
          match_score: scoring.totalScore,
          food_compatibility_score: scoring.compatibilityScore,
          distance_score: scoring.distanceScore,
          urgency_score: scoring.urgencyScore,
          capacity_score: scoring.capacityScore,
          verification_score: scoring.verificationScore,
          reasons: whyMatchReasons,
        };
      })
      .sort((a, b) => b.match_score - a.match_score);
  }

  public acceptMatch(donationId: string, ngoId: string, ngoName: string) {
    const donation = this.getDonationById(donationId);
    if (!donation) return null;

    donation.status = 'ACCEPTED';
    donation.assigned_ngo_id = ngoId;
    donation.assigned_ngo_name = ngoName;

    if (!donation.custody_ledger) donation.custody_ledger = [];
    donation.custody_ledger.push({
      id: `cust-${donationId}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'NGO_ACCEPTED',
      actor: ngoName,
      details: `${ngoName} accepted the allocation. Volunteer dispatch triggered.`,
      status: 'COMPLETED',
    });

    this.logAuditEvent({
      actor: ngoName,
      role: 'ngo',
      action: 'MATCH_ACCEPTED',
      entity: 'FoodDonation',
      entity_id: donationId,
      status: 'SUCCESS',
      details: `Shelter accepted surplus food batch ${donation.food_name}`,
    });

    // Notify volunteers
    this.createNotification({
      user_id: 'user-vol-1',
      title: '🚴 Courier Rescue Mission Available',
      message: `${ngoName} accepted ${donation.food_name} from ${donation.donor_name}. Tap to accept mission.`,
      type: 'URGENT',
      link_tab: 'volunteer',
      link_id: donation.id,
    });

    this.saveData();
    return donation;
  }

  // --- Volunteers & Pickups ---
  public getVolunteers(): Volunteer[] {
    return this.data.volunteers;
  }

  public assignVolunteer(donationId: string, volunteerId: string, volunteerName: string) {
    const donation = this.getDonationById(donationId);
    if (!donation) return null;

    donation.status = 'VOLUNTEER_ASSIGNED';
    donation.assigned_volunteer_id = volunteerId;
    donation.assigned_volunteer_name = volunteerName;

    if (!donation.custody_ledger) donation.custody_ledger = [];
    donation.custody_ledger.push({
      id: `cust-${donationId}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'COURIER_ASSIGNED',
      actor: volunteerName,
      details: `${volunteerName} accepted courier dispatch mission`,
      status: 'COMPLETED',
    });

    this.logAuditEvent({
      actor: volunteerName,
      role: 'volunteer',
      action: 'MISSION_ACCEPTED',
      entity: 'FoodDonation',
      entity_id: donationId,
      status: 'SUCCESS',
      details: `Courier assigned to rescue route for ${donation.food_name}`,
    });

    this.saveData();
    return donation;
  }

  public updatePickupStatus(donationId: string, nextStatus: string, otpEntered?: string): { success: boolean; message: string; donation?: FoodDonation } {
    const donation = this.getDonationById(donationId);
    if (!donation) {
      return { success: false, message: 'Donation record not found.' };
    }

    if (nextStatus === 'PICKED_UP') {
      if (otpEntered && donation.pickup_otp && otpEntered.trim() !== donation.pickup_otp.trim()) {
        return { success: false, message: `Invalid Pickup OTP code '${otpEntered}'. Please check with donor kitchen.` };
      }
    } else if (nextStatus === 'DELIVERED' || nextStatus === 'COMPLETED') {
      if (otpEntered && donation.delivery_otp && otpEntered.trim() !== donation.delivery_otp.trim()) {
        return { success: false, message: `Invalid Delivery OTP code '${otpEntered}'. Please check with shelter supervisor.` };
      }
    }

    donation.status = nextStatus as any;

    if (!donation.custody_ledger) donation.custody_ledger = [];
    donation.custody_ledger.push({
      id: `cust-${donationId}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: nextStatus,
      actor: donation.assigned_volunteer_name || 'Volunteer Courier',
      details: `Status advanced to ${nextStatus}. Chain of custody verified.`,
      status: 'COMPLETED',
    });

    if (nextStatus === 'COMPLETED' || nextStatus === 'DELIVERED') {
      this.data.analytics.successful_deliveries += 1;
      this.data.analytics.people_served += donation.estimated_meals;

      // Update volunteer completed pickups count and badges
      const vol = this.data.volunteers.find((v) => v.id === donation.assigned_volunteer_id);
      if (vol) {
        vol.completed_pickups += 1;
        if (vol.completed_pickups >= 10 && !vol.badges.includes('Food Hero')) {
          vol.badges.push('Food Hero');
        }
        if (vol.completed_pickups >= 25 && !vol.badges.includes('Community Champion')) {
          vol.badges.push('Community Champion');
        }
      }
    }

    this.logAuditEvent({
      actor: donation.assigned_volunteer_name || 'Courier',
      role: 'volunteer',
      action: `STATUS_${nextStatus}`,
      entity: 'FoodDonation',
      entity_id: donationId,
      status: 'SUCCESS',
      details: `Mission status updated to ${nextStatus}`,
    });

    this.saveData();
    return { success: true, message: `Status advanced to ${nextStatus}`, donation };
  }

  // --- Community Needs ---
  public getCommunityNeeds(): CommunityNeed[] {
    return this.data.needs;
  }

  public createCommunityNeed(needData: Partial<CommunityNeed>): CommunityNeed {
    const newNeed: CommunityNeed = {
      id: `need-${Date.now()}`,
      ngo_id: needData.ngo_id || 'org-ngo-1',
      ngo_name: needData.ngo_name || 'Annapurna Community Shelter',
      food_type: needData.food_type || 'Vegetarian',
      category: needData.category || 'Cooked Meal',
      quantity_portions: needData.quantity_portions || 50,
      urgency: needData.urgency || 'High',
      required_before: needData.required_before || new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
      status: 'OPEN',
      created_at: new Date().toISOString(),
      description: needData.description || 'Community nourishment needed.',
    };
    this.data.needs.unshift(newNeed);
    this.logAuditEvent({
      actor: newNeed.ngo_name,
      role: 'ngo',
      action: 'COMMUNITY_NEED_POSTED',
      entity: 'CommunityNeed',
      entity_id: newNeed.id,
      status: 'SUCCESS',
      details: `Posted need for ${newNeed.quantity_portions} portions of ${newNeed.food_type} ${newNeed.category}`,
    });
    this.saveData();
    return newNeed;
  }

  // --- Notifications ---
  public getNotifications(userId?: string): AppNotification[] {
    if (!userId) return this.data.notifications;
    return this.data.notifications.filter((n) => n.user_id === userId || n.user_id === 'all');
  }

  public createNotification(n: Partial<AppNotification>): AppNotification {
    const notif: AppNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: n.user_id || 'all',
      title: n.title || 'Notification',
      message: n.message || '',
      type: n.type || 'INFO',
      read_status: false,
      link_tab: n.link_tab,
      link_id: n.link_id,
      created_at: new Date().toISOString(),
    };
    this.data.notifications.unshift(notif);
    this.saveData();
    return notif;
  }

  public markNotificationRead(id: string): boolean {
    const n = this.data.notifications.find((item) => item.id === id);
    if (n) {
      n.read_status = true;
      this.saveData();
      return true;
    }
    return false;
  }

  public markAllNotificationsRead(userId?: string): void {
    this.data.notifications.forEach((n) => {
      if (!userId || n.user_id === userId || n.user_id === 'all') {
        n.read_status = true;
      }
    });
    this.saveData();
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditEvent[] {
    return this.data.auditLogs;
  }

  public logAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>) {
    const newEvent: AuditEvent = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };
    this.data.auditLogs.unshift(newEvent);
    // Keep max 200 audit events
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 200);
    }
    this.saveData();
  }

  // --- Analytics ---
  public getAnalytics(): PlatformAnalytics {
    return this.data.analytics;
  }

  // --- Reset Demo ---
  public resetToInitial(): DatabaseSchema {
    this.data = this.getInitialData();
    this.saveData();
    return this.data;
  }
}

export const db = new DatabaseService();
