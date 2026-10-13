import { initialBranches, initialPrizes, initialQuizQuestions, initialSettings, prizeIdeasVault } from '../data/initialData';
import { Branch, LabSettings, PatientClaim, Prize, PrizeIdea, QuizQuestion } from '../types';

export const GITHUB_SYNC_CONFIG = {
  OWNER: 'ramimokhtar228-maker',
  REPO: 'rt-lab-rewards',
  CONFIG_PATH: 'public/rt-lab-config.json',
  DEFAULT_TOKEN: '',
};

const STORAGE_KEYS = {
  PRIZES: 'rt_lab_prizes_v4_live',
  SETTINGS: 'rt_lab_settings_v4_live',
  CLAIMS: 'rt_lab_claims_v4_live',
  QUIZ: 'rt_lab_quiz_v4_live',
  LAST_PLAY_TIME: 'rt_lab_last_play_time_v4_live',
  ACTIVE_COUPON: 'rt_lab_active_coupon_v4_live',
  LAST_SYNC_TIME: 'rt_lab_last_sync_timestamp',
};

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

// Helper to detect outdated dummy data from early templates
function isOutdatedDummySettings(settings: Partial<LabSettings>): boolean {
  if (!settings) return true;
  const num = (settings.whatsappNumber || '').replace(/\D/g, '');
  if (num === '201099887766' || num === '01011223344' || settings.hotline === '16900') {
    return true;
  }
  if (Array.isArray(settings.branches)) {
    const hasDummyBranch = settings.branches.some(
      (b) => b.name?.includes('المهندسين') && b.phone === '01011223344'
    );
    if (hasDummyBranch) return true;
  }
  return false;
}

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
    // Check v4 key first
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!isOutdatedDummySettings(parsed)) {
        let branches = parsed.branches;
        if (!Array.isArray(branches) || branches.length === 0 || typeof branches[0] === 'string') {
          branches = initialBranches;
        }
        return { ...initialSettings, ...parsed, branches };
      }
    }

    // Auto-migrate or clean: use fresh official settings
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSettings));
    return initialSettings;
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

// Build WhatsApp activation URL with explicit 24h validity notice and clean Egyptian WhatsApp format
export const buildWhatsAppUrl = (
  whatsappNumber: string,
  claim: PatientClaim,
  labName: string,
  slogan: string = 'التشخيص الصحيح يبدأ معنا'
): string => {
  let cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '20' + cleanNumber.substring(1);
  } else if (!cleanNumber.startsWith('20') && cleanNumber.length === 10) {
    cleanNumber = '20' + cleanNumber;
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

// Fetch live remote configuration from GitHub / static file
export async function fetchRemoteConfig(): Promise<{ settings: LabSettings; branches: Branch[] } | null> {
  const sources = [
    `./rt-lab-config.json?v=${Date.now()}`,
    `https://raw.githubusercontent.com/${GITHUB_SYNC_CONFIG.OWNER}/${GITHUB_SYNC_CONFIG.REPO}/main/public/rt-lab-config.json?v=${Date.now()}`,
    `https://raw.githubusercontent.com/${GITHUB_SYNC_CONFIG.OWNER}/${GITHUB_SYNC_CONFIG.REPO}/gh-pages/rt-lab-config.json?v=${Date.now()}`,
  ];

  for (const src of sources) {
    try {
      const res = await fetch(src, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.settings) {
          const branches = Array.isArray(data.branches) && data.branches.length > 0 ? data.branches : initialBranches;
          const mergedSettings: LabSettings = {
            ...initialSettings,
            ...data.settings,
            branches,
          };
          // Save to local storage
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(mergedSettings));
          return { settings: mergedSettings, branches };
        }
      }
    } catch {
      // Continue to next source
    }
  }
  return null;
}

// Publish updated config directly to GitHub so all patients' browsers receive it immediately
export async function syncConfigToGitHub(
  settings: LabSettings,
  token?: string
): Promise<{ success: boolean; message: string }> {
  const effectiveToken = token || localStorage.getItem('rt_github_token') || '';
  if (!effectiveToken) {
    return { success: false, message: 'يرجى إدخال رمز GitHub Access Token لإتمام المزامنة السحابية' };
  }
  const payload = {
    updatedAt: new Date().toISOString(),
    settings: {
      labNameAr: settings.labNameAr,
      sloganAr: settings.sloganAr,
      labSubtitleAr: settings.labSubtitleAr,
      labNameEn: settings.labNameEn,
      whatsappNumber: settings.whatsappNumber,
      hotline: settings.hotline,
      adminPin: settings.adminPin,
      couponValidityHours: settings.couponValidityHours || 24,
      autoOpenWhatsApp: settings.autoOpenWhatsApp ?? true,
      termsAndConditions: settings.termsAndConditions || initialSettings.termsAndConditions,
    },
    branches: settings.branches || initialBranches,
  };

  const fileContentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload, null, 2))));
  const targetBranches = ['main', 'gh-pages'];
  const results: string[] = [];

  for (const branch of targetBranches) {
    const targetPath = branch === 'gh-pages' ? 'rt-lab-config.json' : 'public/rt-lab-config.json';
    try {
      const url = `https://api.github.com/repos/${GITHUB_SYNC_CONFIG.OWNER}/${GITHUB_SYNC_CONFIG.REPO}/contents/${targetPath}?ref=${branch}`;
      // Get current sha if file exists
      let sha: string | undefined;
      const getRes = await fetch(url, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      if (getRes.ok) {
        const data = await getRes.json();
        sha = data.sha;
      }

      // Update or create file
      const putRes = await fetch(`https://api.github.com/repos/${GITHUB_SYNC_CONFIG.OWNER}/${GITHUB_SYNC_CONFIG.REPO}/contents/${targetPath}`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `chore: live sync lab branches, phones & whatsapp (${new Date().toLocaleDateString('ar-EG')})`,
          content: fileContentBase64,
          branch,
          ...(sha ? { sha } : {}),
        }),
      });

      if (putRes.ok) {
        results.push(`فرع ${branch}: تم التحديث بنجاح`);
      } else {
        const errData = await putRes.json().catch(() => ({}));
        results.push(`فرع ${branch}: ${errData.message || 'خطأ'}`);
      }
    } catch (e: any) {
      results.push(`فرع ${branch}: ${e.message || 'فشل الاتصال'}`);
    }
  }

  // Also update local storage
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

  return {
    success: results.some((r) => r.includes('تم التحديث بنجاح')),
    message: results.join(' | '),
  };
}
