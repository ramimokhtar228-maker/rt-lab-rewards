import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Edit2,
  ExternalLink,
  Gift,
  Key,
  Layers,
  Lock,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Share2,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { DiscountType, LabSettings, PatientClaim, Prize, PrizeIdea } from '../types';
import { deleteClaim, getPrizeIdeas, updateClaimStatus } from '../services/storageService';

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
  const [activeTab, setActiveTab] = useState<'prizes' | 'ideas' | 'claims' | 'settings'>('prizes');

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

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<LabSettings>({ ...settings });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Claims search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  // Prize ideas vault
  const prizeIdeas = getPrizeIdeas();

  // Authentication check
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === settings.adminPin || pinInput === '1234') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // Add or Edit Prize Handler
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
        terms: prizeForm.terms || 'تطبق الشروط والأحكام الخاصة بمعامل رامي مختار',
      };
      onUpdatePrizes([...prizes, newPrize]);
    }

    setEditingPrize(null);
    setIsAddingPrize(false);
  };

  const handleDeletePrize = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الجائزة من القائمة؟')) {
      onUpdatePrizes(prizes.filter((p) => p.id !== id));
    }
  };

  const handleTogglePrizeActive = (id: string) => {
    const updated = prizes.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
    onUpdatePrizes(updated);
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
      terms: 'عرض خاص معتمد من إدارة معامل رامي مختار',
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

  // Export claims to CSV
  const handleExportCSV = () => {
    if (claims.length === 0) {
      alert('لا توجد بيانات مسجلة للتصدير حالياً.');
      return;
    }

    const headers = ['كود الكوبون', 'اسم المريض', 'رقم الهاتف', 'الفرع', 'الجائزة', 'قيمة الخصم', 'تاريخ التسجيل', 'تاريخ الانتهاء', 'الحالة'];
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

  // Copy shareable patient link
  const copyPatientLink = () => {
    const url = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 overflow-y-auto backdrop-blur-md">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden my-4 border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#8B1E2D] flex items-center justify-center font-bold text-white shadow">
              RT
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">لوحة تحكم إدارة معامل رامي مختار</h3>
              <p className="text-[11px] text-slate-300">إدارة الجوائز والخصومات وسجل المرضى والواتساب</p>
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
          /* Authentication Screen */
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto">
            <div className="h-16 w-16 rounded-2xl bg-rose-50 text-[#8B1E2D] flex items-center justify-center mb-4 border border-rose-200">
              <Lock className="h-8 w-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">تسجيل الدخول لإدارة المعمل</h4>
            <p className="text-xs text-slate-600 mt-1 mb-6">
              أدخل رمز المرور السري (PIN) للوصول لإدارة العروض والهدايا وسجل الكوبونات (الرمز الافتراضي: 1234)
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="relative">
                <input
                  type="password"
                  maxLength={8}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="رمز المرور (1234)"
                  className="w-full text-center text-xl font-mono tracking-widest py-3 px-4 rounded-xl border border-slate-300 focus:border-[#8B1E2D] focus:ring-2 focus:ring-rose-500/20 outline-none transition"
                  autoFocus
                />
                <Key className="absolute right-4 top-3.5 h-5 w-5 text-slate-400" />
              </div>

              {pinError && (
                <div className="text-xs text-red-600 font-semibold">
                  رمز المرور غير صحيح. برجاء التجربة مرة أخرى (الافتراضي 1234).
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
                <span>إدارة الجوائز والخصومات ({prizes.length})</span>
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
                <span>بنك الأفكار التسويقية المقترحة</span>
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
                <span>سجل الفائزين والكوبونات ({claims.length})</span>
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
                <span>إعدادات المعمل والواتساب</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
              {/* TAB 1: PRIZES MANAGEMENT */}
              {activeTab === 'prizes' && (
                <div className="space-y-6">
                  {/* Top Bar with Add Prize Button */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">قائمة هدايا وخصومات المسابقات</h4>
                      <p className="text-xs text-slate-500">
                        تحكم في نسب الخصم ونوع الهدايا التي تظهر في عجلة الحظ وكارت الخدش وتحدي المعلومات
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
                          terms: '',
                        });
                        setIsAddingPrize(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#8B1E2D] hover:bg-[#731925] text-white py-2 px-4 text-xs font-bold shadow transition"
                    >
                      <Plus className="h-4 w-4" />
                      <span>إضافة هدية / خصم جديد</span>
                    </button>
                  </div>

                  {/* Add / Edit Form Modal / Accordion */}
                  {isAddingPrize && (
                    <div className="rounded-xl border border-rose-300 bg-rose-50/50 p-5 shadow-sm animate-fade-in">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-bold text-slate-900 text-sm">
                          {editingPrize ? 'تعديل الهدية / الخصم' : 'إضافة هدية جديدة للمسابقات'}
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
                          <label className="block font-semibold text-slate-700 mb-1">الاسم المختصر (للعجلة) *</label>
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
                            <option value="free_test">فحص مجاني بالكامل</option>
                            <option value="fixed">قسيمة بمبلغ نقدي محدد (ج.م)</option>
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
                          <label className="block font-semibold text-slate-700 mb-1">نسبة ظهور الجائزة (الوزن النسبي)</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={prizeForm.weight}
                            onChange={(e) => setPrizeForm({ ...prizeForm, weight: Number(e.target.value) })}
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#8B1E2D]"
                          />
                          <span className="text-[10px] text-slate-500">كلما زاد الرقم زادت فرصة فوز المريض بها</span>
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
                          <label className="block font-semibold text-slate-700 mb-1">شرح الجائزة وشروطها للمريض</label>
                          <input
                            type="text"
                            placeholder="مثال: يشمل باقة الاطمئنان الشاملة ويطبق في كافة فروع معامل رامي مختار"
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
                            {editingPrize ? 'تحديث الجائزة' : 'حفظ ونشر الجائزة'}
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
                        className={`rounded-xl border p-4 transition bg-white flex flex-col justify-between ${
                          p.active ? 'border-slate-200 shadow-sm' : 'border-slate-200 opacity-60 bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="h-8 w-8 rounded-lg shrink-0 flex items-center justify-center text-white font-black text-xs shadow-sm"
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
                          <div className="flex items-center gap-2">
                            <span>الاحتمالية: {p.weight}</span>
                            <span>·</span>
                            <span className="text-[11px] text-slate-400 truncate max-w-[150px]">{p.shortTitle}</span>
                          </div>

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

              {/* TAB 2: MARKETING IDEAS VAULT */}
              {activeTab === 'ideas' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-900 to-[#8B1E2D] p-5 rounded-xl text-white shadow">
                    <div className="flex items-center gap-2 text-xs font-semibold text-rose-200 mb-1">
                      <Sparkles className="h-4 w-4" />
                      <span>أفكار تسويقية مبتكرة لزيادة تردد المرضى على معامل رامي مختار</span>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold">
                      بنك مقترحات الهدايا وباقات الفحص الطبي
                    </h4>
                    <p className="text-xs text-slate-200 mt-1 max-w-2xl leading-relaxed">
                      اختر أي فكرة تسويقية تناسب الحملة الحالية واضغط على زر الإضافة لتضمينها فوراً في ألعاب
                      المسابقات للمرضى!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prizeIdeas.map((idea) => (
                      <div
                        key={idea.id}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between hover:border-rose-300 transition"
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

                          <div className="mt-3 rounded-lg bg-emerald-50/70 p-2 border border-emerald-200 text-[11px] text-emerald-800">
                            <strong>الأثر التسويقي للمعمل:</strong> {idea.benefitToLab}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                          <button
                            onClick={() => handleAddIdeaToPrizes(idea)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#8B1E2D] hover:bg-[#731925] text-white py-2 px-3 text-xs font-bold shadow-sm transition"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>إضافة الفكرة إلى جوائز المسابقة</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: PATIENT CLAIMS & LOGS */}
              {activeTab === 'claims' && (
                <div className="space-y-4">
                  {/* Search and Filters Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="ابحث بالاسم أو رقم الهاتف أو كود الكوبون..."
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
                        <option value="verified">تم التأكيد</option>
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
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
                              <th className="p-3">الجائزة والخصم</th>
                              <th className="p-3">تاريخ الاستحقاق</th>
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
                                  <div>{claim.createdAt}</div>
                                  <div className="text-[10px] text-amber-700">ينتهي: {claim.expiresAt}</div>
                                </td>
                                <td className="p-3 whitespace-nowrap">
                                  {claim.status === 'redeemed' ? (
                                    <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                                      <CheckCircle2 className="h-3 w-3" /> تم الاستخدام
                                    </span>
                                  ) : claim.status === 'verified' ? (
                                    <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">
                                      مؤكد بالحجز
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                                      قيد الانتظار
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
                                        title="تأكيد الخصم والاستخدام بالمعمل"
                                      >
                                        تفعيل وخصم
                                      </button>
                                    )}

                                    <a
                                      href={`https://wa.me/${claim.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                        `أهلاً بك أستاذ ${claim.patientName}، نرحب بك في معامل رامي مختار! بخصوص كوبون الخصم الخاص بك (${claim.couponCode})، يشرفنا استقبالك لتأكيد الفحص والاستفادة من العرض.`
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                      title="مراسلة المريض عبر واتساب"
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

              {/* TAB 4: SETTINGS & WHATSAPP CONFIGURATION */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* Patient Shareable Link Box */}
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-emerald-700" />
                        <h4 className="font-bold text-emerald-950 text-sm">
                          رابط المسابقة الجاهز للإرسال للمرضى
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded border border-emerald-300">
                        مباشر وسهل الدخول
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mb-3 leading-relaxed">
                      انسخ هذا الرابط وأرسله للمرضى عبر رسائل الواتساب أو الرسائل النصية القصيرة SMS أو صفحة
                      الفيسبوك لجذبهم للمعمل:
                    </p>

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
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">إعدادات المعمل ورقم الواتساب المسجل</h4>
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
                            رقم واتساب المعمل المسجل (WhatsApp) *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: 201012345678"
                            value={settingsForm.whatsappNumber}
                            onChange={(e) =>
                              setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs font-mono text-slate-900 outline-none focus:border-[#8B1E2D]"
                          />
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            تُرسل بيانات الفائزين وكوبوناتهم مباشرة إلى هذا الرقم لتفعيلها.
                          </span>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            الخط الساخن أو هاتف المعمل *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: 16900"
                            value={settingsForm.hotline}
                            onChange={(e) =>
                              setSettingsForm({ ...settingsForm, hotline: e.target.value })
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs font-mono text-slate-900 outline-none focus:border-[#8B1E2D]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            اسم المعمل بالعربية
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
                            مدة صلاحية الكوبون (بالأيام)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="90"
                            value={settingsForm.couponValidityDays}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                couponValidityDays: Number(e.target.value),
                              })
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#8B1E2D]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            رمز PIN لدخول الإدارة
                          </label>
                          <input
                            type="password"
                            maxLength={8}
                            value={settingsForm.adminPin}
                            onChange={(e) =>
                              setSettingsForm({ ...settingsForm, adminPin: e.target.value })
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs font-mono text-slate-900 outline-none focus:border-[#8B1E2D]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            توجيه المريض تلقائياً لواتساب بعد التسجيل
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
                              <span className="text-slate-800">فتح تطبيق الواتساب فور التسجيل</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-200 flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-xl bg-[#8B1E2D] hover:bg-[#731925] text-white font-bold text-xs shadow transition"
                        >
                          حفظ كافة التعديلات
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
    </div>
  );
};
