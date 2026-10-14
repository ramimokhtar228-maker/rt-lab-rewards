import React from 'react';
import { Award, CheckCircle2, Clock, Gift, HeartPulse, MapPin, Phone, Sparkles, Trophy } from 'lucide-react';
import { LabSettings } from '../types';
import { labHero, labLogo, labReception, medicalTeam } from '../assets/images';

interface HeroProps {
  settings: LabSettings;
  onScrollToGames: () => void;
  onOpenBranches: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onScrollToGames, onOpenBranches }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#8B1E2D] to-[#0F2B5C] text-white py-8 sm:py-14 px-4 sm:px-6">
      {/* Background circles decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left / Main text content */}
        <div className="lg:col-span-7 text-center lg:text-right space-y-4">
          {/* Logo badge and top quality pill */}
          <div className="inline-flex items-center gap-2.5 rounded-full bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-amber-300 border border-white/20 shadow-sm">
            <Sparkles className="h-4 w-4 text-amber-300 animate-spin" />
            <span>مسابقات وجوائز المرضى الحصرية • معامل RT Labs</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            العب واربح خصومات وفحوصات طبية معتمدة 🩺🎁
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-base text-rose-100 max-w-2xl leading-relaxed">
            يسر إدارة <strong className="text-white font-bold">{settings.labNameAr}</strong> إهداء رواد المعمل كوبونات خصم معتمدة وصالحة لمدة 24 ساعة في جميع الفروع ومع خدمة السحب المنزلي.
          </p>

          {/* Guarantee Pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 text-[11px] sm:text-xs">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10 font-semibold">
              <Clock className="h-3.5 w-3.5 text-amber-300" />
              <span>صلاحية 24 ساعة فقط</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
              <span>تأكيد الحجز فوري عبر الواتساب</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10 font-semibold">
              <Award className="h-3.5 w-3.5 text-amber-300" />
              <span>تحت إشراف كبار استشاريي قصر العيني</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <button
              onClick={onScrollToGames}
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-98 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/20 transition transform hover:-translate-y-0.5 inline-flex items-center gap-2 cursor-pointer"
            >
              <Trophy className="h-5 w-5 text-slate-950" />
              <span>اختر لعبتك وابدأ السحب الآن!</span>
            </button>

            <button
              onClick={onOpenBranches}
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition inline-flex items-center gap-2 cursor-pointer"
            >
              <MapPin className="h-4 w-4 text-rose-300" />
              <span>فروع المعمل والاستقبال</span>
            </button>
          </div>
        </div>

        {/* Right / Visual Photos Showcase */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="relative rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-900 group">
            <img
              src={labReception}
              alt="استقبال معامل د. رامي مختار RT Labs"
              className="w-full h-56 sm:h-64 object-cover object-center group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

            <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-right">
              <div>
                <span className="text-[10px] font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                  صالة الاستقبال وسحب العينات
                </span>
                <h4 className="text-sm font-black text-white mt-1">
                  أعلى مستويات الراحة والتعقيم الطبي
                </h4>
              </div>

              <div className="h-10 w-10 rounded-xl overflow-hidden bg-white p-0.5 border border-white/40 shadow-sm shrink-0">
                <img src={labLogo} alt="Logo" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          {/* Secondary thumb row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative rounded-2xl overflow-hidden border border-white/15 h-24 bg-slate-900 group">
              <img
                src={medicalTeam}
                alt="الفريق الطبي"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-slate-950/50 flex items-end p-2">
                <span className="text-[10px] font-bold text-white">فريق استشاري قصر العيني</span>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-white/15 h-24 bg-slate-900 group">
              <img
                src={labHero}
                alt="أحدث الأجهزة المخبرية"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-slate-950/50 flex items-end p-2">
                <span className="text-[10px] font-bold text-white">أحدث أجهزة الفحص الآلي</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
