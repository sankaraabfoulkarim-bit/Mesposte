import React, { useState } from 'react';
import { X, Smartphone, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (phone: string) => void;
}

export const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('+221 77 845 22 10');
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 600);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          id="btn-close-auth-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Connexion Rapide Mobile
            </h3>
            <p className="text-xs text-slate-500">
              Accédez à vos créations et crédits en 1 clic
            </p>
          </div>
        </div>

        {step === 'phone' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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
                Un code de vérification SMS sécurisé vous sera envoyé.
              </p>
            </div>

            <button
              id="btn-send-sms-otp"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
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

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  onSuccess('+221 77 845 22 10');
                  onClose();
                }}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Tester immédiatement avec le compte Démo Vendeuse
              </button>
            </div>
          </form>
        )}

        {step === 'otp' && (
          <div className="space-y-5">
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

        {step === 'success' && (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-slate-900">
              Connexion réussie !
            </h4>
            <p className="text-xs text-slate-500">
              Bienvenue sur votre espace VendeusePro AI
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
