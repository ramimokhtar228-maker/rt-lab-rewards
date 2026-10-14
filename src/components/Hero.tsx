import React from 'react';
import { Award, CheckCircle2, Clock, Gift, HeartPulse, Sparkles, Trophy } from 'lucide-react';
import { LabSettings } from '../types';

interface HeroProps {
  settings: LabSettings;
  onScrollToGames: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onScrollToGames }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#8B1E2D] to-[#0F2B5C] text-white py-8 sm:py-12 px-4 sm:px-6">
      {/* Background circles decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center space-y-4">
        {/* Quality Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-amber-300 border border-white/15 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin" />
          <span>مسابقات وجوائز المرضى الحصرية من معامل RT</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
          العب واربح خصومات وفحوصات طبية فورية 🩺🎁
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-base text-rose-100 max-w-2xl mx-auto leading-relaxed">
          يسر إدارة <strong className="text-white font-bold">{settings.labNameAr}</strong> إهداء رواد المعمل كوبونات خصم معتمدة وصالحة لمدة 24 ساعة في جميع الفروع ومع خدمة السحب المنزلي.
        </p>

        {/* Guarantee Pills */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10 font-semibold">
            <Clock className="h-3.5 w-3.5 text-amber-300" />
            <span>صلاحية 24 ساعة</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
            <span>تأكيد الحجز فوري عبر الواتساب</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10 font-semibold">
            <Award className="h-3.5 w-3.5 text-amber-300" />
            <span>خصومات حقيقية تصل إلى 100%</span>
          </div>
        </div>

        {/* Play Now CTA */}
        <div className="pt-3">
          <button
            onClick={onScrollToGames}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-98 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/20 transition transform hover:-translate-y-0.5 inline-flex items-center gap-2 cursor-pointer"
          >
            <Trophy className="h-5 w-5 text-slate-950" />
            <span>اختر لعبتك المفضلة وابدأ الآن!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
