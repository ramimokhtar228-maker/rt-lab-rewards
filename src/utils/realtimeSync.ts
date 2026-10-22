/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PrizeClaimBooking, SampleCollector } from '../types';
import { alertSoundManager } from './audioAlert';
import {
  fetchCloudDatabase,
  saveClaimToCloud,
  updateClaimStatusInCloud,
  deleteClaimFromCloud,
  saveCollectorToCloud,
  deleteCollectorFromCloud,
  CloudDatabaseState,
} from './cloudDatabase';

export type SyncStatus = 'connected' | 'connecting' | 'offline';
type EventListener = (event: { type: string; data: any }) => void;

// Real-time Cloud Topic on public SSE relay for instant zero-config multi-device wake up
const CLOUD_SYNC_TOPIC = 'rt_lab_claims_hub_ramimokhtar228';
const CLOUD_SSE_URL = `https://ntfy.sh/${CLOUD_SYNC_TOPIC}/sse`;
const CLOUD_POST_URL = `https://ntfy.sh/${CLOUD_SYNC_TOPIC}`;

class RealtimeSyncManager {
  private localEventSource: EventSource | null = null;
  private cloudEventSource: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<EventListener> = new Set();
  private status: SyncStatus = 'offline';
  private statusListeners: Set<(status: SyncStatus) => void> = new Set();
  private isMuted: boolean = false;
  private seenClaimIds: Set<string> = new Set();
  private pollInterval: any = null;

  constructor() {
    this.initBroadcastChannel();
    this.connectLocalSSE();
    this.connectCloudRelay();
    this.startCloudPolling();
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('rt_lab_sync_hub');
        this.broadcastChannel.onmessage = (ev) => {
          if (ev.data && ev.data.type) {
            this.handleIncomingEvent(ev.data.type, ev.data.data, 'broadcast');
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel not supported:', err);
      }
    }
  }

  public connectLocalSSE() {
    if (typeof window === 'undefined') return;
    if (this.localEventSource) {
      this.localEventSource.close();
      this.localEventSource = null;
    }

    try {
      this.localEventSource = new EventSource('/api/events');
      this.localEventSource.onopen = () => {
        this.setStatus('connected');
      };
      this.localEventSource.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed && parsed.type) {
            this.handleIncomingEvent(parsed.type, parsed.data, 'server');
          }
        } catch {
          // ignore
        }
      };
      this.localEventSource.onerror = () => {
        if (this.status !== 'connected') {
          this.setStatus('connecting');
        }
      };
    } catch {
      // ignore
    }
  }

  public connectCloudRelay() {
    if (typeof window === 'undefined') return;
    if (this.cloudEventSource) {
      this.cloudEventSource.close();
      this.cloudEventSource = null;
    }

    try {
      this.cloudEventSource = new EventSource(CLOUD_SSE_URL);
      this.cloudEventSource.onopen = () => {
        this.setStatus('connected');
      };
      this.cloudEventSource.onmessage = (e) => {
        try {
          const raw = JSON.parse(e.data);
          if (raw && raw.message) {
            const parsed = JSON.parse(raw.message);
            if (parsed && parsed.type) {
              this.handleIncomingEvent(parsed.type, parsed.data, 'cloud-relay');
            }
          }
        } catch {
          // ignore
        }
      };
      this.cloudEventSource.onerror = () => {
        setTimeout(() => this.connectCloudRelay(), 7000);
      };
    } catch {
      // ignore
    }
  }

  /**
   * Heartbeat Cloud Polling (every 10s) to guarantee zero loss of claims even on static GitHub Pages
   */
  private startCloudPolling() {
    if (typeof window === 'undefined') return;
    // Initial fetch
    this.pollCloudDatabase();

    // Recurring check every 10 seconds
    this.pollInterval = setInterval(() => {
      this.pollCloudDatabase();
    }, 10000);
  }

  public async pollCloudDatabase(): Promise<CloudDatabaseState | null> {
    try {
      const db = await fetchCloudDatabase();
      if (db && db.claims && Array.isArray(db.claims)) {
        this.setStatus('connected');
        // Check for new claims that this client hasn't registered yet
        const newIncoming: PrizeClaimBooking[] = [];
        db.claims.forEach((claim) => {
          if (!this.seenClaimIds.has(claim.id)) {
            // First time seeing this claim
            this.seenClaimIds.add(claim.id);
            // If it's a recent pending claim, consider it incoming alert
            if (claim.status === 'pending') {
              newIncoming.push(claim);
            }
          }
        });

        // Notify UI listeners of full synchronized state
        this.listeners.forEach((listener) => {
          listener({
            type: 'sync:init',
            data: {
              claims: db.claims,
              collectors: db.collectors || [],
              patients: db.patients || [],
            },
          });
        });

        // If there is an unseen pending claim, ring the alarm and trigger banner
        if (newIncoming.length > 0 && this.seenClaimIds.size > newIncoming.length) {
          const latest = newIncoming[0];
          this.triggerAlertForClaim(latest);
        }

        return db;
      }
    } catch (err) {
      console.warn('Polling error:', err);
    }
    return null;
  }

  private setStatus(newStatus: SyncStatus) {
    this.status = newStatus;
    this.statusListeners.forEach((fn) => fn(newStatus));
  }

  public getStatus(): SyncStatus {
    return this.status;
  }

  public onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => this.statusListeners.delete(callback);
  }

  public addEventListener(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  private triggerAlertForClaim(claim: PrizeClaimBooking) {
    if (!this.isMuted) {
      alertSoundManager.playIncomingAlert();
      alertSoundManager.showSystemNotification(`🚨 حجز مريض ومكافأة جديدة!`, {
        body: `المريض: ${claim.patientName} | الهاتف: ${claim.patientPhone} | الجائزة: ${claim.prizeTitle}`,
      });
    }
    // Dispatch to registered UI listeners
    this.listeners.forEach((listener) => {
      listener({ type: 'claim:new', data: claim });
    });
  }

  private handleIncomingEvent(type: string, data: any, source: string) {
    // If incoming event is a new claim booking -> "تسمع عندي"
    if (type === 'claim:new') {
      const claim = data as PrizeClaimBooking;
      if (claim && claim.id) {
        const isAlreadySeen = this.seenClaimIds.has(claim.id);
        this.seenClaimIds.add(claim.id);

        if (!isAlreadySeen) {
          this.triggerAlertForClaim(claim);
        }
      }
    }

    // Broadcast locally to other browser tabs
    if (source !== 'broadcast' && this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type, data });
      } catch {
        // ignore
      }
    }

    // Dispatch to registered UI listeners
    this.listeners.forEach((listener) => {
      try {
        listener({ type, data });
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    });
  }

  /**
   * Submit new claim: Saves directly to Cloud Database (GitHub API + Server) & broadcasts
   */
  public async submitClaim(
    claimData: Omit<PrizeClaimBooking, 'id' | 'createdAt' | 'status'>
  ): Promise<PrizeClaimBooking> {
    const claimId = 'clm_' + Date.now();
    const localClaim: PrizeClaimBooking = {
      ...claimData,
      id: claimId,
      createdAt: new Date().toLocaleDateString('ar-EG'),
      status: 'pending',
      syncedAt: new Date().toISOString(),
    };

    this.seenClaimIds.add(claimId);

    // 1. Commit to Cloud Database (GitHub API + local server)
    const saved = await saveClaimToCloud(localClaim);

    // 2. Broadcast via Cloud Relay (ntfy.sh) for instant device wake-up
    try {
      fetch(CLOUD_POST_URL, {
        method: 'POST',
        headers: { Title: 'RT Lab New Claim' },
        body: JSON.stringify({ type: 'claim:new', data: saved }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    this.broadcastLocally('claim:new', saved);
    return saved;
  }

  /**
   * Update claim status across devices & cloud
   */
  public async updateClaimStatus(
    id: string,
    status: PrizeClaimBooking['status'],
    notes?: string
  ): Promise<void> {
    await updateClaimStatusInCloud(id, status, notes);

    try {
      fetch(CLOUD_POST_URL, {
        method: 'POST',
        headers: { Title: 'RT Lab Claim Updated' },
        body: JSON.stringify({ type: 'claim:updated', data: { id, status, notes } }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    this.broadcastLocally('claim:updated', { id, status, notes });
  }

  /**
   * Delete claim
   */
  public async deleteClaim(id: string): Promise<void> {
    await deleteClaimFromCloud(id);

    try {
      fetch(CLOUD_POST_URL, {
        method: 'POST',
        headers: { Title: 'RT Lab Claim Deleted' },
        body: JSON.stringify({ type: 'claim:deleted', data: { id } }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    this.broadcastLocally('claim:deleted', { id });
  }

  /**
   * Fetch latest claims from cloud database
   */
  public async fetchClaims(): Promise<PrizeClaimBooking[] | null> {
    const db = await fetchCloudDatabase();
    if (db && db.claims) {
      db.claims.forEach((c) => this.seenClaimIds.add(c.id));
      return db.claims;
    }
    return null;
  }

  /**
   * Fetch collectors from cloud database
   */
  public async fetchCollectors(): Promise<SampleCollector[] | null> {
    const db = await fetchCloudDatabase();
    if (db && db.collectors) {
      return db.collectors;
    }
    return null;
  }

  /**
   * Save or update collector in cloud database
   */
  public async saveCollector(collector: Partial<SampleCollector>): Promise<void> {
    await saveCollectorToCloud(collector);

    try {
      fetch(CLOUD_POST_URL, {
        method: 'POST',
        headers: { Title: 'RT Lab Collector Updated' },
        body: JSON.stringify({ type: 'collector:updated', data: collector }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    this.broadcastLocally('collector:updated', collector);
  }

  /**
   * Delete collector from cloud database
   */
  public async deleteCollector(id: string): Promise<void> {
    await deleteCollectorFromCloud(id);

    try {
      fetch(CLOUD_POST_URL, {
        method: 'POST',
        headers: { Title: 'RT Lab Collector Deleted' },
        body: JSON.stringify({ type: 'collector:deleted', data: { id } }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    this.broadcastLocally('collector:deleted', { id });
  }

  private broadcastLocally(type: string, data: any) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type, data });
      } catch {
        // ignore
      }
    }
    this.handleIncomingEvent(type, data, 'local');
  }

  /**
   * Test alert chime and incoming notification trigger
   */
  public triggerTestAlert() {
    alertSoundManager.playIncomingAlert();
    const testClaim: PrizeClaimBooking = {
      id: 'test_' + Date.now(),
      patientName: 'مريض تجريبي للتأكد من التزامن وسماع الصوت 🔔',
      patientPhone: '01100046841',
      address: 'ميدان بهتيم، شبرا الخيمة',
      serviceType: 'home_visit',
      preferredTime: 'صباحاً (10:00 ص)',
      couponCode: 'RT-ALERT-TEST',
      prizeTitle: 'تجربة جرس التنبيه وتزامن الجامع 🔔',
      prizeValue: 'مجاني 100%',
      points: 250,
      collectorId: 'col_aya',
      collectorName: 'أ. آية أحمد (مسؤولة التنسيق)',
      collectorPhone: '01278967133',
      collectorWhatsApp: '201116979431',
      createdAt: new Date().toLocaleDateString('ar-EG'),
      status: 'pending',
    };
    this.handleIncomingEvent('claim:new', testClaim, 'local');
  }
}

export const realtimeSync = new RealtimeSyncManager();
