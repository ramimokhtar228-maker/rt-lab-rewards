import React, { useEffect, useRef, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  Gift,
  HeartPulse,
  Home,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { GameType, LabSettings, PatientClaim, Prize, QuizQuestion } from './types';
import { labLogo } from './assets/images';
import {
  getClaims,
  getPrizes,
  getQuizQuestions,
  getSettings,
  savePrizes,
  saveSettings,
} from './services/storageService';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { GameSelector } from './components/GameSelector';
import { SpinWheel } from './components/SpinWheel';
import { ScratchCard } from './components/ScratchCard';
import { HealthQuiz } from './components/HealthQuiz';
import { ClaimModal } from './components/ClaimModal';
import { AdminPanel } from './components/AdminPanel';
import { BranchesModal } from './components/BranchesModal';

export default function App() {
  const [prizes, setPrizes] = useState<Prize[]>(() => getPrizes());
  const [settings, setSettings] = useState<LabSettings>(() => getSettings());
  const [claims, setClaims] = useState<PatientClaim[]>(() => getClaims());
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(() => getQuizQuestions());

  // UI Navigation states
  const [activeGame, setActiveGame] = useState<GameType>('wheel');
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showBranches, setShowBranches] = useState(false);
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);

  const gameSectionRef = useRef<HTMLDivElement | null>(null);

  // Load initial data
  useEffect(() => {
    setPrizes(getPrizes());
    setSettings(getSettings());
    setClaims(getClaims());
    setQuizQuestions(getQuizQuestions());
  }, []);

  const handleUpdatePrizes = (newPrizes: Prize[]) => {
    setPrizes(newPrizes);
    savePrizes(newPrizes);
  };

  const handleUpdateSettings = (newSettings: LabSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleRefreshClaims = () => {
    setClaims(getClaims());
  };

  const handleWin = (prize: Prize) => {
    setWonPrize(prize);
  };

  const handleClaimSuccess = (newClaim: PatientClaim) => {
    setClaims((prev) => [newClaim, ...prev]);
  };

  const scrollToGames = () => {
    if (gameSectionRef.current) {
      gameSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShareApp = () => {
    const url = window.location.origin + window.location.pathname;
    const shareText = `جرّب حظك اليومي مع معامل د. رامي مختار RT Labs واكسب خصومات فورية وكروت فحص مجانية! 🎁🩺\n${url}`;
    if (navigator.share) {
      navigator.share({
        title: 'جوائز وخصومات معامل رامي مختار',
        text: shareText,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedAppUrl(true);
      setTimeout(() => setCopiedAppUrl(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans" dir="rtl">
      {/* Brand Header */}
      <Header
        settings={settings}
        activeGame={activeGame}
        onSelectGame={(g) => {
          setActiveGame(g);
          scrollToGames();
        }}
        onOpenAdmin={() => setShowAdmin(true)}
        onOpenBranches={() => setShowBranches(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onScrollToGame={scrollToGames}
          onOpenBranches={() => setShowBranches(true)}
        />

        {/* Game Arena Section */}
        <section
          ref={gameSectionRef}
          className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16"
        >
          {/* Game Switcher Tabs */}
          <GameSelector selectedGame={activeGame} onSelectGame={setActiveGame} />

          {/* Active Game Container */}
          <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-8 shadow-xl">
            {activeGame === 'wheel' && (
              <SpinWheel
                prizes={prizes}
                onWin={handleWin}
              />
            )}

            {activeGame === 'scratch' && (
              <ScratchCard
                prizes={prizes}
                onWin={handleWin}
              />
            )}

            {activeGame === 'quiz' && (
              <HealthQuiz
                questions={quizQuestions}
                prizes={prizes}
                onWin={handleWin}
              />
            )}
          </div>
        </section>

        {/* Patient Direct Link & WhatsApp Activation Banner */}
        <section className="bg-gradient-to-r from-[#0F2B5C] via-[#162A4D] to-[#8B1E2D] text-white py-10 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-right">
              <span className="text-xs text-rose-300 font-semibold flex items-center justify-center md:justify-start gap-1">
                <Sparkles className="h-4 w-4" />
                رابط مشاركة مباشر بدون تعقيد
              </span>
              <h3 className="text-xl sm:text-2xl font-bold">
                شارك رابط المسابقة مع أسرتك واكسبوا الخصومات سوياً
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                بمجرد الدخول، يستطيع كل فرد في العائلة خوض التجربة وتوليد كارت الخصم وإرساله فوراً لواتساب
                المعمل لتثبيته في سجل الحجوزات.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleShareApp}
                className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold px-5 py-3 text-xs sm:text-sm shadow-md transition"
              >
                <Share2 className="h-4 w-4 text-[#8B1E2D]" />
                <span>{copiedAppUrl ? 'تم نسخ الرابط!' : 'مشاركة الرابط'}</span>
              </button>

              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                  'مرحباً معامل د. رامي مختار، أود الاستفسار عن كروت الخصم اليومية وباقات الفحص الطبي.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 text-xs sm:text-sm shadow-md transition"
              >
                <MessageCircle className="h-4 w-4" />
                <span>واتساب المعمل المباشر</span>
              </a>
            </div>
          </div>
        </section>

        {/* Why Choose RT Labs (Medical Trust & Value) */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <span>الجودة والاعتماد الدولي</span>
              <span aria-hidden="true">·</span>
              <span>معايير الأمان الحيوي</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              لماذا يثق الآلاف في معامل د. رامي مختار؟
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl mx-auto">
              نلتزم بأعلى معايير ضبط الجودة المعملية العالمية عبر أحدث الأنظمة المؤتمتة وتحت إشراف استشاريين
              متخصصين.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-xl bg-rose-50 text-[#8B1E2D] flex items-center justify-center mb-4">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">دقة متناهية وسرعة في النتائج</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  أنظمة تحليل آلية بالكامل ومغلقة تمنع أي خطأ بشري، مع إمكانية استلام النتائج في نفس اليوم
                  عبر تطبيق الواتساب وبوابة النتائج الإلكترونية.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
                نتائج معتمدة من استشاريي التحاليل الطبية
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-xl bg-blue-50 text-[#0F2B5C] flex items-center justify-center mb-4">
                  <Home className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">خدمة السحب المنزلي المعقم</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  أخصائيون مدربون لسحب العينات من المنازل لكبار السن والأطفال والمرضى بأحدث الأدوات
                  المعقمة المخصصة للاستخدام لمرة واحدة فقط.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
                تغطية شاملة لكافة المحافظة والمناطق
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">باقات فحص دورية واقتصادية</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  نقدم باقات شاملة مصممة علمياً للاطمئنان الدوري للأسرة، تشمل الفحص العام، متابعة مرضى
                  السكر، وصحة الكبد والكلى والدهون بأسعار مخفضة.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
                كروت خصم يومية لتشجيع الفحص المبكر
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white text-slate-600 text-xs py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg overflow-hidden border border-slate-200 bg-white">
              <img
                src={labLogo}
                alt="RT Lab"
                className="h-full w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="font-bold text-slate-900">
                {settings.labNameAr} · <span className="text-[#8B1E2D]">RT Labs</span>
              </div>
              <div className="text-[11px] text-slate-500">{settings.labSubtitleAr}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <button onClick={() => setShowBranches(true)} className="hover:text-slate-900 transition">
              الفروع ومواعيد العمل
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <a href={`tel:${settings.hotline}`} className="hover:text-slate-900 transition">
              الخط الساخن: {settings.hotline}
            </a>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button
              onClick={() => setShowAdmin(true)}
              className="hover:text-[#8B1E2D] transition flex items-center gap-1"
            >
              <Lock className="h-3 w-3" />
              <span>إدارة المعمل</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            جميع الحقوق محفوظة © {new Date().getFullYear()} معامل د. رامي مختار
          </div>
        </div>
      </footer>

      {/* Claim / Winning Modal */}
      {wonPrize && (
        <ClaimModal
          prize={wonPrize}
          gameType={activeGame}
          settings={settings}
          onClose={() => setWonPrize(null)}
          onSuccess={handleClaimSuccess}
        />
      )}

      {/* Admin Management Modal */}
      {showAdmin && (
        <AdminPanel
          prizes={prizes}
          onUpdatePrizes={handleUpdatePrizes}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          claims={claims}
          onRefreshClaims={handleRefreshClaims}
          onClose={() => setShowAdmin(false)}
        />
      )}

      {/* Branches & Home Visit Modal */}
      {showBranches && (
        <BranchesModal
          settings={settings}
          onClose={() => setShowBranches(false)}
        />
      )}
    </div>
  );
}
