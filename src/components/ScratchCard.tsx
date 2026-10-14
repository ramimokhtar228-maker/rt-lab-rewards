import React, { useEffect, useRef, useState } from 'react';
import { Gift, RotateCcw, Sparkles } from 'lucide-react';
import { Prize } from '../types';
import { playScratchSound, playWinFanfare } from '../utils/audio';

interface ScratchCardProps {
  prizes: Prize[];
  onWin: (prize: Prize) => void;
  disabled?: boolean;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({ prizes, onWin, disabled }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchedPercent, setScratchedPercent] = useState(0);
  const isDrawingRef = useRef(false);

  // Pick random prize once on mount
  useEffect(() => {
    const active = prizes.filter((p) => p.active);
    if (active.length > 0) {
      const totalWeight = active.reduce((sum, p) => sum + (p.weight || 10), 0);
      let rand = Math.random() * totalWeight;
      let chosen = active[0];
      for (const p of active) {
        if (rand < (p.weight || 10)) {
          chosen = p;
          break;
        }
        rand -= p.weight || 10;
      }
      setSelectedPrize(chosen);
    }
  }, [prizes]);

  // Setup Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Draw metallic scratch surface
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#B45309');
    grad.addColorStop(0.5, '#F59E0B');
    grad.addColorStop(1, '#92400E');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative pattern
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎁 امسح هنا لاكتشاف هديتك الطبية 🎁', width / 2, height / 2 - 10);
    ctx.font = '12px Cairo, sans-serif';
    ctx.fillText('معامل د. رامي مختار للتحاليل', width / 2, height / 2 + 15);
  }, []);

  const scratch = (clientX: number, clientY: number) => {
    if (disabled || isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    playScratchSound();
    checkScratchProgress();
  };

  const checkScratchProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Sample pixels
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    let transparent = 0;
    const sampleStep = 32;

    for (let i = 3; i < pixels.length; i += 4 * sampleStep) {
      if (pixels[i] === 0) transparent++;
    }

    const totalSampled = pixels.length / (4 * sampleStep);
    const percent = Math.round((transparent / totalSampled) * 100);
    setScratchedPercent(percent);

    if (percent > 45 && !isRevealed && selectedPrize) {
      setIsRevealed(true);
      playWinFanfare();
      setTimeout(() => {
        onWin(selectedPrize);
      }, 700);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative w-80 sm:w-96 h-52 sm:h-56 rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-300 bg-gradient-to-br from-rose-900 via-[#8B1E2D] to-slate-900 flex items-center justify-center p-4">
        {/* Underneath Revealed Prize */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-white">
          <div className="h-12 w-12 rounded-full bg-rose-100 text-[#8B1E2D] flex items-center justify-center mb-1">
            <Gift className="h-6 w-6 text-[#8B1E2D]" />
          </div>
          <span className="text-[11px] font-bold text-slate-500">مبارك! ربحت معنا:</span>
          <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
            {selectedPrize?.title || 'خصم مميز'}
          </h3>
          <div className="mt-1 bg-[#8B1E2D] text-white px-3 py-1 rounded-full text-xs font-black shadow-sm">
            {selectedPrize?.discountValue || 'خصم 25%'}
          </div>
        </div>

        {/* Scratchable Canvas Overlay */}
        <canvas
          ref={canvasRef}
          width={380}
          height={220}
          onMouseDown={() => {
            isDrawingRef.current = true;
          }}
          onMouseUp={() => {
            isDrawingRef.current = false;
          }}
          onMouseMove={(e) => {
            if (isDrawingRef.current) scratch(e.clientX, e.clientY);
          }}
          onTouchStart={() => {
            isDrawingRef.current = true;
          }}
          onTouchEnd={() => {
            isDrawingRef.current = false;
          }}
          onTouchMove={(e) => {
            if (isDrawingRef.current && e.touches[0]) {
              scratch(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          className={`absolute inset-0 w-full h-full cursor-pointer touch-none transition-opacity duration-500 ${
            isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        />
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-600">
        <Sparkles className="h-4 w-4 text-amber-500" />
        <span>امسح بإصبعك أو الماوس لكشط الطبقة الذهبية وإظهار الهدية! ({scratchedPercent}%)</span>
      </div>
    </div>
  );
};
