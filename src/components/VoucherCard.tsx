import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Gift,
  MapPin,
  Phone,
  QrCode,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { LabSettings, PatientClaim } from '../types';
import { labLogo } from '../assets/images';

interface VoucherCardProps {
  claim: PatientClaim;
  settings: LabSettings;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({ claim, settings }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-[#8B1E2D]/40 bg-gradient-to-br from-rose-50/80 via-white to-amber-50/60 p-5 shadow-sm text-right">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-rose-200/80 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl overflow-hidden bg-white border border-rose-200 p-0.5 shadow-sm shrink-0">
            <img src={labLogo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h4 className="font-bold text-[#8B1E2D] text-sm">{settings.labNameAr}</h4>
            <p className="text-[10px] text-slate-500 font-medium">{settings.sloganAr}</p>
          </div>
        </div>

        <div className="text-left">
          <span className="inline-block rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-black text-[#8B1E2D] border border-rose-300">
            كوبون خصم معتمد
          </span>
        </div>
      </div>

      {/* Prize Details */}
      <div className="text-center py-2 bg-white/80 rounded-xl border border-rose-100 mb-3 shadow-sm">
        <span className="text-[11px] font-bold text-slate-500 block mb-0.5">الجائزة المكتسبة</span>
        <h3 className="text-base sm:text-lg font-black text-slate-900 px-2">{claim.prizeTitle}</h3>
        <div className="inline-block mt-1 bg-gradient-to-r from-[#8B1E2D] to-rose-700 text-white font-extrabold text-sm sm:text-base px-4 py-1 rounded-full shadow-sm">
          قيمة المكافأة: {claim.discountValue}
        </div>
      </div>

      {/* Coupon Code Section */}
      <div className="bg-slate-900 text-white rounded-xl p-3 flex items-center justify-between mb-3 shadow-inner">
        <div>
          <span className="text-[10px] text-slate-400 block">كود الكوبون الحصري</span>
          <span className="font-mono text-lg font-black tracking-widest text-amber-400">
            {claim.couponCode}
          </span>
        </div>
        <div className="text-left">
          <span className="text-[10px] text-slate-400 block">صلاحية الكوبون</span>
          <div className="flex items-center gap-1 text-[11px] font-bold text-rose-300">
            <Clock className="h-3.5 w-3.5" />
            <span>24 ساعة فقط</span>
          </div>
        </div>
      </div>

      {/* Patient info */}
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 mb-3 bg-white/70 p-2.5 rounded-lg border border-slate-100">
        <div>
          <span className="text-[10px] text-slate-400 block">اسم المريض</span>
          <span className="font-bold text-slate-900">{claim.patientName}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">رقم الهاتف</span>
          <span className="font-mono font-bold text-slate-900 dir-ltr text-right block">
            {claim.phone}
          </span>
        </div>
        <div className="col-span-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 flex items-center gap-1">
            <MapPin className="h-3 w-3 text-[#8B1E2D]" />
            {claim.branch}
          </span>
          <span className="text-amber-800 font-semibold">ينتهي: {claim.expiresAt}</span>
        </div>
      </div>

      {/* Terms badge */}
      <div className="text-[10px] text-slate-500 leading-tight bg-rose-50/70 p-2 rounded border border-rose-200/50 flex items-start gap-1.5">
        <ShieldAlert className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
        <span>
          يلزم إظهار هذا الكوبون أو رسالة الواتساب لموظف الاستقبال بالمعمل أو أخصائي السحب المنزلي لتفعيل الخصم قبل انتهاء مهلة الـ 24 ساعة.
        </span>
      </div>
    </div>
  );
};
