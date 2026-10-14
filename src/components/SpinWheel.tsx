import React, { useEffect, useRef, useState } from 'react';
import { RotateCw, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { Prize } from '../types';
import { sounds } from '../utils/audio';

interface SpinWheelProps {
  prizes: Prize[];
  onWin: (prize: Prize) => void;
  disabled?: boolean;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({ prizes, onWin, disabled = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Wheel animation states
  const currentAngleRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const lastTickSegmentRef = useRef<number>(-1);

  // Filter active prizes only
  const activePrizes = prizes.filter((p) => p.active);
  const count = activePrizes.length;
  const arc = (2 * Math.PI) / (count || 1);

  // Draw the luxury wheel
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 20;

    ctx.clearRect(0, 0, width, height);

    // Save and rotate context to current angle
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentAngleRef.current);
    ctx.translate(-centerX, -centerY);

    // Draw slices
    for (let i = 0; i < count; i++) {
      const prize = activePrizes[i];
      const startAngle = i * arc;
      const endAngle = (i + 1) * arc;

      // Slice background
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color || (i % 2 === 0 ? '#8B1E2D' : '#0F2B5C');
      ctx.fill();

      // Subtle slice separator stroke
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text inside slice
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = prize.textColor || '#FFFFFF';
      ctx.font = 'bold 12px Cairo, sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 4;
      // Draw short title
      ctx.fillText(prize.shortTitle, radius - 20, 4);
      ctx.restore();
    }

    ctx.restore(); // back to non-rotated frame

    // Outer golden/navy rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#0F2B5C';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 3, 0, 2 * Math.PI);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#D97706';
    ctx.stroke();

    // Decorative rim studs/dots
    const numStuds = count * 3;
    for (let s = 0; s < numStuds; s++) {
      const studAngle = (s * (2 * Math.PI)) / numStuds;
      const sx = centerX + (radius + 10) * Math.cos(studAngle);
      const sy = centerY + (radius + 10) * Math.sin(studAngle);
      ctx.beginPath();
      ctx.arc(sx, sy, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = s % 2 === 0 ? '#FDE047' : '#FFFFFF';
      ctx.fill();
    }

    // Center circular badge with RT Lab colors
    ctx.beginPath();
    ctx.arc(centerX, centerY, 38, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#8B1E2D';
    ctx.stroke();

    // Inner center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#0F2B5C';
    ctx.fill();

    // RT text in center
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RT LAB', centerX, centerY - 2);
    ctx.font = 'bold 8px Cairo, sans-serif';
    ctx.fillStyle = '#FDE047';
    ctx.fillText('رامي مختار', centerX, centerY + 10);
  };

  useEffect(() => {
    drawWheel();
  }, [prizes]);

  // Audio tick detection based on current angle
  const checkTick = (angle: number) => {
    const normalized = (2 * Math.PI - (angle % (2 * Math.PI))) % (2 * Math.PI);
    const segment = Math.floor(normalized / arc);
    if (segment !== lastTickSegmentRef.current) {
      lastTickSegmentRef.current = segment;
      if (soundEnabled) {
        sounds.playTick();
      }
    }
  };

  // Pick prize based on weights
  const pickWeightedPrize = (): { prize: Prize; index: number } => {
    const totalWeight = activePrizes.reduce((sum, p) => sum + (p.weight || 10), 0);
    let rand = Math.random() * totalWeight;
    for (let i = 0; i < activePrizes.length; i++) {
      const p = activePrizes[i];
      if (rand < (p.weight || 10)) {
        return { prize: p, index: i };
      }
      rand -= p.weight || 10;
    }
    return { prize: activePrizes[0], index: 0 };
  };

  const handleSpin = () => {
    if (isSpinning || disabled || activePrizes.length === 0) return;
    setIsSpinning(true);
    setSelectedPrize(null);

    const { prize: targetPrize, index: targetIndex } = pickWeightedPrize();

    const pointerAngle = (3 * Math.PI) / 2;
    const sliceCenterAngle = targetIndex * arc + arc / 2;

    const baseFinalAngle = pointerAngle - sliceCenterAngle;
    const normalizedBase = ((baseFinalAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    const extraRotations = 6 + Math.floor(Math.random() * 2);
    const targetTotalAngle =
      currentAngleRef.current +
      extraRotations * 2 * Math.PI +
      ((normalizedBase - (currentAngleRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI));

    const startAngle = currentAngleRef.current;
    const totalDelta = targetTotalAngle - startAngle;
    const duration = 4500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      currentAngleRef.current = startAngle + totalDelta * easeOut;
      checkTick(currentAngleRef.current);
      drawWheel();

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setSelectedPrize(targetPrize);
        if (soundEnabled) {
          sounds.playVictory();
        }
        setTimeout(() => {
          onWin(targetPrize);
        }, 800);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 w-full">
      {/* Top Controls / Sound Toggle */}
      <div className="w-full max-w-sm flex items-center justify-between mb-3 text-xs text-slate-500">
        <span className="font-semibold text-slate-700 text-[11px] sm:text-xs">
          عجلة الحظ التفاعلية · جرب حظك الآن
        </span>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-1 hover:text-slate-900 transition text-[11px] sm:text-xs"
          title="تشغيل/كتم الصوت"
        >
          {soundEnabled ? (
            <Volume2 className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <VolumeX className="h-3.5 w-3.5" />
          )}
          <span>{soundEnabled ? 'الصوت مفعّل' : 'صامت'}</span>
        </button>
      </div>

      {/* Wheel Container with Pointer */}
      <div className="relative flex items-center justify-center my-2 max-w-full">
        {/* Top Fixed Pointer Arrow pointing down */}
        <div className="absolute -top-3.5 z-20 flex flex-col items-center">
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-amber-400 drop-shadow-md" />
          <div className="h-2 w-2 rounded-full bg-slate-900 -mt-4.5" />
        </div>

        {/* Canvas element */}
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="w-[280px] sm:w-[360px] md:w-[400px] h-[280px] sm:h-[360px] md:h-[400px] drop-shadow-xl rounded-full touch-manipulation max-w-full"
        />
      </div>

      {/* Spin Button */}
      <div className="mt-5 flex flex-col items-center gap-2.5 w-full max-w-xs">
        <button
          onClick={handleSpin}
          disabled={isSpinning || disabled}
          className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2 ${
            isSpinning || disabled
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#8B1E2D] via-[#A82538] to-[#0F2B5C] text-white hover:shadow-rose-900/30 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          <RotateCw className={`h-4.5 w-4.5 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'جاري دوران العجلة...' : 'تدوير العجلة واكتشاف الجائزة'}</span>
        </button>
        <p className="text-center text-[11px] text-slate-500">
          فرصة يومية مجانية لمعامل رامي مختار · جوائز وخصومات مؤكدة
        </p>
      </div>

      {/* Selected Prize Banner Announcement */}
      {selectedPrize && (
        <div className="mt-3 w-full max-w-sm rounded-xl bg-rose-50 border border-rose-200 p-3 text-center animate-bounce">
          <div className="flex items-center justify-center gap-1 text-xs font-bold text-[#8B1E2D]">
            <Sparkles className="h-4 w-4" />
            <span>مبروك! لقد استقرت العجلة على:</span>
          </div>
          <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedPrize.title}</div>
        </div>
      )}
    </div>
  );
};
