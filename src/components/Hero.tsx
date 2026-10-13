import React from 'react';
import { ArrowDown, CheckCircle2, Gift, ShieldCheck, Sparkles } from 'lucide-react';
import { labHero } from '../assets/images';

interface HeroProps {
  onScrollToGame: () => void;
  onOpenBranches: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onScrollToGame, onOpenBranches }) => {
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
          {/* Quiet unboxed text kicker */}
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 mb-3">
            <span>معامل د. رامي مختار للتحاليل الطبية</span>
            <span aria-hidden="true">·</span>
            <span>برنامج مكافآت المرضى اليومي</span>
          </div>

          {/* Hero headline with balanced text */}
          <h1
            className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight"
            style={{ textWrap: 'balance' }}
          >
            جرّب حظك اليومي واكسب <span className="text-rose-400">خصومات فورية</span> وكروت فحص مجانية
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            مرحباً بك في منصة مكافآت معامل رامي مختار (RT Labs). اختر لعبتك المفضلة من عجلة الحظ، أو كروت
            الخدش، أو أسئلة الصحة العامة، وسجّل كود هديتك ليصل مباشرة إلى رقم المعمل المعتمد.
          </p>

          {/* Clean unboxed proof points with typographic separators */}
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              أجهزة تشخيص ألمانية معتمدة
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>خصومات حقيقية تصل إلى 50%</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>تفعيل مباشر عبر واتساب المعمل</span>
          </div>

          {/* Action Button */}
          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={onScrollToGame}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#B91C1C] px-6 py-3.5 text-sm font-bold text-white shadow-lg hover:from-[#731925] hover:to-[#991B1B] active:scale-[0.98] transition"
            >
              <Gift className="h-4 w-4" />
              <span>ابدأ اللعب الآن واستلم هديتك</span>
              <ArrowDown className="h-4 w-4" />
            </button>

            <button
              onClick={onOpenBranches}
              className="text-xs font-medium text-slate-300 hover:text-white transition underline underline-offset-4"
            >
              عرض فروع المعمل ومواعيد العمل
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
