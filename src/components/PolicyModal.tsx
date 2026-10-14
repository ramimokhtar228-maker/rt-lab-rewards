import React from 'react';
import { AlertCircle, CheckCircle2, Clock, ShieldCheck, X } from 'lucide-react';
import { LabSettings } from '../types';

interface PolicyModalProps {
  settings: LabSettings;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ settings, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 overflow-y-auto backdrop-blur-sm animate-fade-in text-right">
      <div className="relative w-full max-w-xl rounded-2xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden my-4 border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8B1E2D] to-[#0F2B5C] p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">شروط وقواعد استخدام كوبونات الجوائز</h3>
              <p className="text-xs text-rose-100">معامل د. رامي مختار للتحاليل الطبية (RT Labs)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
          {/* 24-hr rule highlight */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-950 font-medium">
            <Clock className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-900 font-bold mb-0.5">
                قاعدة الصلاحية الصارمة (24 ساعة):
              </strong>
              يسري مفعول أي كوبون يتم الفوز به لمدة 24 ساعة فقط تبدأ فوراً من لحظة إصدار الكود. في حال عدم الحجز أو الزيارة خلال الـ 24 ساعة يسقط حق المطالبة بالخصم تلقائياً.
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 text-sm">البنود والشروط التنظيمية:</h4>
            {settings.termsAndConditions.map((term, idx) => (
              <div key={idx} className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{term}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 p-3 sm:p-4 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#8B1E2D] hover:bg-[#731925] text-white font-bold text-xs shadow transition"
          >
            فهمت وموافق
          </button>
        </div>
      </div>
    </div>
  );
};
