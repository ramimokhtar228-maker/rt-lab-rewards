import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  ChevronLeft,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Timer,
  XCircle,
} from 'lucide-react';
import { Prize, QuizQuestion } from '../types';
import { sounds } from '../utils/audio';

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
  disabled = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);

  // Take first 3 questions for a quick engaging round
  const activeQuestions = questions.slice(0, 3);
  const currentQ = activeQuestions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null || disabled) return;
    setSelectedOption(idx);
    setShowExplanation(true);

    if (idx === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
      sounds.playSuccess();
    } else {
      sounds.playTick();
    }
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // Finished all 3 questions!
      setQuizCompleted(true);
      sounds.playVictory();

      // Determine prize based on score:
      // High score (3/3 or 2/3) gets top discount prize
      const activePrizes = prizes.filter((p) => p.active);
      let targetPrize: Prize;
      if (score >= 2) {
        // High tier prize (e.g., 40% or 50% or free test)
        const highTier = activePrizes.filter(
          (p) => p.discountValue.includes('50%') || p.discountValue.includes('40%') || p.discountType === 'free_test'
        );
        targetPrize = highTier.length > 0 ? highTier[0] : activePrizes[0];
      } else {
        // Standard tier prize (e.g. 25% or 30%)
        const midTier = activePrizes.filter((p) => p.discountValue.includes('30%') || p.discountValue.includes('25%'));
        targetPrize = midTier.length > 0 ? midTier[0] : activePrizes[0];
      }

      setWonPrize(targetPrize);
      setTimeout(() => {
        onWin(targetPrize);
      }, 1200);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setQuizCompleted(false);
    setWonPrize(null);
  };

  if (quizCompleted && wonPrize) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="h-16 w-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-200 shadow-sm animate-bounce">
          <Award className="h-9 w-9 text-amber-600" />
        </div>
        <div className="text-xs font-semibold text-rose-800 flex items-center gap-1 mb-1">
          <Sparkles className="h-4 w-4" />
          <span>تهانينا! لقد أتممت تحدي المعلومات الطبية</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900">
          نتيجتك: {score} من {activeQuestions.length} إجابات صحيحة!
        </h3>
        <p className="text-xs text-slate-600 mt-2">
          تقديراً لوعيك الصحي، تأهلت للحصول على جائزتك الحصرية من معامل رامي مختار:
        </p>

        <div className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#8B1E2D] to-[#0F2B5C] p-5 text-white shadow-lg">
          <div className="text-xs text-rose-200">الجائزة المستحقة</div>
          <div className="text-lg font-black mt-1">{wonPrize.title}</div>
          <div className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-bold">
            {wonPrize.discountValue}
          </div>
        </div>

        <p className="text-[11px] text-slate-500 mt-4">
          جاري فتح شاشة تسجيل البيانات وإرسال الكوبون إلى رقم المعمل...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xl">
      {/* Quiz Progress Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-rose-50 text-[#8B1E2D] flex items-center justify-center font-black text-sm">
            {currentIndex + 1}/{activeQuestions.length}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">تحدي المعلومات الطبية</div>
            <div className="text-[11px] text-slate-500">أجب واكسب خصمك الفوري</div>
          </div>
        </div>

        <div className="text-left">
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            النقاط: {score}
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="mt-5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {currentQ.question}
        </h3>

        {/* Options */}
        <div className="mt-4 space-y-2.5">
          {currentQ.options.map((option, idx) => {
            let optionStyles = 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100';

            if (selectedOption !== null) {
              if (idx === currentQ.correctIndex) {
                optionStyles = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
              } else if (idx === selectedOption) {
                optionStyles = 'border-rose-500 bg-rose-50 text-rose-900 line-through';
              } else {
                optionStyles = 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                disabled={selectedOption !== null || disabled}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-3.5 rounded-xl border text-right text-xs sm:text-sm font-medium transition flex items-center justify-between ${optionStyles}`}
              >
                <span>{option}</span>
                {selectedOption !== null && idx === currentQ.correctIndex && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                )}
                {selectedOption === idx && idx !== currentQ.correctIndex && (
                  <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Medical Fact Explanation on answer */}
        {showExplanation && (
          <div className="mt-4 rounded-xl bg-blue-50/80 border border-blue-200 p-3.5 text-xs text-blue-900 animate-fade-in">
            <div className="flex items-center gap-1.5 font-bold text-[#0F2B5C] mb-1">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span>معلومة طبية من معامل رامي مختار:</span>
            </div>
            <p className="leading-relaxed text-slate-700">{currentQ.explanation}</p>
          </div>
        )}

        {/* Next Button */}
        {selectedOption !== null && (
          <div className="mt-5">
            <button
              onClick={handleNext}
              className="w-full py-3 px-6 rounded-xl bg-[#8B1E2D] hover:bg-[#731925] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <span>{currentIndex < activeQuestions.length - 1 ? 'السؤال التالي' : 'عرض النتيجة واستلام الجائزة'}</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
