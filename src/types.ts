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

export interface BookingDetails {
  selectedBranch: string;
  appointmentDate: string;
  appointmentTime: string;
  prepInstructions?: string;
  isHomeVisit?: boolean;
  confirmedBy?: string;
  confirmedAt?: string;
  whatsappSentAt?: string;
  adminNotes?: string;
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
  status: 'pending' | 'confirmed' | 'redeemed' | 'cancelled';
  notes?: string;
  bookingDetails?: BookingDetails;
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
  couponValidityHours: number; // 24 hours strictly
  autoOpenWhatsApp: boolean;
  enableNotificationSound: boolean;
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
