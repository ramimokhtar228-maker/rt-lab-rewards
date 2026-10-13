import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Edit2,
  ExternalLink,
  Eye,
  EyeOff,
  Gift,
  Home,
  Key,
  Layers,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Share2,
  Sparkles,
  Trash2,
  Globe,
  UploadCloud,
  CheckCircle,
  Users,
  X,
} from 'lucide-react';
import { Branch, DiscountType, LabSettings, PatientClaim, Prize, PrizeIdea } from '../types';
import { labLogo, labReception, medicalTeam } from '../assets/images';
import {
  deleteClaim,
  getPrizeIdeas,
  GITHUB_SYNC_CONFIG,
  resetPlaySessionAdmin,
  syncConfigToGitHub,
  updateClaimStatus,
} from '../services/storageService';

interface AdminPanelProps {
  prizes: Prize[];
  onUpdatePrizes: (newPrizes: Prize[]) => void;
  settings: LabSettings;
  onUpdateSettings: (newSettings: LabSettings) => void;
  claims: PatientClaim[];
  onRefreshClaims: () => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  prizes,
  onUpdatePrizes,
  settings,
  onUpdateSettings,
  claims,
  onRefreshClaims,
  onClose,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'prizes' | 'branches' | 'ideas' | 'claims' | 'settings' | 'security' | 'media'>('prizes');

  // Prize editing / creation state
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [isAddingPrize, setIsAddingPrize] = useState(false);
  const [prizeForm, setPrizeForm] = useState<Partial<Prize>>({
    title: '',
    shortTitle: '',
    description: '',
    discountType: 'percentage',
    discountValue: '25%',
    color: '#8B1E2D',
    textColor: '#FFFFFF',
    weight: 15,
    active: true,
    terms: '',
  });

  // Branch editing / creation state (Requested: CRUD for all fields in branches!)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [branchForm, setBranchForm] = useState<Partial<Branch>>({
    name: '',
    address: '',
    hours: 'يومياً من 8:00 صباحاً حتى 11:00 مساءً',
    phone: '',
    isHomeVisit: false,
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<LabSettings>({ ...settings });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [isSyncingGitHub, setIsSyncingGitHub] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [githubToken, setGithubToken] = useState<string>(() => localStorage.getItem('rt_github_token') || '');

  // Claims search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [unlockedMsg, setUnlockedMsg] = useState(false);

  // Prize ideas vault
  const prizeIdeas = getPrizeIdeas();

  // PIN Change State & Visibility (Hidden & Confidential)
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  // Authentication check - Confidential Admin Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validPin = settings.adminPin || '1234';
    if (pinInput.trim() === validPin) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError('');
    setPinChangeSuccess(false);

    const validPin = settings.adminPin || '1234';
    if (currentPinInput.trim() !== validPin) {
      setPinChangeError('رمز المرور الحالي غير صحيح.');
      return;
    }
    if (!newPinInput.trim() || newPinInput.trim().length < 4) {
      setPinChangeError('يجب ألا يقل رمز المرور الجديد عن 4 خانات.');
      return;
    }
    if (newPinInput.trim() !== confirmPinInput.trim()) {
      setPinChangeError('رمز المرور الجديد وتأكيده غير متطابقين.');
      return;
    }

    const updatedSettings = { ...settings, adminPin: newPinInput.trim() };
    setSettingsForm(updatedSettings);
    onUpdateSettings(updatedSettings);
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    setPinChangeSuccess(true);
    setTimeout(() => setPinChangeSuccess(false), 3500);
  };

  // --- PRIZE CRUD HANDLERS ---
  const handleSavePrize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prizeForm.title || !prizeForm.discountValue) return;

    if (editingPrize) {
      const updated = prizes.map((p) =>
        p.id === editingPrize.id ? ({ ...p, ...prizeForm } as Prize) : p
      );
      onUpdatePrizes(updated);
    } else {
      const newPrize: Prize = {
        id: 'prize_' + Date.now(),
        title: prizeForm.title || '',
        shortTitle: prizeForm.shortTitle || prizeForm.title || '',
        description: prizeForm.description || '',
        discountType: (prizeForm.discountType as DiscountType) || 'percentage',
        discountValue: prizeForm.discountValue || '20%',
        color: prizeForm.color || '#8B1E2D',
        textColor: '#FFFFFF',
        weight: Number(prizeForm.weight) || 15,
        active: prizeForm.active ?? true,
        terms: prizeForm.terms || 'صالح لمدة 24 ساعة فقط من تاريخ المكسب',
      };
      onUpdatePrizes([...prizes, newPrize]);
    }

    setEditingPrize(null);
    setIsAddingPrize(false);
  };

  const handleDeletePrize = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الجائزة نهائياً من القائمة؟')) {
      onUpdatePrizes(prizes.filter((p) => p.id !== id));
    }
  };

  const handleTogglePrizeActive = (id: string) => {
    const updated = prizes.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
    onUpdatePrizes(updated);
  };

  // --- BRANCH CRUD HANDLERS (Requested explicitly by user!) ---
  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name) return;

    let updatedBranches: Branch[];
    if (editingBranch) {
      updatedBranches = settings.branches.map((b) =>
        b.id === editingBranch.id ? ({ ...b, ...branchForm } as Branch) : b
      );
    } else {
      const newBranch: Branch = {
        id: 'branch_' + Date.now(),
        name: branchForm.name.trim(),
        address: branchForm.address?.trim() || '',
        hours: branchForm.hours?.trim() || 'يومياً من 8:00 صباحاً حتى 11:00 مساءً',
        phone: branchForm.phone?.trim() || settings.hotline,
        isHomeVisit: !!branchForm.isHomeVisit,
      };
      updatedBranches = [...settings.branches, newBranch];
    }

    const newSettings = { ...settings, branches: updatedBranches };
    setSettingsForm(newSettings);
    onUpdateSettings(newSettings);
    setEditingBranch(null);
    setIsAddingBranch(false);
  };

  const handleDeleteBranch = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الفرع؟')) {
      const updatedBranches = settings.branches.filter((b) => b.id !== id);
      const newSettings = { ...settings, branches: updatedBranches };
      setSettingsForm(newSettings);
      onUpdateSettings(newSettings);
    }
  };

  // Add idea directly to prizes
  const handleAddIdeaToPrizes = (idea: PrizeIdea) => {
    const newPrize: Prize = {
      id: 'prize_idea_' + Date.now(),
      title: idea.title,
      shortTitle: idea.shortTitle,
      description: idea.description,
      discountType: idea.discountType,
      discountValue: idea.suggestedDiscount,
      color: idea.discountType === 'free_test' ? '#B91C1C' : '#0F2B5C',
      textColor: '#FFFFFF',
      weight: 15,
      active: true,
      terms: 'صالح لمدة 24 ساعة فقط من وقت الحصول عليه',
    };
    onUpdatePrizes([...prizes, newPrize]);
    setActiveTab('prizes');
  };

  // Save laboratory settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  // Sync and publish config to GitHub so all patients and browsers receive it live
  const handleSyncToGitHub = async () => {
    setIsSyncingGitHub(true);
    setSyncResult(null);
    try {
      onUpdateSettings(settingsForm);
      const res = await syncConfigToGitHub(settingsForm, githubToken);
      setSyncResult(res);
    } catch (err: any) {
      setSyncResult({ success: false, message: err?.message || 'تعذر الاتصال بـ GitHub' });
    } finally {
      setIsSyncingGitHub(false);
    }
  };

  // Unlock 24h lockout for current device (helpful for lab admin testing)
  const handleResetLockout = () => {
    resetPlaySessionAdmin();
    setUnlockedMsg(true);
    setTimeout(() => setUnlockedMsg(false), 3000);
  };

  // Export claims to CSV
  const handleExportCSV = () => {
    if (claims.length === 0) {
      alert('لا توجد بيانات مسجلة للتصدير حالياً.');
      return;
    }

    const headers = ['كود الكوبون', 'المريض', 'الهاتف', 'الفرع', 'الجائزة', 'قيمة الخصم', 'تاريخ المكسب', 'انتهاء الصلاحية (24س)', 'الحالة'];
    const rows = claims.map((c) => [
      c.couponCode,
      `"${c.patientName}"`,
      `"${c.phone}"`,
      `"${c.branch}"`,
      `"${c.prizeTitle}"`,
      `"${c.discountValue}"`,
      c.createdAt,
      c.expiresAt,
      c.status === 'redeemed' ? 'تم الاستخدام' : c.status === 'verified' ? 'مؤكد' : 'قيد الانتظار',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rt_lab_claims_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered claims
  const filteredClaims = claims.filter((c) => {
    const matchesSearch =
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.couponCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const copyPatientLink = () => {
    const url = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 overflow-y-auto backdrop-blur-md">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden my-4 border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl overflow-hidden border border-rose-300/40 bg-white p-0.5 shadow shrink-0">
              <img
                src={labLogo}
                alt="لوجو معامل رامي مختار"
                className="h-full w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">لوحة تحكم إدارة معامل رامي مختار</h3>
              <p className="text-[11px] text-rose-300 font-medium">{settings.sloganAr}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isAuthenticated ? (
          /* Authentication Screen - Strictly Confidential */
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto">
            <div className="h-20 w-20 rounded-2xl overflow-hidden border border-rose-200 bg-white p-1 shadow-md mb-4">
              <img
                src={labLogo}
                alt="معامل رامي مختار"
                className="h-full w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <h4 className="text-xl font-bold text-slate-900">تسجيل الدخول لإدارة المعمل</h4>
            <p className="text-xs text-slate-600 mt-1 mb-6 leading-relaxed">
              هذه المنطقة مخصصة حصرياً لإدارة معمل د. رامي مختار. يرجى إدخال رمز المرور السري للمتابعة.
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  maxLength={16}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="رمز المرور السري..."
                  className="w-full text-center text-lg font-mono tracking-widest py-3 px-10 rounded-xl border border-slate-300 focus:border-[#8B1E2D] focus:ring-2 focus:ring-rose-500/20 outline-none transition"
                  autoFocus
                />
                <Key className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition"
                  aria-label={showLoginPassword ? 'إخفاء الرمز' : 'إظهار الرمز'}
                >
                  {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {pinError && (
                <div className="text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-lg border border-red-200">
                  رمز المرور غير صحيح. يرجى التأكد وإعادة المحاولة.
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#8B1E2D] hover:bg-[#731925] text-white font-bold text-sm shadow transition"
              >
                دخول للوحة التحكم
              </button>
            </form>
          </div>
        ) : (
          /* Main Admin Workspace */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold overflow-x-auto shrink-0">
              <button
                onClick={() => setActiveTab('prizes')}
                className={`py-2.5 px-3.5 rounded-t-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'prizes'
                    ? 'bg-white border-t-2 border-t-[#8B1E2D] text-[#8B1E2D] shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Gift className="h-4 w-4" />
                <span>إدارة المكافآت والخصومات ({prizes.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('branches')}
                className={`py-2.5 px-3.5 rounded-t-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'branches'
                    ? 'bg-white border-t-2 border-t-[#8B1E2D] text-[#8B1E2D] shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>إدارة الفروع والسحب المنزلي ({settings.branches.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('ideas')}
                className={`py-2.5 px-3.5 rounded-t-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'ideas'
                    ? 'bg-white border-t-2 border-t-[#8B1E2D] text-[#8B1E2D] shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>أفكار وباقات ترويجية ({prizeIdeas.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('claims')}
                className={`py-2.5 px-3.5 rounded-t-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'claims'
                    ? 'bg-white border-t-2 border-t-[#8B1E2D] text-[#8B1E2D] shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>سجل الكوبونات ({claims.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2.5 px-3.5 rounded-t-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-white border-t-2 border-t-[#8B1E2D] text-[#8B1E2D] shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>إعدادات المعمل والشعار</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`py-2.5 px-3.5 rounded-t-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'bg-white border-t-2 border-t-[#8B1E2D] text-[#8B1E2D] shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="h-4 w-4" />
                <span>الأمان وتغيير كلمة المرور</span>
              </button>

              <button
                onClick={() => setActiveTab('media')}
                className={`py-2.5 px-3.5 rounded-t-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'media'
                    ? 'bg-white border-t-2 border-t-[#8B1E2D] text-[#8B1E2D] shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>اللوجو والخلفيات المعتمدة</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
              {/* TAB 1: PRIZES MANAGEMENT (Full CRUD) */}
              {activeTab === 'prizes' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">قائمة المكافآت والخصومات النشطة</h4>
                      <p className="text-xs text-slate-500">
                        تحكم في نسبة الخصم ونوع الجائزة واحتمالية الفوز وصلاحية الـ 24 ساعة
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingPrize(null);
                        setPrizeForm({
                          title: '',
                          shortTitle: '',
                          description: '',
                          discountType: 'percentage',
                          discountValue: '25%',
                          color: '#8B1E2D',
                          textColor: '#FFFFFF',
                          weight: 15,
                          active: true,
                          terms: 'صالح لمدة 24 ساعة فقط من وقت الحصول عليه',
                        });
                        setIsAddingPrize(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#8B1E2D] hover:bg-[#731925] text-white py-2 px-4 text-xs font-bold shadow transition"
                    >
                      <Plus className="h-4 w-4" />
                      <span>إضافة مكافأة جديدة</span>
                    </button>
                  </div>

                  {/* Add / Edit Form */}
                  {isAddingPrize && (
                    <div className="rounded-2xl border border-rose-300 bg-rose-50/60 p-5 shadow-sm animate-fade-in">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-bold text-slate-900 text-sm">
                          {editingPrize ? 'تعديل بيانات الجائزة' : 'إضافة مكافأة جديدة للمسابقات'}
                        </h5>
                        <button
                          onClick={() => {
                            setIsAddingPrize(false);
                            setEditingPrize(null);
                          }}
                          className="text-xs text-slate-500 hover:text-slate-800"
                        >
                          إلغاء
                        </button>
                      </div>

                      <form onSubmit={handleSavePrize} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">اسم الجائزة الكامل *</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: خصم 30% على باقة الفحص الشامل"
                            value={prizeForm.title}
                            onChange={(e) => setPrizeForm({ ...prizeForm, title: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#8B1E2D]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">الاسم المختصر *</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: خصم 30% شامل"
                            value={prizeForm.shortTitle}
                            onChange={(e) => setPrizeForm({ ...prizeForm, shortTitle: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#8B1E2D]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">نوع المكافأة *</label>
                          <select
                            value={prizeForm.discountType}
                            onChange={(e) =>
                              setPrizeForm({
                                ...prizeForm,
                                discountType: e.target.value as DiscountType,
                              })
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#8B1E2D]"
                          >
                            <option value="percentage">نسبة خصم مئوية (%)</option>
                            <option value="free_test">فحص مجاني بالكامل (100%)</option>
                            <option value="fixed">مبلغ نقدي مباشر (ج.م)</option>
                            <option value="gift">هدية أو خدمة إضافية</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">قيمة الخصم الظاهرة للكوبون *</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: 30% أو 100% مجاناً أو 100 ج.م"
                            value={prizeForm.discountValue}
                            onChange={(e) => setPrizeForm({ ...prizeForm, discountValue: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#8B1E2D]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">احتمالية الفوز (الوزن النسبي)</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={prizeForm.weight}
                            onChange={(e) => setPrizeForm({ ...prizeForm, weight: Number(e.target.value) })}
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#8B1E2D]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">لون القطاع في العجلة</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={prizeForm.color}
                              onChange={(e) => setPrizeForm({ ...prizeForm, color: e.target.value })}
                              className="h-9 w-12 rounded border border-slate-300 cursor-pointer"
                            />
                            <span className="text-slate-600 font-mono text-[11px]">{prizeForm.color}</span>
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-slate-700 mb-1">وصف الجائزة والشروط</label>
                          <input
                            type="text"
                            placeholder="مثال: صالح لمدة 24 ساعة فقط في كافة فروع معامل رامي مختار"
                            value={prizeForm.description}
                            onChange={(e) => setPrizeForm({ ...prizeForm, description: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#8B1E2D]"
                          />
                        </div>

                        <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingPrize(false);
                              setEditingPrize(null);
                            }}
                            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold"
                          >
                            إلغاء
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-lg bg-[#8B1E2D] text-white font-bold shadow hover:bg-[#731925]"
                          >
                            {editingPrize ? 'تحديث المكافأة' : 'حفظ ونشر المكافأة'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Prizes Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {prizes.map((p) => (
                      <div
                        key={p.id}
                        className={`rounded-2xl border p-4 transition bg-white flex flex-col justify-between ${
                          p.active ? 'border-slate-200 shadow-sm' : 'border-slate-200 opacity-60 bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="h-9 w-9 rounded-xl shrink-0 flex items-center justify-center text-white font-black text-xs shadow-sm"
                              style={{ backgroundColor: p.color || '#8B1E2D' }}
                            >
                              %
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-slate-900 text-sm">{p.title}</h5>
                                {!p.active && (
                                  <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                                    معطلة
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
                            </div>
                          </div>

                          <div className="rounded-lg bg-slate-100 px-2 py-1 text-slate-900 font-extrabold text-xs shrink-0">
                            {p.discountValue}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <span className="text-[11px] text-slate-400">احتمالية: {p.weight}</span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleTogglePrizeActive(p.id)}
                              className={`text-[11px] px-2 py-1 rounded transition font-medium ${
                                p.active
                                  ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              }`}
                            >
                              {p.active ? 'تعطيل' : 'تفعيل'}
                            </button>

                            <button
                              onClick={() => {
                                setEditingPrize(p);
                                setPrizeForm({ ...p });
                                setIsAddingPrize(true);
                              }}
                              className="p-1 text-slate-500 hover:text-slate-900 rounded"
                              title="تعديل"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeletePrize(p.id)}
                              className="p-1 text-red-500 hover:text-red-700 rounded"
                              title="حذف"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: BRANCHES CRUD (Explicitly requested: اضافه خاصيه التعديل والحذف لجميع الحقول خاصه الفروع) */}
              {activeTab === 'branches' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">إدارة الفروع وخدمة السحب المنزلي</h4>
                      <p className="text-xs text-slate-500">
                        يمكنك إضافة أو تعديل أو حذف أي فرع، ومواعيد العمل وأرقام الهواتف، وخدمة السحب المنزلي
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingBranch(null);
                        setBranchForm({
                          name: '',
                          address: '',
                          hours: 'يومياً من 8:00 صباحاً حتى 11:00 مساءً',
                          phone: settings.hotline,
                          isHomeVisit: false,
                        });
                        setIsAddingBranch(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#8B1E2D] hover:bg-[#731925] text-white py-2 px-4 text-xs font-bold shadow transition"
                    >
                      <Plus className="h-4 w-4" />
                      <span>إضافة فرع جديد</span>
                    </button>
                  </div>

                  {/* Add / Edit Branch Form */}
                  {isAddingBranch && (
                    <div className="rounded-2xl border border-blue-300 bg-blue-50/60 p-5 shadow-sm animate-fade-in">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-bold text-slate-900 text-sm">
                          {editingBranch ? 'تعديل بيانات الفرع' : 'إضافة فرع جديد للمعمل'}
                        </h5>
                        <button
                          onClick={() => {
                            setIsAddingBranch(false);
                            setEditingBranch(null);
                          }}
                          className="text-xs text-slate-500 hover:text-slate-800"
                        >
                          إلغاء
                        </button>
                      </div>

                      <form onSubmit={handleSaveBranch} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">اسم الفرع *</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: فرع الزمالك أو فرع المعادي"
                            value={branchForm.name}
                            onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#8B1E2D]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">رقم الهاتف / الواتساب للتواصل</label>
                          <input
                            type="text"
                            placeholder="مثال: 01012345678"
                            value={branchForm.phone}
                            onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs font-mono text-slate-900 outline-none focus:border-[#8B1E2D]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-slate-700 mb-1">العنوان التفصيلي للفرع</label>
                          <input
                            type="text"
                            placeholder="مثال: شارع جامعة الدول العربية، أمام نادي الصيد"
                            value={branchForm.address}
                            onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#8B1E2D]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">مواعيد العمل الرسمية</label>
                          <input
                            type="text"
                            placeholder="مثال: يومياً من 8:00 صباحاً حتى 11:00 مساءً"
                            value={branchForm.hours}
                            onChange={(e) => setBranchForm({ ...branchForm, hours: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#8B1E2D]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">نوع الفرع</label>
                          <div className="flex items-center gap-2 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={branchForm.isHomeVisit}
                                onChange={(e) => setBranchForm({ ...branchForm, isHomeVisit: e.target.checked })}
                                className="h-4 w-4 rounded text-[#8B1E2D]"
                              />
                              <span className="font-semibold text-slate-800">هذا الفرع مخصص لخدمة السحب المنزلي</span>
                            </label>
                          </div>
                        </div>

                        <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingBranch(false);
                              setEditingBranch(null);
                            }}
                            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold"
                          >
                            إلغاء
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-lg bg-[#8B1E2D] text-white font-bold shadow hover:bg-[#731925]"
                          >
                            {editingBranch ? 'تحديث بيانات الفرع' : 'حفظ وإضافة الفرع'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Branches List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {settings.branches.map((b) => (
                      <div
                        key={b.id}
                        className={`rounded-2xl border p-5 transition bg-white flex flex-col justify-between shadow-sm ${
                          b.isHomeVisit ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div
                                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                                  b.isHomeVisit ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-[#8B1E2D]'
                                }`}
                              >
                                {b.isHomeVisit ? <Home className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                              </div>
                              <div>
                                <h5 className="font-bold text-slate-900 text-sm">{b.name}</h5>
                                <p className="text-xs text-slate-600 mt-1 flex items-start gap-1">
                                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                                  <span>{b.address || 'القاهرة والجيزة'}</span>
                                </p>
                              </div>
                            </div>

                            {b.isHomeVisit && (
                              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                سحب منزلي
                              </span>
                            )}
                          </div>

                          <div className="mt-3 text-xs text-slate-500 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              <span>{b.hours}</span>
                            </div>
                            <div className="flex items-center gap-1.5 font-mono">
                              <Phone className="h-3.5 w-3.5 text-slate-400" />
                              <span>{b.phone}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingBranch(b);
                              setBranchForm({ ...b });
                              setIsAddingBranch(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>تعديل</span>
                          </button>

                          <button
                            onClick={() => handleDeleteBranch(b.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: MARKETING IDEAS VAULT */}
              {activeTab === 'ideas' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-900 to-[#8B1E2D] p-5 rounded-2xl text-white shadow">
                    <div className="flex items-center gap-2 text-xs font-semibold text-rose-200 mb-1">
                      <Sparkles className="h-4 w-4" />
                      <span>أفكار وباقات تسويقية ذكية لزيادة التردد والمبيعات</span>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold">
                      بنك مقترحات الهدايا والخصومات الطبية المعتمدة
                    </h4>
                    <p className="text-xs text-slate-200 mt-1 max-w-2xl leading-relaxed">
                      اختر أي فكرة تسويقية تناسب حملتك الحالية واضغط على زر الإضافة لتضمينها فوراً في ألعاب
                      المسابقات للمرضى!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prizeIdeas.map((idea) => (
                      <div
                        key={idea.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between hover:border-rose-300 transition"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[11px] font-bold text-rose-900 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              {idea.category}
                            </span>
                            <span className="text-xs font-black text-[#0F2B5C] bg-blue-50 px-2.5 py-1 rounded">
                              {idea.suggestedDiscount}
                            </span>
                          </div>

                          <h5 className="font-bold text-slate-900 text-sm">{idea.title}</h5>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{idea.description}</p>

                          <div className="mt-3 rounded-xl bg-emerald-50/70 p-2.5 border border-emerald-200 text-[11px] text-emerald-800">
                            <strong>الأثر التسويقي للمعمل:</strong> {idea.benefitToLab}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                          <button
                            onClick={() => handleAddIdeaToPrizes(idea)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#8B1E2D] hover:bg-[#731925] text-white py-2 px-3 text-xs font-bold shadow-sm transition"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>إضافة الفكرة إلى جوائز المسابقة فوراً</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: CLAIMS LOG */}
              {activeTab === 'claims' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="ابحث باسم المريض أو الهاتف أو كود الكوبون..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 pr-9 pl-3 py-2 text-xs text-slate-900 outline-none focus:border-[#8B1E2D] focus:bg-white"
                      />
                      <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none"
                      >
                        <option value="all">كافة الحالات</option>
                        <option value="pending">قيد الانتظار</option>
                        <option value="redeemed">تم الاستخدام والخصم</option>
                      </select>

                      <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition whitespace-nowrap"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>تصدير Excel/CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Claims Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {filteredClaims.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs">
                        لا توجد طلبات أو كوبونات مطابقة للبحث حالياً.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                            <tr>
                              <th className="p-3">كود الكوبون</th>
                              <th className="p-3">المريض</th>
                              <th className="p-3">الهاتف</th>
                              <th className="p-3">الفرع</th>
                              <th className="p-3">الجائزة</th>
                              <th className="p-3">الانتهاء (24 ساعة)</th>
                              <th className="p-3">الحالة</th>
                              <th className="p-3 text-center">إجراءات</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredClaims.map((claim) => (
                              <tr key={claim.id} className="hover:bg-slate-50/70 transition">
                                <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                                  {claim.couponCode}
                                </td>
                                <td className="p-3 font-semibold text-slate-800 whitespace-nowrap">
                                  {claim.patientName}
                                </td>
                                <td className="p-3 font-mono dir-ltr text-right whitespace-nowrap">
                                  <a
                                    href={`tel:${claim.phone}`}
                                    className="text-blue-700 hover:underline"
                                  >
                                    {claim.phone}
                                  </a>
                                </td>
                                <td className="p-3 text-slate-600 whitespace-nowrap">{claim.branch}</td>
                                <td className="p-3 whitespace-nowrap">
                                  <div className="font-medium text-slate-900">{claim.prizeTitle}</div>
                                  <div className="text-[10px] text-rose-800 font-bold">{claim.discountValue}</div>
                                </td>
                                <td className="p-3 text-slate-500 whitespace-nowrap">
                                  <div className="text-amber-700 font-medium">{claim.expiresAt}</div>
                                </td>
                                <td className="p-3 whitespace-nowrap">
                                  {claim.status === 'redeemed' ? (
                                    <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                                      <CheckCircle2 className="h-3 w-3" /> تم الاستخدام
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                                      قيد الانتظار (صالح 24س)
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 whitespace-nowrap text-center">
                                  <div className="inline-flex items-center gap-1">
                                    {claim.status !== 'redeemed' && (
                                      <button
                                        onClick={() => {
                                          updateClaimStatus(claim.id, 'redeemed');
                                          onRefreshClaims();
                                        }}
                                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition"
                                      >
                                        تفعيل وخصم
                                      </button>
                                    )}

                                    <a
                                      href={`https://wa.me/${claim.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                        `أهلاً بك أستاذ ${claim.patientName}، نرحب بك في معامل رامي مختار! بخصوص كوبون الخصم الخاص بك (${claim.couponCode})، يشرفنا تأكيد حجزك قبل انتهاء مهلة الـ 24 ساعة للاستفادة من العرض.`
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                      title="مراسلة عبر واتساب"
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                    </a>

                                    <button
                                      onClick={() => {
                                        if (confirm('حذف هذا السجل؟')) {
                                          deleteClaim(claim.id);
                                          onRefreshClaims();
                                        }
                                      }}
                                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                                      title="حذف"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: LAB SETTINGS & SLOGAN */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* Share Link */}
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-emerald-700" />
                        <h4 className="font-bold text-emerald-950 text-sm">
                          رابط المسابقة الجاهز للإرسال للمرضى
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded border border-emerald-300">
                        مباشر ومحمي بقاعدة 24 ساعة
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={window.location.origin + window.location.pathname}
                        className="flex-1 rounded-lg border border-emerald-300 bg-white p-2.5 text-xs text-slate-900 font-mono"
                      />
                      <button
                        onClick={copyPatientLink}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 text-xs font-bold shadow transition"
                      >
                        {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span>{copiedLink ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Settings Form */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">إعدادات المعمل والشعار والواتساب</h4>
                        <p className="text-xs text-slate-500">
                          الرقم المسجل هنا هو الذي سيتلقى رسائل تأكيد بيانات المرضى والجوائز مباشرة.
                        </p>
                      </div>

                      {settingsSaved && (
                        <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          <Check className="h-3.5 w-3.5" />
                          <span>تم حفظ الإعدادات بنجاح!</span>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            اسم المعمل بالعربية *
                          </label>
                          <input
                            type="text"
                            required
                            value={settingsForm.labNameAr}
                            onChange={(e) =>
                              setSettingsForm({ ...settingsForm, labNameAr: e.target.value })
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#8B1E2D]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            الشعار المعتمد للمعمل (Slogan) *
                          </label>
                          <input
                            type="text"
                            required
                            value={settingsForm.sloganAr}
                            onChange={(e) =>
                              setSettingsForm({ ...settingsForm, sloganAr: e.target.value })
                            }
                            placeholder="التشخيص الصحيح يبدأ معنا"
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-bold outline-none focus:border-[#8B1E2D]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            رقم واتساب المعمل المسجل (WhatsApp) *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: 01100874444 أو 201100874444"
                            value={settingsForm.whatsappNumber}
                            onChange={(e) =>
                              setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs font-mono text-slate-900 outline-none focus:border-[#8B1E2D]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            الخط الساخن أو هاتف المعمل *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: 01100046841 أو 01013242777"
                            value={settingsForm.hotline}
                            onChange={(e) =>
                              setSettingsForm({ ...settingsForm, hotline: e.target.value })
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs font-mono text-slate-900 outline-none focus:border-[#8B1E2D]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            حالة أمان رمز مرور الإدارة
                          </label>
                          <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-300 bg-slate-50">
                            <span className="font-mono text-slate-500 font-bold tracking-widest text-xs">
                              •••••••• (سري ومحمي)
                            </span>
                            <button
                              type="button"
                              onClick={() => setActiveTab('security')}
                              className="text-xs text-[#8B1E2D] hover:underline font-bold"
                            >
                              تغيير الرمز السري
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            فتح الواتساب تلقائياً فور تسجيل المريض
                          </label>
                          <div className="flex items-center gap-3 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settingsForm.autoOpenWhatsApp}
                                onChange={(e) =>
                                  setSettingsForm({
                                    ...settingsForm,
                                    autoOpenWhatsApp: e.target.checked,
                                  })
                                }
                                className="h-4 w-4 rounded text-[#8B1E2D]"
                              />
                              <span className="text-slate-800">توجيه المريض تلقائياً لتطبيق الواتساب</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                        {/* Admin Testing tool: Reset 24h lockout for tester */}
                        <button
                          type="button"
                          onClick={handleResetLockout}
                          className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 underline"
                          title="إعادة تعيين عداد الـ 24 ساعة لجهاز الإدارة للتجربة"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>{unlockedMsg ? 'تم فك حظر الـ 24 ساعة لهذا الجهاز!' : 'تصفير قفل الـ 24 ساعة للتجربة'}</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="submit"
                            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow transition"
                          >
                            حفظ محلياً في هذا الجهاز
                          </button>
                          <button
                            type="button"
                            onClick={handleSyncToGitHub}
                            disabled={isSyncingGitHub}
                            className="px-5 py-2.5 rounded-xl bg-[#8B1E2D] hover:bg-[#731925] text-white font-bold text-xs shadow transition flex items-center gap-2 disabled:opacity-50"
                          >
                            <UploadCloud className={`h-4 w-4 ${isSyncingGitHub ? 'animate-bounce' : ''}`} />
                            <span>{isSyncingGitHub ? 'جارِ النشر والتحديث السحابي...' : 'نشر وتحديث لجميع المرضى فوراً 🚀'}</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* GitHub Cloud Sync Status Card */}
                  <div className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-amber-50 p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#8B1E2D] text-white flex items-center justify-center shrink-0 shadow">
                          <Globe className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span>النشر السحابي المباشر لجميع هواتف ومتصفحات المرضى</span>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-mono">LIVE SYNC</span>
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            عند الضغط على "نشر وتحديث لجميع المرضى"، يتم إرسال أحدث أرقام الهواتف، الفروع، العناوين، ورقم الواتساب
                            مباشرة إلى رابط المنصة العام على GitHub Pages، لتعمل فوراً عند أي مريض يفتح الرابط دون أن تظهر له أي بيانات قديمة أو كاش.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSyncToGitHub}
                        disabled={isSyncingGitHub}
                        className="px-4 py-2 rounded-xl bg-[#8B1E2D] hover:bg-[#731925] text-white font-bold text-xs shadow flex items-center gap-1.5 shrink-0 transition"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${isSyncingGitHub ? 'animate-spin' : ''}`} />
                        <span>{isSyncingGitHub ? 'جارِ النشر...' : 'مزامنة سحابية الآن'}</span>
                      </button>
                    </div>

                    {syncResult && (
                      <div className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                        syncResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
                      }`}>
                        {syncResult.success ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                        <div className="flex-1">
                          <p className="font-bold">{syncResult.success ? 'تم نشر التحديث السحابي بنجاح تام!' : 'تنبيه المزامنة:'}</p>
                          <p className="text-[11px] mt-0.5 opacity-90">{syncResult.message}</p>
                        </div>
                      </div>
                    )}

                    {/* Optional Token Config Box */}
                    <div className="mt-4 pt-3 border-t border-rose-200/50">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="text-[11px] font-semibold text-slate-700">
                          رمز GitHub Access Token (المستخدم للمزامنة السحابية الفورية):
                        </label>
                        <span className="text-[10px] text-slate-500">محفوظ بأمان في جهاز الإدارة فقط</span>
                      </div>
                      <div className="mt-1.5 flex gap-2">
                        <input
                          type="password"
                          value={githubToken}
                          onChange={(e) => {
                            setGithubToken(e.target.value);
                            localStorage.setItem('rt_github_token', e.target.value);
                          }}
                          placeholder="ألصق رمز ghp_... هنا لتفعيل النشر الفوري"
                          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 outline-none focus:border-[#8B1E2D]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem('rt_github_token', githubToken);
                            alert('تم حفظ الرمز السري بنجاح في جهاز الإدارة!');
                          }}
                          className="px-3 py-2 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition"
                        >
                          حفظ الرمز
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-rose-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-700">
                      <div className="bg-white/80 p-3 rounded-xl border border-rose-100">
                        <span className="font-semibold text-slate-500 block">رابط المعمل المعتمد للمرضى:</span>
                        <a
                          href="https://ramimokhtar228-maker.github.io/rt-lab-rewards/"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#8B1E2D] hover:underline font-mono font-bold break-all flex items-center gap-1 mt-0.5"
                        >
                          <span>https://ramimokhtar228-maker.github.io/rt-lab-rewards/</span>
                          <ExternalLink className="h-3 w-3 inline shrink-0" />
                        </a>
                      </div>
                      <div className="bg-white/80 p-3 rounded-xl border border-rose-100">
                        <span className="font-semibold text-slate-500 block">رقم الواتساب المفعل لاستلام الكوبونات:</span>
                        <span className="text-emerald-700 font-mono font-bold text-xs mt-0.5 block" dir="ltr">
                          +{settingsForm.whatsappNumber.replace(/\D/g, '')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: SECURITY & CONFIDENTIAL PASSWORD CHANGE */}
              {activeTab === 'security' && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#8B1E2D] text-white flex items-center justify-center shrink-0 shadow">
                        <Lock className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">سرية وأمان لوحة تحكم الإدارة</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          رمز المرور السري محمي وخاص فقط بإدارة معامل رامي مختار، ولا يظهر لأي مريض أو زائر للمنصة.
                          يمكنك تغيير كلمة المرور في أي وقت لحماية صلاحيات تعديل الخصومات والفروع والجوائز.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h4 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                      <Key className="h-4 w-4 text-[#8B1E2D]" />
                      <span>نموذج تغيير رمز المرور السري للإدارة</span>
                    </h4>

                    {pinChangeSuccess && (
                      <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>تم تحديث وحفظ رمز المرور السري الجديد بنجاح!</span>
                      </div>
                    )}

                    {pinChangeError && (
                      <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                        <span>{pinChangeError}</span>
                      </div>
                    )}

                    <form onSubmit={handleChangePin} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          رمز المرور الحالي *
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPin ? 'text' : 'password'}
                            required
                            value={currentPinInput}
                            onChange={(e) => setCurrentPinInput(e.target.value)}
                            placeholder="أدخل رمز المرور الحالي..."
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 px-9 text-xs font-mono text-slate-900 outline-none focus:border-[#8B1E2D]"
                          />
                          <Lock className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPin(!showCurrentPin)}
                            className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                            aria-label="إظهار/إخفاء"
                          >
                            {showCurrentPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            رمز المرور الجديد (4 خانات فأكثر) *
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPin ? 'text' : 'password'}
                              required
                              value={newPinInput}
                              onChange={(e) => setNewPinInput(e.target.value)}
                              placeholder="أدخل الرمز الجديد..."
                              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 px-9 text-xs font-mono text-slate-900 outline-none focus:border-[#8B1E2D]"
                            />
                            <Key className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <button
                              type="button"
                              onClick={() => setShowNewPin(!showNewPin)}
                              className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                              aria-label="إظهار/إخفاء"
                            >
                              {showNewPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            تأكيد رمز المرور الجديد *
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPin ? 'text' : 'password'}
                              required
                              value={confirmPinInput}
                              onChange={(e) => setConfirmPinInput(e.target.value)}
                              placeholder="أعد إدخال الرمز الجديد..."
                              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 px-9 text-xs font-mono text-slate-900 outline-none focus:border-[#8B1E2D]"
                            />
                            <Key className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPin(!showConfirmPin)}
                              className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                              aria-label="إظهار/إخفاء"
                            >
                              {showConfirmPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3">
                        <button
                          type="submit"
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#8B1E2D] hover:bg-[#731925] text-white font-bold text-xs shadow transition flex items-center justify-center gap-2"
                        >
                          <Lock className="h-4 w-4" />
                          <span>تحديث رمز المرور وحفظ التغيير</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 7: OFFICIAL MEDIA & VISUAL ASSETS */}
              {activeTab === 'media' && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#0F2B5C] text-white flex items-center justify-center shrink-0 shadow">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">الهوية البصرية والوسائط الرسمية لمعامل رامي مختار</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          جميع الصور والشعار الرسمي المعتمد مرفقة ومدمجة بالكامل في المتصفح والتطبيق (اللوجو، صالة الاستقبال والفروع، وفريق العمل واستشاريي التحاليل).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Official Logo */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="h-44 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-3 mb-4">
                          <img
                            src={labLogo}
                            alt="الشعار الرسمي لمعامل رامي مختار"
                            className="max-h-full max-w-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="inline-block text-[10px] font-bold text-[#8B1E2D] bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200 mb-2">
                          الشعار الرسمي المعتمد
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">لوجو معامل د. رامي مختار RT Labs</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          مدمج في أعلى الصفحة الرئيسية، وبطاقات الكوبونات الرسمية، وشريط الفروع، ورسائل الواتساب.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>الحالة: نشط بالمتصفح</span>
                        <span className="text-emerald-600 font-bold">✓ معتمد</span>
                      </div>
                    </div>

                    {/* Reception / Clinic Interior */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="h-44 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-900 mb-4">
                          <img
                            src={labReception}
                            alt="صالة استقبال معامل رامي مختار"
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="inline-block text-[10px] font-bold text-[#0F2B5C] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 mb-2">
                          صالة الاستقبال والفروع
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">خلفية الاستقبال والتجهيزات الفندقية</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          مدمجة في واجهة الاستقبال والواجهة الرئيسية وشريط الفروع لتعزيز ثقة وراحة المرضى.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>الحالة: نشط بالمتصفح</span>
                        <span className="text-emerald-600 font-bold">✓ معتمد</span>
                      </div>
                    </div>

                    {/* Medical Team & Lab Instruments */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="h-44 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-900 mb-4">
                          <img
                            src={medicalTeam}
                            alt="الفريق الطبي والأجهزة المعملية"
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 mb-2">
                          الفريق الطبي والأجهزة
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">استشاريو التحاليل والأجهزة المؤتمتة</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          تعكس الكفاءة الطبية المتطورة ودقة النتائج في معامل د. رامي مختار وفق المواصفات الدولية.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>الحالة: نشط بالمتصفح</span>
                        <span className="text-emerald-600 font-bold">✓ معتمد</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
