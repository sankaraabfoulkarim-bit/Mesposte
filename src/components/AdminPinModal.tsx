import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldAlert, KeyRound, Delete, ArrowRight } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const REQUIRED_PIN = '761278';

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
      setShake(false);
    }
  }, [isOpen]);

  // Physical keyboard listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleAddDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin]);

  if (!isOpen) return null;

  const handleAddDigit = (digit: string) => {
    if (pin.length >= 6) return;
    setError(false);
    const newPin = pin + digit;
    setPin(newPin);

    // If 6 digits reached, evaluate immediately
    if (newPin.length === 6) {
      if (newPin === REQUIRED_PIN) {
        audioSynth.playSuccessChime();
        setTimeout(() => {
          onSuccess();
        }, 200);
      } else {
        audioSynth.playNoticeSound();
        setError(true);
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setPin('');
        }, 700);
      }
    }
  };

  const handleDelete = () => {
    setError(false);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setError(false);
    setPin('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`bg-slate-900 text-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-slate-700/70 relative transition-transform ${
          shake ? 'animate-shake' : ''
        }`}
      >
        {/* Close Button */}
        <button
          id="btn-close-pin-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pt-2 pb-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-900/40 mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-extrabold text-white tracking-tight">
            Console Administrateur
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Entrez le code PIN sécurisé pour gérer les abonnements & codes clients
          </p>
        </div>

        {/* PIN Dots Indicator */}
        <div className="flex justify-center items-center gap-3 my-4">
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const isFilled = index < pin.length;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  error
                    ? 'bg-rose-500 ring-4 ring-rose-500/30 scale-110'
                    : isFilled
                    ? 'bg-amber-400 ring-4 ring-amber-400/30 scale-110'
                    : 'bg-slate-800 border-2 border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        <div className="h-6 flex items-center justify-center mb-3">
          {error ? (
            <p className="text-xs font-bold text-rose-400 flex items-center gap-1.5 animate-bounce">
              <ShieldAlert className="w-4 h-4" />
              Code PIN incorrect. Réessayez.
            </p>
          ) : (
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-slate-500" />
              PIN à 6 chiffres
            </p>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              id={`pin-key-${digit}`}
              type="button"
              onClick={() => handleAddDigit(digit)}
              className="h-14 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 active:bg-amber-500 active:text-slate-950 text-white font-bold text-xl flex items-center justify-center border border-slate-700/50 shadow-sm transition-all cursor-pointer select-none"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            id="pin-key-clear"
            onClick={handleClear}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold flex items-center justify-center border border-slate-800 transition-all cursor-pointer select-none"
          >
            Effacer
          </button>
          <button
            type="button"
            id="pin-key-0"
            onClick={() => handleAddDigit('0')}
            className="h-14 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 active:bg-amber-500 active:text-slate-950 text-white font-bold text-xl flex items-center justify-center border border-slate-700/50 shadow-sm transition-all cursor-pointer select-none"
          >
            0
          </button>
          <button
            type="button"
            id="pin-key-backspace"
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-rose-400 flex items-center justify-center border border-slate-800 transition-all cursor-pointer select-none"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Hint for authorized admin */}
        <div className="mt-5 text-center">
          <p className="text-[10px] text-slate-600">
            Console réservée au gérant VendeusePro AI
          </p>
        </div>
      </div>
    </div>
  );
};
