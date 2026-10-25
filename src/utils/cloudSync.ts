/**
 * Real-time Cross-Device Synchronization for RT Lab Rewards
 * Connects patient devices with lab management in real-time.
 * When a patient claims a prize, it broadcasts instantly so the doctor's screen chimes and updates.
 */

import { PrizeClaimBooking } from '../types';

export const CLOUD_SYNC_TOPIC = 'rt_lab_claims_official_201100874444';
const NTFY_BASE_URL = 'https://ntfy.sh';

/**
 * Broadcast a new prize claim / booking to the lab's cloud synchronization channel
 */
export async function broadcastClaimToCloud(claim: PrizeClaimBooking): Promise<boolean> {
  try {
    const response = await fetch(`${NTFY_BASE_URL}/${CLOUD_SYNC_TOPIC}`, {
      method: 'POST',
      headers: {
        'Title': `حجز جائزة جديد: ${claim.patientName} (${claim.prizeValue})`,
        'Priority': 'urgent',
        'Tags': 'hospital,tada,bell',
      },
      body: JSON.stringify(claim),
    });
    return response.ok;
  } catch (error) {
    console.error('Error broadcasting claim to cloud sync:', error);
    return false;
  }
}

/**
 * Fetch recent claims published to the cloud topic
 */
export async function fetchRecentClaimsFromCloud(): Promise<PrizeClaimBooking[]> {
  try {
    const response = await fetch(`${NTFY_BASE_URL}/${CLOUD_SYNC_TOPIC}/json?poll=1`);
    if (!response.ok) return [];

    const text = await response.text();
    const lines = text.trim().split('\n');
    const claims: PrizeClaimBooking[] = [];

    for (const line of lines) {
      if (!line) continue;
      try {
        const item = JSON.parse(line);
        if (item.message) {
          const parsed = typeof item.message === 'string' ? JSON.parse(item.message) : item.message;
          if (parsed && parsed.patientName && parsed.couponCode) {
            claims.push(parsed);
          }
        }
      } catch {
        // ignore non-json or system lines
      }
    }
    return claims;
  } catch (error) {
    console.error('Error polling cloud claims:', error);
    return [];
  }
}

/**
 * Subscribe to real-time claims stream via Server-Sent Events (SSE)
 * Calls onNewClaim whenever ANY patient anywhere submits a prize booking.
 */
export function subscribeToCloudClaims(
  onNewClaim: (claim: PrizeClaimBooking) => void,
  onStatusChange?: (isConnected: boolean) => void
): () => void {
  if (typeof window === 'undefined' || !('EventSource' in window)) {
    return () => {};
  }

  let eventSource: EventSource | null = null;
  let isClosed = false;

  const connect = () => {
    if (isClosed) return;
    try {
      eventSource = new EventSource(`${NTFY_BASE_URL}/${CLOUD_SYNC_TOPIC}/sse`);

      eventSource.onopen = () => {
        onStatusChange?.(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.event === 'message' && data.message) {
            const parsed = typeof data.message === 'string' ? JSON.parse(data.message) : data.message;
            if (parsed && parsed.patientName && parsed.couponCode) {
              onNewClaim(parsed);
            }
          }
        } catch (err) {
          console.error('Error parsing SSE message:', err);
        }
      };

      eventSource.onerror = () => {
        onStatusChange?.(false);
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        // Auto-reconnect after 6 seconds
        if (!isClosed) {
          setTimeout(connect, 6000);
        }
      };
    } catch {
      onStatusChange?.(false);
    }
  };

  connect();

  return () => {
    isClosed = true;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    onStatusChange?.(false);
  };
}
