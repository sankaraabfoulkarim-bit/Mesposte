import React, { useState } from 'react';
import {
  X,
  Crown,
  Check,
  Zap,
  Coins,
  ShieldCheck,
  Sparkles,
  Smartphone,
  CreditCard,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CREDIT_PACKAGES } from '../data/presets';
import { BoutiqueProfile, CreditPackage, PaymentMethod, UserPlan } from '../types';
import { redeemAccessCode } from '../services/subscriptionService';
import { audioSynth } from '../utils/audioSynth';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BoutiqueProfile;
  onAddCredits: (credits: number) => void;
  onUpgradePlan: (plan: UserPlan) => void;
  onProfileUpdate?: (updated: BoutiqueProfile) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  profile,
  onAddCredits,
  onUpgradePlan,
  onProfileUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'packs' | 'plans'>('packs');
  const [selectedPack, setSelectedPack] = useState<CreditPackage>(CREDIT_PACKAGES[1]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('orange_money');
  const [momoPhone, setMomoPhone] = useState(profile.phone || '+221 77 000 00 00');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Access code input
  const [accessCode, setAccessCode] = useState('');
  const [codeMessage, setCodeMessage] = useState<{ success: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const handleRedeemCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;

    const res = redeemAccessCode(accessCode, profile);
    if (res.success && res.updatedProfile) {
      if (onProfileUpdate) {
        onProfileUpdate(res.updatedProfile);
      }
      audioSynth.playSuccessChime();
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
      setCodeMessage({ success: true, text: res.message });
      setTimeout(() => {
        onClose();
      }, 1800);
    } else {
      audioSynth.playNoticeSound();
      setCodeMessage({ success: false, text: res.message });
    }
  };

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      onAddCredits(selectedPack.credits);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    }, 1200);
  };

  const handleSelectPlan = (plan: UserPlan) => {
    onUpgradePlan(plan);
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 relative my-auto max-h-[92vh] overflow-y-auto">
        <button
          id="btn-close-pricing-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold mb-2 border border-amber-200">
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            Solde actuel : {profile.credits} Crédits
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Boutique & Recharges VendeusePro
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
            Paiement mobile instantané adapté à vos ventes sans abonnement forcé.
          </p>

          {/* Toggle Switch */}
          <div className="flex justify-center mt-4">
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
              <button
                onClick={() => setActiveTab('packs')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'packs'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⚡ Packs de Crédits (Recharge Mobile)
              </button>
              <button
                onClick={() => setActiveTab('plans')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'plans'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                💎 Abonnements Mensuels
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Credit Packs */}
        {activeTab === 'packs' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CREDIT_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPack(pkg)}
                  className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer select-none text-left ${
                    selectedPack.id === pkg.id
                      ? 'border-rose-600 bg-rose-50/50 shadow-md ring-2 ring-rose-200'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow">
                      Plus Populaire
                    </span>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-black text-slate-900">
                      {pkg.credits}
                    </span>
                    <Coins className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">Crédits IA</p>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {pkg.description}
                  </p>
                  {pkg.bonus && (
                    <span className="inline-block mt-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {pkg.bonus}
                    </span>
                  )}
                  <div className="mt-4 pt-2 border-t border-slate-200/80">
                    <p className="text-base font-black text-rose-600">
                      {pkg.priceFCFA.toLocaleString()} FCFA
                    </p>
                    <p className="text-[10px] text-slate-400">({pkg.priceEUR} €)</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Money Options */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Moyen de paiement Mobile Money & Carte
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'orange_money', name: 'Orange Money', color: 'border-orange-400 bg-orange-50/60 text-orange-900' },
                  { id: 'wave', name: 'Wave', color: 'border-cyan-400 bg-cyan-50/60 text-cyan-900' },
                  { id: 'mtn_momo', name: 'MTN MoMo', color: 'border-yellow-400 bg-yellow-50/60 text-yellow-900' },
                  { id: 'moov', name: 'Moov Money', color: 'border-blue-400 bg-blue-50/60 text-blue-900' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      paymentMethod === m.id
                        ? `${m.color} ring-2 ring-rose-400 shadow-sm font-extrabold`
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>

              <div className="mt-3">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Numéro de débit Mobile Money :
                </label>
                <input
                  type="tel"
                  value={momoPhone}
                  onChange={(e) => setMomoPhone(e.target.value)}
                  placeholder="+221 77 123 45 67"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* CTA Button */}
            <button
              id="btn-confirm-recharge"
              onClick={handlePay}
              disabled={processing || success}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {processing ? (
                <span>Validation du paiement Mobile Money...</span>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Crédits rechargés avec succès !</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Payer {selectedPack.priceFCFA.toLocaleString()} FCFA et recevoir {selectedPack.credits} Crédits
                  </span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Tab 2: Subscription Plans */}
        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* START */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white text-left flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Plan START
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-1">Gratuit</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Pour découvrir et tester les outils.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    5 crédits offerts / jour
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    Détourage & Copywriting basique
                  </li>
                  <li className="flex items-center gap-1.5 text-slate-400">
                    <X className="w-3.5 h-3.5 shrink-0" />
                    Filigrane discret inclus
                  </li>
                </ul>
              </div>
              <button
                disabled={profile.plan === 'START'}
                onClick={() => handleSelectPlan('START')}
                className="w-full mt-4 py-2 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                {profile.plan === 'START' ? 'Plan Actuel' : 'Choisir'}
              </button>
            </div>

            {/* STANDARD */}
            <div className="p-4 rounded-2xl border-2 border-rose-500 bg-rose-50/40 text-left flex flex-col justify-between shadow-md relative">
              <span className="absolute -top-2.5 right-3 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                Recommandé
              </span>
              <div>
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                  Plan STANDARD
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-1">
                  9 900 <span className="text-xs font-semibold">FCFA/mois</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Idéal pour vendeuses actives.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-1.5 font-semibold">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    50 crédits par mois
                  </li>
                  <li className="flex items-center gap-1.5 font-semibold">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Diaporamas & Voix-off IA
                  </li>
                  <li className="flex items-center gap-1.5 font-semibold">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Suppression totale du filigrane
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Qualité Image HD+
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleSelectPlan('STANDARD')}
                className="w-full mt-4 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200"
              >
                {profile.plan === 'STANDARD' ? 'Plan Actuel' : 'Passer à Standard'}
              </button>
            </div>

            {/* PREMIUM */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white text-left flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  Plan PREMIUM
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-1">
                  19 900 <span className="text-xs font-semibold">FCFA/mois</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Volume élevé & Vidéo IA complète.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5 font-semibold">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    150 crédits par mois
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    Traitement serveur prioritaire
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    Support WhatsApp VIP direct
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleSelectPlan('PREMIUM')}
                className="w-full mt-4 py-2 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-100"
              >
                {profile.plan === 'PREMIUM' ? 'Plan Actuel' : 'Passer à Premium'}
              </button>
            </div>
          </div>
        )}

        {/* Promo / Partner / Activation Code Section */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <form onSubmit={handleRedeemCode} className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/70">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Vous avez un code d'activation ou une formule négociée ?
              </label>
            </div>
            <div className="flex gap-2">
              <input
                id="input-pricing-access-code"
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="Ex: VP-START-50 ou VIP-761278-PASS"
                className="flex-grow px-3.5 py-2 bg-white rounded-xl border border-amber-300 text-xs font-mono font-bold text-slate-900 uppercase tracking-wider focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Activer
              </button>
            </div>
            {codeMessage && (
              <p
                className={`text-[11px] font-semibold mt-2 ${
                  codeMessage.success ? 'text-emerald-700 font-bold' : 'text-rose-600'
                }`}
              >
                {codeMessage.text}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
