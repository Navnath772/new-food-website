import React, { useEffect, useState } from 'react';
import {
  Compass,
  FileText,
  HeartHandshake,
  Layers,
  MapPin,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Truck,
  Users,
  Utensils,
  X,
  ShieldCheck,
  Moon,
  Sun,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onOpenDonationWizard: () => void;
  onOpenSimulation: () => void;
  onOpenPresentation: () => void;
  onOpenJuryQa: () => void;
  onResetDemo: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenDonationWizard,
  onOpenSimulation,
  onOpenPresentation,
  onOpenJuryQa,
  onResetDemo,
  isDark,
  onToggleDark,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
          // open
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'create-donation',
      title: 'Create Surplus Food Donation',
      category: 'Donations',
      icon: Utensils,
      action: () => {
        onClose();
        onOpenDonationWizard();
      },
    },
    {
      id: 'donor-hub',
      title: 'Open Donor Hub & Active Expiry Timers',
      category: 'Navigation',
      icon: Layers,
      action: () => {
        onClose();
        onNavigate('donor');
      },
    },
    {
      id: 'ngo-portal',
      title: 'Open Beneficiary Shelter Portal & Needs Board',
      category: 'Navigation',
      icon: Users,
      action: () => {
        onClose();
        onNavigate('ngo');
      },
    },
    {
      id: 'courier-portal',
      title: 'Open Volunteer Courier Dispatch & Offline Pickups',
      category: 'Navigation',
      icon: Truck,
      action: () => {
        onClose();
        onNavigate('volunteer');
      },
    },
    {
      id: 'live-map',
      title: 'Open Live OpenStreetMap & Rescue Corridors',
      category: 'Navigation',
      icon: MapPin,
      action: () => {
        onClose();
        onNavigate('map');
      },
    },
    {
      id: 'command-center',
      title: 'Open Admin Command Center & System Audit Log',
      category: 'Navigation',
      icon: ShieldCheck,
      action: () => {
        onClose();
        onNavigate('admin');
      },
    },
    {
      id: 'impact-sdg',
      title: 'Open SDG 2 Zero Hunger & Climate Impact Analytics',
      category: 'Navigation',
      icon: HeartHandshake,
      action: () => {
        onClose();
        onNavigate('impact');
      },
    },
    {
      id: 'run-simulation',
      title: 'Run 15-Stage Live Rescue Mission Simulation',
      category: 'Demonstration',
      icon: Play,
      action: () => {
        onClose();
        onOpenSimulation();
      },
    },
    {
      id: 'presentation-mode',
      title: 'Open Hackathon Presentation Mode & Slide Deck',
      category: 'Demonstration',
      icon: Compass,
      action: () => {
        onClose();
        onOpenPresentation();
      },
    },
    {
      id: 'jury-qa',
      title: 'Open Jury Defense & Technical Q&A Answers',
      category: 'Demonstration',
      icon: FileText,
      action: () => {
        onClose();
        onOpenJuryQa();
      },
    },
    {
      id: 'toggle-theme',
      title: isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      category: 'Appearance',
      icon: isDark ? Sun : Moon,
      action: () => {
        onToggleDark();
        onClose();
      },
    },
    {
      id: 'reset-demo',
      title: 'Reset Demo Database to Initial State',
      category: 'System',
      icon: RotateCcw,
      action: () => {
        onClose();
        onResetDemo();
      },
    },
  ];

  const filtered = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search (e.g. Donate, Map, Courier, Simulation)..."
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold text-gray-400 bg-gray-100 dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-gray-50 dark:divide-slate-800/40">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-400">
              No matching commands found. Try typing &apos;Donate&apos;, &apos;Map&apos;, or &apos;Simulation&apos;.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 group-hover:text-emerald-600 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-gray-400">{item.category}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 group-hover:text-emerald-600">Select →</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
