import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { BoutiqueProfile, CreationItem } from '../types';

/**
 * Save / Update user's boutique profile in Firestore
 */
export async function saveProfileToFirestore(
  userId: string,
  profile: BoutiqueProfile
): Promise<void> {
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        userId,
        name: profile.name || 'Ma Boutique',
        phone: profile.phone || '',
        slogan: profile.slogan || '',
        currency: profile.currency || 'FCFA',
        city: profile.city || '',
        country: profile.country || '',
        instagramHandle: profile.instagramHandle || '',
        facebookPage: profile.facebookPage || '',
        plan: profile.plan || 'START',
        credits: typeof profile.credits === 'number' ? profile.credits : 50,
        logoUrl: profile.logoUrl || '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Get user profile from Firestore
 */
export async function getProfileFromFirestore(
  userId: string
): Promise<BoutiqueProfile | null> {
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        name: data.name || 'Ma Boutique',
        phone: data.phone || '',
        slogan: data.slogan || '',
        currency: data.currency || 'FCFA',
        city: data.city || '',
        country: data.country || '',
        instagramHandle: data.instagramHandle || '',
        facebookPage: data.facebookPage || '',
        plan: data.plan || 'START',
        credits: typeof data.credits === 'number' ? data.credits : 50,
        logoUrl: data.logoUrl || '',
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Save a Creation item to user's subcollection
 */
export async function saveCreationToFirestore(
  userId: string,
  item: CreationItem
): Promise<void> {
  const path = `users/${userId}/creations/${item.id}`;
  try {
    const creationDocRef = doc(db, 'users', userId, 'creations', item.id);
    await setDoc(
      creationDocRef,
      {
        id: item.id,
        userId,
        title: item.title || 'Produit',
        price: item.price || '',
        currency: item.currency || 'FCFA',
        details: item.details || '',
        tone: item.tone || 'friendly',
        type: item.type || 'image',
        originalImageUrl: item.originalImageUrl || '',
        processedImageUrl: item.processedImageUrl || '',
        studioPresetId: item.studioPresetId || '',
        badgeText: item.badgeText || '',
        copywriting: item.copywriting || null,
        videoDuration: item.videoDuration || 0,
        musicTrackId: item.musicTrackId || '',
        voiceId: item.voiceId || '',
        isFavorite: Boolean(item.isFavorite),
        createdAt: item.createdAt || new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a Creation item from Firestore
 */
export async function deleteCreationFromFirestore(
  userId: string,
  creationId: string
): Promise<void> {
  const path = `users/${userId}/creations/${creationId}`;
  try {
    const creationDocRef = doc(db, 'users', userId, 'creations', creationId);
    await deleteDoc(creationDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Subscribe to user's creations live updates
 */
export function subscribeToUserCreations(
  userId: string,
  onUpdate: (items: CreationItem[]) => void
): () => void {
  const path = `users/${userId}/creations`;
  const creationsRef = collection(db, 'users', userId, 'creations');
  const q = query(creationsRef, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const items: CreationItem[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          id: d.id || docSnap.id,
          title: d.title || 'Sans titre',
          price: d.price || '',
          currency: d.currency || 'FCFA',
          details: d.details || '',
          tone: d.tone || 'friendly',
          type: d.type || 'image',
          originalImageUrl: d.originalImageUrl || undefined,
          processedImageUrl: d.processedImageUrl || undefined,
          studioPresetId: d.studioPresetId || undefined,
          badgeText: d.badgeText || undefined,
          copywriting: d.copywriting || undefined,
          videoDuration: d.videoDuration || undefined,
          musicTrackId: d.musicTrackId || undefined,
          voiceId: d.voiceId || undefined,
          isFavorite: d.isFavorite || false,
          createdAt: d.createdAt || new Date().toISOString(),
        });
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );

  return unsubscribe;
}
