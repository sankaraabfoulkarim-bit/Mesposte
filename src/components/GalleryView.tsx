import React, { useState } from 'react';
import {
  FolderHeart,
  Search,
  Filter,
  Camera,
  PenTool,
  Video,
  Sparkles,
  Download,
  Share2,
  Trash2,
  Calendar,
  MessageCircle,
} from 'lucide-react';
import { CreationItem } from '../types';

interface GalleryViewProps {
  creations: CreationItem[];
  onOpenDetail: (item: CreationItem) => void;
  onDelete: (id: string) => void;
  onNavigateCreate: (tab: 'photo' | 'copy' | 'video') => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  creations,
  onOpenDetail,
  onDelete,
  onNavigateCreate,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'image' | 'copy' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = creations.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDetails = item.details?.toLowerCase().includes(q);
      const matchPrice = item.price.toLowerCase().includes(q);
      return matchTitle || matchDetails || matchPrice;
    }
    return true;
  });

  const handleDownload = (e: React.MouseEvent, item: CreationItem) => {
    e.stopPropagation();
    if (!item.processedImageUrl) return;
    const link = document.createElement('a');
    link.href = item.processedImageUrl;
    link.download = `vendeusepro-${item.title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    link.click();
  };

  const handleWhatsAppShare = (e: React.MouseEvent, item: CreationItem) => {
    e.stopPropagation();
    let text = `🛍️ *${item.title}*\n💰 *Prix :* ${item.price} ${item.currency}`;
    if (item.copywriting?.whatsappStatus) {
      text = item.copywriting.whatsappStatus;
    }
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs">
            <FolderHeart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Mes Créations & Historique
            </h1>
            <p className="text-xs text-slate-500">
              Retrouvez l'ensemble de vos visuels, textes IA et vidéos prêts à être rediffusés
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tous ({creations.length})
          </button>
          <button
            onClick={() => setFilterType('image')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              filterType === 'image' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📸 Photos
          </button>
          <button
            onClick={() => setFilterType('copy')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              filterType === 'copy' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✍️ Textes
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              filterType === 'video' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎬 Vidéos
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher par nom de produit, prix ou détail..."
          className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500 shadow-xs"
        />
      </div>

      {/* Grid of Creations */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenDetail(item)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-rose-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              {/* Media Header */}
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
                  <div className="p-6 text-center text-slate-400">
                    <PenTool className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
                    <p className="text-xs font-semibold">Texte Vendeur IA</p>
                  </div>
                )}

                {/* Type Badge */}
                <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                  {item.type === 'video' ? '🎬 Vidéo' : item.type === 'image' ? '📸 Photo' : '✍️ Texte'}
                </span>

                {/* Hover Quick Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => handleWhatsAppShare(e, item)}
                    className="p-2.5 bg-emerald-600 text-white rounded-xl hover:scale-110 transition-transform shadow-md"
                    title="Partager sur WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                  </button>
                  {item.processedImageUrl && (
                    <button
                      onClick={(e) => handleDownload(e, item)}
                      className="p-2.5 bg-white text-slate-800 rounded-xl hover:scale-110 transition-transform shadow-md"
                      title="Télécharger HD"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Meta details */}
              <div className="p-3.5 space-y-1 bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 truncate">
                    {item.title}
                  </h3>
                  <span className="text-xs font-black text-rose-600 shrink-0 ml-2">
                    {item.price} {item.currency}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
          <FolderHeart className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Aucune création trouvée
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Vous n'avez pas encore d'éléments enregistrés correspondant à ces critères.
            </p>
          </div>

          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => onNavigateCreate('photo')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
            >
              Créer une Photo Studio
            </button>
            <button
              onClick={() => onNavigateCreate('copy')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
            >
              Rédiger un Texte IA
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
