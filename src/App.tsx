import React, { useState, useEffect } from 'react';
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
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAUpdateToast } from './components/PWAUpdateToast';
import { usePWA } from './hooks/usePWA';
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

  // Save profile to local storage whenever it changes
  useEffect(() => {
    saveStoredProfile(profile);
  }, [profile]);

  // Save creations whenever it changes
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
      phone,
      credits: prev.credits + 5, // bonus 5 free credits on login
    }));
    audioSynth.playSuccessChime();
  };

  // Creations Handler
  const handleSaveCreation = (newItem: CreationItem) => {
    setCreations((prev) => [newItem, ...prev]);
  };

  const handleDeleteCreation = (id: string) => {
    setCreations((prev) => prev.filter((item) => item.id !== id));
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
      />

      <CreationDetailModal
        item={selectedCreationDetail}
        onClose={() => setSelectedCreationDetail(null)}
        onDelete={handleDeleteCreation}
      />
    </div>
  );
}
export default App;

