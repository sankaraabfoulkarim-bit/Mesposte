import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Camera,
  PenTool,
  Video,
  FolderHeart,
  Store,
  Coins,
  Plus,
  Smartphone,
  Download,
  Cloud,
  User as UserIcon,
  ShieldAlert,
} from 'lucide-react';
import { BoutiqueProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { audioSynth } from '../utils/audioSynth';

interface NavbarProps {
  activeTab: 'dashboard' | 'photo' | 'copy' | 'video' | 'gallery';
  setActiveTab: (tab: 'dashboard' | 'photo' | 'copy' | 'video' | 'gallery') => void;
  profile: BoutiqueProfile;
  onOpenProfile: () => void;
  onOpenPricing: () => void;
  onOpenAuth: () => void;
  onOpenAdminPin?: () => void;
  onPromptInstall?: () => void;
  isInstallable?: boolean;
  isIOS?: boolean;
  isInstalled?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  onOpenProfile,
  onOpenPricing,
  onOpenAuth,
  onOpenAdminPin,
  onPromptInstall,
  isInstallable = false,
  isIOS = false,
  isInstalled = false,
}) => {
  const { user } = useAuth();
  const [isPressingLogo, setIsPressingLogo] = useState(false);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wasLongPressRef = useRef(false);

  const startLongPress = () => {
    wasLongPressRef.current = false;
    setIsPressingLogo(true);
    pressTimerRef.current = setTimeout(() => {
      wasLongPressRef.current = true;
      setIsPressingLogo(false);
      audioSynth.playSuccessChime();
      if (onOpenAdminPin) {
        onOpenAdminPin();
      }
    }, 1500);
  };

  const cancelLongPress = () => {
    setIsPressingLogo(false);
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const handleLogoClick = () => {
    if (wasLongPressRef.current) {
      wasLongPressRef.current = false;
      return;
    }
    setActiveTab('dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Logo & Brand with Secret Admin Long-Press */}
          <div
            id="brand-logo-btn"
            onClick={handleLogoClick}
            onMouseDown={startLongPress}
            onMouseUp={cancelLongPress}
            onMouseLeave={cancelLongPress}
            onTouchStart={startLongPress}
            onTouchEnd={cancelLongPress}
            onTouchCancel={cancelLongPress}
            className={`flex items-center gap-2.5 cursor-pointer select-none shrink-0 transition-transform ${
              isPressingLogo ? 'scale-95' : 'hover:scale-[1.01]'
            }`}
            title="VendeusePro AI (Appui long: Console Admin Secrète)"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-200 relative transition-all ${
                isPressingLogo ? 'ring-4 ring-amber-400 animate-pulse' : ''
              }`}
            >
              <Sparkles className="w-5 h-5" />
              {isPressingLogo && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-[8px] font-black animate-ping">
                  ●
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                  VendeusePro
                </span>
                <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                  IA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Studio Vente WhatsApp & Réseaux
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Accueil
            </button>
            <button
              id="nav-tab-photo"
              onClick={() => setActiveTab('photo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'photo'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4 text-rose-500" />
              Atelier Photo
            </button>
            <button
              id="nav-tab-copy"
              onClick={() => setActiveTab('copy')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'copy'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PenTool className="w-4 h-4 text-indigo-500" />
              Copywriter IA
            </button>
            <button
              id="nav-tab-video"
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Video className="w-4 h-4 text-emerald-500" />
              Studio Vidéo
            </button>
            <button
              id="nav-tab-gallery"
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderHeart className="w-4 h-4 text-amber-500" />
              Mes Créations
            </button>
          </nav>

          {/* Right Actions: PWA Install, Credits & Boutique Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Install PWA Button (Visible if installable or iOS and not already installed) */}
            {!isInstalled && (isInstallable || isIOS) && onPromptInstall && (
              <button
                id="btn-navbar-install-pwa"
                onClick={onPromptInstall}
                className="hidden sm:flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1.5 rounded-xl transition-all text-xs font-bold shadow-sm group active:scale-95"
                title="Installer l'application sur votre écran d'accueil"
              >
                <Download className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline">Installer l'App</span>
                <span className="md:hidden">App</span>
              </button>
            )}

            {/* Credit Balance Badge with Recharge CTA */}
            <button
              id="btn-recharge-credits"
              onClick={onOpenPricing}
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-xl transition-all text-amber-900 group cursor-pointer"
              title="Recharger des crédits"
            >
              <Coins className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
              <div className="text-left leading-none">
                <span className="font-extrabold text-sm">{profile.credits}</span>
                <span className="text-[10px] text-amber-700 font-medium ml-1">crédits</span>
              </div>
              <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center ml-1">
                <Plus className="w-3 h-3 stroke-[3]" />
              </div>
            </button>

            {/* Boutique Profile Button */}
            <button
              id="btn-boutique-profile"
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-slate-800 cursor-pointer"
              title="Configurer ma boutique"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold text-xs">
                <Store className="w-4 h-4" />
              </div>
              <div className="hidden lg:block text-left leading-tight max-w-[130px] truncate">
                <p className="font-bold text-xs truncate">{profile.name}</p>
                <span className="text-[10px] text-slate-500">{profile.city || profile.currency}</span>
              </div>
            </button>

            {/* Account / Cloud Auth Button */}
            <button
              id="btn-phone-auth"
              onClick={onOpenAuth}
              className={`flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                user
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={user ? `Connecté: ${user.email || user.displayName || 'Compte Firebase'}` : 'Se connecter / Synchroniser'}
            >
              {user ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-3 h-3" />}
                  </div>
                  <Cloud className="w-3.5 h-3.5 text-emerald-600 hidden sm:inline" />
                  <span className="hidden sm:inline text-[11px] font-bold text-emerald-700">Cloud Sync</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4 text-slate-600" />
                  <span className="hidden sm:inline text-[11px] font-bold">Connexion</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex justify-around items-center shadow-lg pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
            activeTab === 'dashboard' ? 'text-rose-600' : 'text-slate-500'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          Accueil
        </button>
        <button
          onClick={() => setActiveTab('photo')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
            activeTab === 'photo' ? 'text-rose-600' : 'text-slate-500'
          }`}
        >
          <Camera className="w-5 h-5 mb-0.5" />
          Photo
        </button>
        <button
          onClick={() => setActiveTab('copy')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
            activeTab === 'copy' ? 'text-rose-600' : 'text-slate-500'
          }`}
        >
          <PenTool className="w-5 h-5 mb-0.5" />
          Texte IA
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
            activeTab === 'video' ? 'text-rose-600' : 'text-slate-500'
          }`}
        >
          <Video className="w-5 h-5 mb-0.5" />
          Vidéo
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
            activeTab === 'gallery' ? 'text-rose-600' : 'text-slate-500'
          }`}
        >
          <FolderHeart className="w-5 h-5 mb-0.5" />
          Créations
        </button>
      </div>
    </header>
  );
};

