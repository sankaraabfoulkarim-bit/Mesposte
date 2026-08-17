import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music,
  Mic,
  Sparkles,
  Download,
  Share2,
  Check,
  RefreshCw,
  Sliders,
  Type,
  Plus,
  Trash2,
  Layers,
  MessageCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DEMO_PRODUCTS, MUSIC_TRACKS, VOICE_OPTIONS } from '../data/presets';
import {
  BoutiqueProfile,
  CreationItem,
  DemoProduct,
  MusicTrack,
  VoiceOption,
} from '../types';
import { audioSynth } from '../utils/audioSynth';

interface VideoStudioProps {
  profile: BoutiqueProfile;
  onSaveCreation: (item: CreationItem) => void;
  onDeductCredit: (amount?: number) => void;
  onOpenPricing: () => void;
  initialDemoProduct?: DemoProduct | null;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({
  profile,
  onSaveCreation,
  onDeductCredit,
  onOpenPricing,
  initialDemoProduct,
}) => {
  // Input fields
  const [productName, setProductName] = useState<string>(
    initialDemoProduct ? initialDemoProduct.name : DEMO_PRODUCTS[0].name
  );
  const [price, setPrice] = useState<string>(
    initialDemoProduct ? initialDemoProduct.price : DEMO_PRODUCTS[0].price
  );
  const [promoHook, setPromoHook] = useState<string>(
    'Profitez de notre offre exclusive WhatsApp avant rupture de stock !'
  );
  const [voiceScript, setVoiceScript] = useState<string>(
    `Découvrez ${initialDemoProduct ? initialDemoProduct.name : DEMO_PRODUCTS[0].name} au prix exceptionnel de ${initialDemoProduct ? initialDemoProduct.price : DEMO_PRODUCTS[0].price} ${profile.currency}. Qualité premium garantie. Commandez vite sur WhatsApp !`
  );

  // Photos sequence
  const [photos, setPhotos] = useState<string[]>([
    initialDemoProduct ? initialDemoProduct.imageUrl : DEMO_PRODUCTS[0].imageUrl,
    DEMO_PRODUCTS[1].imageUrl,
  ]);

  // Audio settings
  const [selectedMusic, setSelectedMusic] = useState<MusicTrack>(MUSIC_TRACKS[0]);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VOICE_OPTIONS[0]);
  const [enableVoiceover, setEnableVoiceover] = useState<boolean>(true);
  const [enableMusic, setEnableMusic] = useState<boolean>(true);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [transitionStyle, setTransitionStyle] = useState<'kenburns' | 'slide' | 'zoom'>('kenburns');

  // Playback & Animation states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const totalDurationSec = 15; // 15s video standard reel

  const loadedImagesRef = useRef<HTMLImageElement[]>([]);

  // Preload sequence images
  useEffect(() => {
    let active = true;
    const loadAll = async () => {
      const loaded: HTMLImageElement[] = [];
      for (const url of photos) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        await new Promise((r) => (img.onload = r));
        loaded.push(img);
      }
      if (active) {
        loadedImagesRef.current = loaded;
        drawFrame(0);
      }
    };
    loadAll();
    return () => {
      active = false;
    };
  }, [photos]);

  // Draw current animated frame onto canvas
  const drawFrame = (timeSec: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background base
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const images = loadedImagesRef.current;
    if (images.length === 0) return;

    // Calculate current slide and transition
    const slideDuration = totalDurationSec / images.length;
    const currentSlideIdx = Math.min(
      images.length - 1,
      Math.floor(timeSec / slideDuration)
    );
    const slideProgress = (timeSec % slideDuration) / slideDuration; // 0 to 1

    const img = images[currentSlideIdx];

    ctx.save();
    // Dynamic Animation (Ken Burns zoom / pan)
    let scale = 1.0;
    let offsetX = 0;
    let offsetY = 0;

    if (transitionStyle === 'kenburns') {
      scale = 1.0 + slideProgress * 0.15; // Smooth 1.0 to 1.15 zoom
      offsetY = (slideProgress - 0.5) * 15;
    } else if (transitionStyle === 'zoom') {
      scale = 1.15 - slideProgress * 0.12;
    }

    // Centered scaled draw
    const imgAspect = img.width / img.height;
    const canvasAspect = width / height;
    let renderW = width;
    let renderH = height;

    if (imgAspect > canvasAspect) {
      renderH = height;
      renderW = height * imgAspect;
    } else {
      renderW = width;
      renderH = width / imgAspect;
    }

    renderW *= scale;
    renderH *= scale;

    const drawX = (width - renderW) / 2 + offsetX;
    const drawY = (height - renderH) / 2 + offsetY;

    ctx.drawImage(img, drawX, drawY, renderW, renderH);

    // Subtle dark gradient vignette for readable text
    const grad = ctx.createLinearGradient(0, height * 0.5, 0, height);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.4)');
    grad.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();

    // Top Brand Pill
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.beginPath();
    ctx.roundRect(24, 24, width - 48, 54, 18);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(profile.name, 40, 51);

    ctx.fillStyle = '#D97706';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`WhatsApp : ${profile.phone}`, width - 40, 51);
    ctx.restore();

    // Bottom On-Screen Subtitles & Price Ribbon
    if (showSubtitles) {
      ctx.save();

      // Price Tag (Center Floating)
      const priceText = `${price} ${profile.currency}`;
      ctx.font = '900 32px sans-serif';
      const priceW = ctx.measureText(priceText).width + 48;
      const priceX = (width - priceW) / 2;
      const priceY = height - 190;

      // Price Pill
      ctx.fillStyle = '#E11D48'; // Rose-600
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(priceX, priceY, priceW, 52, 26);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(priceText, width / 2, priceY + 26);

      // Karaoke / Animated Caption Words
      const words = voiceScript.split(' ');
      const wordIdx = Math.floor((timeSec / totalDurationSec) * words.length);
      const currentSentence = words.slice(Math.max(0, wordIdx - 4), wordIdx + 4).join(' ');

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 8;
      ctx.fillText(currentSentence || promoHook, width / 2, height - 90);

      // WhatsApp CTA Footer
      ctx.fillStyle = '#34D399'; // Emerald-400
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('👉 Commandez maintenant en DM / WhatsApp', width / 2, height - 45);

      ctx.restore();
    }
  };

  // Animation Loop
  useEffect(() => {
    if (!isPlaying) {
      audioSynth.stopBackgroundMusic();
      audioSynth.stopSpeech();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    // Start background beat
    if (enableMusic) {
      audioSynth.playBackgroundMusic(selectedMusic.genre, 0.25);
    }

    // Start voiceover
    if (enableVoiceover) {
      audioSynth.speakText(voiceScript, selectedVoice.name);
    }

    startTimeRef.current = performance.now() - (progress / 100) * totalDurationSec * 1000;

    const loop = (now: number) => {
      const elapsedSec = (now - startTimeRef.current) / 1000;
      if (elapsedSec >= totalDurationSec) {
        setIsPlaying(false);
        setProgress(100);
        drawFrame(totalDurationSec);
        return;
      }

      const p = (elapsedSec / totalDurationSec) * 100;
      setProgress(p);
      drawFrame(elapsedSec);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      audioSynth.stopBackgroundMusic();
      audioSynth.stopSpeech();
    };
  }, [isPlaying]);

  const handlePlayToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (progress >= 100) setProgress(0);
      setIsPlaying(true);
    }
  };

  // Add photo to sequence
  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotos([...photos, event.target.result as string]);
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove photo
  const handleRemovePhoto = (idx: number) => {
    if (photos.length <= 1) return;
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  // Save to Gallery
  const handleSaveToGallery = () => {
    const canvas = canvasRef.current;
    const previewUrl = canvas ? canvas.toDataURL('image/jpeg', 0.9) : photos[0];

    const newItem: CreationItem = {
      id: 'vid_' + Date.now(),
      title: productName,
      price,
      currency: profile.currency,
      details: `Diaporama animé avec musique ${selectedMusic.title} & Voix ${selectedVoice.name}`,
      tone: 'urgent',
      type: 'video',
      processedImageUrl: previewUrl,
      videoDuration: totalDurationSec,
      musicTrackId: selectedMusic.id,
      voiceId: selectedVoice.id,
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

  // Export / Download Video Poster & Sequence
  const handleDownloadVideo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);

    setTimeout(() => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.download = `vendeusepro-video-${(productName || 'produit').toLowerCase().replace(/\s+/g, '-')}.jpg`;
      link.click();
      setIsExporting(false);
      handleSaveToGallery();
    }, 800);
  };

  // Share to WhatsApp
  const handleWhatsAppShare = () => {
    const text = `🎬 *${productName}* - Nouveau Reel Promo !\n\n💰 *Prix :* ${price} ${profile.currency}\n🎙️ *Message :* ${promoHook}\n\n👉 Commandez directement sur WhatsApp : ${profile.phone}`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    handleSaveToGallery();
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-xs">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Le Studio Vidéo Express & Diaporamas
            </h1>
            <p className="text-xs text-slate-500">
              Animations de photos avec transitions dynamiques, musique libre de droits, voix-off IA et sous-titres
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
                setPhotos([demo.imageUrl, DEMO_PRODUCTS[(DEMO_PRODUCTS.indexOf(demo) + 1) % DEMO_PRODUCTS.length].imageUrl]);
                setVoiceScript(`Découvrez ${demo.name} au prix de ${demo.price} ${profile.currency}. Disponible immédiatement en boutique !`);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all border ${
                productName === demo.name
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {demo.name.split(' ')[0]} {demo.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Card 1: Sequence Photos */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                1. Photos du Diaporama ({photos.length})
              </span>
              
              <label className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 cursor-pointer flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter une photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAddPhoto}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {photos.map((url, idx) => (
                <div
                  key={idx}
                  className="w-20 h-20 rounded-xl border-2 border-slate-200 overflow-hidden relative group shrink-0 bg-slate-100"
                >
                  <img
                    src={url}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    #{idx + 1}
                  </span>
                  {photos.length > 1 && (
                    <button
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Voiceover & Script */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-emerald-500" />
                2. Voix-Off IA & Narration
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span className="text-[11px] font-bold text-slate-600">Activer</span>
                <input
                  type="checkbox"
                  checked={enableVoiceover}
                  onChange={(e) => setEnableVoiceover(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                />
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Choix de la Voix Vendeuse
              </label>
              <div className="grid grid-cols-2 gap-2">
                {VOICE_OPTIONS.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVoice(v)}
                    className={`p-2 rounded-xl border text-left text-xs font-bold transition-all ${
                      selectedVoice.id === v.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-extrabold">{v.name}</p>
                    <p className="text-[10px] text-slate-500 font-normal truncate">
                      {v.style}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Texte lu par la voix-off :
              </label>
              <textarea
                rows={2}
                value={voiceScript}
                onChange={(e) => setVoiceScript(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Card 3: Music & Transitions */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-emerald-500" />
                3. Musique Libre de Droits
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span className="text-[11px] font-bold text-slate-600">Activer</span>
                <input
                  type="checkbox"
                  checked={enableMusic}
                  onChange={(e) => setEnableMusic(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MUSIC_TRACKS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMusic(m)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedMusic.id === m.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold truncate">{m.title}</p>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {m.genre} • {m.tempo}
                  </span>
                </button>
              ))}
            </div>

            {/* Subtitles toggle */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Type className="w-3.5 h-3.5 text-slate-500" />
                Sous-titres & Prix Animés
              </span>
              <input
                type="checkbox"
                checked={showSubtitles}
                onChange={(e) => setShowSubtitles(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Player & Export (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Aperçu Vidéo en Direct (15s)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Format Reel / WhatsApp Story (9:16)
              </span>
            </div>

            {/* Video Canvas Player */}
            <div className="relative rounded-2xl overflow-hidden aspect-[9/12] max-w-sm mx-auto border-2 border-slate-800 shadow-2xl bg-black">
              <canvas
                ref={canvasRef}
                width={720}
                height={960}
                className="w-full h-full object-contain"
              />

              {/* Center Play/Pause Button */}
              <button
                onClick={handlePlayToggle}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white/80 hover:bg-white text-slate-900 flex items-center justify-center shadow-xl transition-transform hover:scale-110 cursor-pointer z-20 backdrop-blur-xs"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-slate-900" />
                ) : (
                  <Play className="w-8 h-8 fill-slate-900 ml-1" />
                )}
              </button>

              {/* Bottom Video Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                <div
                  className="h-full bg-emerald-500 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Player Controls Bar */}
            <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <button
                onClick={handlePlayToggle}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all shadow-xs"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isPlaying ? 'Pause' : 'Lire la vidéo'}</span>
              </button>

              <div className="text-xs font-bold text-slate-700">
                {Math.round((progress / 100) * totalDurationSec)}s / {totalDurationSec}s
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEnableMusic(!enableMusic)}
                  className={`p-1.5 rounded-lg border text-xs font-semibold ${
                    enableMusic ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                  title="Couper/Activer Musique"
                >
                  <Music className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEnableVoiceover(!enableVoiceover)}
                  className={`p-1.5 rounded-lg border text-xs font-semibold ${
                    enableVoiceover ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                  title="Couper/Activer Voix-off"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <button
                id="btn-video-share-whatsapp"
                onClick={handleWhatsAppShare}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Statut WhatsApp</span>
              </button>

              <button
                id="btn-video-download"
                onClick={handleDownloadVideo}
                disabled={isExporting}
                className="py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Export HD...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Exporter le Visuel</span>
                  </>
                )}
              </button>

              <button
                id="btn-video-save-gallery"
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
          </div>
        </div>
      </div>
    </div>
  );
};
