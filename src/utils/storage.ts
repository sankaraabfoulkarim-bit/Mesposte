import { BoutiqueProfile, CreationItem } from '../types';

const PROFILE_STORAGE_KEY = 'vendeusepro_boutique_profile';
const CREATIONS_STORAGE_KEY = 'vendeusepro_creations_history';

export const DEFAULT_PROFILE: BoutiqueProfile = {
  name: 'Bella Chic Boutique',
  phone: '+221 77 845 22 10',
  slogan: 'L’Élégance & Le Style au Quotidien ✨',
  currency: 'FCFA',
  city: 'Dakar',
  country: 'Sénégal',
  instagramHandle: '@bellachic_boutique',
  plan: 'STANDARD',
  credits: 45,
};

export function loadBoutiqueProfile(): BoutiqueProfile {
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load profile from localStorage', e);
  }
  return DEFAULT_PROFILE;
}

export function saveBoutiqueProfile(profile: BoutiqueProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('Failed to save profile to localStorage', e);
  }
}

export function loadCreationsHistory(): CreationItem[] {
  try {
    const saved = localStorage.getItem(CREATIONS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load creations from localStorage', e);
  }
  return [];
}

export function saveCreationItem(item: CreationItem): CreationItem[] {
  const current = loadCreationsHistory();
  const updated = [item, ...current.filter((c) => c.id !== item.id)];
  try {
    localStorage.setItem(CREATIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save creation to localStorage', e);
  }
  return updated;
}

export function deleteCreationItem(id: string): CreationItem[] {
  const current = loadCreationsHistory();
  const updated = current.filter((c) => c.id !== id);
  try {
    localStorage.setItem(CREATIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to delete creation from localStorage', e);
  }
  return updated;
}

export function deductCredit(amount: number = 1): number {
  const profile = loadBoutiqueProfile();
  const updatedCredits = Math.max(0, profile.credits - amount);
  profile.credits = updatedCredits;
  saveBoutiqueProfile(profile);
  return updatedCredits;
}

export const getStoredProfile = loadBoutiqueProfile;
export const saveStoredProfile = saveBoutiqueProfile;
export const getStoredCreations = loadCreationsHistory;
export const saveStoredCreations = (creations: CreationItem[]) => {
  try {
    localStorage.setItem(CREATIONS_STORAGE_KEY, JSON.stringify(creations));
  } catch (e) {
    console.warn('Failed to save creations', e);
  }
};
