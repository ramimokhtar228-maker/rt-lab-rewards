import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Trophy,
  CheckCircle2,
  MessageCircle,
  Copy,
  Check,
  Calendar,
  MapPin,
  Clock,
  Phone,
  User,
  ShieldCheck,
  Award,
  Home,
  Building,
  UserCheck,
  Send,
  Radio,
} from 'lucide-react';
import { UserCoupon, PlayerProfile, LabSettings, PrizeClaimBooking, SampleCollector } from '../types';
import { soundManager } from '../utils/audio';
import { alertSoundManager } from '../utils/audioAlert';
import { triggerConfetti } from '../utils/confetti';
import { formatWhatsAppNumber } from '../utils/storage';

interface PrizeClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: UserCoupon | null;
  player: PlayerProfile;
  settings: LabSettings;
  collectors?: SampleCollector[];
  onSavePlayer: (updated: Partial<PlayerProfile>) => void;
  onAddClaimBooking: (claim: Omit<PrizeClaimBooking, 'id' | 'createdAt' | 'status'>) => void;
}

export const PrizeClaimModal: React.FC<PrizeClaimModalProps> = ({
  isOpen,
  onClose,
  coupon,
  player,
  settings,
  collectors = [],
  onSavePlayer,
  onAddClaimBooking,
}) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [patientName, setPatientName] = useState(
    player.name && player.name !== 'عميل معامل RT' ? player.name : ''
  );
  const [patientPhone, setPatientPhone] = useState(player.phone || '');
  const [address, setAddress] = useState('');
  const [serviceType, setServiceType] = useState<'home_visit' | 'branch_visit'>('home_visit');
  const [preferredTime, setPreferredTime] = useState('صباحاً (9:00 ص - 1:00 ظ)');
  const [copied, setCopied] = useState(false);

  // Collector (الجامع) Selection State
  const defaultCollectors: SampleCollector[] =
    collectors && collectors.length > 0
      ? collectors
      : settings.collectors && settings.collectors.length > 0
      ? settings.collectors
      : [
          {
            id: 'col_aya',
            name: 'أ. آية أحمد',
            phone: '01278967133',
            whatsappNumber: '201116979431',
            area: 'شبرا الخيمة، بهتيم، مسطرد، والمناطق المجاورة',
            roleTitle: 'مسؤولة التنسيق وفنية سحب عينات',
            isAvailable: true,
          },
          {
            id: 'col_mona',
            name: 'ك. منى أحمد',
            phone: '01013242777',
            whatsappNumber: '201000756144',
            area: 'بهتيم، شبرا الخيمة، والفرع الرئيسي',
            roleTitle: 'أخصائية سحب وتحاليل طبية',
            isAvailable: true,
          },
          {
            id: 'col_emergency',
            name: 'فريق التمريض السريع (سحب منزلي 24 ساعة)',
            phone: '01100046841',
            whatsappNumber: '201100874444',
            area: 'كافة أنحاء القاهرة الكبرى والجيزة والقليوبية',
            roleTitle: 'طوارئ سحب منزلي مجهز',
            isAvailable: true,
          },
          {
            id: 'col_dr_rami',
            name: 'د. رامي مختار (إشراف وحالات حرجة)',
            phone: '01124485444',
            whatsappNumber: '201100874444',
            area: 'الفرع الرئيسي ومتابعة الحالات الخاصة',
            roleTitle: 'طبيب الباثولوجيا الإكلينيكية واستشاري المعمل',
            isAvailable: true,
          },
        ];

  const [selectedCollectorId, setSelectedCollectorId] = useState<string>(
    defaultCollectors[0]?.id || 'col_aya'
  );
  const [isCustomCollector, setIsCustomCollector] = useState<boolean>(false);
  const [customCollectorName, setCustomCollectorName] = useState<string>('');
  const [customCollectorPhone, setCustomCollectorPhone] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      if (player.name && player.name !== 'عميل معامل RT') setPatientName(player.name);
      if (player.phone) setPatientPhone(player.phone);
    }
  }, [isOpen, player]);

  if (!isOpen || !coupon) return null;

  // Selected collector object resolution
  const chosenCollector = isCustomCollector
    ? {
        id: 'col_custom_' + Date.now(),
        name: customCollectorName.trim() || 'فني سحب مخصص',
        phone: customCollectorPhone.trim() || settings.hotlineNumber,
        whatsappNumber: customCollectorPhone.trim() || settings.whatsappNumber,
        area: address || 'منطقة مخصصة',
      }
    : defaultCollectors.find((c) => c.id === selectedCollectorId) || defaultCollectors[0];

  const cleanLabPhone = formatWhatsAppNumber(settings.whatsappNumber);
  const cleanCollectorPhone = formatWhatsAppNumber(chosenCollector.whatsappNumber || chosenCollector.phone);
  const cleanPatientPhone = formatWhatsAppNumber(patientPhone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) {
      alert('برجاء كتابة اسم المريض ورقم هاتفه لإتمام الحجز.');
      return;
    }

    // Save profile locally
    onSavePlayer({
      name: patientName.trim(),
      phone: patientPhone.trim(),
    });

    // Save claim record (with chosen collector)
    onAddClaimBooking({
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      address: address.trim() || (serviceType === 'home_visit' ? 'سحب منزلي' : 'فرع المعمل'),
      serviceType,
      preferredTime,
      couponCode: coupon.couponCode,
      prizeTitle: coupon.title,
      prizeValue: coupon.value,
      points: player.points,
      collectorId: chosenCollector.id,
      collectorName: chosenCollector.name,
      collectorPhone: chosenCollector.phone,
      collectorWhatsApp: chosenCollector.whatsappNumber,
      notes: `تم اختيار الجامع: ${chosenCollector.name} | الخدمة: ${serviceType === 'home_visit' ? 'سحب منزلي' : 'زيارة فرع'}`,
    });

    soundManager.playFanfare();
    alertSoundManager.playIncomingAlert();
    triggerConfetti();
    setStep('success');
  };

  // 1. Full Medical Ticket for Collector (فني السحب)
  const collectorTicketMsg = `*🚨 تكليف حالة وسحب عينة - ${settings.labName}* 🩺
---------------------------------------
👨‍⚕️ *فني السحب (الجامع) المسؤول:* ${chosenCollector.name}
👤 *اسم المريض:* ${patientName}
📱 *هاتف المريض:* ${patientPhone}
📍 *نوع الخدمة:* ${serviceType === 'home_visit' ? 'سحب منزلي 🏠' : 'حضور للفرع 🏥'}
📌 *العنوان:* ${address || 'ميدان بهتيم / الفرع الرئيسي'}
⏰ *الميعاد المفضل:* ${preferredTime}
🎁 *الجائزة أو الفحص:* ${coupon.title} (${coupon.value})
🔢 *كود الكوبون المعتمد:* [${coupon.couponCode}]
⭐ *رصيد النقاط:* ${player.points} نقطة
---------------------------------------
يرجى سرعة التواصل مع المريض وتأكيد الموعد وتجهيز أنابيب ومستلزمات السحب المعقمة. شكراً لمعامل RT! 💚`;

  // 2. Official Lab Ticket
  const labTicketMsg = `*تذكرة تفعيل جائزة وحجز في ${settings.labName}* 🩺🎉
---------------------------------------
👤 *اسم المريض:* ${patientName}
📱 *رقم الهاتف:* ${patientPhone}
👨‍⚕️ *فني السحب (الجامع) المختار:* ${chosenCollector.name} (${chosenCollector.phone})
🎁 *الجائزة المستحقة:* ${coupon.title}
🏷️ *القيمة / الخصم:* ${coupon.value}
🔢 *كود التحقق الإلكتروني:* [${coupon.couponCode}]
⭐ *رصيد النقاط:* ${player.points} نقطة
🏆 *التسجيل في دوري الأبطال:* تم التسجيل رسمياً ✅
📍 *طريقة الخدمة المطلوبة:* ${serviceType === 'home_visit' ? 'سحب عينة منزلي 🏠' : 'حجز فرع المعمل 🏥'}
${address ? `📌 *العنوان / المنطقة:* ${address}\n` : ''}⏰ *الوقت المفضل:* ${preferredTime}
---------------------------------------
تم الحفظ والتزامن المباشر بين الأجهزة بنجاح ✅`;

  // 3. Confirmation to Patient
  const patientTicketMsg = `🎉 *أهلاً بك يا أستاذ/ة ${patientName} في ${settings.labName}!*
✅ تم بنجاح اعتماد حجز جائزتك: *${coupon.title}* (${coupon.value}).
🔢 كود التحقق الرسمي: *[${coupon.couponCode}]*
👨‍⚕️ تم تكليف أخصائي السحب: *${chosenCollector.name}* (${chosenCollector.phone}) بالتواصل معكم لتأكيد موعد الزيارة (${serviceType === 'home_visit' ? 'سحب منزلي' : 'فرع المعمل'}).
📞 الخط الساخن للمعمل: *${settings.hotlineNumber}*
نسعد دائماً بخدمتكم وصحتكم أولويتنا 💚`;

  const collectorUrl = `https://wa.me/${cleanCollectorPhone}?text=${encodeURIComponent(collectorTicketMsg)}`;
  const labUrl = `https://wa.me/${cleanLabPhone}?text=${encodeURIComponent(labTicketMsg)}`;
  const patientUrl = `https://wa.me/${cleanPatientPhone}?text=${encodeURIComponent(patientTicketMsg)}`;

  const handleCopyCollectorTicket = () => {
    navigator.clipboard.writeText(collectorTicketMsg);
    setCopied(true);
    soundManager.playSuccess();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden text-right max-h-[92vh] flex flex-col">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {step === 'form' ? 'تفعيل الجائزة واختيار الجامع والمزامنة' : 'تم اعتماد الحجز والتزامن المباشر!'}
              </h3>
              <p className="text-xs text-emerald-100">
                {step === 'form'
                  ? 'اختر الجامع وسجل بياناتك لإرسال التكليف وإشعار المعمل فوراً'
                  : 'تم الحفظ وإشعار جهاز المعمل بالصوت - أرسل الواتساب الآن'}
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

        {/* STEP 1: PATIENT REGISTRATION & COLLECTOR SELECTION */}
        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* Won Prize Summary Card */}
            <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-emerald-400 font-bold block">الجائزة الفائز بها:</span>
                <h4 className="text-sm font-bold text-white mt-0.5">{coupon.title}</h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <span>
                    الكود: <strong className="font-mono text-emerald-300">{coupon.couponCode}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    نقاطك: <strong className="text-amber-400 font-mono">{player.points}</strong>
                  </span>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-black text-center shrink-0">
                {coupon.value}
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3.5">
              {/* Patient Name */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold block">
                  اسم المريض الثلاثي (للتسجيل الطبي ودوري الأبطال): *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute right-3.5 top-3 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="مثال: محمد أحمد علي..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Patient Phone */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold block">
                  رقم هاتف المريض والواتساب: *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute right-3.5 top-3 text-slate-500 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-left"
                  />
                </div>
              </div>

              {/* CRITICAL: COLLECTOR (الجامع) SELECTION */}
              <div className="space-y-2 p-3.5 bg-slate-950/80 rounded-2xl border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <span>اختيار فني سحب العينات (الجامع المسؤول عن الحالة): *</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 font-semibold">تزامن وتكليف فوري</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  سيتم إرسال تذكرة الحالة لواتساب الجامع المختار وسماع التنبيه الصوتي على جهاز المعمل فوراً:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {defaultCollectors.map((col) => {
                    const isSelected = !isCustomCollector && selectedCollectorId === col.id;
                    return (
                      <div
                        key={col.id}
                        onClick={() => {
                          setIsCustomCollector(false);
                          setSelectedCollectorId(col.id);
                        }}
                        className={`p-2.5 rounded-xl border text-right cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-950/50 text-white shadow-md ring-1 ring-emerald-500/50'
                            : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">{col.name}</span>
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-emerald-400 bg-emerald-500'
                                : 'border-slate-600'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-400 mt-0.5 truncate">{col.roleTitle || 'فني سحب معتمد'}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">📍 {col.area}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Option for custom collector */}
                <div className="pt-1">
                  <div
                    onClick={() => setIsCustomCollector(!isCustomCollector)}
                    className={`p-2 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                      isCustomCollector
                        ? 'border-amber-500 bg-amber-950/30 text-amber-200'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <span>🩺 تحديد فني سحب / جامع عينات آخر مخصص</span>
                    <span className="text-[11px] font-bold">
                      {isCustomCollector ? '✓ مفعّل' : '+ اختيار مخصص'}
                    </span>
                  </div>

                  {isCustomCollector && (
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-1 border-t border-slate-800 animate-in fade-in duration-150">
                      <input
                        type="text"
                        placeholder="اسم فني السحب..."
                        value={customCollectorName}
                        onChange={(e) => setCustomCollectorName(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="tel"
                        placeholder="رقم هاتف / واتساب الجامع..."
                        value={customCollectorPhone}
                        onChange={(e) => setCustomCollectorPhone(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-left"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Service Method Choice */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-semibold block">
                  طريقة تنفيذ التحليل والاستفادة من الجائزة:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setServiceType('home_visit')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      serviceType === 'home_visit'
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold shadow-sm'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span className="text-xs">سحب عينة منزلي 🏠</span>
                    <span className="text-[10px] text-slate-500">حضور الجامع لمنزلك</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServiceType('branch_visit')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      serviceType === 'branch_visit'
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold shadow-sm'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span className="text-xs">زيارة الفرع 🏥</span>
                    <span className="text-[10px] text-slate-500">فرع بهتيم / شبرا الخيمة</span>
                  </button>
                </div>
              </div>

              {/* Address / Location */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold block">
                  {serviceType === 'home_visit'
                    ? 'العنوان التفصيلي ومكان السحب المنزلي:'
                    : 'المنطقة أو الفرع الأقرب لك:'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute right-3.5 top-3 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={
                      serviceType === 'home_visit'
                        ? 'المنطقة، الشارع، رقم العمارة أو علامة مميزة...'
                        : 'مثال: ميدان بهتيم برج صيدلية العزبي...'
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Preferred Time */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold block">
                  الموعد المناسب لزيارة فني السحب أو تواصل المعمل:
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="صباحاً (9:00 ص - 1:00 ظ)">الفترة الصباحية (9:00 ص - 1:00 ظ)</option>
                  <option value="عصراً (1:00 ظ - 5:00 م)">فترة الظهيرة والعصر (1:00 ظ - 5:00 م)</option>
                  <option value="مساءً (5:00 م - 10:00 م)">الفترة المسائية (5:00 م - 10:00 م)</option>
                  <option value="عاجل اليوم في أقرب وقت">طوارئ / في أقرب وقت اليوم 🚨</option>
                </select>
              </div>
            </div>

            {/* League note */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2.5 text-xs text-amber-300">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                عند تأكيد بياناتك سيتم إدراجك فوراً في <strong>«دوري أبطال معامل RT»</strong> ومزامنة طلبك مع فني السحب وجهاز المعمل!
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-950 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>تأكيد الحجز وتكليف الجامع ومزامنة البيانات ⚡</span>
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: OFFICIAL TICKET & DIRECT WHATSAPP ACTIONS */
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* Sync Confirmation Banner */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950/60 border border-emerald-500/50 rounded-2xl text-center space-y-1">
              <span className="text-xs text-emerald-300 font-extrabold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                تم الحفظ والتزامن المباشر وسماع التنبيه على جهاز المعمل! 🔔
              </span>
              <p className="text-[11px] text-slate-300">
                تذكرة الحجز الطبية جاهزة الآن. يمكنك إرسالها فوراً إلى واتساب الجامع أو المعمل أو المريض:
              </p>
            </div>

            {/* Official Digital Voucher Card */}
            <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-4 space-y-3 relative overflow-hidden">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold">تذكرة حجز معامل RT الرسمية</span>
                  <h4 className="text-base font-black text-white">{coupon.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    المريض: <strong className="text-white">{patientName}</strong> ({patientPhone})
                  </p>
                </div>
                <div className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-300 text-xs font-black">
                  {coupon.value}
                </div>
              </div>

              {/* Collector Details Box */}
              <div className="p-2.5 bg-gradient-to-r from-amber-950/30 to-slate-900 rounded-xl border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-400 font-bold block">فني السحب (الجامع) المكلّف:</span>
                  <span className="font-bold text-xs text-amber-100">{chosenCollector.name}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">{chosenCollector.phone}</span>
                </div>
                <a
                  href={`tel:${chosenCollector.phone}`}
                  className="px-2 py-1 bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold rounded-lg flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>اتصال</span>
                </a>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="p-2 bg-slate-900 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">كود التحقق</span>
                  <span className="font-mono font-bold text-emerald-400">{coupon.couponCode}</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">نوع الخدمة</span>
                  <span className="font-semibold">
                    {serviceType === 'home_visit' ? 'سحب منزلي 🏠' : 'حجز فرع 🏥'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                <span>الموعد المفضل: {preferredTime}</span>
                {address && <span> · العنوان: {address}</span>}
              </div>
            </div>

            {/* Direct WhatsApp Callouts */}
            <div className="space-y-2 pt-1">
              {/* Button 1: Send to Collector */}
              <a
                href={collectorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-950 transition-all hover:scale-[1.01]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال التذكرة والتكليف لواتساب الجامع ({chosenCollector.name}) 💬</span>
              </a>

              {/* Button 2: Send to Lab Official WhatsApp */}
              <a
                href={labUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors"
              >
                <Building className="w-3.5 h-3.5" />
                <span>إرسال الحجز لواتساب إدارة المعمل الرئيسي ({settings.whatsappNumber})</span>
              </a>

              {/* Button 3: Send to Patient WhatsApp */}
              <a
                href={patientUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-teal-400" />
                <span>إرسال رسالة التأكيد الطبية لواتساب المريض ({patientPhone})</span>
              </a>

              <button
                onClick={handleCopyCollectorTicket}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم نسخ التذكرة كاملة بنجاح!' : 'نسخ نص التذكرة بالكامل للذاكرة'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
