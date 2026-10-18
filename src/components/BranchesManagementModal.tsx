import React, { useState } from 'react';
import {
  X,
  Building,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  ExternalLink,
  Users,
  Copy,
  Check,
  Home,
  Shield,
  Search,
} from 'lucide-react';
import { LabSettings, LabBranch, LabAdminMember } from '../types';
import { soundManager } from '../utils/audio';

interface BranchesManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: LabSettings;
  onSelectBranchForBooking?: (branch: LabBranch) => void;
}

export const BranchesManagementModal: React.FC<BranchesManagementModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSelectBranchForBooking,
}) => {
  const [activeTab, setActiveTab] = useState<'branches' | 'team'>('branches');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const branches = settings.branches || [];
  const team = settings.adminTeam || [];

  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.homeSamplingCoverage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeam = team.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.bio && m.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCopyBranch = (branch: LabBranch) => {
    const text = `🏥 *${branch.name} - ${settings.labName}*
📍 *العنوان:* ${branch.address}
⏰ *مواعيد العمل:* ${branch.workingHours}
📞 *هاتف:* ${branch.phone}
💬 *واتساب:* ${branch.whatsappNumber}
🚗 *تغطية السحب المنزلي:* ${branch.homeSamplingCoverage}
🗺️ *الموقع على الخريطة:* ${branch.googleMapsUrl}`;
    navigator.clipboard.writeText(text);
    setCopiedId(branch.id);
    soundManager.playSuccess();
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyContact = (member: LabAdminMember) => {
    const text = `👨‍⚕️ *${member.name}* (${member.role})
معامل RT للتحاليل الطبية
📞 هاتف: ${member.phone}
💬 واتساب: ${member.whatsappNumber}`;
    navigator.clipboard.writeText(text);
    setCopiedId(member.id);
    soundManager.playSuccess();
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black">{settings.labName} - الفروع والإدارة</h3>
              <p className="text-xs text-emerald-100">
                عناوين الفروع، مواعيد العمل، أرقام الواتساب المباشرة، وفريق الإدارة الطبي
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

        {/* Tab switch & Search Bar */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('branches')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'branches'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>فروع وعناوين المعمل ({branches.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'team'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>فريق الإدارة والأطباء ({team.length})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في الفروع أو الأسماء..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'branches' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBranches.map((branch) => {
                const cleanPhone = branch.whatsappNumber.replace(/\D/g, '');
                const branchWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  `السلام عليكم، أتواصل مع ${branch.name} لمعامل RT بخصوص استفسار أو حجز تحاليل.`
                )}`;

                return (
                  <div
                    key={branch.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                      branch.isMainBranch
                        ? 'bg-gradient-to-b from-slate-900 to-emerald-950/20 border-emerald-500/50 shadow-lg'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-base text-white">{branch.name}</h4>
                            {branch.isMainBranch && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                                الفرع الرئيسي 👑
                              </span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                              {branch.city}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{branch.address}</span>
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/70 p-3 rounded-xl border border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{branch.workingHours}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Home className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>
                            تغطية السحب المنزلي: <strong>{branch.homeSamplingCoverage}</strong>
                          </span>
                        </div>
                        {branch.managerName && (
                          <div className="text-[11px] text-slate-400">
                            مسؤول الفرع: <strong className="text-slate-300">{branch.managerName}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800">
                      <a
                        href={branchWaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>واتساب الفرع</span>
                      </a>

                      <a
                        href={`tel:${branch.phone}`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{branch.phone}</span>
                      </a>

                      {branch.googleMapsUrl && (
                        <a
                          href={branch.googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="عرض اللوكيشن على الخريطة"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <button
                        onClick={() => handleCopyBranch(branch)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="نسخ عنوان وبيانات الفرع للمريض"
                      >
                        {copiedId === branch.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTeam.map((member) => {
                const cleanPhone = member.whatsappNumber.replace(/\D/g, '');
                const directWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  `السلام عليكم دكتور/أستاذ ${member.name}، أتواصل معكم عبر تطبيق معامل RT للتحاليل الطبية.`
                )}`;

                return (
                  <div
                    key={member.id}
                    className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base text-white">{member.name}</h4>
                            {member.isOnline ? (
                              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                متاح الآن
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                                غير متاح
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-emerald-400 mt-0.5">{member.role}</p>
                        </div>
                      </div>

                      {member.bio && <p className="text-xs text-slate-400 leading-relaxed">{member.bio}</p>}

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-500 block">الهاتف:</span>
                          <span className="font-mono text-slate-200">{member.phone}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">الواتساب:</span>
                          <span className="font-mono text-slate-200">{member.whatsappNumber}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      {member.allowDirectWhatsApp && (
                        <a
                          href={directWaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>تواصل واتساب مباشر</span>
                        </a>
                      )}

                      <a
                        href={`tel:${member.phone}`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>اتصال</span>
                      </a>

                      <button
                        onClick={() => handleCopyContact(member)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="نسخ كارت التواصل"
                      >
                        {copiedId === member.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>خدمة السحب المنزلي متاحة 24 ساعة في جميع أنحاء القاهرة الكبرى والجيزة</span>
          </div>
          <div className="font-bold text-white">
            الخط الساخن: <a href={`tel:${settings.hotlineNumber}`} className="text-emerald-400 font-mono hover:underline">{settings.hotlineNumber}</a>
          </div>
        </div>
      </div>
    </div>
  );
};
