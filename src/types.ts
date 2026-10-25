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
  name: string;
  city?: string;
  address: string;
  phone: string;
  whatsappNumber?: string;
  googleMapsUrl?: string;
  workingHours?: string;
  managerName?: string;
  isMainBranch?: boolean;
  homeSamplingCoverage?: string;
  notes?: string;
}

export interface AdminTeamMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  whatsappNumber: string;
  branchId?: string;
  isOnline?: boolean;
  allowDirectWhatsApp?: boolean;
  bio?: string;
}

export interface WhatsAppTemplate {
  id: string;
  title: string;
  category: string;
  templateText: string;
  isActive: boolean;
}

export interface LabSettings {
  labName: string;
  tagline: string;
  whatsappNumber: string; // Official lab whatsapp, e.g. "201100874444"
  hotlineNumber: string; // Official lab hotline, e.g. "01100046841"
  secondaryPhone?: string;
  emergencyPhone?: string;
  address: string;
  workingHours: string;
  homeVisitAvailable: boolean;
  announcement: string;
  quizPointsPerCorrect: number;
  dailyStreakBonus: number;
  adminPin: string; // رمز دخول الإدارة السري (7788)
  branches?: LabBranch[];
  adminTeam?: AdminTeamMember[];
  whatsappTemplates?: WhatsAppTemplate[];
  cloudSyncRoomId?: string;
  githubRepo?: string;
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
}

export interface PrizeClaimBooking {
  id: string;
  patientName: string;
  patientPhone: string;
  address?: string;
  serviceType: 'home_visit' | 'branch_visit';
  selectedBranch?: string;
  appointmentDate: string;
  preferredTime: string;
  patientNotes?: string;
  couponCode: string;
  prizeTitle: string;
  prizeValue: string;
  points: number;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'completed';
  confirmedAppointment?: {
    date: string;
    time: string;
    confirmedBy?: string;
    adminNotes?: string;
    confirmedAt?: string;
    replyMessageSent?: string;
  };
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
