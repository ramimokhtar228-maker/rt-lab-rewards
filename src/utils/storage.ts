import {
  Question,
  RewardItem,
  UserCoupon,
  SpinSlice,
  LabSettings,
  PlayerProfile,
  LeaderboardUser,
  PatientRecord,
  PrizeClaimBooking,
} from '../types';
import {
  OFFICIAL_LAB_SETTINGS,
  OFFICIAL_QUESTIONS,
  OFFICIAL_REWARDS,
  OFFICIAL_SPIN_SLICES,
  OFFICIAL_LEADERBOARD,
} from '../data/officialLabData';

/**
 * Official Laboratory defaults extracted from the verified laboratory backup
 */
export const INITIAL_QUESTIONS: Question[] = OFFICIAL_QUESTIONS;
export const INITIAL_REWARDS: RewardItem[] = OFFICIAL_REWARDS;
export const INITIAL_SPIN_SLICES: SpinSlice[] = OFFICIAL_SPIN_SLICES;
export const INITIAL_LAB_SETTINGS: LabSettings = OFFICIAL_LAB_SETTINGS;
export const INITIAL_LEADERBOARD: LeaderboardUser[] = OFFICIAL_LEADERBOARD;

/**
 * Standardize phone number for WhatsApp direct link (wa.me)
 * Converts "01100874444" -> "201100874444"
 */
export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return '201100874444';
  const clean = phone.replace(/\D/g, '');
  if (clean.startsWith('20')) {
    return clean;
  }
  if (clean.startsWith('01')) {
    return '2' + clean;
  }
  if (clean.startsWith('1') && clean.length === 10) {
    return '20' + clean;
  }
  return clean || '201100874444';
}

const STORAGE_KEYS = {
  QUESTIONS: 'rt_lab_questions_v3_official',
  REWARDS: 'rt_lab_rewards_v3_official',
  SPIN_SLICES: 'rt_lab_spin_slices_v3_official',
  SETTINGS: 'rt_lab_settings_v3_official',
  PLAYER: 'rt_lab_player_profile_v3',
  COUPONS: 'rt_lab_user_coupons_v3',
  LEADERBOARD: 'rt_lab_leaderboard_v3',
  LAST_SPIN_TIME: 'rt_lab_last_spin_time_v3',
  PATIENTS: 'rt_lab_registered_patients_v3',
  CLAIMS_LOG: 'rt_lab_claims_log_v3',
};

// Safe LocalStorage helpers
function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const val = localStorage.getItem(key);
    return val ? (JSON.parse(val) as T) : fallback;
  } catch (err) {
    console.error(`Error loading key ${key}:`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving key ${key}:`, err);
  }
}

// Player Profile
export function getPlayerProfile(): PlayerProfile {
  return safeGet<PlayerProfile>(STORAGE_KEYS.PLAYER, {
    name: 'عميل معامل RT',
    phone: '',
    points: 120, // Initial welcome bonus points
    streak: 1,
    lastPlayedDate: new Date().toISOString().split('T')[0],
    quizzesCompleted: 0,
    correctAnswersCount: 0,
    wheelSpinsCount: 0,
    scratchCardsCount: 0,
    levelTitle: 'صديق جديد لمعامل RT 🩺',
  });
}

export function savePlayerProfile(profile: PlayerProfile): void {
  // Update level title based on points
  let level = 'صديق جديد لمعامل RT 🩺';
  if (profile.points >= 1500) {
    level = 'سفير التميز لمعامل RT 👑';
  } else if (profile.points >= 800) {
    level = 'خبير الصحة والذكاء 🌟';
  } else if (profile.points >= 400) {
    level = 'بطل التحدي الفضي 🥈';
  } else if (profile.points >= 200) {
    level = 'متسابق نشط ومميز ⭐';
  }
  profile.levelTitle = level;
  safeSet(STORAGE_KEYS.PLAYER, profile);
}

// Questions CRUD
export function getQuestions(): Question[] {
  return safeGet<Question[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
}

export function saveQuestions(questions: Question[]): void {
  safeSet(STORAGE_KEYS.QUESTIONS, questions);
}

export function addQuestion(q: Omit<Question, 'id'>): Question {
  const all = getQuestions();
  const newQ: Question = {
    ...q,
    id: 'q_' + Date.now(),
  };
  const updated = [newQ, ...all];
  saveQuestions(updated);
  return newQ;
}

export function updateQuestion(id: string, partial: Partial<Question>): void {
  const all = getQuestions();
  const updated = all.map((q) => (q.id === id ? { ...q, ...partial } : q));
  saveQuestions(updated);
}

export function deleteQuestion(id: string): void {
  const all = getQuestions();
  const updated = all.filter((q) => q.id !== id);
  saveQuestions(updated);
}

// Rewards CRUD
export function getRewards(): RewardItem[] {
  return safeGet<RewardItem[]>(STORAGE_KEYS.REWARDS, INITIAL_REWARDS);
}

export function saveRewards(rewards: RewardItem[]): void {
  safeSet(STORAGE_KEYS.REWARDS, rewards);
}

export function addReward(reward: Omit<RewardItem, 'id' | 'code'> & { code?: string }): RewardItem {
  const all = getRewards();
  const newReward: RewardItem = {
    ...reward,
    id: 'rew_' + Date.now(),
    code: reward.code || 'RT-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
  };
  const updated = [newReward, ...all];
  saveRewards(updated);
  return newReward;
}

export function updateReward(id: string, partial: Partial<RewardItem>): void {
  const all = getRewards();
  const updated = all.map((r) => (r.id === id ? { ...r, ...partial } : r));
  saveRewards(updated);
}

export function deleteReward(id: string): void {
  const all = getRewards();
  const updated = all.filter((r) => r.id !== id);
  saveRewards(updated);
}

// Spin Wheel Slices
export function getSpinSlices(): SpinSlice[] {
  return safeGet<SpinSlice[]>(STORAGE_KEYS.SPIN_SLICES, INITIAL_SPIN_SLICES);
}

export function saveSpinSlices(slices: SpinSlice[]): void {
  safeSet(STORAGE_KEYS.SPIN_SLICES, slices);
}

// Lab Settings
export function getLabSettings(): LabSettings {
  let settings = safeGet<LabSettings>(STORAGE_KEYS.SETTINGS, INITIAL_LAB_SETTINGS);

  // 1. Smart URL Query Parameter Override:
  // If the link sent to the client contains ?wa=... or ?hotline=..., apply immediately
  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlWa = params.get('wa');
      const urlHotline = params.get('hotline');
      if (urlWa) {
        settings.whatsappNumber = urlWa;
      }
      if (urlHotline) {
        settings.hotlineNumber = urlHotline;
      }
    } catch {
      // ignore
    }
  }

  // 2. Strict Verification: Any stored data lacking the verified laboratory contact is healed
  const isVerifiedLabNumber = settings && settings.whatsappNumber && settings.whatsappNumber.includes('1100874444');
  const hasValidBranch = settings && settings.branches && settings.branches.length > 0 && settings.branches[0].phone && settings.branches[0].phone.includes('1100046841');

  if (!isVerifiedLabNumber || !hasValidBranch || !settings.adminTeam || settings.adminTeam.length === 0) {
    settings = {
      ...INITIAL_LAB_SETTINGS,
      ...(settings || {}),
      whatsappNumber: INITIAL_LAB_SETTINGS.whatsappNumber, // '201100874444'
      hotlineNumber: INITIAL_LAB_SETTINGS.hotlineNumber,   // '01100046841'
      address: INITIAL_LAB_SETTINGS.address,
      branches: INITIAL_LAB_SETTINGS.branches,
      adminTeam: INITIAL_LAB_SETTINGS.adminTeam,
      whatsappTemplates: INITIAL_LAB_SETTINGS.whatsappTemplates,
    };
    saveLabSettings(settings);
  }
  return settings;
}

export function saveLabSettings(settings: LabSettings): void {
  safeSet(STORAGE_KEYS.SETTINGS, settings);
}

/**
 * Smart Auto-Sync: Guarantees that any device (new or returning with stale cache)
 * is immediately updated with official laboratory numbers, branches, and rewards.
 */
export function ensureOfficialLabDataSynchronized(): void {
  if (typeof window === 'undefined') return;
  try {
    // 1. Purge all legacy storage keys
    const legacyKeys = [
      'rt_lab_settings',
      'rt_lab_settings_v1',
      'rt_lab_settings_v2',
      'rt_lab_questions',
      'rt_lab_questions_v1',
      'rt_lab_questions_v2',
      'rt_lab_rewards',
      'rt_lab_rewards_v1',
      'rt_lab_rewards_v2',
      'rt_lab_spin_slices_v1',
      'rt_lab_spin_slices_v2',
    ];
    legacyKeys.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {
        // ignore
      }
    });

    // 2. Check if sync version is applied
    const syncVer = localStorage.getItem('rt_lab_sync_version');
    const storedSettings = safeGet<LabSettings | null>(STORAGE_KEYS.SETTINGS, null);

    const isOutdated =
      syncVer !== 'v3.5_official_20261022' ||
      !storedSettings ||
      !storedSettings.whatsappNumber ||
      !storedSettings.whatsappNumber.includes('1100874444') ||
      storedSettings.whatsappNumber.includes('1021487889') ||
      !storedSettings.hotlineNumber ||
      !storedSettings.hotlineNumber.includes('1100046841') ||
      !storedSettings.branches ||
      storedSettings.branches.length === 0;

    if (isOutdated) {
      console.log('🔄 Applying official RT Lab verified settings and syncing data...');
      saveLabSettings(INITIAL_LAB_SETTINGS);
      saveQuestions(INITIAL_QUESTIONS);
      saveRewards(INITIAL_REWARDS);
      saveSpinSlices(INITIAL_SPIN_SLICES);
      localStorage.setItem('rt_lab_sync_version', 'v3.5_official_20261022');
    }
  } catch (err) {
    console.error('ensureOfficialLabDataSynchronized error:', err);
  }
}

/**
 * Force clear all caches and reload page with official data
 */
export function forcePurgeAndReload(): void {
  if (typeof window === 'undefined') return;
  try {
    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((k) => caches.delete(k));
      });
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
    }
    localStorage.removeItem('rt_lab_settings_v3_official');
    localStorage.removeItem('rt_lab_sync_version');
    ensureOfficialLabDataSynchronized();
    window.location.reload();
  } catch {
    window.location.reload();
  }
}

// User Claimed Coupons
export function getUserCoupons(): UserCoupon[] {
  return safeGet<UserCoupon[]>(STORAGE_KEYS.COUPONS, [
    {
      id: 'welcome_coupon',
      couponCode: 'RT-WELCOME-15',
      title: 'كوبون ترحيبي: خصم 15% على أول تحليل',
      description: 'هدية فورية بمناسبة انضمامك لبرنامج مكافآت معامل RT.',
      value: 'خصم 15%',
      type: 'discount_percent',
      wonFrom: 'هدية التسجيل والترحيب',
      createdAt: new Date().toLocaleDateString('ar-EG'),
      expiresAt: new Date(Date.now() + 30 * 86400000).toLocaleDateString('ar-EG'),
      isUsed: false,
      terms: 'صالح لجميع التحاليل المخبرية داخل معامل RT.',
    },
  ]);
}

export function saveUserCoupons(coupons: UserCoupon[]): void {
  safeSet(STORAGE_KEYS.COUPONS, coupons);
}

export function issueUserCoupon(
  title: string,
  description: string,
  value: string,
  type: UserCoupon['type'],
  wonFrom: string,
  terms?: string
): UserCoupon {
  const coupons = getUserCoupons();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const newCoupon: UserCoupon = {
    id: 'uc_' + Date.now(),
    couponCode: `RT-${randomSuffix}-${Math.floor(100 + Math.random() * 900)}`,
    title,
    description,
    value,
    type,
    wonFrom,
    createdAt: new Date().toLocaleDateString('ar-EG'),
    expiresAt: new Date(Date.now() + 30 * 86400000).toLocaleDateString('ar-EG'),
    isUsed: false,
    terms: terms || 'صالحة للاستخدام في أي فرع أو مع السحب المنزلي، أظهر هذا الكود لموظف الاستقبال.',
  };
  saveUserCoupons([newCoupon, ...coupons]);
  return newCoupon;
}

// Leaderboard
export function getLeaderboard(): LeaderboardUser[] {
  return safeGet<LeaderboardUser[]>(STORAGE_KEYS.LEADERBOARD, INITIAL_LEADERBOARD);
}

// Full Reset to Factory Data
export function resetAllDataToDefault(): void {
  safeSet(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  safeSet(STORAGE_KEYS.REWARDS, INITIAL_REWARDS);
  safeSet(STORAGE_KEYS.SPIN_SLICES, INITIAL_SPIN_SLICES);
  safeSet(STORAGE_KEYS.SETTINGS, INITIAL_LAB_SETTINGS);
  safeSet(STORAGE_KEYS.LEADERBOARD, INITIAL_LEADERBOARD);
}

// Export All JSON
export function exportDatabaseBackup(): string {
  const dump = {
    version: '3.0',
    exportDate: new Date().toISOString(),
    settings: getLabSettings(),
    questions: getQuestions(),
    rewards: getRewards(),
    spinSlices: getSpinSlices(),
    patients: getRegisteredPatients(),
    claims: getPrizeClaims(),
    leaderboard: getLeaderboard(),
  };
  return JSON.stringify(dump, null, 2);
}

// Import JSON
export function importDatabaseBackup(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.questions && Array.isArray(data.questions)) {
      saveQuestions(data.questions);
    }
    if (data.rewards && Array.isArray(data.rewards)) {
      saveRewards(data.rewards);
    }
    if (data.spinSlices && Array.isArray(data.spinSlices)) {
      saveSpinSlices(data.spinSlices);
    }
    if (data.settings && typeof data.settings === 'object') {
      saveLabSettings(data.settings);
    }
    if (data.patients && Array.isArray(data.patients)) {
      saveRegisteredPatients(data.patients);
    }
    if (data.claims && Array.isArray(data.claims)) {
      savePrizeClaims(data.claims);
    }
    if (data.leaderboard && Array.isArray(data.leaderboard)) {
      safeSet(STORAGE_KEYS.LEADERBOARD, data.leaderboard);
    }
    return true;
  } catch (err) {
    console.error('Import error:', err);
    return false;
  }
}

// Initial Registered Patients (for Admin Demo and management)
export const INITIAL_PATIENTS: PatientRecord[] = [
  {
    id: 'pat_1',
    name: 'أحمد محمود النجار',
    phone: '01023456542',
    points: 1850,
    levelTitle: 'سفير التميز لمعامل RT 👑',
    joinedAt: '2026-10-10',
    lastActive: '2026-10-18',
    couponsWon: 7,
    gamesPlayed: 24,
  },
  {
    id: 'pat_2',
    name: 'د. سارة عبد الرحمن',
    phone: '01239876918',
    points: 1620,
    levelTitle: 'خبير الصحة والذكاء 🌟',
    joinedAt: '2026-10-12',
    lastActive: '2026-10-17',
    couponsWon: 5,
    gamesPlayed: 19,
  },
  {
    id: 'pat_3',
    name: 'محمد كمال رضوان',
    phone: '01145678330',
    points: 1440,
    levelTitle: 'بطل التحدي الفضي 🥈',
    joinedAt: '2026-10-14',
    lastActive: '2026-10-18',
    couponsWon: 4,
    gamesPlayed: 16,
  },
  {
    id: 'pat_4',
    name: 'مروة الشاذلي',
    phone: '01556789774',
    points: 1290,
    levelTitle: 'بطل التحدي الفضي 🥈',
    joinedAt: '2026-10-15',
    lastActive: '2026-10-18',
    couponsWon: 3,
    gamesPlayed: 12,
  },
];

export function getRegisteredPatients(): PatientRecord[] {
  return safeGet<PatientRecord[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
}

export function saveRegisteredPatients(patients: PatientRecord[]): void {
  safeSet(STORAGE_KEYS.PATIENTS, patients);
}

export function deletePatientRecord(id: string): void {
  const all = getRegisteredPatients();
  const updated = all.filter((p) => p.id !== id);
  saveRegisteredPatients(updated);
}

export function resetAllPatients(): void {
  saveRegisteredPatients([]);
}

export function recordOrUpdatePatient(profile: PlayerProfile, couponsCount: number): void {
  if (!profile.name || profile.name === 'عميل معامل RT') return;
  const all = getRegisteredPatients();
  const existingIdx = all.findIndex((p) => (profile.phone && p.phone === profile.phone) || p.name === profile.name);
  const nowStr = new Date().toLocaleDateString('ar-EG');

  if (existingIdx >= 0) {
    all[existingIdx] = {
      ...all[existingIdx],
      name: profile.name,
      phone: profile.phone || all[existingIdx].phone,
      points: profile.points,
      levelTitle: profile.levelTitle,
      lastActive: nowStr,
      couponsWon: couponsCount,
      gamesPlayed: profile.quizzesCompleted + profile.wheelSpinsCount + profile.scratchCardsCount,
    };
    saveRegisteredPatients([...all]);
  } else {
    const newRecord: PatientRecord = {
      id: 'pat_' + Date.now(),
      name: profile.name,
      phone: profile.phone || 'غير مسجل',
      points: profile.points,
      levelTitle: profile.levelTitle,
      joinedAt: nowStr,
      lastActive: nowStr,
      couponsWon: couponsCount,
      gamesPlayed: profile.quizzesCompleted + profile.wheelSpinsCount + profile.scratchCardsCount,
    };
    saveRegisteredPatients([newRecord, ...all]);
  }

  // Also dynamically register in Leaderboard (دوري أبطال المعمل)
  syncPatientToLeaderboard(profile, couponsCount);
}

// Sync patient to the real-time Leaderboard
export function syncPatientToLeaderboard(profile: PlayerProfile, couponsCount: number): void {
  if (!profile.name || profile.name === 'عميل معامل RT') return;
  const board = getLeaderboard();
  const maskedPhone = profile.phone
    ? profile.phone.substring(0, 3) + '****' + profile.phone.slice(-3)
    : '010****' + Math.floor(100 + Math.random() * 900);

  const existing = board.find((u) => u.name === profile.name);
  let updatedBoard: LeaderboardUser[];

  if (existing) {
    updatedBoard = board.map((u) =>
      u.name === profile.name
        ? {
            ...u,
            points: profile.points,
            phoneMasked: maskedPhone,
            couponsWon: couponsCount,
            badge: profile.points >= 1500 ? '👑 بطل RT الماسي' : profile.points >= 800 ? '🌟 بطل التحدي الذهبي' : '🥈 متسابق مميز',
          }
        : u
    );
  } else {
    const newUser: LeaderboardUser = {
      id: 'lb_user_' + Date.now(),
      name: profile.name,
      phoneMasked: maskedPhone,
      points: profile.points,
      rank: board.length + 1,
      badge: '🌟 متسابق جديد في الدوري',
      couponsWon: couponsCount,
    };
    updatedBoard = [...board, newUser];
  }

  // Sort by points descending and reassign ranks
  updatedBoard.sort((a, b) => b.points - a.points);
  updatedBoard = updatedBoard.map((u, idx) => ({ ...u, rank: idx + 1 }));
  safeSet(STORAGE_KEYS.LEADERBOARD, updatedBoard);
}

// Initial Sample Claims Log
export const INITIAL_CLAIMS_LOG: PrizeClaimBooking[] = [
  {
    id: 'clm_1',
    patientName: 'أحمد محمود النجار',
    patientPhone: '01023456542',
    address: 'مدينة نصر - الحي السابع، شارع الطيران',
    serviceType: 'home_visit',
    appointmentDate: '2026-10-26 (غداً)',
    preferredTime: 'صباحاً (08:30 ص - 10:30 ص)',
    patientNotes: 'تحليل صيام 8 ساعات - يرجى اتصال الممرض قبل الحضور بـ 15 دقيقة',
    couponCode: 'RT-CBC-FREE',
    prizeTitle: 'تحليل صورة دم كاملة (CBC) مجاناً 100%',
    prizeValue: 'مجاني 100%',
    points: 1850,
    createdAt: '2026-10-24',
    status: 'confirmed',
    confirmedAppointment: {
      date: '2026-10-26',
      time: '09:00 ص',
      confirmedBy: 'أخصائي السحب المنزلي - معامل RT',
      adminNotes: 'تم تأكيد وصول الأخصائي 9:00 ص، الصيام عن الطعام فقط وشرب المياه مسموح',
      confirmedAt: '2026-10-24',
    },
  },
  {
    id: 'clm_2',
    patientName: 'د. سارة عبد الرحمن',
    patientPhone: '01239876918',
    address: 'ميدان بهتيم - برج صيدلية العزبي الدور الثالث',
    serviceType: 'branch_visit',
    selectedBranch: 'فرع شبرا الخيمة - بهتيم',
    appointmentDate: '2026-10-27',
    preferredTime: 'مساءً (06:00 م - 08:30 م)',
    patientNotes: 'استلام الكوبون وإجراء فحص السكر التراكمي',
    couponCode: 'RT-DISC-25',
    prizeTitle: 'خصم 25% على إجمالي فاتورة التحاليل',
    prizeValue: 'خصم 25%',
    points: 1620,
    createdAt: '2026-10-25',
    status: 'pending',
  },
];

export function getPrizeClaims(): PrizeClaimBooking[] {
  return safeGet<PrizeClaimBooking[]>(STORAGE_KEYS.CLAIMS_LOG, INITIAL_CLAIMS_LOG);
}

export function savePrizeClaims(claims: PrizeClaimBooking[]): void {
  safeSet(STORAGE_KEYS.CLAIMS_LOG, claims);
}

export function addPrizeClaim(
  claimData: Partial<PrizeClaimBooking> & {
    patientName: string;
    patientPhone: string;
    serviceType: 'home_visit' | 'branch_visit';
    couponCode: string;
    prizeTitle: string;
    prizeValue: string;
  }
): PrizeClaimBooking {
  const all = getPrizeClaims();
  const existingIdx = all.findIndex((c) => c.id === claimData.id || c.couponCode === claimData.couponCode);

  const fullClaim: PrizeClaimBooking = {
    id: claimData.id || 'clm_' + Date.now(),
    patientName: claimData.patientName,
    patientPhone: claimData.patientPhone,
    address: claimData.address || '',
    serviceType: claimData.serviceType,
    selectedBranch: claimData.selectedBranch || (claimData.serviceType === 'branch_visit' ? 'فرع بهتيم الرئيسي' : undefined),
    appointmentDate: claimData.appointmentDate || 'في أقرب وقت متاح',
    preferredTime: claimData.preferredTime || 'صباحاً (09:00 ص - 12:00 ظ)',
    patientNotes: claimData.patientNotes || '',
    couponCode: claimData.couponCode,
    prizeTitle: claimData.prizeTitle,
    prizeValue: claimData.prizeValue,
    points: claimData.points || 0,
    createdAt: claimData.createdAt || new Date().toLocaleDateString('ar-EG'),
    status: claimData.status || 'pending',
    confirmedAppointment: claimData.confirmedAppointment,
  };

  if (existingIdx >= 0) {
    all[existingIdx] = { ...all[existingIdx], ...fullClaim };
    savePrizeClaims([...all]);
    return all[existingIdx];
  } else {
    savePrizeClaims([fullClaim, ...all]);
    return fullClaim;
  }
}

export function confirmClaimAppointment(
  id: string,
  confirmedData: {
    date: string;
    time: string;
    confirmedBy?: string;
    adminNotes?: string;
  }
): PrizeClaimBooking | null {
  const all = getPrizeClaims();
  let updatedClaim: PrizeClaimBooking | null = null;
  const updated = all.map((c) => {
    if (c.id === id) {
      updatedClaim = {
        ...c,
        status: 'confirmed' as const,
        confirmedAppointment: {
          date: confirmedData.date,
          time: confirmedData.time,
          confirmedBy: confirmedData.confirmedBy || 'إدارة معامل RT',
          adminNotes: confirmedData.adminNotes || 'تم تأكيد الموعد رسمياً ونرحب بحضرتكم في معامل RT',
          confirmedAt: new Date().toLocaleDateString('ar-EG'),
        },
      };
      return updatedClaim;
    }
    return c;
  });
  savePrizeClaims(updated);
  return updatedClaim;
}

export function updateClaimStatus(id: string, status: PrizeClaimBooking['status']): void {
  const all = getPrizeClaims();
  const updated = all.map((c) => (c.id === id ? { ...c, status } : c));
  savePrizeClaims(updated);
}

export function deletePrizeClaim(id: string): void {
  const all = getPrizeClaims();
  savePrizeClaims(all.filter((c) => c.id !== id));
}

// Reset the entire app data for testing with new fresh patients
export function resetAppForNewPatients(): void {
  localStorage.removeItem(STORAGE_KEYS.PLAYER);
  localStorage.removeItem(STORAGE_KEYS.COUPONS);
}
