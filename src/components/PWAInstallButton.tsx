import React, { useState } from 'react';
import { Download, Laptop, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {isInstallable ? (
        <button
          onClick={install}
          className={`inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 text-xs font-bold shadow transition ${className}`}
          title="تثبيت التطبيق على جهازك للوصول السريع"
        >
          <Download className="h-3.5 w-3.5 text-amber-400" />
          <span>تثبيت التطبيق</span>
        </button>
      ) : isIOS ? (
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 text-xs font-bold shadow-sm transition ${className}`}
        >
          <Smartphone className="h-3.5 w-3.5 text-[#8B1E2D]" />
          <span>تثبيت على iPhone</span>
        </button>
      ) : (
        <button
          onClick={() => {
            alert('لتثبيت التطبيق على شاشة هاتفك أو اللابتوب: افتح خيارات المتصفح (⋮) ثم اضغط "إضافة إلى الشاشة الرئيسية" أو "تثبيت التطبيق".');
          }}
          className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 text-xs font-bold shadow-sm transition ${className}`}
        >
          <Download className="h-3.5 w-3.5 text-[#8B1E2D]" />
          <span>تثبيت التطبيق</span>
        </button>
      )}

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-slate-900 text-right">
            <div className="flex items-center justify-between mb-3 border-b pb-2">
              <h3 className="font-bold text-sm text-[#8B1E2D]">تثبيت تطبيق معامل رامي مختار على iPhone / iPad</h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              يمكنك تشغيل البرنامج كتطبيق أصلي سريع وسلس على هاتفك باتباع الخطوتين:
            </p>

            <ol className="text-xs text-slate-700 space-y-2 mb-4 bg-slate-50 p-3 rounded-xl border">
              <li>1. اضغط على زر المشاركة <strong>(Share / 📤)</strong> في أسفل شريط متصفح سفاري.</li>
              <li>2. اسحب للأسفل واضغط على <strong>"إضافة إلى الصفحة الرئيسية" (Add to Home Screen)</strong>.</li>
            </ol>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#8B1E2D] text-white font-bold text-xs"
            >
              حسناً، فهمت
            </button>
          </div>
        </div>
      )}
    </>
  );
};
