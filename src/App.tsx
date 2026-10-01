import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { DonorDashboard } from './components/DonorDashboard.tsx';
import { NgoDashboard } from './components/NgoDashboard.tsx';
import { VolunteerDashboard } from './components/VolunteerDashboard.tsx';
import { LiveMap } from './components/LiveMap.tsx';
import { AdminCommandCenter } from './components/AdminCommandCenter.tsx';
import { ImpactDashboard } from './components/ImpactDashboard.tsx';
import { DonationWizard } from './components/DonationWizard.tsx';
import { SimulationModal } from './components/SimulationModal.tsx';
import { PresentationMode } from './components/PresentationMode.tsx';
import { JuryQaModal } from './components/JuryQaModal.tsx';
import { CommandPalette } from './components/CommandPalette.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { NotificationCenterModal } from './components/NotificationCenterModal.tsx';
import { adminApi, appStore } from './services/api.ts';
import { Globe, HeartHandshake, ShieldCheck, Sparkles, Utensils } from 'lucide-react';
import { User, UserRole } from './types/index.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isDonationWizardOpen, setIsDonationWizardOpen] = useState<boolean>(false);
  const [wizardInitialData, setWizardInitialData] = useState<any>(undefined);
  const [isSimulationOpen, setIsSimulationOpen] = useState<boolean>(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState<boolean>(false);
  const [isJuryQaOpen, setIsJuryQaOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [focusedMapDonationId, setFocusedMapDonationId] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dark Mode State
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem('foodbridge_theme') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('foodbridge_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('foodbridge_theme', 'light');
    }
  }, [isDark]);

  // Global Ctrl + K / Cmd + K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenMapForDonation = (donationId: string) => {
    setFocusedMapDonationId(donationId);
    setCurrentTab('map');
  };

  const handleOpenDonationWizardWithData = (data?: any) => {
    setWizardInitialData(data);
    setIsDonationWizardOpen(true);
  };

  const handleSelectUser = (user: User) => {
    appStore.setCurrentUser(user);
    showToast(`Switched account to ${user.name} (${user.role.toUpperCase()})`);
    if (user.role === 'donor') setCurrentTab('donor');
    else if (user.role === 'ngo') setCurrentTab('ngo');
    else if (user.role === 'volunteer') setCurrentTab('volunteer');
    else if (user.role === 'admin') setCurrentTab('admin');
  };

  const handleLoginCustom = (email: string, role: UserRole) => {
    const matched = appStore.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      handleSelectUser(matched);
    } else {
      const newUser = appStore.addUser({ email, role, name: email.split('@')[0] });
      handleSelectUser(newUser);
    }
  };

  const handleResetDemo = async () => {
    if (window.confirm('Reset demo database? All donations, pickups, and logs will return to fresh hackathon state.')) {
      await adminApi.resetDemo();
      showToast('Demo database successfully restored to fresh hackathon state.');
      setCurrentTab('home');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 transition-colors">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white dark:bg-emerald-950 dark:border-emerald-600 px-5 py-3 rounded-2xl shadow-2xl border border-gray-700 flex items-center space-x-2 text-xs font-semibold animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenDonationWizard={() => handleOpenDonationWizardWithData()}
        onOpenSimulation={() => setIsSimulationOpen(true)}
        onOpenPresentation={() => setIsPresentationOpen(true)}
        onOpenJuryQa={() => setIsJuryQaOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
        isDark={isDark}
        onToggleDark={() => setIsDark((prev) => !prev)}
        onResetDemo={handleResetDemo}
      />

      {/* Dynamic Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'home' && (
          <HeroSection
            onOpenDonationWizard={() => handleOpenDonationWizardWithData()}
            onOpenSimulation={() => setIsSimulationOpen(true)}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'donor' && (
          <DonorDashboard
            onOpenDonationWizard={(data) => handleOpenDonationWizardWithData(data)}
            onOpenLiveMapForDonation={handleOpenMapForDonation}
          />
        )}

        {currentTab === 'ngo' && (
          <NgoDashboard onNavigateToMap={() => setCurrentTab('map')} />
        )}

        {currentTab === 'volunteer' && (
          <VolunteerDashboard
            onNavigateToMap={(donationId) => {
              if (donationId) setFocusedMapDonationId(donationId);
              setCurrentTab('map');
            }}
          />
        )}

        {currentTab === 'map' && (
          <LiveMap focusedDonationId={focusedMapDonationId} />
        )}

        {currentTab === 'admin' && (
          <AdminCommandCenter onNavigateToMap={() => setCurrentTab('map')} />
        )}

        {currentTab === 'impact' && <ImpactDashboard />}
      </main>

      {/* Modals & Overlays */}
      <DonationWizard
        isOpen={isDonationWizardOpen}
        initialData={wizardInitialData}
        onClose={() => {
          setIsDonationWizardOpen(false);
          setWizardInitialData(undefined);
        }}
        onSuccess={() => {
          showToast('Surplus Food Published! AI Matching Engine is allocating nearest NGO.');
          setCurrentTab('donor');
        }}
      />

      <SimulationModal
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
      />

      <PresentationMode
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        onLaunchSimulation={() => setIsSimulationOpen(true)}
      />

      <JuryQaModal
        isOpen={isJuryQaOpen}
        onClose={() => setIsJuryQaOpen(false)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab) => setCurrentTab(tab)}
        onOpenDonationWizard={() => handleOpenDonationWizardWithData()}
        onOpenSimulation={() => setIsSimulationOpen(true)}
        onOpenPresentation={() => setIsPresentationOpen(true)}
        onOpenJuryQa={() => setIsJuryQaOpen(true)}
        onResetDemo={handleResetDemo}
        isDark={isDark}
        onToggleDark={() => setIsDark((prev) => !prev)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        availableUsers={appStore.getUsers()}
        currentUser={appStore.getCurrentUser()}
        onSelectUser={handleSelectUser}
        onLoginCustom={handleLoginCustom}
      />

      <NotificationCenterModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={appStore.getNotifications()}
        onMarkRead={(id) => appStore.markNotificationAsRead(id)}
        onMarkAllRead={() => appStore.markAllNotificationsAsRead()}
        onNavigateToTab={(tab) => setCurrentTab(tab)}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 mt-16 py-10 text-xs text-gray-500 dark:text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-sm">FoodBridge AI</span>
              <p className="text-[11px] text-gray-400">
                Rescue Food. Connect Communities. Reduce Hunger. — UN SDG 2 Zero Hunger.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
            <button onClick={() => setCurrentTab('home')} className="hover:text-emerald-600">
              Home
            </button>
            <button onClick={() => setCurrentTab('donor')} className="hover:text-emerald-600">
              Donors
            </button>
            <button onClick={() => setCurrentTab('ngo')} className="hover:text-emerald-600">
              Shelters
            </button>
            <button onClick={() => setCurrentTab('volunteer')} className="hover:text-emerald-600">
              Couriers
            </button>
            <button onClick={() => setIsPresentationOpen(true)} className="hover:text-emerald-600 text-purple-600 font-semibold">
              Pitch Deck
            </button>
            <button onClick={() => setIsJuryQaOpen(true)} className="hover:text-emerald-600 text-teal-700 font-semibold">
              Jury Q&amp;A
            </button>
          </div>

          <div className="text-[10px] text-gray-400 text-center sm:text-right">
            <div>Illustrative estimates &amp; simulated rescue pipeline.</div>
            <div>Kolhapur Municipal Pilot • Built for Code4Impact</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
