import React, { useState } from 'react';
import { Download, Smartphone, X, Sparkles, Check, ChevronRight } from 'lucide-react';
import { IOSInstallModal } from './IOSInstallModal';

interface PWAInstallBannerProps {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  bannerDismissed: boolean;
  onPromptInstall: () => Promise<boolean>;
  onDismiss: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  isInstallable,
  isInstalled,
  isIOS,
  bannerDismissed,
  onPromptInstall,
  onDismiss,
}) => {
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already installed or dismissed, do not display the banner
  if (isInstalled || bannerDismissed) {
    return <IOSInstallModal isOpen={showIOSModal} onClose={() => setShowIOSModal(false)} />;
  }

  // If not installable and not iOS, skip
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else {
      setInstalling(true);
      try {
        await onPromptInstall();
      } finally {
        setInstalling(false);
      }
    }
  };

  return (
    <>
      <div
        id="pwa-install-banner"
        className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-3 border-b border-indigo-500/20 shadow-md"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Left info */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-500 p-0.5 shrink-0 shadow-sm">
              <img
                src="/icon-192.png"
                alt="App Icon"
                className="w-full h-full object-cover rounded-[10px]"
              />
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">
                  Installez l'application VendeusePro
                </span>
                <span className="bg-rose-500/20 text-rose-300 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-rose-500/30 uppercase">
                  PWA
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate">
                Accès direct 1-clic sur votre mobile, mode hors-ligne et rapidité maximale.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              id="btn-pwa-install-cta"
              onClick={handleInstallClick}
              disabled={installing}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              {isIOS ? (
                <>
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Installer sur iPhone</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{installing ? 'Installation...' : "Installer l'application"}</span>
                </>
              )}
            </button>

            <button
              id="btn-pwa-dismiss"
              onClick={onDismiss}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              title="Masquer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <IOSInstallModal isOpen={showIOSModal} onClose={() => setShowIOSModal(false)} />
    </>
  );
};
