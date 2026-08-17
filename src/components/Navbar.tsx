import React from 'react';
import {
  Sparkles,
  Camera,
  PenTool,
  Video,
  FolderHeart,
  Crown,
  Store,
  Coins,
  Plus,
  MessageCircle,
  Smartphone,
} from 'lucide-react';
import { BoutiqueProfile } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'photo' | 'copy' | 'video' | 'gallery';
  setActiveTab: (tab: 'dashboard' | 'photo' | 'copy' | 'video' | 'gallery') => void;
  profile: BoutiqueProfile;
  onOpenProfile: () => void;
  onOpenPricing: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  onOpenProfile,
  onOpenPricing,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Logo & Brand */}
          <div
            id="brand-logo-btn"
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <Sparkles className="w-5 h-5" />
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'gallery'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderHeart className="w-4 h-4 text-amber-500" />
              Mes Créations
            </button>
          </nav>

          {/* Right Actions: Credits & Boutique Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Credit Balance Badge with Recharge CTA */}
            <button
              id="btn-recharge-credits"
              onClick={onOpenPricing}
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-xl transition-all text-amber-900 group"
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
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-slate-800"
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

            {/* Phone Login / Account Button */}
            <button
              id="btn-phone-auth"
              onClick={onOpenAuth}
              className="hidden sm:flex items-center gap-1 text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 text-xs font-semibold"
              title="Connexion Rapide Mobile"
            >
              <Smartphone className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex justify-around items-center shadow-lg">
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
