import React from 'react';
import { Brain, Disc, Gift, Package, Sparkles } from 'lucide-react';
import { GameType } from '../types';

interface GameSelectorProps {
  selectedGame: GameType;
  onSelectGame: (game: GameType) => void;
  disabled?: boolean;
}

export const GameSelector: React.FC<GameSelectorProps> = ({ selectedGame, onSelectGame, disabled = false }) => {
  const games: { id: GameType; title: string; subtitle: string; icon: React.ReactNode }[] = [
    {
      id: 'wheel',
      title: 'عجلة الحظ الطبية',
      subtitle: 'دوّر العجلة واكسب خصمك اليومي',
      icon: <Disc className="h-5 w-5" />,
    },
    {
      id: 'scratch',
      title: 'كارت الخدش الفوري',
      subtitle: 'امسح البطاقة واكتشف هديتك',
      icon: <Gift className="h-5 w-5" />,
    },
    {
      id: 'quiz',
      title: 'تحدي المعلومات الصحية',
      subtitle: '3 أسئلة طبية وجائزة مضمونة',
      icon: <Brain className="h-5 w-5" />,
    },
    {
      id: 'box',
      title: 'صندوق المفاجآت الطبي',
      subtitle: 'اختر كبسولة الحظ وافتح هديتك',
      icon: <Package className="h-5 w-5" />,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          اختر وسيلة الترفيه المفضلة لديك اليوم
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          يسمح لكل مريض باختيار لعبة واحدة فقط كل 24 ساعة لضمان المصداقية وتكافؤ الفرص
        </p>
      </div>

      {/* 4-Card Grid Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {games.map((g) => {
          const isSelected = selectedGame === g.id;
          return (
            <button
              key={g.id}
              disabled={disabled}
              onClick={() => onSelectGame(g.id)}
              className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-[#8B1E2D] bg-rose-50/70 shadow-md ring-2 ring-rose-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-sm'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center transition ${
                    isSelected ? 'bg-[#8B1E2D] text-white shadow' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {g.icon}
                </div>
                {isSelected && (
                  <span className="text-[11px] font-bold text-[#8B1E2D] flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> تم الاختيار
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{g.title}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{g.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
