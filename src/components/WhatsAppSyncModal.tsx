import React, { useState, useEffect } from 'react';
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
  User,
  Phone,
  Home,
  Building,
  CheckCircle2,
  Send,
  AlertCircle,
} from 'lucide-react';
import { LabSettings, UserCoupon, PlayerProfile, PrizeClaimBooking, SampleCollector } from '../types';
import { formatWhatsAppNumber } from '../utils/storage';
import { soundManager } from '../utils/audio';
import { alertSoundManager } from '../utils/audioAlert';
import { triggerConfetti } from '../utils/confetti';

interface WhatsAppSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon?: UserCoupon | null;
  settings: LabSettings;
  player: PlayerProfile;
  collectors?: SampleCollector[];
  onSavePlayer?: (updated: Partial<PlayerProfile>) => void;
  onAddClaimBooking?: (claim: Omit<PrizeClaimBooking, 'id' | 'createdAt' | 'status'>) => void;
  customMessage?: string;
}

export const WhatsAppSyncModal: React.FC<WhatsAppSyncModalProps> = ({
  isOpen,
  onClose,
  coupon,
  settings,
  player,
  collectors = [],
  onSavePlayer,
  onAddClaimBooking,
  customMessage,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedReply, setCopiedReply] = useState(false);
  const [requestHomeVisit, setRequestHomeVisit] = useState(true);
  const [preferredTime, setPreferredTime] = useState('صباحاً (9:00 ص - 1:00 ظ)');
  const [address, setAddress] = useState('');

  // Patient Info Form State
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSavedSuccessfully(false);
      setValidationError('');
      if (player.name && player.name !== 'عميل معامل RT' && player.name !== 'بطل RT الجديد') {
        setPatientName(player.name);
      } else {
        setPatientName('');
      }
      if (player.phone && player.phone !== 'مسجل بالتطبيق') {
        setPatientPhone(player.phone);
      } else {
        setPatientPhone('');
      }
    }
  }, [isOpen, player]);

  if (!isOpen) return null;

  // Clean numbers
  const cleanLabNumber = formatWhatsAppNumber(settings.whatsappNumber);
  const cleanPatientNumber = formatWhatsAppNumber(patientPhone || player.phone);

  const voucherTitle = coupon ? coupon.title : 'طلب استفسار ومكافأة من تطبيق معامل RT';
  const voucherCode = coupon ? coupon.couponCode : `RT-SYNC-${Math.floor(1000 + Math.random() * 9000)}`;
  const voucherValue = coupon ? coupon.value : 'مكافأة عميل مميز';

  // Construct official WhatsApp text from Patient to Lab
  const finalPatientName = patientName.trim() || player.name || 'عميل معامل RT';
  const finalPatientPhone = patientPhone.trim() || player.phone || 'مسجل بالتطبيق';
  const finalServiceDesc = requestHomeVisit
    ? 'سحب عينة منزلي في مكاني 🏠'
    : 'حجز في أقرب فرع لمعامل RT 🏥';

  const messageBody =
    customMessage ||
    `سلام عليكم ورحمة الله، أنا المريض: *${finalPatientName}*
رقم الهاتف / واتساب: *${finalPatientPhone}*
${address ? `العنوان / المنطقة: *${address}*\n` : ''}
لقد شاركت في برنامج ألعاب ومكافآت معامل RT وفزت بالمكافأة التالية:
🎁 *${voucherTitle}*
🏷️ *قيمة المكافأة / الخصم:* ${voucherValue}
🔢 *كود التحقق الخاص بي:* [${voucherCode}]
📅 *التاريخ:* ${new Date().toLocaleDateString('ar-EG')}
📍 *نوع الخدمة المطلوبة:* ${finalServiceDesc}
⏰ *الموعد المفضل:* ${preferredTime}

برجاء تفعيل الكوبون وتأكيد الموعد الطبي وإرسال الرد لتحديد موعد الزيارة. شكراً لمعامل RT! 🩺`;

  const encodedUrl = `https://wa.me/${cleanLabNumber}?text=${encodeURIComponent(messageBody)}`;

  // Official Lab Reply Template to Patient (for confirmation & appointment scheduling)
  const labReplyTemplate = `🎉 *أهلاً بحضرتك يا أستاذ/ة ${finalPatientName} في ${settings.labName}!* 🌸

✅ *تم بنجاح تفعيل واعتماد هديتك:*
🎁 *${voucherTitle}*
🏷️ *القيمة:* ${voucherValue}
🔢 *كود التحقق:* [${voucherCode}]

🩺 *تفاصيل وتأكيد الموعد:*
📍 نوع الخدمة: ${requestHomeVisit ? 'زيارة سحب عينة منزلي معقمة 🏠' : 'حضور لفرع المعمل 🏥'}
⏰ الموعد المحدد: ${preferredTime}
${address ? `📌 العنوان: ${address}\n` : ''}
👨‍⚕️ تم إخطار فريق التمريض وسحب العينات لتجهيز المستلزمات الطبية والالتزام بالموعد.
📞 للاستفسار أو تعديل الميعاد: ${settings.hotlineNumber}

معامل RT تتمنى لحضرتك دوام الصحة والعافية! 💚`;

  const labReplyUrl = `https://wa.me/${cleanPatientNumber}?text=${encodeURIComponent(labReplyTemplate)}`;

  // Handle WhatsApp submission with guaranteed cloud storage
  const handleConfirmAndSendWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();

    // Validation
    if (!patientName.trim()) {
      setValidationError('برجاء كتابة اسم المريض بالكامل لحفظ الحجز بالسيستم وإرساله للمعامل.');
      return;
    }
    if (!patientPhone.trim() || patientPhone.trim().length < 9) {
      setValidationError('برجاء كتابة رقم هاتف / واتساب صحيح للتواصل وتحديد الموعد.');
      return;
    }

    setValidationError('');

    // 1. Save player profile locally
    if (onSavePlayer) {
      onSavePlayer({
        name: patientName.trim(),
        phone: patientPhone.trim(),
      });
    }

    // 2. Register claim booking in cloud database and local system
    if (onAddClaimBooking && coupon) {
      const chosenCollector = collectors && collectors.length > 0 ? collectors[0] : undefined;
      onAddClaimBooking({
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        address: address.trim() || (requestHomeVisit ? 'سحب منزلي' : 'فرع المعمل'),
        serviceType: requestHomeVisit ? 'home_visit' : 'branch_visit',
        preferredTime,
        couponCode: voucherCode,
        prizeTitle: voucherTitle,
        prizeValue: voucherValue,
        points: player.points,
        collectorId: chosenCollector?.id,
        collectorName: chosenCollector?.name || 'فريق التمريض السريع',
        collectorPhone: chosenCollector?.phone,
        collectorWhatsApp: chosenCollector?.whatsappNumber,
        notes: `حجز مباشر عبر واتساب المعمل | الخدمة: ${requestHomeVisit ? 'سحب منزلي' : 'فرع المعمل'}`,
      });
    }

    // 3. Play fanfare and sound alert
    soundManager.playFanfare();
    alertSoundManager.playIncomingAlert();
    triggerConfetti();
    setIsSavedSuccessfully(true);

    // 4. Open WhatsApp
    setTimeout(() => {
      window.open(encodedUrl, '_blank');
    }, 400);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucherCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden text-right flex flex-col max-h-[92vh]">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-sm">
              <MessageCircle className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black">
                تسجيل الجائزة وإرسالها لواتساب معامل RT
              </h3>
              <p className="text-xs text-emerald-100">
                حفظ سحابي فوري بالسيستم + إشعار صوتي للإدارة لتأكيد الموعد 🔔
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Official Voucher Preview Card */}
          <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-4 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
              <div>
                <span className="text-[11px] font-bold text-emerald-400">
                  {settings.labName} · كود معتمد
                </span>
                <h4 className="text-base font-black text-white mt-0.5">{voucherTitle}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  {coupon?.description || 'كوبون صالح لدى جميع فروع المعمل أو مع خدمة السحب المنزلي'}
                </p>
              </div>
              <div className="px-3 py-1.5 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-black shrink-0">
                {voucherValue}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 bg-slate-900/90 rounded-xl px-3.5 py-2.5 border border-slate-800">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400">كود التحقق الإلكتروني</span>
                <span className="font-mono font-black text-base tracking-wider text-emerald-400">
                  {voucherCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-bold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ الكود'}</span>
              </button>
            </div>
          </div>

          {/* Patient Required Details Form */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>بيانات المريض لاعتماد الجائزة وتحديد الموعد (مطلوب):</span>
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold">تخزين سحابي مباشر ✅</span>
            </div>

            {validationError && (
              <div className="p-2.5 bg-rose-950/40 border border-rose-500/50 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="space-y-2.5">
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">
                  اسم المريض الكريم: <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute right-3.5 top-3 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => {
                      setPatientName(e.target.value);
                      setValidationError('');
                    }}
                    placeholder="اكتب اسم حضرتك بالكامل (مثال: أحمد محمود)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-10 pl-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">
                  رقم الموبايل / واتساب: <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute right-3.5 top-3 text-slate-500 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => {
                      setPatientPhone(e.target.value);
                      setValidationError('');
                    }}
                    placeholder="رقم الموبايل (مثال: 01012345678)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-10 pl-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">
                  العنوان أو المنطقة (اختياري للزيارة المنزلية):
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute right-3.5 top-3 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="مثال: بهتيم / شبرا الخيمة / الشارع والعمارة"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-10 pl-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Service Preference Toggle */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              طريقة الاستفادة من التحليل أو الكوبون:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRequestHomeVisit(true)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
                  requestHomeVisit
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>سحب عينة منزلي 🏠</span>
              </button>
              <button
                type="button"
                onClick={() => setRequestHomeVisit(false)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
                  !requestHomeVisit
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>الحضور لفرع المعمل 🏥</span>
              </button>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mt-2 mb-1">
                الموعد المفضل:
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="صباحاً (9:00 ص - 1:00 ظ)">صباحاً (9:00 ص - 1:00 ظ)</option>
                <option value="عصراً (1:00 ظ - 5:00 م)">عصراً (1:00 ظ - 5:00 م)</option>
                <option value="مساءً (5:00 م - 10:00 م)">مساءً (5:00 م - 10:00 م)</option>
                <option value="عاجل اليوم في أقرب وقت 🚨">عاجل اليوم في أقرب وقت 🚨</option>
              </select>
            </div>
          </div>

          {/* Success Banner if already submitted */}
          {isSavedSuccessfully && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/60 rounded-2xl text-center space-y-1 animate-in zoom-in-95">
              <span className="text-xs font-black text-emerald-300 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                تم حفظ الحجز بالسيستم السحابي وإصدار رنين التنبيه بالإدارة! 🔔
              </span>
              <p className="text-[11px] text-slate-300">
                جاري فتح تطبيق الواتساب لإرسال بيانات المريض والكود المعتمد...
              </p>
            </div>
          )}

          {/* Lab Response Box (What Lab sends back to patient) */}
          <div className="bg-slate-950/90 border border-teal-500/30 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-teal-300 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-teal-400" />
                <span>رد وتأكيد المعمل للعميل (لتحديد الموعد):</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(labReplyTemplate);
                    setCopiedReply(true);
                    setTimeout(() => setCopiedReply(false), 2000);
                  }}
                  className="text-[11px] text-teal-400 hover:text-teal-300 font-bold"
                >
                  {copiedReply ? 'تم نسخ الرد!' : 'نسخ رد المعمل'}
                </button>
                {patientPhone && (
                  <a
                    href={labReplyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] bg-teal-600/30 hover:bg-teal-600/50 border border-teal-500/40 text-teal-200 px-2 py-0.5 rounded-lg font-bold"
                  >
                    واتساب العميل
                  </a>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              «أهلاً بحضرتك يا أستاذ/ة {finalPatientName} في {settings.labName}! تم بنجاح تفعيل واعتماد هديتك: {voucherTitle} بكود [{voucherCode}]، وتأكيد موعد {finalServiceDesc}...»
            </p>
          </div>

          {/* Quick Lab Contact Information */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2 p-2 bg-slate-950/40 rounded-xl border border-slate-800/60">
              <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{settings.workingHours}</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-950/40 rounded-xl border border-slate-800/60">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">طوارئ سحب 24 ساعة</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 shrink-0 space-y-2">
          <button
            type="button"
            onClick={handleConfirmAndSendWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-950 transition-all active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5" />
            <span>حفظ الجائزة بالسيستم وإرسالها لواتساب المعمل 🚀</span>
          </button>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${settings.hotlineNumber}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>الخط الساخن ({settings.hotlineNumber})</span>
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
  );
};
