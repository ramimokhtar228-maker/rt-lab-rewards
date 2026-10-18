import React, { useState } from 'react';
import {
  MessageCircle,
  Phone,
  Building,
  MapPin,
  Clock,
  X,
  ChevronUp,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Home,
  UserCheck,
} from 'lucide-react';
import { LabSettings, LabBranch } from '../types';
import { getWhatsAppUrl, getTelUrl, formatPhoneDisplay } from '../utils/phone';

interface FloatingLabContactWidgetProps {
  settings: LabSettings;
  onOpenSyncModal: () => void;
  onOpenBranchesModal: () => void;
}

export const FloatingLabContactWidget: React.FC<FloatingLabContactWidgetProps> = ({
  settings,
  onOpenSyncModal,
  onOpenBranchesModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const branches = settings.branches || [];
  const mainBranch = branches.find((b) => b.isMainBranch) || branches[0];

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-50 text-right font-sans">
      {/* Expanded Quick Contact Panel */}
      {isOpen && (
        <div className="mb-3 w-[92vw] max-w-sm sm:max-w-md bg-slate-900/95 backdrop-blur-xl border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 rounded-xl">
                <MessageCircle className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h4 className="text-sm font-black">أرقام وواتساب معامل RT</h4>
                <p className="text-[11px] text-emerald-100">خدمة عملاء وتنسيق سحب منزلي 24/7</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Hotline & 24/7 Notice */}
          <div className="p-3 bg-emerald-950/40 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300">الخط الساخن الموحد:</span>
            </div>
            <a
              href={getTelUrl(settings.hotlineNumber || '01021487889')}
              className="font-mono text-emerald-400 font-bold hover:underline"
            >
              {formatPhoneDisplay(settings.hotlineNumber || '01021487889')}
            </a>
          </div>

          {/* Branches List with Direct WhatsApp & Call */}
          <div className="max-h-72 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-800/60">
            {branches.map((b) => (
              <div key={b.id} className="pt-2 first:pt-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white">{b.name}</span>
                    {b.isMainBranch && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                        الرئيسي
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                    {formatPhoneDisplay(b.phone)}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="truncate">{b.address}</span>
                </p>

                {/* Direct Action Buttons for Branch */}
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={getWhatsAppUrl(
                      b.whatsappNumber,
                      `السلام عليكم، أود الاستفسار والحجز في ${b.name} لمعامل RT`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>محادثة واتساب</span>
                  </a>
                  <a
                    href={getTelUrl(b.phone)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] transition-colors"
                  >
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>اتصال بالفرع</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Doctor / Consultation Strip */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-2">
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-300 block">د. رامي مختار</span>
              <span className="text-[10px] text-slate-500">المدير العام والمسؤول الفني</span>
            </div>
            <a
              href={getWhatsAppUrl('201021487889', 'السلام عليكم دكتور رامي، أود استشارة بخصوص التحاليل الطبية في معمل RT')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600/30 hover:bg-teal-600/50 border border-teal-500/40 text-teal-300 font-bold text-xs transition-colors"
            >
              <MessageCircle className="w-3 h-3 text-teal-300" />
              <span>واتساب الإدارة</span>
            </a>
          </div>

          {/* Modal Launchers */}
          <div className="p-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSyncModal();
              }}
              className="flex-1 py-1.5 text-center text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              قوالب رسائل الواتساب 💬
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenBranchesModal();
              }}
              className="flex-1 py-1.5 text-center text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
            >
              تفاصيل الفروع والعناوين 🏥
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-2xl shadow-emerald-950 border border-emerald-400/40 transition-all hover:scale-105 active:scale-95 focus:outline-none"
        title="تواصل مباشر وواتساب مع معامل RT"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 text-white animate-bounce" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping"></span>
        </div>
        <div className="text-right leading-tight">
          <span className="block text-xs font-black">واتساب المعمل</span>
          <span className="block text-[10px] text-emerald-100 font-medium">تواصل مباشر وحجز 24/7</span>
        </div>
        <ChevronUp className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
};
