import React from 'react';
import { Share2, Gamepad2, UserCheck, MessageCircle, ChevronLeft, Sparkles, ArrowDown } from 'lucide-react';

interface PatientJourneyGuideProps {
  onStartPlay: () => void;
  onOpenInvite: () => void;
}

export const PatientJourneyGuide: React.FC<PatientJourneyGuideProps> = ({
  onStartPlay,
  onOpenInvite,
}) => {
  const steps = [
    {
      num: '01',
      title: 'إرسال الرابط ودخول التحدي',
      desc: 'يستلم المريض رابط المنصة عبر الواتساب أو مشاركة صديق، ويفتح الموقع فوراً بدون تحميل تطبيق.',
      icon: Share2,
      color: 'from-blue-500/20 to-cyan-500/10 text-cyan-400 border-cyan-500/30',
      actionLabel: 'مشاركة الرابط',
      action: onOpenInvite,
    },
    {
      num: '02',
      title: 'اللعب وربح التحاليل والخصومات',
      desc: 'يختار مسابقة الذكاء الطبية، عجلة الحظ اليومية، أو كارت الخربشة، ويكسب تحاليل دم CBC وسكر مجاني وخصومات.',
      icon: Gamepad2,
      color: 'from-amber-500/20 to-yellow-500/10 text-amber-400 border-amber-500/30',
      actionLabel: 'ابدأ اللعب الآن',
      action: onStartPlay,
    },
    {
      num: '03',
      title: 'تسجيل البيانات ودخول دوري الأبطال',
      desc: 'يسجل اسمه ورقمه ومكانه ويختار سحب منزلي أو الفرع، وينضم تلقائياً للائحة المتصدرين للمنافسة على باقة الفحص الكبرى.',
      icon: UserCheck,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
    },
    {
      num: '04',
      title: 'المزامنة مع واتساب المعمل وتأكيد الحجز',
      desc: 'بضغطة زر يرسل تذكرة الكوبون المعتمدة لواتساب المعمل، ويستلم رسالة التأكيد الرسمية بالموعد والنقاط المسجلة.',
      icon: MessageCircle,
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>خارطة رحلة المريض المتكاملة</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            كيف تبدأ من استلام الرابط وحتى حجز التحليل وجائزتك؟
          </h3>
          <p className="text-xs text-slate-400">
            تنسيق متكامل وخطوات سهلة تضمن للمريض متعة المشاركة وسرعة الاستفادة الطبية في معامل RT
          </p>
        </div>

        <button
          onClick={onStartPlay}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all shrink-0 hover:scale-105"
        >
          <span>جرب الرحلة الآن</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          return (
            <div
              key={st.num}
              className={`bg-slate-950/70 border rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all hover:bg-slate-950 ${st.color}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xl font-black text-slate-600">{st.num}</span>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-current">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{st.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">{st.desc}</p>
                </div>
              </div>

              {st.action && (
                <button
                  onClick={st.action}
                  className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 transition-colors text-center border border-slate-800"
                >
                  {st.actionLabel}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
