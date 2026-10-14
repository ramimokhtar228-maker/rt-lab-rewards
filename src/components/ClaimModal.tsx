import React, { useState } from 'react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!patientName.trim()) {
      setError('يرجى إدخال اسم المريض ثلاثي.');
      return;
    }

    const clean = phone.replace(/\D/g, '');
    if (!clean || clean.length < 9) {
      setError('يرجى إدخال رقم هاتف محمول صحيح (مثال: 01012345678) للتواصل وإرسال التأكيد.');
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

    // Save claim across both local storage, Server API, and GitHub repository!
    await saveClaim(newClaim);
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
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-rose-50 text-[#8B1E2D] border border-rose-200 shadow-sm flex items-center justify-center shrink-0">
                    <Gift className="h-7 w-7 sm:h-8 sm:w-8 text-[#8B1E2D]" />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#8B1E2D]">
                  <Sparkles className="h-4 w-4" />
                  <span>مبروك! لقد ربحت هدية معتمدة من معامل رامي مختار</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {prize.title}
                </h3>

                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8B1E2D] to-rose-700 px-4 py-1.5 text-xs sm:text-sm font-black text-white shadow-sm">
                  <span>قيمة الخصم: {prize.discountValue}</span>
                </div>

                <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto">
                  يرجى كتابة الاسم ورقم الهاتف المعتمد لتسجيل الكوبون فوراً في سيستم المعمل وإرسال تأكيد الحجز لحضرتك عبر الواتساب.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-right">
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    الاسم بالكامل (ثلاثي) <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="أدخل اسم المريض..."
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3 text-sm text-slate-900 outline-none transition focus:border-[#8B1E2D] focus:bg-white focus:ring-2 focus:ring-rose-500/20"
                    />
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    رقم الهاتف المحمول (واتساب) <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="مثال: 01012345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3 text-sm text-slate-900 font-mono text-right outline-none transition focus:border-[#8B1E2D] focus:bg-white focus:ring-2 focus:ring-rose-500/20"
                    />
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    سيتم إرسال رسالة تأكيد الحجز والكوبون إلى هذا الرقم مباشرة.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    الفرع المفضل للاستفادة من الخصم
                  </label>
                  <div className="relative">
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3 text-sm text-slate-900 outline-none transition focus:border-[#8B1E2D] focus:bg-white"
                    >
                      {settings.branches.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    ملاحظات أو نوع التحليل المطلوب (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: فحص شامل، تحليل سكر، أو طلب سحب منزلي..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3 text-sm text-slate-900 outline-none transition focus:border-[#8B1E2D] focus:bg-white"
                  />
                </div>

                {/* 24-Hour Notice Banner */}
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2.5 text-xs text-amber-900">
                  <Clock className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">قاعدة الصلاحية الصارمة:</span>
                    <p className="mt-0.5 text-amber-800 text-[11px] leading-relaxed">
                      هذا الكوبون صالح لمدة <span className="font-bold underline">24 ساعة فقط</span> من الآن. يتم تسجيله في نظام المعمل المركزي وتأكيد الحجز فوراً.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-gradient-to-r from-[#8B1E2D] to-rose-700 p-3.5 text-center text-sm font-black text-white shadow-lg shadow-rose-900/20 hover:from-[#731925] hover:to-rose-800 active:scale-98 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{isSubmitting ? 'جارٍ تسجيل الكوبون في السيستم...' : 'تسجيل الكوبون وتأكيد الفوز فوراً'}</span>
                </button>
              </form>
            </div>
          ) : (
            /* Successful Claim Card View */
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-2">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  تم تسجيل الكوبون في النظام بنجاح! 🎉
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  تم ربط الكوبون برقم هاتفك المسجل، وتم إخطار قسم الاستقبال بالمعمل لمتابعة حجزك.
                </p>
              </div>

              {/* Voucher Preview */}
              <VoucherCard claim={claim} settings={settings} />

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {/* Send via WhatsApp Button */}
                <a
                  href={buildWhatsAppUrl(
                    settings.whatsappNumber,
                    claim,
                    settings.labNameAr,
                    settings.sloganAr
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 p-3.5 text-sm font-bold text-white shadow-md transition"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>إرسال تفاصيل الكوبون عبر الواتساب للمعمل</span>
                  <ExternalLink className="h-4 w-4 opacity-80" />
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={copyCouponCode}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 p-2.5 text-xs font-bold text-slate-700 shadow-sm transition"
                  >
                    {copiedCode ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedCode ? 'تم نسخ الكود!' : 'نسخ كود الكوبون'}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 p-2.5 text-xs font-bold text-slate-700 shadow-sm transition"
                  >
                    <Printer className="h-4 w-4" />
                    <span>طباعة الكوبون</span>
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 p-2.5 text-center text-xs font-bold text-slate-700 transition"
                >
                  إغلاق ومتابعة التصفح
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
