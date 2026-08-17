import React from 'react';
import {
  Sparkles,
  Camera,
  PenTool,
  Video,
  Coins,
  ArrowRight,
  Plus,
  MessageCircle,
  Crown,
  CheckCircle2,
  FolderHeart,
  TrendingUp,
  Store,
  Layers,
  Wand2,
} from 'lucide-react';
import { DEMO_PRODUCTS } from '../data/presets';
import { BoutiqueProfile, CreationItem, DemoProduct } from '../types';
import { SalesTipsBanner } from './SalesTipsBanner';

interface DashboardHomeProps {
  profile: BoutiqueProfile;
  creations: CreationItem[];
  onNavigate: (tab: 'dashboard' | 'photo' | 'copy' | 'video' | 'gallery') => void;
  onSelectDemoProduct: (demo: DemoProduct, targetTab?: 'photo' | 'copy' | 'video') => void;
  onOpenPricing: () => void;
  onOpenProfile: () => void;
  onOpenCreationDetail: (item: CreationItem) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  profile,
  creations,
  onNavigate,
  onSelectDemoProduct,
  onOpenPricing,
  onOpenProfile,
  onOpenCreationDetail,
}) => {
  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Top Banner: Welcome & Credit Overview */}
      <div className="bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        {/* Background ambient decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                Plan {profile.plan}
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Store className="w-3.5 h-3.5" />
                {profile.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Bonjour, boostez vos ventes aujourd'hui !
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1.5 leading-relaxed font-medium">
              Créez des visuels studio professionnels, des textes irrésistibles et des diaporamas vidéo avec voix-off pour vos statuts WhatsApp en moins de 30 secondes.
            </p>
          </div>

          {/* Credits Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex items-center justify-between md:flex-col md:items-start gap-3 shrink-0">
            <div>
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Solde de Crédits
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <Coins className="w-6 h-6 text-amber-400" />
                <span className="text-3xl font-black text-white">{profile.credits}</span>
              </div>
            </div>
            <button
              onClick={onOpenPricing}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Recharger</span>
            </button>
          </div>
        </div>

        {/* 3-Clicks Quick Launch Row */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Tester en 1 clic avec un produit prêt :
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {DEMO_PRODUCTS.slice(0, 4).map((demo) => (
              <button
                key={demo.id}
                onClick={() => onSelectDemoProduct(demo, 'photo')}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold rounded-xl transition-all shrink-0 flex items-center gap-1.5"
              >
                <span>{demo.name.split(' ')[0]}</span>
                <span className="text-amber-300 text-[11px]">({demo.price} {profile.currency})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Tip of the Day */}
      <SalesTipsBanner />

      {/* The 3 Core SaaS Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Module 1: Photo Studio */}
        <div
          id="card-module-photo"
          onClick={() => onNavigate('photo')}
          className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-rose-300 hover:shadow-xl transition-all group cursor-pointer flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform" />
          <div>
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xs">
              <Camera className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
              Module Image
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-2">
              L'Atelier Photo Studio
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Détourage automatique, décors marbre & néon IA, upscaling netteté et incrustation automatique de votre prix et contact WhatsApp.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-600 group-hover:translate-x-1 transition-transform">
            <span>Ouvrir l'Atelier Photo</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Module 2: AI Copywriter */}
        <div
          id="card-module-copy"
          onClick={() => onNavigate('copy')}
          className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all group cursor-pointer flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform" />
          <div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xs">
              <PenTool className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
              Module Texte
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-2">
              Le Copywriter IA
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Formulaire 3 champs, choix du ton (Urgent, Chic, Amical, Storytelling) et génération instantanée de statuts WhatsApp et posts Instagram.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
            <span>Rédiger mes Textes</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Module 3: Video Studio */}
        <div
          id="card-module-video"
          onClick={() => onNavigate('video')}
          className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-xl transition-all group cursor-pointer flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform" />
          <div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xs">
              <Video className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              Module Vidéo
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-2">
              Studio Vidéo & Diaporama
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Transformez vos photos en reels animés avec musique entraînante, voix-off IA naturelle et sous-titres karaoké percutants.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
            <span>Créer un Reel / Diaporama</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Recent Creations Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <FolderHeart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Mes Créations Récentes
              </h2>
              <p className="text-xs text-slate-500">
                Accédez à vos visuels et textes sauvegardés pour les repartager en 1 clic
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('gallery')}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
          >
            <span>Voir toute la galerie ({creations.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {creations.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {creations.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => onOpenCreationDetail(item)}
                className="rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-rose-300 transition-all cursor-pointer bg-slate-50 group flex flex-col justify-between"
              >
                <div className="aspect-square bg-slate-900 relative overflow-hidden flex items-center justify-center">
                  {item.processedImageUrl ? (
                    <img
                      src={item.processedImageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : item.originalImageUrl ? (
                    <img
                      src={item.originalImageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="p-4 text-center text-slate-300 text-xs">
                      <Sparkles className="w-6 h-6 mx-auto mb-1 text-indigo-400" />
                      Texte IA
                    </div>
                  )}

                  <span className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    {item.type === 'video' ? '🎬 Vidéo' : item.type === 'image' ? '📸 Photo' : '✍️ Texte'}
                  </span>
                </div>

                <div className="p-3 bg-white">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] font-extrabold text-rose-600 mt-0.5">
                    {item.price} {item.currency}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">
              Aucune création enregistrée pour le moment
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Sélectionnez un produit démo ci-dessus ou importez une photo pour démarrer !
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
