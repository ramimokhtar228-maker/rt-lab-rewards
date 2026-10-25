import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  HelpCircle,
  Clock,
  Zap,
  CheckCircle2,
  XCircle,
  Share2,
  RotateCcw,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { Question, QuestionCategory, PlayerProfile } from '../types';
import { soundManager } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';
import { checkGameCooldown, recordGamePlayed } from '../utils/cooldown';

interface QuizGameProps {
  questions: Question[];
  player: PlayerProfile;
  onUpdatePlayer: (updated: Partial<PlayerProfile>) => void;
  onAwardCoupon: (title: string, description: string, value: string, wonFrom: string) => void;
  onOpenSync: (customMsg?: string) => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({
  questions,
  player,
  onUpdatePlayer,
  onAwardCoupon,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'all'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [timerActive, setTimerActive] = useState(false);
  const [score, setScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [cooldown, setCooldown] = useState(() => checkGameCooldown('quiz'));

  // 1-second live countdown ticker for 12-hour fair play
  useEffect(() => {
    const timer = setInterval(() => {
      setCooldown(checkGameCooldown('quiz'));
    }, 1000);

    const handleCustomCooldown = () => {
      setCooldown(checkGameCooldown('quiz'));
    };
    window.addEventListener('rt_lab_cooldown_updated', handleCustomCooldown);

    return () => {
      clearInterval(timer);
      window.removeEventListener('rt_lab_cooldown_updated', handleCustomCooldown);
    };
  }, []);

  // Lifelines
  const [usedFiftyFifty, setUsedFiftyFifty] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [usedExtraTime, setUsedExtraTime] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter questions based on category
  const filteredQuestions = React.useMemo(() => {
    if (selectedCategory === 'all') return questions;
    return questions.filter((q) => q.category === selectedCategory);
  }, [questions, selectedCategory]);

  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0];

  // Start timer on question load
  useEffect(() => {
    if (!isQuizCompleted && currentQ && !isAnswered) {
      setTimeLeft(20);
      setTimerActive(true);
      setSelectedOption(null);
      setIsAnswered(false);
      setHiddenOptions([]);
      setShowHint(false);
    }
  }, [currentIndex, selectedCategory, isQuizCompleted]);

  // Countdown loop
  useEffect(() => {
    if (timerActive && timeLeft > 0 && !isAnswered) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswered) {
      handleTimeOut();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerActive, timeLeft, isAnswered]);

  const handleTimeOut = () => {
    setIsAnswered(true);
    setTimerActive(false);
    soundManager.playWrong();
    setCurrentStreak(0);
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    setSelectedOption(index);
    setIsAnswered(true);
    setTimerActive(false);

    const isCorrect = index === currentQ.correctIndex;

    if (isCorrect) {
      soundManager.playSuccess();
      const pointsGained = currentQ.points + currentStreak * 10;
      setScore((prev) => prev + pointsGained);
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);

      // Update player profile
      onUpdatePlayer({
        points: player.points + pointsGained,
        correctAnswersCount: player.correctAnswersCount + 1,
      });

      // Special bonus coupon on streak of 3
      if (newStreak === 3) {
        triggerConfetti();
        onAwardCoupon(
          'كوبون عبقري الأسئلة: خصم 20% إضافي',
          'حصلت عليه بفضل إجابة 3 أسئلة متتالية بشكل صحيح في مسابقة الذكاء!',
          'خصم 20%',
          'مسابقة التحدي والذكاء'
        );
      }
    } else {
      soundManager.playWrong();
      setCurrentStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < filteredQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsQuizCompleted(true);
    soundManager.playFanfare();
    triggerConfetti();

    onUpdatePlayer({
      quizzesCompleted: player.quizzesCompleted + 1,
    });

    // Award completion voucher if score is decent
    if (score >= 100) {
      onAwardCoupon(
        'شهادة تفوق معامل RT: فحص سكر مجاني',
        'مكافأة إتمام مسابقة التحدي بنتيجة متميزة في معلومات المعمل والذكاء.',
        'فحص سكر مجاني',
        'إتمام مسابقة التحدي'
      );
    }

    // Record game played for 12-hour fair play
    recordGamePlayed('quiz');
    setCooldown(checkGameCooldown('quiz'));
  };

  const handleRestartQuiz = () => {
    if (!cooldown.allowed) {
      alert(`⏳ مسابقة الذكاء متاحة مرة كل 12 ساعة لكل عميل لضمان تكافؤ الفرص في دوري الأبطال. متبقي للجولة القادمة: ${cooldown.formatted.arabicLabel} (${cooldown.formatted.digital})`);
      return;
    }
    setCurrentIndex(0);
    setScore(0);
    setCurrentStreak(0);
    setIsQuizCompleted(false);
    setIsAnswered(false);
    setSelectedOption(null);
    setUsedFiftyFifty(false);
    setUsedHint(false);
    setUsedExtraTime(false);
    setHiddenOptions([]);
  };

  // Lifeline: 50:50
  const applyFiftyFifty = () => {
    if (usedFiftyFifty || isAnswered || !currentQ) return;
    setUsedFiftyFifty(true);
    soundManager.playTick();
    const wrongIndices = currentQ.options
      .map((_, i) => i)
      .filter((i) => i !== currentQ.correctIndex);
    const shuffled = wrongIndices.sort(() => 0.5 - Math.random());
    setHiddenOptions(shuffled.slice(0, 2));
  };

  // Lifeline: Doctor Hint
  const applyHint = () => {
    if (usedHint || isAnswered || !currentQ) return;
    setUsedHint(true);
    setShowHint(true);
    soundManager.playTick();
  };

  // Lifeline: Extra Time
  const applyExtraTime = () => {
    if (usedExtraTime || isAnswered) return;
    setUsedExtraTime(true);
    setTimeLeft((prev) => prev + 15);
    soundManager.playTick();
  };

  // Share challenge to WhatsApp
  const handleShareQuestion = () => {
    if (!currentQ) return;
    const shareText = `تحدي معامل RT للذكاء والجوائز 🧠💡:
سؤال اليوم: "${currentQ.question}"
هل تعرف الإجابة الصح؟ جرب حظك واكسب تحاليل مجانية وخصومات في معامل RT:
${window.location.origin}`;
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  if (!currentQ) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>لا توجد أسئلة متاحة في هذا القسم حالياً.</p>
        <button
          onClick={() => setSelectedCategory('all')}
          className="mt-4 px-4 py-2 bg-emerald-600 rounded-lg text-white text-xs font-bold"
        >
          عرض جميع الأسئلة
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'جميع الأسئلة' },
          { id: 'medical', label: 'معلومات طبية وصحية' },
          { id: 'puzzle', label: 'ألغاز ومسائل ذكاء' },
          { id: 'culture', label: 'ثقافة وأمثال' },
          { id: 'general', label: 'معلومات عامة' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id as QuestionCategory | 'all');
              setCurrentIndex(0);
              setIsQuizCompleted(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
              selectedCategory === cat.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {!cooldown.allowed && !isQuizCompleted ? (
        /* 12-Hour Cooldown Wait Card */
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-8 text-center space-y-6 relative overflow-hidden">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/40">
            <Clock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">تمت المشاركة في مسابقة الذكاء لهذه الجولة!</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              لضمان تكافؤ الفرص في دوري أبطال معامل RT، يحق لكل عميل لعب جولة أسئلة واحدة كل <strong className="text-amber-400">12 ساعة فقط</strong>.
            </p>
          </div>

          <div className="max-w-xs mx-auto p-4 bg-slate-950 rounded-2xl border border-amber-500/40 shadow-inner">
            <span className="text-xs text-slate-400 block mb-1">متبقي لفتح الجولة الجديدة:</span>
            <span className="font-mono text-2xl font-black text-amber-400 tracking-wider" dir="ltr">
              {cooldown.formatted.digital}
            </span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleShareQuestion}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>مشاركة المسابقة مع أصدقائك (+15 نقطة)</span>
            </button>
          </div>
        </div>
      ) : isQuizCompleted ? (
        /* Quiz Finished Card */
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-6 relative overflow-hidden">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">أحسنت! أتممت جولة التحدي بنجاح 🎉</h3>
            <p className="text-sm text-slate-300">
              حققت <span className="font-bold text-amber-400">{score} نقطة</span> جديدة تضاف لحسابك في معامل RT!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-center">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-500 block">إجمالي النقاط</span>
              <span className="text-lg font-black text-emerald-400">{player.points}</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-500 block">سلسلة الإجابات</span>
              <span className="text-lg font-black text-amber-400">{currentStreak} متتالي</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-500 block">رتبتك الحالية</span>
              <span className="text-xs font-bold text-slate-300 truncate block mt-1">{player.levelTitle}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {!cooldown.allowed ? (
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-amber-300 font-bold text-xs shadow-inner">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>الجولة القادمة بعد: <strong className="font-mono text-white text-sm" dir="ltr">{cooldown.formatted.digital}</strong></span>
              </div>
            ) : (
              <button
                onClick={handleRestartQuiz}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>لعب جولة أسئلة جديدة</span>
              </button>
            )}
            <button
              onClick={handleShareQuestion}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-colors"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>تحدي أصدقائك على واتساب</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Question Card */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden">
          {/* Header Bar: Question index, Score, Streak */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
              <span className="px-2.5 py-1 bg-slate-800 rounded-lg text-slate-200">
                سؤال {currentIndex + 1} من {filteredQuestions.length}
              </span>
              <span>·</span>
              <span className="text-emerald-400">+{currentQ.points} نقطة</span>
            </div>

            <div className="flex items-center gap-3">
              {currentStreak > 1 && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                  <Zap className="w-3.5 h-3.5 fill-amber-400" />
                  <span>سلسلة x{currentStreak}</span>
                </div>
              )}
              {/* Countdown Timer Badge */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold tabular-nums transition-colors ${
                  timeLeft <= 5
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                    : 'bg-slate-800 text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{timeLeft} ثانية</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%` }}
            />
          </div>

          {/* Lifelines Toolbar */}
          <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-xs text-slate-400 font-medium">وسائل المساعدة:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={applyFiftyFifty}
                disabled={usedFiftyFifty || isAnswered}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  usedFiftyFifty
                    ? 'opacity-40 bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-400/20'
                }`}
                title="حذف إجابتين خطأ"
              >
                50:50
              </button>
              <button
                onClick={applyHint}
                disabled={usedHint || isAnswered}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  usedHint
                    ? 'opacity-40 bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-400/20'
                }`}
                title="تلميح طبي من معامل RT"
              >
                <Lightbulb className="w-3 h-3" />
                <span>تلميح</span>
              </button>
              <button
                onClick={applyExtraTime}
                disabled={usedExtraTime || isAnswered}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  usedExtraTime
                    ? 'opacity-40 bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-400/20'
                }`}
                title="إضافة 15 ثانية للوقت"
              >
                +15ث
              </button>
            </div>
          </div>

          {/* Hint Card (if triggered) */}
          {showHint && (
            <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-3 text-xs text-cyan-200 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">تلميح طبيب معامل RT:</span>
                <p className="mt-0.5 text-cyan-100">{currentQ.explanation.substring(0, 70)}...</p>
              </div>
            </div>
          )}

          {/* The Question Text */}
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
              {currentQ.question}
            </h2>
          </div>

          {/* Multiple Choice Options */}
          <div className="grid grid-cols-1 gap-2.5">
            {currentQ.options.map((option, idx) => {
              if (hiddenOptions.includes(idx)) {
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-800/40 bg-slate-950/20 opacity-30 text-slate-600 text-sm line-through select-none"
                  >
                    (خيار تم حذفه بواسطة 50:50)
                  </div>
                );
              }

              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let btnStyle = 'bg-slate-800/80 hover:bg-slate-750 text-slate-200 border-slate-700/60';
              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-600/20 border-rose-500 text-rose-300 font-bold';
                } else {
                  btnStyle = 'bg-slate-900/50 opacity-50 border-slate-800 text-slate-500';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-xl border text-right transition-all flex items-center justify-between group ${btnStyle} ${
                    !isAnswered ? 'hover:border-emerald-500/50 hover:bg-slate-800 active:scale-[0.99]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-xs font-mono font-bold text-slate-400 group-hover:text-emerald-400">
                      {idx + 1}
                    </span>
                    <span className="text-sm md:text-base font-semibold">{option}</span>
                  </div>

                  {isAnswered && (
                    <div>
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : isSelected ? (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      ) : null}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box After Answer */}
          {isAnswered && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>معلومة طبية وصحية من معامل RT:</span>
              </div>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleShareQuestion}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>مشاركة اللغز</span>
            </button>

            {isAnswered && (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-950 transition-all hover:scale-[1.02]"
              >
                <span>{currentIndex + 1 < filteredQuestions.length ? 'السؤال التالي' : 'عرض النتيجة النهائية'}</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
