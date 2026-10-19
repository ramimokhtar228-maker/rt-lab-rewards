/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  issueUserCoupon,
  getLeaderboard,
  resetAllDataToDefault,
  exportDatabaseBackup,
  importDatabaseBackup,
  getRegisteredPatients,
  saveRegisteredPatients,
  deletePatientRecord,
  resetAllPatients,
  resetAppForNewPatients,
  recordOrUpdatePatient,
  getPrizeClaims,
  savePrizeClaims,
  addPrizeClaim,
  updateClaimStatus,
  deletePrizeClaim,
  fetchCloudStatus,
  fetchCloudData,
  pushCloudData,
  sendCloudHeartbeat,
  pushBackupToGitHub,
  pullBackupFromGitHub,
  getGitHubToken,
  CloudSyncPayload,
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
  LabBranch,
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
import { BranchesManagementModal } from './components/BranchesManagementModal';
import {
  Cloud,
  CheckCircle2,
  RefreshCw,
  Home,
  Brain,
  RotateCw,
  Sparkles,
  Gift,
  Trophy,
} from 'lucide-react';
import { soundManager } from './utils/audio';

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

  // Cloud Synchronization States
  const [cloudRevision, setCloudRevision] = useState<number>(1);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);
  const [devicesOnlineCount, setDevicesOnlineCount] = useState<number>(1);
  const [connectedDevicesList, setConnectedDevicesList] = useState<any[]>([]);
  const [cloudNotice, setCloudNotice] = useState<string | null>(null);

  // Modals
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncTargetCoupon, setSyncTargetCoupon] = useState<UserCoupon | null>(null);
  const [customSyncMessage, setCustomSyncMessage] = useState<string | undefined>(undefined);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimTargetCoupon, setClaimTargetCoupon] = useState<UserCoupon | null>(null);
  const [isBranchesModalOpen, setIsBranchesModalOpen] = useState(false);

  // Ref to track current revision to avoid stale closure in polling
  const cloudRevisionRef = useRef(cloudRevision);
  cloudRevisionRef.current = cloudRevision;

  // Sync active player to registered patients list
  useEffect(() => {
    recordOrUpdatePatient(player, userCoupons.length);
    setPatients(getRegisteredPatients());
    setLeaderboard(getLeaderboard());
  }, [player.points, player.name, player.phone, userCoupons.length, player.preferredBranchId]);

  // Read room query param from URL if specified
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam && roomParam !== settings.cloudSyncRoomId) {
        setSettings((prev) => {
          const updated = { ...prev, cloudSyncRoomId: roomParam };
          saveLabSettings(updated);
          return updated;
        });
      }
    } catch {
      // ignore
    }
  }, []);

  // Construct current payload for cloud synchronization
  const buildCurrentPayload = (): CloudSyncPayload => {
    return {
      settings: getLabSettings(),
      branches: getLabSettings().branches || [],
      adminTeam: getLabSettings().adminTeam || [],
      whatsappTemplates: getLabSettings().whatsappTemplates || [],
      questions: getQuestions(),
      rewards: getRewards(),
      slices: getSpinSlices(),
      claims: getPrizeClaims(),
      patients: getRegisteredPatients(),
      leaderboard: getLeaderboard(),
    };
  };

  // Broadcast local changes to Cloud Server
  const broadcastToCloud = async (overrideSettings?: LabSettings) => {
    try {
      const payload: CloudSyncPayload = {
        settings: overrideSettings || getLabSettings(),
        branches: (overrideSettings || getLabSettings()).branches || [],
        adminTeam: (overrideSettings || getLabSettings()).adminTeam || [],
        whatsappTemplates: (overrideSettings || getLabSettings()).whatsappTemplates || [],
        questions: getQuestions(),
        rewards: getRewards(),
        slices: getSpinSlices(),
        claims: getPrizeClaims(),
        patients: getRegisteredPatients(),
        leaderboard: getLeaderboard(),
      };

      const result = await pushCloudData(payload);
      if (result.success && result.revision) {
        setCloudRevision(result.revision);
        setIsCloudConnected(true);
      }
    } catch (err) {
      console.error('Cloud broadcast error:', err);
    }
  };

  // Initial Cloud Mount & Regular Heartbeat Polling
  useEffect(() => {
    let isMounted = true;

    const initializeCloud = async () => {
      try {
        const cloudState = await fetchCloudData();
        if (!isMounted) return;

        if (cloudState && cloudState.data) {
          // Hydrate from cloud data
          const data = cloudState.data;
          setCloudRevision(cloudState.revision);
          setIsCloudConnected(true);

          if (data.settings) {
            setSettings(data.settings);
            saveLabSettings(data.settings);
          }
          if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions);
            saveQuestions(data.questions);
          }
          if (data.rewards && data.rewards.length > 0) {
            setRewards(data.rewards);
            saveRewards(data.rewards);
          }
          if (data.slices && data.slices.length > 0) {
            setSlices(data.slices);
            saveSpinSlices(data.slices);
          }
          if (data.claims) {
            setClaims(data.claims);
          }
          if (data.patients) {
            setPatients(data.patients);
          }
        } else {
          // Cloud has no data yet, push initial baseline
          await broadcastToCloud();
        }
      } catch (err) {
        console.error('Error during cloud initialization:', err);
      }
    };

    initializeCloud();

    // Heartbeat & status polling interval (every 4 seconds)
    const interval = setInterval(async () => {
      try {
        const heartbeatRes = await sendCloudHeartbeat(settings.branches?.[0]?.name || 'الفرع الرئيسي');
        if (!isMounted) return;

        if (heartbeatRes) {
          setIsCloudConnected(true);
          setDevicesOnlineCount(Math.max(1, heartbeatRes.devicesCount || 1));
          if (heartbeatRes.connectedDevices) {
            setConnectedDevicesList(heartbeatRes.connectedDevices);
          }

          // Check if remote revision is ahead of local
          if (heartbeatRes.revision > cloudRevisionRef.current) {
            const fresh = await fetchCloudData();
            if (fresh && fresh.data && isMounted) {
              setCloudRevision(fresh.revision);
              const d = fresh.data;

              if (d.settings) {
                setSettings(d.settings);
                saveLabSettings(d.settings);
              }
              if (d.questions) {
                setQuestions(d.questions);
                saveQuestions(d.questions);
              }
              if (d.rewards) {
                setRewards(d.rewards);
                saveRewards(d.rewards);
              }
              if (d.slices) {
                setSlices(d.slices);
                saveSpinSlices(d.slices);
              }
              if (d.claims) {
                setClaims(d.claims);
              }
              if (d.patients) {
                setPatients(d.patients);
              }

              setCloudNotice('⚡ تم استلام ومزامنة تحديثات جديدة من السحابة بين الأجهزة!');
              setTimeout(() => setCloudNotice(null), 4000);
            }
          }
        }
      } catch {
        if (isMounted) setIsCloudConnected(false);
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Update Player Profile Handler
  const handleUpdatePlayer = (partial: Partial<PlayerProfile>) => {
    setPlayer((prev) => {
      const updated = { ...prev, ...partial };
      savePlayerProfile(updated);
      return updated;
    });
  };

  // Award Bonus Points (e.g. from invite)
  const handleAwardBonusPoints = (bonus: number) => {
    handleUpdatePlayer({ points: player.points + bonus });
  };

  // Open Claim Modal
  const handleOpenClaimModal = (coupon: UserCoupon) => {
    setClaimTargetCoupon(coupon);
    setIsClaimModalOpen(true);
  };

  // Add Prize Claim Booking
  const handleAddClaimBooking = (claimData: Omit<PrizeClaimBooking, 'id' | 'createdAt' | 'status'>) => {
    addPrizeClaim(claimData);
    setClaims(getPrizeClaims());
    setLeaderboard(getLeaderboard());
    setPatients(getRegisteredPatients());
    broadcastToCloud();
  };

  // Award Coupon Handler
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

  // Admin Data Actions & Cloud Broadcast
  const handleSaveQuestions = (updated: Question[]) => {
    setQuestions(updated);
    saveQuestions(updated);
    broadcastToCloud();
  };

  const handleSaveRewards = (updated: RewardItem[]) => {
    setRewards(updated);
    saveRewards(updated);
    broadcastToCloud();
  };

  const handleSaveSlices = (updated: SpinSlice[]) => {
    setSlices(updated);
    saveSpinSlices(updated);
    broadcastToCloud();
  };

  const handleSaveSettings = (updated: LabSettings) => {
    setSettings(updated);
    saveLabSettings(updated);
    broadcastToCloud(updated);
  };

  const handleDeletePatient = (id: string) => {
    deletePatientRecord(id);
    setPatients(getRegisteredPatients());
    broadcastToCloud();
  };

  const handleResetPatients = () => {
    resetAllPatients();
    setPatients(getRegisteredPatients());
    broadcastToCloud();
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
    broadcastToCloud();
  };

  const handleDeleteClaim = (id: string) => {
    deletePrizeClaim(id);
    setClaims(getPrizeClaims());
    broadcastToCloud();
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
    broadcastToCloud();
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
      setClaims(getPrizeClaims());
      broadcastToCloud();
    }
    return ok;
  };

  // Manual Cloud Pull
  const handleTriggerCloudPull = async () => {
    const fresh = await fetchCloudData();
    if (fresh && fresh.data) {
      setCloudRevision(fresh.revision);
      const d = fresh.data;
      if (d.settings) {
        setSettings(d.settings);
        saveLabSettings(d.settings);
      }
      if (d.questions) {
        setQuestions(d.questions);
        saveQuestions(d.questions);
      }
      if (d.rewards) {
        setRewards(d.rewards);
        saveRewards(d.rewards);
      }
      if (d.slices) {
        setSlices(d.slices);
        saveSpinSlices(d.slices);
      }
      if (d.claims) setClaims(d.claims);
      if (d.patients) setPatients(d.patients);
    }
  };

  // Manual Cloud Push
  const handleTriggerCloudPush = async () => {
    await broadcastToCloud();
  };

  // GitHub Direct Sync
  const handleTriggerGitHubSync = async () => {
    const token = getGitHubToken();
    return await pushBackupToGitHub(
      token,
      settings.githubRepo || 'ramimokhtar228-maker/rt-lab-rewards'
    );
  };

  // GitHub Direct Restore / Pull
  const handleTriggerGitHubPull = async () => {
    const token = getGitHubToken();
    const res = await pullBackupFromGitHub(
      token,
      settings.githubRepo || 'ramimokhtar228-maker/rt-lab-rewards'
    );
    if (res.success) {
      setSettings(getLabSettings());
      setQuestions(getQuestions());
      setRewards(getRewards());
      setSlices(getSpinSlices());
      setClaims(getPrizeClaims());
      setPatients(getRegisteredPatients());
      setLeaderboard(getLeaderboard());
      setCloudNotice('✅ تم تحديث بيانات المعمل والفروع والجوائز من GitHub بنجاح!');
      setTimeout(() => setCloudNotice(null), 4000);
    }
    return res;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      {/* Live Cloud Sync Notification Banner */}
      {cloudNotice && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-slate-950 px-4 py-2 text-xs font-black flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top-2 sticky top-0 z-50">
          <CheckCircle2 className="w-4 h-4" />
          <span>{cloudNotice}</span>
        </div>
      )}

      {/* Top Navbar */}
      <TopNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        points={player.points}
        playerName={player.name}
        isCloudConnected={isCloudConnected}
        cloudRevision={cloudRevision}
        devicesOnlineCount={devicesOnlineCount}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenInvite={() => setIsInviteModalOpen(true)}
        onOpenBranches={() => setIsBranchesModalOpen(true)}
        onQuickCloudSync={handleTriggerCloudPull}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 md:py-8 pb-28 md:pb-8">
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
        onOpenBranches={() => setIsBranchesModalOpen(true)}
      />

      {/* Mobile Bottom Floating App Bar (Full Data 1-Tap Access on Mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 safe-bottom px-1.5 py-1.5 flex items-center justify-around shadow-2xl">
        {[
          { id: 'home', label: 'الرئيسية', icon: Home },
          { id: 'quiz', label: 'المسابقة', icon: Brain },
          { id: 'wheel', label: 'عجلة الحظ', icon: RotateCw },
          { id: 'scratch', label: 'الخربشة', icon: Sparkles },
          { id: 'store', label: 'المتجر', icon: Gift },
          { id: 'leaderboard', label: 'المتصدرون', icon: Trophy },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? 'bg-emerald-500/20 scale-110 shadow-sm' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[55px]">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-4 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* WhatsApp Synchronization Modal */}
      <WhatsAppSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        coupon={syncTargetCoupon}
        settings={settings}
        player={player}
        customMessage={customSyncMessage}
      />

      {/* Lab Branches & Management Modal */}
      <BranchesManagementModal
        isOpen={isBranchesModalOpen}
        onClose={() => setIsBranchesModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onTriggerGitHubSync={handleTriggerGitHubSync}
        onSelectBranchForBooking={(branch: LabBranch) => {
          setIsBranchesModalOpen(false);
          handleOpenGeneralSync(`السلام عليكم، أود حجز موعد في ${branch.name}.`);
        }}
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

      {/* Admin Panel Modal (With Branches, Management Team, WhatsApp Templates, Multi-Device Cloud Sync, GitHub Sync) */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        questions={questions}
        rewards={rewards}
        slices={slices}
        settings={settings}
        patients={patients}
        claims={claims}
        cloudRevision={cloudRevision}
        devicesOnlineCount={devicesOnlineCount}
        connectedDevicesList={connectedDevicesList}
        isCloudConnected={isCloudConnected}
        onSaveQuestions={handleSaveQuestions}
        onSaveRewards={handleSaveRewards}
        onSaveSlices={handleSaveSlices}
        onSaveSettings={handleSaveSettings}
        onSavePatients={(updated) => {
          setPatients(updated);
          saveRegisteredPatients(updated);
        }}
        onSaveClaims={(updated) => {
          setClaims(updated);
          savePrizeClaims(updated);
        }}
        onDeletePatient={handleDeletePatient}
        onResetPatients={handleResetPatients}
        onResetAppForNewPatients={handleResetAppForNewPatients}
        onUpdateClaimStatus={handleUpdateClaimStatus}
        onDeleteClaim={handleDeleteClaim}
        onResetDefaults={handleResetDefaults}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onTriggerCloudPush={handleTriggerCloudPush}
        onTriggerCloudPull={handleTriggerCloudPull}
        onTriggerGitHubSync={handleTriggerGitHubSync}
        onTriggerGitHubPull={handleTriggerGitHubPull}
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
