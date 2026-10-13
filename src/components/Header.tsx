import React from 'react';
import { Lock, Phone, ShieldCheck } from 'lucide-react';
import { LabSettings } from '../types';

interface HeaderProps {
  settings: LabSettings;
  onOpenAdmin: () => void;
  onSelectGame: (game: 'wheel' | 'scratch' | 'quiz') => void;
  activeGame: 'wheel' | 'scratch' | 'quiz';
  onOpenBranches: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenAdmin,
  onSelectGame,
  activeGame,
  onOpenBranches,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark + RT Lab Emblem */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-10 w-10 overflow-hidden rounded-xl border border-rose-200 shadow-sm bg-white shrink-0">
            <img
              src="/src/assets/images/rt_lab_logo_1791920408886.jpg"
              alt="RT Labs Logo"
              className="h-full w-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-base sm:text-lg font-black text-[#0F2B5C] tracking-tight">
              معامل رامي مختار <span className="text-[#8B1E2D] font-black">RT Labs</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
              دقة التشخيص ورعاية فائقة
            </span>
          </div>
        </div>

        {/* Zone 2: 4-5 single-line clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => onSelectGame('wheel')}
            className={`transition whitespace-nowrap ${
              activeGame === 'wheel' ? 'text-[#8B1E2D] font-bold border-b-2 border-[#8B1E2D] pb-1' : 'hover:text-slate-900'
            }`}
          >
            عجلة الحظ
          </button>
          <button
            onClick={() => onSelectGame('scratch')}
            className={`transition whitespace-nowrap ${
              activeGame === 'scratch' ? 'text-[#8B1E2D] font-bold border-b-2 border-[#8B1E2D] pb-1' : 'hover:text-slate-900'
            }`}
          >
            كارت الخدش
          </button>
          <button
            onClick={() => onSelectGame('quiz')}
            className={`transition whitespace-nowrap ${
              activeGame === 'quiz' ? 'text-[#8B1E2D] font-bold border-b-2 border-[#8B1E2D] pb-1' : 'hover:text-slate-900'
            }`}
          >
            تحدي المعلومات
          </button>
          <button
            onClick={onOpenBranches}
            className="hover:text-slate-900 transition whitespace-nowrap text-slate-600"
          >
            الفروع والسحب المنزلي
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={`tel:${settings.hotline}`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0F2B5C] bg-blue-50/80 hover:bg-blue-100/80 rounded-lg transition whitespace-nowrap"
          >
            <Phone className="h-3.5 w-3.5" />
            <span className="font-mono">{settings.hotline}</span>
          </a>

          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#8B1E2D] hover:bg-[#731925] rounded-lg shadow-sm transition whitespace-nowrap"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>لوحة الإدارة</span>
          </button>
        </div>
      </div>
    </header>
  );
};
