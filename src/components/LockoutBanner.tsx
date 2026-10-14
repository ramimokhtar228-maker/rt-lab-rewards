import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Clock,
  ExternalLink,
  MessageCircle,
  RotateCcw,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { LabSettings, PatientClaim } from '../types';
import { buildWhatsAppUrl } from '../services/storageService';
import { VoucherCard } from './VoucherCard';

interface LockoutBannerProps {
  remainingHours: number;
  remainingMinutes: number;
  remainingSeconds: number;
  activeCoupon: PatientClaim | null;
  settings: LabSettings;
  onRefresh: () => void;
  onResetSession?: () => void;
  onOpenPatientShare?: () => void;
}

export const LockoutBanner: React.FC<LockoutBannerProps> = ({
  remainingHours: initialHours,
  remainingMinutes: initialMinutes,
  remainingSeconds: initialSeconds,
  activeCoupon,
  settings,
  onRefresh,
  onResetSession,
  onOpenPatientShare,
}) => {
  const [totalSeconds, setTotalSeconds] = useState(
    initialHours * 3600 + initialMinutes * 60 + initialSeconds
  );

  useEffect(() => {
    setTotalSeconds(initialHours * 3600 + initialMinutes * 60 + initialSeconds);
  }, [initialHours, initialMinutes, initialSeconds]);

  useEffect(() => {
    if (totalSeconds <= 0) {
      onRefresh();
      return;
    }
    const timer = setInterval(() => {
      setTotalSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onRefresh();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [totalSeconds, onRefresh]);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="w-full max-w-4xl mx-auto my-6 p-6 rounded-3xl border border-amber-300 bg-amber-50/80 shadow-lg text-slate-900">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-amber-200">
        <div className="space-y-1 text-center md:text-right">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full border border-amber-300">
            <Clock className="h-4 w-4 text-amber-900" />
            <span>نظام الشفافية والمصداقية · فرصة واحدة كل 24 ساعة</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            لقد شاركت في المسابقة خلال آخر 24 ساعة
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 max-w-lg leading-relaxed">
            وفقاً لسياسة معامل رامي مختار، يحق لكل مريض تجربة وسيلة ترفيهية واحدة فقط كل 24 ساعة.
            يمكنك المحاولة مرة أخرى بعد انتهاء العد التنازلي أدناه، أو بدء جلسة جديدة برابط المريض.
          </p>

          {/* Action buttons for starting fresh session or sending patient link */}
          <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            {onResetSession && (
              <button
                type="button"
                onClick={onResetSession}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#681420] text-white text-xs font-bold shadow hover:opacity-95 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>بدء مسابقة جديدة الآن (تجاوز القفل للمريض)</span>
              </button>
            )}
            {onOpenPatientShare && (
              <button
                type="button"
                onClick={onOpenPatientShare}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>إرسال رابط مسابقة جديد للمريض عبر واتساب</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Digital Countdown Clock */}
        <div className="flex items-center gap-2 bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-amber-400/40">
          <div className="flex flex-col items-center min-w-[56px]">
            <span className="text-2xl sm:text-3xl font-mono font-black text-amber-400">
              {String(hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">ساعة</span>
          </div>
          <span className="text-xl font-bold text-amber-400 -mt-3">:</span>
          <div className="flex flex-col items-center min-w-[56px]">
            <span className="text-2xl sm:text-3xl font-mono font-black text-amber-400">
              {String(minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">دقيقة</span>
          </div>
          <span className="text-xl font-bold text-amber-400 -mt-3">:</span>
          <div className="flex flex-col items-center min-w-[56px]">
            <span className="text-2xl sm:text-3xl font-mono font-black text-amber-400 animate-pulse">
              {String(seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">ثانية</span>
          </div>
        </div>
      </div>

      {/* Prominent Cancellation Warning */}
      <div className="mt-4 p-4 rounded-2xl bg-rose-100/90 border border-rose-300 flex items-start gap-3 text-rose-950">
        <ShieldAlert className="h-5 w-5 text-rose-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <strong>تنبيه هام ومشدد:</strong> في حال عدم استخدام الجائزة أو حجز موعد التحاليل بالمعمل
          خلال الـ <strong>24 ساعة</strong> الحالية من لحظة الفوز، يتم إلغاء الكوبون تلقائياً ولا
          يجوز المطالبة به لاحقاً.
        </div>
      </div>

      {/* Active Coupon Card View */}
      {activeCoupon && (
        <div className="mt-6 pt-4 border-t border-amber-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-[#8B1E2D]" />
              كوبونك الحالي النشط قيد الانتظار:
            </span>
            <a
              href={buildWhatsAppUrl(
                settings.whatsappNumber,
                activeCoupon,
                settings.labNameAr,
                settings.sloganAr
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl shadow transition"
            >
              <MessageCircle className="h-4 w-4" />
              <span>إرسال لواتساب المعمل لتأكيد الحجز فوراً</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <VoucherCard
            claim={activeCoupon}
            labName={settings.labNameAr}
            hotline={settings.hotline}
          />
        </div>
      )}
    </div>
  );
};
