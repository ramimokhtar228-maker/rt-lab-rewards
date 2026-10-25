/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  getPlayerProfile,
  savePlayerProfile,
  getQuestions,
  saveQuestions,
  getRewards,
  saveRewards,
  getSpinSlices,
  saveSpinSlices,
  getLabSettings,
  saveLabSettings,
  getUserCoupons,
  saveUserCoupons,
  issueUserCoupon,
  getLeaderboard,
  resetAllDataToDefault,
  exportDatabaseBackup,
  importDatabaseBackup,
  getRegisteredPatients,
  deletePatientRecord,
  resetAllPatients,
  resetAppForNewPatients,
  recordOrUpdatePatient,
  getPrizeClaims,
  addPrizeClaim,
  updateClaimStatus,
  deletePrizeClaim,
} from './utils/storage';
import {
  PlayerProfile,
  Question,
  RewardItem,
  SpinSlice,
  LabSettings,
  UserCoupon,
  LeaderboardUser,
  PatientRecord,
  PrizeClaimBooking,
} from './types';
import { Bell, MessageCircle, X } from 'lucide-react';
import { soundManager } from './utils/audio';
import { subscribeToCloudClaims, fetchRecentClaimsFromCloud } from './utils/cloudSync';
import { formatWhatsAppNumber } from './utils/storage';
import { TopNavbar } from './components/TopNavbar';
import { HeroSection } from './components/HeroSection';
import { QuizGame } from './components/QuizGame';
import { SpinWheel } from './components/SpinWheel';
import { ScratchCardGame } from './components/ScratchCardGame';
import { RewardsStore } from './components/RewardsStore';
import { Leaderboard } from './components/Leaderboard';
import { WhatsAppSyncModal } from './components/WhatsAppSyncModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { PatientProfileModal } from './components/PatientProfileModal';
import { InviteShareModal } from './components/InviteShareModal';
import { PrizeClaimModal } from './components/PrizeClaimModal';
import { LabConnectBar } from './components/LabConnectBar';
import { MobileBottomNav } from './components/MobileBottomNav';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');

  // Application Data States
  const [player, setPlayer] = useState<PlayerProfile>(() => getPlayerProfile());
  const [questions, setQuestions] = useState<Question[]>(() => getQuestions());
  const [rewards, setRewards] = useState<RewardItem[]>(() => getRewards());
  const [slices, setSlices] = useState<SpinSlice[]>(() => getSpinSlices());
  const [settings, setSettings] = useState<LabSettings>(() => getLabSettings());
  const [userCoupons, setUserCoupons] = useState<UserCoupon[]>(() => getUserCoupons());
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(() => getLeaderboard());
  const [patients, setPatients] = useState<PatientRecord[]>(() => getRegisteredPatients());
  const [claims, setClaims] = useState<PrizeClaimBooking[]>(() => getPrizeClaims());

  // Modals
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncTargetCoupon, setSyncTargetCoupon] = useState<UserCoupon | null>(null);
  const [customSyncMessage, setCustomSyncMessage] = useState<string | undefined>(undefined);

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Prize Claim & League Registration Modal
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimTargetCoupon, setClaimTargetCoupon] = useState<UserCoupon | null>(null);

  // Real-Time Cross-Device Sync State & Audible Chime Alert ("تسمع عندي")
  const [liveToastClaim, setLiveToastClaim] = useState<PrizeClaimBooking | null>(null);

  useEffect(() => {
    // 1. Initial fetch of any claims registered while offline
    fetchRecentClaimsFromCloud().then((remoteClaims) => {
      if (remoteClaims && remoteClaims.length > 0) {
        remoteClaims.forEach((clm) => {
          addPrizeClaim(clm);
        });
        setClaims(getPrizeClaims());
      }
    });

    // 2. Real-time subscription across devices (serverless SSE)
    const unsubscribe = subscribeToCloudClaims(
      (newClaim) => {
        // Audible chime alert: "تسمع عندي"
        soundManager.playBellNotification();

        // Save to local database
        addPrizeClaim(newClaim);
        setClaims(getPrizeClaims());
        setLeaderboard(getLeaderboard());
        setPatients(getRegisteredPatients());

        // Display floating live toast alert for 9 seconds
        setLiveToastClaim(newClaim);
        setTimeout(() => {
          setLiveToastClaim((curr) => (curr?.id === newClaim.id ? null : curr));
        }, 9000);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Auto-sync official laboratory settings and verified numbers on app launch
  useEffect(() => {
    // 1. Initial sync from storage and URL query params
    const verified = getLabSettings();
    setSettings(verified);

    // 2. Live background sync from /lab-config.json with cache buster
    fetch(`/lab-config.json?cache_bust=${Date.now()}`, { cache: 'no-store' })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch config');
      })
      .then((remoteConfig) => {
        if (remoteConfig && remoteConfig.whatsappNumber) {
          setSettings((prev) => {
            const merged = {
              ...prev,
              ...remoteConfig,
              whatsappNumber: remoteConfig.whatsappNumber || prev.whatsappNumber,
              hotlineNumber: remoteConfig.hotlineNumber || prev.hotlineNumber,
            };
            saveLabSettings(merged);
            return merged;
          });
        }
      })
      .catch(() => {
        // Fallback to verified local settings
      });
  }, []);

  // Sync active player to registered patients list
  useEffect(() => {
    recordOrUpdatePatient(player, userCoupons.length);
    setPatients(getRegisteredPatients());
    setLeaderboard(getLeaderboard());
  }, [player.points, player.name, player.phone, userCoupons.length]);

  // Update Player Profile Handler
  const handleUpdatePlayer = (partial: Partial<PlayerProfile>) => {
    setPlayer((prev) => {
      const updated = { ...prev, ...partial };
      savePlayerProfile(updated);
      return updated;
    });
  };

  // Award Bonus Points (e.g. from sharing or special actions)
  const handleAwardBonusPoints = (amount: number) => {
    handleUpdatePlayer({ points: player.points + amount });
  };

  // Open Claim Modal for a coupon
  const handleOpenClaimModal = (coupon: UserCoupon) => {
    setClaimTargetCoupon(coupon);
    setIsClaimModalOpen(true);
  };

  // Add new claim booking
  const handleAddClaimBooking = (claimData: Omit<PrizeClaimBooking, 'id' | 'createdAt' | 'status'>) => {
    addPrizeClaim(claimData);
    setClaims(getPrizeClaims());
    setLeaderboard(getLeaderboard());
    setPatients(getRegisteredPatients());
  };

  // Award Coupon Handler (called from Quiz, Wheel, Scratch)
  const handleAwardCoupon = (
    title: string,
    description: string,
    value: string,
    wonFrom: string
  ): UserCoupon => {
    const newCoupon = issueUserCoupon(title, description, value, 'free_test', wonFrom);
    const updatedCoupons = getUserCoupons();
    setUserCoupons(updatedCoupons);
    return newCoupon;
  };

  // Redeem from Store Handler
  const handleRedeemReward = (reward: RewardItem): UserCoupon => {
    handleUpdatePlayer({ points: player.points - reward.pointsCost });

    const newCoupon = issueUserCoupon(
      reward.title,
      reward.description,
      reward.value,
      reward.type,
      'متجر استبدال النقاط',
      reward.terms
    );
    const updatedCoupons = getUserCoupons();
    setUserCoupons(updatedCoupons);
    return newCoupon;
  };

  // Sync to WhatsApp with specific coupon
  const handleOpenSyncWithCoupon = (coupon: UserCoupon) => {
    setSyncTargetCoupon(coupon);
    setCustomSyncMessage(undefined);
    setIsSyncModalOpen(true);
  };

  // Sync to WhatsApp general booking
  const handleOpenGeneralSync = (customMsg?: string) => {
    setSyncTargetCoupon(userCoupons[0] || null);
    setCustomSyncMessage(customMsg);
    setIsSyncModalOpen(true);
  };

  // Admin Data Actions
  const handleSaveQuestions = (updated: Question[]) => {
    setQuestions(updated);
    saveQuestions(updated);
  };

  const handleSaveRewards = (updated: RewardItem[]) => {
    setRewards(updated);
    saveRewards(updated);
  };

  const handleSaveSlices = (updated: SpinSlice[]) => {
    setSlices(updated);
    saveSpinSlices(updated);
  };

  const handleSaveSettings = (updated: LabSettings) => {
    setSettings(updated);
    saveLabSettings(updated);
  };

  const handleDeletePatient = (id: string) => {
    deletePatientRecord(id);
    setPatients(getRegisteredPatients());
  };

  const handleResetPatients = () => {
    resetAllPatients();
    setPatients(getRegisteredPatients());
  };

  const handleResetAppForNewPatients = () => {
    resetAppForNewPatients();
    const freshProfile = getPlayerProfile();
    setPlayer(freshProfile);
    setUserCoupons(getUserCoupons());
    setPatients(getRegisteredPatients());
    setLeaderboard(getLeaderboard());
  };

  const handleUpdateClaimStatus = (id: string, status: PrizeClaimBooking['status']) => {
    updateClaimStatus(id, status);
    setClaims(getPrizeClaims());
  };

  const handleDeleteClaim = (id: string) => {
    deletePrizeClaim(id);
    setClaims(getPrizeClaims());
  };

  const handleResetDefaults = () => {
    resetAllDataToDefault();
    setQuestions(getQuestions());
    setRewards(getRewards());
    setSlices(getSpinSlices());
    setSettings(getLabSettings());
    setPatients(getRegisteredPatients());
    setLeaderboard(getLeaderboard());
    setClaims(getPrizeClaims());
  };

  const handleExportBackup = () => {
    const jsonStr = exportDatabaseBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rt_lab_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (jsonStr: string) => {
    const ok = importDatabaseBackup(jsonStr);
    if (ok) {
      setQuestions(getQuestions());
      setRewards(getRewards());
      setSlices(getSpinSlices());
      setSettings(getLabSettings());
      setPatients(getRegisteredPatients());
      setLeaderboard(getLeaderboard());
    }
    return ok;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      {/* Top Navbar */}
      <TopNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        points={player.points}
        playerName={player.name}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenInvite={() => setIsInviteModalOpen(true)}
      />

      {/* Real-time Incoming Booking/Claim Toast Notification ("تسمع عندي") */}
      {liveToastClaim && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-20 right-4 left-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-400/90 rounded-2xl p-4 shadow-2xl text-right animate-in slide-in-from-top-4 duration-300"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-300 block">إشعار حجز وتفعيل جائزة فوري 🔔</span>
                <h4 className="text-sm font-extrabold text-white">{liveToastClaim.patientName}</h4>
              </div>
            </div>
            <button
              onClick={() => setLiveToastClaim(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2.5 text-xs text-slate-300 space-y-1 bg-slate-950/70 p-2.5 rounded-xl border border-emerald-500/20">
            <div>🎁 الجائزة: <strong className="text-amber-400">{liveToastClaim.prizeTitle}</strong></div>
            <div>📱 هاتف المريض: <span className="font-mono text-emerald-300">{liveToastClaim.patientPhone}</span></div>
            <div>📍 نوع الخدمة: <strong className="text-white">{liveToastClaim.serviceType === 'home_visit' ? 'سحب منزلي 🏠' : 'زيارة فرع 🏥'}</strong></div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <a
              href={`https://wa.me/${formatWhatsAppNumber(liveToastClaim.patientPhone)}?text=${encodeURIComponent(
                `أهلاً بك يا أستاذ/ة ${liveToastClaim.patientName} في معامل RT. استلمنا طلب تفعيل جائزتك (${liveToastClaim.prizeTitle}) وسنتواصل معك فوراً لتأكيد الموعد 🩺`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-md"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>مراسلة المريض فوراً</span>
            </a>
            <button
              onClick={() => {
                setLiveToastClaim(null);
                setIsAdminModalOpen(true);
              }}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            >
              عرض السجل
            </button>
          </div>
        </aside>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 pb-28 lg:pb-8">
        {activeTab === 'home' && (
          <HeroSection
            settings={settings}
            player={player}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenSync={() => handleOpenGeneralSync()}
            onOpenInvite={() => setIsInviteModalOpen(true)}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizGame
            questions={questions}
            player={player}
            onUpdatePlayer={handleUpdatePlayer}
            onAwardCoupon={handleAwardCoupon}
            onOpenSync={handleOpenGeneralSync}
          />
        )}

        {activeTab === 'wheel' && (
          <SpinWheel
            slices={slices}
            player={player}
            onUpdatePlayer={handleUpdatePlayer}
            onAwardCoupon={handleAwardCoupon}
            onOpenSyncWithCoupon={handleOpenSyncWithCoupon}
            onClaimPrize={handleOpenClaimModal}
          />
        )}

        {activeTab === 'scratch' && (
          <ScratchCardGame
            player={player}
            onUpdatePlayer={handleUpdatePlayer}
            onAwardCoupon={handleAwardCoupon}
            onOpenSyncWithCoupon={handleOpenSyncWithCoupon}
            onClaimPrize={handleOpenClaimModal}
          />
        )}

        {activeTab === 'store' && (
          <RewardsStore
            rewards={rewards}
            userCoupons={userCoupons}
            player={player}
            onUpdatePlayer={handleUpdatePlayer}
            onRedeemReward={handleRedeemReward}
            onOpenSyncWithCoupon={handleOpenSyncWithCoupon}
            onClaimPrize={handleOpenClaimModal}
          />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard leaderboard={leaderboard} player={player} />
        )}
      </main>

      {/* Persistent Lab Connect & Home Visit Footer Bar */}
      <LabConnectBar
        settings={settings}
        onOpenSync={() => handleOpenGeneralSync()}
      />

      {/* WhatsApp Synchronization Modal */}
      <WhatsAppSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        coupon={syncTargetCoupon}
        settings={settings}
        player={player}
        customMessage={customSyncMessage}
      />

      {/* Prize Claim & League Registration Modal */}
      <PrizeClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        coupon={claimTargetCoupon}
        player={player}
        settings={settings}
        onSavePlayer={handleUpdatePlayer}
        onAddClaimBooking={handleAddClaimBooking}
      />

      {/* Admin Panel Modal (Protected with PIN, Patient Management, CRUD, Bookings Log) */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        questions={questions}
        rewards={rewards}
        slices={slices}
        settings={settings}
        patients={patients}
        claims={claims}
        onSaveQuestions={handleSaveQuestions}
        onSaveRewards={handleSaveRewards}
        onSaveSlices={handleSaveSlices}
        onSaveSettings={handleSaveSettings}
        onDeletePatient={handleDeletePatient}
        onResetPatients={handleResetPatients}
        onResetAppForNewPatients={handleResetAppForNewPatients}
        onUpdateClaimStatus={handleUpdateClaimStatus}
        onDeleteClaim={handleDeleteClaim}
        onResetDefaults={handleResetDefaults}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
      />

      {/* Patient Profile Modal */}
      <PatientProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        player={player}
        onSavePlayer={handleUpdatePlayer}
      />

      {/* Invite & Share with Friends Modal */}
      <InviteShareModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onAwardBonusPoints={handleAwardBonusPoints}
        labName={settings.labName}
        whatsappNumber={settings.whatsappNumber}
        hotlineNumber={settings.hotlineNumber}
      />

      {/* Mobile App Native Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        couponsCount={userCoupons.length}
      />
    </div>
  );
}
