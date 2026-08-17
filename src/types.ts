export type ToneType = 'urgent' | 'chic' | 'friendly' | 'storytelling' | 'whatsapp';

export type CurrencyType = 'FCFA' | 'EUR' | 'USD' | 'GNF' | 'NGN' | 'CDF' | 'MAD';

export type UserPlan = 'START' | 'STANDARD' | 'PREMIUM';

export interface BoutiqueProfile {
  name: string;
  phone: string;
  slogan: string;
  currency: CurrencyType;
  logoUrl?: string;
  city: string;
  country: string;
  instagramHandle?: string;
  facebookPage?: string;
  plan: UserPlan;
  credits: number;
}

export interface CopywritingResult {
  whatsappStatus: string;
  whatsappDirectMessage: string;
  instagramFacebookPost: string;
  shortCatchphrase: string;
  urgencyHook: string;
  benefitsList: string[];
  voiceoverScript: string;
}

export interface StudioBackgroundPreset {
  id: string;
  name: string;
  category: 'Luxe' | 'Moderne' | 'Pastel' | 'Nature' | 'Minimaliste' | 'Podium' | 'Boutique';
  description: string;
  gradient: string;
  accentColor: string;
  decorType: 'marble' | 'wood' | 'neon' | 'velvet' | 'botanical' | 'gradient' | 'podium' | 'warm_sun';
  badgeStyle: 'gold' | 'neon' | 'dark' | 'rose' | 'emerald';
}

export interface MusicTrack {
  id: string;
  title: string;
  genre: 'Afro Chill' | 'Commercial Hype' | 'Luxury Lounge' | 'Acoustic Warmth' | 'Upbeat Pop';
  duration: number;
  tempo: 'Lent' | 'Moyen' | 'Dynamique';
  audioWaveSeed: number;
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'Féminine' | 'Masculine';
  style: string;
  geminiVoice: string;
  lang: string;
}

export interface CreationItem {
  id: string;
  title: string;
  price: string;
  currency: CurrencyType;
  details: string;
  tone: ToneType;
  type: 'image' | 'video' | 'copy' | 'all-in-one';
  originalImageUrl?: string;
  processedImageUrl?: string;
  studioPresetId?: string;
  badgeText?: string;
  copywriting?: CopywritingResult;
  videoDuration?: number;
  musicTrackId?: string;
  voiceId?: string;
  createdAt: string;
  isFavorite?: boolean;
}

export interface DemoProduct {
  id: string;
  name: string;
  category: string;
  price: string;
  currency: CurrencyType;
  details: string;
  imageUrl: string;
  suggestedTone: ToneType;
  suggestedBackground: string;
}

export interface CreditPackage {
  id: string;
  credits: number;
  priceFCFA: number;
  priceEUR: number;
  popular?: boolean;
  bonus?: string;
  description: string;
}

export type PaymentMethod = 'orange_money' | 'mtn_momo' | 'wave' | 'moov' | 'card';
