import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Sliders,
  Check,
  Download,
  Share2,
  Layers,
  Wand2,
  RefreshCw,
  Eye,
  Store,
  DollarSign,
  Tag,
  Palette,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { STUDIO_PRESETS, DEMO_PRODUCTS } from '../data/presets';
import {
  BoutiqueProfile,
  CreationItem,
  DemoProduct,
  StudioBackgroundPreset,
} from '../types';
import { renderStudioImage, loadImage } from '../utils/imageProcessing';
import { audioSynth } from '../utils/audioSynth';

interface PhotoStudioProps {
  profile: BoutiqueProfile;
  onSaveCreation: (item: CreationItem) => void;
  onDeductCredit: (amount?: number) => void;
  onOpenPricing: () => void;
  initialDemoProduct?: DemoProduct | null;
}

export const PhotoStudio: React.FC<PhotoStudioProps> = ({
  profile,
  onSaveCreation,
  onDeductCredit,
  onOpenPricing,
  initialDemoProduct,
}) => {
  // Input states
  const [productImage, setProductImage] = useState<string>(
    initialDemoProduct ? initialDemoProduct.imageUrl : DEMO_PRODUCTS[0].imageUrl
  );
  const [productName, setProductName] = useState<string>(
    initialDemoProduct ? initialDemoProduct.name : DEMO_PRODUCTS[0].name
  );
  const [price, setPrice] = useState<string>(
    initialDemoProduct ? initialDemoProduct.price : DEMO_PRODUCTS[0].price
  );
  const [badgeText, setBadgeText] = useState<string>('PROMO FLASH');

  // Studio processing settings
  const [selectedPreset, setSelectedPreset] = useState<StudioBackgroundPreset>(
    STUDIO_PRESETS[0]
  );
  const [removeBackground, setRemoveBackground] = useState<boolean>(true);
  const [enhanceClarity, setEnhanceClarity] = useState<boolean>(true);
  const [showBadges, setShowBadges] = useState<boolean>(true);

  // Status & output
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [sliderPos, setSliderPos] = useState<number>(50); // Before/After slider %
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync if initialDemoProduct changes
  useEffect(() => {
    if (initialDemoProduct) {
      setProductImage(initialDemoProduct.imageUrl);
      setProductName(initialDemoProduct.name);
      setPrice(initialDemoProduct.price);
      const matched = STUDIO_PRESETS.find(
        (p) => p.id === initialDemoProduct.suggestedBackground
      );
      if (matched) setSelectedPreset(matched);
    }
  }, [initialDemoProduct]);

  // Initial render when loaded
  useEffect(() => {
    handleGenerateStudio();
  }, [productImage, selectedPreset, removeBackground, enhanceClarity, showBadges]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProductImage(event.target.result as string);
        setProcessedImageUrl(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // AI Product Visual Analysis
  const handleAIAnalyze = async () => {
    if (profile.credits <= 0) {
      onOpenPricing();
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/gemini/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: productImage,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.detectedName) setProductName(data.data.detectedName);
        if (data.data.suggestedPriceRange) {
          const numMatch = data.data.suggestedPriceRange.match(/\d[\d\s]*/);
          if (numMatch) setPrice(numMatch[0].trim());
        }
        onDeductCredit(1);
        audioSynth.playSuccessChime();
      }
    } catch (e) {
      console.warn('AI analysis error:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate Rendered Studio Image
  const handleGenerateStudio = async () => {
    setIsProcessing(true);
    try {
      const rendered = await renderStudioImage(productImage, {
        preset: selectedPreset,
        removeBackground,
        enhanceClarity,
        badgeText: showBadges ? badgeText : undefined,
        priceText: showBadges ? `${price} ${profile.currency}` : undefined,
        boutiqueName: profile.name,
        boutiquePhone: profile.phone,
        showWatermark: profile.plan === 'START',
      });
      setProcessedImageUrl(rendered);
    } catch (err) {
      console.error('Render error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Save to Gallery
  const handleSaveToGallery = () => {
    if (!processedImageUrl) return;
    const newItem: CreationItem = {
      id: 'item_' + Date.now(),
      title: productName || 'Visuel Studio',
      price,
      currency: profile.currency,
      details: `Arrière-plan : ${selectedPreset.name} | Badges : ${badgeText}`,
      tone: 'chic',
      type: 'image',
      originalImageUrl: productImage,
      processedImageUrl,
      studioPresetId: selectedPreset.id,
      badgeText,
      createdAt: new Date().toISOString(),
    };
    onSaveCreation(newItem);
    setSavedSuccess(true);
    audioSynth.playSuccessChime();
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Download HD Image
  const handleDownload = () => {
    if (!processedImageUrl) return;
    const link = document.createElement('a');
    link.href = processedImageUrl;
    link.download = `vendeusepro-${(productName || 'produit').toLowerCase().replace(/\s+/g, '-')}.jpg`;
    link.click();
    handleSaveToGallery();
  };

  // Share to WhatsApp
  const handleWhatsAppShare = () => {
    const text = `🛍️ *${productName}* disponible chez *${profile.name}* !\n\n💰 *Prix :* ${price} ${profile.currency}\n✨ *Offre Spéciale :* ${badgeText}\n\n👉 Commandez directement sur WhatsApp : ${profile.phone}`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    handleSaveToGallery();
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-xs">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              L'Atelier Photo Studio IA
            </h1>
            <p className="text-xs text-slate-500">
              Détourage automatique, décors haut de gamme, upscaling et badges de vente en 1 clic
            </p>
          </div>
        </div>

        {/* Demo Product Quick Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Exemples :
          </span>
          {DEMO_PRODUCTS.map((demo) => (
            <button
              key={demo.id}
              onClick={() => {
                setProductImage(demo.imageUrl);
                setProductName(demo.name);
                setPrice(demo.price);
                const p = STUDIO_PRESETS.find(
                  (s) => s.id === demo.suggestedBackground
                );
                if (p) setSelectedPreset(p);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all border ${
                productImage === demo.imageUrl
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {demo.name.split(' ')[0]} {demo.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Controls & Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Card 1: Import & AI Detect */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-rose-500" />
                1. Photo du Produit
              </span>
              
              <button
                id="btn-ai-analyze"
                onClick={handleAIAnalyze}
                disabled={isAnalyzing}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 transition-all flex items-center gap-1 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Analyse IA en cours...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3 h-3 text-rose-500" />
                    <span>✨ Détecter avec l'IA</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-xl border-2 border-slate-200 overflow-hidden bg-slate-100 shrink-0 relative group">
                <img
                  src={productImage}
                  alt="Original"
                  className="w-full h-full object-cover"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                >
                  <Upload className="w-5 h-5" />
                </div>
              </div>

              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>Importer une photo</span>
                </button>
                <p className="text-[10px] text-slate-400 text-center">
                  JPG, PNG ou capture smartphone
                </p>
              </div>
            </div>

            {/* 3 Quick Fields */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nom de l'article
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Ex: Robe Satinée de Soirée"
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Prix ({profile.currency})
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="25 000"
                    className="w-full px-3 py-2 text-xs font-extrabold text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Badge Vendeur
                  </label>
                  <select
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-rose-200 focus:border-rose-500"
                  >
                    <option value="PROMO FLASH ⚡">PROMO FLASH ⚡</option>
                    <option value="NOUVELLE COLLECTION ✨">NOUVEAUTÉ ✨</option>
                    <option value="STOCK LIMITÉ 🔥">STOCK LIMITÉ 🔥</option>
                    <option value="BEST SELLER ⭐">BEST SELLER ⭐</option>
                    <option value="LIVRAISON RAPIDE 🚀">LIVRAISON DISPO 🚀</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Studio Backgrounds */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-rose-500" />
              2. Décors de Mise en Scène IA
            </span>

            <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
              {STUDIO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset)}
                  className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden select-none ${
                    selectedPreset.id === preset.id
                      ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-300 font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className="w-full h-8 rounded-lg mb-1.5 border border-black/5"
                    style={{ background: preset.gradient }}
                  />
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {preset.name}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {preset.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Card 3: AI Enhancement Toggles */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Sliders className="w-3.5 h-3.5 text-rose-500" />
              3. Options & Retouches IA
            </span>

            <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800">
                  Détourage automatique
                </p>
                <p className="text-[10px] text-slate-500">
                  Isole le produit et supprime l'ancien fond
                </p>
              </div>
              <input
                type="checkbox"
                checked={removeBackground}
                onChange={(e) => setRemoveBackground(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 accent-rose-600 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800">
                  Amélioration netteté & HDR
                </p>
                <p className="text-[10px] text-slate-500">
                  Rendu ultra-net et couleurs éclatantes
                </p>
              </div>
              <input
                type="checkbox"
                checked={enhanceClarity}
                onChange={(e) => setEnhanceClarity(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 accent-rose-600 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800">
                  Incrustation Badges & WhatsApp
                </p>
                <p className="text-[10px] text-slate-500">
                  Affiche le prix, la boutique et le contact WhatsApp
                </p>
              </div>
              <input
                type="checkbox"
                checked={showBadges}
                onChange={(e) => setShowBadges(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 accent-rose-600 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Right Column: Interactive Canvas Preview & Export (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Rendu Studio HD
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Prêt pour WhatsApp Status & Insta
                </span>
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                Glissez pour comparer
              </div>
            </div>

            {/* Interactive Before / After Comparison Preview */}
            <div className="relative rounded-2xl overflow-hidden aspect-square border border-slate-200 shadow-inner bg-slate-900 select-none">
              
              {/* Processed (After) Image */}
              {processedImageUrl ? (
                <img
                  src={processedImageUrl}
                  alt="After"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xs">
                  Génération en cours...
                </div>
              )}

              {/* Before Image (Clipped by slider position) */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src={productImage}
                  alt="Before"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ width: '100%', minWidth: '100%', maxWidth: 'none' }}
                />
                <div className="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                  AVANT (Brut)
                </div>
              </div>

              <div className="absolute top-3 right-3 bg-rose-600/90 text-white text-[10px] font-black px-2 py-1 rounded-md shadow">
                APRÈS (Studio IA)
              </div>

              {/* Slider Divider Bar */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white text-slate-800 shadow-lg flex items-center justify-center text-xs font-black border border-slate-200">
                  ↔
                </div>
              </div>

              {/* Invisible Range Input for Smooth Dragging */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              
              {/* WhatsApp Share Direct */}
              <button
                id="btn-photo-share-whatsapp"
                onClick={handleWhatsAppShare}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Statut WhatsApp</span>
              </button>

              {/* HD Download */}
              <button
                id="btn-photo-download-hd"
                onClick={handleDownload}
                className="py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger HD</span>
              </button>

              {/* Save to History */}
              <button
                id="btn-photo-save-gallery"
                onClick={handleSaveToGallery}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Enregistré !</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Sauvegarder</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Format optimisé :</strong> Carré 1:1 HD compatible Statut WhatsApp, post Instagram et catalogue Facebook.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
