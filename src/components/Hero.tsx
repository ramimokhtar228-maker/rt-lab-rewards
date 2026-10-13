import React from 'react';
import { ArrowDown, CheckCircle2, Clock, Gift, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { labLogo, labReception } from '../assets/images';

interface HeroProps {
  onScrollToGame: () => void;
  onOpenBranches: () => void;
  onOpenPolicy: () => void;
  slogan?: string;
}

export const Hero: React.FC<HeroProps> = ({
  onScrollToGame,
  onOpenBranches,
  onOpenPolicy,
  slogan = 'التشخيص الصحيح يبدأ معنا',
}) => {
  return (
    <section className="relative overflow-hidden bg-slate-900 text-white">
      {/* Background with lab image and dark contrast scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={labReception}
          alt="معامل رامي مختار للتحاليل الطبية"
          className="h-full w-full object-cover opacity-20"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/95 to-slate-900/85" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Main Copy */}
          <div className="lg:col-span-7">
            {/* Quiet unboxed text kicker with slogan */}
            <div className="flex items-center gap-2 text-xs font-bold text-rose-300 mb-3">
              <span>معامل د. رامي مختار (RT Labs)</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-300">{slogan}</span>
            </div>

            {/* Hero headline with balanced text */}
            <h1
              className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight"
              style={{ textWrap: 'balance' }}
            >
              جرّب حظك اليومي واكسب <span className="text-rose-400">خصومات وفحوصات مجانية</span>
            </h1>

            <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              مرحباً بك في منصة مكافآت المرضى الرسمية لمعامل رامي مختار. اختر وسيلتك الترفيهية المفضلة (عجلة
              الحظ، كارت الخدش، مسابقة المعلومات، أو صندوق المفاجآت) واحصل على كود خصم طبي فوري صالح لمدة 24
              ساعة.
            </p>

            {/* 24-hour transparency rule chip */}
            <div className="mt-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 flex items-start gap-2.5 text-xs text-rose-200">
              <Clock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">ضوابط المسابقة للمصداقية:</strong> يحق لكل مريض اختيار لعبة
                واحدة فقط كل <strong>24 ساعة</strong>. ينتهي الكوبون تلقائياً بعد 24 ساعة إذا لم يتم الحجز في
                المعمل.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={onScrollToGame}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#B91C1C] px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg hover:from-[#731925] hover:to-[#991B1B] active:scale-[0.98] transition cursor-pointer"
              >
                <Gift className="h-4 w-4" />
                <span>جرب حظك الآن واحصل على الكوبون</span>
                <ArrowDown className="h-4 w-4" />
              </button>

              <button
                onClick={onOpenPolicy}
                className="text-xs font-semibold text-amber-300 hover:text-white transition underline underline-offset-4 cursor-pointer"
              >
                قراءة سياسة المكافآت والـ 24 ساعة
              </button>
            </div>
          </div>

          {/* Visual Showcase Card (Attached Lab Logo & Clinic Reception Image) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border border-white/20 bg-slate-800/80 shadow-2xl backdrop-blur-md p-3 sm:p-4 group">
              <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-slate-950">
                <img
                  src={labReception}
                  alt="صالة استقبال معامل رامي مختار"
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-700 opacity-90"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Floating Official Lab Logo Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-2xl px-3 py-1.5 shadow-lg border border-rose-200">
                  <div className="h-9 w-9 rounded-xl overflow-hidden bg-white p-0.5 shrink-0">
                    <img
                      src={labLogo}
                      alt="لوجو معامل رامي مختار"
                      className="h-full w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-black text-[#0F2B5C] leading-tight">معامل رامي مختار</div>
                    <div className="text-[9px] font-bold text-[#8B1E2D]">RT Labs</div>
                  </div>
                </div>

                {/* Bottom Image Caption & Branch Button */}
                <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span>{slogan}</span>
                    </div>
                    <div className="text-[11px] text-slate-300">صالة استقبال فندقية وأعلى دقة معملية</div>
                  </div>

                  <button
                    onClick={onOpenBranches}
                    className="inline-flex items-center gap-1 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold text-white border border-white/25 transition cursor-pointer"
                  >
                    <MapPin className="h-3 w-3 text-rose-300" />
                    <span>الفروع</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
