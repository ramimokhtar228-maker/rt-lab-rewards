import React, { useState, useRef } from 'react';
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
  Plus,
  Edit2,
  Trash2,
  Save,
  Sparkles,
  Cloud,
  Upload,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { LabSettings, LabBranch, LabAdminMember } from '../types';
import { soundManager } from '../utils/audio';

interface BranchesManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: LabSettings;
  onSaveSettings?: (settings: LabSettings) => void;
  onSelectBranchForBooking?: (branch: LabBranch) => void;
  onOpenAdmin?: () => void;
  onTriggerGitHubSync?: () => Promise<{ success: boolean; message: string }>;
}

export const BranchesManagementModal: React.FC<BranchesManagementModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onSelectBranchForBooking,
  onOpenAdmin,
  onTriggerGitHubSync,
}) => {
  const [activeTab, setActiveTab] = useState<'branches' | 'team'>('branches');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Branch CRUD states
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [editingBranch, setEditingBranch] = useState<LabBranch | null>(null);
  const [branchForm, setBranchForm] = useState<Omit<LabBranch, 'id'>>({
    name: '',
    city: 'القاهرة',
    address: '',
    phone: '',
    whatsappNumber: '',
    googleMapsUrl: '',
    workingHours: 'يومياً من 8:00 صباحاً إلى 11:30 مساءً',
    managerName: '',
    isMainBranch: false,
    homeSamplingCoverage: 'سحب منزلي متاح لجميع المناطق المجاورة',
    notes: '',
  });

  // Team Member CRUD states
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<LabAdminMember | null>(null);
  const [memberForm, setMemberForm] = useState<Omit<LabAdminMember, 'id'>>({
    name: '',
    role: 'استشاري التحاليل الطبية',
    phone: '',
    whatsappNumber: '',
    branchId: settings.branches?.[0]?.id || 'br_main',
    isOnline: true,
    allowDirectWhatsApp: true,
    bio: '',
  });

  // Safe in-modal deletion confirmation target (avoids window.confirm which is blocked in iframes)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'branch' | 'member';
    id: string;
    name: string;
  } | null>(null);

  // GitHub Quick Sync state
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const branches = settings.branches || [];
  const team = settings.adminTeam || [];

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3000);
  };

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
🗺️ *الموقع على الخريطة:* ${branch.googleMapsUrl || 'متاح بطلب اللوكيشن'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(branch.id);
    soundManager.playSuccess();
    showToast(`تم نسخ عنوان وبيانات "${branch.name}" بنجاح!`);
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
    showToast(`تم نسخ كارت تواصل الدكتور/المسؤول "${member.name}"!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Branch CRUD Handlers
  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({
      name: '',
      city: 'القاهرة',
      address: '',
      phone: settings.hotlineNumber || '01021487889',
      whatsappNumber: settings.whatsappNumber || '201021487889',
      googleMapsUrl: '',
      workingHours: 'يومياً من 8:00 صباحاً إلى 11:30 مساءً',
      managerName: '',
      isMainBranch: branches.length === 0,
      homeSamplingCoverage: 'تغطية سحب عينات منزلي فوري لكافة المناطق',
      notes: '',
    });
    setIsAddingBranch(true);
  };

  // Smooth scroll to top when editing items
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollToTop = (formId?: string) => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      if (formId) {
        const el = document.getElementById(formId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          el.classList.add('ring-4', 'ring-emerald-500/50');
          setTimeout(() => el.classList.remove('ring-4', 'ring-emerald-500/50'), 1500);
          return;
        }
      }
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 60);
  };

  const handleStartEditBranch = (branch: LabBranch) => {
    setEditingBranch(branch);
    setBranchForm({
      name: branch.name,
      city: branch.city,
      address: branch.address,
      phone: branch.phone,
      whatsappNumber: branch.whatsappNumber,
      googleMapsUrl: branch.googleMapsUrl,
      workingHours: branch.workingHours,
      managerName: branch.managerName,
      isMainBranch: branch.isMainBranch,
      homeSamplingCoverage: branch.homeSamplingCoverage,
      notes: branch.notes || '',
    });
    setIsAddingBranch(true);
    scrollToTop('branch-form');
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveSettings) {
      showToast('خطأ: تعذر الحفظ التلقائي');
      return;
    }

    let updatedBranches: LabBranch[];
    if (editingBranch) {
      updatedBranches = branches.map((b) => {
        if (b.id === editingBranch.id) {
          return { ...b, ...branchForm };
        }
        return branchForm.isMainBranch ? { ...b, isMainBranch: false } : b;
      });
      showToast(`تم تحديث بيانات فرع "${branchForm.name}" بنجاح!`);
    } else {
      const newBranch: LabBranch = {
        id: 'br_' + Date.now(),
        ...branchForm,
      };
      const cleaned = branchForm.isMainBranch
        ? branches.map((b) => ({ ...b, isMainBranch: false }))
        : [...branches];
      updatedBranches = [newBranch, ...cleaned];
      showToast(`تمت إضافة فرع "${branchForm.name}" بنجاح!`);
    }

    onSaveSettings({ ...settings, branches: updatedBranches });
    setIsAddingBranch(false);
    setEditingBranch(null);
    soundManager.playSuccess();
  };

  const executeDeleteBranch = (id: string) => {
    if (!onSaveSettings) return;
    const updated = branches.filter((b) => b.id !== id);
    onSaveSettings({ ...settings, branches: updated });
    soundManager.playSuccess();
    showToast('تم حذف الفرع بنجاح.');
    setDeleteTarget(null);
  };

  // Team Member CRUD Handlers
  const handleOpenAddMember = () => {
    setEditingMember(null);
    setMemberForm({
      name: '',
      role: 'استشاري التحاليل الطبية',
      phone: settings.hotlineNumber || '01021487889',
      whatsappNumber: settings.whatsappNumber || '201021487889',
      branchId: branches[0]?.id || 'br_main',
      isOnline: true,
      allowDirectWhatsApp: true,
      bio: '',
    });
    setIsAddingMember(true);
  };

  const handleStartEditMember = (member: LabAdminMember) => {
    setEditingMember(member);
    setMemberForm({
      name: member.name,
      role: member.role,
      phone: member.phone,
      whatsappNumber: member.whatsappNumber,
      branchId: member.branchId || branches[0]?.id || 'br_main',
      isOnline: member.isOnline,
      allowDirectWhatsApp: member.allowDirectWhatsApp,
      bio: member.bio || '',
    });
    setIsAddingMember(true);
    scrollToTop('member-form');
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveSettings) return;

    let updatedTeam: LabAdminMember[];
    if (editingMember) {
      updatedTeam = team.map((m) =>
        m.id === editingMember.id ? { ...m, ...memberForm } : m
      );
      showToast(`تم تحديث بيانات المسؤول "${memberForm.name}" بنجاح!`);
    } else {
      const newMember: LabAdminMember = {
        id: 'adm_' + Date.now(),
        ...memberForm,
      };
      updatedTeam = [...team, newMember];
      showToast(`تمت إضافة الدكتور/المسؤول "${memberForm.name}" بنجاح!`);
    }

    onSaveSettings({ ...settings, adminTeam: updatedTeam });
    setIsAddingMember(false);
    setEditingMember(null);
    soundManager.playSuccess();
  };

  const executeDeleteMember = (id: string) => {
    if (!onSaveSettings) return;
    const updated = team.filter((m) => m.id !== id);
    onSaveSettings({ ...settings, adminTeam: updated });
    soundManager.playSuccess();
    showToast('تم حذف المسؤول من الفريق بنجاح.');
    setDeleteTarget(null);
  };

  const handleTriggerDirectSync = async () => {
    if (!onTriggerGitHubSync) return;
    setIsSyncing(true);
    try {
      const res = await onTriggerGitHubSync();
      if (res.success) {
        soundManager.playSuccess();
        showToast('✅ تم حفظ ومزامنة قاعدة بيانات المعمل على GitHub بنجاح!');
      } else {
        showToast('⚠️ ' + (res.message || 'فشلت المزامنة'));
      }
    } catch (err: any) {
      showToast('❌ خطأ في الاتصال: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-full sm:h-auto sm:max-h-[92vh] bg-slate-900 border-0 sm:border border-emerald-500/40 rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black">{settings.labName} - إدارة العناوين والفروع</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 font-bold">
                  إضافة وتعديل وحذف مفعّل ⚡
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                إدارة عناوين الفروع، مواعيد العمل، أرقام الواتساب المباشرة، ومسؤولي الإدارة الطبية
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenAdmin && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                title="فتح لوحة الإدارة الشاملة"
              >
                <Shield className="w-3.5 h-3.5 text-amber-300" />
                <span>لوحة الإدارة الكاملة</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating Toast Notification */}
        {toastNotice && (
          <div className="bg-emerald-500 text-slate-950 px-4 py-2 text-xs font-black flex items-center justify-center gap-2 animate-in fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastNotice}</span>
          </div>
        )}

        {/* Tab Switch, Add Buttons & Search Bar */}
        <div className="px-4 sm:px-5 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                setActiveTab('branches');
                setIsAddingBranch(false);
                setIsAddingMember(false);
              }}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'branches'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>فروع وعناوين المعمل ({branches.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('team');
                setIsAddingBranch(false);
                setIsAddingMember(false);
              }}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'team'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>فريق الإدارة والأطباء ({team.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {activeTab === 'branches' ? (
              <button
                onClick={handleOpenAddBranch}
                className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة فرع جديد</span>
              </button>
            ) : (
              <button
                onClick={handleOpenAddMember}
                className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مسؤول / طبيب</span>
              </button>
            )}

            <div className="relative flex-1 md:w-56">
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
        </div>

        {/* In-Modal Safe Deletion Confirmation Dialog */}
        {deleteTarget && (
          <div className="mx-4 sm:mx-6 my-3 p-4 bg-rose-950/80 border border-rose-500/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in shrink-0 text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold">
                  هل أنت متأكد من حذف{' '}
                  {deleteTarget.type === 'branch' ? 'فرع' : 'المسؤول'}:{' '}
                  <span className="text-amber-300 font-black">"{deleteTarget.name}"</span>؟
                </p>
                <p className="text-[11px] text-rose-200">هذا الإجراء سيقوم بحذف السجل فوراً من قاعدة البيانات.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (deleteTarget.type === 'branch') {
                    executeDeleteBranch(deleteTarget.id);
                  } else {
                    executeDeleteMember(deleteTarget.id);
                  }
                }}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-950"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>نعم، حذف الآن</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div ref={scrollContainerRef} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* ================= TAB 1: BRANCHES ================= */}
          {activeTab === 'branches' && (
            <div className="space-y-4">
              {/* Add / Edit Branch Form */}
              {isAddingBranch && (
                <form
                  id="branch-form"
                  onSubmit={handleSaveBranch}
                  className="p-4 sm:p-5 bg-slate-950 border border-emerald-500/40 rounded-2xl space-y-4 animate-in fade-in shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h5 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <span>{editingBranch ? 'تعديل بيانات فرع المعمل' : 'إضافة فرع جديد للمعمل'}</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingBranch(false);
                        setEditingBranch(null);
                      }}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      إلغاء
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">اسم الفرع:</label>
                      <input
                        type="text"
                        required
                        value={branchForm.name}
                        onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                        placeholder="مثال: الفرع الرئيسي - مدينة نصر"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">المدينة / المحافظة:</label>
                      <input
                        type="text"
                        required
                        value={branchForm.city}
                        onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                        placeholder="مثال: القاهرة"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">مدير أو مسؤول الفرع:</label>
                      <input
                        type="text"
                        value={branchForm.managerName}
                        onChange={(e) => setBranchForm({ ...branchForm, managerName: e.target.value })}
                        placeholder="مثال: د. رامي مختار"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-semibold">العنوان بالتفصيل والعلامات المميزة:</label>
                    <input
                      type="text"
                      required
                      value={branchForm.address}
                      onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                      placeholder="مثال: شارع الطيران تقاطع مصطفى النحاس - برج الأطباء - الدور 3"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">رقم واتساب الفرع المباشر:</label>
                      <input
                        type="text"
                        required
                        value={branchForm.whatsappNumber}
                        onChange={(e) => setBranchForm({ ...branchForm, whatsappNumber: e.target.value })}
                        placeholder="201021487889"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono text-left focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">هاتف الفرع:</label>
                      <input
                        type="text"
                        required
                        value={branchForm.phone}
                        onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                        placeholder="01021487889"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono text-left focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">رابط خرائط جوجل (Google Maps):</label>
                      <input
                        type="url"
                        value={branchForm.googleMapsUrl}
                        onChange={(e) => setBranchForm({ ...branchForm, googleMapsUrl: e.target.value })}
                        placeholder="https://maps.google.com/?q=..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono text-left focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">مواعيد وساعات العمل:</label>
                      <input
                        type="text"
                        value={branchForm.workingHours}
                        onChange={(e) => setBranchForm({ ...branchForm, workingHours: e.target.value })}
                        placeholder="يومياً من 8:00 صباحاً إلى 11:30 مساءً"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">مناطق تغطية السحب المنزلي:</label>
                      <input
                        type="text"
                        value={branchForm.homeSamplingCoverage}
                        onChange={(e) => setBranchForm({ ...branchForm, homeSamplingCoverage: e.target.value })}
                        placeholder="مدينة نصر، مصر الجديدة، التجمع الخامس..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-semibold">ملاحظات الفرع والعلامات المميزة:</label>
                    <input
                      type="text"
                      value={branchForm.notes}
                      onChange={(e) => setBranchForm({ ...branchForm, notes: e.target.value })}
                      placeholder="معمل مجهز بأحدث أجهزة التحاليل الآلية ووحدة طوارئ سريعة"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-semibold">
                      <input
                        type="checkbox"
                        checked={branchForm.isMainBranch}
                        onChange={(e) => setBranchForm({ ...branchForm, isMainBranch: e.target.checked })}
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                      <span>تعيين كفرع رئيسي لمعامل RT ⭐</span>
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingBranch(false);
                        setEditingBranch(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingBranch ? 'حفظ تعديلات الفرع' : 'تأكيد إضافة الفرع'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Branches Grid */}
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
                          ? 'bg-gradient-to-b from-slate-900 to-emerald-950/20 border-emerald-500/50 shadow-lg ring-1 ring-emerald-500/30'
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
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                                {branch.city}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{branch.address}</span>
                            </p>
                          </div>

                          {/* Quick Edit & Delete Action Buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleStartEditBranch(branch)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                              title="تعديل بيانات الفرع"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: 'branch',
                                  id: branch.id,
                                  name: branch.name,
                                })
                              }
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                              title="حذف الفرع"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
                          {branch.notes && (
                            <div className="text-[11px] text-emerald-300/80">
                              علامة مميزة: {branch.notes}
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
            </div>
          )}

          {/* ================= TAB 2: TEAM MANAGEMENT ================= */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              {/* Add / Edit Team Member Form */}
              {isAddingMember && (
                <form
                  id="member-form"
                  onSubmit={handleSaveMember}
                  className="p-4 sm:p-5 bg-slate-950 border border-emerald-500/40 rounded-2xl space-y-4 animate-in fade-in shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h5 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{editingMember ? 'تعديل بيانات المسؤول / الطبيب' : 'إضافة مسؤول جديد للإدارة'}</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingMember(false);
                        setEditingMember(null);
                      }}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      إلغاء
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">الاسم واللقب الطبي:</label>
                      <input
                        type="text"
                        required
                        value={memberForm.name}
                        onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                        placeholder="مثال: د. رامي مختار"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">المسمى الوظيفي والتخصص:</label>
                      <input
                        type="text"
                        required
                        value={memberForm.role}
                        onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                        placeholder="مثال: استشاري التحاليل الطبية والمدير العام"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">رقم الواتساب المباشر:</label>
                      <input
                        type="text"
                        required
                        value={memberForm.whatsappNumber}
                        onChange={(e) => setMemberForm({ ...memberForm, whatsappNumber: e.target.value })}
                        placeholder="201021487889"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono text-left focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">رقم الهاتف:</label>
                      <input
                        type="text"
                        required
                        value={memberForm.phone}
                        onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                        placeholder="01021487889"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono text-left focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">الفرع المخصص:</label>
                      <select
                        value={memberForm.branchId}
                        onChange={(e) => setMemberForm({ ...memberForm, branchId: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-semibold">نبذة واختصاص المسؤول:</label>
                    <input
                      type="text"
                      value={memberForm.bio}
                      onChange={(e) => setMemberForm({ ...memberForm, bio: e.target.value })}
                      placeholder="استشاري التحاليل، تنسيق السحب المنزلي، متابعة الحالات وتفسير النتائج..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={memberForm.isOnline}
                        onChange={(e) => setMemberForm({ ...memberForm, isOnline: e.target.checked })}
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                      <span>متاح الآن للتواصل الفوري 🟢</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={memberForm.allowDirectWhatsApp}
                        onChange={(e) => setMemberForm({ ...memberForm, allowDirectWhatsApp: e.target.checked })}
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                      <span>إتاحة زر تواصل واتساب مباشر للمرضى</span>
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingMember(false);
                        setEditingMember(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingMember ? 'حفظ تعديلات المسؤول' : 'إضافة المسؤول للفريق'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Members Grid */}
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
                                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
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

                          {/* Quick Edit & Delete Action Buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleStartEditMember(member)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                              title="تعديل بيانات المسؤول"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: 'member',
                                  id: member.id,
                                  name: member.name,
                                })
                              }
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                              title="حذف المسؤول"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
                            <span className="font-mono text-emerald-400">{member.whatsappNumber}</span>
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
            </div>
          )}
        </div>

        {/* Footer with HotLine & Quick GitHub Sync */}
        <div className="px-4 sm:px-5 py-3 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>خدمة السحب المنزلي متاحة 24 ساعة في كافة فروع القاهرة الكبرى والجيزة</span>
          </div>

          <div className="flex items-center gap-3">
            {onTriggerGitHubSync && (
              <button
                onClick={handleTriggerDirectSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all"
                title="مزامنة وحفظ مباشر على GitHub"
              >
                <Upload className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
                <span>{isSyncing ? 'جاري المزامنة...' : 'حفظ ومزامنة فورية مع GitHub 🚀'}</span>
              </button>
            )}

            <div className="font-bold text-white whitespace-nowrap">
              الخط الساخن:{' '}
              <a
                href={`tel:${settings.hotlineNumber}`}
                className="text-emerald-400 font-mono hover:underline"
              >
                {settings.hotlineNumber}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
