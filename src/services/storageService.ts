import { initialPrizes, initialQuizQuestions, initialSettings, prizeIdeasVault } from '../data/initialData';
import { LabSettings, PatientClaim, Prize, PrizeIdea, QuizQuestion } from '../types';

const STORAGE_KEYS = {
  PRIZES: 'rt_lab_prizes_v1',
  SETTINGS: 'rt_lab_settings_v1',
  CLAIMS: 'rt_lab_claims_v1',
  QUIZ: 'rt_lab_quiz_v1',
  IDEAS: 'rt_lab_ideas_v1',
  DAILY_ATTEMPT: 'rt_lab_daily_attempt_v1',
};

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
    return { ...initialSettings, ...JSON.parse(raw) };
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

// Check if user played today (to promote daily retention)
export const checkCanPlayToday = (): { canPlay: boolean; lastPlayedDate?: string } => {
  try {
    const lastPlayed = localStorage.getItem(STORAGE_KEYS.DAILY_ATTEMPT);
    const today = new Date().toISOString().split('T')[0];
    if (lastPlayed === today) {
      return { canPlay: false, lastPlayedDate: lastPlayed };
    }
    return { canPlay: true };
  } catch {
    return { canPlay: true };
  }
};

export const recordPlayToday = () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(STORAGE_KEYS.DAILY_ATTEMPT, today);
  } catch (err) {
    console.error('Failed to record attempt', err);
  }
};

export const resetPlayToday = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.DAILY_ATTEMPT);
  } catch (err) {
    console.error('Failed to reset attempt', err);
  }
};

// Build WhatsApp activation URL
export const buildWhatsAppUrl = (
  whatsappNumber: string,
  claim: PatientClaim,
  labName: string
): string => {
  // Clean phone number (remove +, spaces, leading 0 if starting with international code)
  let cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  if (cleanNumber.startsWith('0')) {
    // assume Egypt (20) if starts with 01
    cleanNumber = '20' + cleanNumber.substring(1);
  }

  const messageText = `مرحباً ${labName}،
أود تفعيل كود الخصم والمكافأة الخاصة بي التي حصلت عليها من مسابقات معامل RT:

📋 *بيانات المريض:*
• الاسم: ${claim.patientName}
• الهاتف: ${claim.phone}
• الفرع المفضل: ${claim.branch}

🎁 *تفاصيل الجائزة:*
• الجائزة: ${claim.prizeTitle} (${claim.discountValue})
• كود الكوبون: *${claim.couponCode}*
• تاريخ الاستحقاق: ${claim.createdAt}
• ينتهي في: ${claim.expiresAt}

برجاء تأكيد الحجز وتفعيل الكوبون في ملف المريض. شكراً لكم!`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;
};
