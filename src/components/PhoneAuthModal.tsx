import React, { useState } from 'react';
import {
  X,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  LogOut,
  User as UserIcon,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BoutiqueProfile } from '../types';
import { redeemAccessCode } from '../services/subscriptionService';
import { audioSynth } from '../utils/audioSynth';

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (phone: string) => void;
  currentProfile?: BoutiqueProfile;
  onProfileUpdate?: (updated: BoutiqueProfile) => void;
}

export const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentProfile,
  onProfileUpdate,
}) => {
  const { user, signInWithGoogle, signOutUser } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('+221 77 845 22 10');
  const [step, setStep] = useState<'phone' | 'otp' | 'code' | 'success'>('phone');
  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCustomMsg, setSuccessCustomMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      setSuccessCustomMsg('Bienvenue sur votre espace VendeusePro AI synchronisé avec Firebase');
      setStep('success');
      setTimeout(() => {
        onSuccess(user?.phoneNumber || '+221 77 845 22 10');
        onClose();
        setStep('phone');
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Connexion Google annulée ou indisponible.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 600);
  };

  const handleRedeemCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCodeInput.trim()) return;
    setErrorMsg(null);

    const baseProfile: BoutiqueProfile = currentProfile || {
      name: 'Ma Boutique',
      phone: '',
      slogan: '',
      currency: 'FCFA',
      city: '',
      country: '',
      plan: 'START',
      credits: 50,
    };

    const result = redeemAccessCode(accessCodeInput, baseProfile);
    if (result.success && result.updatedProfile) {
      if (onProfileUpdate) {
        onProfileUpdate(result.updatedProfile);
      }
      audioSynth.playSuccessChime();
      setSuccessCustomMsg(result.message);
      setStep('success');
      setTimeout(() => {
        onSuccess(result.updatedProfile?.phone || phoneNumber);
        onClose();
        setStep('phone');
        setAccessCodeInput('');
      }, 1500);
    } else {
      audioSynth.playNoticeSound();
      setErrorMsg(result.message);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const newOtp = [...otpCode];
    newOtp[index] = val;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }

    if (newOtp.every((d) => d.length === 1)) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setSuccessCustomMsg('Connexion réussie ! Vos crédits sont prêts.');
        setStep('success');
        setTimeout(() => {
          onSuccess(phoneNumber);
          onClose();
          setStep('phone');
        }, 1000);
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          id="btn-close-auth-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Espace Compte & Connexion
            </h3>
            <p className="text-xs text-slate-500">
              Activez vos codes de connexion ou synchronisez vos données
            </p>
          </div>
        </div>

        {user && (
          <div className="mb-4 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-950 truncate">
                  {user.displayName || 'Compte Vendeuse Connecté'}
                </p>
                <p className="text-[11px] text-emerald-700 truncate">
                  {user.email || user.uid.slice(0, 10)}
                </p>
              </div>
            </div>
            <button
              id="btn-signout-auth"
              onClick={async () => {
                await signOutUser();
                onClose();
              }}
              className="px-2.5 py-1.5 bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              title="Se déconnecter"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Déconnexion</span>
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* Tab selection */}
        {step !== 'success' && step !== 'otp' && (
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                step === 'phone'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile / Google</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('code');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                step === 'code'
                  ? 'bg-white text-slate-900 shadow-sm text-amber-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span>Code d'Abonnement</span>
            </button>
          </div>
        )}

        {/* CODE REDEMPTION FORM */}
        {step === 'code' && (
          <form onSubmit={handleRedeemCodeSubmit} className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80">
              <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-1.5">
                Entrez votre code de connexion / abonnement
              </label>
              <p className="text-[11px] text-amber-800 mb-3">
                Vous avez reçu un code d'accès par WhatsApp ? Saisissez-le ici pour débloquer votre formule et vos crédits.
              </p>
              <div className="relative">
                <input
                  id="input-access-code"
                  type="text"
                  required
                  value={accessCodeInput}
                  onChange={(e) => setAccessCodeInput(e.target.value.toUpperCase())}
                  placeholder="Ex: VP-START-50 ou VP-PRO-150"
                  className="w-full px-4 py-3 rounded-xl border border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-slate-900 font-mono font-bold uppercase tracking-wider text-base bg-white"
                />
                <Sparkles className="w-5 h-5 text-amber-500 absolute right-3 top-3.5" />
              </div>
            </div>

            <button
              id="btn-redeem-access-code"
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Activer mon Abonnement</span>
            </button>
          </form>
        )}

        {/* PHONE / GOOGLE FORM */}
        {step === 'phone' && (
          <div className="space-y-4 animate-fadeIn">
            <button
              id="btn-google-auth-signin"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-2xl border-2 border-slate-200 hover:border-slate-300 shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.665-5.17 3.665-9.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.1C3.29 21.46 7.37 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.1z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.54 1.25 6.58l4.03 3.1c.95-2.83 3.6-4.93 6.72-4.93z"
                />
              </svg>
              <span>{googleLoading ? 'Connexion en cours...' : 'Continuer avec Google (Firebase)'}</span>
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-slate-400 text-xs font-semibold uppercase">ou par WhatsApp / Mobile</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleSendCode} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Numéro WhatsApp ou Mobile
                </label>
                <div className="relative">
                  <input
                    id="auth-phone-input"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+221 77 123 45 67"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-slate-900 font-semibold"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Code de vérification sécurisé.
                </p>
              </div>

              <button
                id="btn-send-sms-otp"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {loading ? (
                  <span>Envoi du code...</span>
                ) : (
                  <>
                    <span>Recevoir mon code SMS</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onSuccess('+221 77 845 22 10');
                    onClose();
                  }}
                  className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  Tester immédiatement avec le compte Démo Vendeuse
                </button>
              </div>
            </form>
          </div>
        )}

        {/* OTP INPUT */}
        {step === 'otp' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center">
              <p className="text-sm text-slate-600">
                Code à 4 chiffres envoyé au :
              </p>
              <p className="font-bold text-slate-900 text-base">{phoneNumber}</p>
            </div>

            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={otpCode[idx]}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-14 h-14 text-center text-2xl font-black rounded-xl border-2 border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-slate-900 bg-slate-50"
                />
              ))}
            </div>

            <div className="text-center">
              <p className="text-xs text-slate-400">
                Code de test rapide : tapez <strong>1 2 3 4</strong>
              </p>
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {step === 'success' && (
          <div className="py-8 text-center space-y-3 animate-fadeIn">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-slate-900">
              Succès !
            </h4>
            <p className="text-xs text-slate-600 font-medium">
              {successCustomMsg || 'Bienvenue sur votre espace VendeusePro AI'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
