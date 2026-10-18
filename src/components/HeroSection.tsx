import {
  Sparkles,
  Trophy,
  Gift,
  RotateCw,
  Brain,
  MessageCircle,
  PhoneCall,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react';
import { LabSettings, PlayerProfile } from '../types';
import heroBanner from '../assets/images/rt_lab_hero_banner_1792323974869.jpg';
import doctorMascot from '../assets/images/rt_lab_doctor_mascot_1792323975479.jpg';

interface HeroSectionProps {
  settings: LabSettings;
  player: PlayerProfile;
  onNavigate: (tab: string) => void;
  onOpenSync: () => void;
  onOpenInvite: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  player,
  onNavigate,
  onOpenSync,
  onOpenInvite,
}) => {
  return (
    <div className="space-y-8">
      {/* Live Lab Announcement Ticker */}
      {settings.announcement && (
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/30 rounded-2xl px-4 py-2.5 text-xs text-emerald-200 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-bold text-emerald-300 shrink-0">بث حي من المعمل:</span>
            <span className="truncate">{settings.announcement}</span>
          </div>
          <button
            onClick={onOpenSync}
            className="flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-white px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 shrink-0 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>حجز زيارة منزلية</span>
          </button>
        </div>
      )}

      {/* Hero 2-Column Split: Visual Narrative & Player Welcome */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Interactive Invitation & Branding */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>المنصة الترفيهية والتنافسية الأولى لرواد المعمل</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              العب وتسلَّ واكسب <span className="text-amber-400">تحاليل مجانية</span> وخصومات فورية مع {settings.labName}!
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              تحدَّ معلوماتك الطبية والثقافية، فك شفرات الألغاز والذكاء، ودَوّر عجلة الحظ يومياً لكسب
              كوبونات معتمدة لجميع فحوصاتك المخبرية وسحب العينات المنزلي.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="pt-6 mt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
            <button
              onClick={() => onNavigate('quiz')}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition-all hover:scale-[1.02]"
            >
              <Brain className="w-4 h-4 text-emerald-200" />
              <span>مسابقة الذكاء والجوائز</span>
            </button>

            <button
              onClick={() => onNavigate('wheel')}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-950 transition-all hover:scale-[1.02]"
            >
              <RotateCw className="w-4 h-4" />
              <span>عجلة الحظ الدوارة</span>
            </button>

            <button
              onClick={() => onNavigate('scratch')}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
            >
              <Gift className="w-4 h-4 text-teal-400" />
              <span>كارت الخربشة الفوري</span>
            </button>
          </div>
        </div>

        {/* Right Column: Hero Visual Showcase */}
        <div className="lg:col-span-5 relative rounded-3xl overflow-hidden border border-slate-800 min-h-[320px] shadow-2xl flex flex-col justify-end p-6">
          <img
            src={heroBanner}
            alt="معامل RT للتحاليل الطبية"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover brightness-[0.75]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Floating Mascot & Info Card */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-700/60">
              <img
                src={doctorMascot}
                alt="د. رامي - معامل RT"
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-emerald-500/40 shrink-0"
              />
              <div>
                <span className="text-[11px] text-emerald-400 font-bold block">مرحباً بك في معامل RT</span>
                <p className="text-xs text-slate-200 font-semibold">
                  «صحتك أمانة، وراحتك وترفيهك غايتنا دائماً»
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>سحب منزلي 24 ساعة</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>نتائج دقيقة في نفس اليوم</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Friend Referral & Share Banner */}
      <div className="bg-gradient-to-r from-teal-950/60 via-slate-900 to-emerald-950/60 border border-teal-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3 text-right">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white">
              شارك التحدي مع أصدقائك وعائلتك واكسب <span className="text-amber-400 font-black">+50 نقطة فورية</span>!
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              أرسل رابط معامل RT لأي صديق على واتساب ليدخل يلعب ويكسب تحاليل مجانية معك.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenInvite}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-950 transition-all hover:scale-105 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>مشاركة الرابط وكسب 50 نقطة</span>
        </button>
      </div>

      {/* 4 Feature Cards / Direct Gateways */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Quiz */}
        <div
          onClick={() => onNavigate('quiz')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:bg-slate-850 group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
              مسابقة الذكاء والمعلومات
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              أسئلة طبية مبسطة، ألغاز فكرية، ومعلومات عامة ممتعة مع كل إجابة صحيحة تكسب نقاطاً وهدايا.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-400 font-bold">
            <span>ابدأ التحدي</span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Lucky Wheel */}
        <div
          onClick={() => onNavigate('wheel')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:bg-slate-850 group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <RotateCw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
              عجلة الحظ الدوارة
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              لف العجلة مجاناً واكسب تحاليل دم CBC مجانية، خصم 25%، أو نقاط مكافأة فورية لك ولأسرتك.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-amber-400 font-bold">
            <span>دَوّر العجلة الآن</span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Scratch Cards */}
        <div
          onClick={() => onNavigate('scratch')}
          className="bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:bg-slate-850 group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
              <Gift className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-teal-400 transition-colors">
              كروت الخربشة الفورية
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              حك الطبقة الفضية على الشاشة واكشف هديتك المخفية: فحص سكر مجاناً أو خصم كاش فوري.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-teal-400 font-bold">
            <span>اخربش واكسب</span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Rewards Store */}
        <div
          onClick={() => onNavigate('store')}
          className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:bg-slate-850 group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
              متجر الجوائز والتحاليل
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              استبدل نقاطك بأقوى الباقات المخبرية وكوبونات الخصم، مع كود معتمد ومزامنة مباشرة لواتساب المعمل.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-purple-400 font-bold">
            <span>استعراض المتجر</span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
