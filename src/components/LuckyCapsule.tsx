import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Gift,
  Pill,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Prize } from '../types';
import { playTickSound, playVictoryChime } from '../utils/audio';

interface LuckyCapsuleProps {
  prizes: Prize[];
  onWin: (prize: Prize) => void;
  disabled?: boolean;
}

export const LuckyCapsule: React.FC<LuckyCapsuleProps> = ({
  prizes,
  onWin,
  disabled,
}) => {
  const [isDispensing, setIsDispensing] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);

  // Pick prize by probability weight
  const pickPrize = (): Prize => {
    const activePrizes = prizes.filter((p) => p.active);
    if (activePrizes.length === 0) return prizes[0];

    const totalWeight = activePrizes.reduce((sum, p) => sum + (p.weight || 10), 0);
    let randomNum = Math.random() * totalWeight;

    for (const p of activePrizes) {
      if (randomNum < (p.weight || 10)) {
        return p;
      }
      randomNum -= p.weight || 10;
    }
    return activePrizes[0];
  };

  const handlePullLever = () => {
    if (disabled || isDispensing || isOpened) return;

    setIsDispensing(true);
    const prizeWon = pickPrize();
    setSelectedPrize(prizeWon);

    // Audio clicks
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      playTickSound();
      tickCount++;
      if (tickCount >= 6) {
        clearInterval(tickInterval);
      }
    }, 180);

    // Drop and pop capsule
    setTimeout(() => {
      setIsDispensing(false);
      setIsOpened(true);
      playVictoryChime();

      try {
        confetti({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#8B1E2D', '#D97706', '#0F2B5C', '#10B981', '#F59E0B'],
        });
      } catch {
        // ignore
      }

      setTimeout(() => {
        onWin(prizeWon);
      }, 1200);
    }, 1600);
  };

  const handleReset = () => {
    setIsDispensing(false);
    setIsOpened(false);
    setSelectedPrize(null);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl text-center">
      {/* Header Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs mb-3 shadow-xs">
        <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
        <span>ماكينة كبسولة الحظ والجوائز RT Golden Capsule</span>
      </div>

      <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
        اسحب كبسولتك الصحية الذهبية 💊✨
      </h3>
      <p className="text-xs text-slate-500 mb-6 leading-relaxed">
        اضغط على زر السحب لتشغيل الماكينة وفتح كبسولة التحاليل المفاجئة
      </p>

      {/* Capsule Machine Container */}
      <div className="relative w-64 h-64 mx-auto mb-6 flex items-center justify-center">
        {/* Machine Outer Glass Globe */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-slate-100/90 via-rose-50/40 to-slate-200/90 border-4 border-[#8B1E2D]/20 shadow-inner flex items-center justify-center overflow-hidden">
          {/* Subtle reflections */}
          <div className="absolute top-3 left-8 w-16 h-8 rounded-full bg-white/60 blur-xs -rotate-45" />

          {/* Background mini floating capsules */}
          <div className="absolute inset-0 flex flex-wrap justify-around items-center opacity-30 pointer-events-none p-4">
            <span className="w-7 h-4 rounded-full bg-blue-500 rotate-12" />
            <span className="w-7 h-4 rounded-full bg-rose-500 -rotate-45" />
            <span className="w-7 h-4 rounded-full bg-amber-400 rotate-45" />
            <span className="w-7 h-4 rounded-full bg-emerald-500 -rotate-12" />
          </div>

          {/* Central Main Golden Capsule */}
          <div
            className={`relative transition-all duration-700 ${
              isDispensing
                ? 'animate-bounce scale-110'
                : isOpened
                ? 'scale-125'
                : 'hover:scale-105'
            }`}
          >
            {isOpened && selectedPrize ? (
              /* Popped Open Capsule */
              <div className="flex flex-col items-center justify-center animate-fade-in">
                <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 shadow-xl flex items-center justify-center border-4 border-white animate-spin-slow">
                  <Award className="h-10 w-10 text-amber-900 drop-shadow-sm" />
                </div>
                <div className="mt-2 text-xs font-black text-[#8B1E2D] bg-white px-3 py-1 rounded-full shadow-md border border-rose-200">
                  {selectedPrize.discountValue}
                </div>
              </div>
            ) : (
              /* Closed Capsule */
              <div className="cursor-pointer select-none" onClick={handlePullLever}>
                <div className="w-24 h-40 rounded-full bg-gradient-to-b from-[#8B1E2D] via-[#A82838] to-[#0F2B5C] border-4 border-amber-300 shadow-2xl flex flex-col justify-between items-center p-2 relative overflow-hidden">
                  {/* Gloss shine */}
                  <div className="absolute top-2 left-3 w-6 h-16 rounded-full bg-white/30 blur-[1px]" />

                  {/* Golden Center Ring */}
                  <div className="w-full h-4 bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400 my-auto shadow-sm flex items-center justify-center">
                    <span className="text-[9px] font-mono font-black text-amber-900 tracking-widest">
                      RT LAB
                    </span>
                  </div>

                  <div className="text-white text-center pb-2">
                    <Sparkles className="h-5 w-5 mx-auto text-amber-300 animate-pulse" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prize Result Callout */}
      {isOpened && selectedPrize && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200 text-slate-900 mb-5 animate-bounce">
          <div className="text-xs font-bold text-amber-900 mb-0.5">تهانينا! فزت بـ:</div>
          <div className="text-base font-black text-[#8B1E2D]">{selectedPrize.title}</div>
          <div className="text-xs font-black text-emerald-700 mt-1">{selectedPrize.discountValue}</div>
        </div>
      )}

      {/* Action Button */}
      <div className="space-y-3">
        {!isOpened ? (
          <button
            type="button"
            onClick={handlePullLever}
            disabled={disabled || isDispensing}
            className={`w-full py-4 rounded-2xl font-black text-sm text-white shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
              disabled || isDispensing
                ? 'bg-slate-400 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-[#8B1E2D] via-rose-700 to-[#0F2B5C] hover:from-[#731925] hover:to-[#0A1E40] shadow-rose-900/20 hover:shadow-2xl cursor-pointer hover:-translate-y-0.5'
            }`}
          >
            <Zap className={`h-5 w-5 text-amber-300 ${isDispensing ? 'animate-spin' : ''}`} />
            <span>{isDispensing ? 'جاري سحب وفتح الكبسولة...' : 'اسحب كبسولتك الصحية الذهبية الآن'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleReset}
            className="w-full py-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>تجربة كبسولة أخرى</span>
          </button>
        )}
      </div>

      {/* Footer reassurance */}
      <div className="mt-4 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
        <span>جميع الكبسولات تحتوي على جوائز فحص وكوبونات خصم فورية معتمدة</span>
      </div>
    </div>
  );
};
