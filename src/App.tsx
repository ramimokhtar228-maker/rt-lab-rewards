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
  SampleCollector,
} from './types';
import { realtimeSync } from './utils/realtimeSync';
import { alertSoundManager } from './utils/audioAlert';
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
import { IncomingClaimAlert } from './components/IncomingClaimAlert';
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
  const [collectors, setCollectors] = useState<SampleCollector[]>(
    () => settings.collectors || []
  );

  // Real-Time Sync & Live Alert States
  const [syncStatus, setSyncStatus] = useState<'connected' | 'connecting' | 'offline'>('connected');
  const [activeIncomingAlert, setActiveIncomingAlert] = useState<PrizeClaimBooking | null>(null);

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

  // Connect to Real-time Cross-Device Sync Server & Listeners
  useEffect(() => {
    // Request desktop notification permission on user entry
    alertSoundManager.requestNotificationPermission().catch(() => {});

    // 1. Listen for sync status changes
    const unsubStatus = realtimeSync.onStatusChange((status) => {
      setSyncStatus(status);
    });

    // 2. Listen for incoming real-time events across devices
    const unsubEvents = realtimeSync.addEventListener((ev) => {
      if (ev.type === 'claim:new') {
        const newClaim = ev.data as PrizeClaimBooking;
        // Trigger incoming alert popup and chime on this device ("لازم تسمع عندي")
        setActiveIncomingAlert(newClaim);
        setClaims((prev) => {
          if (prev.some((c) => c.id === newClaim.id)) return prev;
          return [newClaim, ...prev];
        });
      } else if (ev.type === 'claim:updated') {
        const updated = ev.data;
        setClaims((prev) =>
          prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
        );
      } else if (ev.type === 'claim:deleted') {
        setClaims((prev) => prev.filter((c) => c.id !== ev.data.id));
      } else if (ev.type === 'collector:updated') {
        const updatedCol = ev.data;
        setCollectors((prev) => {
          const idx = prev.findIndex((c) => c.id === updatedCol.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = updatedCol;
            return next;
          }
          return [...prev, updatedCol];
        });
      } else if (ev.type === 'sync:init') {
        if (ev.data.claims && Array.isArray(ev.data.claims) && ev.data.claims.length > 0) {
          setClaims(ev.data.claims);
        }
        if (ev.data.collectors && Array.isArray(ev.data.collectors) && ev.data.collectors.length > 0) {
          setCollectors(ev.data.collectors);
        }
      }
    });

    // 3. Initial fetch from server
    realtimeSync.fetchClaims().then((serverClaims) => {
      if (serverClaims && serverClaims.length > 0) {
        setClaims(serverClaims);
      }
    });
    realtimeSync.fetchCollectors().then((serverCollectors) => {
      if (serverCollectors && serverCollectors.length > 0) {
        setCollectors(serverCollectors);
      }
    });

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlName = params.get('name') || params.get('patient');
      const urlPhone = params.get('phone') || params.get('tel');
      if (urlName || urlPhone) {
        setPlayer((prev) => {
          const next = {
            ...prev,
            name: urlName || prev.name,
            phone: urlPhone || prev.phone,
          };
          savePlayerProfile(next);
          return next;
        });
      }
      if (params.get('admin') === 'true') {
        setIsAdminModalOpen(true);
      }
    }

    return () => {
      unsubStatus();
      unsubEvents();
    };
  }, []);

  // Auto-sync official laboratory settings and verified numbers on app launch
  useEffect(() => {
    const verified = getLabSettings();
    setSettings(verified);
    if (verified.collectors && verified.collectors.length > 0 && collectors.length === 0) {
      setCollectors(verified.collectors);
    }

    // Live background sync from /lab-config.json
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
          if (remoteConfig.collectors && Array.isArray(remoteConfig.collectors)) {
            setCollectors(remoteConfig.collectors);
          }
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

  // Award Bonus Points
  const handleAwardBonusPoints = (amount: number) => {
    handleUpdatePlayer({ points: player.points + amount });
  };

  // Open Claim Modal for a coupon
  const handleOpenClaimModal = (coupon: UserCoupon) => {
    setClaimTargetCoupon(coupon);
    setIsClaimModalOpen(true);
  };

  // Add new claim booking (with multi-device real-time sync)
  const handleAddClaimBooking = async (
    claimData: Omit<PrizeClaimBooking, 'id' | 'createdAt' | 'status'>
  ) => {
    // 1. Save to local storage
    const newClaim = addPrizeClaim(claimData);

    // 2. Transmit to server & all connected devices
    await realtimeSync.submitClaim(claimData);

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

  const handleSaveCollectors = async (updated: SampleCollector[]) => {
    setCollectors(updated);
    const updatedSettings = { ...settings, collectors: updated };
    setSettings(updatedSettings);
    saveLabSettings(updatedSettings);
    for (const c of updated) {
      await realtimeSync.saveCollector(c);
    }
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
    realtimeSync.updateClaimStatus(id, status);
    setClaims(getPrizeClaims());
  };

  const handleDeleteClaim = (id: string) => {
    deletePrizeClaim(id);
    realtimeSync.deleteClaim(id);
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
    const a = document.createElement('a');
    a.href = url;
    a.download = `rt_lab_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportBackup = (jsonStr: string): boolean => {
    const success = importDatabaseBackup(jsonStr);
    if (success) {
      setQuestions(getQuestions());
      setRewards(getRewards());
      setSlices(getSpinSlices());
      setSettings(getLabSettings());
      setPatients(getRegisteredPatients());
      setLeaderboard(getLeaderboard());
      setClaims(getPrizeClaims());
    }
    return success;
  };

  const handleTriggerTestAlert = () => {
    realtimeSync.triggerTestAlert();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white pb-20 md:pb-12" dir="rtl">
      {/* Real-Time Incoming Claim Alert Banner */}
      <IncomingClaimAlert
        claim={activeIncomingAlert}
        settings={settings}
        onDismiss={() => setActiveIncomingAlert(null)}
        onViewInAdmin={() => {
          setActiveIncomingAlert(null);
          setIsAdminModalOpen(true);
        }}
      />

      {/* Primary Top Navigation Bar */}
      <TopNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        points={player.points}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenInvite={() => setIsInviteModalOpen(true)}
        playerName={player.name}
        pendingClaimsCount={claims.filter((c) => c.status === 'pending').length}
        syncStatus={syncStatus}
        onTriggerTestAlert={handleTriggerTestAlert}
      />

      {/* Main Interactive Views */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {activeTab === 'home' && (
          <HeroSection
            player={player}
            settings={settings}
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
        collectors={collectors}
        onSavePlayer={handleUpdatePlayer}
        onAddClaimBooking={handleAddClaimBooking}
        customMessage={customSyncMessage}
      />

      {/* Prize Claim & League Registration Modal */}
      <PrizeClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        coupon={claimTargetCoupon}
        player={player}
        settings={settings}
        collectors={collectors}
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
        collectors={collectors}
        onSaveQuestions={handleSaveQuestions}
        onSaveRewards={handleSaveRewards}
        onSaveSlices={handleSaveSlices}
        onSaveSettings={handleSaveSettings}
        onSaveCollectors={handleSaveCollectors}
        onDeletePatient={handleDeletePatient}
        onResetPatients={handleResetPatients}
        onResetAppForNewPatients={handleResetAppForNewPatients}
        onUpdateClaimStatus={handleUpdateClaimStatus}
        onDeleteClaim={handleDeleteClaim}
        onResetDefaults={handleResetDefaults}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onTriggerTestAlert={handleTriggerTestAlert}
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
