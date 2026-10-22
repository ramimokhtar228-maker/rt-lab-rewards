import React from 'react';
import { Volume2, VolumeX, ShieldCheck, Award, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { PWAInstallButton } from './PWAInstallButton';

interface TopNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  points: number;
  onOpenAdmin: () => void;
  onOpenProfile: () => void;
  onOpenInvite: () => void;
  playerName: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  setActiveTab,
  points,
  onOpenAdmin,
  onOpenProfile,
  onOpenInvite,
  playerName,
}) => {
  const [muted, setMuted] = React.useState(soundManager.getMuted());

  const handleToggleSound = () => {
    const isMuted = soundManager.toggleMute();
    setMuted(isMuted);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark */}
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
            <span className="text-[11px] text-slate-400 font-medium -mt-1">
              مكافآت وتحدي المرضى
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (single-line, clean) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
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

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            aria-label={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title={muted ? 'تشغيل المؤثرات الصوتية' : 'كتم الصوت'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Invite Friend Button */}
          <button
            onClick={onOpenInvite}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 font-semibold text-xs transition-colors"
            title="مشاركة الرابط ودعوة صديق (+50 نقطة)"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>دعوة صديق (+50)</span>
          </button>

          {/* Points & Profile Trigger */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-colors text-xs font-bold"
            title="ملف المريض والنقاط"
          >
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span className="tabular-nums font-mono text-xs sm:text-sm">{points}</span>
            <span className="hidden sm:inline text-[11px] text-amber-200">نقطة</span>
            <span className="hidden lg:inline text-slate-400">·</span>
            <span className="hidden lg:inline text-slate-300 max-w-[85px] truncate">{playerName}</span>
          </button>

          {/* Install Mobile PWA App Button */}
          <PWAInstallButton variant="navbar" />

          {/* Admin Control Access */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm whitespace-nowrap"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">لوحة الإدارة</span>
            <span className="sm:hidden">الإدارة</span>
          </button>
        </div>
      </div>
    </header>
  );
};
