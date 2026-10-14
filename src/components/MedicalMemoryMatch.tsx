import React, { useEffect, useState } from 'react';
import {
  Activity,
  Award,
  CheckCircle2,
  Dna,
  Heart,
  HelpCircle,
  Microscope,
  Pill,
  RotateCcw,
  Sparkles,
  Stethoscope,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Prize } from '../types';
import { playClickTone, playVictoryChime } from '../utils/audio';

interface MedicalMemoryMatchProps {
  prizes: Prize[];
  onWin: (prize: Prize) => void;
  disabled?: boolean;
}

interface CardItem {
  id: number;
  pairId: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgLight: string;
}

const CARD_PAIRS = [
  {
    pairId: 'microscope',
    name: 'المجهر والتحاليل',
    icon: <Microscope className="h-7 w-7 sm:h-9 sm:w-9" />,
    color: '#0F2B5C',
    bgLight: 'bg-blue-50 text-[#0F2B5C] border-blue-200',
  },
  {
    pairId: 'dna',
    name: 'الحمض النووي DNA',
    icon: <Dna className="h-7 w-7 sm:h-9 sm:w-9" />,
    color: '#8B1E2D',
    bgLight: 'bg-rose-50 text-[#8B1E2D] border-rose-200',
  },
  {
    pairId: 'heart',
    name: 'صحة القلب والشرايين',
    icon: <Heart className="h-7 w-7 sm:h-9 sm:w-9" />,
    color: '#DC2626',
    bgLight: 'bg-red-50 text-red-600 border-red-200',
  },
  {
    pairId: 'stethoscope',
    name: 'سماعة الطبيب والفحص',
    icon: <Stethoscope className="h-7 w-7 sm:h-9 sm:w-9" />,
    color: '#059669',
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    pairId: 'pill',
    name: 'كبسولة الفيتامينات',
    icon: <Pill className="h-7 w-7 sm:h-9 sm:w-9" />,
    color: '#D97706',
    bgLight: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    pairId: 'activity',
    name: 'معدل الحيوية والنشاط',
    icon: <Activity className="h-7 w-7 sm:h-9 sm:w-9" />,
    color: '#7C3AED',
    bgLight: 'bg-purple-50 text-purple-700 border-purple-200',
  },
];

export const MedicalMemoryMatch: React.FC<MedicalMemoryMatchProps> = ({
  prizes,
  onWin,
  disabled,
}) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [movesCount, setMovesCount] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [targetPrize, setTargetPrize] = useState<Prize | null>(null);

  // Pick target prize
  const pickTargetPrize = (): Prize => {
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

  // Initialize 4 pairs = 8 cards (perfect for mobile & quick fun!)
  const initGame = () => {
    const selectedPairs = CARD_PAIRS.slice(0, 4); // 4 pairs
    const deck: CardItem[] = [];

    selectedPairs.forEach((pair, idx) => {
      deck.push({
        id: idx * 2,
        pairId: pair.pairId,
        name: pair.name,
        icon: pair.icon,
        color: pair.color,
        bgLight: pair.bgLight,
      });
      deck.push({
        id: idx * 2 + 1,
        pairId: pair.pairId,
        name: pair.name,
        icon: pair.icon,
        color: pair.color,
        bgLight: pair.bgLight,
      });
    });

    // Shuffle
    const shuffled = deck.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIds([]);
    setMatchedPairs([]);
    setMovesCount(0);
    setIsWon(false);
    setTargetPrize(pickTargetPrize());
  };

  useEffect(() => {
    initGame();
  }, [prizes]);

  // Handle card click
  const handleCardClick = (card: CardItem) => {
    if (disabled || isWon) return;
    if (flippedIds.length >= 2) return;
    if (flippedIds.includes(card.id)) return;
    if (matchedPairs.includes(card.pairId)) return;

    playClickTone();

    const newFlipped = [...flippedIds, card.id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMovesCount((m) => m + 1);
      const card1 = cards.find((c) => c.id === newFlipped[0]);
      const card2 = cards.find((c) => c.id === newFlipped[1]);

      if (card1 && card2 && card1.pairId === card2.pairId) {
        // Matched!
        const updatedMatches = [...matchedPairs, card1.pairId];
        setMatchedPairs(updatedMatches);
        setFlippedIds([]);

        // Check if all matched
        if (updatedMatches.length === 4) {
          setIsWon(true);
          playVictoryChime();

          try {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch {
            // ignore
          }

          const prizeToAward = targetPrize || pickTargetPrize();
          setTimeout(() => {
            onWin(prizeToAward);
          }, 1100);
        }
      } else {
        // Not matched - flip back
        setTimeout(() => {
          setFlippedIds([]);
        }, 900);
      }
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xl text-center">
      {/* Header Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-[#8B1E2D] font-bold text-xs mb-3 shadow-xs">
        <Sparkles className="h-4 w-4 text-amber-500" />
        <span>تحدي بطاقات الذاكرة الطبية RT Match</span>
      </div>

      <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
        طابق الرموز الصحية واكشف جائزتك 🩺
      </h3>
      <p className="text-xs text-slate-500 mb-5 leading-relaxed">
        اقلب الكروت واجمع الرموز الطبية المتشابهة لتفعيل خصمك فوراً
      </p>

      {/* Progress & Stats Bar */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200/70 rounded-2xl px-4 py-2.5 mb-5 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">المطابقات الناجحة:</span>
          <span className="font-mono font-black text-[#8B1E2D] bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-sm">
            {matchedPairs.length} / 4
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">المحاولات:</span>
          <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
            {movesCount}
          </span>
        </div>

        <button
          type="button"
          onClick={initGame}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
          title="إعادة خلط البطاقات"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* 2x4 Cards Grid */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 mb-6">
        {cards.map((card) => {
          const isFlipped = flippedIds.includes(card.id) || matchedPairs.includes(card.pairId);
          const isMatched = matchedPairs.includes(card.pairId);

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleCardClick(card)}
              disabled={disabled || isWon || isMatched}
              className={`h-24 sm:h-28 rounded-2xl p-2 flex flex-col items-center justify-center transition-all duration-300 relative cursor-pointer select-none ${
                isMatched
                  ? `${card.bgLight} border-2 scale-95 shadow-xs`
                  : isFlipped
                  ? 'bg-white border-2 border-[#8B1E2D] shadow-md -translate-y-1'
                  : 'bg-gradient-to-br from-[#8B1E2D] to-[#0F2B5C] border-2 border-white/20 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95'
              }`}
            >
              {isFlipped ? (
                <div className="flex flex-col items-center justify-center animate-fade-in">
                  <div className="mb-1">{card.icon}</div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-800 line-clamp-1">
                    {card.name.split(' ')[0]}
                  </span>
                  {isMatched && (
                    <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-white/80">
                  <span className="font-mono text-sm sm:text-base font-black tracking-wider text-amber-300 drop-shadow-sm">
                    RT
                  </span>
                  <Sparkles className="h-3.5 w-3.5 text-white/50 mt-1" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Victory Callout */}
      {isWon && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-900 mb-4 animate-bounce">
          <div className="flex items-center justify-center gap-2 font-black text-sm mb-1">
            <Trophy className="h-5 w-5 text-amber-500" />
            <span>أحسنت! تم إكمال التحدي بنجاح 🏆</span>
          </div>
          <p className="text-xs text-emerald-700">جاري تجهيز كارت الجائزة والكوبون الخاص بك...</p>
        </div>
      )}

      {/* Footer Instructions */}
      <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
        <span>جميع البطاقات تحتوي على جوائز فحص وخصومات معتمدة من معمل رامي مختار</span>
      </div>
    </div>
  );
};
