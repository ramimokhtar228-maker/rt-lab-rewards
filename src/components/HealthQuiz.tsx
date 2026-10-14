import React, { useState } from 'react';
import { Award, CheckCircle, HelpCircle, Lightbulb, Sparkles, XCircle } from 'lucide-react';
import { Prize, QuizQuestion } from '../types';
import { playCorrectSound, playWinFanfare } from '../utils/audio';

interface HealthQuizProps {
  questions: QuizQuestion[];
  prizes: Prize[];
  onWin: (prize: Prize) => void;
  disabled?: boolean;
}

export const HealthQuiz: React.FC<HealthQuizProps> = ({
  questions,
  prizes,
  onWin,
  disabled,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const currentQ = questions[currentIndex] || questions[0];
  const activePrizes = prizes.filter((p) => p.active);

  const handleSelectOption = (idx: number) => {
    if (isAnswered || disabled) return;

    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      playCorrectSound();
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowHint(false);
    } else {
      // Finished quiz! Award prize
      const prize =
        activePrizes.find((p) => p.discountType === 'percentage' && p.discountValue.includes('30')) ||
        activePrizes[0];
      playWinFanfare();
      onWin(prize);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-2 text-right">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-md">
        {/* Progress header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-rose-50 text-[#8B1E2D] font-bold text-xs flex items-center justify-center">
              {currentIndex + 1}
            </span>
            <span className="text-xs font-bold text-slate-700">
              السؤال {currentIndex + 1} من {questions.length}
            </span>
          </div>

          <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            الإجابات الصحيحة: {score}
          </div>
        </div>

        {/* Question Text */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 leading-relaxed">
          {currentQ.question}
        </h3>

        {/* Options */}
        <div className="space-y-2.5 mb-4">
          {currentQ.options.map((opt, idx) => {
            let stateStyle = 'border-slate-200 hover:border-[#8B1E2D] hover:bg-rose-50/40';

            if (isAnswered) {
              if (idx === currentQ.correctIndex) {
                stateStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
              } else if (idx === selectedOption) {
                stateStyle = 'border-red-500 bg-red-50 text-red-900';
              } else {
                stateStyle = 'border-slate-200 opacity-50';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswered || disabled}
                className={`w-full p-3 rounded-xl border text-right text-xs sm:text-sm font-medium transition flex items-center justify-between ${stateStyle}`}
              >
                <span>{opt}</span>
                {isAnswered && idx === currentQ.correctIndex && (
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                )}
                {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                  <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation when answered */}
        {isAnswered && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-[#8B1E2D] block mb-1">معلومة طبية من استشاريو RT:</span>
            {currentQ.explanation}
          </div>
        )}

        {/* Hint toggle */}
        {!isAnswered && currentQ.hint && (
          <div className="mb-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-[11px] text-amber-700 hover:underline inline-flex items-center gap-1 font-semibold"
            >
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              <span>{showHint ? currentQ.hint : 'أظهر تلميح طبي'}</span>
            </button>
          </div>
        )}

        {/* Next Question / Finish Button */}
        {isAnswered && (
          <button
            onClick={handleNext}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-rose-700 text-white font-bold text-xs sm:text-sm shadow-md hover:from-[#731925] hover:to-rose-800 transition"
          >
            {currentIndex < questions.length - 1 ? 'السؤال التالي' : 'عرض جائزتي الطبية واستلام الكوبون! 🎉'}
          </button>
        )}
      </div>
    </div>
  );
};
