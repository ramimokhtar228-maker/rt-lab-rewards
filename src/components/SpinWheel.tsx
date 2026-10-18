import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, Trophy, RotateCw, Gift, MessageCircle, AlertCircle } from 'lucide-react';
import { SpinSlice, PlayerProfile, UserCoupon } from '../types';
import { soundManager } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

interface SpinWheelProps {
  slices: SpinSlice[];
  player: PlayerProfile;
  onUpdatePlayer: (updated: Partial<PlayerProfile>) => void;
  onAwardCoupon: (title: string, description: string, value: string, wonFrom: string) => UserCoupon;
  onOpenSyncWithCoupon: (coupon: UserCoupon) => void;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({
  slices,
  player,
  onUpdatePlayer,
  onAwardCoupon,
  onOpenSyncWithCoupon,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [wonSlice, setWonSlice] = useState<SpinSlice | null>(null);
  const [createdCoupon, setCreatedCoupon] = useState<UserCoupon | null>(null);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState(3);

  const numSlices = slices.length || 8;
  const sliceAngle = (2 * Math.PI) / numSlices;

  // Draw wheel on canvas
  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 15;

    ctx.clearRect(0, 0, width, height);

    // Save context for rotation
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);

    // Outer rim glow
    ctx.beginPath();
    ctx.arc(0, 0, radius + 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    // Draw Slices
    slices.forEach((slice, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = slice.color;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.stroke();

      // Draw Slice Text
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px "Cairo", sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 4;
      ctx.fillText(slice.label, radius - 24, 5);

      // Subtext
      ctx.font = '500 10px "Cairo", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(slice.subtext.substring(0, 16), radius - 24, 20);
      ctx.restore();
    });

    // Center Hub
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px "Cairo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RT LAB', 0, 0);

    ctx.restore();
  };

  useEffect(() => {
    drawWheel(currentAngle);
  }, [currentAngle, slices]);

  // Spin physics animation
  const handleSpin = () => {
    if (isSpinning) return;
    if (freeSpinsLeft <= 0 && player.points < 50) {
      alert('تحتاج إلى 50 نقطة للتدوير الإضافي، أجب على أسئلة المسابقة لجمع النقاط!');
      return;
    }

    // Deduct spin or points
    if (freeSpinsLeft > 0) {
      setFreeSpinsLeft((prev) => prev - 1);
    } else {
      onUpdatePlayer({ points: player.points - 50 });
    }

    setIsSpinning(true);
    setWonSlice(null);
    setCreatedCoupon(null);

    // Pick a winning slice (weighted or random)
    const randomIndex = Math.floor(Math.random() * slices.length);
    const targetSlice = slices[randomIndex];

    // Calculate rotation:
    // Pointer is at TOP (angle -PI/2)
    // Slices are drawn clockwise from 0 rad
    const extraRotations = (5 + Math.floor(Math.random() * 3)) * (2 * Math.PI);
    // Slice center should align with 3*PI/2 (top)
    const targetAngle =
      extraRotations + (3 * Math.PI) / 2 - (randomIndex * sliceAngle + sliceAngle / 2);

    const startRot = currentAngle % (2 * Math.PI);
    const finalRot = startRot + targetAngle;
    const duration = 4500; // 4.5 seconds
    const startTime = performance.now();

    let lastTickAngle = startRot;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Cubic ease out
      const ease = 1 - Math.pow(1 - progress, 3);
      const nowAngle = startRot + (finalRot - startRot) * ease;

      // Tick sound every slice threshold
      if (Math.abs(nowAngle - lastTickAngle) >= sliceAngle * 0.9) {
        soundManager.playTick();
        lastTickAngle = nowAngle;
      }

      setCurrentAngle(nowAngle);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setWonSlice(targetSlice);
        soundManager.playFanfare();
        triggerConfetti();

        // Handle slice reward
        handlePrizeAward(targetSlice);
      }
    };

    requestAnimationFrame(animate);
  };

  const handlePrizeAward = (slice: SpinSlice) => {
    onUpdatePlayer({
      wheelSpinsCount: player.wheelSpinsCount + 1,
    });

    if (slice.type === 'points') {
      const pts = slice.pointsAmount || 50;
      onUpdatePlayer({ points: player.points + pts });
    } else {
      // Issue coupon
      const coupon = onAwardCoupon(
        `جائزة عجلة الحظ: ${slice.label}`,
        slice.subtext,
        slice.value,
        'عجلة الحظ اليومية'
      );
      setCreatedCoupon(coupon);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title & Info Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-right">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">عجلة الحظ ومفاجآت معامل RT</h2>
            <p className="text-xs text-slate-400">
              دور العجلة واكسب خصومات حقيقية، تحاليل مجانية (CBC، سكر)، ونقاط مكافأة فورية!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-center px-4 py-2 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">المحاولات المتبقية</span>
            <span className="text-sm font-bold text-amber-400 tabular-nums">
              {freeSpinsLeft > 0 ? `${freeSpinsLeft} محاولات مجانية` : '50 نقطة / لفة'}
            </span>
          </div>
        </div>
      </div>

      {/* Canvas Spin Wheel Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center relative shadow-xl overflow-hidden">
        {/* Pointer Triangle at top */}
        <div className="relative z-20 -mb-5 flex flex-col items-center">
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-amber-400 drop-shadow-[0_4px_8px_rgba(245,158,11,0.6)]" />
          <div className="w-3 h-3 bg-amber-300 rounded-full -mt-7 ring-2 ring-slate-900" />
        </div>

        {/* Canvas */}
        <div className="relative p-2">
          <canvas
            ref={canvasRef}
            width={380}
            height={380}
            className="max-w-full aspect-square drop-shadow-2xl"
          />
        </div>

        {/* Action Button */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-black text-base shadow-xl transition-all ${
              isSpinning
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 active:scale-95'
            }`}
          >
            <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'جاري تدوير العجلة...' : 'دَوّر العجلة واكسب الآن!'}</span>
          </button>
          <span className="text-[11px] text-slate-400">
            {freeSpinsLeft > 0 ? '✨ تدوير مجاني متاح للمرضى' : '⚡ يمكنك استبدال 50 نقطة للف إضافي'}
          </span>
        </div>
      </div>

      {/* Won Prize Popup Modal / Banner */}
      {wonSlice && (
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950/50 to-slate-900 border border-emerald-500/40 rounded-2xl p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Gift className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-400">مبروك! فزت من معامل RT بـ:</span>
            <h3 className="text-2xl font-black text-white">{wonSlice.label}</h3>
            <p className="text-xs text-slate-300">{wonSlice.subtext}</p>
          </div>

          {createdCoupon && (
            <div className="max-w-md mx-auto p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-right">
              <div>
                <span className="text-[10px] text-slate-500 block">كود الكوبون المعتمد:</span>
                <span className="font-mono font-bold text-sm text-emerald-400">{createdCoupon.couponCode}</span>
              </div>
              <button
                onClick={() => onOpenSyncWithCoupon(createdCoupon)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>مطالبة عبر واتساب المعمل</span>
              </button>
            </div>
          )}

          {wonSlice.type === 'points' && (
            <div className="text-xs text-emerald-400 font-bold">
              ✅ تمت إضافة {wonSlice.pointsAmount} نقطة فوراً إلى محفظتك!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
