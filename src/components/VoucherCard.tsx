import React from 'react';
import { Award, Calendar, CheckCircle2, Clock, MapPin, Phone, ShieldAlert, ShieldCheck } from 'lucide-react';
import { PatientClaim } from '../types';
import { labLogo } from '../assets/images';

interface VoucherCardProps {
  claim: PatientClaim;
  labName?: string;
  hotline?: string;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({
  claim,
  labName = 'معامل د. رامي مختار للتحاليل الطبية (RT Labs)',
  hotline = '01100046841',
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0F2B5C] via-[#162A4D] to-[#8B1E2D] p-1 text-white shadow-xl max-w-full">
      {/* Decorative background watermark */}
      <div className="absolute -left-12 -top-12 h-36 w-36 sm:h-44 sm:w-44 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />
      <div className="absolute -right-12 -bottom-12 h-36 w-36 sm:h-44 sm:w-44 rounded-full bg-blue-500/15 blur-2xl pointer-events-none" />

      <div className="relative rounded-xl sm:rounded-2xl border border-white/15 bg-slate-900/85 p-3.5 sm:p-6 backdrop-blur-md">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-3 sm:pb-4 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 overflow-hidden rounded-xl border border-rose-300/30 bg-white p-0.5 shadow">
              <img
                src={labLogo}
                alt="RT Labs Logo"
                className="h-full w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs font-semibold text-rose-300 tracking-wider">
                كوبون خصم طبي رسمي معتمد
              </div>
              <h4 className="text-xs sm:text-base font-bold text-white truncate">{labName}</h4>
              <div className="text-[10px] sm:text-[11px] text-amber-300 font-bold truncate">
                التشخيص الصحيح يبدأ معنا
              </div>
            </div>
          </div>
          <div className="text-left shrink-0">
            <span className="inline-flex items-center gap-1 rounded bg-rose-500/20 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold text-rose-300 border border-rose-500/30">
              <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              موثق
            </span>
          </div>
        </div>

        {/* Prize Main Callout */}
        <div className="my-3.5 sm:my-5 rounded-xl sm:rounded-2xl bg-white/5 p-3 sm:p-4 text-center border border-white/10">
          <div className="text-[10px] sm:text-xs text-slate-300 mb-0.5">المكافأة المكتسبة للمريض</div>
          <div className="text-base sm:text-2xl font-black text-rose-300 tracking-tight leading-snug">
            {claim.prizeTitle}
          </div>
          <div className="mt-1.5 inline-block rounded-full bg-rose-950/70 border border-rose-400/40 px-3 py-0.5 text-xs sm:text-sm font-bold text-rose-200">
            قيمة الخصم: {claim.discountValue}
          </div>
        </div>

        {/* Patient & Voucher Details Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
          <div className="rounded-xl bg-black/20 p-2 sm:p-2.5 border border-white/5">
            <span className="text-slate-400 block text-[10px] sm:text-xs">اسم المريض</span>
            <span className="font-semibold text-white truncate block text-[11px] sm:text-sm">
              {claim.patientName}
            </span>
          </div>
          <div className="rounded-xl bg-black/20 p-2 sm:p-2.5 border border-white/5">
            <span className="text-slate-400 block text-[10px] sm:text-xs">رقم الهاتف</span>
            <span className="font-semibold text-white font-mono dir-ltr text-right block text-[11px] sm:text-sm">
              {claim.phone}
            </span>
          </div>
          <div className="rounded-xl bg-black/20 p-2 sm:p-2.5 border border-white/5">
            <span className="text-slate-400 block text-[10px] sm:text-xs flex items-center gap-1">
              <MapPin className="h-3 w-3 text-rose-400 shrink-0" /> الفرع المختار
            </span>
            <span className="font-semibold text-white truncate block text-[11px] sm:text-sm">
              {claim.branch}
            </span>
          </div>
          <div className="rounded-xl bg-black/20 p-2 sm:p-2.5 border border-white/5">
            <span className="text-rose-300 block text-[10px] sm:text-xs flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-400 shrink-0" /> ينتهي خلال (24 ساعة)
            </span>
            <span className="font-bold text-amber-300 block text-[10px] sm:text-xs truncate">
              {claim.expiresAt}
            </span>
          </div>
        </div>

        {/* Barcode & Coupon Code Area */}
        <div className="mt-3.5 sm:mt-5 pt-3 sm:pt-4 border-t border-dashed border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="text-center sm:text-right">
            <span className="text-[10px] sm:text-xs text-slate-400 block">كود الكوبون الفريد</span>
            <div className="text-base sm:text-xl font-mono font-black text-white tracking-widest bg-black/40 px-3 py-1 rounded-lg border border-rose-500/40 inline-block mt-0.5">
              {claim.couponCode}
            </div>
          </div>

          {/* Simulated Medical Barcode */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-0.5 h-7 sm:h-8 px-2 py-1 bg-white rounded-md">
              {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2].map((w, i) => (
                <div
                  key={i}
                  className="bg-slate-900 h-full"
                  style={{ width: `${w}px` }}
                />
              ))}
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono mt-0.5">
              RT-AUTH-{claim.couponCode}
            </span>
          </div>
        </div>

        {/* Footer info with 24h cancellation rule */}
        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[10px] sm:text-[11px] text-slate-300 text-center sm:text-right">
          <span>الخط الساخن: {hotline}</span>
          <span className="text-amber-300 font-semibold flex items-center justify-center gap-1">
            <ShieldAlert className="h-3 w-3 shrink-0" />
            يُلغى الكوبون تلقائياً بعد 24 ساعة في حال عدم الحجز
          </span>
        </div>
      </div>
    </div>
  );
};
