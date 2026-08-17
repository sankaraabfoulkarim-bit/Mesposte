import { ClientSubscription, BoutiqueProfile, UserPlan } from '../types';

const SUBSCRIPTIONS_STORAGE_KEY = 'vendeusepro_admin_subscriptions';

// Initial sample subscriptions so the admin console has clear data immediately
const INITIAL_SUBSCRIPTIONS: ClientSubscription[] = [
  {
    id: 'sub_demo_1',
    accessCode: 'VP-START-50',
    clientName: 'Aminata Style',
    clientPhone: '+221 77 412 88 90',
    plan: 'START',
    creditsGranted: 50,
    validDays: 30,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    notes: 'Paiement Wave 5 000 FCFA reçu',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsedAt: null,
    usedCount: 0,
  },
  {
    id: 'sub_demo_2',
    accessCode: 'VP-PRO-150',
    clientName: 'Fatou Glam Dakar',
    clientPhone: '+221 78 650 33 22',
    plan: 'STANDARD',
    creditsGranted: 150,
    validDays: 60,
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    notes: 'Paiement Orange Money 12 500 FCFA',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsedAt: null,
    usedCount: 0,
  },
  {
    id: 'sub_demo_3',
    accessCode: 'VP-VIP-500',
    clientName: 'Khadija Mode & Parfums',
    clientPhone: '+225 07 88 99 00 11',
    plan: 'PREMIUM',
    creditsGranted: 500,
    validDays: 90,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    notes: 'Paiement Wave Côte d’Ivoire',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsedAt: null,
    usedCount: 0,
  },
  {
    id: 'sub_demo_4',
    accessCode: 'VIP-761278-PASS',
    clientName: 'VIP Illimité Admin / Partenaire',
    clientPhone: '+221 77 000 00 00',
    plan: 'VIP_UNLIMITED',
    creditsGranted: 9999,
    validDays: 0,
    expiresAt: null,
    status: 'active',
    notes: 'Pass VIP Illimité Permanent',
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    usedCount: 0,
  },
];

/**
 * Load all subscriptions from storage
 */
export function getStoredSubscriptions(): ClientSubscription[] {
  try {
    const raw = localStorage.getItem(SUBSCRIPTIONS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load subscriptions from localStorage', e);
  }
  // Initialize with default seeds if empty
  saveStoredSubscriptions(INITIAL_SUBSCRIPTIONS);
  return INITIAL_SUBSCRIPTIONS;
}

/**
 * Save subscriptions to storage
 */
export function saveStoredSubscriptions(subs: ClientSubscription[]): void {
  try {
    localStorage.setItem(SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(subs));
  } catch (e) {
    console.warn('Failed to save subscriptions to localStorage', e);
  }
}

/**
 * Generate a clean, readable access code
 */
export function generateAccessCode(prefix: string = 'VP', plan: UserPlan = 'STANDARD'): string {
  const cleanPrefix = prefix.trim().toUpperCase() || 'VP';
  const planTag =
    plan === 'VIP_UNLIMITED'
      ? 'VIP'
      : plan === 'PREMIUM'
      ? 'PRO'
      : plan === 'STANDARD'
      ? 'PLUS'
      : 'START';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const randomChar = chars.charAt(Math.floor(Math.random() * chars.length));
  return `${cleanPrefix}-${planTag}-${randomNum}${randomChar}`;
}

/**
 * Create and register a new client subscription
 */
export function createClientSubscription(params: {
  clientName: string;
  clientPhone: string;
  plan: UserPlan;
  creditsGranted: number;
  validDays: number;
  customCode?: string;
  notes?: string;
}): ClientSubscription {
  const current = getStoredSubscriptions();

  const code = (params.customCode?.trim().toUpperCase() ||
    generateAccessCode('VP', params.plan));

  // Check if code already exists
  const existingIndex = current.findIndex((s) => s.accessCode.toUpperCase() === code);
  if (existingIndex >= 0) {
    throw new Error(`Le code ${code} existe déjà. Veuillez en choisir un autre.`);
  }

  const now = new Date();
  let expiresAt: string | null = null;
  if (params.validDays > 0) {
    const exp = new Date(now.getTime() + params.validDays * 24 * 60 * 60 * 1000);
    expiresAt = exp.toISOString();
  }

  const newSub: ClientSubscription = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    accessCode: code,
    clientName: params.clientName.trim() || 'Cliente Vendeuse',
    clientPhone: params.clientPhone.trim() || '',
    plan: params.plan,
    creditsGranted: Math.max(1, params.creditsGranted),
    validDays: params.validDays,
    expiresAt,
    status: 'active',
    notes: params.notes?.trim() || '',
    createdAt: now.toISOString(),
    lastUsedAt: null,
    usedCount: 0,
  };

  const updated = [newSub, ...current];
  saveStoredSubscriptions(updated);
  return newSub;
}

/**
 * Update an existing subscription
 */
export function updateClientSubscription(sub: ClientSubscription): void {
  const current = getStoredSubscriptions();
  const index = current.findIndex((s) => s.id === sub.id);
  if (index >= 0) {
    current[index] = sub;
    saveStoredSubscriptions(current);
  }
}

/**
 * Delete a subscription
 */
export function deleteClientSubscription(id: string): void {
  const current = getStoredSubscriptions();
  const filtered = current.filter((s) => s.id !== id);
  saveStoredSubscriptions(filtered);
}

/**
 * Format WhatsApp confirmation message to send to the client
 */
export function formatWhatsAppMessage(sub: ClientSubscription, appUrl?: string): string {
  const siteUrl = appUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://vendeusepro.ai');
  const planLabel =
    sub.plan === 'VIP_UNLIMITED'
      ? '🌟 VIP ILLIMITÉ'
      : sub.plan === 'PREMIUM'
      ? '👑 PREMIUM (500 crédits)'
      : sub.plan === 'STANDARD'
      ? '⚡ STANDARD (150 crédits)'
      : '✨ START (50 crédits)';

  const durationLabel =
    sub.validDays > 0 ? `${sub.validDays} jours` : 'Illimitée à vie';

  return `🎉 *FÉLICITATIONS ${sub.clientName.toUpperCase()} !*

Votre abonnement *VendeusePro AI* est maintenant activé ! 🚀

🔑 *VOTRE CODE DE CONNEXION :* 
👉 *${sub.accessCode}*

📦 *Détails de votre formule :*
• Formule : ${planLabel}
• Solde crédits IA : *+${sub.creditsGranted} crédits*
• Validité : ${durationLabel}

📱 *Comment l'activer en 10 secondes ?*
1. Ouvrez l'application : ${siteUrl}
2. Cliquez sur *Connexion* ou *Mon Profil*
3. Entrez votre code *${sub.accessCode}* et validez.

Vos photos professionnelles, textes de vente et vidéos IA sont prêts à booster vos ventes sur WhatsApp et Instagram ! ✨`;
}

/**
 * Validate and redeem an access code entered by an end-user
 */
export function redeemAccessCode(
  inputCode: string,
  currentProfile: BoutiqueProfile
): {
  success: boolean;
  message: string;
  updatedProfile?: BoutiqueProfile;
  subscription?: ClientSubscription;
} {
  if (!inputCode || !inputCode.trim()) {
    return { success: false, message: 'Veuillez saisir votre code de connexion.' };
  }

  const cleaned = inputCode.trim().toUpperCase();
  const allSubs = getStoredSubscriptions();
  const subIndex = allSubs.findIndex(
    (s) => s.accessCode.trim().toUpperCase() === cleaned
  );

  if (subIndex === -1) {
    // Special master developer backdoor with the requested PIN
    if (cleaned === '761278' || cleaned === 'VP-761278' || cleaned === 'MASTER-761278') {
      const updatedProfile: BoutiqueProfile = {
        ...currentProfile,
        plan: 'VIP_UNLIMITED',
        credits: currentProfile.credits + 9999,
      };
      return {
        success: true,
        message: 'Pass Master Admin activé ! +9999 crédits et Formule VIP Illimitée débloqués.',
        updatedProfile,
      };
    }

    return {
      success: false,
      message: `Code "${cleaned}" invalide ou introuvable. Veuillez vérifier votre code ou contacter le support.`,
    };
  }

  const sub = allSubs[subIndex];

  // Check if revoked
  if (sub.status === 'revoked') {
    return {
      success: false,
      message: 'Ce code d’accès a été suspendu ou révoqué. Contactez l’administrateur.',
    };
  }

  // Check expiration if applicable
  if (sub.expiresAt && new Date(sub.expiresAt).getTime() < Date.now()) {
    sub.status = 'expired';
    allSubs[subIndex] = sub;
    saveStoredSubscriptions(allSubs);
    return {
      success: false,
      message: 'Ce code d’abonnement a expiré. Veuillez renouveler votre forfait.',
    };
  }

  // Code is valid! Update subscription record
  sub.lastUsedAt = new Date().toISOString();
  sub.usedCount = (sub.usedCount || 0) + 1;
  sub.status = 'used'; // Mark used or active
  allSubs[subIndex] = sub;
  saveStoredSubscriptions(allSubs);

  // Apply to profile
  const updatedProfile: BoutiqueProfile = {
    ...currentProfile,
    plan: sub.plan,
    credits: currentProfile.credits + sub.creditsGranted,
    name:
      currentProfile.name === 'Ma Boutique' && sub.clientName
        ? sub.clientName
        : currentProfile.name,
    phone:
      !currentProfile.phone && sub.clientPhone
        ? sub.clientPhone
        : currentProfile.phone,
  };

  return {
    success: true,
    message: `🎉 Félicitations ! Votre abonnement ${sub.plan} a été activé avec +${sub.creditsGranted} crédits !`,
    updatedProfile,
    subscription: sub,
  };
}
