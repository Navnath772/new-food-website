import React, { useState } from 'react';
import {
  Bell,
  HeartHandshake,
  MapPin,
  PlayCircle,
  Presentation,
  HelpCircle,
  PlusCircle,
  UserCheck,
  ChevronDown,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCheck,
  Moon,
  Sun,
  Search,
  Command,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { User, UserRole } from '../types/index.ts';
import { adminApi, appStore } from '../services/api.ts';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenDonationWizard: () => void;
  onOpenSimulation: () => void;
  onOpenPresentation: () => void;
  onOpenJuryQa: () => void;
  onOpenCommandPalette: () => void;
  onOpenAuthModal: () => void;
  onOpenNotificationModal: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  onResetDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenDonationWizard,
  onOpenSimulation,
  onOpenPresentation,
  onOpenJuryQa,
  onOpenCommandPalette,
  onOpenAuthModal,
  onOpenNotificationModal,
  isDark,
  onToggleDark,
  onResetDemo,
}) => {
  const currentUser = appStore.getCurrentUser();
  const notifications = appStore.getNotifications();
  const unreadNotifs = notifications.filter((n) => !n.read_status);
  const { isOnline, toggleSimulatedOffline } = useOnlineStatus();

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'donor':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
      case 'ngo':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300';
      case 'volunteer':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-emerald-100 dark:border-slate-800 shadow-2xs transition-colors">
      {/* Demo Mode Notice Top Bar */}
      <div className="bg-emerald-900 text-emerald-100 text-[10px] sm:text-[11px] py-1 px-4 text-center flex items-center justify-center space-x-2">
        <span className="font-bold uppercase tracking-wider bg-emerald-700/60 px-2 py-0.2 rounded-full">
          Demo Mode
        </span>
        <span>Demo Data — Not connected to real NGOs or municipal systems. Built for Code4Impact Hackathon.</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onSelectTab('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-emerald-950 dark:text-white tracking-tight">
                  FoodBridge AI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  SDG 2
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 hidden sm:block">
                Smart Surplus Food Redistribution
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => onSelectTab('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'home'
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onSelectTab('donor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'donor'
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              Donor Hub
            </button>
            <button
              onClick={() => onSelectTab('ngo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'ngo'
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              Shelter Portal
            </button>
            <button
              onClick={() => onSelectTab('volunteer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'volunteer'
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              Courier Network
            </button>
            <button
              onClick={() => onSelectTab('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 ${
                currentTab === 'map'
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Live Map</span>
            </button>
            <button
              onClick={() => onSelectTab('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'admin'
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              Command Center
            </button>
            <button
              onClick={() => onSelectTab('impact')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'impact'
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              Impact
            </button>
          </nav>

          {/* Action CTAs, Modals & User Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Online / Offline Simulation Toggle Button per Prompt #5 */}
            <button
              onClick={toggleSimulatedOffline}
              className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all shadow-2xs ${
                isOnline
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
              }`}
              title={
                isOnline
                  ? 'Application is ONLINE with Service Worker caching active. Click to test Offline development mode.'
                  : 'Application is running in OFFLINE mode (cached data active). Click to reconnect.'
              }
            >
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-bold">Offline Mode</span>
                </>
              )}
            </button>

            {/* Command Palette Trigger */}
            <button
              onClick={onOpenCommandPalette}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors hidden sm:flex items-center space-x-1"
              title="Command Palette (Ctrl + K)"
            >
              <Search className="w-4 h-4" />
              <kbd className="text-[10px] font-mono px-1 py-0.5 rounded bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-400">
                ⌘K
              </kbd>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDark}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotificationModal}
              className="relative p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-emerald-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {/* Simulation button */}
            <button
              onClick={onOpenSimulation}
              className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-100 text-xs font-semibold transition-all"
              title="Run 15-step end-to-end food rescue simulation"
            >
              <PlayCircle className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
              <span>Simulation</span>
            </button>

            {/* Presentation button */}
            <button
              onClick={onOpenPresentation}
              className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-xs font-semibold transition-all"
              title="Pitch Deck Presentation Mode for Hackathon Jury"
            >
              <Presentation className="w-3.5 h-3.5 text-purple-600" />
              <span>Pitch Deck</span>
            </button>

            {/* Jury Q&A */}
            <button
              onClick={onOpenJuryQa}
              className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 text-xs font-semibold transition-all"
              title="Jury Q&A Responses"
            >
              <HelpCircle className="w-3.5 h-3.5 text-gray-500" />
              <span>Jury Q&amp;A</span>
            </button>

            {/* User Profile / Persona Switcher Button */}
            <button
              onClick={onOpenAuthModal}
              className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-emerald-400 bg-slate-50 dark:bg-slate-800 text-xs transition-colors"
              title="Switch Role or Account"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] uppercase">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <span className="font-bold text-gray-900 dark:text-white block leading-tight max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded border ${getRoleBadgeColor(currentUser.role)}`}>
                  {currentUser.role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {/* Donate CTA button */}
            <button
              onClick={onOpenDonationWizard}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Donate</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
