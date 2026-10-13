import React, { useState } from 'react';
import { Gift, Lock, Package, Sparkles } from 'lucide-react';
import { Prize } from '../types';
import { sounds } from '../utils/audio';

interface MysteryBoxProps {
  prizes: Prize[];
  onWin: (prize: Prize) => void;
  disabled?: boolean;
}

export const MysteryBox: React.FC<MysteryBoxProps> = ({ prizes, onWin, disabled = false }) => {
  const [selectedBoxIndex, setSelectedBoxIndex] = useState<number | null>(null);
  const [revealedPrize, setRevealedPrize] = useState<Prize | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  const activePrizes = prizes.filter((p) => p.active);

  const boxes = [
    { id: 1, label: 'صندوق الشفاء' },
    { id: 2, label: 'صندوق العافية' },
    { id: 3, label: 'صندوق الاطمئنان' },
  ];

  const handlePickBox = (index: number) => {
    if (selectedBoxIndex !== null || isOpening || disabled || activePrizes.length === 0) return;

    setSelectedBoxIndex(index);
    setIsOpening(true);
    sounds.playTick();

    // Pick a high-value random prize
    const randomPrize = activePrizes[Math.floor(Math.random() * activePrizes.length)];

    setTimeout(() => {
      setRevealedPrize(randomPrize);
      setIsOpening(false);
      sounds.playVictory();

      setTimeout(() => {
        onWin(randomPrize);
      }, 1000);
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm flex items-center justify-between mb-4 text-xs text-slate-500">
        <span className="font-semibold text-slate-700">صناديق المفاجآت الطبية</span>
        <span className="text-[#8B1E2D] font-bold">اختر صندوقاً واحداً</span>
      </div>

      <p className="text-center text-xs text-slate-600 mb-6 max-w-sm">
        تحتوي كل كبسولة أو صندوق على كارت خصم أو تحليل مجاني معتمد من معامل رامي مختار. اختر صندوقك
        المفضل لاكتشاف هديتك اليومية!
      </p>

      {/* 3 Boxes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
        {boxes.map((box, idx) => {
          const isSelected = selectedBoxIndex === idx;

          return (
            <button
              key={box.id}
              disabled={selectedBoxIndex !== null || disabled}
              onClick={() => handlePickBox(idx)}
              className={`relative p-6 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-3 overflow-hidden select-none active:scale-95 ${
                isSelected
                  ? 'border-[#8B1E2D] bg-gradient-to-b from-rose-50 to-rose-100/70 ring-4 ring-rose-500/30 shadow-2xl scale-105'
                  : 'border-slate-200 bg-white hover:border-rose-300 hover:shadow-lg shadow-sm'
              } ${selectedBoxIndex !== null && !isSelected ? 'opacity-40 grayscale' : ''}`}
            >
              {/* Glowing Aura if selected */}
              {isSelected && (
                <div className="absolute inset-0 bg-radial from-rose-500/20 to-transparent animate-pulse pointer-events-none" />
              )}

              {/* Box Icon Graphic */}
              <div
                className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#8B1E2D] to-[#0F2B5C] text-white shadow-lg animate-bounce'
                    : 'bg-slate-100 text-[#8B1E2D] hover:bg-rose-50'
                }`}
              >
                {isSelected ? (
                  <Sparkles className="h-8 w-8 text-amber-300 animate-spin" />
                ) : (
                  <Gift className="h-8 w-8 stroke-[2.2]" />
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm">{box.label}</h4>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {isSelected ? (isOpening ? 'جاري الفتح...' : 'هدية رابحة!') : 'اضغط للفتح'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Revealed Announcement */}
      {revealedPrize && (
        <div className="mt-6 w-full max-w-sm rounded-xl bg-rose-50 border border-rose-200 p-4 text-center animate-fade-in shadow-md">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#8B1E2D]">
            <Sparkles className="h-4 w-4" />
            <span>مبروك! لقد فتحت الصندوق وربحت:</span>
          </div>
          <div className="font-black text-slate-900 text-base mt-1">{revealedPrize.title}</div>
          <div className="mt-1 inline-block rounded-full bg-[#8B1E2D] px-3 py-0.5 text-xs font-bold text-white">
            {revealedPrize.discountValue}
          </div>
        </div>
      )}
    </div>
  );
};
