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
import { formatWhatsAppNumber } from '../utils/storage';
import { broadcastClaimToCloud } from '../utils/cloudSync';

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
  const [selectedBranch, setSelectedBranch] = useState('فرع شبرا الخيمة - بهتيم (برج صيدلية العزبي)');
  
  // Date & Time Scheduling
  const [appointmentDateType, setAppointmentDateType] = useState<'today' | 'tomorrow' | 'after_tomorrow' | 'custom'>('tomorrow');
  const [customDate, setCustomDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('morning');
  const [customTime, setCustomTime] = useState('');
  const [patientNotes, setPatientNotes] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      if (player.name && player.name !== 'عميل معامل RT') setPatientName(player.name);
      if (player.phone) setPatientPhone(player.phone);
      
      // Default custom date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setCustomDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [isOpen, player]);

  if (!isOpen || !coupon) return null;

  const cleanLabPhone = formatWhatsAppNumber(settings.whatsappNumber);

  // Computed Date Label
  const getSelectedDateLabel = () => {
    const today = new Date();
    if (appointmentDateType === 'today') {
      return `اليوم (${today.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'numeric' })})`;
    }
    if (appointmentDateType === 'tomorrow') {
      const tom = new Date(today);
      tom.setDate(tom.getDate() + 1);
      return `غداً (${tom.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'numeric' })})`;
    }
    if (appointmentDateType === 'after_tomorrow') {
      const afterTom = new Date(today);
      afterTom.setDate(afterTom.getDate() + 2);
      return `بعد غد (${afterTom.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'numeric' })})`;
    }
    return customDate || 'تاريخ مخصص يحدده المعمل';
  };

  // Computed Time Label
  const getSelectedTimeLabel = () => {
    if (timeSlot === 'morning') return 'الفترة الصباحية المبكرة (08:00 ص - 10:30 ص) ⭐ [مثالية لتحاليل الصيام]';
    if (timeSlot === 'noon') return 'فترة الظهيرة (11:00 ص - 02:00 م)';
    if (timeSlot === 'afternoon') return 'فترة العصر (02:00 م - 05:30 م)';
    if (timeSlot === 'evening') return 'الفترة المسائية (06:00 م - 10:00 م)';
    return customTime ? `توقيت مخصص: ${customTime}` : 'في أي وقت متاح';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) {
      alert('برجاء كتابة الاسم ورقم الهاتف لإتمام تسجيل الجائزة.');
      return;
    }

    // Save profile
    onSavePlayer({
      name: patientName.trim(),
      phone: patientPhone.trim(),
    });

    const finalDate = getSelectedDateLabel();
    const finalTime = getSelectedTimeLabel();

    // Prepare claim data
    const claimData: PrizeClaimBooking = {
      id: `claim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      address: serviceType === 'home_visit' ? address.trim() || 'العنوان يحدد مع الأخصائي' : selectedBranch,
      serviceType,
      selectedBranch: serviceType === 'branch_visit' ? selectedBranch : undefined,
      appointmentDate: finalDate,
      preferredTime: finalTime,
      patientNotes: patientNotes.trim() || undefined,
      couponCode: coupon.couponCode,
      prizeTitle: coupon.title,
      prizeValue: coupon.value,
      points: player.points,
      status: 'pending',
      createdAt: new Date().toLocaleDateString('ar-EG'),
    };

    // Broadcast in real-time across devices so it chimes and logs on Dr. Rami's device immediately
    broadcastClaimToCloud(claimData).catch(() => {});

    // Save claim record
    onAddClaimBooking(claimData);

    soundManager.playFanfare();
    triggerConfetti();
    setStep('success');
  };

  const finalDate = getSelectedDateLabel();
  const finalTime = getSelectedTimeLabel();

  // WhatsApp Message
  const whatsappMessage = `*طلب حجز وتحديد موعد استلام جائزة في ${settings.labName}* 🩺🎉
---------------------------------------
👤 *اسم المريض:* ${patientName}
📱 *رقم الهاتف:* ${patientPhone}
🎁 *الجائزة المستحقة:* ${coupon.title}
🏷️ *القيمة / الخصم:* ${coupon.value}
🔢 *كود التحقق الإلكتروني:* [${coupon.couponCode}]
⭐ *رصيد النقاط الحالي:* ${player.points} نقطة
🏆 *التسجيل في دوري الأبطال:* تم التسجيل بنجاح ✅

📅 *تاريخ الموعد المطلوب:* ${finalDate}
⏰ *التوقيت المحدد للاستلام:* ${finalTime}
📍 *نوع الخدمة:* ${serviceType === 'home_visit' ? 'سحب عينة منزلي 🏠' : 'حجز فرع المعمل 🏥'}
${serviceType === 'home_visit' && address ? `📌 *عنوان السحب المنزلي:* ${address}\n` : ''}${serviceType === 'branch_visit' ? `🏥 *الفرع المختار:* ${selectedBranch}\n` : ''}${patientNotes ? `📝 *ملاحظات خاصة من المريض:* ${patientNotes}\n` : ''}---------------------------------------
برجاء اعتماد الموعد وتأكيده مع المريض رسمياً. شكراً لمعامل RT!`;

  const whatsappUrl = `https://wa.me/${cleanLabPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  const handleCopyTicket = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    soundManager.playSuccess();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden text-right">
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

            {/* Inputs */}
            <div className="space-y-4">
              {/* Patient Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold block">
                    اسم المريض الثلاثي: *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute right-3.5 top-3 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="مثال: محمد أحمد علي..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold block">
                    رقم الهاتف والواتساب: *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute right-3.5 top-3 text-slate-500 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="011XXXXXXXX"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-left"
                    />
                  </div>
                </div>
              </div>

              {/* Service Method Choice */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-semibold block">
                  مكان وطريقة استلام الجائزة أو إجراء التحليل:
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
                    <span className="text-xs font-bold">سحب عينة منزلي 🏠</span>
                    <span className="text-[10px] text-slate-400">أخصائي التحاليل في منزلك</span>
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
                    <span className="text-xs font-bold">زيارة الفرع 🏥</span>
                    <span className="text-[10px] text-slate-400">فروع معامل RT الرسمية</span>
                  </button>
                </div>
              </div>

              {/* Address (Home visit) or Branch Selection */}
              {serviceType === 'home_visit' ? (
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold block">
                    العنوان التفصيلي ومكان سحب العينة المنزلية: *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute right-3.5 top-3 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="المنطقة، الشارع، رقم العقار، الدور، الشقة، علامة مميزة..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold block">
                    اختر الفرع الأقرب لحضرتك:
                  </label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="فرع شبرا الخيمة - بهتيم (برج صيدلية العزبي الدور الثالث فوق جيم موسى)">
                      فرع شبرا الخيمة: ميدان بهتيم برج صيدلية العزبي الدور 3 (الرئيسي)
                    </option>
                    {settings.branches && settings.branches.map((b) => (
                      <option key={b.id} value={`${b.name} - ${b.address}`}>
                        {b.name} ({b.address})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* DATE SELECTION (تحديد اليوم / التاريخ) */}
              <div className="space-y-2 p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
                <label className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>تحديد تاريخ الموعد واستلام الجائزة:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'today', label: 'اليوم' },
                    { id: 'tomorrow', label: 'غداً' },
                    { id: 'after_tomorrow', label: 'بعد غد' },
                    { id: 'custom', label: 'يوم محدد 📅' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setAppointmentDateType(d.id as typeof appointmentDateType)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        appointmentDateType === d.id
                          ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-sm'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                {appointmentDateType === 'custom' && (
                  <div className="pt-1">
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                )}
                <div className="text-[11px] text-emerald-400 font-medium">
                  الموعد المختار: <strong>{getSelectedDateLabel()}</strong>
                </div>
              </div>

              {/* TIME SLOT SELECTION (تحديد التوقيت) */}
              <div className="space-y-2 p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
                <label className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>تحديد التوقيت المفضل للحضور أو السحب:</span>
                </label>
                <div className="space-y-1.5">
                  {[
                    { id: 'morning', label: '🌅 الفترة الصباحية المبكرة (08:00 ص - 10:30 ص) ⭐ [مثالية للصيام]' },
                    { id: 'noon', label: '☀️ فترة الظهيرة (11:00 ص - 02:00 م)' },
                    { id: 'afternoon', label: '🌇 بعد الظهر والعصر (02:00 م - 05:30 م)' },
                    { id: 'evening', label: '🌙 الفترة المسائية (06:00 م - 10:00 م)' },
                    { id: 'custom', label: '✍️ تحديد ساعة محددة يكتبها المريض' },
                  ].map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setTimeSlot(slot.id)}
                      className={`w-full text-right p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                        timeSlot === slot.id
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 shadow-sm'
                          : 'border-slate-800/80 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{slot.label}</span>
                      {timeSlot === slot.id && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </button>
                  ))}
                </div>

                {timeSlot === 'custom' && (
                  <div className="pt-1">
                    <input
                      type="text"
                      placeholder="مثال: الساعة 09:30 صباحاً، أو بين 4 و 5 عصراً..."
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Patient Notes */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold block">
                  ملاحظات أو استفسارات طبية خاصة (اختياري):
                </label>
                <textarea
                  rows={2}
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  placeholder="مثال: تحليل صائم، مريض سكر أو سيولة، أو رقم هاتف إضافي..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* League admission note */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2.5 text-xs text-amber-300">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                عند تأكيد الموعد سيتم حفظ طلبك وإرسال رنة تنبيه فورية للإدارة لتأكيد الموعد واعتماد الجائزة!
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-950 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>حفظ الموعد وتأكيد طلب استلام الجائزة</span>
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

              <div className="space-y-1.5 p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>تاريخ الموعد: <strong className="text-white">{finalDate}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-teal-300 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>توقيت الاستلام: <strong className="text-white">{finalTime}</strong></span>
                </div>
                <div>
                  <span className="text-slate-400">مكان الخدمة: </span>
                  <span className="text-white font-medium">{serviceType === 'home_visit' ? `سحب منزلي (${address || 'العنوان المسجل'})` : selectedBranch}</span>
                </div>
                {patientNotes && (
                  <div className="text-[10px] text-slate-400 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                    ملاحظاتك: {patientNotes}
                  </div>
                )}
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
