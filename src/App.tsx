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
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { GameType, LabSettings, PatientClaim, Prize, QuizQuestion } from './types';
import { labLogo, labReception, medicalTeam } from './assets/images';
import {
  check24HourRestriction,
  fetchRemoteConfig,
  getClaims,
  getPrizes,
  getQuizQuestions,
  getSettings,
  PlayRestrictionStatus,
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
import { PWAInstallButton } from './components/PWAInstallButton';

export default function App() {
  const [prizes, setPrizes] = useState<Prize[]>(() => getPrizes());
  const [settings, setSettings] = useState<LabSettings>(() => getSettings());
  const [claims, setClaims] = useState<PatientClaim[]>(() => getClaims());
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(() => getQuizQuestions());

  // 24-Hour Restriction State
  const [restriction, setRestriction] = useState<PlayRestrictionStatus>(() => check24HourRestriction());

  // UI Navigation states
  const [activeGame, setActiveGame] = useState<GameType>('wheel');
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showBranches, setShowBranches] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);

  const gameSectionRef = useRef<HTMLDivElement | null>(null);

  // Auto-sync configuration from remote source so any patient browser reflects updates
  useEffect(() => {
    fetchRemoteConfig().then((remote) => {
      if (remote) {
        setSettings(remote.settings);
      }
    }).catch(() => {});
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

  const scrollToGames = () => {
    if (gameSectionRef.current) {
      gameSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShareApp = () => {
    const url = window.location.origin + window.location.pathname;
    const shareText = `جرّب حظك اليومي مع معامل د. رامي مختار RT Labs (${settings.sloganAr}) واكسب كروت خصم وفحوصات مجانية! 🎁🩺\n${url}`;
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
          if (restriction.canPlay) {
            setActiveGame(g);
          }
          scrollToGames();
        }}
        onOpenAdmin={() => setShowAdmin(true)}
        onOpenBranches={() => setShowBranches(true)}
        onOpenPolicy={() => setShowPolicy(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          slogan={settings.sloganAr}
          onScrollToGame={scrollToGames}
          onOpenBranches={() => setShowBranches(true)}
          onOpenPolicy={() => setShowPolicy(true)}
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
            />
          </section>
        )}

        {/* Game Arena Section */}
        <section
          ref={gameSectionRef}
          className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14"
        >
          {/* Game Switcher Tabs */}
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
                  للمصداقية وتكافؤ الفرص بين كافة المرضى، لا يجوز اختيار أكثر من وسيلة ترفيهية واحدة كل 24
                  ساعة. يمكنك استغلال كوبونك النشط بالتوجه للفرع أو حجز الزيارة المنزلية قبل انتهاء مهلة
                  الـ 24 ساعة.
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  <button
                    onClick={() => setShowPolicy(true)}
                    className="text-xs text-[#8B1E2D] font-bold underline underline-offset-4"
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
                شارك رابط المسابقة مع أسرتك واكسبوا الخصومات سوياً
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                بمجرد الدخول، يستطيع كل فرد تجربة حظه في إحدى الوسائل الترفيهية وتوليد كارت الخصم الصالح
                لمدة 24 ساعة لتأكيده مع واتساب المعمل فوراً.
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
                  `مرحباً معامل د. رامي مختار (${settings.sloganAr})، أود الاستفسار عن كروت الخصم اليومية وباقات الفحص الطبي.`
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
              <span>{settings.sloganAr}</span>
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

        {/* Visual Lab Environment & Medical Expertise Gallery */}
        <section className="bg-slate-100/80 py-12 sm:py-16 border-t border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <span className="text-xs font-bold text-[#8B1E2D] bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                {settings.sloganAr}
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-2">
                بيئة العمل والتجهيزات الطبية في معامل رامي مختار
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl mx-auto">
                نحرص على توفير أرقى صالات الاستقبال الفندقية المريحة، وأحدث أنظمة التحاليل الرقمية الآلية تحت إشراف نخبة من الأطباء.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Photo 1: Reception */}
              <div className="rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm flex flex-col group hover:shadow-md transition">
                <div className="relative h-52 overflow-hidden bg-slate-900">
                  <img
                    src={labReception}
                    alt="صالة استقبال معامل رامي مختار"
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    صالة الاستقبال
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">استقبال فندقي وخدمة متميزة</h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      صالات استقبال مجهزة ومكيفة تضمن الخصوصية والراحة التامة للمريض مع سرعة في سحب العينات دون انتظار.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-[#8B1E2D] font-bold flex items-center justify-between">
                    <span>جميع فروع المعمل</span>
                    <button onClick={() => setShowBranches(true)} className="hover:underline cursor-pointer">عرض الفروع ←</button>
                  </div>
                </div>
              </div>

              {/* Photo 2: Medical Specialists */}
              <div className="rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm flex flex-col group hover:shadow-md transition">
                <div className="relative h-52 overflow-hidden bg-slate-900">
                  <img
                    src={medicalTeam}
                    alt="فريق أطباء واستشاريي التحاليل"
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    فريق الأطباء والمختبر
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">نخبة من الاستشاريين والأخصائيين</h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      إشراف طبي دقيق من استشاريي الباثولوجيا الإكلينيكية لمراجعة وتدقيق كافة النتائج لضمان أقصى درجات المصداقية.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-[#0F2B5C] font-bold flex items-center justify-between">
                    <span>دقة تشخيصية معتمدة</span>
                    <span>100% موثوقية</span>
                  </div>
                </div>
              </div>

              {/* Photo 3: Official Brand Identity Card */}
              <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#0F2B5C] via-[#162A4D] to-[#8B1E2D] text-white p-6 shadow-sm flex flex-col justify-between md:col-span-2 lg:col-span-1">
                <div>
                  <div className="h-16 w-16 rounded-2xl overflow-hidden border border-white/20 bg-white p-1.5 shadow mb-4">
                    <img
                      src={labLogo}
                      alt="لوجو معامل رامي مختار"
                      className="h-full w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                    RT Labs Accreditation
                  </span>
                  <h3 className="text-lg font-black mt-1">معامل د. رامي مختار للتحاليل الطبية</h3>
                  <p className="text-xs text-slate-200 mt-2 leading-relaxed">
                    «{settings.sloganAr}» شعارنا الذي نلتزم به في كل تحليل. جوائز وكروت خصم دورية تشجيعاً للفحص والوقاية المستمرة.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between">
                  <span className="text-xs text-amber-300 font-bold">الخط الساخن: {settings.hotline}</span>
                  <button
                    onClick={scrollToGames}
                    className="px-3.5 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition shadow cursor-pointer"
                  >
                    العب واكسب الآن
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white text-slate-600 text-xs py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl overflow-hidden border border-slate-200 bg-white">
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
              <div className="text-[11px] text-[#8B1E2D] font-bold">{settings.sloganAr}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
            <button onClick={() => setShowPolicy(true)} className="hover:text-slate-900 transition text-amber-800 font-bold">
              سياسة المكافآت والـ 24 ساعة
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button onClick={() => setShowBranches(true)} className="hover:text-slate-900 transition">
              الفروع ({settings.branches.length})
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

      {/* Rewards Policy Modal */}
      {showPolicy && (
        <PolicyModal
          settings={settings}
          onClose={() => setShowPolicy(false)}
        />
      )}
    </div>
  );
}
