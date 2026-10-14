import React from 'react';
import { Gift, Home, MapPin, MessageCircle, Phone, Sparkles } from 'lucide-react';
import { LabSettings } from '../types';

interface MobileBottomNavProps {
  settings: LabSettings;
  onScrollToGames: () => void;
  onOpenBranches: () => void;
  onOpenPatientShare: () => void;
  onOpenPolicy: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  settings,
  onScrollToGames,
  onOpenBranches,
  onOpenPatientShare,
}) => {
  const cleanPhone = (settings.whatsappNumber || '201100874444').replace(/\D/g, '');

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1.5 safe-bottom">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {/* Game Arena Action */}
        <button
          type="button"
          onClick={onScrollToGames}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-700 hover:text-[#8B1E2D] active:scale-95 transition"
        >
          <div className="h-8 w-8 rounded-lg bg-rose-50 text-[#8B1E2D] flex items-center justify-center mb-0.5">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold">الألعاب</span>
        </button>

        {/* Share Link to Patient */}
        <button
          type="button"
          onClick={onOpenPatientShare}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-emerald-800 hover:text-emerald-900 active:scale-95 transition"
        >
          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-0.5">
            <Gift className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold">رابط مريض</span>
        </button>

        {/* Branches */}
        <button
          type="button"
          onClick={onOpenBranches}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-700 hover:text-[#0F2B5C] active:scale-95 transition"
        >
          <div className="h-8 w-8 rounded-lg bg-blue-50 text-[#0F2B5C] flex items-center justify-center mb-0.5">
            <MapPin className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold">الفروع</span>
        </button>

        {/* Lab WhatsApp Direct */}
        <a
          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
            `مرحباً معامل د. رامي مختار (${settings.sloganAr})، أود الاستفسار عن كروت الخصم وباقات التحاليل.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-700 hover:text-emerald-700 active:scale-95 transition"
        >
          <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-0.5">
            <MessageCircle className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold">واتساب</span>
        </a>

        {/* Hotline Call */}
        <a
          href={`tel:${settings.hotline}`}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-700 hover:text-blue-900 active:scale-95 transition"
        >
          <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center mb-0.5">
            <Phone className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold">الخط الساخن</span>
        </a>
      </div>
    </div>
  );
};
