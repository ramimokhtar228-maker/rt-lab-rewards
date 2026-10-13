export type GameType = 'wheel' | 'scratch' | 'quiz';

export type DiscountType = 'percentage' | 'fixed' | 'free_test' | 'gift';

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
  expiresAt: string;
  status: 'pending' | 'verified' | 'redeemed' | 'cancelled';
  notes?: string;
}

export interface LabSettings {
  labNameAr: string;
  labSubtitleAr: string;
  labNameEn: string;
  whatsappNumber: string; // e.g., "201000000000"
  hotline: string;
  adminPin: string;
  branches: string[];
  couponValidityDays: number;
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
  category: 'فحوصات شاملة' | 'فيتامينات ومعادن' | 'سكر وغدد' | 'كبد وكلى' | 'عروض خاصة';
  suggestedDiscount: string;
  discountType: DiscountType;
  description: string;
  benefitToLab: string;
}
