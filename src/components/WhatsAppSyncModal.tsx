import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  Copy,
  Check,
  Building,
  Users,
  Sparkles,
  Send,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { LabSettings, UserCoupon, PlayerProfile, LabBranch, LabAdminMember } from '../types';
import { soundManager } from '../utils/audio';

interface WhatsAppSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon?: UserCoupon | null;
  settings: LabSettings;
  player: PlayerProfile;
  customMessage?: string;
}

export const WhatsAppSyncModal: React.FC<WhatsAppSyncModalProps> = ({
  isOpen,
  onClose,
  coupon,
  settings,
  player,
  customMessage,
}) => {
  const branches = settings.branches || [];
  const adminTeam = settings.adminTeam || [];
  const templates = settings.whatsappTemplates || [];

  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    player.preferredBranchId || branches[0]?.id || 'br_main'
  );
  const [targetRecipient, setTargetRecipient] = useState<'branch' | 'doctor'>('branch');
  const [selectedAdminId, setSelectedAdminId] = useState<string>(adminTeam[0]?.id || 'adm_1');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || 'tpl_1'
  );
  const [requestHomeVisit, setRequestHomeVisit] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];
  const currentAdmin = adminTeam.find((a) => a.id === selectedAdminId) || adminTeam[0];
  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Recipient phone selection
  const targetPhone =
    targetRecipient === 'doctor' && currentAdmin
      ? currentAdmin.whatsappNumber
      : currentBranch
      ? currentBranch.whatsappNumber
      : settings.whatsappNumber;

  const cleanNumber = targetPhone.replace(/\D/g, '');

  const voucherTitle = coupon ? coupon.title : 'طلب استفسار ومكافأة من تطبيق معامل RT';
  const voucherCode = coupon ? coupon.couponCode : `RT-${Math.floor(1000 + Math.random() * 9000)}`;
  const voucherValue = coupon ? coupon.value : 'مكافأة عميل مميز';

  // Construct message from template or custom
  let messageBody = '';
  if (customMessage) {
    messageBody = customMessage;
  } else if (currentTemplate) {
    messageBody = currentTemplate.templateText
      .replace(/{patient_name}/g, player.name || 'عميل معامل RT')
      .replace(/{phone}/g, player.phone || 'مسجل بالتطبيق')
      .replace(/{prize_title}/g, voucherTitle)
      .replace(/{prize_value}/g, voucherValue)
      .replace(/{coupon_code}/g, voucherCode)
      .replace(/{points}/g, String(player.points || 0))
      .replace(/{branch_name}/g, currentBranch ? currentBranch.name : settings.labName)
      .replace(/{branch_address}/g, currentBranch ? currentBranch.address : settings.address)
      .replace(/{branch_phone}/g, currentBranch ? currentBranch.phone : settings.hotlineNumber)
      .replace(/{manager_name}/g, currentAdmin ? currentAdmin.name : 'دكتور المعمل')
      .replace(/{lab_name}/g, settings.labName)
      .replace(/{hotline}/g, settings.hotlineNumber)
      .replace(/{preferred_time}/g, 'صباحاً (9:00 ص - 1:00 ظ)');
  } else {
    messageBody = `السلام عليكم ورحمة الله، أنا المريض/العميل: ${player.name || 'عميل معامل RT'}\nرقم الهاتف: ${
      player.phone || 'مسجل بالتطبيق'
    }\nالفرع المفضل: ${currentBranch?.name}\nالمكافأة: ${voucherTitle} (كود: ${voucherCode})\nالخدمة: ${
      requestHomeVisit ? 'سحب منزلي 🏠' : 'زيارة الفرع 🏥'
    }`;
  }

  const encodedUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageBody)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageBody);
    setCopied(true);
    soundManager.playSuccess();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-black">مراسلة واتساب معامل RT المنسقة</h3>
              <p className="text-xs text-emerald-100">
                اختر الفرع أو المسؤول، القالب المنسق، وتواصل فوراً مع طاقم المعمل
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Recipient Selector (Branch vs Doctor) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">جهة التواصل المطلوبة:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetRecipient('branch')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all border ${
                  targetRecipient === 'branch'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Building className="w-4 h-4 text-emerald-400" />
                <span>أحد فروع المعمل</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetRecipient('doctor')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all border ${
                  targetRecipient === 'doctor'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 text-teal-400" />
                <span>دكتور أو مسؤول بالإدارة</span>
              </button>
            </div>
          </div>

          {/* Branch or Doctor Dropdown */}
          {targetRecipient === 'branch' ? (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">اختر الفرع الأقرب إليك:</label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city}) - {b.phone}
                  </option>
                ))}
              </select>
              {currentBranch && (
                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 mt-1">
                  📍 <strong>العنوان:</strong> {currentBranch.address}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">اختر الدكتور أو المسؤول:</label>
              <select
                value={selectedAdminId}
                onChange={(e) => setSelectedAdminId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {adminTeam.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} - {m.role}
                  </option>
                ))}
              </select>
              {currentAdmin && (
                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 mt-1">
                  👨‍⚕️ <strong>{currentAdmin.name}:</strong> {currentAdmin.bio || currentAdmin.role}
                </div>
              )}
            </div>
          )}

          {/* Template Selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">قالب الرسالة المنسق:</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Formatted Message Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">معاينة الرسالة المنسقة للواتساب:</label>
              <span className="text-[10px] text-emerald-400 font-mono">
                إلى: {targetPhone}
              </span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto no-scrollbar font-sans border-r-4 border-r-emerald-500">
              {messageBody}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
          <a
            href={encodedUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-950 transition-all hover:scale-[1.01]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>إرسال عبر الواتساب الآن 🚀</span>
          </a>

          <button
            onClick={handleCopy}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ الرسالة'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
