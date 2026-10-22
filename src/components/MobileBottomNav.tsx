import React from 'react';
import { Home, HelpCircle, RotateCw, Sparkles, Gift, Trophy } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  couponsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  couponsCount,
}) => {
  const items = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'quiz', label: 'المسابقة', icon: HelpCircle },
    { id: 'wheel', label: 'العجلة', icon: RotateCw },
    { id: 'scratch', label: 'الخربشة', icon: Sparkles },
    { id: 'store', label: 'المتجر', icon: Gift, badge: couponsCount },
    { id: 'leaderboard', label: 'المتصدرون', icon: Trophy },
  ];

  return (
    <nav 
      aria-label="شريط التنقل للموبايل"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/90 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] px-1 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="grid grid-cols-6 items-center max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all relative group ${
                isActive
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1.5 rounded-xl transition-transform ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 scale-110 shadow-sm'
                      : 'group-hover:scale-105'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-4 text-[9px] font-mono font-bold bg-amber-500 text-slate-950 rounded-full flex items-center justify-center shadow">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 truncate tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
