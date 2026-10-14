import React from 'react';
import { Building2, Compass, Key, MessageCircle, Phone, Shield } from 'lucide-react';
import { LabSettings } from '../types';

interface MobileBottomNavProps {
  settings: LabSettings;
  pendingCount: number;
  onOpenAdmin: () => void;
  onOpenBranches: () => void;
  onOpenPolicy: () => void;
  onScrollToGames: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  settings,
  pendingCount,
  onOpenAdmin,
  onOpenBranches,
  onOpenPolicy,
  onScrollToGames,
}) => {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around text-[10px] font-bold text-slate-600 shadow-lg">
      <button
        onClick={onScrollToGames}
        className="flex flex-col items-center gap-1 hover:text-[#8B1E2D] transition"
      >
        <Compass className="h-4 w-4 text-[#8B1E2D]" />
        <span>الألعاب</span>
      </button>

      <button
        onClick={onOpenBranches}
        className="flex flex-col items-center gap-1 hover:text-[#8B1E2D] transition"
      >
        <Building2 className="h-4 w-4 text-slate-700" />
        <span>الفروع</span>
      </button>

      <a
        href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-1 text-emerald-600"
      >
        <MessageCircle className="h-4 w-4" />
        <span>واتساب</span>
      </a>

      <button
        onClick={onOpenPolicy}
        className="flex flex-col items-center gap-1 hover:text-[#8B1E2D] transition"
      >
        <Shield className="h-4 w-4 text-slate-700" />
        <span>الشروط</span>
      </button>

      <button
        onClick={onOpenAdmin}
        className="relative flex flex-col items-center gap-1 text-[#8B1E2D]"
      >
        <Key className="h-4 w-4 text-amber-500" />
        <span>الإدارة</span>
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full text-[9px] h-3.5 w-3.5 flex items-center justify-center font-black animate-pulse">
            {pendingCount}
          </span>
        )}
      </button>
    </div>
  );
};
