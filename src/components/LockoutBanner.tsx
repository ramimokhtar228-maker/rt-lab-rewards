import React from 'react';
import { Clock, ExternalLink, Gift, MessageCircle, ShieldAlert } from 'lucide-react';
import { LabSettings, PatientClaim } from '../types';
import { buildWhatsAppUrl } from '../services/storageService';

interface LockoutBannerProps {
  remainingTimeFormatted: string;
  lastClaim?: PatientClaim | null;
  settings: LabSettings;
}

export const LockoutBanner: React.FC<LockoutBannerProps> = ({
  remainingTimeFormatted,
  lastClaim,
  settings,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4">
      <div className="bg-gradient-to-r from-amber-500 via-rose-600 to-[#8B1E2D] rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-rose-950/20 text-right">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-2 text-center md:text-right">
            <div className="inline-flex items-center gap-1.5 bg-black/20 rounded-full px-3 py-1 text-xs font-bold text-amber-200">
              <Clock className="h-3.5 w-3.5 text-amber-300 animate-spin" />
              <span>قاعدة 24 ساعة بين المحاولات</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black">
              لقد شاركت بالفعل ولديك كوبون نشط! 🎁
            </h3>

            <p className="text-xs sm:text-sm text-amber-100 max-w-lg leading-relaxed">
              وفقاً للائحة معامل رامي مختار، يحق لكل مريض المشاركة مرة واحدة كل 24 ساعة لإتاحة الفرصة للجميع.
            </p>
          </div>

          {/* Countdown & Action */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0 w-full md:w-auto">
            <span className="text-[11px] text-amber-200 block font-semibold mb-1">
              الوقت المتبقي للمشاركة القادمة:
            </span>
            <div className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-amber-300 dir-ltr">
              {remainingTimeFormatted}
            </div>

            {lastClaim && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <span className="text-[11px] text-white block">
                  كود كوبونك الحالي: <strong className="font-mono text-amber-300">{lastClaim.couponCode}</strong>
                </span>
                <a
                  href={buildWhatsAppUrl(settings.whatsappNumber, lastClaim, settings.labNameAr, settings.sloganAr)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>تأكيد الحجز بالواتساب الآن</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
