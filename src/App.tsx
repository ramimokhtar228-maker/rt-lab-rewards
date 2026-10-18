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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
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
      />
    </div>
  );
}
