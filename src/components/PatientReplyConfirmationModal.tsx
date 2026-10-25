import React, { useState, useEffect } from 'react';
import {
  X,
  MessageCircle,
  Copy,
  Check,
  Calendar,
  Clock,
  Phone,
  User,
  Home,
  Building,
  MapPin,
  Sparkles,
  ShieldCheck,
  Send,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { PrizeClaimBooking, LabSettings } from '../types';
import { soundManager } from '../utils/audio';
import { formatWhatsAppNumber } from '../utils/storage';
import { broadcastClaimToCloud } from '../utils/cloudSync';

interface PatientReplyConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: PrizeClaimBooking | null;
  settings: LabSettings;
  onConfirmAndSave: (updatedClaim: PrizeClaimBooking) => void;
}

export const PatientReplyConfirmationModal: React.FC<PatientReplyConfirmationModalProps> = ({
  isOpen,
  onClose,
  claim,
  settings,
  onConfirmAndSave,
}) => {
  if (!isOpen || !claim) return null;

  // Editable Form States
  const [patientName, setPatientName] = useState(claim.patientName || '');
  const [patientPhone, setPatientPhone] = useState(claim.patientPhone || '');
  const [serviceType, setServiceType] = useState<'home_visit' | 'branch_visit'>(claim.serviceType || 'home_visit');
  const [address, setAddress] = useState(claim.address || '');
  const [selectedBranch, setSelectedBranch] = useState(
    claim.selectedBranch || settings.branches?.[0]?.name || 'فرع بهتيم - شبرا الخيمة (برج صيدلية العزبي)'
  );

  // Appointment Date & Time Slots ("أول يوم والوقت")
  const [appointmentDate, setAppointmentDate] = useState(
    claim.confirmedAppointment?.date || claim.appointmentDate || 'غداً'
  );
  const [appointmentTime, setAppointmentTime] = useState(
    claim.confirmedAppointment?.time || claim.preferredTime || 'صباحاً (08:30 ص - 10:30 ص)'
  );
  const [assignedSpecialist, setAssignedSpecialist] = useState(
    claim.confirmedAppointment?.confirmedBy || 'أخصائي السحب المنزلي - معامل RT'
  );

  // Instructions & Medical Prep Notes
  const [adminNotes, setAdminNotes] = useState(
    claim.confirmedAppointment?.adminNotes ||
      'تم تأكيد الموعد رسمياً. يرجى الصيام من 8 إلى 12 ساعة (شرب الماء فقط مسموح)، وسيتصل الأخصائي هاتفياً قبل الحضور بـ 15 دقيقة.'
  );

  // Full Response Message text (Live Editable)
  const [replyMessage, setReplyMessage] = useState('');
  const [isManuallyEdited, setIsManuallyEdited] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);

  // Generate dynamic message from current state
  const buildDefaultReplyMessage = (
    name: string,
    date: string,
    time: string,
    type: 'home_visit' | 'branch_visit',
    addr: string,
    branch: string,
    spec: string,
    notes: string
  ) => {
    return `*تأكيد حجز وموعد استلام الجائزة - ${settings.labName}* 🩺🎉
----------------------------------------
أهلاً بك يا أستاذ/ة *${name}*،

يسعدنا إبلاغكم بأنه تم مراجعة واعتماد طلبكم رسمياً وتأكيد أول يوم وتوقيت الموعد:
🎁 *الجائزة المستحقة:* ${claim.prizeTitle} (${claim.prizeValue})
🔢 *كود التحقق المعتمد:* [${claim.couponCode}]

📅 *تاريخ أول يوم للموعد:* ${date}
⏰ *التوقيت المحدد للحضور / السحب:* ${time}
📍 *طريقة ومكان الخدمة:* ${type === 'home_visit' ? 'سحب عينة منزلي مجهز 🏠' : 'زيارة فرع المعمل 🏥'}
${type === 'home_visit' ? `📌 *العنوان المسجل:* ${addr || 'العنوان المسجل لدى المعمل'}\n` : `🏥 *الفرع المعتمد:* ${branch}\n`}
📝 *تعليمات المعمل للمريض:*
${notes}

👨‍⚕️ *المسؤول المكلف بالمتابعة:* ${spec}
📞 *لأي استفسار أو تعديل إضافي:*
واتساب: ${settings.whatsappNumber} | الخط الساخن: ${settings.hotlineNumber}
----------------------------------------
فريق معامل RT يسعد دائماً بخدمتكم ونتمنى لكم دوام الصحة والعافية 💚`;
  };

  // Re-sync initial values when claim changes
  useEffect(() => {
    if (claim) {
      const initialDate = claim.confirmedAppointment?.date || claim.appointmentDate || 'غداً';
      const initialTime = claim.confirmedAppointment?.time || claim.preferredTime || 'صباحاً (08:30 ص - 10:30 ص)';
      const initialSpec = claim.confirmedAppointment?.confirmedBy || 'أخصائي السحب المنزلي - معامل RT';
      const initialNotes =
        claim.confirmedAppointment?.adminNotes ||
        'تم تأكيد الموعد رسمياً. يرجى الصيام من 8 إلى 12 ساعة (شرب الماء فقط مسموح)، وسيتصل الأخصائي هاتفياً قبل الحضور بـ 15 دقيقة.';

      setPatientName(claim.patientName || '');
      setPatientPhone(claim.patientPhone || '');
      setServiceType(claim.serviceType || 'home_visit');
      setAddress(claim.address || '');
      setSelectedBranch(
        claim.selectedBranch || settings.branches?.[0]?.name || 'فرع بهتيم - شبرا الخيمة (برج صيدلية العزبي)'
      );
      setAppointmentDate(initialDate);
      setAppointmentTime(initialTime);
      setAssignedSpecialist(initialSpec);
      setAdminNotes(initialNotes);
      setIsManuallyEdited(false);
      setIsSavedSuccessfully(false);

      if (claim.confirmedAppointment?.replyMessageSent) {
        setReplyMessage(claim.confirmedAppointment.replyMessageSent);
        setIsManuallyEdited(true);
      } else {
        setReplyMessage(
          buildDefaultReplyMessage(
            claim.patientName,
            initialDate,
            initialTime,
            claim.serviceType || 'home_visit',
            claim.address || '',
            claim.selectedBranch || 'فرع بهتيم',
            initialSpec,
            initialNotes
          )
        );
      }
    }
  }, [claim]);

  // Auto-update message when individual inputs change (unless user manually customized whole text)
  const handleFieldChange = (field: string, value: string) => {
    let nextName = patientName;
    let nextDate = appointmentDate;
    let nextTime = appointmentTime;
    let nextType = serviceType;
    let nextAddr = address;
    let nextBranch = selectedBranch;
    let nextSpec = assignedSpecialist;
    let nextNotes = adminNotes;

    if (field === 'name') {
      setPatientName(value);
      nextName = value;
    } else if (field === 'date') {
      setAppointmentDate(value);
      nextDate = value;
    } else if (field === 'time') {
      setAppointmentTime(value);
      nextTime = value;
    } else if (field === 'serviceType') {
      const type = value as 'home_visit' | 'branch_visit';
      setServiceType(type);
      nextType = type;
    } else if (field === 'address') {
      setAddress(value);
      nextAddr = value;
    } else if (field === 'branch') {
      setSelectedBranch(value);
      nextBranch = value;
    } else if (field === 'specialist') {
      setAssignedSpecialist(value);
      nextSpec = value;
    } else if (field === 'notes') {
      setAdminNotes(value);
      nextNotes = value;
    }

    if (!isManuallyEdited) {
      setReplyMessage(
        buildDefaultReplyMessage(nextName, nextDate, nextTime, nextType, nextAddr, nextBranch, nextSpec, nextNotes)
      );
    }
  };

  // Quick Preset Handlers
  const handleQuickDate = (presetText: string) => {
    handleFieldChange('date', presetText);
  };

  const handleQuickTime = (presetTime: string) => {
    handleFieldChange('time', presetTime);
  };

  const handleAddPrepNote = (noteText: string) => {
    const updated = adminNotes.includes(noteText)
      ? adminNotes
      : adminNotes.trim() + (adminNotes.trim() ? '\n• ' : '• ') + noteText;
    handleFieldChange('notes', updated);
  };

  const handleResetToTemplate = () => {
    setIsManuallyEdited(false);
    setReplyMessage(
      buildDefaultReplyMessage(
        patientName,
        appointmentDate,
        appointmentTime,
        serviceType,
        address,
        selectedBranch,
        assignedSpecialist,
        adminNotes
      )
    );
    soundManager.playSuccess();
  };

  // Save changes to storage and cloud sync
  const handleSaveAndConfirm = () => {
    const updatedClaim: PrizeClaimBooking = {
      ...claim,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      appointmentDate,
      preferredTime: appointmentTime,
      serviceType,
      address: serviceType === 'home_visit' ? address.trim() : undefined,
      selectedBranch: serviceType === 'branch_visit' ? selectedBranch : undefined,
      status: 'confirmed',
      confirmedAppointment: {
        date: appointmentDate,
        time: appointmentTime,
        confirmedBy: assignedSpecialist,
        adminNotes,
        confirmedAt: new Date().toLocaleDateString('ar-EG'),
        replyMessageSent: replyMessage,
      },
    };

    onConfirmAndSave(updatedClaim);
    broadcastClaimToCloud(updatedClaim).catch(() => {});
    soundManager.playSuccess();
    setIsSavedSuccessfully(true);
    setTimeout(() => setIsSavedSuccessfully(false), 3000);
  };

  // WhatsApp Send Action
  const cleanPhone = formatWhatsAppNumber(patientPhone);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(replyMessage)}`;

  const handleOpenWhatsApp = () => {
    handleSaveAndConfirm();
    window.open(whatsappUrl, '_blank');
  };

  // SMS Action
  const handleOpenSMS = () => {
    handleSaveAndConfirm();
    window.open(`sms:${patientPhone}?body=${encodeURIComponent(replyMessage)}`, '_blank');
  };

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(replyMessage);
    setCopied(true);
    soundManager.playSuccess();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-emerald-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-right max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-5 py-4 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  رسالة الرد وتأكيد موعد المريض (أول يوم والوقت)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                  مع إمكانية التعديل ✏️
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                المريض: <strong className="text-white">{patientName}</strong> ({patientPhone}) · كود:{' '}
                <span className="font-mono text-amber-200">{claim.couponCode}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar">
          {/* 1. Patient Original Request Summary */}
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-amber-400 font-extrabold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>الجائزة المستحقة: {claim.prizeTitle}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-black">
                {claim.prizeValue}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
              <div>
                <span className="text-slate-400">طريقة الخدمة المطلوبة: </span>
                <strong className="text-white">
                  {claim.serviceType === 'home_visit' ? 'سحب منزلي 🏠' : 'زيارة الفرع 🏥'}
                </strong>
                {claim.address && <span className="text-slate-300"> ({claim.address})</span>}
              </div>
              <div>
                <span className="text-slate-400">طلب المريض المبدئي: </span>
                <span className="text-amber-200 font-medium">{claim.appointmentDate}</span>
                <span className="text-slate-400"> · </span>
                <span className="text-teal-200 font-medium">{claim.preferredTime}</span>
              </div>
            </div>
            {claim.patientNotes && (
              <div className="p-2 rounded-xl bg-slate-900 border border-amber-500/20 text-amber-200 text-[11px]">
                📝 <strong>ملاحظات المريض:</strong> {claim.patientNotes}
              </div>
            )}
          </div>

          {/* 2. Interactive Edit Controls Section */}
          <div className="space-y-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>تعديل تفاصيل الحجز، تاريخ أول يوم، والتوقيت المحدد:</span>
              </h4>
              <span className="text-[11px] text-slate-400">يتم تحديث نص الرسالة تلقائياً</span>
            </div>

            {/* Date Selection: "أول يوم" */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-200 font-bold block">
                  تاريخ أول يوم للموعد (تعديل مباشر): *
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">خيارات سريعة:</span>
                  {['اليوم', 'غداً', 'بعد غد', 'السبت القادم', 'الأحد القادم'].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleQuickDate(day)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                        appointmentDate.includes(day)
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={appointmentDate}
                onChange={(e) => handleFieldChange('date', e.target.value)}
                placeholder="مثال: غداً الأحد 26 أكتوبر 2026..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            {/* Time Slot Selection: "الوقت" */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-200 font-bold block">
                  توقيت الحضور / السحب المؤكد (تعديل مباشر): *
                </label>
                <span className="text-[10px] text-amber-300 font-medium">اختر فترتك أو اكتبها</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { label: 'صباحاً (08:30 - 10:30 ص)', val: 'الفترة الصباحية المبكرة (08:30 ص - 10:30 ص) ⭐ [صيام]' },
                  { label: 'ظهراً (11:00 - 02:00 م)', val: 'فترة الظهيرة (11:00 ص - 02:00 م)' },
                  { label: 'عصراً (03:00 - 05:30 م)', val: 'فترة العصر (03:00 م - 05:30 م)' },
                  { label: 'مساءً (06:30 - 10:00 م)', val: 'الفترة المسائية (06:30 م - 10:00 م)' },
                ].map((slot) => (
                  <button
                    key={slot.label}
                    type="button"
                    onClick={() => handleQuickTime(slot.val)}
                    className={`p-1.5 rounded-lg text-[10px] font-bold text-center border transition-all ${
                      appointmentTime === slot.val
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={appointmentTime}
                onChange={(e) => handleFieldChange('time', e.target.value)}
                placeholder="مثال: الساعة 09:30 صباحاً، أو بين 4 و 5 عصراً..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            {/* Service Type & Location Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold block">نوع ومكان تقديم الخدمة:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleFieldChange('serviceType', 'home_visit')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      serviceType === 'home_visit'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>سحب منزلي 🏠</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('serviceType', 'branch_visit')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      serviceType === 'branch_visit'
                        ? 'bg-teal-600 text-white border-teal-500 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>زيارة الفرع 🏥</span>
                  </button>
                </div>
              </div>

              {/* Address or Branch */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold block">
                  {serviceType === 'home_visit' ? 'عنوان السحب المنزلي:' : 'فرع المعمل المعتمد:'}
                </label>
                {serviceType === 'home_visit' ? (
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    placeholder="الشارع، رقم العمارة، الشقة، المنطقة..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                ) : (
                  <select
                    value={selectedBranch}
                    onChange={(e) => handleFieldChange('branch', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {settings.branches && settings.branches.length > 0 ? (
                      settings.branches.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="فرع شبرا الخيمة - بهتيم (برج صيدلية العزبي)">
                          فرع شبرا الخيمة - بهتيم (برج صيدلية العزبي)
                        </option>
                        <option value="الفرع الرئيسي - شارع ترعة الشابوري">
                          الفرع الرئيسي - شارع ترعة الشابوري
                        </option>
                      </>
                    )}
                  </select>
                )}
              </div>
            </div>

            {/* Specialist & Staff in Charge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold block">
                  المسؤول المتابع / فني السحب المكلف:
                </label>
                <select
                  value={assignedSpecialist}
                  onChange={(e) => handleFieldChange('specialist', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="أ. آية أحمد (مسؤولة التنسيق وفنية سحب عينات)">
                    أ. آية أحمد (مسؤولة التنسيق وفنية سحب عينات)
                  </option>
                  <option value="ك. منى أحمد (أخصائية تحاليل وسحب عينات)">
                    ك. منى أحمد (أخصائية تحاليل وسحب عينات)
                  </option>
                  <option value="فريق التمريض السريع (طوارئ سحب منزلي 24 ساعة)">
                    فريق التمريض السريع (طوارئ سحب منزلي 24 ساعة)
                  </option>
                  <option value="د. رامي مختار (طبيب واستشاري المعمل)">
                    د. رامي مختار (طبيب واستشاري المعمل)
                  </option>
                  <option value="أخصائي السحب المنزلي - معامل RT">
                    أخصائي السحب المنزلي - معامل RT
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold block">رقم هاتف المريض المعتمد:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono text-left"
                    dir="ltr"
                  />
                  <a
                    href={`tel:${patientPhone}`}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-emerald-400 shrink-0"
                    title="اتصال هاتفي مباشر"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Medical Instructions / Prep Notes */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <label className="text-xs text-slate-300 font-bold block">
                  تعليمات وإرشادات المعمل للمريض (صيام، تحضيرات):
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">إضافة سريعة:</span>
                  {[
                    'صيام 8-12 ساعة (شرب الماء مسموح)',
                    'لا يشترط الصيام',
                    'تناول الأدوية في مواعيدها',
                    'سيتصل الأخصائي قبل الوصول بـ 15 دقيقة',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleAddPrepNote(chip)}
                      className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800 hover:bg-slate-700 text-teal-300 font-medium"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                placeholder="تعليمات الصيام، شرب المياه، إحضار التحاليل السابقة..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>
          </div>

          {/* 3. Live Editable Reply Message Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-amber-400" />
                  <span>نص رسالة الرد المباشرة للمريض (قابلة للتعديل والتحرير الكامل):</span>
                </label>
                {isManuallyEdited && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] bg-amber-500/20 text-amber-300 font-bold">
                    تم التعديل يدوياً
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleResetToTemplate}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                title="إعادة ضبط النص حسب الخيارات أعلاه"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إعادة توليد الرسالة</span>
              </button>
            </div>
            <textarea
              rows={8}
              value={replyMessage}
              onChange={(e) => {
                setReplyMessage(e.target.value);
                setIsManuallyEdited(true);
              }}
              className="w-full bg-slate-950 border border-emerald-500/40 rounded-2xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 leading-relaxed font-sans shadow-inner"
              placeholder="اكتب أو عدل نص الرسالة التي ستصل للمريض..."
            />
          </div>

          {/* Success Banner if saved */}
          {isSavedSuccessfully && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                تم حفظ واعتماد تفاصيل الموعد بنجاح ومزامنته مع سجل المواعيد والنظام السحابي!
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم نسخ الرسالة!' : 'نسخ الرسالة'}</span>
            </button>
            <button
              type="button"
              onClick={handleOpenSMS}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold transition-colors"
            >
              <span>رسالة SMS 💬</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAndConfirm}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-xs font-bold transition-colors"
            >
              <span>حفظ التعديلات 💾</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-950 transition-all active:scale-98"
          >
            <MessageCircle className="w-4 h-4" />
            <span>إرسال رد الواتساب للمريض وتأكيد الموعد فوراً 💬✅</span>
          </button>
        </div>
      </div>
    </div>
  );
};
