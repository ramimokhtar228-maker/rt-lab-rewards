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
} from 'lucide-react';
import { UserCoupon, PlayerProfile, LabSettings, PrizeClaimBooking } from '../types';
import { soundManager } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

interface PrizeClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: UserCoupon | null;
  player: PlayerProfile;
  settings: LabSettings;
  onSavePlayer: (updated: Partial<PlayerProfile>) => void;
  onAddClaimBooking: (claim: Omit<PrizeClaimBooking, 'id' | 'createdAt' | 'status'>) => void;
}

export const PrizeClaimModal: React.FC<PrizeClaimModalProps> = ({
  isOpen,
  onClose,
  coupon,
  player,
  settings,
  onSavePlayer,
  onAddClaimBooking,
}) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [patientName, setPatientName] = useState(player.name && player.name !== 'عميل معامل RT' ? player.name : '');
  const [patientPhone, setPatientPhone] = useState(player.phone || '');
  const [address, setAddress] = useState('');
  const [serviceType, setServiceType] = useState<'home_visit' | 'branch_visit'>('home_visit');
  const [preferredTime, setPreferredTime] = useState('صباحاً (9:00 ص - 1:00 ظ)');
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    player.preferredBranchId || settings.branches?.[0]?.id || 'br_main'
  );

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      if (player.name && player.name !== 'عميل معامل RT') setPatientName(player.name);
      if (player.phone) setPatientPhone(player.phone);
      if (player.preferredBranchId) setSelectedBranchId(player.preferredBranchId);
    }
  }, [isOpen, player]);

  if (!isOpen || !coupon) return null;

  const branches = settings.branches || [];
  const chosenBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];
  const targetPhone = chosenBranch?.whatsappNumber || settings.whatsappNumber;
  const cleanLabPhone = targetPhone.replace(/\D/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) {
      setFormError('برجاء كتابة الاسم ورقم الهاتف لإتمام تسجيل وتفعيل الجائزة.');
      return;
    }
    setFormError(null);

    // Save profile
    onSavePlayer({
      name: patientName.trim(),
      phone: patientPhone.trim(),
      preferredBranchId: selectedBranchId,
    });

    // Save claim record
    onAddClaimBooking({
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      address: address.trim() || chosenBranch?.address || 'فرع المعمل',
      serviceType,
      preferredTime,
      branchId: selectedBranchId,
      couponCode: coupon.couponCode,
      prizeTitle: coupon.title,
      prizeValue: coupon.value,
      points: player.points,
    });

    soundManager.playFanfare();
    triggerConfetti();
    setStep('success');
  };

  // WhatsApp Message
  const whatsappMessage = `*تذكرة تفعيل جائزة وحجز في ${settings.labName}* 🩺🎉
---------------------------------------
👤 *اسم المريض:* ${patientName}
📱 *رقم الهاتف:* ${patientPhone}
🎁 *الجائزة المستحقة:* ${coupon.title}
🏷️ *القيمة / الخصم:* ${coupon.value}
🔢 *كود التحقق الإلكتروني:* [${coupon.couponCode}]
⭐ *رصيد النقاط:* ${player.points} نقطة
🏥 *الفرع المختار:* ${chosenBranch?.name || 'الفرع الرئيسي'}
📍 *طريقة الخدمة المطلوبة:* ${serviceType === 'home_visit' ? 'سحب عينة منزلي 🏠' : 'حجز زيارة الفرع 🏥'}
${address ? `📌 *العنوان / المنطقة:* ${address}\n` : ''}⏰ *الوقت المفضل:* ${preferredTime}
---------------------------------------
برجاء اعتماد الكوبون والتواصل لتأكيد الموعد الطبي. شكراً لمعامل RT!`;

  const whatsappUrl = `https://wa.me/${cleanLabPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  const handleCopyTicket = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    soundManager.playSuccess();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg h-full sm:h-auto sm:max-h-[92vh] bg-slate-900 border-0 sm:border border-emerald-500/40 rounded-none sm:rounded-3xl shadow-2xl overflow-y-auto text-right flex flex-col">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {step === 'form' ? 'تفعيل الجائزة والتسجيل بدوري الأبطال' : 'تم اعتماد الجائزة وتسجيلك في الدوري!'}
              </h3>
              <p className="text-xs text-emerald-100">
                {step === 'form'
                  ? 'سجل بياناتك لإرسالها لواتساب المعمل وتأكيد حجزك فوراً'
                  : 'تذكرة الحجز الرسمية جاهزة للإرسال لواتساب المعمل'}
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

        {/* STEP 1: PATIENT REGISTRATION FORM */}
        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Won Prize Summary Card */}
            <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-emerald-400 font-bold block">الجائزة الفائز بها:</span>
                <h4 className="text-sm font-bold text-white mt-0.5">{coupon.title}</h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <span>الكود: <strong className="font-mono text-emerald-300">{coupon.couponCode}</strong></span>
                  <span>·</span>
                  <span>نقاطك: <strong className="text-amber-400 font-mono">{player.points}</strong></span>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-black text-center shrink-0">
                {coupon.value}
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold text-center">
                {formError}
              </div>
            )}

            {/* Inputs */}
            <div className="space-y-3">
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

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold block">
                  رقم الهاتف والمحادثة على الواتساب: *
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

              {/* Service Method Choice */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-semibold block">
                  كيف ترغب في الاستفادة من التحليل أو الكوبون؟
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
                    <span className="text-[10px] text-slate-500">أخصائي في منزلك</span>
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
                    <span className="text-[10px] text-slate-500">أقرب فرع لمعامل RT</span>
                  </button>
                </div>
              </div>

              {/* Branch Selector */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold block">
                  اختر فرع المعمل التابع له أو الأقرب إليك:
                </label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
                {chosenBranch && (
                  <div className="text-[10px] text-slate-400 bg-slate-950/70 p-2 rounded-lg border border-slate-800 mt-1">
                    📍 {chosenBranch.address}
                  </div>
                )}
              </div>

              {/* Address / Location */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold block">
                  {serviceType === 'home_visit' ? 'العنوان التفصيلي ومكان السحب المنزلي:' : 'ملاحظات العنوان أو الوصول:'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute right-3.5 top-3 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={
                      serviceType === 'home_visit'
                        ? 'الشارع، رقم العمارة، الشقة، علامة مميزة...'
                        : 'اختياري: أي ملاحظة إضافية للمعمل...'
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Preferred Time */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold block">
                  الموعد المناسب لتواصل المعمل أو الزيارة:
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

            {/* League admission note */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2.5 text-xs text-amber-300">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                عند تأكيد بياناتك سيتم إدراجك فوراً في <strong>«دوري أبطال معامل RT»</strong> والتنافس على باقة الفحص الشامل الكبرى!
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد البيانات والانضمام لدوري أبطال المعمل</span>
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: OFFICIAL TICKET & DIRECT WHATSAPP CONFIRMATION */
          <div className="p-6 space-y-5">
            {/* League Badge celebration */}
            <div className="p-3.5 bg-gradient-to-r from-amber-500/20 via-slate-900 to-emerald-500/20 border border-amber-500/30 rounded-2xl text-center space-y-1">
              <span className="text-xs text-amber-300 font-bold block">
                👑 أهلاً بك يا بطل! تم تسجيلك بنجاح في دوري أبطال RT
              </span>
              <p className="text-[11px] text-slate-300">
                يمكنك الآن مراجعة رتبتك في صفحة «المتصدرون» ومضاعفة نقاطك يومياً!
              </p>
            </div>

            {/* Official Digital Voucher Card */}
            <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-4 space-y-3 relative overflow-hidden">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold">تذكرة حجز معامل RT الرسمية</span>
                  <h4 className="text-base font-black text-white">{coupon.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">المريض: {patientName} ({patientPhone})</p>
                </div>
                <div className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-300 text-xs font-black">
                  {coupon.value}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="p-2 bg-slate-900 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">كود التحقق</span>
                  <span className="font-mono font-bold text-emerald-400">{coupon.couponCode}</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">نوع الحجز</span>
                  <span className="font-semibold">{serviceType === 'home_visit' ? 'سحب منزلي 🏠' : 'حجز فرع 🏥'}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                <span>الموعد المفضل: {preferredTime}</span>
                {address && <span> · العنوان: {address}</span>}
              </div>
            </div>

            {/* Direct WhatsApp Callout */}
            <div className="space-y-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950 transition-transform active:scale-98"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال التذكرة وحجز الموعد عبر واتساب المعمل فوراً</span>
              </a>

              <button
                onClick={handleCopyTicket}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم نسخ نص التذكرة بنجاح!' : 'نسخ نص التذكرة للواتساب يدائياً'}</span>
              </button>
            </div>

            {/* Lab Confirmation Template Preview */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-right">
              <span className="text-[10px] text-amber-400 font-bold block mb-1">
                رسالة التأكيد التي يستلمها المريض من المعمل:
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                «أهلاً بك يا {patientName} في معامل RT! تم تأكيد وتفعيل جائزتك: {coupon.title} بكود {coupon.couponCode}، ورصيد نقاطك {player.points} نقطة. تم اعتماد طلبك ({serviceType === 'home_visit' ? 'سحب عينة منزلي' : 'زيارة الفرع'}). نسعد دائماً بخدمتكم!»
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
