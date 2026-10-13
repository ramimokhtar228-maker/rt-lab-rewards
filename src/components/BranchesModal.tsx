import React from 'react';
import { Calendar, Clock, Home, MapPin, MessageCircle, Phone, X } from 'lucide-react';
import { LabSettings } from '../types';

interface BranchesModalProps {
  settings: LabSettings;
  onClose: () => void;
}

export const BranchesModal: React.FC<BranchesModalProps> = ({ settings, onClose }) => {
  const branchDetails = [
    {
      name: 'فرع المهندسين (المقر الرئيسي)',
      address: 'شارع جامعة الدول العربية، أمام نادي الصيد، الجيزة',
      hours: 'يومياً من 8:00 صباحاً حتى 11:00 مساءً',
      phone: '01011223344',
    },
    {
      name: 'فرع مصر الجديدة',
      address: 'ميدان الكوربة، بجوار البنك الأهلي، القاهرة',
      hours: 'يومياً من 8:30 صباحاً حتى 10:30 مساءً',
      phone: '01022334455',
    },
    {
      name: 'فرع مدينة نصر',
      address: 'شارع عباس العقاد، تقاطع مكرم عبيد، القاهرة',
      hours: 'يومياً من 8:00 صباحاً حتى 11:00 مساءً',
      phone: '01033445566',
    },
    {
      name: 'فرع الدقي',
      address: 'شارع التحرير، بالقرب من محطة مترو الدقي',
      hours: 'يومياً من 9:00 صباحاً حتى 10:00 مساءً',
      phone: '01044556677',
    },
    {
      name: 'خدمة السحب المنزلي المريح',
      address: 'تغطية شاملة لجميع مناطق القاهرة الكبرى والجيزة',
      hours: 'حجز مسبق من 7:00 صباحاً عبر الواتساب أو الخط الساخن',
      phone: settings.whatsappNumber,
      isHome: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden my-6 border border-slate-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#8B1E2D] flex items-center justify-center font-bold">
              RT
            </div>
            <div>
              <h3 className="font-bold text-base">فروع معامل رامي مختار وخدمة السحب المنزلي</h3>
              <p className="text-xs text-slate-300">أقرب فرع إليك ومواعيد العمل الرسمية</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-300 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {branchDetails.map((b, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border transition ${
                b.isHome
                  ? 'border-emerald-300 bg-emerald-50/70'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      b.isHome ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-[#8B1E2D]'
                    }`}
                  >
                    {b.isHome ? <Home className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{b.name}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{b.address}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {b.hours}
                      </span>
                    </div>
                  </div>
                </div>

                <a
                  href={
                    b.isHome
                      ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                          'مرحباً معامل رامي مختار، أود حجز موعد لسحب عينات منزلي والاستفسار عن باقات التحاليل.'
                        )}`
                      : `tel:${b.phone}`
                  }
                  target={b.isHome ? '_blank' : undefined}
                  rel={b.isHome ? 'noopener noreferrer' : undefined}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1 ${
                    b.isHome
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {b.isHome ? <MessageCircle className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
                  <span>{b.isHome ? 'طلب سحب منزلي' : 'اتصال'}</span>
                </a>
              </div>
            </div>
          ))}

          {/* Hotline notice */}
          <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 text-center text-xs text-slate-700">
            للحجز والاستفسار عبر الخط الساخن الموحد: <strong className="text-[#0F2B5C] font-mono text-sm">{settings.hotline}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
