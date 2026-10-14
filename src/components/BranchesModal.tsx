import React from 'react';
import { Building2, Clock, ExternalLink, Home, MapPin, Phone, X } from 'lucide-react';
import { Branch, LabSettings } from '../types';

interface BranchesModalProps {
  settings: LabSettings;
  onClose: () => void;
}

export const BranchesModal: React.FC<BranchesModalProps> = ({ settings, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 overflow-y-auto backdrop-blur-sm animate-fade-in text-right">
      <div className="relative w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden my-4 border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8B1E2D] to-[#0F2B5C] p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <MapPin className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">فروع معامل د. رامي مختار للتحاليل</h3>
              <p className="text-xs text-rose-100">
                تسري جميع الكوبونات والخصومات في كافة الفروع والزيارات المنزلية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
          {settings.branches.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border transition ${
                b.isHomeVisit
                  ? 'border-purple-200 bg-purple-50/50'
                  : 'border-slate-200 bg-white hover:border-[#8B1E2D]/40 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    b.isHomeVisit
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-rose-50 text-[#8B1E2D]'
                  }`}
                >
                  {b.isHomeVisit ? <Home className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{b.name}</h4>
                    {b.isHomeVisit && (
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                        خدمة منزلية
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{b.address}</p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                      <span>{b.hours}</span>
                    </div>

                    <a
                      href={`tel:${b.phone}`}
                      className="flex items-center gap-1 text-[#8B1E2D] font-mono font-bold hover:underline dir-ltr"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>{b.phone}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 p-3 sm:p-4 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <span>الخط الساخن الموحد: <strong className="font-mono text-slate-900">{settings.hotline}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
