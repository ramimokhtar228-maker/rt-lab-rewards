import React, { useState, useEffect } from 'react';
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
  Eye,
  EyeOff,
  UserCheck,
  BellRing,
  Volume2,
  Send,
} from 'lucide-react';
import {
  Question,
  RewardItem,
  SpinSlice,
  LabSettings,
  LabBranch,
  QuestionCategory,
  PatientRecord,
  PrizeClaimBooking,
  SampleCollector,
} from '../types';
import { soundManager } from '../utils/audio';
import { alertSoundManager } from '../utils/audioAlert';
import { formatWhatsAppNumber, forcePurgeAndReload, INITIAL_LAB_SETTINGS } from '../utils/storage';
import { realtimeSync } from '../utils/realtimeSync';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  rewards: RewardItem[];
  slices: SpinSlice[];
  settings: LabSettings;
  patients: PatientRecord[];
  claims: PrizeClaimBooking[];
  collectors?: SampleCollector[];
  onSaveQuestions: (q: Question[]) => void;
  onSaveRewards: (r: RewardItem[]) => void;
  onSaveSlices: (s: SpinSlice[]) => void;
  onSaveSettings: (settings: LabSettings) => void;
  onSaveCollectors?: (collectors: SampleCollector[]) => void;
  onDeletePatient: (id: string) => void;
  onResetPatients: () => void;
  onResetAppForNewPatients: () => void;
  onUpdateClaimStatus: (id: string, status: PrizeClaimBooking['status']) => void;
  onDeleteClaim: (id: string) => void;
  onResetDefaults: () => void;
  onExportBackup: () => void;
  onImportBackup: (jsonStr: string) => boolean;
  onTriggerTestAlert?: () => void;
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
  collectors = [],
  onSaveQuestions,
  onSaveRewards,
  onSaveSlices,
  onSaveSettings,
  onSaveCollectors,
  onDeletePatient,
  onResetPatients,
  onResetAppForNewPatients,
  onUpdateClaimStatus,
  onDeleteClaim,
  onResetDefaults,
  onExportBackup,
  onImportBackup,
  onTriggerTestAlert,
}) => {
  // Authentication PIN state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showEnteredPin, setShowEnteredPin] = useState(false);
  const [showAdminPinInSettings, setShowAdminPinInSettings] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'claims' | 'patients' | 'collectors' | 'questions' | 'rewards' | 'wheel' | 'contact' | 'backup'
  >('claims');

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
  const [copiedTemplatePatient, setCopiedTemplatePatient] = useState<string | null>(null);

  // Contact settings state
  const [contactForm, setContactForm] = useState<LabSettings>(settings);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [copiedSmartUrl, setCopiedSmartUrl] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Branch management states
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const [newBranchPhone, setNewBranchPhone] = useState('');
  const [newBranchHours, setNewBranchHours] = useState('');

  // Collectors management state
  const [localCollectors, setLocalCollectors] = useState<SampleCollector[]>(
    collectors && collectors.length > 0 ? collectors : settings.collectors || []
  );
  const [isAddingCollector, setIsAddingCollector] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColPhone, setNewColPhone] = useState('');
  const [newColWa, setNewColWa] = useState('');
  const [newColArea, setNewColArea] = useState('');
  const [newColRole, setNewColRole] = useState('فني سحب عينات منزلي');
  const [newColNotes, setNewColNotes] = useState('');

  useEffect(() => {
    if (collectors && collectors.length > 0) {
      setLocalCollectors(collectors);
    } else if (settings.collectors && settings.collectors.length > 0) {
      setLocalCollectors(settings.collectors);
    }
  }, [collectors, settings.collectors]);

  // Sync contactForm with latest settings when modal is opened
  useEffect(() => {
    if (isOpen) {
      setContactForm(settings);
    }
  }, [isOpen, settings]);

  // File input ref
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Handle PIN verification
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = settings.adminPin || '7788';
    if (enteredPin.trim() === correctPin.trim()) {
      setIsAuthenticated(true);
      setPinError(false);
      soundManager.playSuccess();
    } else {
      setPinError(true);
      soundManager.playWrong();
      setEnteredPin('');
    }
  };

  const handleClose = () => {
    setIsAuthenticated(false);
    setEnteredPin('');
    setPinError(false);
    onClose();
  };

  // If not authenticated, show PIN Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-sm bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden text-right p-6 space-y-5">
          <button
            onClick={handleClose}
            className="absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-white">الرمز السري لدخول الإدارة</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              منطقة محمية خاصة بإدارة {settings.labName} فقط لحماية خصوصية بيانات المرضى والتحكم في المسابقات
            </p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300 font-semibold block text-right">
                  أدخل رمز PIN السري:
                </label>
                <span className="text-[11px] text-emerald-400/90 font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>محمي ومخفي للخصوصية</span>
                </span>
              </div>
              <div className="relative">
                <input
                  type={showEnteredPin ? 'text' : 'password'}
                  autoFocus
                  required
                  maxLength={12}
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="••••"
                  className={`w-full bg-slate-950 border rounded-xl py-3 px-11 text-center font-mono text-xl tracking-[0.3em] text-white focus:outline-none transition-colors ${
                    pinError
                      ? 'border-rose-500 bg-rose-950/20 text-rose-300'
                      : 'border-slate-800 focus:border-emerald-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowEnteredPin(!showEnteredPin)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg transition-colors focus:outline-none"
                  title={showEnteredPin ? 'إخفاء الرمز' : 'إظهار الرمز'}
                >
                  {showEnteredPin ? <EyeOff className="w-5 h-5 text-amber-400" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {pinError && (
                <p className="text-xs text-rose-400 font-semibold text-center mt-1">
                  رمز PIN غير صحيح! برجاء التأكد من كتابة الرمز السري المصرح به للمعمل.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950 transition-colors flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>تأكيد ودخول الإدارة</span>
            </button>

            <div className="text-center pt-2">
              <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>لوحة تحكم إدارية خاصة ومؤمنة بالكامل لحماية خصوصية المعمل والمرضى</span>
              </span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Question Handlers
  const handleSaveNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim()) return;

    if (editingQuestion) {
      const updated = questions.map((q) =>
        q.id === editingQuestion.id
          ? {
              ...q,
              question: newQText,
              category: newQCategory,
              options: newQOptions,
              correctIndex: newQCorrect,
              explanation: newQExplanation,
              points: Number(newQPoints),
            }
          : q
      );
      onSaveQuestions(updated);
      setEditingQuestion(null);
    } else {
      const newObj: Question = {
        id: 'q_' + Date.now(),
        category: newQCategory,
        question: newQText,
        options: newQOptions,
        correctIndex: newQCorrect,
        explanation: newQExplanation,
        points: Number(newQPoints),
        difficulty: 'medium',
      };
      onSaveQuestions([newObj, ...questions]);
    }

    setIsAddingQuestion(false);
    setNewQText('');
    setNewQOptions(['', '', '', '']);
    setNewQExplanation('');
    setNewQPoints(50);
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السؤال من المسابقة؟')) {
      onSaveQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const handleStartEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setNewQText(q.question);
    setNewQCategory(q.category);
    setNewQOptions([...q.options]);
    setNewQCorrect(q.correctIndex);
    setNewQExplanation(q.explanation);
    setNewQPoints(q.points);
    setIsAddingQuestion(true);
  };

  // Reward Handlers
  const handleSaveNewReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRTitle.trim()) return;

    const newObj: RewardItem = {
      id: 'rew_' + Date.now(),
      code: 'RT-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      title: newRTitle,
      description: newRDesc,
      type: newRType,
      value: newRValue,
      pointsCost: Number(newRPoints),
      badge: newRBadge,
      terms: 'صالح في جميع فروع معامل RT ولخدمة السحب المنزلي.',
      isActive: true,
    };
    onSaveRewards([newObj, ...rewards]);

    setIsAddingReward(false);
    setNewRTitle('');
    setNewRDesc('');
    setNewRValue('تحليل مجاني');
  };

  const handleDeleteReward = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المكافأة من المتجر؟')) {
      onSaveRewards(rewards.filter((r) => r.id !== id));
    }
  };

  // Spin Wheel Slices Handlers
  const handleDeleteSlice = (id: string) => {
    if (slices.length <= 4) {
      alert('يجب الإبقاء على 4 خانات على الأقل في عجلة الحظ.');
      return;
    }
    if (confirm('هل أنت متأكد من حذف هذه الخانة من عجلة الحظ؟')) {
      onSaveSlices(slices.filter((s) => s.id !== id));
    }
  };

  const handleAddSlice = () => {
    const label = prompt('أدخل اسم الجائزة على عجلة الحظ (مثال: خصم 15% أو 75 نقطة):');
    if (!label) return;
    const subtext = prompt('أدخل وصفاً مختصراً:') || 'مفاجأة معامل RT';
    const newSlice: SpinSlice = {
      id: 's_' + Date.now(),
      label,
      subtext,
      type: 'discount',
      value: label,
      color: '#0d9488',
      probability: 10,
    };
    onSaveSlices([...slices, newSlice]);
  };

  // Branch handlers
  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    const branch: LabBranch = {
      id: 'b_' + Date.now(),
      name: newBranchName.trim(),
      address: newBranchAddress.trim(),
      phone: newBranchPhone.trim(),
      workingHours: newBranchHours.trim() || '8:00 ص - 11:30 م',
    };
    const currentBranches = contactForm.branches || [];
    setContactForm({
      ...contactForm,
      branches: [...currentBranches, branch],
    });
    setNewBranchName('');
    setNewBranchAddress('');
    setNewBranchPhone('');
    setNewBranchHours('');
    setIsAddingBranch(false);
    soundManager.playSuccess();
  };

  const handleDeleteBranch = (branchId: string) => {
    const currentBranches = contactForm.branches || [];
    setContactForm({
      ...contactForm,
      branches: currentBranches.filter((b) => b.id !== branchId),
    });
  };

  // Save Contact Settings & PIN
  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(contactForm);
    soundManager.playSuccess();
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  // File import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = onImportBackup(content);
      if (success) {
        alert('تم استيراد قاعدة البيانات بنجاح!');
      } else {
        alert('فشل استيراد الملف. تأكد من صحة تنسيق JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Generate WhatsApp Official Reply to Patient
  const handleCopyLabReply = (patient: PatientRecord) => {
    const cleanWa = (settings.whatsappNumber || '201100874444').replace(/\D/g, '');
    const cleanHotline = (settings.hotlineNumber || '01100046841').replace(/\D/g, '');
    const appUrl = `${window.location.origin}/?wa=${cleanWa}&hotline=${cleanHotline}&v=3.5`;

    const replyText = `🎉 *أهلاً بك يا أستاذ/ة ${patient.name} في ${settings.labName}!*

✅ *تم اعتماد وتأكيد مشاركتك في برنامج المكافآت بنجاح:*
⭐ *رصيد نقاطك الحالي:* ${patient.points} نقطة
🏆 *رتبتك:* ${patient.levelTitle}
🎁 *عدد الجوائز والكوبونات المسجلة:* ${patient.couponsWon} جائزة

🩺 يمكنك الاستفادة من تحاليلك وخصوماتك فوراً في أقرب فرع لمعامل RT أو عبر طلب خدمة السحب المنزلي.
📞 تواصل مباشر: ${settings.hotlineNumber} | واتساب: ${settings.whatsappNumber}
💡 ننصحك بالدخول يومياً لتدوير عجلة الحظ وحل لغز اليوم لمضاعفة نقاطك ومكافآتك!

رابط التحدي والمكافآت الخاص بك:
${appUrl}

نسعد دائماً بخدمتك والاطمئنان على صحتك 💚`;

    navigator.clipboard.writeText(replyText);
    setCopiedTemplatePatient(patient.id);
    soundManager.playSuccess();
    setTimeout(() => setCopiedTemplatePatient(null), 2500);
  };

  // Filtered patients
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.phone.includes(patientSearch)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right">
        {/* Header Ribbon */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">لوحة تحكم إدارة معامل RT</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 hidden xs:inline">
                  جلسة مؤمنة بالرمز السري 🔒
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-1">
                إدارة وسجل المرضى، إضافة وحذف وتعديل الأسئلة والجوائز، وتخصيص أرقام الواتساب
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 bg-slate-900 border-b border-slate-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'claims', label: `تفعيلات الجوائز (${claims.length})`, icon: CalendarCheck },
            { id: 'collectors', label: `فنيو السحب والجامعين (${localCollectors.length})`, icon: UserCheck },
            { id: 'patients', label: `سجل المرضى (${patients.length})`, icon: Users },
            { id: 'questions', label: `إدارة الأسئلة (${questions.length})`, icon: HelpCircle },
            { id: 'rewards', label: `إدارة الجوائز (${rewards.length})`, icon: Gift },
            { id: 'wheel', label: `عجلة الحظ (${slices.length})`, icon: RotateCw },
            { id: 'contact', label: 'أرقام المعمل ورمز PIN', icon: Phone },
            { id: 'backup', label: 'النسخ والضبط', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1 text-slate-200">
          
          {/* TAB: CLAIMS & BOOKINGS LOG */}
          {activeTab === 'claims' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white">سجل تفعيلات الجوائز وحجوزات المرضى</h4>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      تزامن حي ومباشر
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    متابعة المرضى، واختيار فني السحب (الجامع) وإرسال رسائل الواتساب الفورية وتأكيد المواعيد
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={async () => {
                      await realtimeSync.pollCloudDatabase();
                      soundManager.playSuccess();
                      alert('تم جلب وتحديث كافة حجوزات المرضى من قاعدة البيانات السحابية (GitHub Cloud DB) بنجاح! 🟢');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all shadow-sm"
                  >
                    <RotateCw className="w-4 h-4 text-emerald-400" />
                    <span>تحديث من السحابة 🔄</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onTriggerTestAlert) {
                        onTriggerTestAlert();
                      } else {
                        alertSoundManager.playIncomingAlert();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all shadow-sm"
                  >
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>🔊 تجربة جرس التنبيه الحي</span>
                  </button>
                </div>
              </div>

              {claims.length === 0 ? (
                <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center text-slate-500 text-xs">
                  لا توجد طلبات حجز أو تفعيل جوائز مسجلة حتى الآن. ستظهر أي طلبات جديدة وتسمع جرس التنبيه فوراً هنا.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {claims.map((clm) => {
                    const cleanLab = formatWhatsAppNumber(settings.whatsappNumber);
                    const cleanColPhone = formatWhatsAppNumber(clm.collectorWhatsApp || clm.collectorPhone || settings.whatsappNumber);
                    const cleanPatPhone = formatWhatsAppNumber(clm.patientPhone);

                    // WhatsApp link for Collector
                    const colMsg = `*🚨 تكليف حالة وسحب عينة - ${settings.labName}* 🩺\n---------------------------------------\n👨‍⚕️ *فني السحب المسؤول:* ${clm.collectorName || 'فريق التمريض'}\n👤 *اسم المريض:* ${clm.patientName}\n📱 *هاتف المريض:* ${clm.patientPhone}\n📍 *الخدمة:* ${clm.serviceType === 'home_visit' ? 'سحب منزلي 🏠' : 'حجز فرع 🏥'}\n📌 *العنوان:* ${clm.address}\n⏰ *الميعاد:* ${clm.preferredTime}\n🎁 *الجائزة:* ${clm.prizeTitle} (${clm.prizeValue})\n🔢 *كود:* [${clm.couponCode}]\n---------------------------------------\nيرجى التواصل مع المريض فوراً وتأكيد الموعد 💚`;
                    const colUrl = `https://wa.me/${cleanColPhone}?text=${encodeURIComponent(colMsg)}`;

                    // WhatsApp link for Patient
                    const patMsg = `🎉 *أهلاً بك يا أستاذ/ة ${clm.patientName} في ${settings.labName}!*\n\n✅ تم تأكيد تفعيل جائزتك: *${clm.prizeTitle}* (${clm.prizeValue}).\n🔢 كود التحقق الرسمي: *[${clm.couponCode}]*\n👨‍⚕️ فني السحب المسؤول عن حالتك: *${clm.collectorName || 'فريق التمريض السريع'}* (${clm.collectorPhone || ''}).\n📍 الخدمة: ${clm.serviceType === 'home_visit' ? 'سحب عينة منزلي 🏠' : 'زيارة الفرع 🏥'}.\n⏰ الميعاد المفضل: ${clm.preferredTime}.\n\nنسعد دائماً بخدمتكم وصحتكم أولويتنا 💚`;
                    const patUrl = `https://wa.me/${cleanPatPhone}?text=${encodeURIComponent(patMsg)}`;

                    return (
                      <div
                        key={clm.id}
                        className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 hover:border-emerald-500/40 transition-all shadow-sm"
                      >
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-base text-white">{clm.patientName}</span>
                            <a
                              href={`tel:${clm.patientPhone}`}
                              className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md hover:bg-emerald-500/20 font-bold"
                            >
                              📞 {clm.patientPhone}
                            </a>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                              {clm.prizeTitle} ({clm.prizeValue})
                            </span>
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                                clm.status === 'confirmed'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : clm.status === 'completed'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : clm.status === 'collector_notified'
                                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {clm.status === 'confirmed'
                                ? 'تم التأكيد ✅'
                                : clm.status === 'completed'
                                ? 'تم سحب العينة 🩺'
                                : clm.status === 'collector_notified'
                                ? 'تم إبلاغ الجامع 📨'
                                : 'قيد الانتظار ⏳'}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 font-mono">
                            {clm.createdAt}
                          </div>
                        </div>

                        {/* Assigned Collector Box */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-950 rounded-xl border border-amber-500/25">
                          <div className="flex items-center gap-2 flex-wrap">
                            <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="text-xs font-bold text-amber-300">
                              فني السحب (الجامع):
                            </span>
                            <span className="text-xs font-black text-white">
                              {clm.collectorName || 'فريق التمريض السريع'}
                            </span>
                            {clm.collectorPhone && (
                              <span className="text-xs text-amber-200/80 font-mono">
                                ({clm.collectorPhone})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="flex items-center gap-1 text-slate-400">
                              {clm.serviceType === 'home_visit' ? (
                                <Home className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Building className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                              <span>{clm.serviceType === 'home_visit' ? 'سحب منزلي 🏠' : 'زيارة فرع 🏥'}</span>
                            </span>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-400 font-mono">كود: {clm.couponCode}</span>
                          </div>
                        </div>

                        {clm.address && (
                          <div className="text-xs text-slate-400 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>العنوان: <strong className="text-slate-200">{clm.address}</strong></span>
                            <span>· الميعاد المفضل: <strong className="text-emerald-300">{clm.preferredTime}</strong></span>
                          </div>
                        )}

                        {/* Direct Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800/80">
                          {/* Send WhatsApp to Collector */}
                          <a
                            href={colUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02]"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>واتساب الجامع 🩺</span>
                          </a>

                          {/* Send WhatsApp to Patient */}
                          <a
                            href={patUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600/30 hover:bg-teal-600/50 border border-teal-500/40 text-teal-300 text-xs font-bold transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>واتساب المريض 💬</span>
                          </a>

                          {/* Copy ticket message */}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(colMsg);
                              soundManager.playSuccess();
                              alert(`تم نسخ تذكرة الحالة للمريض "${clm.patientName}" وفني السحب بنجاح!`);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>نسخ التذكرة</span>
                          </button>

                          {/* Status Dropdown/Button */}
                          <select
                            value={clm.status}
                            onChange={(e) =>
                              onUpdateClaimStatus(clm.id, e.target.value as PrizeClaimBooking['status'])
                            }
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="pending">قيد الانتظار ⏳</option>
                            <option value="collector_notified">تم إبلاغ الجامع 📨</option>
                            <option value="confirmed">تم تأكيد الموعد ✅</option>
                            <option value="completed">تم سحب العينة بنجاح 🩺</option>
                            <option value="cancelled">ملغي ❌</option>
                          </select>

                          {/* Delete Claim */}
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف حجز المريض "${clm.patientName}"؟`)) {
                                onDeleteClaim(clm.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors mr-auto"
                            title="حذف الحجز"
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

          {/* TAB: COLLECTORS MANAGEMENT */}
          {activeTab === 'collectors' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-400" />
                    <span>إدارة فنيي سحب العينات (الجامعين)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    تحديد فريق فنيي السحب المتنقلين ومسؤولي التنسيق مع مناطق التغطية وأرقام هواتفهم للتكليف الفوري
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setIsAddingCollector(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة جامع عينات جديد</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onTriggerTestAlert) {
                        onTriggerTestAlert();
                      } else {
                        alertSoundManager.playIncomingAlert();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>تجربة رنين التنبيه</span>
                  </button>
                </div>
              </div>

              {/* Add New Collector Modal/Form */}
              {isAddingCollector && (
                <div className="p-4 bg-slate-950 border border-emerald-500/40 rounded-2xl space-y-3.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h5 className="text-sm font-bold text-emerald-300">إضافة فني سحب (جامع) جديد:</h5>
                    <button
                      onClick={() => setIsAddingCollector(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                        اسم فني السحب (الجامع): *
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: أ. محمود خالد..."
                        value={newColName}
                        onChange={(e) => setNewColName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                        رقم هاتف الاتصال: *
                      </label>
                      <input
                        type="tel"
                        placeholder="010XXXXXXXX"
                        value={newColPhone}
                        onChange={(e) => setNewColPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-left"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                        رقم الواتساب (لإرسال تكليف الحالة فورياً):
                      </label>
                      <input
                        type="tel"
                        placeholder="201XXXXXXXXX"
                        value={newColWa}
                        onChange={(e) => setNewColWa(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-left"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                        المسمى الوظيفي:
                      </label>
                      <input
                        type="text"
                        placeholder="فني سحب منزلي، أخصائي تحاليل..."
                        value={newColRole}
                        onChange={(e) => setNewColRole(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                        مناطق التغطية ونطاق السحب:
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: شبرا الخيمة، بهتيم، مسطرد، القاهرة والجيزة..."
                        value={newColArea}
                        onChange={(e) => setNewColArea(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        if (!newColName.trim() || !newColPhone.trim()) {
                          alert('برجاء كتابة الاسم ورقم الهاتف.');
                          return;
                        }
                        const newCol: SampleCollector = {
                          id: 'col_' + Date.now(),
                          name: newColName.trim(),
                          phone: newColPhone.trim(),
                          whatsappNumber: newColWa.trim() || newColPhone.trim(),
                          area: newColArea.trim() || 'جميع المناطق',
                          roleTitle: newColRole.trim() || 'فني سحب منزلي',
                          isAvailable: true,
                        };
                        const updated = [...localCollectors, newCol];
                        setLocalCollectors(updated);
                        if (onSaveCollectors) onSaveCollectors(updated);
                        setNewColName('');
                        setNewColPhone('');
                        setNewColWa('');
                        setNewColArea('');
                        setIsAddingCollector(false);
                        soundManager.playSuccess();
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                    >
                      حفظ الجامع
                    </button>
                    <button
                      onClick={() => setIsAddingCollector(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* Collectors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {localCollectors.map((col) => {
                  const cleanPhone = formatWhatsAppNumber(col.whatsappNumber || col.phone);
                  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    `السلام عليكم يا ${col.name} 🩺\nمعكم إدارة ${settings.labName}. نود التنسيق بخصوص جدول زيارات السحب المنزلي وحالات الجوائز المحجوزة اليوم.`
                  )}`;

                  return (
                    <div
                      key={col.id}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-emerald-500/40 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-white text-sm">{col.name}</h5>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                col.isAvailable
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {col.isAvailable ? 'متاح للسحب ✓' : 'غير متاح'}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-400 mt-0.5">{col.roleTitle || 'فني سحب معتمد'}</p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const updated = localCollectors.map((c) =>
                                c.id === col.id ? { ...c, isAvailable: !c.isAvailable } : c
                              );
                              setLocalCollectors(updated);
                              if (onSaveCollectors) onSaveCollectors(updated);
                            }}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs"
                            title="تبديل الإتاحة"
                          >
                            {col.isAvailable ? 'تعطيل' : 'تفعيل'}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف الجامع "${col.name}"؟`)) {
                                const updated = localCollectors.filter((c) => c.id !== col.id);
                                setLocalCollectors(updated);
                                if (onSaveCollectors) onSaveCollectors(updated);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>الهاتف: <strong className="font-mono text-slate-300">{col.phone}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>مناطق التغطية: <strong className="text-slate-300">{col.area}</strong></span>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>واتساب</span>
                        </a>

                        <a
                          href={`tel:${col.phone}`}
                          className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>اتصال</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 0: PATIENTS MANAGEMENT & RESET */}
          {activeTab === 'patients' && (
            <div className="space-y-6">
              {/* Header and Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-white">سجل المرضى والمشاركين في المكافآت</h4>
                  <p className="text-xs text-slate-400">
                    يمكنك تصفح بيانات المرضى، الرد عليهم بالواتساب، حذف أي مريض نهائياً، أو تصفير البرنامج للبدء مع عملاء جدد
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      if (confirm('هل أنت متأكد من تصفير البرنامج للمريض الحالي؟ سيبدأ أي مستخدم جديد من الصفر لاستكشاف التطبيق والمسابقات.')) {
                        onResetAppForNewPatients();
                        alert('تم تصفير البرنامج للمريض الحالي بنجاح! يمكن للعملاء الجدد البدء الآن.');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-colors"
                    title="تصفير البرنامج للبدء مع عميل جديد"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>تصفير للبدء مع عميل جديد</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('تحذير: هل أنت متأكد من حذف وتصفير جميع سجلات المرضى بالكامل؟ لا يمكن التراجع عن هذا الإجراء.')) {
                        onResetPatients();
                        alert('تم تصفير سجل المرضى بالكامل!');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/50 text-rose-300 text-xs font-bold transition-colors"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>تصفير كامل لسجل المرضى</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="ابحث بالاسم أو رقم هاتف المريض..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Patients List Table */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                <div className="divide-y divide-slate-800/70">
                  {filteredPatients.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      لا يوجد مرضى مسجلون يطابقون البحث.
                    </div>
                  ) : (
                    filteredPatients.map((pat) => (
                      <div
                        key={pat.id}
                        className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-900/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{pat.name}</span>
                            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              {pat.phone}
                            </span>
                            <span className="text-[11px] text-amber-400 font-semibold">{pat.levelTitle}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400">
                            <span>النقاط: <strong className="text-amber-400 font-mono">{pat.points}</strong></span>
                            <span>·</span>
                            <span>الجوائز الفائز بها: <strong className="text-emerald-400 font-mono">{pat.couponsWon}</strong></span>
                            <span>·</span>
                            <span>تاريخ التسجيل: {pat.joinedAt}</span>
                            <span>·</span>
                            <span>آخر نشاط: {pat.lastActive}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                          {/* Copy Confirmation Reply */}
                          <button
                            onClick={() => handleCopyLabReply(pat)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-colors"
                            title="توليد رسالة تأكيد الجائزة والنقاط للرد على المريض بالواتساب"
                          >
                            {copiedTemplatePatient === pat.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>تم نسخ رد المعمل!</span>
                              </>
                            ) : (
                              <>
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>نسخ رد تأكيد للمريض</span>
                              </>
                            )}
                          </button>

                          {/* Direct WhatsApp to Patient */}
                          {pat.phone && pat.phone !== 'غير مسجل' && (
                            <a
                              href={`https://wa.me/${pat.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors"
                              title="فتح محادثة واتساب مع المريض"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Delete Patient Permanently */}
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من الحذف النهائي لبيانات المريض "${pat.name}"؟`)) {
                                onDeletePatient(pat.id);
                              }
                            }}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                            title="حذف نهائي للمريض"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: QUESTIONS MANAGEMENT */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">بنك أسئلة المسابقة والذكاء</h4>
                  <p className="text-xs text-slate-400">
                    يمكنك إضافة ألغاز ومسائل ذكاء جديدة، أو تعديل وحذف الأسئلة الحالية
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingQuestion(null);
                    setNewQText('');
                    setNewQOptions(['', '', '', '']);
                    setNewQExplanation('');
                    setIsAddingQuestion(!isAddingQuestion);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddingQuestion ? 'إلغاء' : 'إضافة سؤال جديد'}</span>
                </button>
              </div>

              {/* Add / Edit Form */}
              {isAddingQuestion && (
                <form
                  onSubmit={handleSaveNewQuestion}
                  className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/40 space-y-4"
                >
                  <h5 className="text-sm font-bold text-emerald-400">
                    {editingQuestion ? 'تعديل السؤال' : 'إضافة سؤال / لغز جديد'}
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs text-slate-400 font-semibold">نص السؤال أو اللغز:</label>
                      <input
                        type="text"
                        required
                        value={newQText}
                        onChange={(e) => setNewQText(e.target.value)}
                        placeholder="اكتب السؤال بوضوح..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold">فئة السؤال:</label>
                      <select
                        value={newQCategory}
                        onChange={(e) => setNewQCategory(e.target.value as QuestionCategory)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="medical">معلومات طبية وصحية</option>
                        <option value="puzzle">ألغاز ومسائل ذكاء</option>
                        <option value="culture">ثقافة عامة وأمثال</option>
                        <option value="general">معلومات عامة</option>
                      </select>
                    </div>
                  </div>

                  {/* 4 Choices */}
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-semibold block">
                      خيارات الإجابة الأربعة (حدد الدائرة بجانب الإجابة الصحيحة):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {newQOptions.map((opt, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2"
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
                            className="w-full bg-transparent text-sm text-white focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explanation & Points */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs text-slate-400 font-semibold">شرح / معلومة طبية توضيحية:</label>
                      <input
                        type="text"
                        value={newQExplanation}
                        onChange={(e) => setNewQExplanation(e.target.value)}
                        placeholder="معلومة تظهر للمريض بعد الإجابة..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold">النقاط المكتسبة:</label>
                      <input
                        type="number"
                        min="10"
                        max="200"
                        value={newQPoints}
                        onChange={(e) => setNewQPoints(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
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
                      <span>{editingQuestion ? 'حفظ التعديلات' : 'إضافة السؤال للبنك'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Questions List */}
              <div className="space-y-2">
                {questions.map((q, i) => (
                  <div
                    key={q.id}
                    className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-4"
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
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="تعديل السؤال"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                        title="حذف السؤال"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: REWARDS MANAGEMENT */}
          {activeTab === 'rewards' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">إدارة جوائز وتحاليل المتجر</h4>
                  <p className="text-xs text-slate-400">
                    أضف تحاليل مجانية، كوبونات خصم، أو باقات فحص دوري يمكن للمريض استبدالها
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingReward(!isAddingReward)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddingReward ? 'إلغاء' : 'إضافة مكافأة جديدة'}</span>
                </button>
              </div>

              {/* Add Reward Form */}
              {isAddingReward && (
                <form
                  onSubmit={handleSaveNewReward}
                  className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/40 space-y-4"
                >
                  <h5 className="text-sm font-bold text-emerald-400">إضافة جائزة جديدة</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold">عنوان الجائزة:</label>
                      <input
                        type="text"
                        required
                        value={newRTitle}
                        onChange={(e) => setNewRTitle(e.target.value)}
                        placeholder="مثال: تحليل وظائف كبد مجاناً"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold">نوع الجائزة:</label>
                      <select
                        value={newRType}
                        onChange={(e) => setNewRType(e.target.value as RewardItem['type'])}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="free_test">تحليل مجاني 100%</option>
                        <option value="discount_percent">نسبة خصم %</option>
                        <option value="cash_discount">خصم نقدي مباشر (ج.م)</option>
                        <option value="package_deal">عرض باقة فحص</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold">القيمة المعروضة:</label>
                      <input
                        type="text"
                        value={newRValue}
                        onChange={(e) => setNewRValue(e.target.value)}
                        placeholder="مثال: مجاني أو خصم 25%"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold">النقاط المطلوبة للاستبدال:</label>
                      <input
                        type="number"
                        min="50"
                        value={newRPoints}
                        onChange={(e) => setNewRPoints(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold">شارة مميزة (Badge):</label>
                      <input
                        type="text"
                        value={newRBadge}
                        onChange={(e) => setNewRBadge(e.target.value)}
                        placeholder="مثال: الأكثر طلباً 🔥"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold">الوصف والشروط:</label>
                    <input
                      type="text"
                      value={newRDesc}
                      onChange={(e) => setNewRDesc(e.target.value)}
                      placeholder="وصف الفحص وشروطه للمريض..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingReward(false)}
                      className="px-4 py-2 bg-slate-800 rounded-xl text-xs"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                    >
                      حفظ المكافأة
                    </button>
                  </div>
                </form>
              )}

              {/* Rewards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rewards.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-400 font-bold">{r.badge}</span>
                        <span className="text-xs text-slate-500">· {r.pointsCost} نقطة</span>
                      </div>
                      <h5 className="text-sm font-bold text-white mt-0.5">{r.title}</h5>
                      <p className="text-xs text-slate-400">{r.value}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteReward(r.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                      title="حذف المكافأة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SPIN WHEEL MANAGEMENT */}
          {activeTab === 'wheel' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">إدارة خانات وجوائز عجلة الحظ</h4>
                  <p className="text-xs text-slate-400">
                    يمكنك تعديل الجوائز التي تظهر على العجلة وإضافة جوائز جديدة
                  </p>
                </div>
                <button
                  onClick={handleAddSlice}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة خانة جديدة</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {slices.map((slice) => (
                  <div
                    key={slice.id}
                    className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: slice.color }}
                      />
                      <div>
                        <h5 className="text-sm font-bold text-white">{slice.label}</h5>
                        <p className="text-xs text-slate-400">{slice.subtext}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSlice(slice.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                      title="حذف الخانة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CONTACT & ADMIN PIN SETTINGS */}
          {activeTab === 'contact' && (
            <form onSubmit={handleSaveContact} className="space-y-5 max-w-2xl">
              <div>
                <h4 className="text-base font-bold text-white">أرقام التواصل وحماية الإدارة</h4>
                <p className="text-xs text-slate-400">
                  تستخدم هذه الأرقام في مزامنة الواتساب والرد على المرضى، والرمز السري لمنع وصول العملاء للإدارة
                </p>
              </div>

              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>تم حفظ وتحديث أرقام وبيانات المعمل والرمز السري بنجاح!</span>
                </div>
              )}

              {/* SMART VERIFIED SHARE LINK CALLOUT */}
              <div className="p-5 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-2 border-emerald-500/50 rounded-2xl space-y-3 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                      <Sparkles className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <h5 className="text-sm sm:text-base font-black text-white">رابط المعمل الذكي المعتمد لإرساله للمرضى والعملاء</h5>
                      <p className="text-[11px] text-emerald-200">
                        الحل الذكي: هذا الرابط مشفر بأرقام المعمل المؤكدة، ويضمن فتح المعمل المحدث على هاتف المريض حتى لو كان متصفحه قديماً أو محتفظاً بكاش قديم.
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 shrink-0 self-start sm:self-auto">
                    مؤمن ومحدث 🛡️
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-950/90 border border-slate-800 rounded-xl p-2.5">
                  <span className="font-mono text-xs text-emerald-400 select-all flex-1 truncate px-2 py-1" dir="ltr">
                    {`${typeof window !== 'undefined' ? window.location.origin : ''}/?wa=${(contactForm.whatsappNumber || '201100874444').replace(/\D/g, '')}&hotline=${(contactForm.hotlineNumber || '01100046841').replace(/\D/g, '')}&v=3.5`}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/?wa=${(contactForm.whatsappNumber || '201100874444').replace(/\D/g, '')}&hotline=${(contactForm.hotlineNumber || '01100046841').replace(/\D/g, '')}&v=3.5`;
                        navigator.clipboard.writeText(url);
                        soundManager.playSuccess();
                        setCopiedSmartUrl(true);
                        setTimeout(() => setCopiedSmartUrl(false), 3000);
                      }}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                    >
                      {copiedSmartUrl ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSmartUrl ? 'تم نسخ الرابط الذكي بنجاح!' : 'نسخ الرابط الذكي'}</span>
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`تفضل رابط منصة وتحدي ${contactForm.labName}:
${window.location.origin}/?wa=${(contactForm.whatsappNumber || '201100874444').replace(/\D/g, '')}&hotline=${(contactForm.hotlineNumber || '01100046841').replace(/\D/g, '')}&v=3.5`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>إرسال واتساب</span>
                    </a>
                  </div>
                </div>

                {/* Direct Force Cache Buster & Re-sync Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-200">حل مشكلة ظهور نسخة قديمة على هاتف العميل:</p>
                    <p className="text-[11px] text-slate-400">
                      إذا كان هاتف المريض محتفظاً بالنسخة القديمة، أرسل له "الرابط الذكي" أعلاه أو اضغط لتنظيف وتحديث كل البيانات.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playSuccess();
                      setSyncStatusMsg('جاري تنظيف الكاش وإعادة المزامنة مع بيانات المعمل الرسمية...');
                      setTimeout(() => {
                        forcePurgeAndReload();
                      }, 400);
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-teal-600/30 hover:bg-teal-600/50 border border-teal-500/50 text-teal-200 font-bold text-xs transition-all shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>تحديث الكاش وتثبيت بيانات المعمل فوراً</span>
                  </button>
                </div>

                {syncStatusMsg && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold text-center animate-pulse">
                    {syncStatusMsg}
                  </div>
                )}
              </div>

              {/* Security PIN code box */}
              <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                    <KeyRound className="w-4 h-4" />
                    <span>الرمز السري لدخول الإدارة (Admin PIN):</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>مشفر ومحمي للخصوصية</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showAdminPinInSettings ? 'text' : 'password'}
                    required
                    value={contactForm.adminPin || ''}
                    onChange={(e) => setContactForm({ ...contactForm, adminPin: e.target.value })}
                    placeholder="••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 pl-11 text-base font-mono tracking-widest text-white focus:outline-none focus:border-amber-500 text-left"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPinInSettings(!showAdminPinInSettings)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg transition-colors focus:outline-none"
                    title={showAdminPinInSettings ? 'إخفاء الرمز' : 'إظهار الرمز'}
                  >
                    {showAdminPinInSettings ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-slate-500 block">
                  احفظ هذا الرمز جيداً. تم إخفاء الرمز تلقائياً لضمان الخصوصية التامة عند فتح لوحة الإدارة أمام المرضى أو الموظفين.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">اسم المعمل الرسمي:</label>
                  <input
                    type="text"
                    value={contactForm.labName}
                    onChange={(e) => setContactForm({ ...contactForm, labName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">شعار المعمل (Slogan):</label>
                  <input
                    type="text"
                    value={contactForm.tagline}
                    onChange={(e) => setContactForm({ ...contactForm, tagline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Phones & Numbers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">
                    رقم الواتساب للمزامنة الفورية (مع كود الدولة مثل 201100874444):
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.whatsappNumber}
                    onChange={(e) => setContactForm({ ...contactForm, whatsappNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono text-left"
                    placeholder="201100874444"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">رقم الخط الساخن / الهاتف المباشر:</label>
                  <input
                    type="text"
                    required
                    value={contactForm.hotlineNumber}
                    onChange={(e) => setContactForm({ ...contactForm, hotlineNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono text-left"
                    placeholder="01100046841"
                  />
                </div>
              </div>

              {/* Secondary & Emergency Phones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">رقم هاتف إضافي (أرضي أو محمول):</label>
                  <input
                    type="text"
                    value={contactForm.secondaryPhone || ''}
                    onChange={(e) => setContactForm({ ...contactForm, secondaryPhone: e.target.value })}
                    placeholder="مثال: 01124485444 أو 01013242777"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono text-left"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">رقم طوارئ العينات المنزلية (24 ساعة):</label>
                  <input
                    type="text"
                    value={contactForm.emergencyPhone || ''}
                    onChange={(e) => setContactForm({ ...contactForm, emergencyPhone: e.target.value })}
                    placeholder="مثال: 01100046841"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono text-left"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">شريط الإعلانات والعروض الحية (Ticker):</label>
                <textarea
                  rows={2}
                  value={contactForm.announcement}
                  onChange={(e) => setContactForm({ ...contactForm, announcement: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">ساعات العمل والخدمة العامة:</label>
                  <input
                    type="text"
                    value={contactForm.workingHours}
                    onChange={(e) => setContactForm({ ...contactForm, workingHours: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">العنوان ومناطق التغطية العامة:</label>
                  <input
                    type="text"
                    value={contactForm.address}
                    onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Lab Branches & Addresses Management Section */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-400" />
                    <div>
                      <h5 className="text-sm font-bold text-white">فروع المعمل وعناوين المقرات</h5>
                      <p className="text-[11px] text-slate-400">إضافة وتعديل بيانات كل فرع، العنوان، ورقم التليفون</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingBranch(!isAddingBranch)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingBranch ? 'إلغاء' : 'إضافة فرع جديد'}</span>
                  </button>
                </div>

                {/* Add New Branch Sub-form */}
                {isAddingBranch && (
                  <div className="p-4 bg-slate-900 border border-emerald-500/30 rounded-xl space-y-3">
                    <h6 className="text-xs font-bold text-emerald-400">بيانات الفرع الجديد:</h6>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="اسم الفرع (مثال: فرع كفر الشيخ الرئيسي)"
                        value={newBranchName}
                        onChange={(e) => setNewBranchName(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        placeholder="رقم تليفون الفرع"
                        value={newBranchPhone}
                        onChange={(e) => setNewBranchPhone(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono text-left"
                      />
                      <input
                        type="text"
                        placeholder="عنوان الفرع بالتفصيل"
                        value={newBranchAddress}
                        onChange={(e) => setNewBranchAddress(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 sm:col-span-2"
                      />
                      <input
                        type="text"
                        placeholder="مواعيد العمل (مثال: 8:00 ص - 11:30 م)"
                        value={newBranchHours}
                        onChange={(e) => setNewBranchHours(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 sm:col-span-2"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleAddBranch}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>تأكيد إضافة الفرع</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Branches List */}
                <div className="space-y-2">
                  {contactForm.branches && contactForm.branches.length > 0 ? (
                    contactForm.branches.map((b) => (
                      <div
                        key={b.id}
                        className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{b.name}</span>
                            {b.workingHours && (
                              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                {b.workingHours}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{b.address}</span>
                          </div>
                          {b.phone && (
                            <div className="flex items-center gap-2 text-slate-300 font-mono">
                              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span dir="ltr">{b.phone}</span>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteBranch(b.id)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors shrink-0"
                          title="حذف الفرع"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-slate-500">
                      لم يتم تسجيل فروع مخصصة بعد. يمكنك الضغط على "إضافة فرع جديد" بالأعلى لإضافة مقرات المعمل.
                    </div>
                  )}
                </div>
              </div>

              {/* Lab Admin & Medical Team Section */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <div>
                      <h5 className="text-sm font-bold text-white">فريق الإدارة والتشغيل والواتساب المباشر</h5>
                      <p className="text-[11px] text-slate-400">أرقام التواصل المباشرة المعتمدة لمسؤولي المعمل والتنسيق الطبي</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contactForm.adminTeam && contactForm.adminTeam.length > 0 ? (
                    contactForm.adminTeam.map((member) => (
                      <div
                        key={member.id}
                        className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2 hover:border-emerald-500/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-white text-xs sm:text-sm">{member.name}</div>
                            <div className="text-[11px] text-emerald-400 font-medium">{member.role}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-bold border border-emerald-500/20">
                            متاح 🟢
                          </span>
                        </div>
                        {member.bio && (
                          <p className="text-[10px] text-slate-400 leading-relaxed">{member.bio}</p>
                        )}
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                          <a
                            href={`https://wa.me/${formatWhatsAppNumber(member.whatsappNumber)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white transition-colors text-[11px] font-bold font-mono"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>واتساب ({member.whatsappNumber})</span>
                          </a>
                          <a
                            href={`tel:${member.phone}`}
                            className="flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors text-[11px] font-mono"
                            title="اتصال هاتفي"
                          >
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span>{member.phone}</span>
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-slate-500 col-span-2">
                      لا يوجد أعضاء فريق مسجلين حالياً.
                    </div>
                  )}
                </div>
              </div>

              {/* WhatsApp Message Templates Section */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <div>
                      <h5 className="text-sm font-bold text-white">قوالب رسائل الواتساب الرسمية</h5>
                      <p className="text-[11px] text-slate-400">قوالب معتمدة للتواصل مع المرضى وحجوزات السحب المنزلي ونتائج التحاليل</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {contactForm.whatsappTemplates && contactForm.whatsappTemplates.length > 0 ? (
                    contactForm.whatsappTemplates.map((tpl) => (
                      <div
                        key={tpl.id}
                        className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-white flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>{tpl.title}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(tpl.templateText);
                              soundManager.playSuccess();
                              alert(`تم نسخ قالب: ${tpl.title}`);
                            }}
                            className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700"
                          >
                            <Copy className="w-3 h-3" />
                            <span>نسخ القالب</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 whitespace-pre-line leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                          {tpl.templateText}
                        </p>
                      </div>
                    ))
                  ) : null}
                </div>
              </div>

              {/* Submit / Save Button */}
              <div className="pt-3 sticky bottom-0 bg-slate-900/95 backdrop-blur-md pb-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-black shadow-xl shadow-emerald-950 transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ وتطبيق جميع بيانات الإدارة والعناوين</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: BACKUP & SYSTEM DEFAULTS */}
          {activeTab === 'backup' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h4 className="text-base font-bold text-white">النسخ الاحتياطي وإدارة البيانات</h4>
                <p className="text-xs text-slate-400">
                  يمكنك تحميل نسخة احتياطية من كل بيانات المعمل والمسابقات أو استيرادها لاحقاً
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-white">تصدير قاعدة البيانات الحالية</h5>
                    <p className="text-xs text-slate-400">تحميل ملف JSON كامل يحتوي الأسئلة والجوائز والإعدادات</p>
                  </div>
                  <button
                    onClick={onExportBackup}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>تصدير ملف Backup</span>
                  </button>
                </div>

                <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-white">استيراد قاعدة بيانات</h5>
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

                {/* Direct GitHub Pages Production ZIP Download */}
                <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3">
                  <div>
                    <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>تحديث موقع GitHub Pages للمرضى (ramimokhtar228-maker)</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">محدث الآن</span>
                    </h5>
                    <p className="text-xs text-slate-300 mt-1">
                      إذا كنت ترسل للمرضى رابط <span className="font-mono text-emerald-400 font-semibold" dir="ltr">ramimokhtar228-maker.github.io/rt-lab-rewards</span>، حمّل هذا الملف المضغوط الجاهز واستبدل به الملفات في مستودع GitHub ليتحدث رابط المرضى فوراً بالأرقام الجديدة.
                    </p>
                  </div>
                  <a
                    href="/rt-lab-production-build.zip"
                    download="rt-lab-production-build.zip"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg active:scale-95 shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل ملف التحديث المكتمل (ZIP)</span>
                  </a>
                </div>

                <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-rose-400">إعادة ضبط المصنع للبيانات</h5>
                    <p className="text-xs text-slate-500">استعادة بنك الأسئلة والجوائز الافتراضية الأصلية لمعامل RT</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('هل أنت متأكد من استعادة بيانات المصنع الافتراضية؟')) {
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
