import React, { useState } from 'react';
import { X, Store, MessageCircle, DollarSign, MapPin, Sparkles, Check, Smartphone, Download, CheckCircle2 } from 'lucide-react';
import { BoutiqueProfile, CurrencyType } from '../types';

interface BoutiqueProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BoutiqueProfile;
  onSave: (updated: BoutiqueProfile) => void;
  onPromptInstall?: () => void;
  isInstallable?: boolean;
  isInstalled?: boolean;
  isIOS?: boolean;
}

export const BoutiqueProfileModal: React.FC<BoutiqueProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  onPromptInstall,
  isInstallable = false,
  isInstalled = false,
  isIOS = false,
}) => {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [slogan, setSlogan] = useState(profile.slogan);
  const [currency, setCurrency] = useState<CurrencyType>(profile.currency);
  const [city, setCity] = useState(profile.city || 'Dakar');
  const [country, setCountry] = useState(profile.country || 'Sénégal');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...profile,
      name,
      phone,
      slogan,
      currency,
      city,
      country,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          id="btn-close-profile-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Profil de votre Boutique
            </h3>
            <p className="text-xs text-slate-500">
              Ces informations seront automatiquement ajoutées à vos visuels et textes IA
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nom commercial de la boutique
            </label>
            <input
              id="input-boutique-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Bella Chic Mode"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 font-semibold text-slate-900 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Numéro WhatsApp Commandes
              </label>
              <div className="relative">
                <input
                  id="input-boutique-phone"
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+221 77 123 45 67"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 font-semibold text-slate-900 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Devise par défaut
              </label>
              <select
                id="select-boutique-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 font-semibold text-slate-900 text-sm bg-white"
              >
                <option value="FCFA">FCFA (XOF / XAF)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GNF">GNF (Franc Guinéen)</option>
                <option value="CDF">CDF (Franc Congolais)</option>
                <option value="MAD">MAD (Dirham)</option>
                <option value="NGN">NGN (Naira)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Slogan / Phrase signature
            </label>
            <input
              id="input-boutique-slogan"
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="Ex: Le Chic & La Tendance au Meilleur Prix ✨"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-slate-900 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ville
              </label>
              <input
                id="input-boutique-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Dakar, Abidjan, Douala..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-slate-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pays
              </label>
              <input
                id="input-boutique-country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Sénégal, Côte d'Ivoire..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-slate-900 text-sm"
              />
            </div>
          </div>

          {/* PWA Mobile App Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between gap-3 border border-indigo-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shrink-0">
                <img
                  src="/icon-192.png"
                  alt="App Icon"
                  className="w-full h-full object-cover rounded-[10px]"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  Application Mobile PWA
                  {isInstalled && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      Installée
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-slate-300">
                  {isInstalled
                    ? 'Application active sur votre écran d’accueil'
                    : 'Installez sur votre téléphone pour un accès 1-clic'}
                </p>
              </div>
            </div>

            {!isInstalled && (isInstallable || isIOS) && onPromptInstall && (
              <button
                type="button"
                id="btn-profile-install-pwa"
                onClick={() => {
                  onClose();
                  onPromptInstall();
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Installer</span>
              </button>
            )}
            {isInstalled && (
              <div className="text-emerald-400 flex items-center gap-1 text-xs font-bold pr-2">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-all text-sm"
            >
              Annuler
            </button>
            <button
              id="btn-save-boutique-profile"
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-md shadow-rose-200 flex items-center justify-center gap-1.5 text-sm cursor-pointer"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Enregistré !</span>
                </>
              ) : (
                <span>Sauvegarder</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
