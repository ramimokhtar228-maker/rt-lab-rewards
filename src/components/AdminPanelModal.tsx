import React, { useState } from 'react';
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
} from 'lucide-react';
import {
  Question,
  RewardItem,
  SpinSlice,
  LabSettings,
  QuestionCategory,
  PatientRecord,
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
  onSaveQuestions: (q: Question[]) => void;
  onSaveRewards: (r: RewardItem[]) => void;
  onSaveSlices: (s: SpinSlice[]) => void;
  onSaveSettings: (settings: LabSettings) => void;
  onDeletePatient: (id: string) => void;
  onResetPatients: () => void;
  onResetAppForNewPatients: () => void;
  onResetDefaults: () => void;
  onExportBackup: () => void;
  onImportBackup: (jsonStr: string) => boolean;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  questions,
  rewards,
  slices,
  settings,
  patients,
  onSaveQuestions,
  onSaveRewards,
  onSaveSlices,
  onSaveSettings,
  onDeletePatient,
  onResetPatients,
  onResetAppForNewPatients,
  onResetDefaults,
  onExportBackup,
  onImportBackup,
}) => {
  // Authentication PIN state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'patients' | 'questions' | 'rewards' | 'wheel' | 'contact' | 'backup'
  >('patients');

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
              <label className="text-xs text-slate-300 font-semibold block text-right">
                أدخل رمز PIN السري:
              </label>
              <div className="relative">
                <input
                  type="password"
                  autoFocus
                  required
                  maxLength={10}
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="••••"
                  className={`w-full bg-slate-950 border rounded-xl py-3 px-4 text-center font-mono text-xl tracking-[0.3em] text-white focus:outline-none transition-colors ${
                    pinError
                      ? 'border-rose-500 bg-rose-950/20 text-rose-300'
                      : 'border-slate-800 focus:border-emerald-500'
                  }`}
                />
              </div>
              {pinError && (
                <p className="text-xs text-rose-400 font-semibold text-center mt-1">
                  الرمز السري غير صحيح! الرمز الافتراضي هو 7788
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
              <span className="text-[11px] text-slate-500">
                الرمز الافتراضي للإدارة: <span className="font-mono text-emerald-400 font-bold">7788</span> (يمكن تغييره من الإعدادات)
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

  // Save Contact Settings & PIN
  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(contactForm);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2500);
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
    const appUrl = window.location.origin;
    const replyText = `🎉 *أهلاً بك يا أستاذ/ة ${patient.name} في ${settings.labName}!*

✅ *تم اعتماد وتأكيد مشاركتك في برنامج المكافآت بنجاح:*
⭐ *رصيد نقاطك الحالي:* ${patient.points} نقطة
🏆 *رتبتك:* ${patient.levelTitle}
🎁 *عدد الجوائز والكوبونات المسجلة:* ${patient.couponsWon} جائزة

🩺 يمكنك الاستفادة من تحاليلك وخصوماتك فوراً في أقرب فرع لمعامل RT أو عبر طلب خدمة السحب المنزلي.
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
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">لوحة تحكم إدارة معامل RT</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  جلسة مؤمنة بالرمز السري 🔒
                </span>
              </div>
              <p className="text-xs text-slate-400">
                إدارة وسجل المرضى، إضافة وحذف وتعديل الأسئلة والجوائز، وتخصيص أرقام الواتساب
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-900 border-b border-slate-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'patients', label: `سجل المرضى (${patients.length})`, icon: Users },
            { id: 'questions', label: `إدارة الأسئلة (${questions.length})`, icon: HelpCircle },
            { id: 'rewards', label: `إدارة الجوائز (${rewards.length})`, icon: Gift },
            { id: 'wheel', label: `عجلة الحظ (${slices.length})`, icon: RotateCw },
            { id: 'contact', label: 'أرقام المعمل والرمز السري PIN', icon: Phone },
            { id: 'backup', label: 'النسخ والضبط', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          
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

              {/* Security PIN code box */}
              <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <KeyRound className="w-4 h-4" />
                  <span>الرمز السري لدخول الإدارة (Admin PIN):</span>
                </div>
                <input
                  type="text"
                  required
                  value={contactForm.adminPin || '7788'}
                  onChange={(e) => setContactForm({ ...contactForm, adminPin: e.target.value })}
                  placeholder="مثال: 7788"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-base font-mono text-white focus:outline-none focus:border-amber-500 text-left"
                />
                <span className="text-[11px] text-slate-500 block">
                  احفظ هذا الرمز جيداً. سيُطلب منك في كل مرة تفتح فيها لوحة الإدارة لحماية بيانات المرضى.
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">
                    رقم الواتساب للمزامنة الفورية (مع كود الدولة مثل 201021487889):
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.whatsappNumber}
                    onChange={(e) => setContactForm({ ...contactForm, whatsappNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono text-left"
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
                  <label className="text-xs text-slate-300 font-semibold">ساعات العمل والخدمة:</label>
                  <input
                    type="text"
                    value={contactForm.workingHours}
                    onChange={(e) => setContactForm({ ...contactForm, workingHours: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">العنوان ومناطق التغطية:</label>
                  <input
                    type="text"
                    value={contactForm.address}
                    onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>حفظ بيانات وتواصل المعمل والرمز السري</span>
              </button>
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
