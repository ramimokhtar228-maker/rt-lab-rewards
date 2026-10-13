import React, { useEffect, useRef, useState } from 'react';
import { Gift, RefreshCw, Sparkles, Wand2 } from 'lucide-react';
import { Prize } from '../types';
import { sounds } from '../utils/audio';

interface ScratchCardProps {
  prizes: Prize[];
  onWin: (prize: Prize) => void;
  disabled?: boolean;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({ prizes, onWin, disabled = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [currentPrize, setCurrentPrize] = useState<Prize | null>(null);
  const isDrawingRef = useRef(false);
  const hasWonRef = useRef(false);

  // Pick random prize from active ones
  const initCard = () => {
    const active = prizes.filter((p) => p.active);
    if (active.length === 0) return;
    const randomPrize = active[Math.floor(Math.random() * active.length)];
    setCurrentPrize(randomPrize);
    setIsRevealed(false);
    setScratchPercent(0);
    hasWonRef.current = false;

    // Reset canvas cover
    setTimeout(() => {
      drawCover();
    }, 50);
  };

  useEffect(() => {
    initCard();
  }, [prizes]);

  // Draw the silver/crimson metallic scratch cover
  const drawCover = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);

    // Luxury metallic silver & subtle crimson gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#94A3B8');
    grad.addColorStop(0.3, '#CBD5E1');
    grad.addColorStop(0.5, '#E2E8F0');
    grad.addColorStop(0.7, '#CBD5E1');
    grad.addColorStop(1, '#64748B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle pattern overlay
    ctx.fillStyle = 'rgba(139, 30, 45, 0.08)';
    for (let x = 0; x < width; x += 24) {
      for (let y = 0; y < height; y += 24) {
        ctx.fillRect(x, y, 12, 12);
      }
    }

    // Border
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#8B1E2D';
    ctx.strokeRect(3, 3, width - 6, height - 6);

    // Inner dashed gold border
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#D97706';
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(10, 10, width - 20, height - 20);
    ctx.setLineDash([]);

    // Text on scratch foil
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Badge icon text
    ctx.fillStyle = '#8B1E2D';
    ctx.font = 'bold 16px Cairo, sans-serif';
    ctx.fillText('معامل د. رامي مختار · RT Labs', width / 2, height / 2 - 32);

    ctx.fillStyle = '#0F2B5C';
    ctx.font = '900 22px Cairo, sans-serif';
    ctx.fillText('اكشط هنا لاكتشاف هديتك 🎁', width / 2, height / 2 + 2);

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 12px Cairo, sans-serif';
    ctx.fillText('حرّك إصبعك أو مؤشر الماوس للمسح', width / 2, height / 2 + 34);
  };

  // Scratch action at coordinate
  const scratch = (clientX: number, clientY: number) => {
    if (isRevealed || hasWonRef.current || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Occasional audio scratch sound
    if (Math.random() < 0.25) {
      sounds.playScratch();
    }

    checkProgress();
  };

  // Calculate percentage scratched
  const checkProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      // Sample pixels
      const width = canvas.width;
      const height = canvas.height;
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      let transparentCount = 0;
      const step = 32; // Sample every 32 bytes (8 pixels) for speed

      for (let i = 3; i < data.length; i += step) {
        if (data[i] === 0) {
          transparentCount++;
        }
      }

      const totalSampled = data.length / step;
      const percent = Math.round((transparentCount / totalSampled) * 100);
      setScratchPercent(percent);

      // Reveal completely when scratched >= 35%
      if (percent >= 35 && !hasWonRef.current && currentPrize) {
        hasWonRef.current = true;
        setIsRevealed(true);
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        sounds.playVictory();
        setTimeout(() => {
          onWin(currentPrize);
        }, 900);
      }
    } catch {
      // ignore
    }
  };

  // Auto-reveal for accessibility or quick tap
  const handleAutoReveal = () => {
    if (isRevealed || hasWonRef.current || !currentPrize || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    hasWonRef.current = true;
    setIsRevealed(true);
    setScratchPercent(100);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sounds.playVictory();
    setTimeout(() => {
      onWin(currentPrize);
    }, 700);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm flex items-center justify-between mb-4 text-xs text-slate-500">
        <span className="font-semibold text-slate-700">كارت الخدش الفوري الممغنط</span>
        <span className="text-rose-800 font-bold">تم المسح: {scratchPercent}%</span>
      </div>

      {/* Interactive Card Frame */}
      <div
        ref={containerRef}
        className="relative w-full max-w-sm h-56 rounded-2xl overflow-hidden shadow-2xl border-4 border-[#0F2B5C] bg-white select-none touch-none"
      >
        {/* Underlying Prize Card (Revealed upon scratching) */}
        {currentPrize && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-rose-50 via-white to-blue-50">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#8B1E2D] mb-1">
              <Sparkles className="h-4 w-4" />
              <span>مبروك! كارت الهدية الرابح</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 leading-tight">
              {currentPrize.title}
            </h3>
            <div className="mt-2 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#0F2B5C] px-4 py-1.5 text-white font-extrabold text-lg shadow">
              {currentPrize.discountValue}
            </div>
            <p className="text-xs text-slate-600 mt-2 max-w-xs">{currentPrize.description}</p>
            <div className="mt-2 text-[11px] font-semibold text-emerald-700">
              ✓ جاهز للتسجيل والإرسال إلى رقم المعمل
            </div>
          </div>
        )}

        {/* HTML5 Canvas Foil Cover */}
        <canvas
          ref={canvasRef}
          width={380}
          height={220}
          className={`absolute inset-0 w-full h-full cursor-pointer transition-opacity duration-500 ${
            isRevealed ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
          onMouseDown={(e) => {
            isDrawingRef.current = true;
            scratch(e.clientX, e.clientY);
          }}
          onMouseMove={(e) => {
            if (isDrawingRef.current) {
              scratch(e.clientX, e.clientY);
            }
          }}
          onMouseUp={() => {
            isDrawingRef.current = false;
          }}
          onMouseLeave={() => {
            isDrawingRef.current = false;
          }}
          onTouchStart={(e) => {
            isDrawingRef.current = true;
            if (e.touches[0]) {
              scratch(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onTouchMove={(e) => {
            if (isDrawingRef.current && e.touches[0]) {
              scratch(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onTouchEnd={() => {
            isDrawingRef.current = false;
          }}
        />
      </div>

      {/* Control Buttons below card */}
      <div className="mt-6 flex flex-col items-center gap-3 w-full max-w-xs">
        <button
          onClick={handleAutoReveal}
          disabled={isRevealed || disabled}
          className="w-full py-3 px-5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 shadow-sm transition flex items-center justify-center gap-2 active:scale-95"
        >
          <Wand2 className="h-4 w-4 text-amber-600" />
          <span>كشف البطاقة فوراً بنقرة واحدة</span>
        </button>

        <p className="text-center text-xs text-slate-500">
          امسح بإصبعك على البطاقة الفضية أعلاه حتى تتجاوز 35% ليتم كشف هديتك واعتمادها فوراً.
        </p>
      </div>
    </div>
  );
};
