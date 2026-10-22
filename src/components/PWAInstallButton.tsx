import React, { useState } from 'react';
import { Smartphone, Download, Share2, PlusSquare, Check, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'banner' | 'card' | 'floating';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'navbar', className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already installed and running standalone, do not show the install trigger
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
      }
    } else {
      // Show instructions modal for iOS or browsers that don't trigger beforeinstallprompt
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {variant === 'navbar' && (
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition-all active:scale-95 whitespace-nowrap shadow-sm ${className}`}
          title="تثبيت التطبيق على شاشة الموبايل"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="hidden sm:inline">تثبيت التطبيق</span>
          <span className="sm:hidden">تثبيت</span>
        </button>
      )}

      {variant === 'banner' && (
        <div className={`bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg ${className}`}>
          <div className="flex items-center gap-3 text-right w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>تطبيق معامل RT على شاشة هاتفك</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">PWA</span>
              </h4>
              <p className="text-xs text-slate-400">
                ثبّت التطبيق بضغطة واحدة ليفتح كأي تطبيق أصلي بدون شريط المتصفح وبأعلى سرعة!
              </p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-md shadow-emerald-950 transition-transform active:scale-95 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>تثبيت على الشاشة الآن</span>
          </button>
        </div>
      )}

      {variant === 'card' && (
        <button
          onClick={handleInstallClick}
          className={`flex items-center justify-between p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/30 text-right transition-all group ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">إظهار التطبيق على شاشة الموبايل</div>
              <div className="text-[11px] text-slate-400">وصول سريع لجوائز ونقاط المعمل في أي وقت</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs">
            تثبيت
          </span>
        </button>
      )}

      {/* Installation Success Toast */}
      {installSuccess && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-bold animate-bounce">
          <Check className="w-5 h-5" />
          <span>تم تثبيت التطبيق بنجاح على هاتفك! يمكنك الآن فتحه من الشاشة الرئيسية.</span>
        </div>
      )}

      {/* Guided Instructions Modal (for iOS Safari or manual installation) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-right relative space-y-5">
            {/* Close button */}
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-5 left-5 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  تثبيت تطبيق معامل RT على شاشة الهاتف
                </h3>
                <p className="text-xs text-slate-400">
                  خطوات سريعة لإضافة التطبيق كأيقونة على هاتفك ليعمل كـ تطبيق حقيقي
                </p>
              </div>
            </div>

            {/* iOS Safari Steps */}
            <div className="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5 pb-2 border-b border-slate-800">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>طريقة التثبيت على الآيفون (iOS Safari):</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  اضغط على زر <strong className="text-emerald-300 inline-flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> مشاركة (Share)</strong> في شريط متصفح سفاري السفلي.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  مرر القائمة لأسفل واختر <strong className="text-amber-300 inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5" /> إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  اضغط على <strong>إضافة (Add)</strong> في الزاوية العلوية، وستظهر أيقونة تطبيق معامل RT على شاشتك الرئيسية فوراً.
                </p>
              </div>
            </div>

            {/* Android Chrome Steps */}
            <div className="space-y-2 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
              <div className="font-bold text-teal-400 pb-1 border-b border-slate-800">
                <span>طريقة التثبيت على أندرويد (Google Chrome):</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                اضغط على القائمة (الثلاث نقاط ⋮) في أعلى أو أسفل المتصفح، ثم اختر <strong className="text-white">"تثبيت التطبيق"</strong> أو <strong className="text-white">"إضافة إلى الشاشة الرئيسية"</strong>.
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              فهمت ذلك، تم
            </button>
          </div>
        </div>
      )}
    </>
  );
};
