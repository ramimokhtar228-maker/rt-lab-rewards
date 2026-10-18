import React from 'react';
import { Trophy, Medal, Crown, Sparkles, Award, Star } from 'lucide-react';
import { LeaderboardUser, PlayerProfile } from '../types';

interface LeaderboardProps {
  leaderboard: LeaderboardUser[];
  player: PlayerProfile;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboard, player }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner / Weekly Challenge announcement */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-emerald-500/10 border border-amber-500/30 rounded-2xl p-6 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
          <Trophy className="w-4 h-4" />
          <span>دوري أبطال معامل RT الأسبوعي</span>
        </div>
        <h2 className="text-2xl font-black text-white">تنافس مع رواد المعمل واكسب جوائز كبرى!</h2>
        <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
          المرتبة الأولى أسبوعياً تفوز بـ <strong className="text-amber-400">باقة فحص شامل مجانية 100%</strong>،
          والمرتبة الثانية بـ <strong className="text-emerald-400">تحليل صورة دم CBC مجاني</strong>، والمرتبة الثالثة بـ <strong className="text-teal-400">خصم 50%</strong>!
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {leaderboard.slice(0, 3).map((user, idx) => {
          let ringColor = 'border-amber-400 text-amber-400 bg-amber-500/10';
          let crownIcon = <Crown className="w-6 h-6 text-amber-400" />;
          if (idx === 1) {
            ringColor = 'border-slate-300 text-slate-300 bg-slate-300/10';
            crownIcon = <Medal className="w-6 h-6 text-slate-300" />;
          } else if (idx === 2) {
            ringColor = 'border-amber-700 text-amber-600 bg-amber-700/10';
            crownIcon = <Medal className="w-6 h-6 text-amber-600" />;
          }

          return (
            <div
              key={user.id}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col items-center text-center space-y-3 relative overflow-hidden ${
                idx === 0 ? 'border-amber-500/60 shadow-xl shadow-amber-500/5 order-first md:order-none' : 'border-slate-800'
              }`}
            >
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                {crownIcon}
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 block">{user.badge}</span>
                <h4 className="text-base font-bold text-white mt-0.5">{user.name}</h4>
                <span className="text-xs font-mono text-slate-500">{user.phoneMasked}</span>
              </div>

              <div className="w-full pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">المركز: #{idx + 1}</span>
                <span className="font-mono font-bold text-emerald-400">{user.points} نقطة</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>ترتيب جميع المتسابقين هذا الشهر</span>
          </h3>
          <span className="text-xs text-slate-500">يتم التحديث تلقائياً</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {leaderboard.map((user) => (
            <div
              key={user.id}
              className="p-4 flex items-center justify-between hover:bg-slate-850/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-400">
                  {user.rank}
                </span>
                <div>
                  <h5 className="text-sm font-bold text-white">{user.name}</h5>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{user.phoneMasked}</span>
                    <span>·</span>
                    <span className="text-amber-400/90">{user.badge}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-emerald-400 tabular-nums">
                    {user.points}
                  </span>
                  <span className="text-[10px] text-slate-500 block">نقطة ذكاء</span>
                </div>
              </div>
            </div>
          ))}

          {/* Current User Row */}
          <div className="p-4 bg-emerald-950/20 border-t-2 border-emerald-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-mono font-bold text-xs text-white">
                أنت
              </span>
              <div>
                <h5 className="text-sm font-bold text-emerald-300">{player.name}</h5>
                <span className="text-[11px] text-slate-400">{player.levelTitle}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono font-bold text-sm text-emerald-400 tabular-nums">
                {player.points}
              </span>
              <span className="text-[10px] text-slate-500 block">نقاطك الحالية</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
