import React from 'react';
import { Gift, Lock, Phone } from 'lucide-react';
import { LabSettings } from '../types';
import { labLogo } from '../assets/images';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  settings: LabSettings;
  onOpenAdmin: () => void;
  onSelectGame: (game: 'wheel' | 'scratch' | 'quiz' | 'box') => void;
  activeGame: 'wheel' | 'scratch' | 'quiz' | 'box';
  onOpenBranches: () => void;
  onOpenPolicy: () => void;
  onOpenPatientShare?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenAdmin,
  onSelectGame,
  activeGame,
  onOpenBranches,
  onOpenPolicy,
  onOpenPatientShare,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-15 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
        {/* Zone 1: Lab Emblem + Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          <div className="h-9 w-9 sm:h-11 sm:w-11 overflow-hidden rounded-xl border border-rose-200 shadow-xs bg-white shrink-0">
            <img
              src={labLogo}
              alt="معامل رامي مختار RT Labs"
              className="h-full w-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-base font-black text-[#0F2B5C] tracking-tight truncate">
              معامل رامي مختار <span className="text-[#8B1E2D]">RT Labs</span>
            </span>
            <span className="text-[9px] sm:text-[11px] text-[#8B1E2D] font-bold truncate">
              {settings.sloganAr || 'التشخيص الصحيح يبدأ معنا'}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation links (Desktop only) */}
        <nav className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-600 shrink-0">
          <button
            onClick={() => onSelectGame('wheel')}
            className={`transition whitespace-nowrap ${
              activeGame === 'wheel'
                ? 'text-[#8B1E2D] font-bold border-b-2 border-[#8B1E2D] pb-0.5'
                : 'hover:text-slate-900'
            }`}
          >
            عجلة الحظ
          </button>
          <button
            onClick={() => onSelectGame('scratch')}
            className={`transition whitespace-nowrap ${
              activeGame === 'scratch'
                ? 'text-[#8B1E2D] font-bold border-b-2 border-[#8B1E2D] pb-0.5'
                : 'hover:text-slate-900'
            }`}
          >
            كارت الخدش
          </button>
          <button
            onClick={() => onSelectGame('quiz')}
            className={`transition whitespace-nowrap ${
              activeGame === 'quiz'
                ? 'text-[#8B1E2D] font-bold border-b-2 border-[#8B1E2D] pb-0.5'
                : 'hover:text-slate-900'
            }`}
          >
            تحدي المعلومات
          </button>
          <button
            onClick={() => onSelectGame('box')}
            className={`transition whitespace-nowrap ${
              activeGame === 'box'
                ? 'text-[#8B1E2D] font-bold border-b-2 border-[#8B1E2D] pb-0.5'
                : 'hover:text-slate-900'
            }`}
          >
            صناديق المفاجآت
          </button>
          <button
            onClick={onOpenPolicy}
            className="hover:text-slate-900 transition whitespace-nowrap text-amber-800 font-bold"
          >
            الشروط
          </button>
          <button
            onClick={onOpenBranches}
            className="hover:text-slate-900 transition whitespace-nowrap text-slate-600"
          >
            الفروع ({settings.branches.length})
          </button>
        </nav>

        {/* Zone 3: Mobile & Desktop Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onOpenPatientShare && (
            <button
              onClick={onOpenPatientShare}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition shadow-xs whitespace-nowrap"
              title="إرسال رابط مسابقة مفعّل للمريض"
            >
              <Gift className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">إرسال الرابط لمريض</span>
              <span className="sm:hidden">إرسال 🎁</span>
            </button>
          )}

          <div className="hidden sm:block">
            <PWAInstallButton />
          </div>

          <a
            href={`tel:${settings.hotline}`}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0F2B5C] bg-blue-50 hover:bg-blue-100 rounded-xl transition whitespace-nowrap"
          >
            <Phone className="h-3.5 w-3.5" />
            <span className="font-mono">{settings.hotline}</span>
          </a>

          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold text-white bg-[#8B1E2D] hover:bg-[#731925] rounded-xl shadow-xs transition whitespace-nowrap"
          >
            <Lock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>الإدارة</span>
          </button>
        </div>
      </div>
    </header>
  );
};
