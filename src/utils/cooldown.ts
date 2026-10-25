/**
 * 12-Hour Cooldown & Fair Play Manager for RT Lab Games
 * Enforces that every client can play each game once every 12 hours.
 */

export const COOLDOWN_12_HOURS_MS = 12 * 60 * 60 * 1000;

export type GameType = 'wheel' | 'scratch' | 'quiz';

const COOLDOWN_KEYS: Record<GameType, string> = {
  wheel: 'rt_lab_last_wheel_spin_ts_v3',
  scratch: 'rt_lab_last_scratch_ts_v3',
  quiz: 'rt_lab_last_quiz_ts_v3',
};

/**
 * Format remaining milliseconds into Arabic readable time:
 * e.g. "11 ساعة و 45 دقيقة" or "05:42:19"
 */
export function formatRemainingTime(ms: number): {
  hours: number;
  minutes: number;
  seconds: number;
  digital: string;
  arabicLabel: string;
} {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const digital = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  let arabicLabel = '';
  if (hours > 0) {
    arabicLabel = `${hours} ساعة و ${minutes} دقيقة`;
  } else if (minutes > 0) {
    arabicLabel = `${minutes} دقيقة و ${seconds} ثانية`;
  } else {
    arabicLabel = `${seconds} ثانية`;
  }

  return { hours, minutes, seconds, digital, arabicLabel };
}

/**
 * Checks if the client is allowed to play the specified game under the 12-hour fair play rule.
 */
export function checkGameCooldown(game: GameType): {
  allowed: boolean;
  remainingMs: number;
  lastPlayedTs: number;
  nextAllowedTs: number;
  formatted: ReturnType<typeof formatRemainingTime>;
} {
  if (typeof window === 'undefined') {
    return {
      allowed: true,
      remainingMs: 0,
      lastPlayedTs: 0,
      nextAllowedTs: 0,
      formatted: formatRemainingTime(0),
    };
  }

  try {
    const raw = localStorage.getItem(COOLDOWN_KEYS[game]);
    const lastPlayedTs = raw ? parseInt(raw, 10) : 0;
    if (!lastPlayedTs || isNaN(lastPlayedTs)) {
      return {
        allowed: true,
        remainingMs: 0,
        lastPlayedTs: 0,
        nextAllowedTs: 0,
        formatted: formatRemainingTime(0),
      };
    }

    const elapsed = Date.now() - lastPlayedTs;
    const remainingMs = Math.max(0, COOLDOWN_12_HOURS_MS - elapsed);
    const allowed = remainingMs <= 0;
    const nextAllowedTs = lastPlayedTs + COOLDOWN_12_HOURS_MS;

    return {
      allowed,
      remainingMs,
      lastPlayedTs,
      nextAllowedTs,
      formatted: formatRemainingTime(remainingMs),
    };
  } catch {
    return {
      allowed: true,
      remainingMs: 0,
      lastPlayedTs: 0,
      nextAllowedTs: 0,
      formatted: formatRemainingTime(0),
    };
  }
}

/**
 * Records that a client played the game now, locking it for the next 12 hours.
 */
export function recordGamePlayed(game: GameType): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COOLDOWN_KEYS[game], Date.now().toString());
    // Dispatch a storage event so all components update in real-time
    window.dispatchEvent(new CustomEvent('rt_lab_cooldown_updated', { detail: { game } }));
  } catch (err) {
    console.error('Failed to record game cooldown:', err);
  }
}

/**
 * Admin override to reset all 12-hour cooldowns for testing.
 */
export function resetAllCooldowns(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(COOLDOWN_KEYS.wheel);
    localStorage.removeItem(COOLDOWN_KEYS.scratch);
    localStorage.removeItem(COOLDOWN_KEYS.quiz);
    window.dispatchEvent(new CustomEvent('rt_lab_cooldown_updated', { detail: { all: true } }));
  } catch (err) {
    console.error('Failed to reset cooldowns:', err);
  }
}
