import React from 'react';
import { Brain, Disc, Gift, Package, Sparkles } from 'lucide-react';
import { GameType } from '../types';

interface GameSelectorProps {
  selectedGame: GameType;
  onSelectGame: (game: GameType) => void;
  disabled?: boolean;
}

export const GameSelector: React.FC<GameSelectorProps> = ({
  selectedGame,
  onSelectGame,
  disabled = false,
}) => {
  const games: { id: GameType; title: string; subtitle: string; icon: React.ReactNode }[] = [
    {
      id: 'wheel',
      title: 'عجلة الحظ الطبية',
      subtitle: 'دوّر العجلة واكسب خصمك',
      icon: <Disc className="h-4.5 w-4.5 sm:h-5 sm:w-5" />,
    },
    {
      id: 'scratch',
      title: 'كارت الخدش الفوري',
      subtitle: 'امسح البطاقة واكتشف هديتك',
      icon: <Gift className="h-4.5 w-4.5 sm:h-5 sm:w-5" />,
    },
    {
      id: 'quiz',
      title: 'تحدي المعلومات الطبية',
      subtitle: '3 أسئلة طبية وجائزة مضمونة',
      icon: <Brain className="h-4.5 w-4.5 sm:h-5 sm:w-5" />,
    },
    {
      id: 'box',
      title: 'صندوق المفاجآت الطبي',
      subtitle: 'اختر كبسولة الحظ وافتح هديتك',
      icon: <Package className="h-4.5 w-4.5 sm:h-5 sm:w-5" />,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-6">
      {/* 4-Card Grid Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {games.map((g) => {
          const isSelected = selectedGame === g.id;
          return (
            <button
              key={g.id}
              disabled={disabled}
              onClick={() => onSelectGame(g.id)}
              className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-right transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-[#8B1E2D] bg-rose-50/70 shadow-md ring-2 ring-rose-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-xs'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : 'active:scale-98'}`}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div
                  className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl flex items-center justify-center transition shrink-0 ${
                    isSelected
                  ? 'bg-[#8B1E2D] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {g.icon}
                </div>
                {isSelected && (
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#8B1E2D] flex items-center gap-0.5">
                    <Sparkles className="h-3 w-3" /> تم الاختيار
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{g.title}</h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  {g.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
