import React, { useState, useEffect } from 'react';
import { X, User, Phone, Award, Sparkles, Check, Gift } from 'lucide-react';
import { PlayerProfile } from '../types';
import { soundManager } from '../utils/audio';

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerProfile;
  onSavePlayer: (updated: Partial<PlayerProfile>) => void;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  isOpen,
  onClose,
  player,
  onSavePlayer,
}) => {
  const [name, setName] = useState(player.name);
  const [phone, setPhone] = useState(player.phone);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(player.name);
      setPhone(player.phone);
    }
  }, [player, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePlayer({ name, phone });
    soundManager.playSuccess();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-right">
        {/* Header Ribbon */}
        <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">الملف الشخصي للمريض</h3>
              <p className="text-xs text-slate-400">بياناتك المسجلة لمزامنة الجوائز والتحاليل</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
            <div>
              <span className="text-[10px] text-slate-500 block">رصيد النقاط الحالية</span>
              <span className="text-xl font-black text-amber-400 tabular-nums">{player.points}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">اللقب والرتبة</span>
              <span className="text-xs font-bold text-emerald-400 truncate block mt-1">
                {player.levelTitle}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-semibold">اسم المريض / المتسابق:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اكتب اسمك الثلاثي..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-semibold">رقم الهاتف المحمول (للتواصل):</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010XXXXXXXX"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono text-left"
            />
            <span className="text-[10px] text-slate-500 block">
              يستخدم هذا الرقم في تنسيق رسالة الواتساب المباشرة للمعمل لتأكيد الحجز.
            </span>
          </div>

          {savedSuccess && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>تم حفظ بيانات المريض بنجاح!</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              حفظ البيانات
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
