import React from 'react';
import { X, Share, PlusSquare, Smartphone, CheckCircle2 } from 'lucide-react';

interface IOSInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSInstallModal: React.FC<IOSInstallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-ios-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with App Icon */}
        <div className="flex items-center gap-3.5 mb-5">
          <img
            src="/icon-192.png"
            alt="VendeusePro"
            className="w-14 h-14 rounded-2xl shadow-md border border-slate-100"
          />
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
              Installer VendeusePro
            </h3>
            <p className="text-xs text-rose-600 font-semibold">
              Sur votre iPhone ou iPad
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-5 leading-relaxed">
          Installez l'application directement sur votre écran d'accueil sans passer par l'App Store pour y accéder en 1 seconde :
        </p>

        {/* 3 Simple Steps */}
        <div className="space-y-3.5 mb-6">
          <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Share className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Étape 1</p>
              <p className="text-xs text-slate-600">
                Appuyez sur le bouton <strong>Partager</strong> <Share className="w-3.5 h-3.5 inline mx-0.5 text-blue-600" /> dans la barre Safari au bas de votre écran.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
              <PlusSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Étape 2</p>
              <p className="text-xs text-slate-600">
                Faites défiler vers le bas et appuyez sur <strong>« Sur l'écran d'accueil »</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Étape 3</p>
              <p className="text-xs text-slate-600">
                Appuyez sur <strong>« Ajouter »</strong> en haut à droite. L'icône VendeusePro est prête !
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          id="btn-understand-ios-install"
          onClick={onClose}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-98"
        >
          J'ai compris
        </button>
      </div>
    </div>
  );
};
