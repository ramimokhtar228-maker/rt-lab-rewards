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
} from './utils/storage';
import {
  PlayerProfile,
  Question,
  RewardItem,
  SpinSlice,
  LabSettings,
  UserCoupon,
  LeaderboardUser,
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

  // Modals
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncTargetCoupon, setSyncTargetCoupon] = useState<UserCoupon | null>(null);
  const [customSyncMessage, setCustomSyncMessage] = useState<string | undefined>(undefined);

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Update Player Profile Handler
  const handleUpdatePlayer = (partial: Partial<PlayerProfile>) => {
    setPlayer((prev) => {
      const updated = { ...prev, ...partial };
      savePlayerProfile(updated);
      return updated;
    });
  };

  // Award Coupon Handler (called from Quiz, Wheel, Scratch)
  const handleAwardCoupon = (
    title: string,
    description: string,
    value: string,
    wonFrom: string
  ): UserCoupon => {
    const newCoupon = issueUserCoupon(title, description, value, 'free_test', wonFrom);
    setUserCoupons(getUserCoupons());
    return newCoupon;
  };

  // Redeem from Store Handler
  const handleRedeemReward = (reward: RewardItem): UserCoupon => {
    // Deduct points
    handleUpdatePlayer({ points: player.points - reward.pointsCost });

    // Issue coupon
    const newCoupon = issueUserCoupon(
      reward.title,
      reward.description,
      reward.value,
      reward.type,
      'متجر استبدال النقاط',
      reward.terms
    );
    setUserCoupons(getUserCoupons());
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

  const handleResetDefaults = () => {
    resetAllDataToDefault();
    setQuestions(getQuestions());
    setRewards(getRewards());
    setSlices(getSpinSlices());
    setSettings(getLabSettings());
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
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        {activeTab === 'home' && (
          <HeroSection
            settings={settings}
            player={player}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenSync={() => handleOpenGeneralSync()}
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
          />
        )}

        {activeTab === 'scratch' && (
          <ScratchCardGame
            player={player}
            onUpdatePlayer={handleUpdatePlayer}
            onAwardCoupon={handleAwardCoupon}
            onOpenSyncWithCoupon={handleOpenSyncWithCoupon}
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

      {/* Admin Panel Modal (Full CRUD on all items) */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        questions={questions}
        rewards={rewards}
        slices={slices}
        settings={settings}
        onSaveQuestions={handleSaveQuestions}
        onSaveRewards={handleSaveRewards}
        onSaveSlices={handleSaveSlices}
        onSaveSettings={handleSaveSettings}
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
    </div>
  );
}
