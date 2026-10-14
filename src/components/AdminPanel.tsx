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
  Edit,
  Edit2,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Gift,
  Globe,
  HelpCircle,
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
import { Branch, DiscountType, GameType, LabSettings, PatientClaim, Prize, QuizQuestion } from '../types';
import {
  buildPatientInviteWhatsAppUrl,
  deleteClaim,
  generateCouponCode,
  generatePatientPlayUrl,
  getPrizeIdeas,
  GITHUB_SYNC_CONFIG,
  resetPlaySessionAdmin,
  syncConfigToGitHub,
  updateClaimStatus,
  updateFullClaim,
} from '../services/storageService';
import { labLogo } from '../assets/images';
import { playReceptionAlertChime } from '../utils/audio';
import { AdminBookingConfirmModal } from './AdminBookingConfirmModal';

interface AdminPanelProps {
  prizes: Prize[];
  onUpdatePrizes: (newPrizes: Prize[]) => void;
  settings: LabSettings;
  onUpdateSettings: (newSettings: LabSettings) => void;
  claims: PatientClaim[];
  onRefreshClaims: () => void;
  quizQuestions: QuizQuestion[];
  onUpdateQuizQuestions: (newQuestions: QuizQuestion[]) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  prizes,
  onUpdatePrizes,
  settings,
  onUpdateSettings,
  claims,
  onRefreshClaims,
  quizQuestions,
  onUpdateQuizQuestions,
  onClose,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSettingsPin, setShowSettingsPin] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<
    'claims' | 'prizes' | 'branches' | 'quiz' | 'terms' | 'patient_links' | 'settings'
  >('claims');

  // Booking Modal Target
  const [selectedClaimForBooking, setSelectedClaimForBooking] = useState<PatientClaim | null>(null);

  // Claim Editing / Manual Adding State
  const [editingClaim, setEditingClaim] = useState<PatientClaim | null>(null);
  const [isAddingClaim, setIsAddingClaim] = useState(false);
  const [claimForm, setClaimForm] = useState<Partial<PatientClaim>>({
    patientName: '',
    phone: '',
    branch: settings.branches[0]?.name || '',
    prizeTitle: prizes[0]?.title || '',
    discountValue: prizes[0]?.discountValue || '',
    notes: '',
    status: 'pending',
  });

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
    terms: 'صالح لمدة 24 ساعة فقط في كافة الفروع',
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

  // Quiz question editing / creation state
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState<Partial<QuizQuestion>>({
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: '',
    hint: '',
  });

  // Terms editing / creation state
  const [editingTermIndex, setEditingTermIndex] = useState<number | null>(null);
  const [editingTermText, setEditingTermText] = useState('');
  const [newTermText, setNewTermText] = useState('');
  const [isAddingTerm, setIsAddingTerm] = useState(false);

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
  const [inviteGame, setInviteGame] = useState<GameType | 'all'>('all');
  const [inviteUseGitHub, setInviteUseGitHub] = useState(true);
  const [inviteCopied, setInviteCopied] = useState(false);

  // Claims search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const pendingCount = claims.filter((c) => c.status === 'pending').length;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPin = settings.adminPin?.trim() || '1234';
    if (pinInput.trim() === targetPin) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // ==================== PRIZES HANDLERS ====================
  const handleOpenAddPrize = () => {
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
      terms: 'صالح لمدة 24 ساعة فقط في كافة الفروع',
    });
    setIsAddingPrize(true);
  };

  const handleOpenEditPrize = (prize: Prize) => {
    setEditingPrize(prize);
    setPrizeForm({ ...prize });
    setIsAddingPrize(true);
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
        terms: prizeForm.terms || 'صالح لمدة 24 ساعة فقط في كافة الفروع',
      };
      onUpdatePrizes([...prizes, newPrize]);
    }
    setIsAddingPrize(false);
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

  // ==================== BRANCHES HANDLERS ====================
  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({
      name: '',
      address: '',
      hours: 'يومياً من 8:00 صباحاً حتى 11:00 مساءً',
      phone: settings.hotline,
      isHomeVisit: false,
    });
    setIsAddingBranch(true);
  };

  const handleOpenEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setBranchForm({ ...branch });
    setIsAddingBranch(true);
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

  // ==================== CLAIMS HANDLERS ====================
  const handleOpenAddClaim = () => {
    setEditingClaim(null);
    setClaimForm({
      patientName: '',
      phone: '',
      branch: settings.branches[0]?.name || 'الفرع الرئيسي (بهتيم - شبرا الخيمة)',
      prizeTitle: prizes[0]?.title || 'خصم 30% على كافة التحاليل',
      discountValue: prizes[0]?.discountValue || '30%',
      notes: '',
      status: 'pending',
    });
    setIsAddingClaim(true);
  };

  const handleOpenEditClaim = (claim: PatientClaim) => {
    setEditingClaim(claim);
    setClaimForm({ ...claim });
    setIsAddingClaim(true);
  };

  const handleSaveClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimForm.patientName || !claimForm.phone) return;

    const now = new Date();
    const expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    if (editingClaim) {
      const updatedItem: PatientClaim = {
        ...editingClaim,
        patientName: claimForm.patientName.trim(),
        phone: claimForm.phone.trim(),
        branch: claimForm.branch || editingClaim.branch,
        prizeTitle: claimForm.prizeTitle || editingClaim.prizeTitle,
        discountValue: claimForm.discountValue || editingClaim.discountValue,
        notes: claimForm.notes?.trim() || undefined,
        status: (claimForm.status as PatientClaim['status']) || editingClaim.status,
      };
      await updateFullClaim(updatedItem);
      setEditingClaim(null);
    } else {
      const newClaim: PatientClaim = {
        id: 'claim-' + Date.now(),
        couponCode: generateCouponCode(),
        patientName: claimForm.patientName.trim(),
        phone: claimForm.phone.trim(),
        branch: claimForm.branch || settings.branches[0]?.name || '',
        prizeId: 'manual',
        prizeTitle: claimForm.prizeTitle || 'خصم مخصص',
        discountValue: claimForm.discountValue || 'خصم معتمد',
        gameType: 'wheel',
        createdAt: now.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }),
        createdAtTimestamp: now.getTime(),
        expiresAt: expiryDate.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }),
        expiresAtTimestamp: expiryDate.getTime(),
        status: (claimForm.status as PatientClaim['status']) || 'pending',
        notes: claimForm.notes?.trim() || undefined,
      };
      await updateFullClaim(newClaim);
    }

    setIsAddingClaim(false);
    onRefreshClaims();
  };

  // ==================== QUIZ QUESTIONS HANDLERS ====================
  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: '',
      hint: '',
    });
    setIsAddingQuestion(true);
  };

  const handleOpenEditQuestion = (q: QuizQuestion) => {
    setEditingQuestion(q);
    setQuestionForm({ ...q, options: [...q.options] });
    setIsAddingQuestion(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionForm.question || !questionForm.options?.some((o) => o.trim())) return;

    const validOptions = (questionForm.options || []).map((o, i) => o.trim() || `الخيار ${i + 1}`);

    if (editingQuestion) {
      const updated = quizQuestions.map((q) =>
        q.id === editingQuestion.id
          ? ({
              ...q,
              question: questionForm.question!.trim(),
              options: validOptions,
              correctIndex: Number(questionForm.correctIndex) || 0,
              explanation: questionForm.explanation?.trim() || '',
              hint: questionForm.hint?.trim() || undefined,
            } as QuizQuestion)
          : q
      );
      onUpdateQuizQuestions(updated);
      setEditingQuestion(null);
    } else {
      const newQ: QuizQuestion = {
        id: 'q-' + Date.now(),
        question: questionForm.question!.trim(),
        options: validOptions,
        correctIndex: Number(questionForm.correctIndex) || 0,
        explanation: questionForm.explanation?.trim() || '',
        hint: questionForm.hint?.trim() || undefined,
      };
      onUpdateQuizQuestions([...quizQuestions, newQ]);
    }

    setIsAddingQuestion(false);
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السؤال الطبي؟')) {
      const updated = quizQuestions.filter((q) => q.id !== id);
      onUpdateQuizQuestions(updated);
    }
  };

  // ==================== TERMS & CONDITIONS HANDLERS ====================
  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTermText.trim()) return;
    const updated = [...settings.termsAndConditions, newTermText.trim()];
    onUpdateSettings({ ...settings, termsAndConditions: updated });
    setNewTermText('');
    setIsAddingTerm(false);
  };

  const handleSaveEditTerm = (index: number) => {
    if (!editingTermText.trim()) return;
    const updated = [...settings.termsAndConditions];
    updated[index] = editingTermText.trim();
    onUpdateSettings({ ...settings, termsAndConditions: updated });
    setEditingTermIndex(null);
  };

  const handleDeleteTerm = (index: number) => {
    if (confirm('هل أنت متأكد من حذف هذا البند؟')) {
      const updated = settings.termsAndConditions.filter((_, i) => i !== index);
      onUpdateSettings({ ...settings, termsAndConditions: updated });
    }
  };

  // ==================== SETTINGS & CLOUD SYNC ====================
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleSyncToGitHubCloud = async () => {
    setIsSyncingGitHub(true);
    setSyncResult(null);
    const result = await syncConfigToGitHub(settings, prizes, quizQuestions, githubToken);
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
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl overflow-hidden border border-rose-200 bg-white p-1 shadow-sm shrink-0">
              <img src={labLogo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  لوحة إدارة معمل د. رامي مختار
                </h3>
                <span className="text-[10px] font-bold bg-rose-100 text-[#8B1E2D] px-2 py-0.5 rounded-full border border-rose-200">
                  نظام الإدارة الشامل (إضافة وتعديل وحذف)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                تسجيل ومتابعة الكوبونات، تأكيد الحجوزات وإرسال الواتساب، والتحكم في كل حقول البرنامج
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={() => playReceptionAlertChime()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs font-bold hover:bg-amber-100 transition shadow-xs"
                title="اختبار نغمة إشعار المرضى الجدد"
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
            <div className="h-20 w-20 rounded-2xl overflow-hidden border border-rose-200 bg-white p-1.5 shadow-md mb-4">
              <img src={labLogo} alt="Logo" className="h-full w-full object-contain" />
            </div>

            <h4 className="text-xl font-black text-slate-900">تسجيل الدخول لإدارة المعمل</h4>
            <p className="text-xs text-slate-600 mt-1 mb-6 leading-relaxed">
              هذه المنطقة مخصصة حصرياً لإدارة معمل د. رامي مختار وموظفي الاستقبال. يرجى إدخال رمز المرور السري الخاص بالإدارة.
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
                className={`py-2.5 px-3.5 rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'claims'
                    ? 'bg-white border-t-2 border-t-[#8B1E2D] text-[#8B1E2D] shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>سجل الكوبونات ({claims.length})</span>
                {pendingCount > 0 && (
                  <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                    {pendingCount} جديد
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('prizes')}
                className={`py-2.5 px-3.5 rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'prizes'
                    ? 'bg-white border-t-2 border-t-[#8B1E2D] text-[#8B1E2D] shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Gift className="h-4 w-4" />
                <span>المكافآت والجوائز ({prizes.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('branches')}
                className={`py-2.5 px-3.5 rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'branches'
                    ? 'bg-white border-t-2 border-t-[#8B1E2D] text-[#8B1E2D] shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>الفروع والسحب المنزلي ({settings.branches.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className={`py-2.5 px-3.5 rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'quiz'
                    ? 'bg-white border-t-2 border-t-[#8B1E2D] text-[#8B1E2D] shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HelpCircle className="h-4 w-4" />
                <span>الأسئلة الطبية ({quizQuestions.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('terms')}
                className={`py-2.5 px-3.5 rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'terms'
                    ? 'bg-white border-t-2 border-t-[#8B1E2D] text-[#8B1E2D] shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>الشروط واللوائح ({settings.termsAndConditions.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('patient_links')}
                className={`py-2.5 px-3.5 rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'patient_links'
                    ? 'bg-white border-t-2 border-t-[#8B1E2D] text-[#8B1E2D] shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Send className="h-4 w-4 text-emerald-600" />
                <span>إرسال دعوة لمريض</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2.5 px-3.5 rounded-t-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-white border-t-2 border-t-[#8B1E2D] text-[#8B1E2D] shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>إعدادات المعمل والشعار</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
              {/* ========================================================= */}
              {/* TAB 1: CLAIMS & PATIENT BOOKINGS */}
              {/* ========================================================= */}
              {activeTab === 'claims' && (
                <div className="space-y-4">
                  {/* Notice & Action Bar */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">
                          سجل الكوبونات وتأكيد الحجز التلقائي
                        </h4>
                        <p className="text-[11px] text-emerald-800 mt-0.5">
                          تظهر تفاعلات المرضى فوراً. يمكنك إضافة كوبون مريض يدوياً، أو تعديل أي بيان، أو تأكيد الحجز وإرسال الواتساب.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* ADD CLAIM MANUALLY BUTTON */}
                      <button
                        onClick={handleOpenAddClaim}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8B1E2D] text-white text-xs font-bold hover:bg-[#731925] shadow transition"
                      >
                        <Plus className="h-4 w-4" />
                        <span>إضافة كوبون يدوي لمريض</span>
                      </button>

                      <button
                        onClick={onRefreshClaims}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition shadow-xs"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>تحديث</span>
                      </button>

                      <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 transition shadow-xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>تصدير Excel</span>
                      </button>
                    </div>
                  </div>

                  {/* Add / Edit Claim Modal Form */}
                  {isAddingClaim && (
                    <div className="bg-white p-5 rounded-2xl border-2 border-[#8B1E2D]/40 shadow-lg animate-fade-in mb-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                        <div className="flex items-center gap-2">
                          <Edit className="h-4 w-4 text-[#8B1E2D]" />
                          <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                            {editingClaim ? `تعديل بيانات كوبون المريض (${editingClaim.couponCode})` : 'إضافة كوبون مريض جديد يدوياً بالاستقبال'}
                          </h5>
                        </div>
                        <button
                          onClick={() => setIsAddingClaim(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveClaim} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">اسم المريض <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            placeholder="الاسم ثلاثي..."
                            value={claimForm.patientName}
                            onChange={(e) => setClaimForm({ ...claimForm, patientName: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">رقم الهاتف (واتساب) <span className="text-red-500">*</span></label>
                          <input
                            type="tel"
                            required
                            placeholder="01012345678"
                            value={claimForm.phone}
                            onChange={(e) => setClaimForm({ ...claimForm, phone: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono text-right"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">الفرع المفضل</label>
                          <select
                            value={claimForm.branch}
                            onChange={(e) => setClaimForm({ ...claimForm, branch: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                          >
                            {settings.branches.map((b) => (
                              <option key={b.id} value={b.name}>{b.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">اسم الجائزة أو الفحص</label>
                          <input
                            type="text"
                            placeholder="مثال: خصم 30% على كافة التحاليل"
                            value={claimForm.prizeTitle}
                            onChange={(e) => setClaimForm({ ...claimForm, prizeTitle: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">قيمة الخصم</label>
                          <input
                            type="text"
                            placeholder="مثال: 30% أو 100% مجاناً"
                            value={claimForm.discountValue}
                            onChange={(e) => setClaimForm({ ...claimForm, discountValue: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">حالة الكوبون</label>
                          <select
                            value={claimForm.status}
                            onChange={(e) => setClaimForm({ ...claimForm, status: e.target.value as any })}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                          >
                            <option value="pending">قيد الانتظار (جديد)</option>
                            <option value="confirmed">تم تأكيد الحجز واتساب</option>
                            <option value="redeemed">تم الصرف بالمعمل</option>
                            <option value="cancelled">ملغي</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2 md:col-span-3">
                          <label className="block font-bold text-slate-700 mb-1">ملاحظات التحليل أو الاستقبال</label>
                          <input
                            type="text"
                            placeholder="ملاحظات المريض أو نوع التحليل المطلوب..."
                            value={claimForm.notes || ''}
                            onChange={(e) => setClaimForm({ ...claimForm, notes: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2 md:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setIsAddingClaim(false)}
                            className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 font-bold"
                          >
                            إلغاء
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-1.5 rounded-lg bg-[#8B1E2D] text-white font-bold shadow hover:bg-[#731925]"
                          >
                            {editingClaim ? 'تحديث وحفظ بيانات الكوبون' : 'إصدار وتسجيل الكوبون فوراً'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
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
                        <option value="confirmed">تم تأكيد الحجز واتساب</option>
                        <option value="redeemed">تم الصرف بالمعمل</option>
                      </select>
                    </div>
                  </div>

                  {/* Claims Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {filteredClaims.length === 0 ? (
                      <div className="p-12 text-center text-slate-500 text-xs">
                        لا توجد طلبات أو كوبونات مطابقة للبحث حالياً.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                            <tr>
                              <th className="p-3">كود الكوبون</th>
                              <th className="p-3">المريض</th>
                              <th className="p-3">الهاتف</th>
                              <th className="p-3">الفرع</th>
                              <th className="p-3">الجائزة والخصم</th>
                              <th className="p-3">الصلاحية (24س)</th>
                              <th className="p-3">الحالة</th>
                              <th className="p-3 text-center">أزرار الإجراء والتعديل</th>
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
                                    isPending ? 'bg-amber-50/40' : ''
                                  }`}
                                >
                                  {/* Code */}
                                  <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                      {claim.couponCode}
                                    </span>
                                  </td>

                                  {/* Patient Name */}
                                  <td className="p-3 whitespace-nowrap">
                                    <div className="font-bold text-slate-900">{claim.patientName}</div>
                                    {claim.notes && (
                                      <div className="text-[10px] text-slate-500 truncate max-w-xs">
                                        ملاحظة: {claim.notes}
                                      </div>
                                    )}
                                  </td>

                                  {/* Phone */}
                                  <td className="p-3 font-mono dir-ltr text-right whitespace-nowrap">
                                    <a
                                      href={`tel:${claim.phone}`}
                                      className="text-blue-700 font-bold hover:underline"
                                    >
                                      {claim.phone}
                                    </a>
                                  </td>

                                  {/* Branch */}
                                  <td className="p-3 text-slate-600 whitespace-nowrap text-[11px]">
                                    {claim.branch}
                                  </td>

                                  {/* Prize */}
                                  <td className="p-3 whitespace-nowrap">
                                    <div className="font-bold text-slate-900">{claim.prizeTitle}</div>
                                    <div className="text-[10px] font-black text-[#8B1E2D]">
                                      {claim.discountValue}
                                    </div>
                                  </td>

                                  {/* Expiry */}
                                  <td className="p-3 text-slate-500 whitespace-nowrap text-[11px]">
                                    <div className="text-amber-700 font-semibold">{claim.expiresAt}</div>
                                  </td>

                                   {/* Status Selector */}
                                  <td className="p-3 whitespace-nowrap">
                                    <select
                                      value={claim.status}
                                      onChange={async (e) => {
                                        const newStatus = e.target.value as PatientClaim['status'];
                                        await updateClaimStatus(claim.id, newStatus);
                                        onRefreshClaims();
                                      }}
                                      className={`text-[11px] font-bold rounded-lg px-2.5 py-1 border outline-none cursor-pointer transition shadow-2xs ${
                                        isRedeemed
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                          : isConfirmed
                                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                                          : claim.status === 'cancelled'
                                          ? 'bg-slate-100 text-slate-600 border-slate-300'
                                          : 'bg-amber-50 text-amber-800 border-amber-300 font-black'
                                      }`}
                                    >
                                      <option value="pending">⏳ قيد الانتظار</option>
                                      <option value="confirmed">✅ مؤكد ومجدول</option>
                                      <option value="redeemed">🎉 تم الصرف</option>
                                      <option value="cancelled">❌ ملغي</option>
                                    </select>
                                  </td>

                                  {/* ACTION & EDIT BUTTONS */}
                                  <td className="p-3 whitespace-nowrap text-center">
                                    <div className="inline-flex items-center gap-1.5">
                                      {/* WhatsApp Booking confirmation */}
                                      <button
                                        onClick={() => setSelectedClaimForBooking(claim)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                          isPending
                                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        }`}
                                        title="تأكيد الحجز ومراسلة المريض واتساب"
                                      >
                                        <MessageCircle className="h-3.5 w-3.5" />
                                        <span>تأكيد واتساب</span>
                                      </button>

                                      {/* EDIT CLAIM BUTTON */}
                                      <button
                                        onClick={() => handleOpenEditClaim(claim)}
                                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1 transition"
                                        title="تعديل بيانات الكوبون والمريض"
                                      >
                                        <Edit className="h-3.5 w-3.5 text-amber-700" />
                                        <span>تعديل</span>
                                      </button>

                                      {/* Delete */}
                                      <button
                                        onClick={async () => {
                                          if (confirm(`هل أنت متأكد من حذف كود الكوبون ${claim.couponCode} للمريض (${claim.patientName}) نهائياً؟`)) {
                                            await deleteClaim(claim.id);
                                            onRefreshClaims();
                                          }
                                        }}
                                        className="px-2 py-1 text-red-600 hover:bg-red-50 hover:border-red-300 border border-transparent rounded-lg text-xs font-bold flex items-center gap-1 transition"
                                        title="حذف الكوبون نهائياً"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span>حذف</span>
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

              {/* ========================================================= */}
              {/* TAB 2: PRIZES MANAGEMENT (ADD & EDIT BUTTONS) */}
              {/* ========================================================= */}
              {activeTab === 'prizes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        إدارة المكافآت والجوائز النشطة
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        تحكم في كافة حقول الجوائز، نسب الخصومات، والوزن النسبي للاحتمالية
                      </p>
                    </div>

                    {/* ADD PRIZE BUTTON */}
                    <button
                      onClick={handleOpenAddPrize}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8B1E2D] text-white text-xs font-bold hover:bg-[#731925] shadow transition"
                    >
                      <Plus className="h-4 w-4" />
                      <span>إضافة مكافأة جديدة</span>
                    </button>
                  </div>

                  {/* Add / Edit Prize Form */}
                  {isAddingPrize && (
                    <div className="bg-white p-5 rounded-2xl border-2 border-[#8B1E2D]/40 shadow-lg animate-fade-in mb-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                        <div className="flex items-center gap-2">
                          <Edit className="h-4 w-4 text-[#8B1E2D]" />
                          <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                            {editingPrize ? `تعديل حقول المكافأة (${editingPrize.title})` : 'إضافة مكافأة جديدة لعجلة الحظ والمسابقات'}
                          </h5>
                        </div>
                        <button
                          onClick={() => setIsAddingPrize(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSavePrize} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">اسم الجائزة الكامل <span className="text-red-500">*</span></label>
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
                          <label className="block font-bold text-slate-700 mb-1">قيمة الخصم المعروضة <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: 30% أو 100% مجاناً"
                            value={prizeForm.discountValue}
                            onChange={(e) => setPrizeForm({ ...prizeForm, discountValue: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">نوع الخصم</label>
                          <select
                            value={prizeForm.discountType}
                            onChange={(e) => setPrizeForm({ ...prizeForm, discountType: e.target.value as any })}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                          >
                            <option value="percentage">نسبة مئوية (%)</option>
                            <option value="free_test">فحص مجاني 100%</option>
                            <option value="fixed">مبلغ مالي ثابت (ج.م)</option>
                            <option value="gift">هدية أو باقة خاصة</option>
                          </select>
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

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">لون القطاع في العجلة</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={prizeForm.color || '#8B1E2D'}
                              onChange={(e) => setPrizeForm({ ...prizeForm, color: e.target.value })}
                              className="h-9 w-12 rounded border border-slate-300 cursor-pointer"
                            />
                            <span className="font-mono text-slate-600 text-xs">{prizeForm.color}</span>
                          </div>
                        </div>

                        <div className="sm:col-span-2 md:col-span-3">
                          <label className="block font-bold text-slate-700 mb-1">الوصف والشروط الملحقة</label>
                          <input
                            type="text"
                            placeholder="مثال: صالح لمدة 24 ساعة فقط في كافة فروع معامل رامي مختار..."
                            value={prizeForm.description}
                            onChange={(e) => setPrizeForm({ ...prizeForm, description: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2 md:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setIsAddingPrize(false)}
                            className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold"
                          >
                            إلغاء
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-1.5 rounded-lg bg-[#8B1E2D] text-white font-bold shadow hover:bg-[#731925]"
                          >
                            {editingPrize ? 'تحديث المكافأة' : 'حفظ ونشر المكافأة'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Prizes List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {prizes.map((p) => (
                      <div
                        key={p.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-10 w-10 rounded-xl text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs"
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

                          <div className="rounded-lg bg-rose-50 border border-rose-200 text-[#8B1E2D] px-2.5 py-1 text-xs font-black shrink-0">
                            {p.discountValue}
                          </div>
                        </div>

                        {/* EDIT AND ACTION BUTTONS */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-400">احتمالية الفوز: {p.weight}%</span>

                          <div className="flex items-center gap-1.5">
                            {/* EDIT PRIZE BUTTON */}
                            <button
                              onClick={() => handleOpenEditPrize(p)}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1 transition"
                            >
                              <Edit className="h-3.5 w-3.5 text-amber-700" />
                              <span>تعديل</span>
                            </button>

                            <button
                              onClick={() => handleTogglePrizeActive(p.id)}
                              className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition ${
                                p.active ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-emerald-50 text-emerald-800'
                              }`}
                            >
                              {p.active ? 'تعطيل' : 'تفعيل'}
                            </button>

                            <button
                              onClick={() => handleDeletePrize(p.id)}
                              className="px-2.5 py-1 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                              title="حذف الجائزة"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>حذف</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 3: BRANCHES MANAGEMENT (ADD & EDIT BUTTONS) */}
              {/* ========================================================= */}
              {activeTab === 'branches' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        إدارة الفروع وخدمات الزيارات المنزلية
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        يمكنك إضافة فرع جديد أو تعديل عناوين ومواعيد وأرقام هواتف كافة الفروع
                      </p>
                    </div>

                    {/* ADD BRANCH BUTTON */}
                    <button
                      onClick={handleOpenAddBranch}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8B1E2D] text-white text-xs font-bold hover:bg-[#731925] shadow transition"
                    >
                      <Plus className="h-4 w-4" />
                      <span>إضافة فرع جديد</span>
                    </button>
                  </div>

                  {/* Add / Edit Branch Form */}
                  {isAddingBranch && (
                    <div className="bg-white p-5 rounded-2xl border-2 border-[#8B1E2D]/40 shadow-lg animate-fade-in mb-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                        <div className="flex items-center gap-2">
                          <Edit className="h-4 w-4 text-[#8B1E2D]" />
                          <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                            {editingBranch ? `تعديل حقول الفرع (${editingBranch.name})` : 'إضافة فرع معمل جديد للنظام'}
                          </h5>
                        </div>
                        <button
                          onClick={() => setIsAddingBranch(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveBranch} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">اسم الفرع <span className="text-red-500">*</span></label>
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
                          <label className="block font-bold text-slate-700 mb-1">رقم الهاتف للتواصل والواتساب</label>
                          <input
                            type="text"
                            placeholder="01013242777"
                            value={branchForm.phone}
                            onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono text-right"
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
                          <label className="block font-bold text-slate-700 mb-1">مواعيد وساعات العمل</label>
                          <input
                            type="text"
                            placeholder="24 ساعة أو من 8:30 ص حتى 11:30 م..."
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
                            <span className="font-bold text-slate-800">خدمة سحب وزيارات منزلية مريحة</span>
                          </label>
                        </div>

                        <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setIsAddingBranch(false)}
                            className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold"
                          >
                            إلغاء
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-1.5 rounded-lg bg-[#8B1E2D] text-white font-bold shadow hover:bg-[#731925]"
                          >
                            {editingBranch ? 'تحديث بيانات الفرع' : 'حفظ الفرع الجديد'}
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
                        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-xl bg-rose-50 text-[#8B1E2D] flex items-center justify-center shrink-0">
                            {b.isHomeVisit ? <Home className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{b.name}</h5>
                              {b.isHomeVisit && (
                                <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                                  سحب منزلي 24/7
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">{b.address}</p>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                              <span>المواعيد: {b.hours}</span>
                              <span>•</span>
                              <span className="font-mono dir-ltr">{b.phone}</span>
                            </div>
                          </div>
                        </div>

                        {/* EDIT AND DELETE BRANCH BUTTONS */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {/* EDIT BRANCH BUTTON */}
                          <button
                            onClick={() => handleOpenEditBranch(b)}
                            className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1 transition"
                          >
                            <Edit className="h-3.5 w-3.5 text-amber-700" />
                            <span>تعديل الفرع</span>
                          </button>

                          <button
                            onClick={() => handleDeleteBranch(b.id)}
                            className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                            title="حذف الفرع"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>حذف الفرع</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 4: QUIZ QUESTIONS MANAGEMENT (ADD & EDIT BUTTONS) */}
              {/* ========================================================= */}
              {activeTab === 'quiz' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        إدارة أسئلة المسابقة الطبية التثقيفية
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        يمكنك إضافة أسئلة طبية جديدة، تعديل الخيارات، تحديد الإجابة الصحيحة، والتلميحات
                      </p>
                    </div>

                    {/* ADD QUESTION BUTTON */}
                    <button
                      onClick={handleOpenAddQuestion}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8B1E2D] text-white text-xs font-bold hover:bg-[#731925] shadow transition"
                    >
                      <Plus className="h-4 w-4" />
                      <span>إضافة سؤال طبي جديد</span>
                    </button>
                  </div>

                  {/* Add / Edit Question Form */}
                  {isAddingQuestion && (
                    <div className="bg-white p-5 rounded-2xl border-2 border-[#8B1E2D]/40 shadow-lg animate-fade-in mb-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                        <div className="flex items-center gap-2">
                          <Edit className="h-4 w-4 text-[#8B1E2D]" />
                          <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                            {editingQuestion ? 'تعديل السؤال الطبي والإجابات' : 'إضافة سؤال طبي جديد للمسابقة'}
                          </h5>
                        </div>
                        <button
                          onClick={() => setIsAddingQuestion(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveQuestion} className="space-y-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">نص السؤال الطبي <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: كم عدد ساعات الصيام المطلوبة لتحليل دهون الدم؟"
                            value={questionForm.question}
                            onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-bold"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[0, 1, 2, 3].map((optIdx) => (
                            <div key={optIdx} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="font-bold text-slate-700">الخيار {optIdx + 1}</label>
                                <label className="flex items-center gap-1 text-[11px] text-emerald-800 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="correctOption"
                                    checked={questionForm.correctIndex === optIdx}
                                    onChange={() => setQuestionForm({ ...questionForm, correctIndex: optIdx })}
                                    className="text-emerald-600"
                                  />
                                  <span>الإجابة الصحيحة</span>
                                </label>
                              </div>
                              <input
                                type="text"
                                placeholder={`الخيار ${optIdx + 1}...`}
                                value={questionForm.options?.[optIdx] || ''}
                                onChange={(e) => {
                                  const opts = [...(questionForm.options || ['', '', '', ''])];
                                  opts[optIdx] = e.target.value;
                                  setQuestionForm({ ...questionForm, options: opts });
                                }}
                                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">الشرح الطبي المعتمد (يظهر بعد الإجابة)</label>
                            <input
                              type="text"
                              placeholder="توضيح استشاري من معمل RT..."
                              value={questionForm.explanation || ''}
                              onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">تلميح طبي اختياري للمريض</label>
                            <input
                              type="text"
                              placeholder="تلميح مبسط..."
                              value={questionForm.hint || ''}
                              onChange={(e) => setQuestionForm({ ...questionForm, hint: e.target.value })}
                              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setIsAddingQuestion(false)}
                            className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold"
                          >
                            إلغاء
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-1.5 rounded-lg bg-[#8B1E2D] text-white font-bold shadow hover:bg-[#731925]"
                          >
                            {editingQuestion ? 'تحديث السؤال' : 'حفظ السؤال الطبي'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Questions List */}
                  <div className="space-y-3">
                    {quizQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="h-6 w-6 rounded-lg bg-rose-50 text-[#8B1E2D] font-bold text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{q.question}</h5>
                              {q.explanation && (
                                <p className="text-[11px] text-slate-500 mt-1">الشرح: {q.explanation}</p>
                              )}
                            </div>
                          </div>

                          {/* EDIT AND DELETE QUESTION BUTTONS */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* EDIT QUESTION BUTTON */}
                            <button
                              onClick={() => handleOpenEditQuestion(q)}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1 transition"
                            >
                              <Edit className="h-3.5 w-3.5 text-amber-700" />
                              <span>تعديل</span>
                            </button>

                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="px-2.5 py-1 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                              title="حذف السؤال"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>حذف</span>
                            </button>
                          </div>
                        </div>

                        {/* Options preview */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`p-1.5 rounded-lg border ${
                                oIdx === q.correctIndex
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}
                            >
                              {oIdx === q.correctIndex && '✓ '}
                              {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 5: TERMS & CONDITIONS (ADD & EDIT BUTTONS) */}
              {/* ========================================================= */}
              {activeTab === 'terms' && (
                <div className="space-y-4 max-w-3xl mx-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        إدارة بنود وشروط وقواعد المسابقة
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        البنود الظاهرة للمرضى في نافذة الشروط وأسفل الكوبونات
                      </p>
                    </div>

                    {/* ADD TERM BUTTON */}
                    <button
                      onClick={() => setIsAddingTerm(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8B1E2D] text-white text-xs font-bold hover:bg-[#731925] shadow transition"
                    >
                      <Plus className="h-4 w-4" />
                      <span>إضافة شرط جديد</span>
                    </button>
                  </div>

                  {/* Add Term Form */}
                  {isAddingTerm && (
                    <form onSubmit={handleAddTerm} className="bg-white p-4 rounded-2xl border-2 border-[#8B1E2D]/40 shadow-md space-y-3 text-xs">
                      <label className="block font-bold text-slate-700">نص البند أو الشرط الجديد:</label>
                      <textarea
                        rows={2}
                        required
                        placeholder="أدخل نص الشرط التنظيمي..."
                        value={newTermText}
                        onChange={(e) => setNewTermText(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingTerm(false)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-[#8B1E2D] text-white font-bold"
                        >
                          حفظ البند
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Terms List with Edit buttons */}
                  <div className="space-y-2.5">
                    {settings.termsAndConditions.map((term, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-2.5 flex-1">
                          <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>

                          {editingTermIndex === idx ? (
                            <div className="flex-1 space-y-2">
                              <textarea
                                rows={2}
                                value={editingTermText}
                                onChange={(e) => setEditingTermText(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditTerm(idx)}
                                  className="px-3 py-1 rounded bg-emerald-600 text-white font-bold text-xs"
                                >
                                  حفظ
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingTermIndex(null)}
                                  className="px-3 py-1 rounded border border-slate-300 text-xs"
                                >
                                  إلغاء
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-slate-800 leading-relaxed">{term}</p>
                          )}
                        </div>

                        {editingTermIndex !== idx && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* EDIT TERM BUTTON */}
                            <button
                              onClick={() => {
                                setEditingTermIndex(idx);
                                setEditingTermText(term);
                              }}
                              className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1 transition"
                            >
                              <Edit className="h-3 w-3 text-amber-700" />
                              <span>تعديل</span>
                            </button>

                            <button
                              onClick={() => handleDeleteTerm(idx)}
                              className="px-2 py-1 text-red-600 hover:bg-red-50 border border-red-200 rounded text-xs font-bold flex items-center gap-1 transition"
                              title="حذف الشرط"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>حذف</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 6: PATIENT INVITATION SENDER (CLEAN SESSION GUARANTEE) */}
              {/* ========================================================= */}
              {activeTab === 'patient_links' && (() => {
                const activeBaseUrl = inviteUseGitHub
                  ? 'https://ramimokhtar228-maker.github.io/rt-lab-rewards/'
                  : (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://ramimokhtar228-maker.github.io/rt-lab-rewards/');

                const activePlayUrl = generatePatientPlayUrl({
                  customBaseUrl: activeBaseUrl,
                  patientName: patientNameInput.trim() || undefined,
                  patientPhone: patientPhoneInput.trim() || undefined,
                  game: inviteGame === 'all' ? undefined : inviteGame,
                });

                const waInviteUrl = buildPatientInviteWhatsAppUrl(
                  patientPhoneInput || '',
                  patientNameInput.trim() || '',
                  activePlayUrl,
                  settings.labNameAr,
                  settings.sloganAr
                );

                const handleCopyInviteLink = () => {
                  navigator.clipboard.writeText(activePlayUrl);
                  setInviteCopied(true);
                  setTimeout(() => setInviteCopied(false), 2500);
                };

                return (
                  <div className="max-w-2xl mx-auto space-y-4">
                    {/* Reassurance Banner */}
                    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 flex items-start gap-3 shadow-xs">
                      <Sparkles className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-black text-emerald-900 mb-0.5">
                          تزامن لحظي وجلسة لعب نظيفة وفارغة لكل مريض (Clean Unused Session)
                        </div>
                        <p className="text-emerald-800 leading-relaxed">
                          الروابط المولدة هنا تتضمن رمز جلسة فريد (Unique Token) بحيث تفتح عند العميل فارغة ونظيفة تماماً وبدون أي أقفال أو حظر 24 ساعة من الأجهزة الأخرى.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          إنشاء وإرسال رابط مسابقة مخصص للعميل
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          أدخل اسم المريض ورقم هاتفه لاختيار الرابط ومشاركته عبر الواتساب بنقرة واحدة
                        </p>
                      </div>

                      {/* Domain source toggle */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          مصدر الرابط (الرابط المستهدف):
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setInviteUseGitHub(true)}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                              inviteUseGitHub
                                ? 'bg-rose-50 border-[#8B1E2D] text-[#8B1E2D] shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>رابط GitHub Pages الرسمي</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setInviteUseGitHub(false)}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                              !inviteUseGitHub
                                ? 'bg-rose-50 border-[#8B1E2D] text-[#8B1E2D] shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <Globe className="h-3.5 w-3.5" />
                            <span>رابط المنصة الحالي</span>
                          </button>
                        </div>
                      </div>

                      {/* Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">اسم المريض (اختياري)</label>
                          <input
                            type="text"
                            placeholder="مثال: أ/ أحمد محمد"
                            value={patientNameInput}
                            onChange={(e) => setPatientNameInput(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-[#8B1E2D]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">رقم هاتف المريض (للواتساب)</label>
                          <input
                            type="tel"
                            placeholder="مثال: 01012345678"
                            value={patientPhoneInput}
                            onChange={(e) => setPatientPhoneInput(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-[#8B1E2D] font-mono text-right"
                          />
                        </div>
                      </div>

                      {/* Game choice */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          توجيه المريض للعبة معينة:
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center">
                          {[
                            { id: 'all', label: 'الكل (حر)' },
                            { id: 'wheel', label: 'عجلة الحظ' },
                            { id: 'scratch', label: 'كارت الخدش' },
                            { id: 'box', label: 'صندوق الهدايا' },
                            { id: 'match', label: 'كروت الذاكرة' },
                            { id: 'quiz', label: 'المسابقة' },
                          ].map((g) => (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => setInviteGame(g.id as any)}
                              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition ${
                                inviteGame === g.id
                                  ? 'bg-[#8B1E2D] text-white border-[#8B1E2D]'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {g.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Live Generated Link Box */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <label className="block text-xs font-bold text-slate-700">الرابط المولد المخصص للمريض:</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={activePlayUrl}
                            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono text-slate-700 dir-ltr text-left select-all"
                          />
                          <button
                            type="button"
                            onClick={handleCopyInviteLink}
                            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 ${
                              inviteCopied
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-800 hover:bg-slate-900 text-white'
                            }`}
                          >
                            <Copy className="h-4 w-4" />
                            <span>{inviteCopied ? 'تم النسخ بنجاح!' : 'نسخ الرابط'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <a
                          href={activePlayUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4 text-slate-500" />
                          <span>فتح واختبار الرابط (جولة نظيفة جديدة)</span>
                        </a>

                        <a
                          href={patientPhoneInput.trim().length >= 8 ? waInviteUrl : '#'}
                          onClick={(e) => {
                            if (patientPhoneInput.trim().length < 8) {
                              e.preventDefault();
                              alert('يرجى كتابة رقم هاتف المريض لإرسال الدعوة عبر الواتساب مباشرة.');
                            }
                          }}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`py-2.5 px-4 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 ${
                            patientPhoneInput.trim().length >= 8
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                              : 'bg-emerald-100 text-emerald-800 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>إرسال دعوة المسابقة عبر الواتساب</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ========================================================= */}
              {/* TAB 7: LAB SETTINGS & CLOUD SYNC (EDIT ALL FIELDS) */}
              {/* ========================================================= */}
              {activeTab === 'settings' && (
                <div className="max-w-3xl mx-auto space-y-5">
                  {/* General Settings */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          تعديل بيانات المعمل والشعار وأرقام الاتصال
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          تنعكس هذه البيانات تلقائياً على رسائل الواتساب والهيدر وكروت الكوبونات
                        </p>
                      </div>

                      <span className="text-xs font-bold text-[#8B1E2D] bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                        حقول قابلة للتعديل المباشر
                      </span>
                    </div>

                    <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">اسم المعمل الرسمي (بالعربية)</label>
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
                          <label className="block font-bold text-slate-700 mb-1">الخط الساخن الموحد</label>
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
                          <label className="block font-bold text-slate-700 mb-1">
                            رمز مرور لوحة الإدارة (PIN)
                          </label>
                          <div className="relative">
                            <input
                              type={showSettingsPin ? 'text' : 'password'}
                              value={settingsForm.adminPin}
                              onChange={(e) => setSettingsForm({ ...settingsForm, adminPin: e.target.value })}
                              placeholder="أدخل رمز المرور السري..."
                              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono text-center tracking-widest pl-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowSettingsPin(!showSettingsPin)}
                              className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 transition"
                              title={showSettingsPin ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                            >
                              {showSettingsPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">
                            🔒 يمكن تعديل كلمة المرور في أي وقت، واضغط &quot;حفظ الإعدادات والمزامنة&quot; بالأسفل لتفعيلها.
                          </p>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">مدة صلاحية الكوبونات (بالساعات)</label>
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

                      {/* Reset trial restrictions */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            resetPlaySessionAdmin();
                            alert('تمت إعادة تعيين قيد الـ 24 ساعة لمتصفحك بنجاح! يمكنك الآن تجربة اللعب كمريض جديد.');
                          }}
                          className="px-3.5 py-2 rounded-xl bg-rose-50 text-[#8B1E2D] border border-rose-200 text-xs font-bold hover:bg-rose-100 transition"
                        >
                          إعادة تعيين قيود التجربة للمتصفح الحالي
                        </button>
                      </div>

                      {settingsSaved && (
                        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                          تم حفظ وتطبيق كافة التعديلات بنجاح!
                        </div>
                      )}

                      <div className="flex justify-end pt-3">
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-xl bg-[#8B1E2D] text-white text-xs font-bold shadow hover:bg-[#731925] transition"
                        >
                          حفظ كافة تعديلات المعمل
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* GitHub Cloud Sync Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                        <RefreshCw className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          المزامنة السحابية الفورية مع GitHub
                        </h4>
                        <p className="text-xs text-slate-500">
                          نشر كافة التعديلات إلى موقعك الحي ومستودع GitHub ({GITHUB_SYNC_CONFIG.OWNER}/{GITHUB_SYNC_CONFIG.REPO})
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
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2"
                      >
                        <RefreshCw className={`h-4 w-4 ${isSyncingGitHub ? 'animate-spin' : ''}`} />
                        <span>{isSyncingGitHub ? 'جارٍ المزامنة السحابية...' : 'مزامنة كافة التعديلات مع GitHub الآن'}</span>
                      </button>
                    </div>
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
          onSuccess={() => {
            setSelectedClaimForBooking(null);
            onRefreshClaims();
          }}
        />
      )}
    </div>
  );
};
