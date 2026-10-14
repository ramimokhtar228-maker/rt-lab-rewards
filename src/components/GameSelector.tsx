import { Award, Compass, Dna, Gift, HelpCircle, Layers, Package, Sparkles } from 'lucide-react';
import { GameType } from '../types';

interface GameSelectorProps {
  activeGame: GameType;
  onSelectGame: (game: GameType) => void;
  disabled?: boolean;
}

export const GameSelector: React.FC<GameSelectorProps> = ({
  activeGame,
  onSelectGame,
  disabled,
}) => {
  const games: {
    id: GameType;
    title: string;
    description: string;
    badge: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'wheel',
      title: 'عجلة الحظ الطبية',
      description: 'دوّر العجلة واربح خصومات وباقات فحص فوري',
      badge: 'الأكثر شعبية',
      icon: <Compass className="h-5 w-5" />,
    },
    {
      id: 'scratch',
      title: 'كارت الخدش الفوري',
      description: 'امسح الطبقة الذهبية بيدك واكتشف هديتك',
      badge: 'فوز فوري',
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      id: 'box',
      title: 'صناديق المفاجآت',
      description: 'اختر أحد الصناديق لفتح هديتك الحصرية',
      badge: 'مفاجآت كبرى',
      icon: <Package className="h-5 w-5" />,
    },
    {
      id: 'match',
      title: 'كروت الذاكرة الطبية',
      description: 'طابق الرموز الصحية والأيقونات واكشف جائزتك',
      badge: 'جديد وحصري',
      icon: <Dna className="h-5 w-5" />,
    },
    {
      id: 'capsule',
      title: 'كبسولة الحظ الذهبية',
      description: 'اسحب كبسولتك الصحية واكشف باقتك الفورية',
      badge: 'حصري وجديد',
      icon: <Award className="h-5 w-5 text-amber-500" />,
    },
    {
      id: 'quiz',
      title: 'المسابقة الطبية',
      description: 'أجب عن أسئلة صحية سريعة واحصل على كوبونك',
      badge: 'تثقيف وجائزة',
      icon: <HelpCircle className="h-5 w-5" />,
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="text-center mb-5">
        <h3 className="text-lg sm:text-xl font-black text-slate-900">
          اختر وسيلة الترفيه المفضلة لديك 🎮
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          يمكنك اختيار لعبة واحدة للمشاركة وربح كوبون الخصم الساري لمدة 24 ساعة
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {games.map((g) => {
          const isActive = activeGame === g.id;
          return (
            <button
              key={g.id}
              onClick={() => onSelectGame(g.id)}
              disabled={disabled}
              className={`relative rounded-2xl p-3.5 sm:p-4 text-right transition-all border-2 flex flex-col justify-between ${
                isActive
                  ? 'border-[#8B1E2D] bg-white shadow-lg shadow-rose-900/10 ring-2 ring-rose-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-xs'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center transition ${
                    isActive
                      ? 'bg-gradient-to-br from-[#8B1E2D] to-rose-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {g.icon}
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-rose-100 text-[#8B1E2D]'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {g.badge}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{g.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {g.description}
                </p>
              </div>

              {isActive && (
                <div className="mt-2 text-[10px] font-black text-[#8B1E2D] flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8B1E2D] animate-ping" />
                  <span>اللعبة المحددة حالياً</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
