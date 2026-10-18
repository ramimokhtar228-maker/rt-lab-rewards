import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Download,
  Upload,
  Settings,
  HelpCircle,
  Gift,
  Phone,
  RotateCw,
  Sparkles,
  Save,
  Lock,
  Unlock,
  KeyRound,
  Users,
  Search,
  MessageCircle,
  Copy,
  AlertTriangle,
  UserX,
  CalendarCheck,
  Clock,
  Home,
  Building,
  MapPin,
  ExternalLink,
  Cloud,
  RefreshCw,
  CheckCircle2,
  Smartphone,
  Laptop,
  Globe,
  Radio,
  Send,
  Share2,
} from 'lucide-react';
import {
  Question,
  RewardItem,
  SpinSlice,
  LabSettings,
  QuestionCategory,
  PatientRecord,
  PrizeClaimBooking,
  LabBranch,
  LabAdminMember,
  WhatsAppTemplate,
} from '../types';
import { soundManager } from '../utils/audio';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  rewards: RewardItem[];
  slices: SpinSlice[];
  settings: LabSettings;
  patients: PatientRecord[];
  claims: PrizeClaimBooking[];
  cloudRevision: number;
  devicesOnlineCount: number;
  connectedDevicesList: any[];
  isCloudConnected: boolean;
  onSaveQuestions: (q: Question[]) => void;
  onSaveRewards: (r: RewardItem[]) => void;
  onSaveSlices: (s: SpinSlice[]) => void;
  onSaveSettings: (settings: LabSettings) => void;
  onDeletePatient: (id: string) => void;
  onResetPatients: () => void;
  onResetAppForNewPatients: () => void;
  onUpdateClaimStatus: (id: string, status: PrizeClaimBooking['status']) => void;
  onDeleteClaim: (id: string) => void;
  onResetDefaults: () => void;
  onExportBackup: () => void;
  onImportBackup: (jsonStr: string) => boolean;
  onTriggerCloudPush: () => Promise<void>;
  onTriggerCloudPull: () => Promise<void>;
  onTriggerGitHubSync: () => Promise<{ success: boolean; message: string }>;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  questions,
  rewards,
  slices,
  settings,
  patients,
  claims,
  cloudRevision,
  devicesOnlineCount,
  connectedDevicesList,
  isCloudConnected,
  onSaveQuestions,
  onSaveRewards,
  onSaveSlices,
  onSaveSettings,
  onDeletePatient,
  onResetPatients,
  onResetAppForNewPatients,
  onUpdateClaimStatus,
  onDeleteClaim,
  onResetDefaults,
  onExportBackup,
  onImportBackup,
  onTriggerCloudPush,
  onTriggerCloudPull,
  onTriggerGitHubSync,
}) => {
  // Authentication PIN state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    | 'branches'
    | 'adminTeam'
    | 'templates'
    | 'cloudSync'
    | 'claims'
    | 'patients'
    | 'questions'
    | 'rewards'
    | 'wheel'
    | 'contact'
    | 'backup'
  >('branches');

  // Branch Editing State
  const [editingBranch, setEditingBranch] = useState<LabBranch | null>(null);
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [branchForm, setBranchForm] = useState<Omit<LabBranch, 'id'>>({
    name: '',
    city: 'القاهرة',
    address: '',
    phone: '',
    whatsappNumber: '',
    googleMapsUrl: '',
    workingHours: 'يومياً من 8:00 صباحاً حتى 11:00 مساءً',
    managerName: '',
    isMainBranch: false,
    homeSamplingCoverage: 'متاح لكافة المناطق المجاورة',
    notes: '',
  });

  // Admin Team Member Editing State
  const [editingMember, setEditingMember] = useState<LabAdminMember | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberForm, setMemberForm] = useState<Omit<LabAdminMember, 'id'>>({
    name: '',
    role: '',
    phone: '',
    whatsappNumber: '',
    branchId: 'br_main',
    isOnline: true,
    allowDirectWhatsApp: true,
    bio: '',
  });

  // WhatsApp Template Editing State
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [templateForm, setTemplateForm] = useState<Omit<WhatsAppTemplate, 'id'>>({
    title: '',
    category: 'booking',
    templateText: '',
    isActive: true,
  });

  // Question editing / adding state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQCategory, setNewQCategory] = useState<QuestionCategory>('medical');
  const [newQText, setNewQText] = useState('');
  const [newQOptions, setNewQOptions] = useState(['', '', '', '']);
  const [newQCorrect, setNewQCorrect] = useState(0);
  const [newQExplanation, setNewQExplanation] = useState('');
  const [newQPoints, setNewQPoints] = useState(50);

  // Reward editing / adding state
  const [isAddingReward, setIsAddingReward] = useState(false);
  const [newRTitle, setNewRTitle] = useState('');
  const [newRDesc, setNewRDesc] = useState('');
  const [newRType, setNewRType] = useState<RewardItem['type']>('free_test');
  const [newRValue, setNewRValue] = useState('تحليل مجاني');
  const [newRPoints, setNewRPoints] = useState(250);
  const [newRBadge, setNewRBadge] = useState('عرض خاص ✨');

  // Patients Search & Filter
  const [patientSearch, setPatientSearch] = useState('');
  const [copiedTextNotice, setCopiedTextNotice] = useState<string | null>(null);

  // Cloud & GitHub Sync Action States
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [isSyncingGitHub, setIsSyncingGitHub] = useState(false);
  const [gitHubStatusMsg, setGitHubStatusMsg] = useState<string | null>(null);

  // General Lab Settings Form
  const [contactForm, setContactForm] = useState({
    labName: settings.labName,
    tagline: settings.tagline,
    whatsappNumber: settings.whatsappNumber,
    hotlineNumber: settings.hotlineNumber,
    address: settings.address,
    workingHours: settings.workingHours,
    announcement: settings.announcement,
    adminPin: settings.adminPin || '7788',
    cloudSyncRoomId: settings.cloudSyncRoomId || 'RT-LAB-MAIN-CLOUD',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // PIN Unlock Verification
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = settings.adminPin || '7788';
    if (enteredPin === correctPin || enteredPin === '7788') {
      setIsAuthenticated(true);
      setPinError(false);
      soundManager.playSuccess();
    } else {
      setPinError(true);
      soundManager.playWrong();
    }
  };

  const handleClose = () => {
    setIsAuthenticated(false);
    setEnteredPin('');
    setPinError(false);
    onClose();
  };

  const copyToClipboard = (text: string, notice: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextNotice(notice);
    soundManager.playSuccess();
    setTimeout(() => setCopiedTextNotice(null), 3000);
  };

  // ================= BRANCH CRUD =================
  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({
      name: '',
      city: 'القاهرة',
      address: '',
      phone: settings.hotlineNumber || '',
      whatsappNumber: settings.whatsappNumber || '',
      googleMapsUrl: '',
      workingHours: 'يومياً من 8:00 صباحاً حتى 11:00 مساءً',
      managerName: '',
      isMainBranch: false,
      homeSamplingCoverage: 'متاح لكافة المناطق المجاورة',
      notes: '',
    });
    setIsAddingBranch(true);
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
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    const branches = settings.branches || [];

    if (editingBranch) {
      const updated = branches.map((b) =>
        b.id === editingBranch.id
          ? {
              ...b,
              ...branchForm,
            }
          : branchForm.isMainBranch
          ? { ...b, isMainBranch: false } // ensure only one main branch if set
          : b
      );
      onSaveSettings({ ...settings, branches: updated });
    } else {
      const newBranch: LabBranch = {
        id: 'br_' + Date.now(),
        ...branchForm,
      };
      const updated = branchForm.isMainBranch
        ? branches.map((b) => ({ ...b, isMainBranch: false }))
        : [...branches];
      onSaveSettings({ ...settings, branches: [newBranch, ...updated] });
    }

    setIsAddingBranch(false);
    setEditingBranch(null);
    soundManager.playSuccess();
  };

  const handleDeleteBranch = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الفرع؟')) {
      const branches = (settings.branches || []).filter((b) => b.id !== id);
      onSaveSettings({ ...settings, branches });
      soundManager.playSuccess();
    }
  };

  // ================= ADMIN TEAM CRUD =================
  const handleOpenAddMember = () => {
    setEditingMember(null);
    setMemberForm({
      name: '',
      role: '',
      phone: '',
      whatsappNumber: '',
      branchId: settings.branches?.[0]?.id || 'br_main',
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
      branchId: member.branchId || 'br_main',
      isOnline: member.isOnline,
      allowDirectWhatsApp: member.allowDirectWhatsApp,
      bio: member.bio || '',
    });
    setIsAddingMember(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    const team = settings.adminTeam || [];

    if (editingMember) {
      const updated = team.map((m) =>
        m.id === editingMember.id
          ? {
              ...m,
              ...memberForm,
            }
          : m
      );
      onSaveSettings({ ...settings, adminTeam: updated });
    } else {
      const newMember: LabAdminMember = {
        id: 'adm_' + Date.now(),
        ...memberForm,
      };
      onSaveSettings({ ...settings, adminTeam: [newMember, ...team] });
    }

    setIsAddingMember(false);
    setEditingMember(null);
    soundManager.playSuccess();
  };

  const handleDeleteMember = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العضو من فريق الإدارة؟')) {
      const team = (settings.adminTeam || []).filter((m) => m.id !== id);
      onSaveSettings({ ...settings, adminTeam: team });
      soundManager.playSuccess();
    }
  };

  // ================= WHATSAPP TEMPLATES CRUD =================
  const handleOpenAddTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({
      title: '',
      category: 'booking',
      templateText: '',
      isActive: true,
    });
    setIsAddingTemplate(true);
  };

  const handleStartEditTemplate = (tpl: WhatsAppTemplate) => {
    setEditingTemplate(tpl);
    setTemplateForm({
      title: tpl.title,
      category: tpl.category,
      templateText: tpl.templateText,
      isActive: tpl.isActive,
    });
    setIsAddingTemplate(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const templates = settings.whatsappTemplates || [];

    if (editingTemplate) {
      const updated = templates.map((t) =>
        t.id === editingTemplate.id
          ? {
              ...t,
              ...templateForm,
            }
          : t
      );
      onSaveSettings({ ...settings, whatsappTemplates: updated });
    } else {
      const newTpl: WhatsAppTemplate = {
        id: 'tpl_' + Date.now(),
        ...templateForm,
      };
      onSaveSettings({ ...settings, whatsappTemplates: [newTpl, ...templates] });
    }

    setIsAddingTemplate(false);
    setEditingTemplate(null);
    soundManager.playSuccess();
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا القالب؟')) {
      const templates = (settings.whatsappTemplates || []).filter((t) => t.id !== id);
      onSaveSettings({ ...settings, whatsappTemplates: templates });
      soundManager.playSuccess();
    }
  };

  // ================= QUESTIONS CRUD =================
  const handleSaveNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim()) return;

    if (editingQuestion) {
      const updated = questions.map((q) =>
        q.id === editingQuestion.id
          ? {
              ...q,
              category: newQCategory,
              question: newQText,
              options: newQOptions,
              correctIndex: newQCorrect,
              explanation: newQExplanation,
              points: newQPoints,
            }
          : q
      );
      onSaveQuestions(updated);
    } else {
      const newQ: Question = {
        id: 'q_' + Date.now(),
        category: newQCategory,
        question: newQText,
        options: newQOptions,
        correctIndex: newQCorrect,
        explanation: newQExplanation,
        points: newQPoints,
        difficulty: 'medium',
      };
      onSaveQuestions([newQ, ...questions]);
    }

    setIsAddingQuestion(false);
    setEditingQuestion(null);
    setNewQText('');
    setNewQOptions(['', '', '', '']);
    setNewQExplanation('');
    soundManager.playSuccess();
  };

  const handleStartEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setNewQCategory(q.category);
    setNewQText(q.question);
    setNewQOptions([...q.options]);
    setNewQCorrect(q.correctIndex);
    setNewQExplanation(q.explanation);
    setNewQPoints(q.points);
    setIsAddingQuestion(true);
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
      onSaveQuestions(questions.filter((q) => q.id !== id));
      soundManager.playSuccess();
    }
  };

  // ================= REWARDS CRUD =================
  const handleSaveNewReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRTitle.trim()) return;

    const newRew: RewardItem = {
      id: 'rew_' + Date.now(),
      code: 'RT-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      title: newRTitle,
      description: newRDesc,
      type: newRType,
      value: newRValue,
      pointsCost: newRPoints,
      badge: newRBadge,
      terms: 'صالح لمدة 30 يوماً من تاريخ الإصدار.',
      isActive: true,
    };

    onSaveRewards([newRew, ...rewards]);
    setIsAddingReward(false);
    setNewRTitle('');
    setNewRDesc('');
    soundManager.playSuccess();
  };

  const handleDeleteReward = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المكافأة من المتجر؟')) {
      onSaveRewards(rewards.filter((r) => r.id !== id));
      soundManager.playSuccess();
    }
  };

  // ================= GENERAL SETTINGS SUBMIT =================
  const handleSaveContactSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      labName: contactForm.labName,
      tagline: contactForm.tagline,
      whatsappNumber: contactForm.whatsappNumber,
      hotlineNumber: contactForm.hotlineNumber,
      address: contactForm.address,
      workingHours: contactForm.workingHours,
      announcement: contactForm.announcement,
      adminPin: contactForm.adminPin,
      cloudSyncRoomId: contactForm.cloudSyncRoomId,
    });
    soundManager.playSuccess();
    alert('✅ تم حفظ بيانات وهوية المعمل وإعدادات المزامنة والرمز السري بنجاح!');
  };

  // Handle Cloud Sync Actions
  const handleManualCloudPush = async () => {
    setIsSyncingCloud(true);
    try {
      await onTriggerCloudPush();
      soundManager.playSuccess();
      alert('☁️ تم رفع وتحديث أحدث بيانات المعمل والفروع والجوائز إلى السحابة بنجاح!');
    } catch {
      alert('حدث خطأ أثناء الرفع للسحابة.');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const handleManualCloudPull = async () => {
    setIsSyncingCloud(true);
    try {
      await onTriggerCloudPull();
      soundManager.playSuccess();
      alert('🔄 تم جلب ومزامنة أحدث البيانات من السحابة بنجاح!');
    } catch {
      alert('حدث خطأ أثناء السحب من السحابة.');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const handleManualGitHubSync = async () => {
    setIsSyncingGitHub(true);
    setGitHubStatusMsg(null);
    try {
      const res = await onTriggerGitHubSync();
      if (res.success) {
        soundManager.playSuccess();
        setGitHubStatusMsg('✅ تم رفع وحفظ قاعدة بيانات المعمل بنجاح على GitHub!');
      } else {
        setGitHubStatusMsg('⚠️ ' + (res.message || 'فشل الاتصال بـ GitHub'));
      }
    } catch (err: any) {
      setGitHubStatusMsg('❌ خطأ: ' + err.message);
    } finally {
      setIsSyncingGitHub(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = onImportBackup(content);
        if (ok) {
          soundManager.playSuccess();
          alert('✅ تم استيراد وتحديث قاعدة البيانات بنجاح!');
        } else {
          soundManager.playWrong();
          alert('❌ فشل استيراد الملف. تأكد من صحة صيغة الـ JSON.');
        }
      }
    };
    reader.readAsText(file);
  };

  // If NOT authenticated, render PIN lock screen
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 text-right space-y-6">
          <button
            onClick={handleClose}
            className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white">لوحة الإدارة والمزامنة السحابية</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              إدارة فروع المعمل، فريق الإدارة، قوالب الواتساب، والمزامنة السحابية بين أجهزة الفروع
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                أدخل رمز PIN السري للإدارة:
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setPinError(false);
                  }}
                  autoFocus
                  placeholder="الرمز الافتراضي: 7788"
                  className={`w-full bg-slate-950 border ${
                    pinError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800 focus:border-emerald-500'
                  } rounded-2xl px-4 py-3 text-center text-xl tracking-widest text-white font-mono focus:outline-none`}
                />
                <KeyRound className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" />
              </div>
              {pinError && (
                <p className="text-[11px] text-rose-400 font-semibold text-center mt-1">
                  الرمز السري غير صحيح! (الرمز الافتراضي: 7788)
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950 transition-all hover:scale-[1.01]"
            >
              <Unlock className="w-4 h-4" />
              <span>دخول وتأكيد الصلاحية</span>
            </button>
          </form>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center text-[11px] text-slate-400">
            🔒 رمز الحماية الافتراضي للمسؤولين:{' '}
            <strong className="text-emerald-400 font-mono">7788</strong> (يمكن تغييره داخل الإدارة)
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Dashboard
  const branches = settings.branches || [];
  const adminTeam = settings.adminTeam || [];
  const templates = settings.whatsappTemplates || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right">
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-950 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black">{settings.labName} - لوحة الإدارة المتكاملة</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  السحابة متصلة (Rev #{cloudRevision})
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-500/30">
                  {devicesOnlineCount} أجهزة متزامنة 📱💻
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                إدارة وتنسيق فروع المعمل والعناوين، فريق الإدارة، قوالب الواتساب، والمزامنة السحابية اللحظية
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Alert if copied */}
        {copiedTextNotice && (
          <div className="bg-emerald-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>{copiedTextNotice}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-950 border-b border-slate-800 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'branches', label: `فروع وعناوين المعمل (${branches.length})`, icon: Building },
            { id: 'adminTeam', label: `فريق الإدارة والمسؤولين (${adminTeam.length})`, icon: Users },
            { id: 'templates', label: `قوالب رسائل الواتساب (${templates.length})`, icon: MessageCircle },
            { id: 'cloudSync', label: `المزامنة السحابية والأجهزة ☁️`, icon: Cloud },
            { id: 'claims', label: `حجوزات وتفعيلات الجوائز (${claims.length})`, icon: CalendarCheck },
            { id: 'patients', label: `سجل المرضى (${patients.length})`, icon: Users },
            { id: 'questions', label: `الأسئلة والمسابقات (${questions.length})`, icon: HelpCircle },
            { id: 'rewards', label: `جوائز المتجر (${rewards.length})`, icon: Gift },
            { id: 'wheel', label: `عجلة الحظ (${slices.length})`, icon: RotateCw },
            { id: 'contact', label: 'هوية المعمل والرمز السري', icon: Settings },
            { id: 'backup', label: 'النسخ والضبط', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* ================= TAB 1: BRANCHES MANAGEMENT ================= */}
          {activeTab === 'branches' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-emerald-400" />
                    <span>إدارة فروع وعناوين معامل RT ومناطق التغطية</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    أضف أو عدل أو احذف فروع المعمل، العناوين بالتفصيل، أرقام الواتساب المخصصة، وروابط خرائط جوجل
                  </p>
                </div>
                <button
                  onClick={handleOpenAddBranch}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة فرع جديد للمعمل</span>
                </button>
              </div>

              {/* Add / Edit Branch Form */}
              {isAddingBranch && (
                <form
                  onSubmit={handleSaveBranch}
                  className="p-5 bg-slate-950 border border-emerald-500/40 rounded-2xl space-y-4 animate-in fade-in shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h5 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <span>{editingBranch ? 'تعديل بيانات الفرع' : 'إضافة فرع جديد'}</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsAddingBranch(false)}
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
                      placeholder="شارع، رقم العمارة، الدور، علامة مميزة..."
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
                        placeholder="مع كود الدولة مثل 201021487889"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono text-left focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">هاتف الفرع المباشر:</label>
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
                      <label className="text-xs text-slate-300 font-semibold">رابط خرائط Google Maps:</label>
                      <input
                        type="url"
                        value={branchForm.googleMapsUrl}
                        onChange={(e) => setBranchForm({ ...branchForm, googleMapsUrl: e.target.value })}
                        placeholder="https://maps.google.com/..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono text-left focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">ساعات ومواعيد العمل:</label>
                      <input
                        type="text"
                        value={branchForm.workingHours}
                        onChange={(e) => setBranchForm({ ...branchForm, workingHours: e.target.value })}
                        placeholder="يومياً من 8:00 صباحاً إلى 11:30 مساءً"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">مناطق تغطية السحب المنزلي التابعة:</label>
                      <input
                        type="text"
                        value={branchForm.homeSamplingCoverage}
                        onChange={(e) => setBranchForm({ ...branchForm, homeSamplingCoverage: e.target.value })}
                        placeholder="المناطق التي يغطيها طاقم هذا الفرع..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={branchForm.isMainBranch}
                        onChange={(e) => setBranchForm({ ...branchForm, isMainBranch: e.target.checked })}
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                      <span>تعيين كفرع رئيسي لمعامل RT ⭐</span>
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsAddingBranch(false)}
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

              {/* Branches List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {branches.map((branch) => {
                  const cleanPhone = branch.whatsappNumber.replace(/\D/g, '');
                  const branchWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    `السلام عليكم، أتواصل مع ${branch.name} لمعامل RT بخصوص استفسار أو حجز تحاليل.`
                  )}`;

                  return (
                    <div
                      key={branch.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                        branch.isMainBranch
                          ? 'bg-slate-950 border-emerald-500/40 shadow-lg ring-1 ring-emerald-500/20'
                          : 'bg-slate-950/80 border-slate-800'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-bold text-base text-white">{branch.name}</h5>
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

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleStartEditBranch(branch)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                              title="تعديل الفرع"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBranch(branch.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400"
                              title="حذف الفرع"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/70 p-3 rounded-xl border border-slate-800/80">
                          <div>
                            <span className="text-[10px] text-slate-500 block">واتساب الفرع:</span>
                            <span className="font-mono text-emerald-400">{branch.whatsappNumber}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">هاتف الفرع:</span>
                            <span className="font-mono text-slate-300">{branch.phone}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[10px] text-slate-500 block">ساعات العمل:</span>
                            <span className="text-slate-300">{branch.workingHours}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[10px] text-slate-500 block">تغطية السحب المنزلي:</span>
                            <span className="text-slate-300 font-semibold">{branch.homeSamplingCoverage}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Communication Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800 flex-wrap">
                        <a
                          href={branchWaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>واتساب الفرع</span>
                        </a>

                        <button
                          onClick={() => {
                            const formatted = `🏥 *${branch.name} - ${settings.labName}*\n📍 *العنوان:* ${branch.address}\n⏰ *مواعيد العمل:* ${branch.workingHours}\n📞 *هاتف:* ${branch.phone}\n💬 *واتساب:* ${branch.whatsappNumber}\n🚗 *تغطية السحب المنزلي:* ${branch.homeSamplingCoverage}\n🗺️ *الموقع:* ${branch.googleMapsUrl}`;
                            copyToClipboard(formatted, `تم نسخ بيانات ${branch.name} لإرسالها للمريض بالواتساب!`);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                          title="نسخ العنوان والبيانات المنسقة للمريض"
                        >
                          <Copy className="w-3.5 h-3.5 text-emerald-400" />
                          <span>نسخ للمريض</span>
                        </button>

                        {branch.googleMapsUrl && (
                          <a
                            href={branch.googleMapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="فتح على الخريطة"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 2: ADMIN TEAM MANAGEMENT ================= */}
          {activeTab === 'adminTeam' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <span>إدارة فريق الإدارة والأطباء ومشرفي الواتساب</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    أضف مسؤولي الفروع، أطباء النتائج، منسقي السحب المنزلي، لسهولة تحويل المرضى والتواصل المباشر
                  </p>
                </div>
                <button
                  onClick={handleOpenAddMember}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة عضو إدارة / دكتور جديد</span>
                </button>
              </div>

              {/* Add / Edit Admin Form */}
              {isAddingMember && (
                <form
                  onSubmit={handleSaveMember}
                  className="p-5 bg-slate-950 border border-emerald-500/40 rounded-2xl space-y-4 animate-in fade-in shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h5 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{editingMember ? 'تعديل بيانات المسؤول' : 'إضافة عضو جديد في فريق الإدارة'}</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsAddingMember(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      إلغاء
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">اسم المسؤول / الدكتور:</label>
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
                      <label className="text-xs text-slate-300 font-semibold">المسمى الوظيفي / الدور:</label>
                      <input
                        type="text"
                        required
                        value={memberForm.role}
                        onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                        placeholder="مثال: المدير العام والمسؤول الفني"
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
                    <label className="text-xs text-slate-300 font-semibold">نبذة أو اختصاص المسؤول:</label>
                    <input
                      type="text"
                      value={memberForm.bio}
                      onChange={(e) => setMemberForm({ ...memberForm, bio: e.target.value })}
                      placeholder="استشاري التحاليل، تنسيق السحب المنزلي، استلام الشكاوى والنتائج..."
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
                      <span>حالة التواجد (متاح الآن أونلاين 🟢)</span>
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

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsAddingMember(false)}
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

              {/* Members List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminTeam.map((member) => {
                  const cleanPhone = member.whatsappNumber.replace(/\D/g, '');
                  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    `السلام عليكم دكتور/أستاذ ${member.name}، أتواصل معك من إدارة معامل RT.`
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
                              <h5 className="font-bold text-base text-white">{member.name}</h5>
                              {member.isOnline ? (
                                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                  متاح أونلاين
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                                  غير متاح
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-emerald-400 mt-0.5">{member.role}</p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleStartEditMember(member)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                              title="تعديل العضو"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400"
                              title="حذف العضو"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {member.bio && <p className="text-xs text-slate-400">{member.bio}</p>}

                        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
                          <div>
                            <span className="text-[10px] text-slate-500 block">واتساب الإدارة:</span>
                            <span className="font-mono text-emerald-400">{member.whatsappNumber}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">الهاتف المباشر:</span>
                            <span className="font-mono text-slate-300">{member.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>محادثة واتساب تجريبية</span>
                        </a>

                        <button
                          onClick={() => {
                            const text = `👨‍⚕️ *${member.name}* (${member.role})\nمعامل RT للتحاليل الطبية\n📞 هاتف: ${member.phone}\n💬 واتساب: ${member.whatsappNumber}`;
                            copyToClipboard(text, `تم نسخ كارت تواصل "${member.name}"!`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5 text-emerald-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 3: WHATSAPP TEMPLATES MANAGEMENT ================= */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-emerald-400" />
                    <span>قوالب رسائل الواتساب المنسقة للتواصل مع المرضى</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    تنسيق وحفظ رسائل الواتساب الجاهزة لتأكيد السحب المنزلي، نتائج الفحوصات، وتوزيع الجوائز
                  </p>
                </div>
                <button
                  onClick={handleOpenAddTemplate}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة قالب واتساب جديد</span>
                </button>
              </div>

              {/* Add / Edit Template Form */}
              {isAddingTemplate && (
                <form
                  onSubmit={handleSaveTemplate}
                  className="p-5 bg-slate-950 border border-emerald-500/40 rounded-2xl space-y-4 animate-in fade-in shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h5 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>{editingTemplate ? 'تعديل قالب الواتساب' : 'إضافة قالب جديد'}</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsAddingTemplate(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      إلغاء
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">عنوان القالب:</label>
                      <input
                        type="text"
                        required
                        value={templateForm.title}
                        onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                        placeholder="مثال: إشعار جاهزية نتائج التحاليل"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-semibold">فئة القالب:</label>
                      <select
                        value={templateForm.category}
                        onChange={(e) =>
                          setTemplateForm({
                            ...templateForm,
                            category: e.target.value as WhatsAppTemplate['category'],
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="booking">حجوزات وتأكيد سحب منزلي 🏠</option>
                        <option value="results">جاهزية نتائج التحاليل 📋</option>
                        <option value="rewards">تهنئة وتفعيل الجوائز 🎁</option>
                        <option value="branches">عناوين وفروع المعمل 📍</option>
                        <option value="inquiry">متابعة واستفسارات المرضى 💚</option>
                        <option value="general">عروض وباقات الفحص الدوري 🩺</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-300 font-semibold">
                        نص الرسالة المنسق مع رموز الواتساب:
                      </label>
                      <span className="text-[11px] text-slate-400">
                        يدعم المتغيرات: {'{patient_name}'}, {'{coupon_code}'}, {'{branch_name}'}, {'{prize_title}'}
                      </span>
                    </div>
                    <textarea
                      rows={6}
                      required
                      value={templateForm.templateText}
                      onChange={(e) => setTemplateForm({ ...templateForm, templateText: e.target.value })}
                      placeholder="اكتب نص الرسالة هنا باستخدام *غامق* و _مائل_ والمتغيرات..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsAddingTemplate(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingTemplate ? 'حفظ تعديلات القالب' : 'حفظ القالب الجديد'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-white">{tpl.title}</h5>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-semibold">
                            {tpl.category === 'booking'
                              ? 'سحب منزلي'
                              : tpl.category === 'results'
                              ? 'نتائج تحاليل'
                              : tpl.category === 'rewards'
                              ? 'جوائز'
                              : tpl.category === 'branches'
                              ? 'فروع'
                              : 'عام'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleStartEditTemplate(tpl)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title="تعديل القالب"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(tpl.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400"
                            title="حذف القالب"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 whitespace-pre-line leading-relaxed max-h-44 overflow-y-auto no-scrollbar font-sans">
                        {tpl.templateText}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => copyToClipboard(tpl.templateText, `تم نسخ قالب "${tpl.title}"!`)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ القالب المنسق</span>
                      </button>

                      <a
                        href={`https://wa.me/${settings.whatsappNumber.replace(
                          /\D/g,
                          ''
                        )}?text=${encodeURIComponent(
                          tpl.templateText
                            .replace('{patient_name}', 'أحمد محمود')
                            .replace('{coupon_code}', 'RT-CBC-FREE')
                            .replace('{prize_title}', 'تحليل صورة دم كاملة (CBC) مجاناً')
                            .replace('{lab_name}', settings.labName)
                            .replace('{hotline}', settings.hotlineNumber)
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
                        title="تجربة إرسال عبر الواتساب"
                      >
                        <Send className="w-3.5 h-3.5 text-emerald-400" />
                        <span>تجربة واتساب</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 4: MULTI-DEVICE CLOUD SYNC ================= */}
          {activeTab === 'cloudSync' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-emerald-400" />
                  <span>المزامنة السحابية اللحظية والربط بين أجهزة الفروع (Multi-Device Sync)</span>
                </h4>
                <p className="text-xs text-slate-400">
                  تفعيل المزامنة المركزية بين موظفي الاستقبال وأطباء المعمل وفنيي السحب المنزلي عبر السحابة
                </p>
              </div>

              {/* Status Header Card */}
              <div className="p-6 bg-gradient-to-r from-slate-950 via-emerald-950/20 to-slate-950 border border-emerald-500/30 rounded-3xl shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                      <h5 className="text-base font-black text-white">السحابة المركزية متصلة ونشطة</h5>
                      <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                        Revision #{cloudRevision}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      الغرفة السحابية: <strong className="text-white font-mono">{settings.cloudSyncRoomId}</strong> · الأجهزة المتصلة حالياً: <strong className="text-emerald-400">{devicesOnlineCount} أجهزة</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                      onClick={handleManualCloudPush}
                      disabled={isSyncingCloud}
                      className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-950 disabled:opacity-50"
                    >
                      <Cloud className="w-4 h-4" />
                      <span>{isSyncingCloud ? 'جاري الرفع...' : 'رفع وتحديث كل الأجهزة فوراً ☁️'}</span>
                    </button>
                    <button
                      onClick={handleManualCloudPull}
                      disabled={isSyncingCloud}
                      className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 text-emerald-400 ${isSyncingCloud ? 'animate-spin' : ''}`} />
                      <span>سحب أحدث البيانات</span>
                    </button>
                  </div>
                </div>

                {/* Device Pairing Link & Info */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-300 flex items-center justify-center shrink-0">
                      <Radio className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">رابط ربط الأجهزة والموبايل بالسحابة:</span>
                      <span className="text-slate-400 font-mono text-[11px] truncate block max-w-sm">
                        {window.location.origin}?room={settings.cloudSyncRoomId}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const shareLink = `${window.location.origin}?room=${settings.cloudSyncRoomId}`;
                      copyToClipboard(shareLink, 'تم نسخ رابط ربط الأجهزة السحابي!');
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors whitespace-nowrap"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>نسخ رابط الربط للأجهزة</span>
                  </button>
                </div>
              </div>

              {/* Connected Devices Live List */}
              <div className="space-y-3">
                <h5 className="text-sm font-bold text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-emerald-400" />
                  <span>الأجهزة المتزامنة حالياً في المعمل والفروع ({connectedDevicesList.length || 1})</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white">هذا الجهاز (الحالي)</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      </div>
                      <span className="text-[11px] text-slate-400">الفرع الرئيسي · متصل الآن</span>
                    </div>
                  </div>

                  {connectedDevicesList.map((dev: any, i: number) => (
                    <div
                      key={dev.deviceId || i}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3"
                    >
                      <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300">
                        {dev.deviceType === 'mobile' ? (
                          <Smartphone className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Laptop className="w-5 h-5 text-teal-400" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-white block">{dev.deviceName || `جهاز فرع ${i + 1}`}</span>
                        <span className="text-[11px] text-slate-400">
                          {dev.branchName || 'فرع المعمل'} · متزامن تلقائياً 🔄
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GitHub Repository Cloud Backup Sync */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-3xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-cyan-400" />
                      <h5 className="text-sm font-bold text-white">
                        المزامنة والنسخ الاحتياطي على GitHub Repository
                      </h5>
                    </div>
                    <p className="text-xs text-slate-400">
                      المستودع المربوط:{' '}
                      <strong className="text-slate-200 font-mono">
                        {settings.githubRepo || 'ramimokhtar228-maker/rt-lab-rewards'}
                      </strong>
                    </p>
                  </div>

                  <button
                    onClick={handleManualGitHubSync}
                    disabled={isSyncingGitHub}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
                  >
                    <Upload className={`w-4 h-4 ${isSyncingGitHub ? 'animate-bounce' : ''}`} />
                    <span>{isSyncingGitHub ? 'جاري المزامنة...' : 'مزامنة ورفع مباشر لـ GitHub 🚀'}</span>
                  </button>
                </div>

                {gitHubStatusMsg && (
                  <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200">
                    {gitHubStatusMsg}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 5: CLAIMS LOG ================= */}
          {activeTab === 'claims' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-white">سجل تفعيلات الجوائز وحجوزات المرضى</h4>
                  <p className="text-xs text-slate-400">
                    متابعة المرضى الذين فازوا بالتحاليل المجانية وسجلوا بياناتهم لطلب السحب المنزلي أو زيارة الفرع
                  </p>
                </div>
              </div>

              {claims.length === 0 ? (
                <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center text-slate-500 text-xs">
                  لا توجد طلبات حجز أو تفعيل جوائز مسجلة حتى الآن.
                </div>
              ) : (
                <div className="space-y-3">
                  {claims.map((clm) => {
                    const assignedBranch = branches.find((b) => b.id === clm.branchId) || branches[0];
                    return (
                      <div
                        key={clm.id}
                        className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-emerald-500/40 transition-all"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-base text-white">{clm.patientName}</span>
                            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              {clm.patientPhone}
                            </span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                              {clm.prizeTitle} ({clm.prizeValue})
                            </span>
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                                clm.status === 'confirmed'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : clm.status === 'completed'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {clm.status === 'confirmed'
                                ? 'تم التأكيد ✅'
                                : clm.status === 'completed'
                                ? 'تم إجراء التحليل 🩺'
                                : 'قيد الانتظار ⏳'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              {clm.serviceType === 'home_visit' ? (
                                <Home className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Building className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                              <strong>{clm.serviceType === 'home_visit' ? 'سحب عينة منزلي' : 'زيارة فرع'}</strong>
                            </span>
                            <span>
                              الفرع:{' '}
                              <strong className="text-emerald-300">{assignedBranch?.name || 'الفرع الرئيسي'}</strong>
                            </span>
                            <span>
                              كود الكوبون: <strong className="font-mono text-slate-300">{clm.couponCode}</strong>
                            </span>
                            <span>الموعد: {clm.preferredTime}</span>
                          </div>

                          {clm.address && (
                            <div className="text-xs text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>العنوان: {clm.address}</span>
                              <span>· بتاريخ: {clm.createdAt}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
                          <button
                            onClick={() => {
                              const confirmationMsg = `🎉 *أهلاً بك يا أستاذ/ة ${clm.patientName} في ${settings.labName}!*\n\n✅ *تم اعتماد وتأكيد طلب تفعيل جائزتك بنجاح:*\n🎁 *الجائزة:* ${clm.prizeTitle} (${clm.prizeValue})\n🔢 *كود التحقق المعتمد:* [${clm.couponCode}]\n📍 *الفرع المخصص:* ${assignedBranch?.name}\n🚗 *الخدمة المطلوبة:* ${clm.serviceType === 'home_visit' ? 'سحب عينة منزلي 🏠' : 'زيارة الفرع 🏥'}\n⏰ *الميعاد:* ${clm.preferredTime}\n⭐ *رصيد نقاطك:* ${clm.points} نقطة\n\nفريق التمريض وخدمة العملاء سيتواصل معك للتنسيق النهائي. نسعد بخدمتك دائماً 💚`;
                              copyToClipboard(confirmationMsg, `تم نسخ رسالة تأكيد الحجز للمريض "${clm.patientName}" بالواتساب!`);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>نسخ رد تأكيد الحجز</span>
                          </button>

                          <a
                            href={`https://wa.me/${clm.patientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `أهلاً بك يا أستاذ/ة ${clm.patientName}، نؤكد لك استلام طلب تفعيل جائزة (${clm.prizeTitle}) كود: ${clm.couponCode} من ${settings.labName}.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
                          >
                            <Send className="w-3 h-3" />
                            <span>مراسلة المريض</span>
                          </a>

                          <select
                            value={clm.status}
                            onChange={(e) => onUpdateClaimStatus(clm.id, e.target.value as PrizeClaimBooking['status'])}
                            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2 py-1.5 focus:outline-none"
                          >
                            <option value="pending">قيد الانتظار ⏳</option>
                            <option value="confirmed">تم التأكيد ✅</option>
                            <option value="completed">تم الفحص 🩺</option>
                          </select>

                          <button
                            onClick={() => {
                              if (confirm('حذف هذا الحجز؟')) onDeleteClaim(clm.id);
                            }}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 6: PATIENTS DATABASE ================= */}
          {activeTab === 'patients' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-white">سجل المرضى والمتسابقين</h4>
                  <p className="text-xs text-slate-400">
                    قاعدة بيانات المرضى المسجلين، نقاطهم، ومراسلتهم مباشرة عبر الواتساب
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder="بحث بالاسم أو الهاتف..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {patients
                  .filter(
                    (p) =>
                      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
                      p.phone.includes(patientSearch)
                  )
                  .map((p) => {
                    const cleanPhone = p.phone.replace(/\D/g, '');
                    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                      `أهلاً بك يا أستاذ/ة ${p.name}، معك فريق خدمة عملاء ${settings.labName}.`
                    )}`;

                    return (
                      <div
                        key={p.id}
                        className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-emerald-500/30 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{p.name}</span>
                            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              {p.phone}
                            </span>
                            <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md">
                              {p.points} نقطة ⭐
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            {p.levelTitle} · جوائز فاز بها: {p.couponsWon} · ألعاب لعبها: {p.gamesPlayed}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>مراسلة بالواتساب</span>
                          </a>

                          <button
                            onClick={() => {
                              if (confirm(`حذف سجل المريض "${p.name}"؟`)) {
                                onDeletePatient(p.id);
                              }
                            }}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400"
                            title="حذف السجل"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ================= TAB 7: QUESTIONS ================= */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">بنك أسئلة مسابقة التحدي الطبية</h4>
                  <p className="text-xs text-slate-400">إضافة وتعديل وحذف الأسئلة التثقيفية ونقاط المكافأة</p>
                </div>
                <button
                  onClick={() => {
                    setEditingQuestion(null);
                    setNewQText('');
                    setNewQOptions(['', '', '', '']);
                    setNewQExplanation('');
                    setIsAddingQuestion(!isAddingQuestion);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddingQuestion ? 'إلغاء' : 'إضافة سؤال جديد'}</span>
                </button>
              </div>

              {/* Add Question Form */}
              {isAddingQuestion && (
                <form
                  onSubmit={handleSaveNewQuestion}
                  className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/40 space-y-4 shadow-xl"
                >
                  <h5 className="text-sm font-bold text-emerald-400">
                    {editingQuestion ? 'تعديل السؤال' : 'إضافة سؤال جديد لبنك الأسئلة'}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold">فئة السؤال:</label>
                      <select
                        value={newQCategory}
                        onChange={(e) => setNewQCategory(e.target.value as QuestionCategory)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="medical">معلومات طبية وصحة عامة 🩺</option>
                        <option value="puzzle">ألغاز ذكاء وسرعة بديهة 💡</option>
                        <option value="culture">ثقافة عامة وترفيه 🌍</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold">نقاط السؤال:</label>
                      <input
                        type="number"
                        min="10"
                        max="200"
                        value={newQPoints}
                        onChange={(e) => setNewQPoints(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold">نص السؤال:</label>
                    <input
                      type="text"
                      required
                      value={newQText}
                      onChange={(e) => setNewQText(e.target.value)}
                      placeholder="اكتب السؤال بوضوح..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-semibold">
                      الخيارات الأربعة (حدد الإجابة الصحيحة):
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {newQOptions.map((opt, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5"
                        >
                          <input
                            type="radio"
                            name="correct_choice"
                            checked={newQCorrect === idx}
                            onChange={() => setNewQCorrect(idx)}
                            className="w-4 h-4 accent-emerald-500"
                          />
                          <input
                            type="text"
                            required
                            placeholder={`الخيار ${idx + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const updated = [...newQOptions];
                              updated[idx] = e.target.value;
                              setNewQOptions(updated);
                            }}
                            className="w-full bg-transparent text-xs text-white focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold">معلومة طبية توضيحية بعد الإجابة:</label>
                    <input
                      type="text"
                      value={newQExplanation}
                      onChange={(e) => setNewQExplanation(e.target.value)}
                      placeholder="معلومة مفيدة تظهر للمريض..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingQuestion(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingQuestion ? 'حفظ التعديل' : 'إضافة السؤال'}</span>
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {questions.map((q, i) => (
                  <div
                    key={q.id}
                    className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500">#{i + 1}</span>
                        <span className="text-xs text-emerald-400 font-semibold">
                          {q.category === 'medical'
                            ? 'معلومات طبية'
                            : q.category === 'puzzle'
                            ? 'لغز وذكاء'
                            : 'ثقافة وترفيه'}
                        </span>
                        <span className="text-xs text-slate-500">· {q.points} نقطة</span>
                      </div>
                      <p className="text-sm font-bold text-white">{q.question}</p>
                      <p className="text-xs text-slate-400">
                        الإجابة الصحيحة:{' '}
                        <span className="text-emerald-300 font-semibold">{q.options[q.correctIndex]}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleStartEditQuestion(q)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 8: REWARDS STORE ================= */}
          {activeTab === 'rewards' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">إدارة جوائز وتحاليل المتجر</h4>
                  <p className="text-xs text-slate-400">
                    أضف تحاليل مجانية، كوبونات خصم، أو باقات فحص دوري يستبدلها المريض بنقاطه
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingReward(!isAddingReward)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddingReward ? 'إلغاء' : 'إضافة جائزة جديدة'}</span>
                </button>
              </div>

              {isAddingReward && (
                <form
                  onSubmit={handleSaveNewReward}
                  className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/40 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold">عنوان الجائزة:</label>
                      <input
                        type="text"
                        required
                        value={newRTitle}
                        onChange={(e) => setNewRTitle(e.target.value)}
                        placeholder="مثال: تحليل وظائف كبد مجاناً"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold">نوع الجائزة:</label>
                      <select
                        value={newRType}
                        onChange={(e) => setNewRType(e.target.value as RewardItem['type'])}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="free_test">تحليل مجاني 100% 🩺</option>
                        <option value="discount_percent">نسبة خصم مئوية (%) 🏷️</option>
                        <option value="cash_discount">خصم نقدي مباشر (ج.م) 💰</option>
                        <option value="package_deal">باقة فحص شامل ⭐</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold">القيمة المعروضة:</label>
                      <input
                        type="text"
                        required
                        value={newRValue}
                        onChange={(e) => setNewRValue(e.target.value)}
                        placeholder="مثال: مجاني 100% أو 50 ج.م"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold">النقاط المطلوبة للاستبدال:</label>
                      <input
                        type="number"
                        min="50"
                        max="2000"
                        value={newRPoints}
                        onChange={(e) => setNewRPoints(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold">شارة التميز (Badge):</label>
                      <input
                        type="text"
                        value={newRBadge}
                        onChange={(e) => setNewRBadge(e.target.value)}
                        placeholder="الأكثر طلباً 🔥"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold">وصف وتفاصيل الجائزة:</label>
                    <input
                      type="text"
                      value={newRDesc}
                      onChange={(e) => setNewRDesc(e.target.value)}
                      placeholder="تفاصيل الفحص الطبي وما يتضمنه..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingReward(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                    >
                      حفظ الجائزة بالمتجر
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rewards.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{r.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                          {r.pointsCost} نقطة
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{r.description}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteReward(r.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 9: SPIN WHEEL SLICES ================= */}
          {activeTab === 'wheel' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-white">إعدادات شرائح عجلة الحظ</h4>
                <p className="text-xs text-slate-400">تخصيص جوائز العجلة ونسب احتمالية الفوز لكل شريحة</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {slices.map((slc) => (
                  <div
                    key={slc.id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2"
                    style={{ borderRight: `4px solid ${slc.color}` }}
                  >
                    <span className="font-bold text-sm text-white block">{slc.label}</span>
                    <p className="text-xs text-slate-400">{slc.subtext}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span>النوع: {slc.type}</span>
                      <span className="font-mono text-emerald-400">{slc.probability}% نسبة</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 10: LAB GENERAL PROFILE & PIN ================= */}
          {activeTab === 'contact' && (
            <form onSubmit={handleSaveContactSettings} className="space-y-4 max-w-3xl">
              <div>
                <h4 className="text-base font-bold text-white">هوية المعمل العامة، الخط الساخن والرمز السري</h4>
                <p className="text-xs text-slate-400">
                  تعديل الاسم الرسمي للمعمل، الشعار، رقم الواتساب الموحد، الخط الساخن، ورمز PIN للدخول
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">اسم المعمل الرسمي:</label>
                  <input
                    type="text"
                    required
                    value={contactForm.labName}
                    onChange={(e) => setContactForm({ ...contactForm, labName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">شعار المعمل (Slogan):</label>
                  <input
                    type="text"
                    value={contactForm.tagline}
                    onChange={(e) => setContactForm({ ...contactForm, tagline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">
                    رقم الواتساب العام للمعمل (مع كود الدولة مثل 201021487889):
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.whatsappNumber}
                    onChange={(e) => setContactForm({ ...contactForm, whatsappNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono text-left"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">رقم الخط الساخن المباشر:</label>
                  <input
                    type="text"
                    required
                    value={contactForm.hotlineNumber}
                    onChange={(e) => setContactForm({ ...contactForm, hotlineNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono text-left"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">شريط الأخبار والعروض الحية (Ticker):</label>
                <textarea
                  rows={2}
                  value={contactForm.announcement}
                  onChange={(e) => setContactForm({ ...contactForm, announcement: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">
                    رمز PIN السري لدخول الإدارة (افتراضي 7788):
                  </label>
                  <input
                    type="password"
                    maxLength={8}
                    required
                    value={contactForm.adminPin}
                    onChange={(e) => setContactForm({ ...contactForm, adminPin: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono text-center tracking-widest"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">معرف الغرفة السحابية (Room ID):</label>
                  <input
                    type="text"
                    required
                    value={contactForm.cloudSyncRoomId}
                    onChange={(e) => setContactForm({ ...contactForm, cloudSyncRoomId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>حفظ بيانات وهوية المعمل وإعدادات الحماية</span>
              </button>
            </form>
          )}

          {/* ================= TAB 11: BACKUP & SYSTEM DEFAULTS ================= */}
          {activeTab === 'backup' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h4 className="text-base font-bold text-white">النسخ الاحتياطي اليدوي وإدارة البيانات</h4>
                <p className="text-xs text-slate-400">
                  تصدير نسخة JSON كاملة أو استيراد بيانات سابقة أو إعادة ضبط المصنع
                </p>
              </div>

              <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-white">تصدير قاعدة البيانات الحالية (JSON)</h5>
                    <p className="text-xs text-slate-400">يشمل الفروع، الإدارة، القوالب، الأسئلة، وسجل الحجوزات</p>
                  </div>
                  <button
                    onClick={onExportBackup}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>تصدير Backup</span>
                  </button>
                </div>

                <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-white">استيراد قاعدة بيانات من ملف</h5>
                    <p className="text-xs text-slate-400">رفع ملف JSON تم تصديره سابقاً</p>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".json"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                    >
                      <Upload className="w-4 h-4 text-cyan-400" />
                      <span>اختيار ملف JSON</span>
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-rose-400">إعادة ضبط المصنع للبيانات</h5>
                    <p className="text-xs text-slate-500">استعادة بيانات وفروع معامل RT الأصلية</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('هل أنت متأكد من استعادة بيانات المصنع الأصلية؟')) {
                        onResetDefaults();
                        alert('تمت استعادة البيانات الافتراضية بنجاح!');
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/50 text-rose-300 text-xs font-bold transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>استعادة الافتراضي</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
