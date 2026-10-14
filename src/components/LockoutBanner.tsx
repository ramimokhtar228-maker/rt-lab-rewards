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
    <div className="w-full max-w-4xl mx-auto my-4 sm:my-6 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-amber-300 bg-amber-50/90 shadow-lg text-slate-900">
      <div className="flex flex-col md:flex-row items-center justify-between gap-5 pb-5 border-b border-amber-200">
        <div className="space-y-1.5 text-center md:text-right w-full md:w-auto">
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-black text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full border border-amber-300">
            <Clock className="h-3.5 w-3.5 text-amber-900 shrink-0" />
            <span>نظام الشفافية · فرصة واحدة كل 24 ساعة</span>
          </div>

          <h3 className="text-lg sm:text-2xl font-black text-slate-900 mt-1">
            لقد شاركت في المسابقة خلال آخر 24 ساعة
          </h3>

          <p className="text-xs sm:text-sm text-slate-700 max-w-lg leading-relaxed">
            وفقاً لسياسة معامل رامي مختار، يحق لكل مريض تجربة وسيلة ترفيهية واحدة كل 24 ساعة. يمكنك
            المحاولة مرة أخرى بعد انتهاء العد التنازلي أو بدء مسابقة جديدة فوراً.
          </p>

          {/* Action buttons on mobile: full width for easy tapping */}
          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-2">
            {onResetSession && (
              <button
                type="button"
                onClick={onResetSession}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#681420] text-white text-xs font-bold shadow hover:opacity-95 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>بدء مسابقة جديدة الآن (تجاوز القفل للمريض)</span>
              </button>
            )}
            {onOpenPatientShare && (
              <button
                type="button"
                onClick={onOpenPatientShare}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>إرسال رابط مسابقة للمريض عبر واتساب</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Digital Countdown Clock: fluid responsive */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 bg-slate-900 text-white p-3 sm:p-4 rounded-2xl shadow-xl border border-amber-400/40 shrink-0">
          <div className="flex flex-col items-center min-w-[46px] sm:min-w-[56px]">
            <span className="text-xl sm:text-3xl font-mono font-black text-amber-400">
              {String(hours).padStart(2, '0')}
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">ساعة</span>
          </div>
          <span className="text-lg sm:text-xl font-bold text-amber-400 -mt-2.5">:</span>
          <div className="flex flex-col items-center min-w-[46px] sm:min-w-[56px]">
            <span className="text-xl sm:text-3xl font-mono font-black text-amber-400">
              {String(minutes).padStart(2, '0')}
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">دقيقة</span>
          </div>
          <span className="text-lg sm:text-xl font-bold text-amber-400 -mt-2.5">:</span>
          <div className="flex flex-col items-center min-w-[46px] sm:min-w-[56px]">
            <span className="text-xl sm:text-3xl font-mono font-black text-amber-400 animate-pulse">
              {String(seconds).padStart(2, '0')}
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">ثانية</span>
          </div>
        </div>
      </div>

      {/* Prominent Cancellation Warning */}
      <div className="mt-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-100/90 border border-rose-300 flex items-start gap-2.5 text-rose-950">
        <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5 text-rose-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <strong>تنبيه هام ومشدد:</strong> في حال عدم استخدام الجائزة أو حجز موعد التحاليل بالمعمل
          خلال الـ <strong>24 ساعة</strong> الحالية من لحظة الفوز، يتم إلغاء الكوبون تلقائياً ولا
          يجوز المطالبة به لاحقاً.
        </div>
      </div>

      {/* Active Coupon Card View */}
      {activeCoupon && (
        <div className="mt-5 pt-4 border-t border-amber-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-3">
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl shadow transition"
            >
              <MessageCircle className="h-4 w-4" />
              <span>إرسال لواتساب المعمل لتأكيد الحجز</span>
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
