/**
 * Real-time Cross-Device Synchronization for RT Lab Rewards
 * Connects patient devices with lab management in real-time.
 * When a patient claims a prize, it broadcasts instantly so the doctor's screen chimes and updates.
 */

import { PrizeClaimBooking } from '../types';

export const CLOUD_SYNC_TOPIC = 'rt_lab_claims_official_201100874444';
const NTFY_BASE_URL = 'https://ntfy.sh';

// Set of processed claim IDs to avoid duplicate chimes
const seenClaimIds = new Set<string>();

/**
 * Broadcast a new prize claim / booking to the lab's cloud synchronization channel
 * Uses UTF-8 safe JSON payload so no ByteString header errors occur in any browser.
 */
export async function broadcastClaimToCloud(claim: PrizeClaimBooking): Promise<boolean> {
  let isSuccess = false;

  // 1. Mark as locally seen so we don't chime on our own immediate local broadcast
  if (claim.id) {
    seenClaimIds.add(claim.id);
  }

  // 2. Broadcast via Local BroadcastChannel (immediate cross-tab on same device)
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('rt_lab_claims_channel');
      bc.postMessage({ type: 'NEW_CLAIM', claim, timestamp: Date.now() });
      setTimeout(() => bc.close(), 100);
    }
  } catch (err) {
    console.debug('BroadcastChannel error:', err);
  }

  // 3. Broadcast via LocalStorage event (for older browsers / same origin tabs)
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rt_lab_last_claim_broadcast', JSON.stringify({ claim, timestamp: Date.now() }));
    }
  } catch {}

  // 4. Broadcast via Backend Express API if reachable (/api/claims)
  try {
    const apiPromise = fetch('/api/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claim),
    });
    // Race with a 3 second timeout
    const timeout = new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));
    const apiRes = await Promise.race([apiPromise, timeout]);
    if (apiRes.ok) {
      isSuccess = true;
    }
  } catch {
    // Expected on static GitHub Pages hosting
  }

  // 5. Broadcast to global Cloud Sync Topic (ntfy.sh) using standard JSON body (UTF-8 safe)
  try {
    const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://ramimokhtar228-maker.github.io/rt-lab-rewards/';
    const ntfyPayload = {
      topic: CLOUD_SYNC_TOPIC,
      title: `🚨 حجز جائزة جديد: ${claim.patientName} (${claim.prizeValue})`,
      message: JSON.stringify(claim),
      priority: 5,
      tags: ['hospital', 'tada', 'bell'],
      actions: [
        {
          action: 'view',
          label: 'عرض التذكرة والرد على المريض',
          url: appUrl,
        },
      ],
    };

    const ntfyRes = await fetch(`${NTFY_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ntfyPayload),
    });

    if (ntfyRes.ok) {
      isSuccess = true;
      console.log(`[RT-Cloud-Sync] ✅ Claim broadcasted successfully to topic "${CLOUD_SYNC_TOPIC}"`);
    } else {
      console.warn(`[RT-Cloud-Sync] ntfy returned status ${ntfyRes.status}`);
    }
  } catch (error) {
    console.error('[RT-Cloud-Sync] Error broadcasting claim to ntfy:', error);
  }

  return isSuccess;
}

/**
 * Fetch recent claims published to the cloud topic and local server
 */
export async function fetchRecentClaimsFromCloud(): Promise<PrizeClaimBooking[]> {
  const claimsMap = new Map<string, PrizeClaimBooking>();

  // 1. Try local server API (/api/claims)
  try {
    const res = await fetch('/api/claims');
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.claims)) {
        data.claims.forEach((c: PrizeClaimBooking) => {
          if (c && c.id && c.patientName) {
            claimsMap.set(c.id, c);
          }
        });
      }
    }
  } catch {
    // Static hosting fallback
  }

  // 2. Fetch from cloud topic (ntfy.sh)
  try {
    const response = await fetch(`${NTFY_BASE_URL}/${CLOUD_SYNC_TOPIC}/json?poll=1&since=24h`);
    if (response.ok) {
      const text = await response.text();
      const lines = text.trim().split('\n');

      for (const line of lines) {
        if (!line) continue;
        try {
          const item = JSON.parse(line);
          if (item.message) {
            const parsed = typeof item.message === 'string' ? JSON.parse(item.message) : item.message;
            if (parsed && parsed.patientName && (parsed.couponCode || parsed.prizeTitle || parsed.id)) {
              const claimId = parsed.id || `claim_${parsed.couponCode}`;
              claimsMap.set(claimId, { ...parsed, id: claimId });
            }
          }
        } catch {
          // ignore non-json system ping lines
        }
      }
    }
  } catch (error) {
    console.debug('[RT-Cloud-Sync] Error polling cloud claims:', error);
  }

  return Array.from(claimsMap.values());
}

/**
 * Subscribe to real-time claims stream via:
 * 1. Global Cloud Server-Sent Events (SSE on ntfy.sh)
 * 2. Express SSE (/api/events) when available
 * 3. Cross-Tab BroadcastChannel
 * 4. LocalStorage storage event
 * 5. Periodic polling fallback every 12 seconds
 * 
 * Calls onNewClaim whenever ANY patient anywhere submits a prize booking.
 */
export function subscribeToCloudClaims(
  onNewClaim: (claim: PrizeClaimBooking) => void,
  onStatusChange?: (isConnected: boolean) => void
): () => void {
  let isClosed = false;
  let ntfyEventSource: EventSource | null = null;
  let serverEventSource: EventSource | null = null;
  let broadcastChannel: BroadcastChannel | null = null;
  let pollInterval: ReturnType<typeof setInterval> | null = null;

  const handleIncomingClaim = (claim: PrizeClaimBooking) => {
    if (!claim || !claim.patientName) return;
    const key = claim.id || `${claim.patientName}_${claim.couponCode}`;
    if (seenClaimIds.has(key)) {
      return; // Already processed
    }
    seenClaimIds.add(key);
    onNewClaim(claim);
  };

  // 1. Connect to ntfy SSE
  const connectNtfySSE = () => {
    if (isClosed || typeof window === 'undefined' || !('EventSource' in window)) return;
    try {
      ntfyEventSource = new EventSource(`${NTFY_BASE_URL}/${CLOUD_SYNC_TOPIC}/sse`);

      ntfyEventSource.onopen = () => {
        onStatusChange?.(true);
      };

      ntfyEventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.event === 'message' && data.message) {
            const parsed = typeof data.message === 'string' ? JSON.parse(data.message) : data.message;
            if (parsed && parsed.patientName) {
              handleIncomingClaim(parsed);
            }
          }
        } catch (err) {
          console.debug('[RT-Cloud-Sync] Error parsing SSE message:', err);
        }
      };

      ntfyEventSource.onerror = () => {
        onStatusChange?.(false);
        if (ntfyEventSource) {
          ntfyEventSource.close();
          ntfyEventSource = null;
        }
        if (!isClosed) {
          setTimeout(connectNtfySSE, 5000);
        }
      };
    } catch {
      onStatusChange?.(false);
    }
  };

  // 2. Connect to Server SSE (/api/events) if backend is running
  const connectServerSSE = () => {
    if (isClosed || typeof window === 'undefined' || !('EventSource' in window)) return;
    try {
      serverEventSource = new EventSource('/api/events');
      serverEventSource.addEventListener('message', (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload && (payload.type === 'claim:new' || payload.type === 'claim:updated')) {
            handleIncomingClaim(payload.data);
          }
        } catch {}
      });
      serverEventSource.onerror = () => {
        if (serverEventSource) {
          serverEventSource.close();
          serverEventSource = null;
        }
      };
    } catch {}
  };

  // 3. Connect to Cross-Tab BroadcastChannel
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      broadcastChannel = new BroadcastChannel('rt_lab_claims_channel');
      broadcastChannel.onmessage = (ev) => {
        if (ev.data && ev.data.type === 'NEW_CLAIM' && ev.data.claim) {
          handleIncomingClaim(ev.data.claim);
        }
      };
    }
  } catch {}

  // 4. Storage event listener for cross-tab communication
  const handleStorageEvent = (ev: StorageEvent) => {
    if (ev.key === 'rt_lab_last_claim_broadcast' && ev.newValue) {
      try {
        const item = JSON.parse(ev.newValue);
        if (item && item.claim) {
          handleIncomingClaim(item.claim);
        }
      } catch {}
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageEvent);
  }

  // 5. Periodic polling fallback every 12 seconds
  const runPoll = async () => {
    if (isClosed) return;
    try {
      const recent = await fetchRecentClaimsFromCloud();
      recent.forEach((claim) => {
        const key = claim.id || `${claim.patientName}_${claim.couponCode}`;
        if (!seenClaimIds.has(key)) {
          // If we haven't seen this claim yet, notify
          seenClaimIds.add(key);
          onNewClaim(claim);
        }
      });
    } catch {}
  };

  // Start all connections
  connectNtfySSE();
  connectServerSSE();
  pollInterval = setInterval(runPoll, 12000);

  // Initial poll after 1 second
  setTimeout(runPoll, 1200);

  return () => {
    isClosed = true;
    if (ntfyEventSource) {
      ntfyEventSource.close();
      ntfyEventSource = null;
    }
    if (serverEventSource) {
      serverEventSource.close();
      serverEventSource = null;
    }
    if (broadcastChannel) {
      broadcastChannel.close();
      broadcastChannel = null;
    }
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageEvent);
    }
    onStatusChange?.(false);
  };
}
