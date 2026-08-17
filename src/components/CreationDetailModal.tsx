import React, { useState } from 'react';
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Instagram,
  Sparkles,
  Calendar,
  Tag,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CreationItem } from '../types';

interface CreationDetailModalProps {
  item: CreationItem | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const CreationDetailModal: React.FC<CreationDetailModalProps> = ({
  item,
  onClose,
  onDelete,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!item) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    try {
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.8 } });
    } catch {}
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleWhatsAppShare = (textToShare: string) => {
    const encoded = encodeURIComponent(textToShare);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleDownload = () => {
    if (!item.processedImageUrl) return;
    const link = document.createElement('a');
    link.href = item.processedImageUrl;
    link.download = `vendeusepro-${item.title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 relative my-auto max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 uppercase">
                {item.type === 'video' ? '🎬 Diaporama Vidéo' : item.type === 'image' ? '📸 Photo Studio' : '✨ Pack Complet'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">{item.title}</h3>
            <p className="text-sm font-extrabold text-rose-600">
              {item.price} {item.currency}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {item.processedImageUrl && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger HD</span>
              </button>
            )}
            <button
              onClick={() => {
                onDelete(item.id);
                onClose();
              }}
              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left: Media Preview */}
          <div>
            {item.processedImageUrl ? (
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 aspect-square flex items-center justify-center">
                <img
                  src={item.processedImageUrl}
                  alt={item.title}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : item.originalImageUrl ? (
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 aspect-square flex items-center justify-center">
                <img
                  src={item.originalImageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-slate-50 flex flex-col items-center justify-center h-full min-h-[220px]">
                <Sparkles className="w-10 h-10 text-rose-400 mb-2" />
                <p className="text-xs text-slate-500 font-medium">Contenu textuel IA</p>
              </div>
            )}

            {item.details && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <span className="font-bold text-slate-800">Détails enregistrés :</span> {item.details}
              </div>
            )}
          </div>

          {/* Right: Generated Texts & WhatsApp Sharing */}
          <div className="space-y-4">
            {item.copywriting ? (
              <>
                {/* WhatsApp Status Card */}
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      Statut WhatsApp Optimisé
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(item.copywriting!.whatsappStatus, 'wa_status')}
                        className="p-1.5 bg-white text-emerald-700 rounded-lg hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 shadow-xs"
                      >
                        {copiedKey === 'wa_status' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copier</span>
                      </button>
                      <button
                        onClick={() => handleWhatsAppShare(item.copywriting!.whatsappStatus)}
                        className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-bold flex items-center gap-1 shadow-xs"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Partager</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-medium">
                    {item.copywriting.whatsappStatus}
                  </p>
                </div>

                {/* Instagram / Facebook Post Card */}
                <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
                      <Instagram className="w-4 h-4 text-rose-600" />
                      Post Instagram & Facebook
                    </div>
                    <button
                      onClick={() => handleCopy(item.copywriting!.instagramFacebookPost, 'insta_post')}
                      className="p-1.5 bg-white text-rose-700 rounded-lg hover:bg-rose-100 text-xs font-semibold flex items-center gap-1 shadow-xs"
                    >
                      {copiedKey === 'insta_post' ? <Check className="w-3.5 h-3.5 text-rose-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copier</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-medium line-clamp-6 hover:line-clamp-none">
                    {item.copywriting.instagramFacebookPost}
                  </p>
                </div>

                {/* Voiceover script */}
                {item.copywriting.voiceoverScript && (
                  <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-indigo-900">
                        🎙️ Script Voix-Off Vidéo
                      </span>
                      <button
                        onClick={() => handleCopy(item.copywriting!.voiceoverScript, 'script')}
                        className="text-[10px] text-indigo-700 font-bold hover:underline"
                      >
                        {copiedKey === 'script' ? 'Copié !' : 'Copier'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 italic">
                      "{item.copywriting.voiceoverScript}"
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs">
                Aucun texte associé à cette image.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
