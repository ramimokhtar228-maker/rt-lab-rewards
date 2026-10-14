import React, { useEffect, useRef, useState } from 'react';
import {
  Award,
  Bell,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Gift,
  HeartPulse,
  Home,
  Key,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  RotateCcw,
  Share2,
  Shield,
  Sparkles,
  Users,
  Volume2,
  X,
} from 'lucide-react';
import { GameType, LabSettings, PatientClaim, Prize, QuizQuestion } from './types';
import {
  check24HourRestriction,
  checkPatientUrlForNewSession,
  fetchClaimsFromCloud,
  fetchRemoteConfig,
  getLocalClaims,
  getPrizes,
  getQuizQuestions,
  getSettings,
  PlayRestrictionStatus,
  resetPlaySessionAdmin,
  savePrizes,
  saveQuizQuestions,
  saveSettings,
} from './services/storageService';
import { playReceptionAlertChime } from './utils/audio';
import { labHero, labLogo, labReception, medicalTeam } from './assets/images';

import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { GameSelector } from './components/GameSelector';
import { SpinWheel } from './components/SpinWheel';
import { ScratchCard } from './components/ScratchCard';
import { MysteryBox } from './components/MysteryBox';
import { HealthQuiz } from './components/HealthQuiz';
import { MedicalMemoryMatch } from './components/MedicalMemoryMatch';
import { LuckyCapsule } from './components/LuckyCapsule';
import { ReferralRewardModal } from './components/ReferralRewardModal';
import { ClaimModal } from './components/ClaimModal';
import { AdminPanel } from './components/AdminPanel';
import { BranchesModal } from './components/BranchesModal';
import { PolicyModal } from './components/PolicyModal';
import { LockoutBanner } from './components/LockoutBanner';
import { MobileBottomNav } from './components/MobileBottomNav';

export default function App() {
  const [prizes, setPrizes] = useState<Prize[]>(() => getPrizes());
  const [settings, setSettings] = useState<LabSettings>(() => getSettings());
  const [claims, setClaims] = useState<PatientClaim[]>(() => getLocalClaims());
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(() => getQuizQuestions());

  // 24-Hour Restriction
  const [restriction, setRestriction] = useState<PlayRestrictionStatus>(() =>
    check24HourRestriction()
  );

  // Active game view
  const [activeGame, setActiveGame] = useState<GameType>('wheel');
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);

  // Modals
  const [showAdmin, setShowAdmin] = useState(false);
  const [showBranches, setShowBranches] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [showReferral, setShowReferral] = useState(false);

  // Real-time reception alert banner ("المعلن يسمع فى البرنامج")
  const [newClaimAlert, setNewClaimAlert] = useState<PatientClaim | null>(null);

  // Welcome notice when patient opens custom invite link
  const [patientGreeting, setPatientGreeting] = useState<{
    show: boolean;
    patientName?: string;
  }>({ show: false });

  const gamesRef = useRef<HTMLDivElement | null>(null);
  const previousClaimsCountRef = useRef<number>(claims.length);

  const scrollToGames = () => {
    if (gamesRef.current) {
      gamesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 1. Initial Cloud Sync & URL check
  useEffect(() => {
    // Check if patient opened invitation link
    const sessionInfo = checkPatientUrlForNewSession();
    if (sessionInfo.isPatientLink) {
      resetPlaySessionAdmin();
      setRestriction({ canPlay: true, remainingTimeFormatted: '', remainingMs: 0 });
      setWonPrize(null);
      if (sessionInfo.game) setActiveGame(sessionInfo.game);
      setPatientGreeting({
        show: true,
        patientName: sessionInfo.patientName,
      });
      setTimeout(() => scrollToGames(), 700);
    }

    // Remote config sync
    fetchRemoteConfig().then((remote) => {
      if (remote) {
        setSettings(remote.settings);
        if (remote.prizes) setPrizes(remote.prizes);
        if (remote.quizQuestions) setQuizQuestions(remote.quizQuestions);
      }
    });

    // Cloud claims sync
    fetchClaimsFromCloud().then((cloudClaims) => {
      if (Array.isArray(cloudClaims)) {
        setClaims(cloudClaims);
        previousClaimsCountRef.current = cloudClaims.length;
      }
    });
  }, []);

  // 2. Real-time background sync loop ("المعلن يسمع فى البرنامج")
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        const latest = await fetchClaimsFromCloud();
        if (Array.isArray(latest)) {
          // Check if a new claim arrived that wasn't in previous set
          if (latest.length > previousClaimsCountRef.current) {
            const newest = latest[0];
            if (newest && newest.status === 'pending') {
              // Play audible chime for the lab receptionist / admin!
              playReceptionAlertChime();
              setNewClaimAlert(newest);
            }
          }
          previousClaimsCountRef.current = latest.length;
          setClaims(latest);
        }
      } catch {
        // ignore
      }
    }, 4000);

    return () => clearInterval(syncInterval);
  }, []);

  // 3. 24-Hour countdown interval
  useEffect(() => {
    if (restriction.canPlay) return;

    const interval = setInterval(() => {
      const updated = check24HourRestriction();
      setRestriction(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, [restriction.canPlay]);

  const handlePrizeWon = (prize: Prize) => {
    setWonPrize(prize);
  };

  const handleClaimSuccess = (newClaim: PatientClaim) => {
    const updated = [newClaim, ...claims.filter((c) => c.id !== newClaim.id)];
    setClaims(updated);
    previousClaimsCountRef.current = updated.length;
    setRestriction(check24HourRestriction());
  };

  const pendingClaimsCount = claims.filter((c) => c.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-16 sm:pb-0">
      {/* Real-time Notification Banner for Receptionist ("المعلن يسمع فى البرنامج") */}
      {newClaimAlert && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-500 via-rose-600 to-[#8B1E2D] text-white p-3 sm:p-4 shadow-xl flex items-center justify-between animate-fade-in border-b border-amber-300/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 animate-bounce">
              <Bell className="h-5 w-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  مريض جديد الآن! 🔔
                </span>
                <span className="text-xs sm:text-sm font-bold">
                  سجل الأستاذ/ة {newClaimAlert.patientName} فوزه بـ ({newClaimAlert.prizeTitle})
                </span>
              </div>
              <p className="text-[11px] text-rose-100 mt-0.5">
                كود الكوبون: {newClaimAlert.couponCode} • الهاتف: {newClaimAlert.phone} • الفرع: {newClaimAlert.branch}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowAdmin(true);
                setNewClaimAlert(null);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-md transition flex items-center gap-1.5"
            >
              <MessageCircle className="h-4 w-4" />
              <span>تأكيد الحجز واتساب فوراً</span>
            </button>

            <button
              onClick={() => setNewClaimAlert(null)}
              className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        settings={settings}
        pendingClaimsCount={pendingClaimsCount}
        onOpenAdmin={() => setShowAdmin(true)}
        onOpenBranches={() => setShowBranches(true)}
        onOpenPolicy={() => setShowPolicy(true)}
        onOpenReferral={() => setShowReferral(true)}
      />

      {/* Patient Greeting when invited via direct WhatsApp link */}
      {patientGreeting.show && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-3 text-right">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                🌸
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                  {patientGreeting.patientName
                    ? `أهلاً بك يا أستاذ/ة ${patientGreeting.patientName} في معامل رامي مختار!`
                    : 'أهلاً بك في مسابقات وجوائز معامل رامي مختار!'}
                </h4>
                <p className="text-[11px] text-emerald-800">
                  تم تخصيص هذه الجولة لحضرتك. اختر وسيلتك المفضلة أدناه وابدأ اللعب للفوز بكوبونك الطبي المعتمد!
                </p>
              </div>
            </div>

            <button
              onClick={() => setPatientGreeting({ show: false })}
              className="text-emerald-700 hover:text-emerald-900 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <Hero
        settings={settings}
        onScrollToGames={scrollToGames}
        onOpenBranches={() => setShowBranches(true)}
        onOpenReferral={() => setShowReferral(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto py-8 space-y-8">
        {/* If restricted (played within 24 hours), show countdown banner */}
        {!restriction.canPlay && (
          <LockoutBanner
            remainingTimeFormatted={restriction.remainingTimeFormatted}
            lastClaim={restriction.lastClaim}
            settings={settings}
          />
        )}

        {/* Game Selector Section */}
        <section ref={gamesRef} className="space-y-6">
          <GameSelector
            activeGame={activeGame}
            onSelectGame={(g) => setActiveGame(g)}
            disabled={!restriction.canPlay}
          />

          {/* Active Game Area */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-8 mx-4">
            {activeGame === 'wheel' && (
              <SpinWheel
                prizes={prizes}
                onWin={handlePrizeWon}
                disabled={!restriction.canPlay}
              />
            )}

            {activeGame === 'scratch' && (
              <ScratchCard
                prizes={prizes}
                onWin={handlePrizeWon}
                disabled={!restriction.canPlay}
              />
            )}

            {activeGame === 'box' && (
              <MysteryBox
                prizes={prizes}
                onWin={handlePrizeWon}
                disabled={!restriction.canPlay}
              />
            )}

            {activeGame === 'match' && (
              <MedicalMemoryMatch
                prizes={prizes}
                onWin={handlePrizeWon}
                disabled={!restriction.canPlay}
              />
            )}

            {activeGame === 'quiz' && (
              <HealthQuiz
                questions={quizQuestions}
                prizes={prizes}
                onWin={handlePrizeWon}
                disabled={!restriction.canPlay}
              />
            )}

            {activeGame === 'capsule' && (
              <LuckyCapsule
                prizes={prizes}
                onWin={handlePrizeWon}
                disabled={!restriction.canPlay}
              />
            )}
          </div>
        </section>

        {/* Branches, Reception Photos & Contact Info Section */}
        <section className="px-4 space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#8B1E2D] font-bold text-xs border border-rose-200 mb-2">
              <MapPin className="h-3.5 w-3.5 text-[#8B1E2D]" />
              <span>فروعنا المعتمدة وصالات الاستقبال المجهزة</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              أهلاً بكم في فروع معمل د. رامي مختار للتحاليل (RT Labs)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              يسعدنا استقبالكم في أي من فروعنا الأربعة، أو حجز موعد سحب عينة منزلي فوري
            </p>
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-sm group bg-slate-900 h-60">
              <img
                src={labReception}
                alt="صالة استقبال معامل رامي مختار"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4 text-right">
                <div>
                  <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                    صالة الاستقبال الرئيسية
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">
                    أعلى معايير النظافة والراحة للمرضى
                  </h4>
                </div>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-sm group bg-slate-900 h-60">
              <img
                src={medicalTeam}
                alt="الفريق الطبي والاستشاري"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4 text-right">
                <div>
                  <span className="text-[10px] font-bold bg-emerald-400 text-slate-950 px-2 py-0.5 rounded">
                    الكادر الطبي
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">
                    نخبة من أطباء واستشاريي قصر العيني
                  </h4>
                </div>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-sm group bg-slate-900 h-60">
              <img
                src={labHero}
                alt="أحدث التجهيزات المخبرية"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4 text-right">
                <div>
                  <span className="text-[10px] font-bold bg-rose-400 text-white px-2 py-0.5 rounded">
                    التجهيزات والأجهزة
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">
                    أدق أجهزة التحاليل التلقائية في مصر
                  </h4>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Branches Contact Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {settings.branches.map((b) => (
              <div
                key={b.id}
                className={`rounded-2xl p-4 border transition flex flex-col justify-between text-right ${
                  b.isHomeVisit
                    ? 'border-purple-200 bg-gradient-to-br from-purple-50/70 to-white shadow-xs'
                    : 'border-slate-200 bg-white hover:border-[#8B1E2D]/40 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                        b.isHomeVisit ? 'bg-purple-100 text-purple-700' : 'bg-rose-50 text-[#8B1E2D]'
                      }`}
                    >
                      {b.isHomeVisit ? <Home className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                    </div>
                    {b.isHomeVisit ? (
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                        خدمة 24/7
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {b.hours.includes('24') ? 'متاح 24 ساعة' : 'طوال الأسبوع'}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-1">{b.name}</h4>
                  <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">{b.address}</p>
                  <p className="text-[10px] text-slate-500 mb-3 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-600" />
                    <span>{b.hours}</span>
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <a
                    href={`tel:${b.phone}`}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-mono font-bold text-[11px] flex items-center justify-center gap-1 dir-ltr transition"
                  >
                    <Phone className="h-3 w-3 text-[#8B1E2D]" />
                    <span>{b.phone}</span>
                  </a>

                  <a
                    href={`https://wa.me/${b.phone.replace(/\D/g, '').startsWith('0') ? '20' + b.phone.replace(/\D/g, '').substring(1) : b.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً ${settings.labNameAr}، أود الاستفسار عن مواعيد وحجز فرع (${b.name}).`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center justify-center"
                    title="مراسلة عبر واتساب"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Lab Trust and Features Section */}
        <section className="px-4">
          <div className="bg-gradient-to-br from-slate-900 to-[#0F2B5C] rounded-3xl p-6 sm:p-8 text-white shadow-md text-right">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-base">تحت إشراف كبار استشاريي قصر العيني</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  أحدث الأجهزة الأوتوماتيكية بالكامل ومعايير الجودة العالمية لضمان أعلى درجات الدقة التشخيصية.
                </p>
              </div>

              <div className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-white/10 text-emerald-300 flex items-center justify-center">
                  <Home className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-base">خدمة السحب والزيارات المنزلية المريحة</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  أخصائيو سحب متمرسون يصلون إلى باب منزلك في كافة مناطق القاهرة والجيزة والقليوبية بأعلى درجات التعقيم.
                </p>
              </div>

              <div className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-white/10 text-rose-300 flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-base">نتائج سريعة عبر الواتساب والموقع</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  استلام تقارير التحاليل الفورية بصيغة PDF فور اعتمادها من الطبيب الاستشاري دون الحاجة للانتظار بالمعمل.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500 space-y-2">
        <p className="font-bold text-slate-700">
          جميع الحقوق محفوظة © {new Date().getFullYear()} {settings.labNameAr}
        </p>
        <p className="text-[11px] text-slate-400">
          {settings.sloganAr} • الخط الساخن: {settings.hotline} • واتساب: {settings.whatsappNumber}
        </p>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        settings={settings}
        pendingCount={pendingClaimsCount}
        onOpenAdmin={() => setShowAdmin(true)}
        onOpenBranches={() => setShowBranches(true)}
        onOpenPolicy={() => setShowPolicy(true)}
        onScrollToGames={scrollToGames}
        onOpenReferral={() => setShowReferral(true)}
      />

      {/* Claim Modal when patient wins */}
      {wonPrize && (
        <ClaimModal
          prize={wonPrize}
          gameType={activeGame}
          settings={settings}
          onClose={() => setWonPrize(null)}
          onSuccess={handleClaimSuccess}
        />
      )}

      {/* Referral / Invite Friend Reward Modal */}
      <ReferralRewardModal
        settings={settings}
        isOpen={showReferral}
        onClose={() => setShowReferral(false)}
        onClaimCreated={handleClaimSuccess}
      />

      {/* Admin Panel Modal */}
      {showAdmin && (
        <AdminPanel
          prizes={prizes}
          onUpdatePrizes={(newPrizes) => {
            setPrizes(newPrizes);
            savePrizes(newPrizes);
          }}
          settings={settings}
          onUpdateSettings={(newSettings) => {
            setSettings(newSettings);
            saveSettings(newSettings);
          }}
          claims={claims}
          onRefreshClaims={async () => {
            const latest = await fetchClaimsFromCloud();
            setClaims(latest);
          }}
          quizQuestions={quizQuestions}
          onUpdateQuizQuestions={(newQuestions) => {
            setQuizQuestions(newQuestions);
            saveQuizQuestions(newQuestions);
          }}
          onClose={() => setShowAdmin(false)}
        />
      )}

      {/* Branches Modal */}
      {showBranches && (
        <BranchesModal
          settings={settings}
          onClose={() => setShowBranches(false)}
        />
      )}

      {/* Policy Modal */}
      {showPolicy && (
        <PolicyModal
          settings={settings}
          onClose={() => setShowPolicy(false)}
        />
      )}
    </div>
  );
}
