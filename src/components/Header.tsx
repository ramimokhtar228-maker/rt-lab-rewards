import React from 'react';
import {
  Bell,
  Building2,
  Clock,
  HeartPulse,
  Key,
  MapPin,
  MessageCircle,
  Phone,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';
import { LabSettings } from '../types';
import { labLogo } from '../assets/images';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  settings: LabSettings;
  pendingClaimsCount: number;
  onOpenAdmin: () => void;
  onOpenBranches: () => void;
  onOpenPolicy: () => void;
  onOpenReferral?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  pendingClaimsCount,
  onOpenAdmin,
  onOpenBranches,
  onOpenPolicy,
  onOpenReferral,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro info banner */}
      <div className="bg-gradient-to-r from-[#8B1E2D] via-[#a32839] to-[#0F2B5C] text-white px-3 sm:px-6 py-1.5 text-[11px] sm:text-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-bold">
              <Clock className="h-3 w-3 text-amber-300" />
              <span>فترة صلاحية الكوبونات: 24 ساعة فقط من وقت المكسب</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-bold">
            <a
              href={`tel:${settings.hotline}`}
              className="flex items-center gap-1 hover:text-amber-200 transition"
            >
              <Phone className="h-3 w-3 text-amber-300" />
              <span>الخط الساخن: {settings.hotline}</span>
            </a>
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 text-emerald-300 hover:text-emerald-200 transition"
            >
              <MessageCircle className="h-3 w-3" />
              <span>واتساب المعمل</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl overflow-hidden border border-rose-200 bg-white p-1 shadow-sm shrink-0">
            <img
              src={labLogo}
              alt="معامل د. رامي مختار RT Labs"
              className="h-full w-full object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                {settings.labNameAr}
              </h1>
              <span className="hidden md:inline-block text-[10px] bg-rose-50 text-[#8B1E2D] px-2 py-0.5 rounded-full font-bold border border-rose-200">
                إشراف قصر العيني
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate max-w-xs sm:max-w-md">
              {settings.sloganAr}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Branches button */}
          <button
            onClick={onOpenBranches}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <MapPin className="h-3.5 w-3.5 text-[#8B1E2D]" />
            <span>الفروع والعناوين (4)</span>
          </button>

          {/* Referral Button */}
          {onOpenReferral && (
            <button
              onClick={onOpenReferral}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-xs font-black text-amber-900 transition shadow-2xs"
              title="شارك الرابط مع أصدقائك واربح مكافأة فورية"
            >
              <Users className="h-3.5 w-3.5 text-amber-600" />
              <span className="hidden md:inline">دعوة صديق واربح</span>
              <span className="md:hidden">مكافأة 🎁</span>
            </button>
          )}

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Policy / Terms button */}
          <button
            onClick={onOpenPolicy}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <Shield className="h-3.5 w-3.5 text-[#0F2B5C]" />
            <span>قواعد الـ 24 ساعة</span>
          </button>

          {/* Reception & Admin Dashboard Button with Alert Badge */}
          <button
            onClick={onOpenAdmin}
            className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-black shadow-sm transition ${
              pendingClaimsCount > 0
                ? 'bg-[#8B1E2D] hover:bg-[#731925] text-white shadow-rose-900/30'
                : 'border border-slate-300 bg-slate-900 text-white hover:bg-slate-800'
            }`}
            title="لوحة الإدارة والاستقبال ومتابعة الحجوزات"
          >
            <Key className="h-3.5 w-3.5 text-amber-300" />
            <span className="hidden xs:inline">لوحة المعمل</span>
            {pendingClaimsCount > 0 && (
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full animate-pulse mr-0.5">
                {pendingClaimsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
