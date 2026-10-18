import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Sparkles,
  Users,
  Gift,
  Phone,
  Building,
  UserCheck,
  QrCode,
  Send,
  ExternalLink,
  ShieldCheck,
  Home,
} from 'lucide-react';
import { LabSettings, LabBranch } from '../types';
import { soundManager } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';
import { cleanWhatsAppNumber, formatPhoneDisplay, getWhatsAppUrl, isValidEgyptianMobile } from '../utils/phone';

interface InviteShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAwardBonusPoints: (amount: number) => void;
  labName: string;
  settings?: LabSettings;
}

export const InviteShareModal: React.FC<InviteShareModalProps> = ({
  isOpen,
  onClose,
  onAwardBonusPoints,
  labName,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'send_to_client' | 'general_share'>('send_to_client');
  const [clientPhone, setClientPhone] = useState('');
  const [clientName, setClientName] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState(settings?.branches?.[0]?.id || 'br_main');
  const [messageType, setMessageType] = useState<'rewards_invite' | 'home_visit' | 'results_followup'>('rewards_invite');
  const [copied, setCopied] = useState(false);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUrl =
    typeof window !== 'undefined'
      ? window.location.href.split('?')[0]
      : 'https://ramimokhtar228-maker.github.io/rt-lab-rewards/';

  const branches = settings?.branches || [];
  const chosenBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];
  const labHotline = settings?.hotlineNumber || '01021487889';
  const labWhatsApp = cleanWhatsAppNumber(chosenBranch?.whatsappNumber || settings?.whatsappNumber || '201021487889');

  // Build Personalized Client Message
  const buildClientMessage = (): string => {
    const greeting = clientName.trim()
      ? `أهلاً بك يا أستاذ/ة *${clientName.trim()}* في ${labName} 🩺`
      : `أهلاً بك عزيزنا العميل في ${labName} 🩺`;

    if (messageType === 'home_visit') {
      return `${greeting}

🚗 *يسر معامل RT تقديم خدمة سحب العينات والزيارات المنزلية المجهزة 24/7:*
يمكنك الآن طلب فريق التمريض وسحب العينات في منزلك بكل راحة وأمان في كافة مناطق القاهرة والجيزة.

🎁 *هدية خاصة:* شارك في المسابقات الطبية واكسب تحاليل مجانية وكوبونات خصم فورية عبر رابط منصتنا الإلكترونية:
🔗 ${currentUrl}

📍 *الفرع الأقرب:* ${chosenBranch ? chosenBranch.name : 'الفرع الرئيسي'}
📌 *العنوان:* ${chosenBranch ? chosenBranch.address : settings?.address || 'مدينة نصر - شارع الطيران'}
📞 *الخط الساخن والحجز:* ${labHotline}
💬 *واتساب المعمل المباشر:* https://wa.me/${labWhatsApp}

نتمنى لكم دوام الصحة والعافية دائماً 💚`;
    }

    if (messageType === 'results_followup') {
      return `${greeting}

📋 *منظومة نتائج ومكافآت معامل RT للتحاليل الطبية:*
نود الاطمئنان على صحتكم، ويسعدنا إهداؤكم إمكانية الاستفادة من برامج الفحص الدوري ومسابقات التحدي التفاعلية.

🎁 ادخل على الرابط والعب لكسب نقاط وتحاليل CBC وسكر مجانية:
🔗 ${currentUrl}

🏥 *فروعنا في خدمتكم:*
- الفرع الرئيسي (مدينة نصر): 01021487889
- فرع مصر الجديدة (روكسي): 01239876918
- فرع التجمع الخامس: 01099887766
- فرع الدقي والمهندسين: 01145678330

💬 *محادثة واتساب سريعة مع إدارة المعمل:* https://wa.me/${labWhatsApp}
صحتكم أمانة وغايتنا دائماً! 🌟`;
    }

    // Default: rewards_invite
    return `${greeting}

🎉 *دعوة خاصة وحصرية لتحدي ومكافآت معامل RT!*
جاوب على أسئلة الذكاء والمعلومات الطبية، دَوّر عجلة الحظ، واخربش الكروت لكسب تحاليل مجانية (CBC وفحص سكر) وخصومات حقيقية تصل إلى 35%!

📲 *ادخل والعب من الرابط ده واكسب فحصك فوراً:*
🔗 ${currentUrl}

🏥 *بيانات التواصل ومعلومات معمل RT:*
📞 الخط الساخن: *${labHotline}*
💬 واتساب المعمل المباشر: https://wa.me/${labWhatsApp}
📍 *${chosenBranch ? chosenBranch.name : 'معامل RT'}:* ${chosenBranch ? chosenBranch.address : 'شارع الطيران - مدينة نصر'}
⏰ *مواعيد العمل:* يومياً من 8:00 صباحاً حتى 11:30 مساءً (سحب منزلي 24 ساعة)

صحتك وراحتك في بيتك أولويتنا دائماً 💚`;
  };

  // General share message
  const generalShareText = `🎉 *بدعوك تشارك في تحدي ومكافآت ${labName}!*
💡 جاوب على أسئلة الذكاء والمعلومات الطبية، دَوّر عجلة الحظ، واخربش الكروت لكسب تحاليل مجانية وفحوصات وخصومات حقيقية!

🔗 *ادخل والعب من الرابط ده واكسب فوراً:*
${currentUrl}

🏥 *بيانات تواصل معامل RT المعتمدة:*
📞 الخط الساخن: ${labHotline}
💬 واتساب المعمل: https://wa.me/${labWhatsApp}
🚗 خدمة سحب العينات المنزلي متوفرة على مدار 24 ساعة في جميع أنحاء القاهرة والجيزة.`;

  const activeMessageText = activeTab === 'send_to_client' ? buildClientMessage() : generalShareText;

  const handleSendToClientWhatsApp = () => {
    if (!clientPhone.trim()) {
      setPhoneError('برجاء إدخال رقم هاتف العميل المحمول.');
      return;
    }
    const cleanClient = cleanWhatsAppNumber(clientPhone);
    setPhoneError(null);

    if (!bonusClaimed) {
      setBonusClaimed(true);
      onAwardBonusPoints(50);
      triggerConfetti();
    }
    soundManager.playSuccess();

    const targetUrl = `https://wa.me/${cleanClient}?text=${encodeURIComponent(buildClientMessage())}`;
    // Safe navigation
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleGeneralWhatsAppShare = () => {
    if (!bonusClaimed) {
      setBonusClaimed(true);
      onAwardBonusPoints(50);
      triggerConfetti();
    }
    soundManager.playSuccess();
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(generalShareText)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeMessageText);
    setCopied(true);
    soundManager.playSuccess();
    if (!bonusClaimed) {
      setBonusClaimed(true);
      onAwardBonusPoints(50);
      triggerConfetti();
    }
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `تحدي ومكافآت ${labName}`,
          text: activeMessageText,
          url: currentUrl,
        });
        if (!bonusClaimed) {
          setBonusClaimed(true);
          onAwardBonusPoints(50);
          triggerConfetti();
        }
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Share2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black">إرسال ومشاركة الرابط وبيانات المعمل</h3>
              <p className="text-xs text-emerald-100">
                إرسال الرابط المباشر للعميل مع أرقام الواتس اب والفروع المعتمدة
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('send_to_client')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'send_to_client'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>إرسال لعميل محدد بالواتساب</span>
          </button>
          <button
            onClick={() => setActiveTab('general_share')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'general_share'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>مشاركة عامة لجميع القنوات</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-right">
          {bonusClaimed && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs font-bold text-center flex items-center justify-center gap-2 animate-in fade-in">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>مبروك! حصلت على 50 نقطة مكافأة للمشاركة وتفعيل التواصل 🎉</span>
            </div>
          )}

          {activeTab === 'send_to_client' ? (
            <div className="space-y-4">
              {/* Client Info Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    رقم واتساب العميل المحمول <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => {
                      setClientPhone(e.target.value);
                      if (phoneError) setPhoneError(null);
                    }}
                    placeholder="مثال: 01023456789 أو 2010..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none font-mono"
                    dir="ltr"
                  />
                  {phoneError && <span className="text-[11px] text-rose-400 font-semibold">{phoneError}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    اسم العميل (اختياري)
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="مثال: أستاذ أحمد / دكتورة نورهان"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                  />
                </div>
              </div>

              {/* Branch and Message Template Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    الفرع المراد تفعيل التواصل معه
                  </label>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    نوع الرسالة المراد إرسالها للعميل
                  </label>
                  <select
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="rewards_invite">دعوة التحدي والمكافآت مع رابط المنصة</option>
                    <option value="home_visit">عرض خدمة السحب المنزلي 24/7 مع الرابط</option>
                    <option value="results_followup">متابعة الفحوصات والاطمئنان مع الرابط</option>
                  </select>
                </div>
              </div>

              {/* Verified Lab Contact Badge */}
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-200">
                    واتساب المعمل المعتمد المضمن بالرسالة:
                  </span>
                </div>
                <span className="font-mono text-emerald-300 font-bold" dir="ltr">
                  +{labWhatsApp}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>انشر الرابط لجميع أصدقائك أو على السوشيال ميديا:</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  الرسالة المجهزة تتضمن رابط المنصة المباشر وأرقام هواتف وواتساب فروع {labName} المعتمدة لضمان تواصل سريع ومباشر.
                </p>
              </div>

              {/* Lab Contact Info Summary Pill */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">الخط الساخن</span>
                    <span className="font-mono font-bold text-slate-200">{labHotline}</span>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">واتساب الإدارة</span>
                    <span className="font-mono font-bold text-slate-200">+{labWhatsApp}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Message Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold">معاينة الرسالة والرابط:</span>
              <span className="text-[10px] text-emerald-400">تتضمن كافة بيانات التواصل المعتمدة</span>
            </div>
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto font-sans selection:bg-emerald-500">
              {activeMessageText}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            {activeTab === 'send_to_client' ? (
              <button
                onClick={handleSendToClientWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950 transition-all hover:scale-[1.01] active:scale-98"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال الرابط للعميل عبر واتساب فوراً 📲</span>
              </button>
            ) : (
              <button
                onClick={handleGeneralWhatsAppShare}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950 transition-all hover:scale-[1.01] active:scale-98"
              >
                <MessageCircle className="w-4 h-4" />
                <span>مشاركة فورية عبر تطبيق واتساب</span>
              </button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم نسخ الرسالة والرابط بنجاح!' : 'نسخ الرسالة والرابط'}</span>
              </button>

              <button
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>مشاركة عبر تطبيقات أخرى</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
