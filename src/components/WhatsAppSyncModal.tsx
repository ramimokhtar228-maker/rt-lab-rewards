import React from 'react';
import {
  X,
  MessageCircle,
  PhoneCall,
  Copy,
  Check,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { LabSettings, UserCoupon, PlayerProfile } from '../types';

interface WhatsAppSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon?: UserCoupon | null;
  settings: LabSettings;
  player: PlayerProfile;
  customMessage?: string;
}

export const WhatsAppSyncModal: React.FC<WhatsAppSyncModalProps> = ({
  isOpen,
  onClose,
  coupon,
  settings,
  player,
  customMessage,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [requestHomeVisit, setRequestHomeVisit] = React.useState(true);

  if (!isOpen) return null;

  // Clean lab whatsapp number (remove non-digits, ensure country code)
  const cleanNumber = settings.whatsappNumber.replace(/\D/g, '');

  const voucherTitle = coupon ? coupon.title : 'طلب استفسار ومكافأة من تطبيق معامل RT';
  const voucherCode = coupon ? coupon.couponCode : `RT-SYNC-${Math.floor(1000 + Math.random() * 9000)}`;
  const voucherValue = coupon ? coupon.value : 'مكافأة عميل مميز';

  // Construct official WhatsApp text
  const messageBody = customMessage || `سلام عليكم ورحمة الله، أنا المريض/العميل: ${player.name || 'عميل معامل RT'}
رقم الهاتف: ${player.phone || 'مسجل بالتطبيق'}

لقد شاركت في برنامج ألعاب ومكافآت معامل RT وفزت بالمكافأة التالية:
🎁 *${voucherTitle}*
🏷️ *قيمة المكافأة / الخصم:* ${voucherValue}
🔢 *كود التحقق الخاص بي:* [${voucherCode}]
📅 *التاريخ:* ${new Date().toLocaleDateString('ar-EG')}
📍 *نوع الخدمة المطلوبة:* ${requestHomeVisit ? 'سحب عينة منزلي في مكاني 🏠' : 'حجز في أقرب فرع لمعامل RT 🏥'}

برجاء تفعيل الكوبون وتأكيد الموعد الطبي. شكراً لمعامل RT!`;

  const encodedUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageBody)}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucherCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden text-right">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">مزامنة الكوبون مع واتساب المعمل</h3>
              <p className="text-xs text-emerald-100">تأكيد فوري للجائزة وحجز الخدمة مباشرة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Official Voucher Preview Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3 mb-3">
              <div>
                <span className="text-[11px] font-semibold text-emerald-400">معامل RT للتحاليل الطبية</span>
                <h4 className="text-base font-bold text-white mt-0.5">{voucherTitle}</h4>
                <p className="text-xs text-slate-400 mt-1">{coupon?.description || 'كوبون صالح لدى جميع فروع المعمل'}</p>
              </div>
              <div className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs font-bold text-center shrink-0">
                {voucherValue}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 bg-slate-900/90 rounded-lg px-3 py-2 border border-slate-800">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500">كود التحقق الإلكتروني</span>
                <span className="font-mono font-bold text-sm tracking-wider text-emerald-300">{voucherCode}</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ الكود'}</span>
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
              <span>صالحة حتى: {coupon?.expiresAt || '30 يوماً من اليوم'}</span>
              <span>المريض: {player.name}</span>
            </div>
          </div>

          {/* Service Preference Toggle */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3">
            <label className="text-xs font-semibold text-slate-300 mb-2 block">
              طريقة الاستفادة من التحليل أو الكوبون:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRequestHomeVisit(true)}
                className={`py-2 px-3 rounded-lg text-xs font-bold text-center transition-all ${
                  requestHomeVisit
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                🏠 سحب عينة منزلي
              </button>
              <button
                type="button"
                onClick={() => setRequestHomeVisit(false)}
                className={`py-2 px-3 rounded-lg text-xs font-bold text-center transition-all ${
                  !requestHomeVisit
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                🏥 الحضور لأقرب فرع
              </button>
            </div>
          </div>

          {/* Quick Lab Contact Information */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2 p-2 bg-slate-950/40 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{settings.workingHours}</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-950/40 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">خدمة سحب 24 ساعة</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <a
              href={encodedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.01]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>إرسال وتأكيد الحجز فوراً عبر واتساب المعمل</span>
            </a>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${settings.hotlineNumber}`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>اتصال مباشر بالمعمل ({settings.hotlineNumber})</span>
              </a>
              <button
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
