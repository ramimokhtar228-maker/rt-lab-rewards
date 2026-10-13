import React from 'react';
import { Award, CheckCircle2, Clock, FileText, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { LabSettings } from '../types';
import { labLogo } from '../assets/images';

interface PolicyModalProps {
  settings: LabSettings;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ settings, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden my-6 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-900 text-white">
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
              <h3 className="font-bold text-base">سياسة المكافآت والجوائز الرسمية</h3>
              <p className="text-xs text-rose-300 font-medium">{settings.sloganAr}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-300 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[72vh] overflow-y-auto text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Key 24-hour Rule Highlight Box */}
          <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-4.5">
            <div className="flex items-center gap-2 text-rose-900 font-bold mb-1.5">
              <Clock className="h-5 w-5 text-[#8B1E2D]" />
              <span>قاعدة الـ 24 ساعة الإلزامية للمصداقية والشفافية:</span>
            </div>
            <p className="text-rose-950 font-medium leading-relaxed">
              • يُسمح لكل مريض بمحاولة واحدة فقط كل 24 ساعة، ولا يجوز اختيار أكثر من وسيلة ترفيهية واحدة في
              اليوم نفسه.<br />
              • في حال عدم استخدام الجائزة أو حجز موعد التحاليل خلال <strong>24 ساعة</strong> من لحظة الفوز،
              يتم <strong>إلغاء الكوبون تلقائياً وبشكل نهائي</strong> دون أدنى مسؤولية على المعمل، لإتاحة
              الفرصة لمرضى آخرين.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>شروط وأحكام تفعيل واستخدام الكوبونات:</span>
            </h4>

            <ul className="space-y-2.5">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>تأكيد الحجز الفوري:</strong> فور ظهور الكوبون، يجب إرسال الرسالة التلقائية إلى رقم
                  واتساب المعمل المسجل ليتم تسجيل كود الكوبون في ملف المريض وتثبيت الخصم.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>نطاق السريان:</strong> الكوبونات سارية في جميع فروع معامل رامي مختار الرسمية وكذلك
                  مع خدمة السحب المنزلي المريح.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>عدم الجمع بين العروض:</strong> لا يجوز الجمع بين كود الخصم المكتسب من المسابقة وأي
                  عروض ترويجية أخرى أو أسعار التعاقدات والتأمين الطبي.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>الاستخدام الشخصي أو العائلي:</strong> الكوبون صالح للاستخدام مرة واحدة للمريض نفسه
                  أو لأي من أفراد أسرته من الدرجة الأولى.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>إثبات الهوية والكوبون:</strong> يُلزم المريض بإبراز صورة الكوبون الرقمي أو رسالة
                  الواتساب لموظف الاستقبال عند سحب العينة.
                </span>
              </li>
            </ul>
          </div>

          {/* Slogan closing banner */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-900 text-white text-center">
            <div className="text-xs text-rose-300 font-bold mb-0.5">{settings.labNameAr}</div>
            <div className="text-base font-black tracking-wide text-white">{settings.sloganAr}</div>
            <div className="text-[11px] text-slate-400 mt-1">الخط الساخن: {settings.hotline}</div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#8B1E2D] hover:bg-[#731925] text-white font-bold text-xs shadow transition"
          >
            فهمت الشروط وموافق
          </button>
        </div>
      </div>
    </div>
  );
};
