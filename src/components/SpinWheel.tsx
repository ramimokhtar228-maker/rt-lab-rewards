import React, { useRef, useState } from 'react';
import { Gift, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { Prize } from '../types';
import { playTickSound, playWinFanfare } from '../utils/audio';

interface SpinWheelProps {
  prizes: Prize[];
  onWin: (prize: Prize) => void;
  disabled?: boolean;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({ prizes, onWin, disabled }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const currentRotationRef = useRef(0);

  const activePrizes = prizes.filter((p) => p.active);
  const totalSlices = activePrizes.length || 6;
  const sliceAngle = 360 / totalSlices;

  const handleSpin = () => {
    if (isSpinning || disabled || activePrizes.length === 0) return;

    setIsSpinning(true);

    // Weighted selection
    const totalWeight = activePrizes.reduce((sum, p) => sum + (p.weight || 10), 0);
    let randomNum = Math.random() * totalWeight;
    let selectedIndex = 0;

    for (let i = 0; i < activePrizes.length; i++) {
      if (randomNum < (activePrizes[i].weight || 10)) {
        selectedIndex = i;
        break;
      }
      randomNum -= activePrizes[i].weight || 10;
    }

    const wonPrize = activePrizes[selectedIndex];

    // Compute rotation: spin 5 to 7 full circles + slice offset
    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const targetSliceCenter = selectedIndex * sliceAngle + sliceAngle / 2;
    // Top pointer is at 270 deg (top)
    const targetAngle = 360 * fullSpins + (360 - targetSliceCenter + 270) % 360;

    const newRotation = currentRotationRef.current + targetAngle + (Math.random() * 10 - 5);
    currentRotationRef.current = newRotation;
    setRotation(newRotation);

    // Play tick sounds during spin
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      tickCount++;
      playTickSound();
      if (tickCount > 24) clearInterval(tickInterval);
    }, 160);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      playWinFanfare();
      onWin(wonPrize);
    }, 4500);
  };

  return (
    <div className="flex flex-col items-center justify-center py-4">
      {/* Outer Wheel Container */}
      <div className="relative w-72 h-72 sm:w-88 sm:h-88 flex items-center justify-center">
        {/* Top Pointer */}
        <div className="absolute -top-3 z-20 flex flex-col items-center drop-shadow-md">
          <div className="w-5 h-8 bg-amber-400 border-2 border-white rounded-b-full shadow-lg transform -translate-y-1" />
          <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[14px] border-t-amber-400" />
        </div>

        {/* Outer Glow Ring */}
        <div className="absolute inset-0 rounded-full border-8 border-amber-300 shadow-2xl bg-slate-900 overflow-hidden" />

        {/* Canvas / SVG Rotating Wheel */}
        <div
          className="relative w-full h-full rounded-full overflow-hidden transition-transform ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: isSpinning ? '4500ms' : '0ms',
            transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)',
          }}
        >
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {activePrizes.map((prize, idx) => {
              const startAngle = (idx * sliceAngle * Math.PI) / 180;
              const endAngle = (((idx + 1) * sliceAngle) * Math.PI) / 180;

              const x1 = 50 + 50 * Math.cos(startAngle);
              const y1 = 50 + 50 * Math.sin(startAngle);
              const x2 = 50 + 50 * Math.cos(endAngle);
              const y2 = 50 + 50 * Math.sin(endAngle);

              const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

              // Text position
              const textAngle = idx * sliceAngle + sliceAngle / 2;
              const textRad = (textAngle * Math.PI) / 180;
              const tx = 50 + 32 * Math.cos(textRad);
              const ty = 50 + 32 * Math.sin(textRad);

              return (
                <g key={prize.id}>
                  <path
                    d={pathData}
                    fill={prize.color || (idx % 2 === 0 ? '#8B1E2D' : '#0F2B5C')}
                    stroke="#ffffff"
                    strokeWidth="0.8"
                  />
                  <text
                    x={tx}
                    y={ty}
                    fill="#ffffff"
                    fontSize="3.8"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textAngle + 90}, ${tx}, ${ty})`}
                  >
                    {prize.shortTitle || prize.discountValue}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Center Spin Button / Hub */}
        <button
          onClick={handleSpin}
          disabled={isSpinning || disabled}
          className={`absolute z-20 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-amber-300 shadow-2xl flex flex-col items-center justify-center text-center transition transform active:scale-95 ${
            isSpinning || disabled
              ? 'bg-slate-400 text-white cursor-not-allowed opacity-80'
              : 'bg-gradient-to-br from-[#8B1E2D] to-rose-700 text-white hover:scale-105 shadow-rose-900/50 cursor-pointer'
          }`}
          aria-label="ابدأ تدوير عجلة الحظ"
        >
          <Sparkles className="h-5 w-5 text-amber-300 mb-0.5 animate-pulse" />
          <span className="text-xs sm:text-sm font-black tracking-wide leading-tight">
            {isSpinning ? 'جارٍ السحب...' : 'لف واكسب!'}
          </span>
        </button>
      </div>

      {/* Guide text */}
      <p className="mt-5 text-xs text-slate-500 font-semibold text-center">
        اضغط على الزر الذهبي في المنتصف لتدوير العجلة وربح مكافأة طبية فورية!
      </p>
    </div>
  );
};
