import React, { useState } from 'react';
import { Download, Laptop, Smartphone, X, Monitor, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  showIconOnly?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ className = '', showIconOnly = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = () => {
    if (isInstallable) {
      install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 px-3 py-2 text-xs font-bold shadow-xs hover:border-slate-300 transition cursor-pointer ${className}`}
        title="تثبيت التطبيق على جهاز الكمبيوتر أو الهاتف للوصول الفوري"
      >
        <Download className="h-3.5 w-3.5 text-[#8B1E2D]" />
        {!showIconOnly && (
          <>
            <span className="hidden sm:inline">تثبيت البرنامج</span>
            <span className="sm:hidden">تثبيت 📲</span>
          </>
        )}
      </button>

      {/* Guide Modal for Desktop / Android / iOS */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in text-right">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-slate-900 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-rose-50 text-[#8B1E2D] flex items-center justify-center">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900">
                    تثبيت تطبيق معامل رامي مختار
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    على اللابتوب أو الهاتف المحمول للوصول السريع
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Laptop / Computer Instructions */}
            <div className="mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2 font-bold text-xs text-[#0F2B5C]">
                <Monitor className="h-4 w-4" />
                <span>على الكمبيوتر أو اللابتوب (Chrome / Edge):</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>
                  انقر على أيقونة التثبيت <strong className="text-slate-900">⊕</strong> الموجودة في شريط عنوان المتصفح (Address Bar) بجانب رابط الموقع.
                </li>
                <li>
                  أو من قائمة المتصفح <strong className="text-slate-900">(⋮)</strong> اختر <strong className="text-slate-900">"تثبيت تطبيق RT Labs"</strong>.
                </li>
              </ul>
            </div>

            {/* Mobile Instructions */}
            <div className="mb-5 bg-rose-50/60 p-4 rounded-2xl border border-rose-200/80">
              <div className="flex items-center gap-2 mb-2 font-bold text-xs text-[#8B1E2D]">
                <Smartphone className="h-4 w-4" />
                <span>على الهاتف (iPhone أو Android):</span>
              </div>
              {isIOS ? (
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>
                    اضغط زر المشاركة <strong className="text-slate-900">(Share / 📤)</strong> في أسفل متصفح سفاري Safari.
                  </li>
                  <li>
                    اختر <strong className="text-slate-900">"إضافة إلى الصفحة الرئيسية" (Add to Home Screen)</strong>.
                  </li>
                </ul>
              ) : (
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>
                    اضغط على قائمة المتصفح <strong className="text-slate-900">(⋮)</strong> بأعلى الشاشة.
                  </li>
                  <li>
                    اضغط على <strong className="text-slate-900">"تثبيت التطبيق"</strong> أو <strong className="text-slate-900">"إضافة إلى الشاشة الرئيسية"</strong>.
                  </li>
                </ul>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isInstallable && (
                <button
                  onClick={() => {
                    install();
                    setShowGuide(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#8B1E2D] hover:bg-[#731925] text-white font-bold text-xs transition shadow-sm"
                >
                  تثبيت الآن فوراً
                </button>
              )}
              <button
                onClick={() => setShowGuide(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                حسناً، فهمت
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
