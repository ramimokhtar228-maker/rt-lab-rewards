import React from 'react';
import { Building2, Clock, ExternalLink, Home, MapPin, MessageCircle, Phone, X } from 'lucide-react';
import { Branch, LabSettings } from '../types';
import { labLogo, labReception, medicalTeam } from '../assets/images';

interface BranchesModalProps {
  settings: LabSettings;
  onClose: () => void;
}

export const BranchesModal: React.FC<BranchesModalProps> = ({ settings, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 overflow-y-auto backdrop-blur-sm animate-fade-in text-right">
      <div className="relative w-full max-w-3xl rounded-2xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden my-4 border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Header with reception background */}
        <div className="relative bg-gradient-to-r from-[#8B1E2D] to-[#0F2B5C] p-5 sm:p-6 text-white shrink-0 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img src={labReception} alt="استقبال" className="w-full h-full object-cover" />
          </div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white p-1 shadow-md shrink-0">
                <img src={labLogo} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black">
                  فروع وعناوين معامل د. رامي مختار للتحاليل
                </h3>
                <p className="text-xs text-rose-100">
                  كافة الكوبونات والخصومات معتمدة وسارية بجميع الفروع والزيارات المنزلية (24/7)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {settings.branches.map((b) => (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                  b.isHomeVisit
                    ? 'border-purple-200 bg-purple-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-[#8B1E2D]/40 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                          b.isHomeVisit ? 'bg-purple-100 text-purple-700' : 'bg-rose-50 text-[#8B1E2D]'
                        }`}
                      >
                        {b.isHomeVisit ? <Home className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{b.name}</h4>
                    </div>

                    {b.isHomeVisit && (
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                        خدمة منزلية
                      </span>
                    )}
                  </div>

                  {/* Address */}
                  <div className="text-xs text-slate-600 mb-2 leading-relaxed flex items-start gap-1.5">
                    <MapPin className="h-4 w-4 text-[#8B1E2D] shrink-0 mt-0.5" />
                    <span>{b.address}</span>
                  </div>

                  {/* Hours */}
                  <div className="text-[11px] text-slate-500 mb-3 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span>{b.hours}</span>
                  </div>
                </div>

                {/* Contact Actions */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${b.phone}`}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-mono font-bold text-xs flex items-center justify-center gap-1.5 dir-ltr transition"
                  >
                    <Phone className="h-3.5 w-3.5 text-[#8B1E2D]" />
                    <span>{b.phone}</span>
                  </a>

                  <a
                    href={`https://wa.me/${b.phone.replace(/\D/g, '').startsWith('0') ? '20' + b.phone.replace(/\D/g, '').substring(1) : b.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً ${settings.labNameAr}، أود الاستفسار عن مواعيد وحجز فرع (${b.name}) بخصوص كوبون المسابقة.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>واتساب</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Home visit highlight card */}
          <div className="bg-gradient-to-r from-rose-50 via-white to-purple-50 p-4 rounded-2xl border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-[#8B1E2D] text-white flex items-center justify-center shrink-0">
                <Home className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                  خدمة سحب العينات والزيارات المنزلية المريحة (24/7)
                </h5>
                <p className="text-xs text-slate-600 mt-0.5">
                  أخصائيو سحب متمرسون يصلون إلى باب منزلك في كافة مناطق القاهرة الكبرى وشبرا الخيمة والجيزة.
                </p>
              </div>
            </div>

            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent('مرحباً، أود حجز موعد سحب عينة منزلي وتفعيل كود الخصم الخاص بي.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition flex items-center gap-1.5 shrink-0"
            >
              <MessageCircle className="h-4 w-4" />
              <span>طلب زيارة منزلية الآن</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 p-3 sm:p-4 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <span>الخط الساخن الموحد: <strong className="font-mono text-slate-900">{settings.hotline}</strong></span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
