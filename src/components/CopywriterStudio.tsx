import React, { useState } from 'react';
import {
  PenTool,
  Sparkles,
  Zap,
  Crown,
  Heart,
  MessageCircle,
  Copy,
  Check,
  Share2,
  RefreshCw,
  Sliders,
  DollarSign,
  Tag,
  Instagram,
  Flame,
  Volume2,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DEMO_PRODUCTS } from '../data/presets';
import {
  BoutiqueProfile,
  CopywritingResult,
  CreationItem,
  DemoProduct,
  ToneType,
} from '../types';
import { audioSynth } from '../utils/audioSynth';

interface CopywriterStudioProps {
  profile: BoutiqueProfile;
  onSaveCreation: (item: CreationItem) => void;
  onDeductCredit: (amount?: number) => void;
  onOpenPricing: () => void;
  initialDemoProduct?: DemoProduct | null;
}

export const CopywriterStudio: React.FC<CopywriterStudioProps> = ({
  profile,
  onSaveCreation,
  onDeductCredit,
  onOpenPricing,
  initialDemoProduct,
}) => {
  // 3 Short Input Fields
  const [productName, setProductName] = useState<string>(
    initialDemoProduct ? initialDemoProduct.name : DEMO_PRODUCTS[0].name
  );
  const [price, setPrice] = useState<string>(
    initialDemoProduct ? initialDemoProduct.price : DEMO_PRODUCTS[0].price
  );
  const [details, setDetails] = useState<string>(
    initialDemoProduct ? initialDemoProduct.details : DEMO_PRODUCTS[0].details
  );
  const [tone, setTone] = useState<ToneType>(
    initialDemoProduct ? initialDemoProduct.suggestedTone : 'urgent'
  );

  // Status & Results
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<CopywritingResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Tone Options
  const TONE_OPTIONS: {
    id: ToneType;
    label: string;
    icon: any;
    desc: string;
    color: string;
  }[] = [
    {
      id: 'urgent',
      label: 'Urgent / Promo Flash',
      icon: Zap,
      desc: 'Crée l’urgence, met en avant les stocks limités et l’action immédiate.',
      color: 'border-amber-400 bg-amber-50/50 text-amber-900',
    },
    {
      id: 'chic',
      label: 'Chic & Élégant',
      icon: Crown,
      desc: 'Vocabulaire raffiné, met en valeur la qualité premium et le prestige.',
      color: 'border-purple-400 bg-purple-50/50 text-purple-900',
    },
    {
      id: 'friendly',
      label: 'Amical & Proximité',
      icon: Heart,
      desc: 'Ton chaleureux, complice et bienveillant comme une amie de confiance.',
      color: 'border-pink-400 bg-pink-50/50 text-pink-900',
    },
    {
      id: 'storytelling',
      label: 'Storytelling Émotion',
      icon: Sparkles,
      desc: 'Raconte une histoire, suscite le désir et la transformation personnelle.',
      color: 'border-indigo-400 bg-indigo-50/50 text-indigo-900',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp Direct Pro',
      icon: MessageCircle,
      desc: 'Format compact et aéré ultra-optimisé pour la lecture sur smartphone.',
      color: 'border-emerald-400 bg-emerald-50/50 text-emerald-900',
    },
  ];

  // AI Copywriting Generation Call
  const handleGenerateCopy = async () => {
    if (!productName.trim()) return;

    if (profile.credits <= 0) {
      onOpenPricing();
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/gemini/copywrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          price,
          currency: profile.currency,
          details,
          tone,
          boutiqueName: profile.name,
          boutiquePhone: profile.phone,
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        setResult(json.data);
        onDeductCredit(1);
        audioSynth.playSuccessChime();
        try {
          confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
        } catch {}
      }
    } catch (err) {
      console.error('Error generating copy:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy with UI feedback
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1-Click WhatsApp Share
  const handleWhatsAppShare = (textToShare: string) => {
    const encoded = encodeURIComponent(textToShare);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // Save to Gallery
  const handleSaveToGallery = () => {
    if (!result) return;
    const newItem: CreationItem = {
      id: 'copy_' + Date.now(),
      title: productName,
      price,
      currency: profile.currency,
      details,
      tone,
      type: 'copy',
      copywriting: result,
      createdAt: new Date().toISOString(),
    };
    onSaveCreation(newItem);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-xs">
            <PenTool className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Le Copywriter IA
            </h1>
            <p className="text-xs text-slate-500">
              Formulaire 3 champs, sélecteur de ton et rédaction de textes vendeuses irrésistibles
            </p>
          </div>
        </div>

        {/* Demo Product Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Exemples :
          </span>
          {DEMO_PRODUCTS.map((demo) => (
            <button
              key={demo.id}
              onClick={() => {
                setProductName(demo.name);
                setPrice(demo.price);
                setDetails(demo.details);
                setTone(demo.suggestedTone);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all border ${
                productName === demo.name
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {demo.name.split(' ')[0]} {demo.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 3-Field Form & Tone Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Les 3 Informations Clés
              </span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                Formulaire Express
              </span>
            </div>

            {/* Field 1: Product Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nom de l'article / Produit <span className="text-rose-500">*</span>
              </label>
              <input
                id="copy-product-name"
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ex: Robe de Soirée Satinée Émeraude"
                className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              />
            </div>

            {/* Field 2: Price */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Prix de vente ({profile.currency}) <span className="text-rose-500">*</span>
              </label>
              <input
                id="copy-product-price"
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex: 25 000"
                className="w-full px-3.5 py-2.5 text-xs font-extrabold text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              />
            </div>

            {/* Field 3: Details & Promo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Détail / Promo / Avantage clé
              </label>
              <textarea
                id="copy-product-details"
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Ex: Tissu soyeux infroissable, fente glamour, tailles S à XXL disponibles immédiatement."
                className="w-full px-3.5 py-2.5 text-xs text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 leading-relaxed font-medium"
              />
            </div>
          </div>

          {/* Tone Selector */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Sélecteur de Ton & Ambiance
            </span>

            <div className="space-y-2">
              {TONE_OPTIONS.map((t) => {
                const Icon = t.icon;
                const isSelected = tone === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none ${
                      isSelected
                        ? `${t.color} ring-2 ring-indigo-200 font-bold shadow-xs`
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected ? 'bg-white text-indigo-600 shadow-xs' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {t.label}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {t.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Generate CTA Button */}
            <button
              id="btn-generate-copywriting"
              onClick={handleGenerateCopy}
              disabled={isGenerating || !productName.trim()}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer mt-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Rédaction IA en cours avec Gemini 3.7...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Générer mes Textes Vendeurs (1 Crédit)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Results Cards & 1-Click WhatsApp Direct (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <>
              {/* Card 1: WhatsApp Status */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-emerald-300 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        Statut WhatsApp Optimisé
                      </h3>
                      <p className="text-[10px] text-slate-500">
                        Format court, accrocheur & adapté aux statuts/stories
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(result.whatsappStatus, 'wa_status')}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                    >
                      {copiedKey === 'wa_status' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleWhatsAppShare(result.whatsappStatus)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed font-medium">
                  {result.whatsappStatus}
                </div>
              </div>

              {/* Card 2: WhatsApp Direct Message / Groups */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        Message Privé / Groupes WhatsApp
                      </h3>
                      <p className="text-[10px] text-slate-500">
                        Argumentaire complet avec puces et détails de commande
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(result.whatsappDirectMessage, 'wa_dm')}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                    >
                      {copiedKey === 'wa_dm' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedKey === 'wa_dm' ? 'Copié !' : 'Copier'}</span>
                    </button>
                    <button
                      onClick={() => handleWhatsAppShare(result.whatsappDirectMessage)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Envoyer</span>
                    </button>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed font-medium">
                  {result.whatsappDirectMessage}
                </div>
              </div>

              {/* Card 3: Instagram & Facebook Post */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center">
                      <Instagram className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        Publication Instagram & Facebook
                      </h3>
                      <p className="text-[10px] text-slate-500">
                        Accroche puissante + 10 hashtags viraux ciblés
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(result.instagramFacebookPost, 'insta')}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                  >
                    {copiedKey === 'insta' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === 'insta' ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>

                <div className="p-3.5 bg-rose-50/40 rounded-xl border border-rose-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed font-medium">
                  {result.instagramFacebookPost}
                </div>
              </div>

              {/* Card 4: Voice-over Script & Hooks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-purple-600" />
                    Script Voix-Off Vidéo (15-20s)
                  </span>
                  <p className="text-xs text-slate-700 italic bg-purple-50/50 p-2.5 rounded-xl border border-purple-100 leading-relaxed">
                    "{result.voiceoverScript}"
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                    Accroche Coup de Poing (Hook)
                  </span>
                  <p className="text-xs font-extrabold text-slate-900 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 leading-relaxed">
                    « {result.shortCatchphrase} »
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  onClick={handleSaveToGallery}
                  className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 text-xs"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Enregistré dans l'historique !</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Enregistrer ce pack dans Mes Créations</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-xs text-center flex flex-col items-center justify-center min-h-[380px] space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center">
                <PenTool className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Vos textes de vente apparaîtront ici
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Remplissez les 3 champs rapides à gauche et cliquez sur "Générer mes Textes Vendeurs" pour obtenir vos statuts WhatsApp, posts Instagram et scripts voix-off.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
