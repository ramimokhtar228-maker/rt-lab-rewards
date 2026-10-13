import React from 'react';
import { Award, Brain, Disc, Gift, Sparkles } from 'lucide-react';
import { GameType } from '../types';

interface GameSelectorProps {
  selectedGame: GameType;
  onSelectGame: (game: GameType) => void;
}

export const GameSelector: React.FC<GameSelectorProps> = ({ selectedGame, onSelectGame }) => {
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
      subtitle: '3 أسئلة سريعة وجائزة مضمونة',
      icon: <Brain className="h-5 w-5" />,
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          اختر وسيلة الترفيه المفضلة لديك
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          جميع الألعاب تمنحك كود خصم طبي معتمد ومسجل لدى إدارة معامل رامي مختار
        </p>
      </div>

      {/* Segmented 3-Card Grid Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {games.map((g) => {
          const isSelected = selectedGame === g.id;
          return (
            <button
              key={g.id}
              onClick={() => onSelectGame(g.id)}
              className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-[#8B1E2D] bg-rose-50/60 shadow-md ring-2 ring-rose-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center transition ${
                    isSelected ? 'bg-[#8B1E2D] text-white' : 'bg-slate-100 text-slate-700'
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
                <h3 className="font-bold text-slate-900 text-sm">{g.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{g.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
