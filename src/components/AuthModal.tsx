import React, { useState } from 'react';
import { LogIn, ShieldCheck, UserCheck, Users, Utensils, X, Lock, Mail } from 'lucide-react';
import { User, UserRole } from '../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableUsers: User[];
  currentUser: User;
  onSelectUser: (user: User) => void;
  onLoginCustom: (email: string, role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  availableUsers,
  currentUser,
  onSelectUser,
  onLoginCustom,
}) => {
  const [tab, setTab] = useState<'personas' | 'custom'>('personas');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('donor');

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onLoginCustom(email.trim(), role);
      onClose();
    }
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'donor':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200';
      case 'ngo':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200';
      case 'volunteer':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200';
      case 'admin':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <LogIn className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="text-xs font-semibold tracking-wider text-emerald-300 uppercase">
                Role-Based Authentication
              </div>
              <h2 className="text-base font-bold text-white">Sign In &amp; Persona Switcher</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-gray-100 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => setTab('personas')}
            className={`flex-1 py-3 text-center transition-colors ${
              tab === 'personas'
                ? 'border-b-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/20'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
            }`}
          >
            Instant Persona Switch (Demo)
          </button>
          <button
            onClick={() => setTab('custom')}
            className={`flex-1 py-3 text-center transition-colors ${
              tab === 'custom'
                ? 'border-b-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/20'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
            }`}
          >
            Account Credentials Login
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {tab === 'personas' ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select an authorized account to immediately enter that role&apos;s authenticated workspace:
              </p>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {availableUsers.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSelectUser(u);
                        onClose();
                      }}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isCurrent
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                          : 'border-gray-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-gray-700 dark:text-gray-200 uppercase">
                          {u.name.substring(0, 2)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center space-x-1">
                            <span>{u.name}</span>
                            {isCurrent && <span className="text-[10px] text-emerald-600 font-normal">(Active)</span>}
                          </div>
                          <div className="text-[11px] text-gray-400">{u.organization || u.address}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadge(u.role)}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. mess@college.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Target Workspace Role
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  {(['donor', 'ngo', 'volunteer', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`p-2 rounded-lg border text-center transition-colors ${
                        role === r
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                          : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {r.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors mt-2"
              >
                Sign In to Workspace
              </button>
            </form>
          )}

          {/* Demo Mode Notice */}
          <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-gray-500 dark:text-gray-400 text-center">
            <strong>Demo Data:</strong> Not connected to real NGOs or municipal systems. Passwords not required for hackathon evaluation.
          </div>
        </div>
      </div>
    </div>
  );
};
