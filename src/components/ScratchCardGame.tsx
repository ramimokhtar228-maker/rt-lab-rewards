import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, Gift, RotateCcw, MessageCircle, CheckCircle2 } from 'lucide-react';
import { PlayerProfile, UserCoupon } from '../types';
import { soundManager } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

interface ScratchCardGameProps {
  player: PlayerProfile;
  onUpdatePlayer: (updated: Partial<PlayerProfile>) => void;
  onAwardCoupon: (title: string, description: string, value: string, wonFrom: string) => UserCoupon;
  onOpenSyncWithCoupon: (coupon: UserCoupon) => void;
  onClaimPrize: (coupon: UserCoupon) => void;
}

const POSSIBLE_SCRATCH_PRIZES = [
  { title: 'تحليل CBC كامل مجاناً', value: 'مجاني 100%', desc: 'صورة دم كاملة شاملة جميع المؤشرات' },
  { title: 'خصم 30% على أي تحليل', value: 'خصم 30%', desc: 'يطبق مباشرة على إجمالي الفاتورة' },
  { title: 'تحليل سكر صائم مجاناً', value: 'مجاني 100%', desc: 'فحص دقيق لمعدل الجلوكوز بالدم' },
  { title: 'خصم 70 ج.م كاش', value: '70 ج.م كاش', desc: 'خصم نقدي مباشر عند حجز أي تحليل' },
  { title: 'خصم 50% على تحليل فيتامين D', value: 'خصم 50%', desc: 'اطمئن على صحة عظامك ومناعتك' },
];

export const ScratchCardGame: React.FC<ScratchCardGameProps> = ({
  player,
  onUpdatePlayer,
  onAwardCoupon,
  onOpenSyncWithCoupon,
  onClaimPrize,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [currentPrize, setCurrentPrize] = useState(POSSIBLE_SCRATCH_PRIZES[0]);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [awardedCoupon, setAwardedCoupon] = useState<UserCoupon | null>(null);
  const [cardsScratchedToday, setCardsScratchedToday] = useState(0);

  const initCanvas = (prize = currentPrize) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Reset composite
    ctx.globalCompositeOperation = 'source-over';

    // Draw luxury scratch coating gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#475569');
    grad.addColorStop(0.5, '#64748b');
    grad.addColorStop(1, '#334155');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative silver sparkles & pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    for (let i = 0; i < width; i += 24) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 40, height);
      ctx.stroke();
    }

    // Text instructions on scratch area
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px "Cairo", sans-serif';
    ctx.fillText('✨ اخربش هنا لكشف هديتك ✨', width / 2, height / 2 - 12);

    ctx.font = '600 12px "Cairo", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('حك بالماوس أو إصبعك على الشاشة', width / 2, height / 2 + 18);

    setIsRevealed(false);
    setScratchPercent(0);
    setAwardedCoupon(null);
  };

  useEffect(() => {
    // Pick random prize
    const p = POSSIBLE_SCRATCH_PRIZES[Math.floor(Math.random() * POSSIBLE_SCRATCH_PRIZES.length)];
    setCurrentPrize(p);
    initCanvas(p);
  }, []);

  const handleNewCard = () => {
    const p = POSSIBLE_SCRATCH_PRIZES[Math.floor(Math.random() * POSSIBLE_SCRATCH_PRIZES.length)];
    setCurrentPrize(p);
    initCanvas(p);
  };

  const handleScratch = (clientX: number, clientY: number) => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();

    soundManager.playScratch();

    // Estimate scratched percentage
    checkPercentScratched();
  };

  const checkPercentScratched = () => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      let transparentCount = 0;
      const step = 32; // sampling step for high performance

      for (let i = 3; i < data.length; i += step * 4) {
        if (data[i] === 0) {
          transparentCount++;
        }
      }

      const totalSampled = data.length / (step * 4);
      const ratio = transparentCount / totalSampled;
      setScratchPercent(Math.min(100, Math.round(ratio * 100)));

      if (ratio >= 0.42 && !isRevealed) {
        revealFullPrize();
      }
    } catch {}
  };

  const revealFullPrize = () => {
    setIsRevealed(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    soundManager.playFanfare();
    triggerConfetti();

    onUpdatePlayer({
      scratchCardsCount: player.scratchCardsCount + 1,
    });

    // Issue the coupon
    const coupon = onAwardCoupon(
      `كارت الخربشة: ${currentPrize.title}`,
      currentPrize.desc,
      currentPrize.value,
      'كارت الخربشة الفوري'
    );
    setAwardedCoupon(coupon);
    setCardsScratchedToday((prev) => prev + 1);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Intro Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-right">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">كارت الخربشة والربح الفوري</h2>
            <p className="text-xs text-slate-400">
              حك الطبقة الفضية بيدك أو الماوس واكشف الجائزة السرية المخفية لك من معامل RT!
            </p>
          </div>
        </div>

        <button
          onClick={handleNewCard}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
          <span>كارت جديد</span>
        </button>
      </div>

      {/* Card Arena */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* The Card Container */}
        <div className="relative w-full max-w-md h-64 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl select-none">
          {/* Underneath Layer: The Prize */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <span className="text-xs font-bold text-amber-400 tracking-wider">
              🎉 مبروك من معامل RT 🎉
            </span>
            <h3 className="text-2xl font-black text-white mt-1">{currentPrize.title}</h3>
            <div className="my-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-300 font-extrabold text-sm">
              {currentPrize.value}
            </div>
            <p className="text-xs text-slate-300">{currentPrize.desc}</p>
            <span className="text-[10px] text-slate-500 mt-2">معامل RT · كود معتمد رسمي</span>
          </div>

          {/* Top Layer: Interactive Canvas Scratch */}
          <canvas
            ref={canvasRef}
            width={440}
            height={260}
            className={`absolute inset-0 w-full h-full cursor-pointer touch-none transition-opacity duration-300 ${
              isRevealed ? 'pointer-events-none opacity-0' : 'opacity-100'
            }`}
            onMouseMove={(e) => {
              if (e.buttons === 1) handleScratch(e.clientX, e.clientY);
            }}
            onMouseDown={(e) => handleScratch(e.clientX, e.clientY)}
            onTouchMove={(e) => {
              if (e.touches.length > 0) {
                const touch = e.touches[0];
                handleScratch(touch.clientX, touch.clientY);
              }
            }}
            onTouchStart={(e) => {
              if (e.touches.length > 0) {
                const touch = e.touches[0];
                handleScratch(touch.clientX, touch.clientY);
              }
            }}
          />
        </div>

        {/* Progress or Status */}
        <div className="mt-4 flex items-center justify-between w-full max-w-md text-xs text-slate-400">
          <span>نسبة الكشف: {scratchPercent}%</span>
          {isRevealed ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              تم كشف الكارت وحفظ الجائزة!
            </span>
          ) : (
            <span>استمر في الخربشة لكشف الجائزة</span>
          )}
        </div>

        {/* Awarded Voucher Action */}
        {awardedCoupon && (
          <div className="w-full max-w-md mt-5 p-4 bg-slate-950 border border-emerald-500/30 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-right">
              <div>
                <span className="text-[11px] text-emerald-400 font-bold block">كود الكوبون الفوري الخاص بك:</span>
                <span className="font-mono text-base font-extrabold text-white">{awardedCoupon.couponCode}</span>
              </div>
              <span className="text-xs text-amber-300 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                {currentPrize.value}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onClaimPrize(awardedCoupon)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-amber-950"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>تفعيل الجائزة ودوري الأبطال</span>
              </button>

              <button
                onClick={() => onOpenSyncWithCoupon(awardedCoupon)}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>واتساب</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
