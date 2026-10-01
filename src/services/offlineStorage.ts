export interface OfflineCachedPickup {
  donationId: string;
  foodName: string;
  foodCategory: string;
  foodType: string;
  quantity: number;
  unit: string;
  estimatedMeals: number;
  status: string;
  priorityLevel: string;
  donorName: string;
  donorPhone?: string;
  pickupAddress: string;
  donorLatitude: number;
  donorLongitude: number;
  shelterName: string;
  shelterAddress?: string;
  shelterPhone?: string;
  shelterLatitude?: number;
  shelterLongitude?: number;
  recommendedPickupWindow: string;
  expiryTime: string;
  pickupOtp?: string; // Stored securely for offline verification reference if available
  deliveryOtp?: string;
  dietaryLabel?: string;
  description?: string;
  cachedAt: string; // ISO timestamp
  offlineActionQueue?: {
    action: 'CONFIRM_PICKUP' | 'CONFIRM_DELIVERY' | 'SAFETY_CHECK';
    payload: any;
    queuedAt: string;
  }[];
}

const OFFLINE_PICKUPS_KEY = 'foodbridge_volunteer_offline_pickups_v1';
const OFFLINE_QUEUE_KEY = 'foodbridge_volunteer_offline_queue_v1';
const OFFLINE_SYNC_TIMESTAMP_KEY = 'foodbridge_offline_last_sync_v1';

export class OfflineStorageManager {
  /**
   * Save or update assigned pickup missions for offline access
   */
  public static cacheAssignedPickups(pickups: OfflineCachedPickup[]): void {
    try {
      localStorage.setItem(OFFLINE_PICKUPS_KEY, JSON.stringify(pickups));
      localStorage.setItem(OFFLINE_SYNC_TIMESTAMP_KEY, new Date().toISOString());
    } catch (e) {
      console.warn('Failed to cache pickups for offline access in localStorage', e);
    }
  }

  /**
   * Retrieve cached pickup missions for offline viewing
   */
  public static getCachedPickups(): OfflineCachedPickup[] {
    try {
      const data = localStorage.getItem(OFFLINE_PICKUPS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Check if a specific pickup is in the offline cache
   */
  public static getCachedPickupById(donationId: string): OfflineCachedPickup | undefined {
    const list = this.getCachedPickups();
    return list.find((p) => p.donationId === donationId);
  }

  /**
   * Get timestamp of the last local cache sync
   */
  public static getLastSyncTime(): string | null {
    try {
      return localStorage.getItem(OFFLINE_SYNC_TIMESTAMP_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Queue an action taken while offline (e.g. OTP entered, checklist checked)
   */
  public static enqueueOfflineAction(action: {
    donationId: string;
    action: 'CONFIRM_PICKUP' | 'CONFIRM_DELIVERY' | 'SAFETY_CHECK';
    payload: any;
  }): void {
    try {
      const existingQueue = this.getQueuedActions();
      existingQueue.push({
        ...action,
        id: `offline-act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        queuedAt: new Date().toISOString(),
      });
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(existingQueue));
    } catch (e) {
      console.warn('Failed to enqueue offline action', e);
    }
  }

  /**
   * Get queued actions waiting for network reconnection
   */
  public static getQueuedActions(): Array<{
    id: string;
    donationId: string;
    action: 'CONFIRM_PICKUP' | 'CONFIRM_DELIVERY' | 'SAFETY_CHECK';
    payload: any;
    queuedAt: string;
  }> {
    try {
      const data = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Clear processed actions from the queue
   */
  public static clearQueuedActions(): void {
    try {
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
    } catch (e) {
      console.warn('Failed to clear offline queue', e);
    }
  }
}
