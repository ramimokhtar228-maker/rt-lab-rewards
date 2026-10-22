import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageCircle, Sparkles, Users, Gift } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

interface InviteShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAwardBonusPoints: (amount: number) => void;
  labName: string;
  whatsappNumber?: string;
  hotlineNumber?: string;
}

export const InviteShareModal: React.FC<InviteShareModalProps> = ({
  isOpen,
  onClose,
  onAwardBonusPoints,
  labName,
  whatsappNumber = '201100874444',
  hotlineNumber = '01100046841',
}) => {
  const [copied, setCopied] = useState(false);
  const [bonusClaimed, setBonusClaimed] = useState(false);

  if (!isOpen) return null;

  // Generate Smart Verified Lab Link that overrides stale caches on patient phones
  const cleanWa = whatsappNumber.replace(/\D/g, '') || '201100874444';
  const cleanHotline = hotlineNumber.replace(/\D/g, '') || '01100046841';

  let baseUrl = '';
  if (typeof window !== 'undefined') {
    const origin = window.location.origin || `${window.location.protocol}//${window.location.host}`;
    baseUrl = `${origin}${window.location.pathname}`.replace(/\/$/, '');
  }

  // Smart URL with verified lab phone numbers and cache-busting timestamp
  const smartUrl = `${baseUrl}/?wa=${cleanWa}&hotline=${cleanHotline}&v=3.3`;

  const shareText = `🎉 بدعوك تشارك في تحدي ومكافآت ${labName}!
💡 جاوب على أسئلة الذكاء والمعلومات الطبية، دَوّر عجلة الحظ، واكسب تحاليل مجانية وفحوصات وخصومات حقيقية!
📞 تواصل مباشر مع المعمل: ${hotlineNumber} | واتساب: ${whatsappNumber}

ادخل والعب من الرابط الذكي المعتمد ده واكسب فوراً:
${smartUrl}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(smartUrl);
    setCopied(true);
    soundManager.playSuccess();
    if (!bonusClaimed) {
      setBonusClaimed(true);
      onAwardBonusPoints(50);
      triggerConfetti();
    }
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyFullMessage = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    soundManager.playSuccess();
    if (!bonusClaimed) {
      setBonusClaimed(true);
      onAwardBonusPoints(50);
      triggerConfetti();
    }
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden text-right">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Users className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">دعوة صديق ومشاركة الرابط</h3>
              <p className="text-xs text-emerald-100">شارك التحدي واكسب 50 نقطة فورية!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <span className="text-[11px] text-slate-400 block font-semibold">نص الرسالة الجاهزة للإرسال:</span>
            <p className="text-xs text-slate-200 leading-relaxed line-clamp-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              {shareText}
            </p>
          </div>

          {bonusClaimed && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-bold text-center flex items-center justify-center gap-2">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>مبروك! حصلت على 50 نقطة مكافأة لمشاركة الرابط 🎉</span>
            </div>
          )}

          <div className="space-y-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (!bonusClaimed) {
                  setBonusClaimed(true);
                  onAwardBonusPoints(50);
                  triggerConfetti();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950 transition-transform active:scale-98"
            >
              <MessageCircle className="w-4 h-4" />
              <span>إرسال ومشاركة عبر واتساب فوراً</span>
            </a>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold transition-colors border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم نسخ الرابط!' : 'نسخ الرابط فقط'}</span>
              </button>

              <button
                onClick={handleCopyFullMessage}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-slate-700"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>نسخ الرسالة كاملة</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
