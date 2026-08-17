import React, { useState, useEffect } from 'react';
import { Lightbulb, ChevronRight, Sparkles } from 'lucide-react';
import { SALES_TIPS } from '../data/presets';

export const SalesTipsBanner: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % SALES_TIPS.length);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  const tip = SALES_TIPS[currentIdx];

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-pink-500/10 border border-rose-200/80 rounded-2xl p-3.5 sm:p-4 text-slate-800 flex items-start sm:items-center justify-between gap-3 shadow-xs">
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-white px-2 py-0.5 rounded-full border border-rose-100">
              {tip.badge}
            </span>
            <span className="text-xs font-bold text-slate-900">{tip.title}</span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-medium">
            {tip.tip}
          </p>
        </div>
      </div>

      <button
        onClick={() => setCurrentIdx((prev) => (prev + 1) % SALES_TIPS.length)}
        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-all shrink-0"
        title="Astuce suivante"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
