import React from 'react';
import { ArrowDown, CheckCircle2, Clock, Gift, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react';
import { labHero } from '../assets/images';

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
          src={labHero}
          alt="معامل رامي مختار للتحاليل الطبية"
          className="h-full w-full object-cover opacity-25"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-slate-900/80" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="max-w-2xl">
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
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#B91C1C] px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg hover:from-[#731925] hover:to-[#991B1B] active:scale-[0.98] transition"
            >
              <Gift className="h-4 w-4" />
              <span>جرب حظك الآن واحصل على الكوبون</span>
              <ArrowDown className="h-4 w-4" />
            </button>

            <button
              onClick={onOpenPolicy}
              className="text-xs font-semibold text-amber-300 hover:text-white transition underline underline-offset-4"
            >
              قراءة سياسة المكافآت والـ 24 ساعة
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
