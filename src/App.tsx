/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  Package,
  Phone,
  QrCode,
  RotateCcw,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { GameType, LabSettings, PatientClaim, Prize, QuizQuestion } from './types';
import { labLogo, labReception, medicalTeam } from './assets/images';
import {
  check24HourRestriction,
  checkPatientUrlForNewSession,
  fetchRemoteConfig,
  getClaims,
  getPrizes,
  getQuizQuestions,
  getSettings,
  PlayRestrictionStatus,
  resetPlaySessionAdmin,
  savePrizes,
  saveSettings,
} from './services/storageService';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { GameSelector } from './components/GameSelector';
import { SpinWheel } from './components/SpinWheel';
import { ScratchCard } from './components/ScratchCard';
import { HealthQuiz } from './components/HealthQuiz';
import { MysteryBox } from './components/MysteryBox';
import { ClaimModal } from './components/ClaimModal';
import { AdminPanel } from './components/AdminPanel';
import { BranchesModal } from './components/BranchesModal';
import { PolicyModal } from './components/PolicyModal';
import { LockoutBanner } from './components/LockoutBanner';
import { PatientShareModal } from './components/PatientShareModal';

export default function App() {
  const [prizes, setPrizes] = useState<Prize[]>(() => getPrizes());
  const [settings, setSettings] = useState<LabSettings>(() => getSettings());
  const [claims, setClaims] = useState<PatientClaim[]>(() => getClaims());
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(() => getQuizQuestions());

  // 24-Hour Restriction State
  const [restriction, setRestriction] = useState<PlayRestrictionStatus>(() =>
    check24HourRestriction()
  );

  // UI Navigation states
  const [activeGame, setActiveGame] = useState<GameType>('wheel');
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showBranches, setShowBranches] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [showPatientShare, setShowPatientShare] = useState(false);
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);

  // Patient Greeting notification when opened via link
  const [patientWelcomeNotice, setPatientWelcomeNotice] = useState<{
    show: boolean;
    patientName?: string;
  }>({ show: false });

  const gameSectionRef = useRef<HTMLDivElement | null>(null);

  const scrollToGames = () => {
    if (gameSectionRef.current) {
      gameSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Check URL params for patient session invitation & Auto-sync remote config
  useEffect(() => {
    // 1. Detect if patient opened link from WhatsApp/SMS/QR code
    const sessionInfo = checkPatientUrlForNewSession();
    if (sessionInfo.isPatientLink) {
      // Force fresh session for the patient
      resetPlaySessionAdmin();
      setRestriction(check24HourRestriction());

      if (sessionInfo.game) {
        setActiveGame(sessionInfo.game);
      }

      setPatientWelcomeNotice({
        show: true,
        patientName: sessionInfo.patientName,
      });

      // Smoothly scroll down to game selector so patient starts immediately
      setTimeout(() => {
        scrollToGames();
      }, 600);
    }

    // 2. Auto-sync newest configuration and prizes from GitHub / cloud so patient browser has latest admin updates
    fetchRemoteConfig()
      .then((remote) => {
        if (remote) {
          if (remote.settings) {
            setSettings(remote.settings);
          }
          if (remote.prizes && remote.prizes.length > 0) {
            setPrizes(remote.prizes);
          }
          if (remote.quizQuestions && remote.quizQuestions.length > 0) {
            setQuizQuestions(remote.quizQuestions);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Periodic check of 24h timer
  useEffect(() => {
    const updateRestriction = () => {
      setRestriction(check24HourRestriction());
    };
    updateRestriction();
    const interval = setInterval(updateRestriction, 5000);
    return () => clearInterval(interval);
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
    if (!restriction.canPlay) return;
    setWonPrize(prize);
  };

  const handleClaimSuccess = (newClaim: PatientClaim) => {
    setClaims((prev) => [newClaim, ...prev]);
    setRestriction(check24HourRestriction());
  };

  const handleResetLockoutSession = () => {
    resetPlaySessionAdmin();
    setRestriction(check24HourRestriction());
    scrollToGames();
  };

  const handleShareApp = () => {
    const url = window.location.origin + window.location.pathname;
    const shareText = `جرّب حظك اليومي مع معامل د. رامي مختار RT Labs (${settings.sloganAr}) واكسب كروت خصم وفحوصات مجانية! 🎁🩺\n${url}`;

    if (navigator.share) {
      navigator
        .share({
          title: 'جوائز وخصومات معامل رامي مختار',
          text: shareText,
          url,
        })
        .catch(() => {});
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
          if (restriction.canPlay) {
            setActiveGame(g);
          }
          scrollToGames();
        }}
        onOpenAdmin={() => setShowAdmin(true)}
        onOpenBranches={() => setShowBranches(true)}
        onOpenPolicy={() => setShowPolicy(true)}
        onOpenPatientShare={() => setShowPatientShare(true)}
      />

      {/* Patient Welcome Celebration Notification */}
      {patientWelcomeNotice.show && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 py-3 shadow-md border-b border-emerald-500 animate-fadeIn">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl animate-bounce">🎁</span>
              <div>
                <span className="font-black text-sm sm:text-base">
                  {patientWelcomeNotice.patientName
                    ? `أهلاً بك أستاذ/ة ${patientWelcomeNotice.patientName}!`
                    : 'أهلاً بك عميلنا العزيز!'}
                </span>
                <span className="text-xs sm:text-sm mr-2 opacity-95">
                  تم تفعيل جلسة مسابقة جديدة لك بنجاح مع أحدث جوائز وخصومات إدارة معامل RT Labs ·
                  اختر وسيلتك المفضلة الآن.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={scrollToGames}
                className="px-4 py-1.5 bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs rounded-xl shadow transition"
              >
                اختيار المسابقة الآن 🎮
              </button>
              <button
                type="button"
                onClick={() => setPatientWelcomeNotice({ show: false })}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          slogan={settings.sloganAr}
          onScrollToGame={scrollToGames}
          onOpenBranches={() => setShowBranches(true)}
          onOpenPolicy={() => setShowPolicy(true)}
          onOpenPatientShare={() => setShowPatientShare(true)}
        />

        {/* 24-Hour Active Lockout Banner (Rendered when patient has already played today) */}
        {!restriction.canPlay && (
          <section className="px-4 sm:px-6 pt-6">
            <LockoutBanner
              remainingHours={restriction.remainingHours}
              remainingMinutes={restriction.remainingMinutes}
              remainingSeconds={restriction.remainingSeconds}
              activeCoupon={restriction.activeCoupon}
              settings={settings}
              onRefresh={() => setRestriction(check24HourRestriction())}
              onResetSession={handleResetLockoutSession}
              onOpenPatientShare={() => setShowPatientShare(true)}
            />
          </section>
        )}

        {/* Game Arena Section */}
        <section
          ref={gameSectionRef}
          className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14"
        >
          {/* Game Switcher Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="text-center sm:text-right">
              <span className="text-xs font-bold text-[#8B1E2D] flex items-center gap-1 justify-center sm:justify-start">
                <Sparkles className="h-3.5 w-3.5" />
                اختر وسيلتك الترفيهية المفضلة
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5">
                مسابقات وجوائز معامل رامي مختار RT Labs
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowPatientShare(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition shadow-xs"
            >
              <Gift className="h-4 w-4 text-emerald-600" />
              <span>إرسال رابط جديد للمريض 📲</span>
            </button>
          </div>

          <GameSelector
            selectedGame={activeGame}
            onSelectGame={setActiveGame}
            disabled={!restriction.canPlay}
          />

          {/* Active Game Container */}
          <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-8 shadow-xl relative">
            {!restriction.canPlay ? (
              <div className="py-12 px-4 text-center max-w-md mx-auto">
                <div className="h-16 w-16 rounded-2xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center mb-4 border border-amber-200">
                  <Clock className="h-8 w-8 text-amber-700" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  تم قفل الألعاب مؤقتاً لحسابك لمدة 24 ساعة
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  للمصداقية وتكافؤ الفرص بين كافة المرضى، لا يجوز اختيار أكثر من وسيلة ترفيهية واحدة
                  كل 24 ساعة. يمكنك استغلال كوبونك النشط بالتوجه للفرع أو حجز الزيارة المنزلية قبل
                  انتهاء مهلة الـ 24 ساعة.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={handleResetLockoutSession}
                    className="px-4 py-2 bg-gradient-to-r from-[#8B1E2D] to-[#681420] text-white text-xs font-bold rounded-xl shadow hover:opacity-95 transition flex items-center gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>بدء مسابقة جديدة للمريض الآن</span>
                  </button>
                  <button
                    onClick={() => setShowPolicy(true)}
                    className="text-xs text-slate-600 hover:text-slate-900 font-bold underline underline-offset-4 self-center"
                  >
                    عرض شروط وسياسة الـ 24 ساعة
                  </button>
                </div>
              </div>
            ) : (
              <>
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
                {activeGame === 'box' && (
                  <MysteryBox
                    prizes={prizes}
                    onWin={handleWin}
                  />
                )}
              </>
            )}
          </div>
        </section>

        {/* Patient Direct Link & WhatsApp Activation Banner */}
        <section className="bg-gradient-to-r from-[#0F2B5C] via-[#162A4D] to-[#8B1E2D] text-white py-10 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-right">
              <span className="text-xs text-rose-300 font-semibold flex items-center justify-center md:justify-start gap-1">
                <Sparkles className="h-4 w-4" />
                {settings.sloganAr}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold">
                شارك رابط المسابقة مع المرضى والأسرة واكسبوا الخصومات سوياً
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                بمجرد الدخول، يستطيع كل مريض تجربة حظه في إحدى الوسائل الترفيهية وتوليد كارت الخصم
                الصالح لمدة 24 ساعة لتأكيده مع واتساب المعمل فوراً مع أحدث الجوائز المفعلة.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <button
                onClick={() => setShowPatientShare(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 text-xs sm:text-sm shadow-md transition"
              >
                <Gift className="h-4 w-4" />
                <span>إرسال الرابط لمريض عبر واتساب</span>
              </button>
              <button
                onClick={handleShareApp}
                className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold px-4 py-3 text-xs sm:text-sm shadow-md transition"
              >
                <Share2 className="h-4 w-4 text-[#8B1E2D]" />
                <span>{copiedAppUrl ? 'تم نسخ الرابط!' : 'مشاركة الرابط'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Why Choose RT Labs (Medical Trust & Value) */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <span>الجودة والاعتماد الدولي</span>
              <span aria-hidden="true">·</span>
              <span>{settings.sloganAr}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              لماذا يثق الآلاف في معامل د. رامي مختار؟
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl mx-auto">
              نلتزم بأعلى معايير ضبط الجودة المعملية العالمية عبر أحدث الأنظمة المؤتمتة وتحت إشراف
              استشاريين متخصصين.
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
                  أنظمة تحليل آلية بالكامل ومغلقة تمنع أي خطأ بشري، مع إمكانية استلام النتائج في نفس
                  اليوم عبر تطبيق الواتساب وبوابة النتائج الإلكترونية.
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
                <h3 className="font-bold text-slate-900 text-base">خدمة سحب العينات المنزلية</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  فريق تمريض متخصص وأحدث حقائب التبريد المعيارية لسحب العينات من المنزل لكبار السن
                  والأطفال وكافة أفراد الأسرة بنفس دقة الفروع.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
                متاح الحجز الفوري عبر الخط الساخن والواتساب
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">شفافية وأسعار عادلة</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  باقات تشخيصية شاملة وكروت خصم حقيقية عبر مسابقاتنا الترفيهية تخفيفاً عن كاهل المريض
                  دون أي مساومة على معايير الجودة الطبية.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
                التشخيص الصحيح يبدأ معنا دائماً
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Brand Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden border border-rose-200 bg-white p-0.5">
              <img
                src={labLogo}
                alt="لوجو معامل رامي مختار"
                className="h-full w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="font-bold text-slate-900">
                {settings.labNameAr} · <span className="text-[#8B1E2D]">RT Labs</span>
              </div>
              <div className="text-[11px] text-[#8B1E2D] font-bold">{settings.sloganAr}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
            <button
              onClick={() => setShowPolicy(true)}
              className="hover:text-slate-900 transition text-amber-800 font-bold"
            >
              سياسة المكافآت والـ 24 ساعة
            </button>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <button
              onClick={() => setShowBranches(true)}
              className="hover:text-slate-900 transition"
            >
              الفروع ({settings.branches.length})
            </button>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <a
              href={`tel:${settings.hotline}`}
              className="hover:text-slate-900 transition"
            >
              الخط الساخن: {settings.hotline}
            </a>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
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

      {/* Rewards Policy Modal */}
      {showPolicy && (
        <PolicyModal
          settings={settings}
          onClose={() => setShowPolicy(false)}
        />
      )}

      {/* Patient Competition Link Sharing Modal */}
      {showPatientShare && (
        <PatientShareModal
          settings={settings}
          onClose={() => setShowPatientShare(false)}
          onStartFreshPatientPlay={(game) => {
            if (game) setActiveGame(game);
            setRestriction(check24HourRestriction());
            scrollToGames();
          }}
        />
      )}
    </div>
  );
}
