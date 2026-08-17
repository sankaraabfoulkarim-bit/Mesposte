import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardHome } from './components/DashboardHome';
import { PhotoStudio } from './components/PhotoStudio';
import { CopywriterStudio } from './components/CopywriterStudio';
import { VideoStudio } from './components/VideoStudio';
import { GalleryView } from './components/GalleryView';
import { PhoneAuthModal } from './components/PhoneAuthModal';
import { BoutiqueProfileModal } from './components/BoutiqueProfileModal';
import { PricingModal } from './components/PricingModal';
import { CreationDetailModal } from './components/CreationDetailModal';
import { AdminPinModal } from './components/AdminPinModal';
import { AdminConsoleModal } from './components/AdminConsoleModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAUpdateToast } from './components/PWAUpdateToast';
import { usePWA } from './hooks/usePWA';
import { useAuth } from './context/AuthContext';
import {
  saveProfileToFirestore,
  getProfileFromFirestore,
  saveCreationToFirestore,
  deleteCreationFromFirestore,
  subscribeToUserCreations,
} from './services/firestoreSync';
import {
  BoutiqueProfile,
  CreationItem,
  DemoProduct,
  UserPlan,
} from './types';
import {
  getStoredProfile,
  saveStoredProfile,
  getStoredCreations,
  saveStoredCreations,
} from './utils/storage';
import { DEMO_PRODUCTS } from './data/presets';
import { audioSynth } from './utils/audioSynth';

export function App() {
  // Authentication hook
  const { user } = useAuth();

  // PWA state & installation hooks
  const {
    isInstallable,
    isInstalled,
    isOnline,
    isIOS,
    isUpdateAvailable,
    bannerDismissed,
    promptInstall,
    updateApp,
    dismissBanner,
  } = usePWA();

  // Navigation (with PWA shortcut support via ?tab= parameter)
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'photo' | 'copy' | 'video' | 'gallery'
  >(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as any;
      if (['dashboard', 'photo', 'copy', 'video', 'gallery'].includes(tabParam)) {
        return tabParam;
      }
    }
    return 'dashboard';
  });

  // State
  const [profile, setProfile] = useState<BoutiqueProfile>(getStoredProfile);
  const [creations, setCreations] = useState<CreationItem[]>(getStoredCreations);
  const [selectedDemoProduct, setSelectedDemoProduct] = useState<DemoProduct | null>(
    DEMO_PRODUCTS[0]
  );
  const [selectedCreationDetail, setSelectedCreationDetail] =
    useState<CreationItem | null>(null);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isAdminPinOpen, setIsAdminPinOpen] = useState(false);
  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = useState(false);

  // Sync profile with Firestore when user logs in
  useEffect(() => {
    if (!user) return;

    let isCancelled = false;
    async function syncUser() {
      if (!user) return;
      try {
        const cloudProfile = await getProfileFromFirestore(user.uid);
        if (cloudProfile && !isCancelled) {
          setProfile(cloudProfile);
        } else if (!isCancelled) {
          // Initialize user in Firestore
          const initialProfile: BoutiqueProfile = {
            ...profile,
            name: user.displayName || profile.name,
          };
          setProfile(initialProfile);
          await saveProfileToFirestore(user.uid, initialProfile);
        }
      } catch (e) {
        console.warn('Could not sync profile with Firestore:', e);
      }
    }

    syncUser();

    // Subscribe to live creations for this user
    const unsubscribe = subscribeToUserCreations(user.uid, (cloudCreations) => {
      if (!isCancelled && cloudCreations.length > 0) {
        setCreations(cloudCreations);
      }
    });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [user]);

  // Save profile to local storage whenever it changes, and to Firestore if authenticated
  useEffect(() => {
    saveStoredProfile(profile);
    if (user) {
      saveProfileToFirestore(user.uid, profile).catch((err) =>
        console.warn('Failed to update profile to Firestore:', err)
      );
    }
  }, [profile, user]);

  // Save creations to local storage
  useEffect(() => {
    saveStoredCreations(creations);
  }, [creations]);

  // Credit Handlers
  const handleDeductCredit = (amount: number = 1) => {
    setProfile((prev) => {
      const nextCredits = Math.max(0, prev.credits - amount);
      return { ...prev, credits: nextCredits };
    });
  };

  const handleAddCredits = (amount: number) => {
    setProfile((prev) => ({
      ...prev,
      credits: prev.credits + amount,
    }));
    audioSynth.playSuccessChime();
  };

  const handleUpgradePlan = (plan: UserPlan) => {
    let extraCredits = 0;
    if (plan === 'STANDARD') extraCredits = 50;
    if (plan === 'PREMIUM') extraCredits = 150;
    setProfile((prev) => ({
      ...prev,
      plan,
      credits: prev.credits + extraCredits,
    }));
    audioSynth.playSuccessChime();
  };

  // Auth Handler
  const handleAuthSuccess = (phone: string) => {
    setProfile((prev) => ({
      ...prev,
      phone: phone || prev.phone,
      credits: prev.credits + 5, // bonus 5 free credits on login
    }));
    audioSynth.playSuccessChime();
  };

  // Creations Handler
  const handleSaveCreation = (newItem: CreationItem) => {
    setCreations((prev) => [newItem, ...prev]);
    if (user) {
      saveCreationToFirestore(user.uid, newItem).catch((err) =>
        console.warn('Failed to sync creation to Firestore:', err)
      );
    }
  };

  const handleDeleteCreation = (id: string) => {
    setCreations((prev) => prev.filter((item) => item.id !== id));
    if (user) {
      deleteCreationFromFirestore(user.uid, id).catch((err) =>
        console.warn('Failed to delete creation from Firestore:', err)
      );
    }
  };

  // Demo Product Selection
  const handleSelectDemoProduct = (
    demo: DemoProduct,
    targetTab: 'photo' | 'copy' | 'video' = 'photo'
  ) => {
    setSelectedDemoProduct(demo);
    setActiveTab(targetTab);
  };


  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans flex flex-col selection:bg-rose-500 selection:text-white pb-16 md:pb-0">
      {/* PWA Install Banner */}
      <PWAInstallBanner
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isIOS={isIOS}
        bannerDismissed={bannerDismissed}
        onPromptInstall={promptInstall}
        onDismiss={dismissBanner}
      />

      {/* Top Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab)}
        profile={profile}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenAdminPin={() => setIsAdminPinOpen(true)}
        onPromptInstall={promptInstall}
        isInstallable={isInstallable}
        isIOS={isIOS}
        isInstalled={isInstalled}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
        {activeTab === 'dashboard' && (
          <DashboardHome
            profile={profile}
            creations={creations}
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectDemoProduct={handleSelectDemoProduct}
            onOpenPricing={() => setIsPricingOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenCreationDetail={(item) => setSelectedCreationDetail(item)}
          />
        )}

        {activeTab === 'photo' && (
          <PhotoStudio
            profile={profile}
            onSaveCreation={handleSaveCreation}
            onDeductCredit={handleDeductCredit}
            onOpenPricing={() => setIsPricingOpen(true)}
            initialDemoProduct={selectedDemoProduct}
          />
        )}

        {activeTab === 'copy' && (
          <CopywriterStudio
            profile={profile}
            onSaveCreation={handleSaveCreation}
            onDeductCredit={handleDeductCredit}
            onOpenPricing={() => setIsPricingOpen(true)}
            initialDemoProduct={selectedDemoProduct}
          />
        )}

        {activeTab === 'video' && (
          <VideoStudio
            profile={profile}
            onSaveCreation={handleSaveCreation}
            onDeductCredit={handleDeductCredit}
            onOpenPricing={() => setIsPricingOpen(true)}
            initialDemoProduct={selectedDemoProduct}
          />
        )}

        {activeTab === 'gallery' && (
          <GalleryView
            creations={creations}
            onOpenDetail={(item) => setSelectedCreationDetail(item)}
            onDelete={handleDeleteCreation}
            onNavigateCreate={(tab) => setActiveTab(tab)}
          />
        )}
      </main>

      {/* PWA Offline and Update Toasts */}
      <OfflineIndicator isOnline={isOnline} />
      <PWAUpdateToast
        isUpdateAvailable={isUpdateAvailable}
        onUpdate={updateApp}
      />

      {/* Modals */}
      <PhoneAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        currentProfile={profile}
        onProfileUpdate={(updated) => setProfile(updated)}
      />

      <BoutiqueProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={(updated) => setProfile(updated)}
        onPromptInstall={promptInstall}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isIOS={isIOS}
      />

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        profile={profile}
        onAddCredits={handleAddCredits}
        onUpgradePlan={handleUpgradePlan}
        onProfileUpdate={(updated) => setProfile(updated)}
      />

      <CreationDetailModal
        item={selectedCreationDetail}
        onClose={() => setSelectedCreationDetail(null)}
        onDelete={handleDeleteCreation}
      />

      {/* Secret Super Admin Console & Security PIN Modals */}
      <AdminPinModal
        isOpen={isAdminPinOpen}
        onClose={() => setIsAdminPinOpen(false)}
        onSuccess={() => {
          setIsAdminPinOpen(false);
          setIsAdminConsoleOpen(true);
        }}
      />

      <AdminConsoleModal
        isOpen={isAdminConsoleOpen}
        onClose={() => setIsAdminConsoleOpen(false)}
        currentProfile={profile}
        onProfileUpdate={(updated) => setProfile(updated)}
      />
    </div>
  );
}
export default App;

