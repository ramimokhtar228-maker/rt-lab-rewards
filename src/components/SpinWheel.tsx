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
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);

  // Active prizes only
  const activePrizes = prizes.filter((p) => p.active);
  const count = activePrizes.length || 1;
  const arc = (2 * Math.PI) / count;

  // Track rotation angle in radians
  const currentAngleRef = useRef(0);
  const spinSpeedRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const lastTickSegmentRef = useRef(-1);

  // Draw the wheel onto canvas
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 24;

    ctx.clearRect(0, 0, width, height);

    if (activePrizes.length === 0) {
      return;
    }

    // Save context for rotation
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentAngleRef.current);

    // Draw slices
    for (let i = 0; i < count; i++) {
      const prize = activePrizes[i];
      if (!prize) continue;
      const startAngle = i * arc;
      const endAngle = startAngle + arc;

      // Slice fill
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      // Alternating luxury gradient
      const isCrimson = i % 2 === 0;
      const baseColor = prize.color || (isCrimson ? '#8B1E2D' : '#0F2B5C');
      ctx.fillStyle = baseColor;
      ctx.fill();

      // Slice border
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.stroke();

      // Text inside slice
      ctx.save();
      ctx.rotate(startAngle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = prize.textColor || '#FFFFFF';
      ctx.font = 'bold 13px Cairo, sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 4;
      // Draw short title
      ctx.fillText(prize.shortTitle, radius - 24, 4);
      ctx.restore();
    }

    // Outer luxury decorative rim
    ctx.restore(); // back to non-rotated frame

    // Outer golden/navy rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 12, 0, 2 * Math.PI);
    ctx.lineWidth = 16;
    ctx.strokeStyle = '#0F2B5C';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 4, 0, 2 * Math.PI);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#D97706';
    ctx.stroke();

    // Decorative rim studs/dots
    const numStuds = count * 3;
    for (let s = 0; s < numStuds; s++) {
      const studAngle = (s * (2 * Math.PI)) / numStuds;
      const sx = centerX + (radius + 12) * Math.cos(studAngle);
      const sy = centerY + (radius + 12) * Math.sin(studAngle);
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, 2 * Math.PI);
      ctx.fillStyle = s % 2 === 0 ? '#FDE047' : '#FFFFFF';
      ctx.fill();
    }

    // Center circular badge with RT Lab colors
    ctx.beginPath();
    ctx.arc(centerX, centerY, 42, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#8B1E2D';
    ctx.stroke();

    // Inner center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 34, 0, 2 * Math.PI);
    ctx.fillStyle = '#0F2B5C';
    ctx.fill();

    // RT text in center
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RT LAB', centerX, centerY - 2);
    ctx.font = 'bold 9px Cairo, sans-serif';
    ctx.fillStyle = '#FDE047';
    ctx.fillText('رامي مختار', centerX, centerY + 12);
  };

  useEffect(() => {
    drawWheel();
  }, [prizes]);

  // Audio tick detection based on current angle
  const checkTick = (angle: number) => {
    // Normalizing angle to [0, 2*PI]
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

    // Pick target prize
    const { prize: targetPrize, index: targetIndex } = pickWeightedPrize();

    // Calculate target angle:
    // The top pointer is at angle -PI/2 (or 3*PI/2)
    // Slice `targetIndex` starts at targetIndex * arc and ends at (targetIndex + 1) * arc
    // Middle of slice is targetIndex * arc + arc / 2
    // We want that angle + currentAngleRef to point to top (3*PI/2)
    const pointerAngle = (3 * Math.PI) / 2;
    const sliceCenterAngle = targetIndex * arc + arc / 2;
    
    // We want (sliceCenterAngle + finalAngle) % (2*PI) === pointerAngle
    const baseFinalAngle = pointerAngle - sliceCenterAngle;
    const normalizedBase = ((baseFinalAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    // Spin 5 to 7 full rotations plus offset
    const extraRotations = 6 + Math.floor(Math.random() * 2);
    const targetTotalAngle =
      currentAngleRef.current +
      extraRotations * 2 * Math.PI +
      ((normalizedBase - (currentAngleRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI));

    const startAngle = currentAngleRef.current;
    const totalDelta = targetTotalAngle - startAngle;
    const duration = 4500; // 4.5 seconds
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
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
    <div className="flex flex-col items-center justify-center p-4">
      {/* Top Controls / Sound Toggle */}
      <div className="w-full max-w-sm flex items-center justify-between mb-4 text-xs text-slate-500">
        <span className="font-semibold text-slate-700">عجلة الحظ التفاعلية · جرب حظك الآن</span>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-1 hover:text-slate-900 transition"
          title="تشغيل/كتم الصوت"
        >
          {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-600" /> : <VolumeX className="h-4 w-4" />}
          <span>{soundEnabled ? 'الصوت مفعّل' : 'صامت'}</span>
        </button>
      </div>

      {/* Wheel Container with Pointer */}
      <div className="relative flex items-center justify-center">
        {/* Top Fixed Pointer Arrow pointing down */}
        <div className="absolute -top-3 z-20 flex flex-col items-center">
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[26px] border-t-amber-400 drop-shadow-md" />
          <div className="h-2 w-2 rounded-full bg-slate-900 -mt-5" />
        </div>

        {/* Canvas element */}
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="max-w-[320px] sm:max-w-[380px] h-auto drop-shadow-2xl rounded-full"
        />
      </div>

      {/* Spin Button */}
      <div className="mt-6 flex flex-col items-center gap-3 w-full max-w-xs">
        <button
          onClick={handleSpin}
          disabled={isSpinning || disabled}
          className={`w-full py-3.5 px-6 rounded-2xl font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 ${
            isSpinning || disabled
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#8B1E2D] via-[#A82538] to-[#0F2B5C] text-white hover:shadow-rose-900/30 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          <RotateCw className={`h-5 w-5 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'جاري دوران العجلة...' : 'تدوير العجلة واكتشاف الجائزة'}</span>
        </button>

        <p className="text-center text-xs text-slate-500">
          فرصة يومية مجانية لجميع رواد معامل رامي مختار · جوائز وخصومات مؤكدة 100%
        </p>
      </div>

      {/* Selected Prize Banner Announcement */}
      {selectedPrize && (
        <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-center animate-bounce">
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
