import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Gift,
  MapPin,
  MessageCircle,
  Phone,
  Printer,
  Share2,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { GameType, LabSettings, PatientClaim, Prize } from '../types';
import { buildWhatsAppUrl, generateCouponCode, saveClaim } from '../services/storageService';
import { VoucherCard } from './VoucherCard';

interface ClaimModalProps {
  prize: Prize;
  gameType: GameType;
  settings: LabSettings;
  onClose: () => void;
  onSuccess: (claim: PatientClaim) => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  prize,
  gameType,
  settings,
  onClose,
  onSuccess,
}) => {
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [branch, setBranch] = useState(settings.branches[0] || 'فرع المهندسين');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claim, setClaim] = useState<PatientClaim | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B1E2D', '#0F2B5C', '#D97706', '#10B981'],
      });
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!patientName.trim()) {
      setError('يرجى إدخال اسم المريض ثلاثي.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 8) {
      setError('يرجى إدخال رقم هاتف صحيح للتواصل وتفعيل الكوبون.');
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const expiry = new Date();
    expiry.setDate(now.getDate() + (settings.couponValidityDays || 14));

    const newClaim: PatientClaim = {
      id: 'claim_' + Date.now(),
      couponCode: generateCouponCode(),
      patientName: patientName.trim(),
      phone: phone.trim(),
      branch,
      prizeId: prize.id,
      prizeTitle: prize.title,
      discountValue: prize.discountValue,
      gameType,
      createdAt: now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }),
      expiresAt: expiry.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }),
      status: 'pending',
      notes: notes.trim(),
    };

    saveClaim(newClaim);
    setClaim(newClaim);
    setIsSubmitting(false);
    onSuccess(newClaim);

    // If autoOpenWhatsApp is set, prepare the WhatsApp URL
    if (settings.autoOpenWhatsApp) {
      const waUrl = buildWhatsAppUrl(settings.whatsappNumber, newClaim, settings.labNameAr);
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const copyCouponCode = () => {
    if (!claim) return;
    navigator.clipboard.writeText(claim.couponCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareApp = () => {
    const url = window.location.origin + window.location.pathname;
    const shareText = `جرّب حظك في مسابقة معامل رامي مختار للتحاليل الطبية واحصل على خصومات فورية وكروت فحص مجانية! 🎁🩺\n${url}`;
    if (navigator.share) {
      navigator.share({
        title: 'جوائز وخصومات معامل رامي مختار',
        text: shareText,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      alert('تم نسخ رابط المسابقة بنجاح! يمكنك إرساله لأصدقائك عبر واتساب.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden my-6 border border-slate-200">
        {/* Top Accent Gradient */}
        <div className="h-3 bg-gradient-to-r from-[#8B1E2D] via-[#D97706] to-[#0F2B5C]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          aria-label="إغلاق"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-8">
          {!claim ? (
            /* Registration Form View */
            <div>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-rose-50 text-[#8B1E2D] border border-rose-200 shadow-sm mb-3">
                  <Gift className="h-8 w-8 text-[#8B1E2D]" />
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#8B1E2D]">
                  <Sparkles className="h-4 w-4" />
                  <span>مبروك! لقد فزت بهدية قيّمة</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  {prize.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  سجل بياناتك البسيطة أدناه لتوليد كود الخصم وإرساله فوراً إلى رقم المعمل المسجل لتفعيله.
                </p>
              </div>

              {/* Prize Summary Box */}
              <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50/70 p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-rose-800 font-medium">نوع المكافأة المكتسبة:</span>
                  <div className="font-bold text-slate-900 text-sm sm:text-base">{prize.shortTitle}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{prize.description}</div>
                </div>
                <div className="rounded-lg bg-[#8B1E2D] px-3.5 py-2 text-white font-black text-sm shadow">
                  {prize.discountValue}
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                  {error}
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    اسم المريض ثلاثي <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="مثال: أحمد محمد علي"
                      className="w-full rounded-xl border border-slate-300 bg-white pr-10 pl-4 py-2.5 text-sm text-slate-900 focus:border-[#8B1E2D] focus:ring-2 focus:ring-rose-500/20 outline-none transition"
                    />
                    <User className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    رقم الهاتف / الواتساب <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="مثال: 01012345678"
                      className="w-full rounded-xl border border-slate-300 bg-white pr-10 pl-4 py-2.5 text-sm text-slate-900 focus:border-[#8B1E2D] focus:ring-2 focus:ring-rose-500/20 outline-none transition font-mono"
                    />
                    <Phone className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    يستخدم للتواصل وتأكيد الحجز وتفعيل الكوبون عند الحضور للمعمل.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    الفرع الأقرب أو خدمة السحب المنزلي
                  </label>
                  <div className="relative">
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white pr-10 pl-4 py-2.5 text-sm text-slate-900 focus:border-[#8B1E2D] focus:ring-2 focus:ring-rose-500/20 outline-none transition"
                    >
                      {settings.branches.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                    <MapPin className="absolute right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    ملاحظات أو الفحص المطلوب (اختياري)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="مثال: أود إجراء الفحص يوم السبت القادم"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-[#8B1E2D] focus:ring-2 focus:ring-rose-500/20 outline-none transition"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#B91C1C] py-3 px-6 text-sm font-bold text-white shadow-md hover:from-[#731925] hover:to-[#991B1B] active:scale-[0.99] transition"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    <span>تأكيد البيانات والحصول على الكوبون الرسمي</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Voucher Confirmed View */
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                  <Check className="h-6 w-6 stroke-[3]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  تم تسجيل جائزتك بنجاح!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  احفظ الكارت أو أرسل الرسالة فوراً لواتساب المعمل المسجل لتأكيد تفعيل الخصم.
                </p>
              </div>

              {/* Render the medical voucher card */}
              <VoucherCard claim={claim} labName={settings.labNameAr} hotline={settings.hotline} />

              {/* WhatsApp Call to Action (Primary requested feature!) */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-center">
                <div className="text-xs font-semibold text-emerald-800 mb-1">
                  الخطوة الأخيرة: تفعيل الجائزة مع المعمل
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  اضغط أدناه لفتح محادثة واتساب الرسمية مع معامل رامي مختار وإرسال بيانات الكوبون لتفعيله فوراً:
                </p>
                <a
                  href={buildWhatsAppUrl(settings.whatsappNumber, claim, settings.labNameAr)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 px-5 text-sm font-bold text-white shadow-md transition active:scale-[0.99]"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>إرسال بيانات الكوبون إلى واتساب المعمل الآن</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={copyCouponCode}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-2 font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  {copiedCode ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-slate-600" />
                      <span>نسخ الكود</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrint}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-2 font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  <Printer className="h-4 w-4 text-slate-600" />
                  <span>طباعة / حفظ</span>
                </button>

                <button
                  onClick={handleShareApp}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-2 font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  <Share2 className="h-4 w-4 text-slate-600" />
                  <span>مشاركة المسابقة</span>
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={onClose}
                  className="text-xs text-slate-500 hover:text-slate-800 transition underline underline-offset-4"
                >
                  العودة للرئيسية والمسابقات
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
