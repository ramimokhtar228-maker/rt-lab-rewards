import React, { useState } from 'react';
import {
  Sparkles,
  Gift,
  Award,
  Check,
  Copy,
  MessageCircle,
  Clock,
  CheckCircle2,
  Tag,
  Coins,
} from 'lucide-react';
import { RewardItem, UserCoupon, PlayerProfile } from '../types';
import { soundManager } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

interface RewardsStoreProps {
  rewards: RewardItem[];
  userCoupons: UserCoupon[];
  player: PlayerProfile;
  onUpdatePlayer: (updated: Partial<PlayerProfile>) => void;
  onRedeemReward: (reward: RewardItem) => UserCoupon;
  onOpenSyncWithCoupon: (coupon: UserCoupon) => void;
  onClaimPrize: (coupon: UserCoupon) => void;
}

export const RewardsStore: React.FC<RewardsStoreProps> = ({
  rewards,
  userCoupons,
  player,
  onRedeemReward,
  onOpenSyncWithCoupon,
  onClaimPrize,
}) => {
  const [activeTab, setActiveTab] = useState<'store' | 'my_coupons'>('store');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    soundManager.playTick();
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRedeem = (reward: RewardItem) => {
    if (player.points < reward.pointsCost) {
      alert(`عفواً، رصيدك ${player.points} نقطة والمكافأة تتطلب ${reward.pointsCost} نقطة. يمكنك جمع المزيد من النقاط بلعب مسابقة الذكاء وعجلة الحظ!`);
      return;
    }

    soundManager.playFanfare();
    triggerConfetti();
    const newCoupon = onRedeemReward(reward);
    setActiveTab('my_coupons');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'store'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            متجر استبدال النقاط ({rewards.length})
          </button>
          <button
            onClick={() => setActiveTab('my_coupons')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'my_coupons'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            كوبوناتي والجوائز الرابحة ({userCoupons.length})
          </button>
        </div>

        {/* Current Points Counter */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-bold">
          <Coins className="w-4 h-4 text-amber-400" />
          <span>رصيدك القابل للاستبدال:</span>
          <span className="text-base font-black font-mono tabular-nums">{player.points}</span>
          <span>نقطة</span>
        </div>
      </div>

      {activeTab === 'store' ? (
        /* Rewards Catalog */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards
            .filter((r) => r.isActive)
            .map((reward) => {
              const canAfford = player.points >= reward.pointsCost;

              return (
                <div
                  key={reward.id}
                  className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-amber-400">
                        {reward.badge}
                      </span>
                      <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono font-bold text-emerald-400">
                        {reward.value}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {reward.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {reward.description}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-500 bg-slate-950/60 p-2 rounded-lg">
                      {reward.terms}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-300">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-sm font-mono tabular-nums">{reward.pointsCost}</span>
                      <span className="text-[11px]">نقطة</span>
                    </div>

                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        canAfford
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                      }`}
                    >
                      {canAfford ? 'استبدل الآن' : 'نقاطك غير كافية'}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        /* My Won Coupons Tab */
        <div className="space-y-4">
          {userCoupons.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <Gift className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <h4 className="text-base font-bold text-white">لا توجد كوبونات بعد</h4>
              <p className="text-xs text-slate-500 mt-1">
                العب المسابقات، دور عجلة الحظ، أو اخربش الكروت لربح تحاليل وخصومات فورية!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between space-y-4 shadow-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-emerald-400 font-semibold block">
                          مصدر الفوز: {coupon.wonFrom}
                        </span>
                        <h4 className="text-base font-bold text-white mt-0.5">{coupon.title}</h4>
                      </div>
                      <div className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 font-bold text-xs shrink-0">
                        {coupon.value}
                      </div>
                    </div>

                    <p className="text-xs text-slate-400">{coupon.description}</p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500">
                      <span>تاريخ الإصدار: {coupon.createdAt}</span>
                      <span>·</span>
                      <span>صالح حتى: {coupon.expiresAt}</span>
                    </div>
                  </div>

                  {/* Coupon Code Block */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500">كود التحقق الإلكتروني</span>
                      <span className="font-mono font-bold text-sm tracking-wider text-emerald-300">
                        {coupon.couponCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <button
                        onClick={() => handleCopy(coupon.couponCode)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="نسخ الكود"
                      >
                        {copiedCode === coupon.couponCode ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => onClaimPrize(coupon)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs transition-colors"
                        title="تأكيد بياناتك والتسجيل في دوري أبطال المعمل"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>تفعيل الجائزة ودوري الأبطال</span>
                      </button>

                      <button
                        onClick={() => onOpenSyncWithCoupon(coupon)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>واتساب المعمل</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
