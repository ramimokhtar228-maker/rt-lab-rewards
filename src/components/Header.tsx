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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-8">
        {/* Zone 1: Single text element wordmark + RT Lab Emblem */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="h-10 w-10 sm:h-11 sm:w-11 overflow-hidden rounded-xl border border-rose-200 shadow-sm bg-white shrink-0">
            <img
              src={labLogo}
              alt="معامل رامي مختار RT Labs"
              className="h-full w-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-sm sm:text-base font-black text-[#0F2B5C] tracking-tight">
              معامل رامي مختار <span className="text-[#8B1E2D] font-black">RT Labs</span>
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#8B1E2D] font-bold">
              {settings.sloganAr || 'التشخيص الصحيح يبدأ معنا'}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-600">
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

        {/* Zone 3: Actions + PWA Install + Patient Share + Admin */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onOpenPatientShare && (
            <button
              onClick={onOpenPatientShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition shadow-xs whitespace-nowrap"
              title="إرسال رابط مسابقة جديد ومفعّل للمريض عبر الواتساب"
            >
              <Gift className="h-3.5 w-3.5 text-emerald-600" />
              <span>إرسال الرابط لمريض 🎁</span>
            </button>
          )}

          <PWAInstallButton />

          <a
            href={`tel:${settings.hotline}`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0F2B5C] bg-blue-50 hover:bg-blue-100 rounded-xl transition whitespace-nowrap"
          >
            <Phone className="h-3.5 w-3.5" />
            <span className="font-mono">{settings.hotline}</span>
          </a>

          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#8B1E2D] hover:bg-[#731925] rounded-xl shadow-xs transition whitespace-nowrap"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>الإدارة</span>
          </button>
        </div>
      </div>
    </header>
  );
};
