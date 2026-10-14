import React, { useState } from 'react';
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Gift,
  HelpCircle,
  Home,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { BookingDetails, LabSettings, PatientClaim } from '../types';
import {
  buildBookingConfirmationWhatsAppUrl,
  cleanEgyptianPhone,
  updateClaimStatus,
} from '../services/storageService';

interface AdminBookingConfirmModalProps {
  claim: PatientClaim;
  settings: LabSettings;
  onClose: () => void;
  onSuccess: (updatedClaim: PatientClaim) => void;
}

const PRESET_INSTRUCTIONS = [
  'صيام من 10 إلى 12 ساعة كاملة قبل سحب العينة (يسمح بشرب الماء فقط).',
  'صيام من 6 إلى 8 ساعات فقط (يسمح بالماء).',
  'لا يشترط الصيام، متاح إجراء التحليل في أي وقت.',
  'إحضار عينة بول في وعاء معقم في الصباح الباكر.',
  'الامتناع عن أدوية معينة بعد استشارة الطبيب المعالج.',
];

export const AdminBookingConfirmModal: React.FC<AdminBookingConfirmModalProps> = ({
  claim,
  settings,
  onClose,
  onSuccess,
}) => {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [selectedBranch, setSelectedBranch] = useState(
    claim.branch || settings.branches[0]?.name || 'الفرع الرئيسي (بهتيم - شبرا الخيمة)'
  );
  const [appointmentDate, setAppointmentDate] = useState(defaultDateStr);
  const [appointmentTime, setAppointmentTime] = useState('10:00 صباحاً');
  const [prepInstructions, setPrepInstructions] = useState(
    claim.prizeTitle.includes('شامل') || claim.prizeTitle.includes('سكر')
      ? PRESET_INSTRUCTIONS[0]
      : PRESET_INSTRUCTIONS[2]
  );
  const [isHomeVisit, setIsHomeVisit] = useState(
    claim.branch.includes('منزل') || claim.prizeTitle.includes('منزل')
  );
  const [adminNotes, setAdminNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bookingDetails: BookingDetails = {
    selectedBranch,
    appointmentDate,
    appointmentTime,
    prepInstructions,
    isHomeVisit,
    adminNotes: adminNotes.trim() || undefined,
    confirmedAt: new Date().toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }),
    whatsappSentAt: new Date().toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }),
  };

  const whatsappUrl = buildBookingConfirmationWhatsAppUrl(claim, settings, bookingDetails);

  const handleCopyMessage = () => {
    // Decode text from wa url
    try {
      const urlObj = new URL(whatsappUrl);
      const text = urlObj.searchParams.get('text') || '';
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSendAndConfirm = async () => {
    setIsSubmitting(true);
    // Update claim status to confirmed with booking details
    const updated = await updateClaimStatus(claim.id, 'confirmed', bookingDetails);
    const updatedItem = updated.find((c) => c.id === claim.id) || {
      ...claim,
      status: 'confirmed' as const,
      bookingDetails,
    };

    // Open WhatsApp directly in new window
    window.open(whatsappUrl, '_blank');

    setIsSubmitting(false);
    onSuccess(updatedItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 overflow-y-auto backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden my-4 border border-slate-200 max-h-[94vh] flex flex-col">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#8B1E2D] to-[#0F2B5C] p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <MessageCircle className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">تأكيد حجز المريض وإرسال رسالة الواتساب</h3>
              <p className="text-xs text-rose-100">
                إرسال رسالة التأكيد الرسمية برقم هاتف المريض ({claim.phone})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Patient & Prize Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-rose-100 text-[#8B1E2D] flex items-center justify-center font-bold text-sm shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{claim.patientName}</h4>
                  <span className="font-mono text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold dir-ltr">
                    {claim.phone}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
                  <span>الفرع المطلوب: {claim.branch}</span>
                  <span>•</span>
                  <span>تاريخ الفوز: {claim.createdAt}</span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                كود: {claim.couponCode}
              </span>
              <div className="text-xs font-black text-[#8B1E2D] mt-1">{claim.prizeTitle}</div>
            </div>
          </div>

          {/* Booking Inputs Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Branch Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                فرع تأكيد الزيارة والفحص
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value);
                  if (e.target.value.includes('منزل')) setIsHomeVisit(true);
                }}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-900 outline-none focus:border-[#8B1E2D] focus:ring-1 focus:ring-rose-500 font-medium"
              >
                {settings.branches.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Home Visit Toggle */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={isHomeVisit}
                  onChange={(e) => setIsHomeVisit(e.target.checked)}
                  className="rounded text-[#8B1E2D] focus:ring-[#8B1E2D] h-4 w-4"
                />
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Home className="h-4 w-4 text-[#8B1E2D]" />
                  تأكيد سحب العينات بالمنزل (زيارة منزلية)
                </span>
              </label>
            </div>

            {/* Appointment Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                تاريخ الموعد المقترح
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 pl-9 bg-white text-slate-900 outline-none focus:border-[#8B1E2D]"
                />
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Appointment Time */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                وقت الموعد التقديري
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="مثال: 10:00 صباحاً"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 pl-9 bg-white text-slate-900 outline-none focus:border-[#8B1E2D]"
                />
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Prep Instructions */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  تعليمات التحضير والصيام للمريض
                </label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setPrepInstructions(PRESET_INSTRUCTIONS[0])}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded"
                  >
                    صيام 12 ساعة
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrepInstructions(PRESET_INSTRUCTIONS[2])}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded"
                  >
                    بدون صيام
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={prepInstructions}
                onChange={(e) => setPrepInstructions(e.target.value)}
                placeholder="تعليمات الصيام أو تجهيز العينة..."
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-900 outline-none focus:border-[#8B1E2D]"
              />
            </div>

            {/* Staff Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ملاحظات إضافية للمريض (اختياري)
              </label>
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="مثال: يرجى التوجه لموظف الاستقبال أ/ محمد مباشرة..."
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-900 outline-none focus:border-[#8B1E2D]"
              />
            </div>
          </div>

          {/* Live Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                معاينة رسالة الواتساب التي سيتم إرسالها للمريض:
              </span>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-[11px] font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1 bg-slate-100 hover:bg-emerald-50 px-2.5 py-1 rounded transition"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ الرسالة'}</span>
              </button>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 sm:p-4 text-xs text-slate-800 leading-relaxed font-sans max-h-48 overflow-y-auto whitespace-pre-line shadow-inner">
              {`*${settings.labNameAr}* 🩺✨\n*${settings.sloganAr}*\n\nأهلاً بك أستاذ/ة: *${claim.patientName}* 🌸\nنبارك لحضرتك الفوز في مسابقات وجوائز معامل رامي مختار للتحاليل الطبية!\n\n🎁 *تفاصيل الجائزة المعتمدة:*\n• الجائزة: *${claim.prizeTitle}* (${claim.discountValue})\n• كود الكوبون: *${claim.couponCode}*\n• ينتهي في: *${claim.expiresAt}* (24 ساعة)\n\n📅 *تفاصيل تأكيد الحجز:*\n• الفرع: ${selectedBranch}\n• موعد الزيارة: *${appointmentDate} - الساعة ${appointmentTime}*\n${prepInstructions ? `• تعليمات التحضير: ⚠️ ${prepInstructions}\n` : ''}${adminNotes ? `• ملاحظات الاستقبال: ${adminNotes}\n` : ''}📍 *العنوان:* ${settings.branches.find((b) => b.name === selectedBranch)?.address || selectedBranch}\n📞 *الخط الساخن:* ${settings.hotline}\n💬 *واتساب المعمل:* ${settings.whatsappNumber}\n\nنتمنى لك وافر الصحة والعافية! ❤️`}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 bg-slate-50 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>سيتم تحويل حالة الكوبون إلى "تم تأكيد الحجز" وحفظ البيانات سحابياً</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={handleSendAndConfirm}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>إرسال التأكيد واتساب للمريض وتثبيت الحجز</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
