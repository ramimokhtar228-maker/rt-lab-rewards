import React from 'react';
import {
  Volume2,
  VolumeX,
  ShieldCheck,
  Award,
  Sparkles,
  Building,
  Cloud,
  Users,
  RefreshCw,
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface TopNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  points: number;
  playerName: string;
  isCloudConnected: boolean;
  cloudRevision: number;
  devicesOnlineCount: number;
  onOpenAdmin: () => void;
  onOpenProfile: () => void;
  onOpenInvite: () => void;
  onOpenBranches: () => void;
  onQuickCloudSync: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  setActiveTab,
  points,
  playerName,
  isCloudConnected,
  cloudRevision,
  devicesOnlineCount,
  onOpenAdmin,
  onOpenProfile,
  onOpenInvite,
  onOpenBranches,
  onQuickCloudSync,
}) => {
  const [muted, setMuted] = React.useState(soundManager.getMuted());
  const [isSyncSpinning, setIsSyncSpinning] = React.useState(false);

  const handleToggleSound = () => {
    const isMuted = soundManager.toggleMute();
    setMuted(isMuted);
  };

  const handleSyncClick = () => {
    setIsSyncSpinning(true);
    onQuickCloudSync();
    setTimeout(() => setIsSyncSpinning(false), 1200);
  };

  const navItems = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'quiz', label: 'مسابقة التحدي' },
    { id: 'wheel', label: 'عجلة الحظ' },
    { id: 'scratch', label: 'كارت الخربشة' },
    { id: 'store', label: 'متجر المكافآت' },
    { id: 'leaderboard', label: 'المتصدرون' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Wordmark & Cloud Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-right whitespace-nowrap shrink-0 group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                معامل RT
              </span>
              <span className="text-[10px] text-slate-400 font-medium -mt-1">
                التحاليل الطبية & السحابة
              </span>
            </div>
          </button>

          {/* Cloud Sync Status Badge */}
          <button
            onClick={handleSyncClick}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-300 transition-all shadow-inner group"
            title="انقر لتحديث المزامنة السحابية فوراً بين الأجهزة"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            ></span>
            <span className="text-emerald-400">السحابة متصلة</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 font-mono text-[10px]">
              {devicesOnlineCount} {devicesOnlineCount > 1 ? 'أجهزة' : 'جهاز'}
            </span>
            <RefreshCw
              className={`w-3 h-3 text-slate-400 group-hover:text-emerald-400 ${
                isSyncSpinning ? 'animate-spin text-emerald-400' : ''
              }`}
            />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-300">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                  isActive
                    ? 'text-emerald-400 font-bold border-b-2 border-emerald-400'
                    : 'hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Actions & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Branches & Locations Shortcut */}
          <button
            onClick={onOpenBranches}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700/60"
            title="عرض فروع وعناوين المعمل وفريق الإدارة والواتساب"
          >
            <Building className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">الفروع والإدارة</span>
            <span className="sm:hidden">الفروع</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            aria-label={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title={muted ? 'تشغيل المؤثرات الصوتية' : 'كتم الصوت'}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {/* Points & Profile Trigger */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-colors text-xs font-bold"
            title="ملف المريض والنقاط"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="tabular-nums font-mono text-xs sm:text-sm">{points}</span>
            <span className="hidden md:inline text-[11px] text-amber-200">نقطة</span>
          </button>

          {/* Admin Control Access */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm shadow-emerald-950 whitespace-nowrap"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>لوحة الإدارة</span>
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Navigation Strip */}
      <div className="lg:hidden flex items-center gap-2 px-3 py-2 overflow-x-auto no-scrollbar border-t border-slate-800/80 bg-slate-900/60">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
