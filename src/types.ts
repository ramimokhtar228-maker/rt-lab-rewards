export type QuestionCategory = 'medical' | 'general' | 'puzzle' | 'culture';

export interface Question {
  id: string;
  category: QuestionCategory;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export type RewardType = 'discount_percent' | 'free_test' | 'cash_discount' | 'package_deal';

export interface RewardItem {
  id: string;
  code: string;
  title: string;
  description: string;
  type: RewardType;
  value: string; // e.g. "25%" or "مجاني" or "50 ج.م"
  pointsCost: number;
  badge: string;
  terms: string;
  isActive: boolean;
}

export interface UserCoupon {
  id: string;
  couponCode: string;
  title: string;
  description: string;
  value: string;
  type: RewardType;
  wonFrom: string; // e.g. 'عجلة الحظ', 'مسابقة التحدي', 'متجر النقاط', 'كارت الخربشة'
  createdAt: string;
  expiresAt: string;
  isUsed: boolean;
  terms: string;
}

export interface SpinSlice {
  id: string;
  label: string;
  subtext: string;
  type: 'points' | 'discount' | 'free_test' | 'luck';
  value: string;
  pointsAmount?: number;
  color: string;
  probability: number; // weight
}

export interface LabBranch {
  id: string;
  name: string; // اسم الفرع e.g. "فرع مدينة نصر - الرئيسي"
  city: string; // المدينة / المنطقة e.g. "القاهرة"
  address: string; // العنوان بالتفصيل e.g. "شارع الطيران أمام مستشفى التأمين، برج الأطباء - الدور 3"
  phone: string; // هاتف الفرع
  whatsappNumber: string; // رقم الواتساب المباشر للفرع
  googleMapsUrl: string; // رابط اللوكيشن على خرائط جوجل
  workingHours: string; // مواعيد العمل e.g. "يومياً من 8 صباحاً حتى 11 مساءً"
  managerName: string; // مدير أو مسؤول الفرع
  isMainBranch: boolean; // هل هو الفرع الرئيسي
  homeSamplingCoverage: string; // مناطق تغطية السحب المنزلي التابعة للفرع
  notes?: string; // علامة مميزة
}

export interface LabAdminMember {
  id: string;
  name: string; // اسم المسؤول / دكتور المعمل
  role: string; // المنصب e.g. "المدير العام للمعمل", "مدير فرع مدينة نصر", "مسؤول خدمة عملاء الواتساب", "استشاري التحاليل والنتائج"
  phone: string; // رقم الهاتف
  whatsappNumber: string; // رقم الواتساب المباشر
  branchId?: string; // الفرع التابع له
  isOnline: boolean; // متاح للتواصل الفوري
  allowDirectWhatsApp: boolean; // إتاحة زر واتساب مباشر للمرضى
  bio?: string; // نبذة مختصرة
}

export interface WhatsAppTemplate {
  id: string;
  title: string; // عنوان القالب e.g. "تأكيد حجز سحب عينات منزلي"
  category: 'booking' | 'results' | 'rewards' | 'branches' | 'inquiry' | 'general';
  templateText: string; // نص الرسالة المنسق مع الرموز والمتغيرات
  isActive: boolean;
}

export interface LabSettings {
  labName: string;
  tagline: string;
  whatsappNumber: string; // e.g. "201021487889"
  hotlineNumber: string;
  address: string;
  workingHours: string;
  homeVisitAvailable: boolean;
  announcement: string;
  quizPointsPerCorrect: number;
  dailyStreakBonus: number;
  adminPin: string; // رمز دخول الإدارة السري
  branches: LabBranch[];
  adminTeam: LabAdminMember[];
  whatsappTemplates: WhatsAppTemplate[];
  cloudSyncRoomId: string;
  lastCloudSyncTimestamp?: string;
  githubRepo?: string; // e.g. "ramimokhtar228-maker/rt-lab-rewards"
  githubBranch?: string;
}

export interface PatientRecord {
  id: string;
  name: string;
  phone: string;
  points: number;
  levelTitle: string;
  joinedAt: string;
  lastActive: string;
  couponsWon: number;
  gamesPlayed: number;
  preferredBranchId?: string;
}

export interface PrizeClaimBooking {
  id: string;
  patientName: string;
  patientPhone: string;
  address: string;
  serviceType: 'home_visit' | 'branch_visit';
  preferredTime: string;
  branchId?: string;
  couponCode: string;
  prizeTitle: string;
  prizeValue: string;
  points: number;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export interface PlayerProfile {
  name: string;
  phone: string;
  points: number;
  streak: number;
  lastPlayedDate: string;
  quizzesCompleted: number;
  correctAnswersCount: number;
  wheelSpinsCount: number;
  scratchCardsCount: number;
  levelTitle: string;
  preferredBranchId?: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  phoneMasked: string;
  points: number;
  rank: number;
  badge: string;
  couponsWon: number;
}

export interface CloudSyncState {
  revision: number;
  lastUpdated: string;
  settings: LabSettings;
  questions: Question[];
  rewards: RewardItem[];
  slices: SpinSlice[];
  claims: PrizeClaimBooking[];
  patients: PatientRecord[];
  leaderboard: LeaderboardUser[];
}
