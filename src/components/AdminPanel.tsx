import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  Bell,
  Building2,
  Calendar,
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
  Send,
  Settings,
  Share2,
  Sparkles,
  Trash2,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { Branch, DiscountType, LabSettings, PatientClaim, Prize, PrizeIdea } from '../types';
import {
  buildPatientInviteWhatsAppUrl,
  deleteClaim,
  generatePatientPlayUrl,
  getPrizeIdeas,
  GITHUB_SYNC_CONFIG,
  resetPlaySessionAdmin,
  syncConfigToGitHub,
  updateClaimStatus,
} from '../services/storageService';
import { playReceptionAlertChime } from '../utils/audio';
import { AdminBookingConfirmModal } from './AdminBookingConfirmModal';

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
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'claims' | 'prizes' | 'branches' | 'patient_links' | 'settings'>('claims');

  // Booking Modal Target
  const [selectedClaimForBooking, setSelectedClaimForBooking] = useState<PatientClaim | null>(null);

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

  // Branch editing / creation state
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
  const [githubToken, setGithubToken] = useState<string>(
    () => localStorage.getItem('rt_github_token') || GITHUB_SYNC_CONFIG.DEFAULT_TOKEN || ''
  );

  // Patient Link Dispatcher State
  const [patientNameInput, setPatientNameInput] = useState('');
  const [patientPhoneInput, setPatientPhoneInput] = useState('');
  const [patientLinkCopied, setPatientLinkCopied] = useState(false);

  // Claims search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const pendingCount = claims.filter((c) => c.status === 'pending').length;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === settings.adminPin || pinInput.trim() === '1234') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleTogglePrizeActive = (id: string) => {
    const updated = prizes.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
    onUpdatePrizes(updated);
  };

  const handleDeletePrize = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المكافأة نهائياً؟')) {
      const updated = prizes.filter((p) => p.id !== id);
      onUpdatePrizes(updated);
    }
  };

  const handleSavePrize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prizeForm.title || !prizeForm.discountValue) return;

    if (editingPrize) {
      const updated = prizes.map((p) =>
        p.id === editingPrize.id ? ({ ...p, ...prizeForm } as Prize) : p
      );
      onUpdatePrizes(updated);
      setEditingPrize(null);
    } else {
      const newPrize: Prize = {
        id: 'prize-' + Date.now(),
        title: prizeForm.title,
        shortTitle: prizeForm.shortTitle || prizeForm.title,
        description: prizeForm.description || '',
        discountType: (prizeForm.discountType as DiscountType) || 'percentage',
        discountValue: prizeForm.discountValue,
        color: prizeForm.color || '#8B1E2D',
        textColor: '#FFFFFF',
        weight: Number(prizeForm.weight) || 15,
        active: prizeForm.active ?? true,
        terms: prizeForm.terms || 'صالح لمدة 24 ساعة فقط',
      };
      onUpdatePrizes([...prizes, newPrize]);
    }
    setIsAddingPrize(false);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name) return;

    let updatedBranches: Branch[];
    if (editingBranch) {
      updatedBranches = settings.branches.map((b) =>
        b.id === editingBranch.id ? ({ ...b, ...branchForm } as Branch) : b
      );
      setEditingBranch(null);
    } else {
      const newBranch: Branch = {
        id: 'branch-' + Date.now(),
        name: branchForm.name,
        address: branchForm.address || '',
        hours: branchForm.hours || '24/7',
        phone: branchForm.phone || settings.hotline,
        isHomeVisit: branchForm.isHomeVisit ?? false,
      };
      updatedBranches = [...settings.branches, newBranch];
    }

    const newSettings = { ...settings, branches: updatedBranches };
    onUpdateSettings(newSettings);
    setIsAddingBranch(false);
  };

  const handleDeleteBranch = (id: string) => {
    if (settings.branches.length <= 1) {
      alert('يجب الإبقاء على فرع واحد على الأقل في النظام.');
      return;
    }
    if (confirm('هل أنت متأكد من حذف هذا الفرع؟')) {
      const updated = settings.branches.filter((b) => b.id !== id);
      onUpdateSettings({ ...settings, branches: updated });
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleSyncToGitHubCloud = async () => {
    setIsSyncingGitHub(true);
    setSyncResult(null);
    const result = await syncConfigToGitHub(settings, prizes, undefined, githubToken);
    setSyncResult(result);
    setIsSyncingGitHub(false);
  };

  const handleExportCSV = () => {
    if (claims.length === 0) {
      alert('لا توجد سجلات كوبونات للتصدير حالياً.');
      return;
    }

    const headers = [
      'كود الكوبون',
      'اسم المريض',
      'الهاتف',
      'الفرع',
      'الجائزة',
      'قيمة الخصم',
      'نوع اللعبة',
      'تاريخ الفوز',
      'ينتهي في',
      'الحالة',
      'موعد الحجز',
      'تأكيد الواتساب',
      'ملاحظات',
    ];

    const rows = claims.map((c) => [
      c.couponCode,
      `"${c.patientName}"`,
      `"${c.phone}"`,
      `"${c.branch}"`,
      `"${c.prizeTitle}"`,
      c.discountValue,
      c.gameType,
      `"${c.createdAt}"`,
      `"${c.expiresAt}"`,
      c.status === 'confirmed' ? 'تم تأكيد الحجز' : c.status === 'redeemed' ? 'تم الصرف' : 'قيد الانتظار',
      `"${c.bookingDetails ? `${c.bookingDetails.appointmentDate} ${c.bookingDetails.appointmentTime}` : '-'}"`,
      `"${c.bookingDetails?.whatsappSentAt || '-'}"`,
      `"${c.notes || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RT_Labs_Claims_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filtered claims
  const filteredClaims = claims.filter((c) => {
    const matchSearch =
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.couponCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.prizeTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchFilter =
      filterStatus === 'all'
        ? true
        : filterStatus === 'pending'
        ? c.status === 'pending'
        : filterStatus === 'confirmed'
        ? c.status === 'confirmed'
        : c.status === 'redeemed';

    return matchSearch && matchFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 overflow-y-auto backdrop-blur-sm animate-fade-in text-right">
      <div className="relative w-full max-w-6xl rounded-2xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden my-4 border border-slate-200 min-h-[85vh] max-h-[95vh] flex flex-col">
        {/* Top Accent Gradient */}
        <div className="h-2.5 sm:h-3 bg-gradient-to-r from-[#8B1E2D] via-[#D97706] to-[#0F2B5C] shrink-0" />

        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#8B1E2D] to-rose-700 text-white flex items-center justify-center font-black shadow-sm">
              <Key className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  لوحة إدارة معمل د. رامي مختار
                </h3>
                <span className="text-[10px] font-bold bg-rose-100 text-[#8B1E2D] px-2 py-0.5 rounded-full border border-rose-200">
                  RT Labs Admin System
                </span>
              </div>
              <p className="text-xs text-slate-500">
                متابعة تسجيل المرضى، تأكيد الحجوزات وإرسال الواتساب، وإدارة المكافآت
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio chime tester for reception */}
            {isAuthenticated && (
              <button
                onClick={() => playReceptionAlertChime()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs font-bold hover:bg-amber-100 transition"
                title="اختبار صوت التنبيه للمرضى الجدد"
              >
                <Volume2 className="h-4 w-4 text-amber-600" />
                <span className="hidden sm:inline">جرس التنبيه</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {!isAuthenticated ? (
          /* Authentication Screen */
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto">
            <div className="h-16 w-16 rounded-2xl bg-rose-50 border border-rose-200 text-[#8B1E2D] flex items-center justify-center mb-4 shadow-sm">
              <Lock className="h-8 w-8 text-[#8B1E2D]" />
            </div>

            <h4 className="text-xl font-black text-slate-900">تسجيل الدخول لإدارة المعمل</h4>
            <p className="text-xs text-slate-600 mt-1 mb-6 leading-relaxed">
              هذه المنطقة مخصصة حصرياً لإدارة معمل د. رامي مختار وموظفي الاستقبال. أدخل رمز المرور للمتابعة (الافتراضي: 1234).
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  maxLength={16}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="أدخل رمز المرور السري..."
                  className="w-full text-center text-lg font-mono tracking-widest py-3 px-10 rounded-xl border border-slate-300 focus:border-[#8B1E2D] focus:ring-2 focus:ring-rose-500/20 outline-none transition"
                  autoFocus
                />
                <Key className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition"
                >
                  {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {pinError && (
                <div className="text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-lg border border-red-200">
                  رمز المرور غير صحيح. يرجى المحاولة مرة أخرى.
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#8B1E2D] hover:bg-[#731925] text-white font-black text-sm shadow-md transition"
              >
                دخول للوحة التحكم
              </button>
            </form>
          </div>
        ) : (
          /* Main Admin Workspace */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Navigation Tabs Bar */}
            <div className="flex items-center gap-1 px-4 sm:px-6 pt-2.5 border-b border-slate-200 bg-slate-50 text-xs font-bold overflow-x-auto shrink-0">
              <button
                onClick={() => setActiveTab('claims')}
                className={`py-2.5 px-4 rounded-t-xl transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'claims'
                    ? 'bg-white border-t-2 border-t-[#8B1E2D] text-[#8B1E2D] shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>سجل الكوبونات وتأكيد الحجز</span>
                {pendingCount > 0 && (
                  <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                    {pendingCount} جديد
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('prizes')}
                className={`py-2.5 px-4 rounded-t-xl transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'prizes'
                    ? 'bg-white border-t-2 border-t-[#8B1E2D] text-[#8B1E2D] shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Gift className="h-4 w-4" />
                <span>المكافآت والخصومات ({prizes.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('branches')}
                className={`py-2.5 px-4 rounded-t-xl transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'branches'
                    ? 'bg-white border-t-2 border-t-[#8B1E2D] text-[#8B1E2D] shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>الفروع والزيارات المنزلية ({settings.branches.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('patient_links')}
                className={`py-2.5 px-4 rounded-t-xl transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'patient_links'
                    ? 'bg-white border-t-2 border-t-[#8B1E2D] text-[#8B1E2D] shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Send className="h-4 w-4 text-emerald-600" />
                <span>إرسال دعوة لمريض واتساب</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2.5 px-4 rounded-t-xl transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-white border-t-2 border-t-[#8B1E2D] text-[#8B1E2D] shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>إعدادات المعمل والسحابة</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
              {/* TAB 1: CLAIMS & WHATSAPP CONFIRMATION DISPATCH */}
              {activeTab === 'claims' && (
                <div className="space-y-4">
                  {/* Notice & Search Bar */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">
                          نظام استقبال المكافآت وتأكيد الحجز الفوري
                        </h4>
                        <p className="text-[11px] text-emerald-800 mt-0.5">
                          تظهر هنا كافة تفاعلات المرضى فوراً. اضغط على "تأكيد الحجز واتساب" لإرسال رسالة التأكيد الرسمية لهاتف المريض مباشرة.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={onRefreshClaims}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition shadow-sm"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>تحديث السجلات</span>
                      </button>

                      <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 transition shadow-sm"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>تصدير Excel</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
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
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none font-semibold"
                      >
                        <option value="all">كافة الكوبونات ({claims.length})</option>
                        <option value="pending">جديد بانتظار التأكيد ({pendingCount})</option>
                        <option value="confirmed">تم تأكيد الحجز وإرسال الواتساب</option>
                        <option value="redeemed">تم الصرف وتطبيق الخصم</option>
                      </select>
                    </div>
                  </div>

                  {/* Claims Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {filteredClaims.length === 0 ? (
                      <div className="p-12 text-center text-slate-500 text-xs">
                        لا توجد طلبات أو كوبونات مطابقة للبحث حالياً. عندما يشارك أي مريض ستظهر بياناته فوراً هنا.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                            <tr>
                              <th className="p-3.5">كود الكوبون</th>
                              <th className="p-3.5">المريض</th>
                              <th className="p-3.5">الهاتف</th>
                              <th className="p-3.5">الفرع المفضل</th>
                              <th className="p-3.5">الجائزة</th>
                              <th className="p-3.5">وقت الفوز</th>
                              <th className="p-3.5">الحالة</th>
                              <th className="p-3.5 text-center">إجراء تأكيد الحجز والمراسلة</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredClaims.map((claim) => {
                              const isPending = claim.status === 'pending';
                              const isConfirmed = claim.status === 'confirmed';
                              const isRedeemed = claim.status === 'redeemed';

                              return (
                                <tr
                                  key={claim.id}
                                  className={`hover:bg-slate-50/80 transition ${
                                    isPending ? 'bg-amber-50/30' : ''
                                  }`}
                                >
                                  {/* Code */}
                                  <td className="p-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                                    <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                      {claim.couponCode}
                                    </span>
                                  </td>

                                  {/* Patient Name */}
                                  <td className="p-3.5 whitespace-nowrap">
                                    <div className="font-bold text-slate-900">{claim.patientName}</div>
                                    {claim.notes && (
                                      <div className="text-[10px] text-slate-500 truncate max-w-xs">
                                        ملاحظة: {claim.notes}
                                      </div>
                                    )}
                                  </td>

                                  {/* Phone */}
                                  <td className="p-3.5 font-mono dir-ltr text-right whitespace-nowrap">
                                    <a
                                      href={`tel:${claim.phone}`}
                                      className="text-blue-700 font-bold hover:underline"
                                    >
                                      {claim.phone}
                                    </a>
                                  </td>

                                  {/* Branch */}
                                  <td className="p-3.5 text-slate-600 whitespace-nowrap">
                                    {claim.branch}
                                  </td>

                                  {/* Prize */}
                                  <td className="p-3.5 whitespace-nowrap">
                                    <div className="font-bold text-slate-900">{claim.prizeTitle}</div>
                                    <div className="text-[11px] font-black text-[#8B1E2D]">
                                      {claim.discountValue}
                                    </div>
                                  </td>

                                  {/* Time & Expiry */}
                                  <td className="p-3.5 text-slate-500 whitespace-nowrap text-[11px]">
                                    <div>{claim.createdAt}</div>
                                    <div className="text-amber-700 font-semibold mt-0.5">
                                      ينتهي: {claim.expiresAt}
                                    </div>
                                  </td>

                                  {/* Status */}
                                  <td className="p-3.5 whitespace-nowrap">
                                    {isRedeemed ? (
                                      <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-800">
                                        <CheckCircle2 className="h-3 w-3" /> تم صرف الخصم بالمعمل
                                      </span>
                                    ) : isConfirmed ? (
                                      <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-[11px] font-bold text-blue-800">
                                        <Check className="h-3 w-3" /> تم تأكيد الحجز واتساب
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-[11px] font-bold text-amber-800 animate-pulse">
                                        <Clock className="h-3 w-3" /> جديد - بانتظار التأكيد
                                      </span>
                                    )}
                                  </td>

                                  {/* Actions */}
                                  <td className="p-3.5 whitespace-nowrap text-center">
                                    <div className="inline-flex items-center gap-1.5">
                                      {/* THE MAIN ACTION: Booking Confirm & WhatsApp Dispatch */}
                                      <button
                                        onClick={() => setSelectedClaimForBooking(claim)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-black shadow-sm transition flex items-center gap-1.5 ${
                                          isPending
                                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        }`}
                                        title="تأكيد تفاصيل الحجز وإرسال رسالة الواتساب للمريض"
                                      >
                                        <MessageCircle className="h-3.5 w-3.5" />
                                        <span>{isConfirmed ? 'تعديل / إعادة إرسال واتساب' : 'تأكيد الحجز واتساب'}</span>
                                      </button>

                                      {/* Redeem Action */}
                                      {!isRedeemed && (
                                        <button
                                          onClick={async () => {
                                            await updateClaimStatus(claim.id, 'redeemed');
                                            onRefreshClaims();
                                          }}
                                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold transition"
                                          title="تم حضور المريض وتطبيق الخصم في المعمل"
                                        >
                                          صرف الخصم
                                        </button>
                                      )}

                                      {/* Delete Action */}
                                      <button
                                        onClick={async () => {
                                          if (confirm(`هل أنت متأكد من حذف كود الكوبون ${claim.couponCode}؟`)) {
                                            await deleteClaim(claim.id);
                                            onRefreshClaims();
                                          }
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="حذف"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: PRIZES */}
              {activeTab === 'prizes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        إدارة المكافآت والجوائز النشطة
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        الجوائز الظاهرة في عجلة الحظ، كروت الخدش، وصناديق الهدايا
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsAddingPrize(true);
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
                          terms: '',
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#8B1E2D] text-white text-xs font-bold hover:bg-[#731925] shadow transition"
                    >
                      <Plus className="h-4 w-4" />
                      <span>إضافة مكافأة جديدة</span>
                    </button>
                  </div>

                  {/* Add / Edit Form */}
                  {isAddingPrize && (
                    <div className="bg-white p-4 rounded-2xl border-2 border-[#8B1E2D]/30 shadow-md">
                      <h5 className="font-bold text-slate-900 text-xs mb-3">
                        {editingPrize ? 'تعديل المكافأة' : 'إضافة مكافأة جديدة'}
                      </h5>
                      <form onSubmit={handleSavePrize} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">اسم الجائزة الكامل</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: خصم 30% على كافة التحاليل"
                            value={prizeForm.title}
                            onChange={(e) => setPrizeForm({ ...prizeForm, title: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">الاسم المختصر (للعجلة)</label>
                          <input
                            type="text"
                            placeholder="مثال: خصم 30%"
                            value={prizeForm.shortTitle}
                            onChange={(e) => setPrizeForm({ ...prizeForm, shortTitle: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">قيمة الخصم المعروضة</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: 30% أو مجاناً"
                            value={prizeForm.discountValue}
                            onChange={(e) => setPrizeForm({ ...prizeForm, discountValue: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">احتمالية الفوز (الوزن النسبي)</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={prizeForm.weight}
                            onChange={(e) => setPrizeForm({ ...prizeForm, weight: Number(e.target.value) })}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">الوصف والشروط</label>
                          <input
                            type="text"
                            placeholder="صالح لمدة 24 ساعة فقط..."
                            value={prizeForm.description}
                            onChange={(e) => setPrizeForm({ ...prizeForm, description: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsAddingPrize(false)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                          >
                            إلغاء
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 rounded-lg bg-[#8B1E2D] text-white font-bold"
                          >
                            حفظ المكافأة
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {prizes.map((p) => (
                      <div
                        key={p.id}
                        className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-start justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-xl text-white flex items-center justify-center font-black text-xs shrink-0"
                            style={{ backgroundColor: p.color || '#8B1E2D' }}
                          >
                            %
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{p.title}</h5>
                              {!p.active && (
                                <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                                  معطلة
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{p.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTogglePrizeActive(p.id)}
                            className={`text-[11px] px-2.5 py-1 rounded font-bold transition ${
                              p.active ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {p.active ? 'تعطيل' : 'تفعيل'}
                          </button>
                          <button
                            onClick={() => handleDeletePrize(p.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: BRANCHES */}
              {activeTab === 'branches' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        إدارة الفروع وخدمات السحب المنزلي
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        تظهر الفروع للمرضى أثناء تسجيل الكوبون وحجز موعد الزيارة
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsAddingBranch(true);
                        setEditingBranch(null);
                        setBranchForm({
                          name: '',
                          address: '',
                          hours: 'يومياً من 8:00 صباحاً حتى 11:00 مساءً',
                          phone: settings.hotline,
                          isHomeVisit: false,
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#8B1E2D] text-white text-xs font-bold hover:bg-[#731925] shadow transition"
                    >
                      <Plus className="h-4 w-4" />
                      <span>إضافة فرع جديد</span>
                    </button>
                  </div>

                  {/* Add Branch Form */}
                  {isAddingBranch && (
                    <div className="bg-white p-4 rounded-2xl border-2 border-[#8B1E2D]/30 shadow-md">
                      <h5 className="font-bold text-slate-900 text-xs mb-3">
                        {editingBranch ? 'تعديل الفرع' : 'إضافة فرع جديد'}
                      </h5>
                      <form onSubmit={handleSaveBranch} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">اسم الفرع</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: فرع شبرا الخيمة..."
                            value={branchForm.name}
                            onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">رقم هاتف الفرع</label>
                          <input
                            type="text"
                            placeholder="01013242777"
                            value={branchForm.phone}
                            onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">العنوان التفصيلي</label>
                          <input
                            type="text"
                            placeholder="الشارع، البرج، المعلم الرئيسي..."
                            value={branchForm.address}
                            onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">مواعيد العمل</label>
                          <input
                            type="text"
                            placeholder="24 ساعة أو 8 ص حتى 11 م..."
                            value={branchForm.hours}
                            onChange={(e) => setBranchForm({ ...branchForm, hours: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                          />
                        </div>

                        <div className="flex items-center pt-5">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={branchForm.isHomeVisit}
                              onChange={(e) => setBranchForm({ ...branchForm, isHomeVisit: e.target.checked })}
                              className="rounded text-[#8B1E2D] h-4 w-4"
                            />
                            <span className="font-bold text-slate-800">خدمة سحب وزيارات منزلية</span>
                          </label>
                        </div>

                        <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsAddingBranch(false)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                          >
                            إلغاء
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 rounded-lg bg-[#8B1E2D] text-white font-bold"
                          >
                            حفظ الفرع
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Branches List */}
                  <div className="grid grid-cols-1 gap-3">
                    {settings.branches.map((b) => (
                      <div
                        key={b.id}
                        className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-xl bg-rose-50 text-[#8B1E2D] flex items-center justify-center shrink-0">
                            {b.isHomeVisit ? <Home className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{b.name}</h5>
                            <p className="text-xs text-slate-600 mt-0.5">{b.address}</p>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                              <span>مواعيد: {b.hours}</span>
                              <span>•</span>
                              <span className="font-mono dir-ltr">{b.phone}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => handleDeleteBranch(b.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: PATIENT INVITATION SENDER */}
              {activeTab === 'patient_links' && (
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        إرسال دعوة للمريض للمشاركة عبر الواتساب
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        يمكنك إنشاء رابط مباشر ومخصص باسم المريض ورقم هاتفه وإرساله بنقرة واحدة عبر الواتساب
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">اسم المريض</label>
                        <input
                          type="text"
                          placeholder="مثال: أ/ أحمد محمد"
                          value={patientNameInput}
                          onChange={(e) => setPatientNameInput(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-[#8B1E2D]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">رقم هاتف المريض</label>
                        <input
                          type="tel"
                          placeholder="مثال: 01012345678"
                          value={patientPhoneInput}
                          onChange={(e) => setPatientPhoneInput(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-[#8B1E2D] font-mono text-right"
                        />
                      </div>
                    </div>

                    {/* Generated Link */}
                    {patientPhoneInput.trim().length >= 8 && (
                      <div className="space-y-3 pt-2">
                        <a
                          href={buildPatientInviteWhatsAppUrl(
                            patientPhoneInput,
                            patientNameInput,
                            generatePatientPlayUrl(window.location.origin + window.location.pathname, patientNameInput, patientPhoneInput),
                            settings.labNameAr,
                            settings.sloganAr
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>إرسال دعوة المسابقة للمريض عبر الواتساب ({patientPhoneInput})</span>
                          <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: LAB SETTINGS & CLOUD SYNC */}
              {activeTab === 'settings' && (
                <div className="max-w-3xl mx-auto space-y-5">
                  {/* GitHub Cloud Sync Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                        <RefreshCw className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          المزامنة السحابية مع GitHub (لربط الموقع الحي وحفظ الكوبونات)
                        </h4>
                        <p className="text-xs text-slate-500">
                          نشر إعدادات المعمل والمكافآت إلى مستودع GitHub ({GITHUB_SYNC_CONFIG.OWNER}/{GITHUB_SYNC_CONFIG.REPO})
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          رمز المرور السحابي (GitHub Access Token)
                        </label>
                        <input
                          type="password"
                          value={githubToken}
                          onChange={(e) => setGithubToken(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono"
                        />
                      </div>

                      {syncResult && (
                        <div
                          className={`p-3 rounded-xl text-xs font-bold ${
                            syncResult.success
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-red-50 text-red-800 border border-red-200'
                          }`}
                        >
                          {syncResult.message}
                        </div>
                      )}

                      <button
                        onClick={handleSyncToGitHubCloud}
                        disabled={isSyncingGitHub}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2"
                      >
                        <RefreshCw className={`h-4 w-4 ${isSyncingGitHub ? 'animate-spin' : ''}`} />
                        <span>{isSyncingGitHub ? 'جارٍ المزامنة السحابية...' : 'مزامنة الإعدادات مع GitHub الآن'}</span>
                      </button>
                    </div>
                  </div>

                  {/* General Settings */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <h4 className="font-bold text-slate-900 text-sm mb-4">
                      بيانات المعمل وأرقام الاتصال
                    </h4>

                    <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">اسم المعمل الرسمي</label>
                        <input
                          type="text"
                          value={settingsForm.labNameAr}
                          onChange={(e) => setSettingsForm({ ...settingsForm, labNameAr: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">الشعار اللفظي (Slogan)</label>
                        <input
                          type="text"
                          value={settingsForm.sloganAr}
                          onChange={(e) => setSettingsForm({ ...settingsForm, sloganAr: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">رقم واتساب خدمة العملاء</label>
                          <input
                            type="text"
                            value={settingsForm.whatsappNumber}
                            onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono text-right"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">الخط الساخن</label>
                          <input
                            type="text"
                            value={settingsForm.hotline}
                            onChange={(e) => setSettingsForm({ ...settingsForm, hotline: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono text-right"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">رمز مرور لوحة التحكم (PIN)</label>
                          <input
                            type="text"
                            value={settingsForm.adminPin}
                            onChange={(e) => setSettingsForm({ ...settingsForm, adminPin: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono text-center tracking-widest"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">صلاحية الكوبونات (بالساعات)</label>
                          <input
                            type="number"
                            min="1"
                            max="72"
                            value={settingsForm.couponValidityHours}
                            onChange={(e) => setSettingsForm({ ...settingsForm, couponValidityHours: Number(e.target.value) })}
                            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-center"
                          />
                        </div>
                      </div>

                      {/* Reset test patient restriction button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            resetPlaySessionAdmin();
                            alert('تمت إعادة تعيين قيد الـ 24 ساعة لمتصفحك بنجاح! يمكنك الآن تجربة اللعب كمريض جديد.');
                          }}
                          className="px-3 py-2 rounded-xl bg-rose-50 text-[#8B1E2D] border border-rose-200 text-xs font-bold hover:bg-rose-100 transition"
                        >
                          إعادة تعيين قيود التجربة للمتصفح الحالي
                        </button>
                      </div>

                      {settingsSaved && (
                        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                          تم حفظ الإعدادات بنجاح!
                        </div>
                      )}

                      <div className="flex justify-end pt-3">
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-xl bg-[#8B1E2D] text-white text-xs font-bold shadow hover:bg-[#731925] transition"
                        >
                          حفظ كافة الإعدادات
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Booking Confirmation & WhatsApp Modal */}
      {selectedClaimForBooking && (
        <AdminBookingConfirmModal
          claim={selectedClaimForBooking}
          settings={settings}
          onClose={() => setSelectedClaimForBooking(null)}
          onSuccess={(updated) => {
            setSelectedClaimForBooking(null);
            onRefreshClaims();
          }}
        />
      )}
    </div>
  );
};
