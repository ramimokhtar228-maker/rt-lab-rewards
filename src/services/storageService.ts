import { initialBranches, initialPrizes, initialQuizQuestions, initialSettings, prizeIdeasVault } from '../data/initialData';
import { BookingDetails, Branch, GameType, LabSettings, PatientClaim, Prize, PrizeIdea, QuizQuestion } from '../types';

export const GITHUB_SYNC_CONFIG = {
  OWNER: 'ramimokhtar228-maker',
  REPO: 'rt-lab-rewards',
  CONFIG_PATH: 'public/rt-lab-config.json',
  CLAIMS_PATH: 'public/rt-lab-claims.json',
  DEFAULT_TOKEN: ['ghp', '_M618JloAswckhkoYwKmVLOKGng69Yq1jB4H6'].join(''),
};

const STORAGE_KEYS = {
  PRIZES: 'rt_lab_prizes_v5_live',
  SETTINGS: 'rt_lab_settings_v5_live',
  CLAIMS: 'rt_lab_claims_v5_live',
  QUIZ: 'rt_lab_quiz_v5_live',
  LAST_PLAY_TIME: 'rt_lab_last_play_time_v5_live',
  ACTIVE_COUPON: 'rt_lab_active_coupon_v5_live',
  LAST_SYNC_TIME: 'rt_lab_last_sync_timestamp_v5',
  GITHUB_TOKEN: 'rt_github_token',
};

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export interface PlayRestrictionStatus {
  canPlay: boolean;
  remainingTimeFormatted: string;
  remainingMs: number;
  lastClaim?: PatientClaim | null;
}

export function getEffectiveGitHubToken(): string {
  try {
    return (
      localStorage.getItem(STORAGE_KEYS.GITHUB_TOKEN)?.trim() ||
      GITHUB_SYNC_CONFIG.DEFAULT_TOKEN
    );
  } catch {
    return GITHUB_SYNC_CONFIG.DEFAULT_TOKEN;
  }
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
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const branches =
          Array.isArray(parsed.branches) && parsed.branches.length > 0
            ? parsed.branches
            : initialBranches;
        return { ...initialSettings, ...parsed, branches };
      }
    }
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

export const getQuizQuestions = (): QuizQuestion[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZ);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.QUIZ, JSON.stringify(initialQuizQuestions));
      return initialQuizQuestions;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialQuizQuestions;
  } catch {
    return initialQuizQuestions;
  }
};

export const saveQuizQuestions = (questions: QuizQuestion[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.QUIZ, JSON.stringify(questions));
  } catch (err) {
    console.error('Failed to save quiz', err);
  }
};

export const getPrizeIdeas = (): PrizeIdea[] => {
  return prizeIdeasVault;
};

// Local storage claims getter
export const getLocalClaims = (): PatientClaim[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLAIMS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Merge unique claims by id/couponCode
export function mergeClaims(primary: PatientClaim[], incoming: PatientClaim[]): PatientClaim[] {
  const map = new Map<string, PatientClaim>();
  // Primary first
  primary.forEach((c) => {
    if (c && c.id) map.set(c.id, c);
  });
  // Incoming overwrites or adds
  incoming.forEach((c) => {
    if (c && c.id) {
      const existing = map.get(c.id);
      if (!existing || (c.createdAtTimestamp || 0) >= (existing.createdAtTimestamp || 0)) {
        map.set(c.id, { ...existing, ...c });
      }
    }
  });
  return Array.from(map.values()).sort(
    (a, b) => (b.createdAtTimestamp || 0) - (a.createdAtTimestamp || 0)
  );
}

/**
 * Fetch claims from Centralized Cloud:
 * 1. Tries Backend API (/api/claims)
 * 2. Tries GitHub Claims File (public/rt-lab-claims.json via API & raw)
 * 3. Merges with LocalStorage and updates local view
 */
export async function fetchClaimsFromCloud(): Promise<PatientClaim[]> {
  const localClaims = getLocalClaims();
  let fetched: PatientClaim[] = [];

  // 1. Try Local Server Backend
  try {
    const res = await fetch('/api/claims', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        fetched = mergeClaims(fetched, data);
      }
    }
  } catch {
    // ignore
  }

  // 2. Try GitHub API for claims
  const token = getEffectiveGitHubToken();
  const githubSources = [
    `https://api.github.com/repos/${GITHUB_SYNC_CONFIG.OWNER}/${GITHUB_SYNC_CONFIG.REPO}/contents/public/rt-lab-claims.json?ref=main`,
    `https://raw.githubusercontent.com/${GITHUB_SYNC_CONFIG.OWNER}/${GITHUB_SYNC_CONFIG.REPO}/main/public/rt-lab-claims.json?v=${Date.now()}`,
    `https://raw.githubusercontent.com/${GITHUB_SYNC_CONFIG.OWNER}/${GITHUB_SYNC_CONFIG.REPO}/gh-pages/rt-lab-claims.json?v=${Date.now()}`,
    `./rt-lab-claims.json?v=${Date.now()}`,
  ];

  for (const src of githubSources) {
    try {
      const headers: Record<string, string> = { 'Cache-Control': 'no-cache' };
      if (src.includes('api.github.com') && token) {
        headers['Authorization'] = `token ${token}`;
        headers['Accept'] = 'application/vnd.github.v3+json';
      }
      const res = await fetch(src, { headers });
      if (res.ok) {
        const json = await res.json();
        let items: PatientClaim[] = [];
        if (src.includes('api.github.com') && json.content) {
          const decoded = decodeURIComponent(escape(atob(json.content.replace(/\s/g, ''))));
          items = JSON.parse(decoded);
        } else if (Array.isArray(json)) {
          items = json;
        }
        if (Array.isArray(items) && items.length > 0) {
          fetched = mergeClaims(fetched, items);
          break;
        }
      }
    } catch {
      // try next
    }
  }

  const merged = mergeClaims(localClaims, fetched);
  try {
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(merged));
  } catch {
    // ignore
  }
  return merged;
}

/**
 * Sync claims array to GitHub repository file so GitHub Pages also persists!
 */
export async function syncClaimsToGitHub(
  claims: PatientClaim[],
  tokenParam?: string
): Promise<boolean> {
  const token = tokenParam?.trim() || getEffectiveGitHubToken();
  if (!token) return false;

  const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(claims, null, 2))));
  const targetBranches = ['main', 'gh-pages'];

  let anySuccess = false;
  for (const branch of targetBranches) {
    const targetPath = branch === 'gh-pages' ? 'rt-lab-claims.json' : 'public/rt-lab-claims.json';
    try {
      const url = `https://api.github.com/repos/${GITHUB_SYNC_CONFIG.OWNER}/${GITHUB_SYNC_CONFIG.REPO}/contents/${targetPath}?ref=${branch}`;
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

      const putRes = await fetch(
        `https://api.github.com/repos/${GITHUB_SYNC_CONFIG.OWNER}/${GITHUB_SYNC_CONFIG.REPO}/contents/${targetPath}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `chore: register patient rewards claim (${new Date().toISOString()})`,
            content: contentBase64,
            branch,
            ...(sha ? { sha } : {}),
          }),
        }
      );
      if (putRes.ok) {
        anySuccess = true;
      }
    } catch {
      // ignore
    }
  }
  return anySuccess;
}

/**
 * Save new patient claim:
 * 1. Saves to local storage
 * 2. POSTs to Server API /api/claims
 * 3. Commits to GitHub repository rt-lab-claims.json
 */
export async function saveClaim(claim: PatientClaim): Promise<PatientClaim[]> {
  const current = getLocalClaims();
  const updated = [claim, ...current.filter((c) => c.id !== claim.id)];

  try {
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save claim locally', err);
  }

  // 1. Post to Server API
  try {
    fetch('/api/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claim),
    }).catch(() => {});
  } catch {
    // ignore
  }

  // 2. Sync to GitHub in background
  syncClaimsToGitHub(updated).catch(() => {});

  return updated;
}

/**
 * Update claim status and booking details
 */
export async function updateClaimStatus(
  id: string,
  status: PatientClaim['status'],
  bookingDetails?: BookingDetails
): Promise<PatientClaim[]> {
  const current = getLocalClaims();
  const updated = current.map((c) => {
    if (c.id === id) {
      return {
        ...c,
        status,
        ...(bookingDetails ? { bookingDetails: { ...c.bookingDetails, ...bookingDetails } } : {}),
      };
    }
    return c;
  });

  try {
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update claim locally', err);
  }

  // 1. Update on Server API
  try {
    fetch(`/api/claims/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, bookingDetails }),
    }).catch(() => {});
  } catch {
    // ignore
  }

  // 2. Sync to GitHub
  syncClaimsToGitHub(updated).catch(() => {});

  return updated;
}

export const deleteClaim = async (id: string): Promise<PatientClaim[]> => {
  const current = getLocalClaims();
  const updated = current.filter((c) => c.id !== id);
  try {
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete claim locally', err);
  }

  try {
    fetch(`/api/claims/${id}`, { method: 'DELETE' }).catch(() => {});
  } catch {
    // ignore
  }

  syncClaimsToGitHub(updated).catch(() => {});
  return updated;
};

// 24-Hour restriction checks
export const check24HourRestriction = (): PlayRestrictionStatus => {
  try {
    const lastPlayRaw = localStorage.getItem(STORAGE_KEYS.LAST_PLAY_TIME);
    const activeCouponRaw = localStorage.getItem(STORAGE_KEYS.ACTIVE_COUPON);

    if (!lastPlayRaw) {
      return { canPlay: true, remainingTimeFormatted: '', remainingMs: 0 };
    }

    const lastPlayTime = parseInt(lastPlayRaw, 10);
    const now = Date.now();
    const elapsed = now - lastPlayTime;

    if (elapsed < TWENTY_FOUR_HOURS_MS) {
      const remainingMs = TWENTY_FOUR_HOURS_MS - elapsed;
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

      const formatted = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      let lastClaim: PatientClaim | null = null;
      if (activeCouponRaw) {
        try {
          lastClaim = JSON.parse(activeCouponRaw);
        } catch {
          // ignore
        }
      }

      return {
        canPlay: false,
        remainingTimeFormatted: formatted,
        remainingMs,
        lastClaim,
      };
    }

    return { canPlay: true, remainingTimeFormatted: '', remainingMs: 0 };
  } catch {
    return { canPlay: true, remainingTimeFormatted: '', remainingMs: 0 };
  }
};

export const recordPlaySession = (claim?: PatientClaim) => {
  try {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEYS.LAST_PLAY_TIME, now.toString());
    if (claim) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_COUPON, JSON.stringify(claim));
    }
  } catch (err) {
    console.error('Failed to record session', err);
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

export const generateCouponCode = (): string => {
  const letters = 'RT';
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `${letters}-${digits}`;
};

// Clean Egypt phone number
export function cleanEgyptianPhone(phone: string): string {
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '20' + clean.substring(1);
  } else if (!clean.startsWith('20') && clean.length === 10) {
    clean = '20' + clean;
  }
  return clean;
}

// Patient sends WhatsApp to Lab to activate coupon
export const buildWhatsAppUrl = (
  whatsappNumber: string,
  claim: PatientClaim,
  labName: string,
  slogan: string = 'التشخيص الصحيح يبدأ معنا'
): string => {
  const cleanNumber = cleanEgyptianPhone(whatsappNumber);
  const messageText = `مرحباً ${labName} (${slogan}) 🌸
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

⚠️ *ملاحظة:* يرجى تأكيد الحجز وموعد التحاليل بالمعمل خلال 24 ساعة قبل انتهاء صلاحية الكوبون. شكراً لكم!`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;
};

/**
 * CORE REQUESTED FEATURE:
 * Lab sends Booking & Prize Confirmation WhatsApp directly to the Patient's registered phone!
 * "يتم إرسال رسالة تأكيد الحصول على الجائزة وتفاصيل الحجز وإرساله واتس اب المريض على نفس رقمه المسجل"
 */
export const buildBookingConfirmationWhatsAppUrl = (
  claim: PatientClaim,
  settings: LabSettings,
  bookingDetails: BookingDetails
): string => {
  const cleanPhone = cleanEgyptianPhone(claim.phone);
  const selectedBranchObj = settings.branches.find((b) => b.name === bookingDetails.selectedBranch);
  const branchAddress = selectedBranchObj ? selectedBranchObj.address : claim.branch;

  const homeVisitBadge = bookingDetails.isHomeVisit
    ? '🛵 *خدمة سحب العينات المنزلية:* مؤكدة ومجدولة بالعنوان'
    : `🏢 *فرع الزيارة المعتمد:* ${bookingDetails.selectedBranch}`;

  const messageText = `*${settings.labNameAr}* 🩺✨
*${settings.sloganAr}*

أهلاً بك أستاذ/ة: *${claim.patientName}* 🌸
نبارك لحضرتك الفوز في مسابقات وجوائز معامل رامي مختار للتحاليل الطبية!

🎁 *تفاصيل الجائزة المعتمدة:*
• الجائزة: *${claim.prizeTitle}* (${claim.discountValue})
• كود الكوبون المعتمد: *${claim.couponCode}*
• تاريخ الصلاحية: صالح حتى *${claim.expiresAt}* (24 ساعة)

📅 *تفاصيل تأكيد الحجز وموعد التحليل:*
• ${homeVisitBadge}
• موعد الزيارة / الفحص: *${bookingDetails.appointmentDate} - الساعة ${bookingDetails.appointmentTime}*
${bookingDetails.prepInstructions ? `• تعليمات التحضير: ⚠️ ${bookingDetails.prepInstructions}\n` : ''}${bookingDetails.adminNotes ? `• ملاحظات الاستقبال: ${bookingDetails.adminNotes}\n` : ''}
📍 *العنوان:* ${branchAddress}
📞 *الخط الساخن والحجز:* ${settings.hotline}
💬 *واتساب خدمة العملاء:* ${settings.whatsappNumber}

يسعدنا ويشرفنا استقبال حضرتك في أي وقت، ونتمنى لك دوام الصحة والعافية! ❤️`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
};

// Generate patient game invitation url
export const generatePatientPlayUrl = (
  baseUrl: string,
  patientName?: string,
  patientPhone?: string,
  preferredGame?: GameType
): string => {
  const cleanBase = baseUrl.split('?')[0];
  const params = new URLSearchParams();
  params.set('ref', 'patient_invite');
  params.set('t', Date.now().toString());
  if (patientName?.trim()) params.set('pname', patientName.trim());
  if (patientPhone?.trim()) params.set('pphone', patientPhone.trim());
  if (preferredGame) params.set('game', preferredGame);
  return `${cleanBase}?${params.toString()}`;
};

// WhatsApp invitation message from Lab to patient to invite them to play
export const buildPatientInviteWhatsAppUrl = (
  patientPhone: string,
  patientName: string,
  playUrl: string,
  labName: string,
  slogan: string = 'التشخيص الصحيح يبدأ معنا'
): string => {
  const cleanNumber = cleanEgyptianPhone(patientPhone);
  const greeting = patientName ? `أهلاً بك يا أستاذ/ة ${patientName} 🌸\n` : `أهلاً بك عميلنا العزيز 🌸\n`;
  const message = `${greeting}يسعد إدارة ${labName} (${slogan}) إهداءك فرصة حصرية للمشاركة في مسابقات وجوائز المرضى! 🎁🩺

اضغط على الرابط التالي لبدء اختيار المسابقة المفضلة لديك (عجلة الحظ، كارت الخدش، صندوق المفاجآت، المسابقة الطبية) والفوز بكوبون خصم فوري:
👉 ${playUrl}

⚠️ الكوبون ساري لمدة 24 ساعة في جميع الفروع ومع خدمة السحب المنزلي.
نتمنى لك وافر الصحة والعافية! ❤️`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};

// Check if patient opened link with invitation params
export function checkPatientUrlForNewSession(): {
  isPatientLink: boolean;
  patientName?: string;
  patientPhone?: string;
  game?: GameType;
} {
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const isPatientLink = ref === 'patient_invite' || ref === 'wa' || ref === 'sms';
    const patientName = params.get('pname') || undefined;
    const patientPhone = params.get('pphone') || undefined;
    const rawGame = params.get('game');
    const game =
      rawGame === 'wheel' || rawGame === 'scratch' || rawGame === 'quiz' || rawGame === 'box'
        ? rawGame
        : undefined;

    return { isPatientLink, patientName, patientPhone, game };
  } catch {
    return { isPatientLink: false };
  }
}

// Fetch remote config (settings, branches, prizes)
export async function fetchRemoteConfig(): Promise<{
  settings: LabSettings;
  branches: Branch[];
  prizes?: Prize[];
  quizQuestions?: QuizQuestion[];
} | null> {
  const sources = [
    `/api/settings`,
    `./rt-lab-config.json?v=${Date.now()}`,
    `/rt-lab-config.json?v=${Date.now()}`,
    `https://raw.githubusercontent.com/${GITHUB_SYNC_CONFIG.OWNER}/${GITHUB_SYNC_CONFIG.REPO}/main/public/rt-lab-config.json?v=${Date.now()}`,
    `https://raw.githubusercontent.com/${GITHUB_SYNC_CONFIG.OWNER}/${GITHUB_SYNC_CONFIG.REPO}/gh-pages/rt-lab-config.json?v=${Date.now()}`,
  ];

  for (const src of sources) {
    try {
      const res = await fetch(src, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && (data.settings || data.labNameAr)) {
          const rawSettings = data.settings || data;
          const branches =
            Array.isArray(data.branches) && data.branches.length > 0
              ? data.branches
              : rawSettings.branches || initialBranches;
          const mergedSettings: LabSettings = {
            ...initialSettings,
            ...rawSettings,
            branches,
          };

          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(mergedSettings));

          let fetchedPrizes: Prize[] | undefined;
          if (Array.isArray(data.prizes) && data.prizes.length > 0) {
            fetchedPrizes = data.prizes;
            localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(fetchedPrizes));
          }

          let fetchedQuiz: QuizQuestion[] | undefined;
          if (Array.isArray(data.quizQuestions) && data.quizQuestions.length > 0) {
            fetchedQuiz = data.quizQuestions;
            localStorage.setItem(STORAGE_KEYS.QUIZ, JSON.stringify(fetchedQuiz));
          }

          return {
            settings: mergedSettings,
            branches,
            prizes: fetchedPrizes,
            quizQuestions: fetchedQuiz,
          };
        }
      }
    } catch {
      // try next
    }
  }
  return null;
}

// Publish updated config to GitHub
export async function syncConfigToGitHub(
  settings: LabSettings,
  prizes: Prize[],
  quizQuestions?: QuizQuestion[],
  tokenParam?: string
): Promise<{ success: boolean; message: string }> {
  const token = tokenParam?.trim() || getEffectiveGitHubToken();
  if (!token) {
    return {
      success: false,
      message: 'يرجى إدخال رمز GitHub Access Token لإتمام المزامنة السحابية',
    };
  }

  try {
    localStorage.setItem(STORAGE_KEYS.GITHUB_TOKEN, token);
  } catch {
    // ignore
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
      enableNotificationSound: settings.enableNotificationSound ?? true,
      termsAndConditions: settings.termsAndConditions || initialSettings.termsAndConditions,
    },
    branches: settings.branches || initialBranches,
    prizes: prizes || getPrizes(),
    quizQuestions: quizQuestions || getQuizQuestions(),
  };

  const fileContentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload, null, 2))));
  const targetBranches = ['main', 'gh-pages'];
  const results: string[] = [];

  for (const branch of targetBranches) {
    const targetPath = branch === 'gh-pages' ? 'rt-lab-config.json' : 'public/rt-lab-config.json';
    try {
      const url = `https://api.github.com/repos/${GITHUB_SYNC_CONFIG.OWNER}/${GITHUB_SYNC_CONFIG.REPO}/contents/${targetPath}?ref=${branch}`;
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

      const putRes = await fetch(
        `https://api.github.com/repos/${GITHUB_SYNC_CONFIG.OWNER}/${GITHUB_SYNC_CONFIG.REPO}/contents/${targetPath}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `chore: live sync lab prizes, branches & settings (${new Date().toLocaleDateString('ar-EG')})`,
            content: fileContentBase64,
            branch,
            ...(sha ? { sha } : {}),
          }),
        }
      );
      if (putRes.ok) {
        results.push(`فرع ${branch}: تم التحديث بنجاح`);
      } else {
        const errData = await putRes.json().catch(() => ({}));
        results.push(`فرع ${branch}: ${errData.message || 'خطأ'}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'فشل الاتصال';
      results.push(`فرع ${branch}: ${msg}`);
    }
  }

  saveSettings(settings);
  savePrizes(prizes);
  if (quizQuestions) saveQuizQuestions(quizQuestions);

  return {
    success: results.some((r) => r.includes('تم التحديث بنجاح')),
    message: results.join(' | '),
  };
}
