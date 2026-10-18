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
} from 'lucide-react';
import { Question, RewardItem, SpinSlice, LabSettings, QuestionCategory } from '../types';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  rewards: RewardItem[];
  slices: SpinSlice[];
  settings: LabSettings;
  onSaveQuestions: (q: Question[]) => void;
  onSaveRewards: (r: RewardItem[]) => void;
  onSaveSlices: (s: SpinSlice[]) => void;
  onSaveSettings: (settings: LabSettings) => void;
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
  onSaveQuestions,
  onSaveRewards,
  onSaveSlices,
  onSaveSettings,
  onResetDefaults,
  onExportBackup,
  onImportBackup,
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'rewards' | 'wheel' | 'contact' | 'backup'>('questions');

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

  // Contact settings state
  const [contactForm, setContactForm] = useState<LabSettings>(settings);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Import JSON file input
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Question Handlers
  const handleSaveNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim()) return;

    if (editingQuestion) {
      // Update
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
      // Add
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

    // Reset Form
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

  // Save Contact Settings
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
              <h3 className="text-lg font-bold text-white">لوحة تحكم إدارة معامل RT</h3>
              <p className="text-xs text-slate-400">
                إضافة وحذف وتعديل الأسئلة، المكافآت، أرقام الواتساب وبيانات المعمل
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-900 border-b border-slate-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'questions', label: `إدارة الأسئلة (${questions.length})`, icon: HelpCircle },
            { id: 'rewards', label: `إدارة الجوائز (${rewards.length})`, icon: Gift },
            { id: 'wheel', label: `عجلة الحظ (${slices.length})`, icon: RotateCw },
            { id: 'contact', label: 'أرقام وبيانات المعمل', icon: Phone },
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

        {/* Body Content (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
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
                {slices.map((slice, i) => (
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

          {/* TAB 4: CONTACT & LAB SETTINGS */}
          {activeTab === 'contact' && (
            <form onSubmit={handleSaveContact} className="space-y-5 max-w-2xl">
              <div>
                <h4 className="text-base font-bold text-white">أرقام التواصل وبيانات المعمل الحية</h4>
                <p className="text-xs text-slate-400">
                  تستخدم هذه الأرقام في مزامنة الواتساب التلقائية والاتصال المباشر للمرضى
                </p>
              </div>

              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>تم حفظ وتحديث أرقام وبيانات المعمل بنجاح!</span>
                </div>
              )}

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
                <span>حفظ بيانات وتواصل المعمل</span>
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
