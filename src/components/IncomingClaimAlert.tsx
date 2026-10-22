/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BellRing,
  X,
  Phone,
  MessageCircle,
  Copy,
  Check,
  User,
  MapPin,
  Clock,
  Gift,
  ShieldAlert,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { PrizeClaimBooking, LabSettings } from '../types';
import { alertSoundManager } from '../utils/audioAlert';
import { formatWhatsAppNumber } from '../utils/storage';

interface IncomingClaimAlertProps {
  claim: PrizeClaimBooking | null;
  settings: LabSettings;
  onDismiss: () => void;
  onViewInAdmin?: () => void;
}

export const IncomingClaimAlert: React.FC<IncomingClaimAlertProps> = ({
  claim,
  settings,
  onDismiss,
  onViewInAdmin,
}) => {
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  if (!claim) return null;

  const labWa = formatWhatsAppNumber(settings.whatsappNumber);
  const collectorWa = claim.collectorWhatsApp
    ? formatWhatsAppNumber(claim.collectorWhatsApp)
    : labWa;
  const patientWa = formatWhatsAppNumber(claim.patientPhone);

  // Message for Collector
  const collectorMsg = `*🚨 تكليف حالة وسحب عينة - ${settings.labName}* 🩺
---------------------------------------
👨‍⚕️ *فني السحب / الجامع المسؤول:* ${claim.collectorName || 'فريق التمريض السريع'}
👤 *اسم المريض:* ${claim.patientName}
📱 *هاتف المريض:* ${claim.patientPhone}
📍 *العنوان:* ${claim.address}
⏰ *الميعاد المفضل:* ${claim.preferredTime}
🎁 *الجائزة أو الفحص:* ${claim.prizeTitle} (${claim.prizeValue})
🔢 *كود الكوبون المعتمد:* [${claim.couponCode}]
⭐ *رصيد النقاط:* ${claim.points} نقطة
---------------------------------------
يرجى سرعة التواصل مع المريض وتأكيد الموعد الطبي للسحب. شكراً لجهودكم! 💚`;

  // Message for Official Lab Record
  const labMsg = `*🔔 إشعار حجز جائزة ومريض جديد - ${settings.labName}* 🩺
---------------------------------------
👤 *المريض:* ${claim.patientName}
📱 *الهاتف:* ${claim.patientPhone}
👨‍⚕️ *الجامع المختار:* ${claim.collectorName || 'غير محدد'} (${claim.collectorPhone || ''})
📍 *الخدمة:* ${claim.serviceType === 'home_visit' ? 'سحب منزلي 🏠' : 'حضور للفرع 🏥'}
📌 *العنوان:* ${claim.address}
⏰ *الميعاد:* ${claim.preferredTime}
🎁 *الجائزة:* ${claim.prizeTitle} - ${claim.prizeValue}
🔢 *كود:* ${claim.couponCode}
---------------------------------------
تم الحفظ والتزامن المباشر بين الأجهزة بنجاح ✅`;

  const collectorUrl = `https://wa.me/${collectorWa}?text=${encodeURIComponent(collectorMsg)}`;
  const labUrl = `https://wa.me/${labWa}?text=${encodeURIComponent(labMsg)}`;
  const patientUrl = `https://wa.me/${patientWa}?text=${encodeURIComponent(
    `أهلاً بك يا أستاذ/ة ${claim.patientName} في ${settings.labName}! تم اعتماد طلب حجز جائزتك (${claim.prizeTitle}) بنجاح، وتم تكليف أخصائي السحب: ${claim.collectorName || 'فريق التمريض'} بالتواصل معك لتأكيد الموعد 💚`
  )}`;

  const handleCopyTicket = () => {
    navigator.clipboard.writeText(collectorMsg);
    setCopied(true);
    alertSoundManager.playSuccessChime();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReplayTone = () => {
    alertSoundManager.playIncomingAlert();
  };

  return (
    <div className="fixed top-3 inset-x-3 sm:top-5 sm:inset-x-auto sm:right-5 sm:w-[480px] z-[999] animate-in slide-in-from-top-4 duration-300">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/25 p-4 text-white">
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 animate-bounce">
              <BellRing className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-white">تنبيه حجز مريض وجامع جديد!</h4>
                <span className="text-[10px] bg-red-500/20 text-red-300 font-bold px-2 py-0.5 rounded-full border border-red-500/30">
                  تزامن فوري ⚡
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/80">وصل إشعار الحجز وسمّع على هذا الجهاز الآن</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleReplayTone}
              title="إعادة سماع التنبيه"
              className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="py-3 space-y-2.5 text-xs">
          {/* Patient Row */}
          <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">المريض:</span>
                <span className="font-bold text-white text-sm">{claim.patientName}</span>
              </div>
            </div>
            <a
              href={`tel:${claim.patientPhone}`}
              className="flex items-center gap-1 text-[11px] bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 px-2 py-1 rounded-lg hover:bg-emerald-600/30 font-semibold"
            >
              <Phone className="w-3 h-3" />
              <span>{claim.patientPhone}</span>
            </a>
          </div>

          {/* Assigned Collector */}
          <div className="bg-gradient-to-r from-amber-950/40 to-slate-950/60 p-2.5 rounded-xl border border-amber-500/30">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-300 font-bold block">فني السحب (الجامع) المختار:</span>
                <span className="font-extrabold text-amber-100 text-sm">
                  {claim.collectorName || 'فريق التمريض السريع'}
                </span>
                {claim.collectorPhone && (
                  <span className="text-[11px] text-amber-300/80 block mt-0.5">
                    هاتف: {claim.collectorPhone}
                  </span>
                )}
              </div>
              <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-lg border border-amber-500/30">
                {claim.serviceType === 'home_visit' ? 'سحب منزلي 🏠' : 'فرع المعمل 🏥'}
              </span>
            </div>
          </div>

          {/* Prize and Location */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Gift className="w-3 h-3 text-emerald-400" />
                الجائزة / الكوبون:
              </span>
              <p className="font-bold text-emerald-300 truncate mt-0.5">{claim.prizeTitle}</p>
            </div>
            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                العنوان:
              </span>
              <p className="font-bold text-slate-200 truncate mt-0.5">{claim.address}</p>
            </div>
          </div>
        </div>

        {/* Action WhatsApp & Direct Buttons */}
        <div className="space-y-2 pt-1 border-t border-emerald-900/40">
          <div className="grid grid-cols-2 gap-2">
            {/* WhatsApp to Collector */}
            <a
              href={collectorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 transition-all hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span className="truncate">واتساب الجامع 🩺</span>
            </a>

            {/* WhatsApp to Patient */}
            <a
              href={patientUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span className="truncate">واتساب المريض 💬</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTicket}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ التذكرة الطبية'}</span>
            </button>

            {onViewInAdmin && (
              <button
                onClick={() => {
                  onViewInAdmin();
                  onDismiss();
                }}
                className="py-1.5 px-3 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 text-xs font-bold transition-colors"
              >
                فتح السجل
              </button>
            )}

            <button
              onClick={onDismiss}
              className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-colors"
            >
              تم
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
