import { initialBranches, initialPrizes, initialQuizQuestions, initialSettings, prizeIdeasVault } from '../data/initialData';
import { Branch, LabSettings, PatientClaim, Prize, PrizeIdea, QuizQuestion } from '../types';

const STORAGE_KEYS = {
  PRIZES: 'rt_lab_prizes_v2',
  SETTINGS: 'rt_lab_settings_v2',
  CLAIMS: 'rt_lab_claims_v2',
  QUIZ: 'rt_lab_quiz_v2',
  LAST_PLAY_TIME: 'rt_lab_last_play_time_v2',
  ACTIVE_COUPON: 'rt_lab_active_coupon_v2',
};

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export const getPrizes = (): Prize[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRIZES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(initialPrizes));
      return initialPrizes;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialPrizes;
  } catch {
    return initialPrizes;
  }
};

export const savePrizes = (prizes: Prize[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(prizes));
  } catch (err) {
    console.error('Failed to save prizes', err);
  }
};

export const getSettings = (): LabSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSettings));
      return initialSettings;
    }
    const parsed = JSON.parse(raw);
    // Ensure branches is an array of Branch objects
    let branches = parsed.branches;
    if (!Array.isArray(branches) || branches.length === 0 || typeof branches[0] === 'string') {
      branches = initialBranches;
    }
    return { ...initialSettings, ...parsed, branches };
  } catch {
    return initialSettings;
  }
};

export const saveSettings = (settings: LabSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
};

export const getClaims = (): PatientClaim[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLAIMS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveClaim = (claim: PatientClaim) => {
  try {
    const existing = getClaims();
    const updated = [claim, ...existing];
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save claim', err);
    return [];
  }
};

export const updateClaimStatus = (id: string, status: PatientClaim['status']) => {
  try {
    const claims = getClaims().map((c) => (c.id === id ? { ...c, status } : c));
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims));
    return claims;
  } catch (err) {
    console.error('Failed to update claim status', err);
    return getClaims();
  }
};

export const deleteClaim = (id: string) => {
  try {
    const claims = getClaims().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims));
    return claims;
  } catch (err) {
    console.error('Failed to delete claim', err);
    return getClaims();
  }
};

export const getQuizQuestions = (): QuizQuestion[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZ);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.QUIZ, JSON.stringify(initialQuizQuestions));
      return initialQuizQuestions;
    }
    return JSON.parse(raw);
  } catch {
    return initialQuizQuestions;
  }
};

export const getPrizeIdeas = (): PrizeIdea[] => {
  return prizeIdeasVault;
};

// Generate unique coupon voucher code
export const generateCouponCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const year = new Date().getFullYear();
  return `RT-${year}-${rand}`;
};

// 24-Hour Restriction Engine
export interface PlayRestrictionStatus {
  canPlay: boolean;
  remainingMs: number;
  remainingHours: number;
  remainingMinutes: number;
  remainingSeconds: number;
  activeCoupon: PatientClaim | null;
}

export const check24HourRestriction = (): PlayRestrictionStatus => {
  try {
    const lastPlayRaw = localStorage.getItem(STORAGE_KEYS.LAST_PLAY_TIME);
    if (!lastPlayRaw) {
      return {
        canPlay: true,
        remainingMs: 0,
        remainingHours: 0,
        remainingMinutes: 0,
        remainingSeconds: 0,
        activeCoupon: null,
      };
    }

    const lastPlayTime = parseInt(lastPlayRaw, 10);
    const now = Date.now();
    const elapsed = now - lastPlayTime;

    if (elapsed >= TWENTY_FOUR_HOURS_MS) {
      // 24 hours have passed! Expire old coupon and permit new play
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_COUPON);
      return {
        canPlay: true,
        remainingMs: 0,
        remainingHours: 0,
        remainingMinutes: 0,
        remainingSeconds: 0,
        activeCoupon: null,
      };
    }

    // Inside 24-hour lockout window
    const remainingMs = TWENTY_FOUR_HOURS_MS - elapsed;
    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const remainingSeconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

    let activeCoupon: PatientClaim | null = null;
    const activeRaw = localStorage.getItem(STORAGE_KEYS.ACTIVE_COUPON);
    if (activeRaw) {
      try {
        activeCoupon = JSON.parse(activeRaw);
      } catch {
        // ignore
      }
    }

    return {
      canPlay: false,
      remainingMs,
      remainingHours,
      remainingMinutes,
      remainingSeconds,
      activeCoupon,
    };
  } catch {
    return {
      canPlay: true,
      remainingMs: 0,
      remainingHours: 0,
      remainingMinutes: 0,
      remainingSeconds: 0,
      activeCoupon: null,
    };
  }
};

export const recordPlaySession = (claim: PatientClaim) => {
  try {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEYS.LAST_PLAY_TIME, now.toString());
    localStorage.setItem(STORAGE_KEYS.ACTIVE_COUPON, JSON.stringify(claim));
  } catch (err) {
    console.error('Failed to record play session', err);
  }
};

export const resetPlaySessionAdmin = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.LAST_PLAY_TIME);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_COUPON);
  } catch (err) {
    console.error('Failed to reset session', err);
  }
};

// Build WhatsApp activation URL with explicit 24h validity notice
export const buildWhatsAppUrl = (
  whatsappNumber: string,
  claim: PatientClaim,
  labName: string,
  slogan: string = 'التشخيص الصحيح يبدأ معنا'
): string => {
  let cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '20' + cleanNumber.substring(1);
  }

  const messageText = `مرحباً ${labName} (${slogan})،
أود تفعيل كود الخصم والمكافأة الخاصة بي التي حصلت عليها من مسابقات معامل RT:

📋 *بيانات المريض:*
• الاسم: ${claim.patientName}
• الهاتف: ${claim.phone}
• الفرع المفضل: ${claim.branch}

🎁 *تفاصيل الجائزة:*
• الجائزة: ${claim.prizeTitle} (${claim.discountValue})
• كود الكوبون: *${claim.couponCode}*
• تاريخ المكسب: ${claim.createdAt}
• ينتهي الكوبون في: ${claim.expiresAt} (صلاحية 24 ساعة فقط)

⚠️ *ملاحظة:* يرجى تأكيد الحجز خلال 24 ساعة قبل انتهاء صلاحية الكوبون. شكراً لكم!`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;
};
