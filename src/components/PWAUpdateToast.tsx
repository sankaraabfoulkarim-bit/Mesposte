import React from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';

interface PWAUpdateToastProps {
  isUpdateAvailable: boolean;
  onUpdate: () => void;
}

export const PWAUpdateToast: React.FC<PWAUpdateToastProps> = ({
  isUpdateAvailable,
  onUpdate,
}) => {
  if (!isUpdateAvailable) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-indigo-500/30 flex items-center justify-between gap-3 animate-slideDown">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold">Mise à jour disponible</p>
          <p className="text-[11px] text-slate-300">
            Une nouvelle version de VendeusePro est prête.
          </p>
        </div>
      </div>
      <button
        id="btn-pwa-apply-update"
        onClick={onUpdate}
        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Actualiser</span>
      </button>
    </div>
  );
};
