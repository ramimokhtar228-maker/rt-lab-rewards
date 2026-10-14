import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Gift,
  MapPin,
  MessageCircle,
  Phone,
  Printer,
  Share2,
  ShieldAlert,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { GameType, LabSettings, PatientClaim, Prize } from '../types';
import {
  buildWhatsAppUrl,
  generateCouponCode,
  recordPlaySession,
  saveClaim,
} from '../services/storageService';
import { VoucherCard } from './VoucherCard';
import { labLogo } from '../assets/images';

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
  const [branch, setBranch] = useState(
    settings.branches[0]?.name || 'الفرع الرئيسي (بهتيم - شبرا الخيمة)'
  );
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claim, setClaim] = useState<PatientClaim | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 90,
        spread: 80,
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
    const expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const newClaim: PatientClaim = {
      id: 'claim-' + Date.now(),
      couponCode: generateCouponCode(),
      patientName: patientName.trim(),
      phone: phone.trim(),
      branch,
      prizeId: prize.id,
      prizeTitle: prize.title,
      discountValue: prize.discountValue,
      gameType,
      createdAt: now.toLocaleString('ar-EG', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      createdAtTimestamp: now.getTime(),
      expiresAt: expiryDate.toLocaleString('ar-EG', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      expiresAtTimestamp: expiryDate.getTime(),
      status: 'pending',
      notes: notes.trim() || undefined,
    };

    saveClaim(newClaim);
    recordPlaySession(newClaim);
    onSuccess(newClaim);
    setClaim(newClaim);
    setIsSubmitting(false);

    // Auto-open WhatsApp after registration if enabled
    if (settings.autoOpenWhatsApp) {
      setTimeout(() => {
        const waUrl = buildWhatsAppUrl(
          settings.whatsappNumber,
          newClaim,
          settings.labNameAr,
          settings.sloganAr
        );
        window.open(waUrl, '_blank');
      }, 700);
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
    const shareText = `جرّب حظك في مسابقات معامل رامي مختار (${settings.sloganAr}) واكسب كروت خصم وفحوصات مجانية! 🎁🩺\n${url}`;
    if (navigator.share) {
      navigator
        .share({
          title: 'جوائز معامل رامي مختار',
          text: shareText,
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      alert('تم نسخ رابط المسابقة بنجاح! يمكنك إرساله لأصدقائك عبر الواتساب.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 overflow-y-auto backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden my-4 border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Top Accent Gradient */}
        <div className="h-2.5 sm:h-3 bg-gradient-to-r from-[#8B1E2D] via-[#D97706] to-[#0F2B5C] shrink-0" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 sm:top-5 sm:left-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition z-10"
          aria-label="إغلاق"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-4 sm:p-8 overflow-y-auto">
          {!claim ? (
            /* Registration Form View */
            <div>
              {/* Header */}
              <div className="text-center mb-5">
                <div className="flex items-center justify-center gap-2.5 mb-2.5">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl overflow-hidden border border-rose-200 bg-white p-1 shadow-sm shrink-0">
                    <img
                      src={labLogo}
                      alt="معامل رامي مختار RT Labs"
                      className="h-full w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-rose-50 text-[#8B1E2D] border border-rose-200 shadow-sm flex items-center justify-center shrink-0">
                    <Gift className="h-7 w-7 sm:h-8 sm:w-8 text-[#8B1E2D]" />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#8B1E2D]">
                  <Sparkles className="h-4 w-4" />
                  <span>مبروك! لقد ربحت هدية معتمدة من معامل رامي مختار</span>
                </div>

                <h3 className="text-lg sm:text-2xl font-black text-slate-900 mt-1">
                  {prize.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#8B1E2D] font-bold mt-0.5">
                  {settings.sloganAr}
                </p>
              </div>

              {/* 24-Hour Expiry Rule Notice */}
              <div className="mb-4 rounded-xl sm:rounded-2xl border border-amber-300 bg-amber-50/80 p-3 flex items-start gap-2.5 text-xs text-amber-950">
                <Clock className="h-4 w-4 text-amber-800 shrink-0 mt-0.5" />
                <div className="text-[11px] sm:text-xs leading-relaxed">
                  <strong>قاعدة الـ 24 ساعة الإلزامية:</strong> يسري هذا الكوبون لمدة{' '}
                  <strong>24 ساعة فقط</strong>. في حال عدم تفعيل الجائزة وحجز موعد الفحص خلال 24
                  ساعة يتم إلغاؤها تلقائياً.
                </div>
              </div>

              {error && (
                <div className="mb-3 rounded-xl bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
                  {error}
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    اسم المريض ثلاثي <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="مثال: أحمد محمد علي"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 pr-9 text-sm text-slate-900 focus:border-[#8B1E2D] focus:ring-2 focus:ring-rose-500/20 outline-none transition"
                    />
                    <User className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    رقم الهاتف المحمول / الواتساب <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 pr-9 text-sm text-slate-900 focus:border-[#8B1E2D] focus:ring-2 focus:ring-rose-500/20 outline-none transition font-mono text-left"
                      dir="ltr"
                    />
                    <Phone className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    الفرع المفضل لاستخدام الكوبون أو طلب السحب المنزلي
                  </label>
                  <div className="relative">
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 pr-9 text-xs sm:text-sm text-slate-900 focus:border-[#8B1E2D] focus:ring-2 focus:ring-rose-500/20 outline-none transition cursor-pointer"
                    >
                      {settings.branches.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <MapPin className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ملاحظات أو الفحص المطلوب (اختياري)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="مثال: موعد الحجز المفضل غداً صباحاً"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs sm:text-sm text-slate-900 focus:border-[#8B1E2D] focus:ring-2 focus:ring-rose-500/20 outline-none transition"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#B91C1C] py-3.5 px-4 text-xs sm:text-sm font-bold text-white shadow-md hover:from-[#731925] hover:to-[#991B1B] active:scale-[0.99] transition cursor-pointer"
                  >
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    <span>تأكيد البيانات وتوليد كود الخصم الفوري</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Voucher Confirmed View */
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-11 w-11 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                  <Check className="h-6 w-6 stroke-[3]" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-slate-900">
                  تم تسجيل كود الكوبون بنجاح!
                </h3>
                <p className="text-xs text-rose-800 font-bold mt-0.5">
                  {settings.sloganAr}
                </p>
              </div>

              {/* Render the medical voucher card */}
              <VoucherCard
                claim={claim}
                labName={settings.labNameAr}
                hotline={settings.hotline}
              />

              {/* 24-hour Expiry Warning Box */}
              <div className="rounded-xl sm:rounded-2xl border border-rose-300 bg-rose-50 p-3 sm:p-3.5 flex items-start gap-2.5 text-xs text-rose-950">
                <ShieldAlert className="h-4 w-4 text-[#8B1E2D] shrink-0 mt-0.5" />
                <div className="text-[11px] sm:text-xs leading-relaxed">
                  <strong>تنبيه الصلاحية:</strong> ينتهي هذا الكوبون بعد <strong>24 ساعة</strong> من
                  الآن. يرجى الضغط على الزر الأخضر أدناه لإرسال الرسالة إلى واتساب المعمل لتثبيت الخصم
                  في ملفك.
                </div>
              </div>

              {/* WhatsApp Call to Action */}
              <div className="rounded-xl sm:rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 sm:p-4 text-center">
                <div className="text-xs font-semibold text-emerald-800 mb-1">
                  الخطوة الأخيرة: تفعيل الجائزة مع المعمل
                </div>
                <p className="text-[11px] sm:text-xs text-slate-600 mb-2.5">
                  اضغط أدناه لفتح محادثة واتساب الرسمية مع معامل رامي مختار وإرسال بيانات الكوبون
                  لتثبيتها:
                </p>
                <a
                  href={buildWhatsAppUrl(
                    settings.whatsappNumber,
                    claim,
                    settings.labNameAr,
                    settings.sloganAr
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3.5 px-4 text-xs sm:text-sm font-bold text-white shadow-md transition active:scale-[0.99]"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>إرسال بيانات الكوبون إلى واتساب المعمل</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-xs">
                <button
                  onClick={copyCouponCode}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 py-2 sm:py-2.5 px-1 sm:px-2 font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  {copiedCode ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-700 font-bold text-[10px] sm:text-xs">
                        تم النسخ!
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-slate-500" />
                      <span className="text-[10px] sm:text-xs">نسخ الكود</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrint}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 py-2 sm:py-2.5 px-1 sm:px-2 font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  <Printer className="h-4 w-4 text-slate-500" />
                  <span className="text-[10px] sm:text-xs">طباعة / حفظ</span>
                </button>

                <button
                  onClick={handleShareApp}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 py-2 sm:py-2.5 px-1 sm:px-2 font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  <Share2 className="h-4 w-4 text-[#8B1E2D]" />
                  <span className="text-[10px] sm:text-xs">مشاركة</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
