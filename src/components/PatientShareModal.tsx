import React, { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Gift,
  HelpCircle,
  MessageCircle,
  Package,
  QrCode,
  RotateCcw,
  Send,
  Sparkles,
  Ticket,
  User,
  X,
} from 'lucide-react';
import { GameType, LabSettings } from '../types';
import {
  buildPatientInviteWhatsAppUrl,
  generatePatientPlayUrl,
  resetPlaySessionAdmin,
} from '../services/storageService';

interface PatientShareModalProps {
  settings: LabSettings;
  onClose: () => void;
  onStartFreshPatientPlay?: (game?: GameType) => void;
}

export const PatientShareModal: React.FC<PatientShareModalProps> = ({
  settings,
  onClose,
  onStartFreshPatientPlay,
}) => {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [selectedGame, setSelectedGame] = useState<GameType | 'all'>('all');
  const [useGitHubPagesUrl, setUseGitHubPagesUrl] = useState(true);
  const [copied, setCopied] = useState(false);

  // Compute base URL
  const githubBase = 'https://ramimokhtar228-maker.github.io/rt-lab-rewards/';
  const currentBase =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : githubBase;

  const activeBaseUrl = useGitHubPagesUrl ? githubBase : currentBase;

  // Generate target play link
  const playUrl = generatePatientPlayUrl({
    patientName: patientName.trim() || undefined,
    game: selectedGame === 'all' ? undefined : selectedGame,
    customBaseUrl: activeBaseUrl,
  });

  // Handle Copy
  const handleCopyLink = () => {
    navigator.clipboard.writeText(playUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Handle WhatsApp Direct Send
  const handleSendWhatsApp = () => {
    if (!patientPhone.trim()) {
      alert('يرجى كتابة رقم هاتف المريض أو رقم الواتساب لإرسال الرابط مباشرة.');
      return;
    }
    const waUrl = buildPatientInviteWhatsAppUrl(
      patientPhone,
      patientName.trim(),
      playUrl,
      settings.labNameAr,
      settings.sloganAr
    );
    window.open(waUrl, '_blank');
  };

  // Launch on this device directly for testing or immediate counter use
  const handlePlayDirectly = () => {
    resetPlaySessionAdmin();
    if (onStartFreshPatientPlay) {
      onStartFreshPatientPlay(selectedGame === 'all' ? undefined : selectedGame);
    }
    onClose();
  };

  // QR Code generator URL using public standard API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    playUrl
  )}&bgcolor=FFFFFF&color=8B1E2D&margin=1`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-4 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8B1E2D] to-[#681420] p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-white/10 rounded-xl sm:rounded-2xl border border-white/20 shrink-0">
              <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-black truncate">إرسال رابط المسابقة للمريض</h2>
              <p className="text-[10px] sm:text-xs text-rose-100 mt-0.5 truncate">
                تفعيل مشاركة جديدة فورية ومباشرة للمريض مع أحدث جوائز الإدارة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Explanation Box */}
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm leading-relaxed flex items-start gap-2.5">
            <Sparkles className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] sm:text-xs leading-relaxed">
              <strong>ميزة الربط التلقائي للمريض:</strong> بمجرد فتح المريض للرابط المرسل، يفتح
              البرنامج كجلسة جديدة تماماً، ويتجاوز أي قفل سابق، ويحمّل فوراً أحدث الجوائز، والخصومات،
              والألعاب المفعلة من الإدارة!
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Patient Name */}
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-[#8B1E2D]" />
                اسم المريض (اختياري للترحيب)
              </label>
              <input
                type="text"
                placeholder="مثال: أحمد عبد الله"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#8B1E2D] bg-slate-50"
              />
            </div>

            {/* Patient Phone / WhatsApp */}
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                رقم واتساب المريض (للإرسال المباشر)
              </label>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-left font-mono"
                dir="ltr"
              />
            </div>
          </div>

          {/* Game Selection Option */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1.5">
              تحديد وسيلة المسابقة الموجه إليها المريض:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setSelectedGame('all')}
                className={`px-2 py-2 rounded-xl text-[11px] font-bold border transition text-center ${
                  selectedGame === 'all'
                    ? 'border-[#8B1E2D] bg-rose-50 text-[#8B1E2D]'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
                }`}
              >
                حر للمريض
              </button>
              <button
                type="button"
                onClick={() => setSelectedGame('wheel')}
                className={`px-2 py-2 rounded-xl text-[11px] font-bold border transition flex items-center justify-center gap-1 ${
                  selectedGame === 'wheel'
                    ? 'border-[#8B1E2D] bg-rose-50 text-[#8B1E2D]'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
                }`}
              >
                <Sparkles className="h-3 w-3" />
                عجلة الحظ
              </button>
              <button
                type="button"
                onClick={() => setSelectedGame('scratch')}
                className={`px-2 py-2 rounded-xl text-[11px] font-bold border transition flex items-center justify-center gap-1 ${
                  selectedGame === 'scratch'
                    ? 'border-[#8B1E2D] bg-rose-50 text-[#8B1E2D]'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
                }`}
              >
                <Ticket className="h-3 w-3" />
                كارت الخدش
              </button>
              <button
                type="button"
                onClick={() => setSelectedGame('box')}
                className={`px-2 py-2 rounded-xl text-[11px] font-bold border transition flex items-center justify-center gap-1 ${
                  selectedGame === 'box'
                    ? 'border-[#8B1E2D] bg-rose-50 text-[#8B1E2D]'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
                }`}
              >
                <Package className="h-3 w-3" />
                صندوق الهدايا
              </button>
              <button
                type="button"
                onClick={() => setSelectedGame('match')}
                className={`px-2 py-2 rounded-xl text-[11px] font-bold border transition flex items-center justify-center gap-1 ${
                  selectedGame === 'match'
                    ? 'border-[#8B1E2D] bg-rose-50 text-[#8B1E2D]'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
                }`}
              >
                <Sparkles className="h-3 w-3 text-amber-500" />
                كروت الذاكرة
              </button>
              <button
                type="button"
                onClick={() => setSelectedGame('quiz')}
                className={`px-2 py-2 rounded-xl text-[11px] font-bold border transition flex items-center justify-center gap-1 ${
                  selectedGame === 'quiz'
                    ? 'border-[#8B1E2D] bg-rose-50 text-[#8B1E2D]'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
                }`}
              >
                <HelpCircle className="h-3 w-3" />
                المسابقة
              </button>
            </div>
          </div>

          {/* URL Target Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200 gap-2">
            <span>نوع الرابط المستهدف:</span>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="urlTarget"
                  checked={useGitHubPagesUrl}
                  onChange={() => setUseGitHubPagesUrl(true)}
                  className="text-[#8B1E2D]"
                />
                <span className="font-semibold text-slate-800 text-[11px] sm:text-xs">
                  رابط GitHub Pages الرسمي للمعمل
                </span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="urlTarget"
                  checked={!useGitHubPagesUrl}
                  onChange={() => setUseGitHubPagesUrl(false)}
                  className="text-[#8B1E2D]"
                />
                <span className="font-semibold text-slate-800 text-[11px] sm:text-xs">
                  الرابط الحالي
                </span>
              </label>
            </div>
          </div>

          {/* Generated Link Display */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] sm:text-xs font-bold text-slate-700">
                رابط مشاركة المريض المفعّل:
              </label>
              <span className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                جاهز ومفعّل
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <input
                type="text"
                readOnly
                value={playUrl}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 bg-slate-100/90 text-slate-800 select-all"
                dir="ltr"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs flex items-center gap-1 shrink-0 transition shadow-xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-900 text-white'
                }`}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ'}</span>
              </button>
            </div>
          </div>

          {/* QR Code and Actions Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* WhatsApp Send Action */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-200 bg-emerald-50/70 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs sm:text-sm mb-1">
                  <MessageCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  <span>إرسال واتساب مباشر للمريض</span>
                </div>
                <p className="text-[11px] text-emerald-800/90 leading-relaxed mb-3">
                  فتح محادثة واتساب جاهزة فوراً مع المريض تحتوي على رابط المسابقة ورسالة ترحيبية.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Send className="h-4 w-4" />
                <span>إرسال الرابط عبر واتساب</span>
              </button>
            </div>

            {/* QR Code for Reception Desk */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 flex items-center gap-3">
              <div className="p-1.5 bg-white rounded-xl shadow-xs border border-slate-200 shrink-0">
                <img
                  src={qrCodeUrl}
                  alt="QR Code للمريض"
                  className="w-20 h-20 sm:w-22 sm:h-22 object-contain rounded"
                  loading="lazy"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs font-black text-slate-900">
                  <QrCode className="h-3.5 w-3.5 text-[#8B1E2D]" />
                  <span>امسح بالكاميرا</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-600 leading-tight">
                  يمكن للمريض بالفرع مسح الرمز مباشرة من شاشة الاستقبال لبدء المسابقة فوراً.
                </p>
                <button
                  type="button"
                  onClick={handlePlayDirectly}
                  className="mt-1 text-[11px] font-bold text-[#8B1E2D] hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>تجربة اللعب الآن بهذا الجهاز</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-3 sm:p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[10px] sm:text-xs text-slate-500 font-medium">
            معامل د. رامي مختار RT Labs
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
