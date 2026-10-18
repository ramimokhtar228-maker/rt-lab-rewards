import React from 'react';
import {
  MessageCircle,
  PhoneCall,
  Clock,
  MapPin,
  Home,
  Building,
  Users,
  ExternalLink,
  ShieldCheck,
  Radio,
  Phone,
  Share2,
} from 'lucide-react';
import { LabSettings } from '../types';
import { getWhatsAppUrl, getTelUrl, formatPhoneDisplay } from '../utils/phone';

interface LabConnectBarProps {
  settings: LabSettings;
  onOpenSync: () => void;
  onOpenBranches: () => void;
  onOpenInvite?: () => void;
}

export const LabConnectBar: React.FC<LabConnectBarProps> = ({
  settings,
  onOpenSync,
  onOpenBranches,
  onOpenInvite,
}) => {
  const branches = settings.branches || [];
  const mainBranch = branches.find((b) => b.isMainBranch) || branches[0];

  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Main CTA Callout Box */}
        <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-right">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Home className="w-4 h-4" />
              <span>خدمة السحب المنزلي المريحة 24/7 في كافة أنحاء القاهرة والجيزة</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              جاهز لإجراء تحليلك أو التواصل مع فرعك المفضل؟
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              تواصل مباشرة مع فريق {settings.labName} عبر الواتساب لتأكيد الحجز، استلام نتائج الفحوصات بصيغة PDF،
              أو طلب تمريض وسحب عينات في منزلك من أقرب فرع إليك.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={onOpenSync}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950 transition-all hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>محادثة واتساب سريعة</span>
            </button>
            {onOpenInvite && (
              <button
                onClick={onOpenInvite}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-teal-700/60 hover:bg-teal-600 text-teal-200 font-bold text-xs transition-colors border border-teal-500/30"
              >
                <Share2 className="w-3.5 h-3.5 text-teal-300" />
                <span>إرسال الرابط للعميل</span>
              </button>
            )}
            <button
              onClick={onOpenBranches}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
            >
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              <span>عرض جميع الفروع ({branches.length})</span>
            </button>
          </div>
        </div>

        {/* Branches Quick Grid Strip */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>فروع معامل RT المعتمدة ومواعيد العمل</span>
            </h4>
            <button
              onClick={onOpenBranches}
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              إدارة الفروع والإدارة ←
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {branches.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2 hover:border-emerald-500/30 transition-all flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{b.name}</span>
                    {b.isMainBranch && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                        الرئيسي
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {b.address}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <a
                    href={getTelUrl(b.phone)}
                    className="font-mono text-emerald-400 hover:underline flex items-center gap-1"
                    title="اتصال هاتفي بالفرع"
                  >
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>{formatPhoneDisplay(b.phone)}</span>
                  </a>
                  <a
                    href={getWhatsAppUrl(
                      b.whatsappNumber,
                      `السلام عليكم، أود التواصل مع ${b.name} لمعامل RT`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-300 hover:text-emerald-200 flex items-center gap-1 font-bold bg-emerald-950/60 hover:bg-emerald-900/80 px-2.5 py-1 rounded-lg border border-emerald-500/30"
                  >
                    <MessageCircle className="w-3 h-3 text-emerald-400" />
                    <span>واتساب</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Details Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
          <div>
            <h4 className="text-sm font-bold text-white mb-2">{settings.labName}</h4>
            <p className="leading-relaxed text-slate-400">{settings.tagline}</p>
            <div className="flex items-center gap-2 mt-3 text-slate-300 text-xs">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>الخط الساخن: </span>
              <strong className="text-emerald-400 font-mono">{settings.hotlineNumber}</strong>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{settings.workingHours}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{mainBranch ? mainBranch.address : settings.address}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Radio className="w-3 h-3 text-emerald-400" />
              <span>المزامنة السحابية متعددة الأجهزة مفعلة عبر سيرفر RT Lab المركزي</span>
            </div>
          </div>

          <div className="text-right md:text-left text-slate-500 flex flex-col justify-between">
            <p className="text-[11px]">
              برنامج ترفيهي ومكافآت معتمد لرواد معامل RT © {new Date().getFullYear()}
            </p>
            <p className="text-[11px] text-slate-600 mt-1">
              جميع حقوق الكوبونات والجوائز والفروع محفوظة لمعامل RT للتحاليل الطبية
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
