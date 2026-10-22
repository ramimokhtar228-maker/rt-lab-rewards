/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PrizeClaimBooking, SampleCollector } from '../types';
import { alertSoundManager } from './audioAlert';

type SyncStatus = 'connected' | 'connecting' | 'offline';

type EventListener = (event: { type: string; data: any }) => void;

const CLOUD_SYNC_TOPIC = 'rt_lab_claims_hub_ramimokhtar228';
const CLOUD_SSE_URL = `https://ntfy.sh/${CLOUD_SYNC_TOPIC}/sse`;
const CLOUD_POST_URL = `https://ntfy.sh/${CLOUD_SYNC_TOPIC}`;

class RealtimeSyncManager {
  private localEventSource: EventSource | null = null;
  private cloudEventSource: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<EventListener> = new Set();
  private status: SyncStatus = 'offline';
  private reconnectTimer: any = null;
  private statusListeners: Set<(status: SyncStatus) => void> = new Set();
  private isMuted: boolean = false;
  private seenEventKeys: Set<string> = new Set();

  constructor() {
    this.initBroadcastChannel();
    this.connectLocalSSE();
    this.connectCloudRelay();
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
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.localEventSource.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed && parsed.type) {
            this.handleIncomingEvent(parsed.type, parsed.data, 'local-sse');
          }
        } catch {
          // ignore non-json
        }
      };

      this.localEventSource.onerror = () => {
        if (this.localEventSource) {
          this.localEventSource.close();
          this.localEventSource = null;
        }
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connectLocalSSE();
          }, 5000);
        }
      };
    } catch {
      // Local server might not be available on static host
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

  private handleIncomingEvent(type: string, data: any, source: string) {
    // Deduplication key
    const eventKey = `${type}_${data?.id || ''}_${data?.createdAt || ''}_${data?.status || ''}`;
    if (this.seenEventKeys.has(eventKey)) {
      return;
    }
    this.seenEventKeys.add(eventKey);
    // Limit memory
    if (this.seenEventKeys.size > 200) {
      const arr = Array.from(this.seenEventKeys);
      this.seenEventKeys = new Set(arr.slice(50));
    }

    // If incoming event is a new claim booking -> "تسمع عندي"
    if (type === 'claim:new') {
      const claim = data as PrizeClaimBooking;
      if (!this.isMuted) {
        alertSoundManager.playIncomingAlert();
        alertSoundManager.showSystemNotification(`🚨 حجز مريض وجامع جديد!`, {
          body: `المريض: ${claim.patientName} | فني السحب: ${claim.collectorName || 'غير محدد'} | الجائزة: ${claim.prizeTitle}`,
        });
      }
    }

    // If received from server or cloud, broadcast to other tabs on same device
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
   * Post new claim booking to server & cloud relay -> notify all devices
   */
  public async submitClaim(
    claimData: Omit<PrizeClaimBooking, 'id' | 'createdAt' | 'status'>
  ): Promise<PrizeClaimBooking> {
    const localClaim: PrizeClaimBooking = {
      ...claimData,
      id: 'clm_' + Date.now(),
      createdAt: new Date().toLocaleDateString('ar-EG'),
      status: 'pending',
      syncedAt: new Date().toISOString(),
    };

    // 1. Post to Cloud Relay (works everywhere including GitHub Pages!)
    try {
      fetch(CLOUD_POST_URL, {
        method: 'POST',
        headers: { 'Title': 'RT Lab New Claim' },
        body: JSON.stringify({ type: 'claim:new', data: localClaim }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    // 2. Post to Local/Full-Stack backend server
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localClaim),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.claim) {
          this.broadcastLocally('claim:new', json.claim);
          return json.claim;
        }
      }
    } catch {
      // server offline
    }

    this.broadcastLocally('claim:new', localClaim);
    return localClaim;
  }

  /**
   * Update claim status across devices
   */
  public async updateClaimStatus(id: string, status: PrizeClaimBooking['status']): Promise<void> {
    try {
      fetch(CLOUD_POST_URL, {
        method: 'POST',
        headers: { 'Title': 'RT Lab Claim Updated' },
        body: JSON.stringify({ type: 'claim:updated', data: { id, status } }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    try {
      await fetch(`/api/claims/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch {
      // offline
    }
    this.broadcastLocally('claim:updated', { id, status });
  }

  /**
   * Delete claim
   */
  public async deleteClaim(id: string): Promise<void> {
    try {
      fetch(CLOUD_POST_URL, {
        method: 'POST',
        headers: { 'Title': 'RT Lab Claim Deleted' },
        body: JSON.stringify({ type: 'claim:deleted', data: { id } }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    try {
      await fetch(`/api/claims/${id}`, { method: 'DELETE' });
    } catch {
      // offline
    }
    this.broadcastLocally('claim:deleted', { id });
  }

  /**
   * Fetch latest claims from server
   */
  public async fetchClaims(): Promise<PrizeClaimBooking[] | null> {
    try {
      const res = await fetch('/api/claims');
      if (res.ok) {
        const json = await res.json();
        return json.claims || [];
      }
    } catch {
      // offline
    }
    return null;
  }

  /**
   * Fetch collectors from server
   */
  public async fetchCollectors(): Promise<SampleCollector[] | null> {
    try {
      const res = await fetch('/api/collectors');
      if (res.ok) {
        const json = await res.json();
        return json.collectors || [];
      }
    } catch {
      // offline
    }
    return null;
  }

  /**
   * Save or update collector on server & cloud
   */
  public async saveCollector(collector: Partial<SampleCollector>): Promise<void> {
    try {
      fetch(CLOUD_POST_URL, {
        method: 'POST',
        headers: { 'Title': 'RT Lab Collector Updated' },
        body: JSON.stringify({ type: 'collector:updated', data: collector }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    try {
      await fetch('/api/collectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collector),
      });
    } catch {
      // offline
    }
    this.broadcastLocally('collector:updated', collector);
  }

  /**
   * Delete collector on server
   */
  public async deleteCollector(id: string): Promise<void> {
    try {
      await fetch(`/api/collectors/${id}`, { method: 'DELETE' });
    } catch {
      // offline
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
   * Send test alert chime and notification
   */
  public triggerTestAlert() {
    alertSoundManager.playIncomingAlert();
    this.handleIncomingEvent(
      'claim:new',
      {
        id: 'test_' + Date.now(),
        patientName: 'مريض تجريبي للتأكد من التزامن وسماع الصوت',
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
      },
      'local'
    );
  }
}

export const realtimeSync = new RealtimeSyncManager();
