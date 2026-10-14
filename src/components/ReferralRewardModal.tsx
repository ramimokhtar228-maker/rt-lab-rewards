import React, { useState } from 'react';
import {
  Award,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Gift,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LabSettings, PatientClaim } from '../types';
import {
  buildWhatsAppUrl,
  cleanEgyptianPhone,
  generateCouponCode,
  saveClaim,
} from '../services/storageService';
import { playVictoryChime } from '../utils/audio';

interface ReferralRewardModalProps {
  settings: LabSettings;
  isOpen: boolean;
  onClose: () => void;
  onClaimCreated?: (claim: PatientClaim) => void;
}

export const ReferralRewardModal: React.FC<ReferralRewardModalProps> = ({
  settings,
  isOpen,
  onClose,
  onClaimCreated,
}) => {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [copied, setCopied] = useState(false);
  const [rewardUnlocked, setRewardUnlocked] = useState(false);
  const [rewardClaim, setRewardClaim] = useState<PatientClaim | null>(null);

  if (!isOpen) return null;

  const getBaseInviteUrl = () => {
    try {
      if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1')) {
        return window.location.href.split('?')[0].split('#')[0];
      }
    } catch {
      // fallback
    }
    return 'https://ramimokhtar228-maker.github.io/rt-lab-rewards/';
  };

  const cleanBase = getBaseInviteUrl();
  const targetShareUrl = `${cleanBase}?ref=friend_invite&t=${Date.now()}`;

  const shareText = `🎁 هدية خاصة من معامل د. رامي مختار للتحاليل الطبية (RT Labs)!
شارك في مسابقات وجوائز المرضى واربح كروت فحص مجانية وخصومات تصل إلى 60%:
👉 ${targetShareUrl}
(صالح في جميع الفروع ومع خدمة السحب المنزلي) ✨🩺`;

  const waShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetShareUrl);
    setCopied(true);
    triggerRewardUnlock();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'مسابقات وجوائز معامل رامي مختار RT Labs',
          text: shareText,
          url: targetShareUrl,
        });
        triggerRewardUnlock();
      } catch {
        // canceled or failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    window.open(waShareUrl, '_blank');
    triggerRewardUnlock();
  };

  const triggerRewardUnlock = async () => {
    if (rewardUnlocked) return;

    playVictoryChime();
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {
      // ignore
    }

    const code = `RT-REF-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const bonusClaim: PatientClaim = {
      id: 'ref-' + Date.now(),
      couponCode: code,
      patientName: patientName.trim() || 'صديق معمل RT Labs',
      phone: patientPhone.trim() || 'مسجل عبر دعوة صديق',
      branch: settings.branches[0]?.name || 'الفرع الرئيسي',
      prizeId: 'prize-bonus-ref',
      prizeTitle: 'هدية دعوة صديق: فحص سكر عشوائي مجاناً 100%',
      discountValue: 'مجاناً 100%',
      gameType: 'wheel',
      createdAt: now.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }),
      createdAtTimestamp: now.getTime(),
      expiresAt: expires.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }),
      expiresAtTimestamp: expires.getTime(),
      status: 'pending',
      notes: 'كوبون هدية ترويجية ناتج عن دعوة صديق ومشاركة الرابط',
    };

    setRewardClaim(bonusClaim);
    setRewardUnlocked(true);

    try {
      await saveClaim(bonusClaim);
      if (onClaimCreated) onClaimCreated(bonusClaim);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl text-slate-900 text-right max-h-[92vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-rose-50 text-[#8B1E2D] flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900">
                شارك واربح مكافأة إضافية 🎁
              </h3>
              <p className="text-[11px] text-slate-500">
                ادعُ أصدقاءك لتجربة المسابقات واحصل على فحص سكر مجاناً
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Bonus Showcase Banner */}
        <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-emerald-50 rounded-2xl p-4 border border-rose-200/80 mb-5 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#8B1E2D] text-xs font-black shadow-xs mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>مكافأة المشاركة الفورية</span>
          </div>
          <h4 className="text-sm sm:text-base font-black text-slate-900 mb-1">
            فحص سكر عشوائي مجاناً 100% لك ولصديقك!
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            بمجرد مشاركة الرابط مع أي صديق عبر الواتساب أو شبكات التواصل، سيتم تفعيل كوبون الهدية الإضافي الخاص بك فوراً.
          </p>
        </div>

        {/* Optional Name/Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">اسمك الكريم (اختياري)</label>
            <input
              type="text"
              placeholder="مثال: محمد أحمد"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-[#8B1E2D]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">رقم هاتفك (اختياري)</label>
            <input
              type="tel"
              placeholder="01XXXXXXXXX"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono text-left outline-none focus:border-[#8B1E2D]"
              dir="ltr"
            />
          </div>
        </div>

        {/* Share Buttons */}
        <div className="space-y-2.5 mb-5">
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="h-4 w-4" />
            <span>مشاركة الرابط عبر الواتساب (WhatsApp)</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-80" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                copied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'تم نسخ الرابط!' : 'نسخ الرابط'}</span>
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Share2 className="h-3.5 w-3.5 text-amber-400" />
              <span>مشاركة الهاتف الشاملة</span>
            </button>
          </div>
        </div>

        {/* Unlocked Reward Card */}
        {rewardUnlocked && rewardClaim && (
          <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-2xl p-4 sm:p-5 shadow-lg animate-fade-in mb-4 text-center">
            <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-white/20 text-xs font-bold mb-2">
              <Award className="h-3.5 w-3.5 text-amber-300" />
              <span>تم تفعيل مكافأة الصديق بنجاح! 🏆</span>
            </div>

            <div className="text-sm font-black mb-1">
              {rewardClaim.prizeTitle}
            </div>

            <div className="my-2 py-1.5 px-4 bg-white/10 rounded-xl font-mono text-base font-black tracking-widest border border-white/20 inline-block">
              {rewardClaim.couponCode}
            </div>

            <p className="text-[11px] text-white/90">
              صالح لمدة 24 ساعة في كافة فروع معمل رامي مختار ومع السحب المنزلي
            </p>
          </div>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
