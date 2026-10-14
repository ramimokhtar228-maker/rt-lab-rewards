import React from 'react';
import { Clock, Home, MapPin, MessageCircle, Phone, X } from 'lucide-react';
import { LabSettings } from '../types';
import { labLogo, labReception } from '../assets/images';

interface BranchesModalProps {
  settings: LabSettings;
  onClose: () => void;
}

export const BranchesModal: React.FC<BranchesModalProps> = ({ settings, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 overflow-y-auto backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden my-4 border border-slate-200 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-slate-100 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl overflow-hidden border border-rose-300/40 bg-white p-0.5 shadow shrink-0">
              <img
                src={labLogo}
                alt="لوجو معامل رامي مختار"
                className="h-full w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-xs sm:text-base truncate">
                فروع معامل رامي مختار وخدمة السحب المنزلي
              </h3>
              <p className="text-[10px] sm:text-xs text-rose-300 font-medium truncate">
                {settings.sloganAr}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition shrink-0"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Visual Lab Reception Header Banner */}
        <div className="relative h-24 sm:h-36 w-full overflow-hidden bg-slate-900 shrink-0">
          <img
            src={labReception}
            alt="صالة استقبال معامل رامي مختار"
            className="h-full w-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent flex items-end p-3 sm:p-4">
            <div className="text-white text-[11px] sm:text-sm">
              <span className="font-bold">مرحباً بكم في جميع فروعنا المجهزة</span> · راحة المريض
              وسلامته غايتنا الأولى
            </div>
          </div>
        </div>

        <div className="p-3.5 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
          {settings.branches.map((b) => (
            <div
              key={b.id}
              className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition ${
                b.isHomeVisit
                  ? 'border-emerald-300 bg-emerald-50/70'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      b.isHomeVisit
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-[#8B1E2D]'
                    }`}
                  >
                    {b.isHomeVisit ? (
                      <Home className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                    ) : (
                      <MapPin className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-base">{b.name}</h4>
                    <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {b.address}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {b.hours}
                      </span>
                    </div>
                  </div>
                </div>

                <a
                  href={
                    b.isHomeVisit
                      ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `مرحباً معامل رامي مختار (${settings.sloganAr})، أود حجز موعد لسحب عينات منزلي.`
                        )}`
                      : `tel:${b.phone}`
                  }
                  target={b.isHomeVisit ? '_blank' : undefined}
                  rel={b.isHomeVisit ? 'noopener noreferrer' : undefined}
                  className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    b.isHomeVisit
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {b.isHomeVisit ? (
                    <MessageCircle className="h-3.5 w-3.5" />
                  ) : (
                    <Phone className="h-3.5 w-3.5" />
                  )}
                  <span>{b.isHomeVisit ? 'طلب سحب منزلي' : `اتصال: ${b.phone}`}</span>
                </a>
              </div>
            </div>
          ))}

          {/* Hotline notice */}
          <div className="mt-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-blue-50 border border-blue-200 text-center text-xs text-slate-700">
            للحجز والاستفسار عبر الخط الساخن الموحد:{' '}
            <strong className="text-[#0F2B5C] font-mono text-sm">{settings.hotline}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
