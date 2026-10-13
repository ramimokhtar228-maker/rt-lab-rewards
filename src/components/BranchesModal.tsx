import React from 'react';
import { Clock, Home, MapPin, MessageCircle, Phone, X } from 'lucide-react';
import { LabSettings } from '../types';

interface BranchesModalProps {
  settings: LabSettings;
  onClose: () => void;
}

export const BranchesModal: React.FC<BranchesModalProps> = ({ settings, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-y-auto backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden my-6 border border-slate-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#8B1E2D] flex items-center justify-center font-bold text-white shadow">
              RT
            </div>
            <div>
              <h3 className="font-bold text-base">فروع معامل رامي مختار وخدمة السحب المنزلي</h3>
              <p className="text-xs text-rose-300 font-medium">{settings.sloganAr}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-300 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {settings.branches.map((b) => (
            <div
              key={b.id}
              className={`p-4.5 rounded-2xl border transition ${
                b.isHomeVisit
                  ? 'border-emerald-300 bg-emerald-50/70'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      b.isHomeVisit ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-[#8B1E2D]'
                    }`}
                  >
                    {b.isHomeVisit ? <Home className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">{b.name}</h4>
                    <p className="text-xs text-slate-600 mt-1">{b.address}</p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1 ${
                    b.isHomeVisit
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {b.isHomeVisit ? <MessageCircle className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
                  <span>{b.isHomeVisit ? 'طلب سحب منزلي' : 'اتصال'}</span>
                </a>
              </div>
            </div>
          ))}

          {/* Hotline notice */}
          <div className="mt-4 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center text-xs text-slate-700">
            للحجز والاستفسار عبر الخط الساخن الموحد: <strong className="text-[#0F2B5C] font-mono text-sm">{settings.hotline}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
