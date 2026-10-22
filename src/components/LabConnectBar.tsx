import React from 'react';
import { MessageCircle, PhoneCall, Clock, MapPin, Sparkles, Home, Building } from 'lucide-react';
import { LabSettings } from '../types';
import { formatWhatsAppNumber } from '../utils/storage';

interface LabConnectBarProps {
  settings: LabSettings;
  onOpenSync: () => void;
}

export const LabConnectBar: React.FC<LabConnectBarProps> = ({ settings, onOpenSync }) => {
  const cleanPhone = formatWhatsAppNumber(settings.whatsappNumber);
  const mainBranch = settings.branches && settings.branches.length > 0 ? settings.branches[0] : null;

  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Main CTA Callout Box */}
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-right">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Home className="w-4 h-4" />
              <span>خدمة السحب المنزلي المريحة 24/7 (القاهرة الكبرى والجيزة والقليوبية)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              جاهز لإجراء تحليلك أو استخدام كوبون الخصم؟
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              تواصل مباشرة مع فريق {settings.labName} عبر الواتساب لإرسال كود الكوبون، تحديد موعد في الفرع،
              أو طلب أخصائي سحب العينة حتى باب منزلك في أسرع وقت.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={onOpenSync}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950 transition-all hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>مزامنة وحجز عبر واتساب ({settings.whatsappNumber})</span>
            </button>

            <a
              href={`tel:${settings.hotlineNumber}`}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>اتصال ({settings.hotlineNumber})</span>
            </a>
          </div>
        </div>

        {/* Footer Details Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
          <div>
            <h4 className="text-sm font-bold text-white mb-2">{settings.labName}</h4>
            <p className="leading-relaxed text-slate-400">{settings.tagline}</p>
            {mainBranch && (
              <p className="text-[11px] text-emerald-400/90 mt-2 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 shrink-0" />
                <span>{mainBranch.name}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{settings.workingHours}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{mainBranch ? mainBranch.address : settings.address}</span>
            </div>
          </div>

          <div className="text-left md:text-left text-slate-500 flex flex-col justify-between">
            <p className="text-[11px]">
              برنامج ترفيهي ومكافآت معتمد لرواد معامل RT © {new Date().getFullYear()}
            </p>
            <p className="text-[11px] text-slate-600 mt-1">
              جميع حقوق الكوبونات والجوائز محفوظة لمعامل RT للتحاليل الطبية
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
