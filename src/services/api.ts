import {
  AppNotification,
  AuditEvent,
  CommunityNeed,
  CustodyEvent,
  FoodCategory,
  FoodDonation,
  FoodSafetyCheck,
  MatchRecommendation,
  Organization,
  PlatformAnalytics,
  User,
  UserRole,
  Volunteer,
} from '../types/index.ts';
import {
  calculateCO2eAvoided,
  calculateDonationPriority,
  calculateFoodRescueScore,
  calculateHaversineDistance,
  computeMatchScore,
  convertToKg,
  estimateMeals,
  runFoodSafetyAIAnalysis,
} from './intelligenceEngine.ts';
import {
  INITIAL_ANALYTICS,
  INITIAL_DONATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORGANIZATIONS,
  INITIAL_USERS,
  INITIAL_VOLUNTEERS,
} from './mockData.ts';

const STORAGE_KEYS = {
  USERS: 'foodbridge_users_v2',
  CURRENT_USER: 'foodbridge_current_user_v2',
  DONATIONS: 'foodbridge_donations_v2',
  ORGANIZATIONS: 'foodbridge_organizations_v2',
  VOLUNTEERS: 'foodbridge_volunteers_v2',
  NOTIFICATIONS: 'foodbridge_notifications_v2',
  NEEDS: 'foodbridge_needs_v2',
  AUDIT: 'foodbridge_audit_v2',
  ANALYTICS: 'foodbridge_analytics_v2',
};

// --- HTTP Client Helper ---
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || err.error?.message || `HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (error) {
    console.warn(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// --- REST API Client Modules ---

export const authApi = {
  async login(payload: { email?: string; role?: UserRole; userId?: string }): Promise<{ user: User; token: string }> {
    try {
      const res = await request<{ success: boolean; user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return { user: res.user, token: res.token };
    } catch {
      const user = appStore.getUsers().find((u) => u.id === payload.userId || u.role === payload.role) || appStore.getUsers()[0];
      return { user, token: 'local-session-fallback' };
    }
  },

  async register(userData: Partial<User>): Promise<{ user: User; token: string }> {
    try {
      const res = await request<{ success: boolean; user: User; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return { user: res.user, token: res.token };
    } catch {
      const newUser = appStore.addUser(userData);
      return { user: newUser, token: 'local-session-fallback' };
    }
  },

  async getUsers(): Promise<User[]> {
    try {
      const res = await request<{ success: boolean; users: User[] }>('/api/auth/users');
      return res.users;
    } catch {
      return appStore.getUsers();
    }
  },
};

export const donationApi = {
  async getDonations(filters?: { status?: string; donor_id?: string }): Promise<FoodDonation[]> {
    try {
      const query = new URLSearchParams(filters as any).toString();
      const res = await request<{ success: boolean; donations: FoodDonation[] }>(`/api/donations?${query}`);
      return res.donations;
    } catch {
      return appStore.getDonations();
    }
  },

  async getDonationById(id: string): Promise<FoodDonation> {
    try {
      const res = await request<{ success: boolean; donation: FoodDonation }>(`/api/donations/${id}`);
      return res.donation;
    } catch {
      const d = appStore.getDonationById(id);
      if (!d) throw new Error('Donation not found');
      return d;
    }
  },

  async createDonation(data: Partial<FoodDonation>): Promise<FoodDonation> {
    try {
      const res = await request<{ success: boolean; donation: FoodDonation }>('/api/donations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      appStore.injectDonation(res.donation);
      return res.donation;
    } catch {
      return appStore.createDonation(data);
    }
  },

  async updateDonation(id: string, updates: Partial<FoodDonation>): Promise<FoodDonation> {
    try {
      const res = await request<{ success: boolean; donation: FoodDonation }>(`/api/donations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      appStore.updateDonationLocal(res.donation);
      return res.donation;
    } catch {
      const updated = appStore.updateDonation(id, updates);
      if (!updated) throw new Error('Failed to update donation');
      return updated;
    }
  },
};

export const matchApi = {
  async getMatches(donationId: string): Promise<any[]> {
    try {
      const res = await request<{ success: boolean; matches: any[] }>(`/api/matches/${donationId}`);
      return res.matches;
    } catch {
      return appStore.getMatchesForDonation(donationId);
    }
  },

  async acceptMatch(donationId: string, ngoId: string, ngoName: string): Promise<FoodDonation> {
    try {
      const res = await request<{ success: boolean; donation: FoodDonation }>(`/api/matches/${donationId}/accept`, {
        method: 'POST',
        body: JSON.stringify({ ngo_id: ngoId, ngo_name: ngoName }),
      });
      appStore.updateDonationLocal(res.donation);
      return res.donation;
    } catch {
      const d = appStore.acceptMatch(donationId, ngoId, ngoName);
      if (!d) throw new Error('Failed to accept match');
      return d;
    }
  },
};

export const pickupApi = {
  async assignVolunteer(donationId: string, volunteerId: string, volunteerName: string): Promise<FoodDonation> {
    try {
      const res = await request<{ success: boolean; donation: FoodDonation }>('/api/pickups', {
        method: 'POST',
        body: JSON.stringify({ donation_id: donationId, volunteer_id: volunteerId, volunteer_name: volunteerName }),
      });
      appStore.updateDonationLocal(res.donation);
      return res.donation;
    } catch {
      const d = appStore.assignVolunteer(donationId, volunteerId, volunteerName);
      if (!d) throw new Error('Failed to assign volunteer');
      return d;
    }
  },

  async updatePickupStatus(donationId: string, status: string, otpEntered?: string): Promise<{ success: boolean; donation?: FoodDonation; message: string }> {
    try {
      const res = await request<{ success: boolean; donation: FoodDonation; message: string }>(`/api/pickups/${donationId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, entered_otp: otpEntered }),
      });
      if (res.donation) {
        appStore.updateDonationLocal(res.donation);
      }
      return res;
    } catch (e: any) {
      // Fallback to local store verification
      return appStore.updatePickupStatus(donationId, status as any, otpEntered);
    }
  },
};

export const safetyApi = {
  async submitSafetyCheck(payload: any): Promise<any> {
    try {
      return await request('/api/safety-check', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      return { success: true, status: 'VERIFIED', safety_id: `sc-local-${Date.now()}` };
    }
  },
};

export const needsApi = {
  async getNeeds(): Promise<CommunityNeed[]> {
    try {
      const res = await request<{ success: boolean; needs: CommunityNeed[] }>('/api/needs');
      return res.needs;
    } catch {
      return appStore.getCommunityNeeds();
    }
  },

  async createNeed(needData: Partial<CommunityNeed>): Promise<CommunityNeed> {
    try {
      const res = await request<{ success: boolean; need: CommunityNeed }>('/api/needs', {
        method: 'POST',
        body: JSON.stringify(needData),
      });
      appStore.injectNeed(res.need);
      return res.need;
    } catch {
      return appStore.createCommunityNeed(needData);
    }
  },
};

export const notificationApi = {
  async getNotifications(userId?: string): Promise<AppNotification[]> {
    try {
      const query = userId ? `?user_id=${userId}` : '';
      const res = await request<{ success: boolean; notifications: AppNotification[] }>(`/api/notifications${query}`);
      return res.notifications;
    } catch {
      return appStore.getNotifications();
    }
  },

  async markRead(id: string): Promise<boolean> {
    try {
      await request(`/api/notifications/${id}/read`, { method: 'PUT' });
      appStore.markNotificationAsRead(id);
      return true;
    } catch {
      appStore.markNotificationAsRead(id);
      return true;
    }
  },

  async markAllRead(userId?: string): Promise<void> {
    try {
      await request('/api/notifications/read-all', { method: 'PUT', body: JSON.stringify({ user_id: userId }) });
      appStore.markAllNotificationsAsRead();
    } catch {
      appStore.markAllNotificationsAsRead();
    }
  },
};

export const auditApi = {
  async getAuditLogs(): Promise<AuditEvent[]> {
    try {
      const res = await request<{ success: boolean; logs: AuditEvent[] }>('/api/audit');
      return res.logs;
    } catch {
      return appStore.getAuditLogs();
    }
  },
};

export const analyticsApi = {
  async getAnalytics(): Promise<PlatformAnalytics> {
    try {
      const res = await request<{ success: boolean; analytics: PlatformAnalytics }>('/api/analytics');
      return res.analytics;
    } catch {
      return appStore.getAnalytics();
    }
  },
};

export const adminApi = {
  async resetDemo(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await request<{ success: boolean; message: string }>('/api/admin/reset', { method: 'POST' });
      appStore.resetDemoData();
      return res;
    } catch {
      appStore.resetDemoData();
      return { success: true, message: 'Demo data reset locally.' };
    }
  },

  async getHealth(): Promise<any> {
    try {
      return await request('/api/health');
    } catch {
      return { status: 'ONLINE', mode: 'CLIENT_FALLBACK' };
    }
  },
};

// --- Reactive Application Store ---
class AppStore {
  private users: User[];
  private currentUser: User;
  private donations: FoodDonation[];
  private organizations: Organization[];
  private volunteers: Volunteer[];
  private notifications: AppNotification[];
  private needs: CommunityNeed[];
  private auditLogs: AuditEvent[];
  private analytics: PlatformAnalytics;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.users = this.loadFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.organizations = this.loadFromStorage(STORAGE_KEYS.ORGANIZATIONS, INITIAL_ORGANIZATIONS);
    this.volunteers = this.loadFromStorage(STORAGE_KEYS.VOLUNTEERS, INITIAL_VOLUNTEERS);
    this.donations = this.loadFromStorage(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS);
    this.notifications = this.loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    this.needs = this.loadFromStorage(STORAGE_KEYS.NEEDS, [
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
        description: 'Nutritious dinner for resident children.',
      },
    ]);
    this.auditLogs = this.loadFromStorage(STORAGE_KEYS.AUDIT, [
      {
        id: 'audit-init-1',
        timestamp: new Date().toISOString(),
        actor: 'FoodBridge AI Core Engine',
        role: 'system',
        action: 'SYSTEM_BOOT',
        entity: 'System',
        entity_id: 'engine-1',
        status: 'SUCCESS',
        details: 'Persistent database initialized with SDG 2 verification workflows.',
      },
    ]);
    this.analytics = this.loadFromStorage(STORAGE_KEYS.ANALYTICS, INITIAL_ANALYTICS);

    // Initial currentUser
    const storedUser = this.loadFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    this.currentUser = storedUser || this.users[0];

    // Background sync with server if available
    this.syncFromServer();
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private saveToStorage<T>(key: string, data: T) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private async syncFromServer() {
    try {
      const [donations, users, volunteers, needs, notifications] = await Promise.all([
        donationApi.getDonations().catch(() => null),
        authApi.getUsers().catch(() => null),
        request<{ success: boolean; volunteers: Volunteer[] }>('/api/volunteers').then((r) => r.volunteers).catch(() => null),
        needsApi.getNeeds().catch(() => null),
        notificationApi.getNotifications().catch(() => null),
      ]);

      let changed = false;
      if (donations && donations.length > 0) {
        this.donations = donations;
        this.saveToStorage(STORAGE_KEYS.DONATIONS, this.donations);
        changed = true;
      }
      if (users && users.length > 0) {
        this.users = users;
        this.saveToStorage(STORAGE_KEYS.USERS, this.users);
        changed = true;
      }
      if (volunteers && volunteers.length > 0) {
        this.volunteers = volunteers;
        this.saveToStorage(STORAGE_KEYS.VOLUNTEERS, this.volunteers);
        changed = true;
      }
      if (needs && needs.length > 0) {
        this.needs = needs;
        this.saveToStorage(STORAGE_KEYS.NEEDS, this.needs);
        changed = true;
      }
      if (notifications && notifications.length > 0) {
        this.notifications = notifications;
        this.saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
        changed = true;
      }
      if (changed) {
        this.notify();
      }
    } catch {
      // Network silent fail, use local storage
    }
  }

  // --- Auth & User ---
  public getCurrentUser(): User {
    return this.currentUser;
  }

  public setCurrentUser(user: User) {
    this.currentUser = user;
    this.saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
    this.notify();
  }

  public switchUserByRole(role: UserRole) {
    const matched = this.users.find((u) => u.role === role);
    if (matched) {
      this.setCurrentUser(matched);
    }
  }

  public getUsers(): User[] {
    return this.users;
  }

  public addUser(userData: Partial<User>): User {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name || 'Community Member',
      email: userData.email || `user_${Date.now()}@foodbridge.org`,
      phone: userData.phone || '+91 98221 00000',
      role: userData.role || 'donor',
      organization: userData.organization || userData.name,
      address: userData.address || 'Kolhapur, Maharashtra',
      latitude: userData.latitude || 16.705,
      longitude: userData.longitude || 74.243,
      verified: true,
      created_at: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.saveToStorage(STORAGE_KEYS.USERS, this.users);
    this.notify();
    return newUser;
  }

  // --- Donations ---
  public getDonations(): FoodDonation[] {
    return this.donations;
  }

  public getDonationById(id: string): FoodDonation | undefined {
    return this.donations.find((d) => d.id === id);
  }

  public injectDonation(donation: FoodDonation) {
    const idx = this.donations.findIndex((d) => d.id === donation.id);
    if (idx >= 0) {
      this.donations[idx] = donation;
    } else {
      this.donations.unshift(donation);
    }
    this.saveToStorage(STORAGE_KEYS.DONATIONS, this.donations);
    this.notify();
  }

  public updateDonationLocal(donation: FoodDonation) {
    this.injectDonation(donation);
  }

  public createDonation(donationData: Partial<FoodDonation>): FoodDonation {
    const id = `don-${Date.now()}`;
    const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const nowIso = new Date().toISOString();
    const meals = estimateMeals(donationData.quantity || 50, donationData.unit || 'Meals');

    const scoreBreakdown = calculateFoodRescueScore({
      expiryTimeIso: donationData.expiry_time || new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
      distanceKm: 0.8,
      quantityMeals: meals,
      hasMatchingDemand: true,
      safetyStatus: donationData.safety_status || 'DECLARED',
    });

    const newDonation: FoodDonation = {
      id,
      donor_id: donationData.donor_id || this.currentUser.id,
      donor_name: donationData.donor_name || this.currentUser.name,
      food_name: donationData.food_name || 'Fresh Cooked Meals',
      food_category: donationData.food_category || 'Cooked Meal',
      food_type: donationData.food_type || 'Vegetarian',
      quantity: donationData.quantity || 50,
      unit: donationData.unit || 'Meals',
      preparation_time: donationData.preparation_time || nowIso,
      expiry_time: donationData.expiry_time || new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
      dietary_label: donationData.dietary_label || `${donationData.food_type || 'Vegetarian'} · Prepared Fresh`,
      description: donationData.description || 'Surplus safe meal donation.',
      image: donationData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      latitude: donationData.latitude || this.currentUser.latitude || 16.7042,
      longitude: donationData.longitude || this.currentUser.longitude || 74.2441,
      pickup_address: donationData.pickup_address || this.currentUser.address,
      status: 'PUBLISHED',
      safety_status: donationData.safety_status || 'DECLARED',
      urgency: donationData.urgency || 'High',
      priority_level: scoreBreakdown.priorityLabel === 'CRITICAL PRIORITY' ? 'CRITICAL' : 'HIGH',
      estimated_meals: meals,
      estimated_shelf_life_hours: donationData.estimated_shelf_life_hours || 4,
      recommended_pickup_window: donationData.recommended_pickup_window || 'Within 90 minutes',
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
          actor: donationData.donor_name || this.currentUser.name,
          details: `Published ${donationData.quantity} ${donationData.unit} of ${donationData.food_name}. Rescue Score: ${scoreBreakdown.totalScore}/100.`,
          status: 'COMPLETED',
        },
      ],
      created_at: nowIso,
    };

    this.donations.unshift(newDonation);
    this.saveToStorage(STORAGE_KEYS.DONATIONS, this.donations);

    // Update analytics
    this.analytics.meals_rescued += meals;
    const kg = convertToKg(newDonation.quantity, newDonation.unit);
    this.analytics.food_diverted_kg += Math.round(kg);
    this.analytics.co2e_avoided_kg = calculateCO2eAvoided(this.analytics.food_diverted_kg);
    this.analytics.active_donations_count = this.donations.filter((d) => d.status !== 'COMPLETED' && d.status !== 'EXPIRED').length;
    this.saveToStorage(STORAGE_KEYS.ANALYTICS, this.analytics);

    // Trigger notification
    this.addNotification({
      user_id: 'all',
      title: '🚨 New Surplus Food Batch Nearby',
      message: `${newDonation.donor_name} published ${newDonation.quantity} ${newDonation.unit} of ${newDonation.food_name}. Food Rescue Score: ${scoreBreakdown.totalScore}/100.`,
      type: 'URGENT',
      link_tab: 'ngo',
      link_id: newDonation.id,
    });

    this.logAuditEvent({
      actor: newDonation.donor_name,
      role: 'donor',
      action: 'DONATION_CREATED',
      entity: 'FoodDonation',
      entity_id: newDonation.id,
      status: 'SUCCESS',
      details: `Created donation ${newDonation.food_name}. Food Rescue Score: ${scoreBreakdown.totalScore}/100.`,
    });

    this.notify();
    return newDonation;
  }

  public updateDonation(id: string, updates: Partial<FoodDonation>): FoodDonation | undefined {
    const index = this.donations.findIndex((d) => d.id === id);
    if (index === -1) return undefined;

    this.donations[index] = { ...this.donations[index], ...updates };
    this.saveToStorage(STORAGE_KEYS.DONATIONS, this.donations);
    this.notify();
    return this.donations[index];
  }

  public deleteDonation(id: string) {
    this.donations = this.donations.filter((d) => d.id !== id);
    this.saveToStorage(STORAGE_KEYS.DONATIONS, this.donations);
    this.notify();
  }

  // --- NGOs & Matching ---
  public getOrganizations(): Organization[] {
    return this.organizations;
  }

  public getMatchesForDonation(donationId: string): (MatchRecommendation & { reasons: string[] })[] {
    const donation = this.getDonationById(donationId);
    if (!donation) return [];

    return this.organizations
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

        const reasons: string[] = [];
        if (distanceKm <= 1.5) reasons.push(`Hyper-local proximity (${distanceKm} km away)`);
        else reasons.push(`${distanceKm} km transit corridor`);

        if (org.required_food_types.includes(donation.food_type)) {
          reasons.push(`Direct dietary match: accepts ${donation.food_type}`);
        }
        if (org.capacity >= donation.estimated_meals) {
          reasons.push(`Sufficient capacity (Serves ${org.capacity} people)`);
        }
        if (org.verified) reasons.push('Verified partner organization');

        return {
          id: `match-${donation.id}-${org.id}`,
          donation_id: donation.id,
          organization_id: org.id,
          organization_name: org.name,
          organization_type: org.type,
          distance_km: distanceKm,
          food_compatibility_score: scoring.compatibilityScore,
          distance_score: scoring.distanceScore,
          urgency_score: scoring.urgencyScore,
          capacity_score: scoring.capacityScore,
          verification_score: scoring.verificationScore,
          match_score: scoring.totalScore,
          status: 'PENDING' as const,
          created_at: new Date().toISOString(),
          reasons,
        };
      })
      .sort((a, b) => b.match_score - a.match_score);
  }

  public acceptMatch(donationId: string, orgId: string, orgName: string): FoodDonation | undefined {
    const donation = this.getDonationById(donationId);
    if (!donation) return undefined;

    donation.status = 'ACCEPTED';
    donation.assigned_ngo_id = orgId;
    donation.assigned_ngo_name = orgName;

    if (!donation.custody_ledger) donation.custody_ledger = [];
    donation.custody_ledger.push({
      id: `cust-${donationId}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'NGO_ACCEPTED',
      actor: orgName,
      details: `${orgName} accepted surplus allocation. Volunteer courier requested.`,
      status: 'COMPLETED',
    });

    this.saveToStorage(STORAGE_KEYS.DONATIONS, this.donations);

    this.addNotification({
      user_id: 'all',
      title: '✅ Allocation Accepted',
      message: `${orgName} accepted donation of ${donation.food_name}. Ready for volunteer courier dispatch.`,
      type: 'SUCCESS',
      link_tab: 'volunteer',
      link_id: donation.id,
    });

    this.notify();
    return donation;
  }

  // --- Volunteers & Pickups ---
  public getVolunteers(): Volunteer[] {
    return this.volunteers;
  }

  public assignVolunteer(donationId: string, volunteerId: string, volunteerName: string): FoodDonation | undefined {
    const donation = this.getDonationById(donationId);
    if (!donation) return undefined;

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

    this.saveToStorage(STORAGE_KEYS.DONATIONS, this.donations);

    this.addNotification({
      user_id: donation.donor_id,
      title: '🚴 Volunteer Dispatched',
      message: `${volunteerName} is en route to collect ${donation.food_name}. Have your Pickup OTP ready (${donation.pickup_otp}).`,
      type: 'INFO',
      link_tab: 'donor',
      link_id: donation.id,
    });

    this.notify();
    return donation;
  }

  public updatePickupStatus(
    donationId: string,
    status: 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED',
    enteredOtp?: string
  ): { success: boolean; message: string; donation?: FoodDonation } {
    const donation = this.getDonationById(donationId);
    if (!donation) return { success: false, message: 'Donation not found' };

    if (status === 'PICKED_UP') {
      if (enteredOtp && donation.pickup_otp && enteredOtp.trim() !== donation.pickup_otp.trim()) {
        return { success: false, message: `Invalid Pickup OTP code '${enteredOtp}'. Ask the donor kitchen supervisor.` };
      }
    } else if (status === 'DELIVERED' || status === 'COMPLETED') {
      if (enteredOtp && donation.delivery_otp && enteredOtp.trim() !== donation.delivery_otp.trim()) {
        return { success: false, message: `Invalid Delivery OTP code '${enteredOtp}'. Ask the recipient shelter supervisor.` };
      }
    }

    donation.status = status;

    if (!donation.custody_ledger) donation.custody_ledger = [];
    donation.custody_ledger.push({
      id: `cust-${donationId}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: status,
      actor: donation.assigned_volunteer_name || 'Volunteer Courier',
      details: `Status advanced to ${status}. Digital custody verified.`,
      status: 'COMPLETED',
    });

    if (status === 'COMPLETED' || status === 'DELIVERED') {
      this.analytics.successful_deliveries += 1;
      this.analytics.people_served += donation.estimated_meals;
      this.saveToStorage(STORAGE_KEYS.ANALYTICS, this.analytics);

      const vol = this.volunteers.find((v) => v.id === donation.assigned_volunteer_id);
      if (vol) {
        vol.completed_pickups += 1;
        if (vol.completed_pickups >= 10 && !vol.badges.includes('Food Hero')) {
          vol.badges.push('Food Hero');
        }
        if (vol.completed_pickups >= 25 && !vol.badges.includes('Community Champion')) {
          vol.badges.push('Community Champion');
        }
        this.saveToStorage(STORAGE_KEYS.VOLUNTEERS, this.volunteers);
      }
    }

    this.saveToStorage(STORAGE_KEYS.DONATIONS, this.donations);
    this.notify();
    return { success: true, message: `Status advanced to ${status}`, donation };
  }

  public confirmPickupWithOtp(donationId: string, enteredOtp: string) {
    return this.updatePickupStatus(donationId, 'PICKED_UP', enteredOtp);
  }

  public confirmDeliveryWithOtp(donationId: string, enteredOtp: string) {
    return this.updatePickupStatus(donationId, 'COMPLETED', enteredOtp);
  }

  public submitSafetyCheck(donationId: string, safetyCheck: FoodSafetyCheck) {
    const donation = this.getDonationById(donationId);
    if (donation) {
      donation.safety_check = safetyCheck;
      donation.safety_status = 'VERIFIED';
      this.saveToStorage(STORAGE_KEYS.DONATIONS, this.donations);
      this.notify();
    }
  }

  public switchRole(role: UserRole) {
    this.switchUserByRole(role);
  }

  public createOrganizationNeedRequest(params: {
    orgId: string;
    foodCategory: FoodCategory;
    peopleCount: number;
    urgency: 'Low' | 'Medium' | 'High' | 'Critical';
    description: string;
  }) {
    const org = this.organizations.find((o) => o.id === params.orgId);
    return this.createCommunityNeed({
      ngo_id: params.orgId,
      ngo_name: org?.name || 'Community Shelter',
      food_type: 'Vegetarian',
      category: params.foodCategory,
      quantity_portions: params.peopleCount,
      urgency: params.urgency,
      description: params.description,
    });
  }

  // --- Community Needs ---
  public getCommunityNeeds(): CommunityNeed[] {
    return this.needs;
  }

  public injectNeed(need: CommunityNeed) {
    this.needs.unshift(need);
    this.saveToStorage(STORAGE_KEYS.NEEDS, this.needs);
    this.notify();
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
    this.needs.unshift(newNeed);
    this.saveToStorage(STORAGE_KEYS.NEEDS, this.needs);
    this.notify();
    return newNeed;
  }

  // --- Notifications ---
  public getNotifications(): AppNotification[] {
    return this.notifications;
  }

  public addNotification(notification: Omit<AppNotification, 'id' | 'created_at' | 'read_status'>) {
    const newNotif: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      read_status: false,
      created_at: 'Just now',
    };
    this.notifications.unshift(newNotif);
    this.saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public markNotificationAsRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read_status = true;
      this.saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
      this.notify();
    }
  }

  public markAllNotificationsAsRead() {
    this.notifications.forEach((n) => (n.read_status = true));
    this.saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditEvent[] {
    return this.auditLogs;
  }

  public logAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>) {
    const newEvent: AuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...event,
    };
    this.auditLogs.unshift(newEvent);
    if (this.auditLogs.length > 100) this.auditLogs = this.auditLogs.slice(0, 100);
    this.saveToStorage(STORAGE_KEYS.AUDIT, this.auditLogs);
    this.notify();
  }

  // --- Analytics ---
  public getAnalytics(): PlatformAnalytics {
    return this.analytics;
  }

  // --- Volunteer Offline Cache Sync ---
  public syncVolunteerOfflineCache(volunteerIdOrName: string) {
    const assigned = this.donations.filter(
      (d) =>
        (d.assigned_volunteer_id === volunteerIdOrName ||
          d.assigned_volunteer_name === volunteerIdOrName) &&
        d.status !== 'EXPIRED'
    );

    const cachedPickups = assigned.map((d) => {
      const org = this.organizations.find((o) => o.id === d.assigned_ngo_id);
      return {
        donationId: d.id,
        foodName: d.food_name,
        foodCategory: d.food_category,
        foodType: d.food_type,
        quantity: d.quantity,
        unit: d.unit,
        estimatedMeals: d.estimated_meals || 0,
        status: d.status,
        priorityLevel: d.priority_level,
        donorName: d.donor_name,
        donorPhone: '+91 98221 44550',
        pickupAddress: d.pickup_address,
        donorLatitude: d.latitude,
        donorLongitude: d.longitude,
        shelterName: d.assigned_ngo_name || org?.name || 'Partner Shelter',
        shelterAddress: org?.address || 'Community Shelter Enclave',
        shelterPhone: org?.phone || '+91 98220 77112',
        shelterLatitude: org?.latitude,
        shelterLongitude: org?.longitude,
        recommendedPickupWindow: d.recommended_pickup_window,
        expiryTime: d.expiry_time,
        pickupOtp: d.pickup_otp,
        deliveryOtp: d.delivery_otp,
        dietaryLabel: d.dietary_label,
        description: d.description,
        cachedAt: new Date().toISOString(),
      };
    });

    try {
      localStorage.setItem('foodbridge_volunteer_offline_pickups_v1', JSON.stringify(cachedPickups));
      localStorage.setItem('foodbridge_offline_last_sync_v1', new Date().toISOString());
    } catch (e) {
      console.warn('Failed to sync offline pickups to localStorage', e);
    }
  }

  // --- Demo Reset ---
  public resetDemoData() {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.DONATIONS);
    localStorage.removeItem(STORAGE_KEYS.ORGANIZATIONS);
    localStorage.removeItem(STORAGE_KEYS.VOLUNTEERS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.NEEDS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT);
    localStorage.removeItem(STORAGE_KEYS.ANALYTICS);

    this.users = [...INITIAL_USERS];
    this.currentUser = this.users[0];
    this.organizations = [...INITIAL_ORGANIZATIONS];
    this.volunteers = [...INITIAL_VOLUNTEERS];
    this.donations = [...INITIAL_DONATIONS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.analytics = { ...INITIAL_ANALYTICS };

    this.notify();
  }
}

export const appStore = new AppStore();
