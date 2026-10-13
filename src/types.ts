export type GameType = 'wheel' | 'scratch' | 'quiz' | 'box';

export type DiscountType = 'percentage' | 'fixed' | 'free_test' | 'gift';

export interface Branch {
  id: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
  isHomeVisit?: boolean;
}

export interface Prize {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  color: string;
  textColor: string;
  weight: number; // Probability weight
  active: boolean;
  terms: string;
}

export interface PatientClaim {
  id: string;
  couponCode: string;
  patientName: string;
  phone: string;
  branch: string;
  prizeId: string;
  prizeTitle: string;
  discountValue: string;
  gameType: GameType;
  createdAt: string;
  createdAtTimestamp: number;
  expiresAt: string;
  expiresAtTimestamp: number; // 24 hours strictly
  status: 'pending' | 'verified' | 'redeemed' | 'cancelled';
  notes?: string;
}

export interface LabSettings {
  labNameAr: string;
  sloganAr: string;
  labSubtitleAr: string;
  labNameEn: string;
  whatsappNumber: string;
  hotline: string;
  adminPin: string;
  branches: Branch[];
  couponValidityHours: number; // 24 hours by rule
  autoOpenWhatsApp: boolean;
  termsAndConditions: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

export interface PrizeIdea {
  id: string;
  title: string;
  shortTitle: string;
  category: 'فحوصات شاملة' | 'فيتامينات ومعادن' | 'سكر وغدد' | 'كبد وكلى' | 'عروض خاصة' | 'صحة الأسرة والوقاية';
  suggestedDiscount: string;
  discountType: DiscountType;
  description: string;
  benefitToLab: string;
}
