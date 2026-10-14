import React, { useState } from 'react';
import { Gift, HelpCircle, Package, Sparkles } from 'lucide-react';
import { Prize } from '../types';
import { playWinFanfare } from '../utils/audio';

interface MysteryBoxProps {
  prizes: Prize[];
  onWin: (prize: Prize) => void;
  disabled?: boolean;
}

export const MysteryBox: React.FC<MysteryBoxProps> = ({ prizes, onWin, disabled }) => {
  const [openedIndex, setOpenedIndex] = useState<number | null>(null);
  const [opening, setOpening] = useState(false);

  const active = prizes.filter((p) => p.active);

  const handleOpenBox = (index: number) => {
    if (disabled || openedIndex !== null || opening || active.length === 0) return;

    setOpening(true);
    setOpenedIndex(index);

    // Weighted random selection
    const totalWeight = active.reduce((sum, p) => sum + (p.weight || 10), 0);
    let rand = Math.random() * totalWeight;
    let chosen = active[0];
    for (const p of active) {
      if (rand < (p.weight || 10)) {
        chosen = p;
        break;
      }
      rand -= p.weight || 10;
    }

    setTimeout(() => {
      setOpening(false);
      playWinFanfare();
      onWin(chosen);
    }, 1200);
  };

  const boxes = [
    { id: 1, label: 'صندوق الذهب', color: 'from-amber-400 to-amber-600' },
    { id: 2, label: 'صندوق الماس', color: 'from-rose-500 to-[#8B1E2D]' },
    { id: 3, label: 'صندوق اللؤلؤ', color: 'from-sky-500 to-[#0F2B5C]' },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-xl">
        {boxes.map((box, idx) => {
          const isSelected = openedIndex === idx;
          return (
            <button
              key={box.id}
              onClick={() => handleOpenBox(idx)}
              disabled={disabled || openedIndex !== null}
              className={`group relative rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 border-2 shadow-lg ${
                isSelected
                  ? 'border-amber-400 scale-105 bg-white ring-4 ring-amber-300'
                  : 'border-slate-200 bg-white hover:border-amber-400 hover:shadow-xl hover:-translate-y-1'
              } ${disabled && !isSelected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Box Icon Container */}
              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${box.color} flex items-center justify-center text-white shadow-md mb-3 transform transition-transform group-hover:scale-110 ${
                  isSelected && opening ? 'animate-bounce' : ''
                }`}
              >
                {isSelected ? (
                  <Gift className="h-10 w-10 text-white animate-pulse" />
                ) : (
                  <Package className="h-10 w-10 text-white" />
                )}
              </div>

              <h4 className="font-bold text-slate-900 text-sm">{box.label}</h4>
              <span className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                {isSelected ? (opening ? 'جارٍ الفتح...' : 'تم اختيار الصندوق!') : 'اضغط للفتح'}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-5 text-xs text-slate-500 font-semibold text-center">
        اختر أحد الصناديق الثلاثة لاكتشاف الجائزة الطبية المخفية بالداخل!
      </p>
    </div>
  );
};
