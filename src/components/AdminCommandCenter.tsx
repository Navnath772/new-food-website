import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  MapPin,
  PieChart,
  Radio,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
  Utensils,
  Leaf,
  FileText,
  Filter,
} from 'lucide-react';
import { AuditEvent, FoodDonation, PlatformAnalytics } from '../types/index.ts';
import { appStore } from '../services/api.ts';
import { CommunityLeaderboard } from './CommunityLeaderboard.tsx';

export const AdminCommandCenter: React.FC<{ onNavigateToMap: () => void }> = ({ onNavigateToMap }) => {
  const [analytics, setAnalytics] = useState<PlatformAnalytics>(appStore.getAnalytics());
  const [donations, setDonations] = useState<FoodDonation[]>(appStore.getDonations());
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(appStore.getAuditLogs());
  const [activeTab, setActiveTab] = useState<'FEED' | 'AUDIT' | 'ANALYTICS' | 'LEADERBOARD' | 'SYSTEM'>('FEED');
  const [kpiFilter, setKpiFilter] = useState<string>('ALL');

  useEffect(() => {
    const unsub = appStore.subscribe(() => {
      setAnalytics({ ...appStore.getAnalytics() });
      setDonations([...appStore.getDonations()]);
      setAuditLogs([...appStore.getAuditLogs()]);
    });
    return unsub;
  }, []);

  const urgentDonations = donations.filter(
    (d) => (d.urgency === 'Critical' || d.urgency === 'High') && d.status !== 'COMPLETED'
  );
  const matchedDonations = donations.filter((d) => d.status === 'MATCHED' || d.status === 'ACCEPTED');
  const inTransitDonations = donations.filter(
    (d) => d.status === 'VOLUNTEER_ASSIGNED' || d.status === 'PICKED_UP' || d.status === 'IN_TRANSIT'
  );
  const deliveredDonations = donations.filter((d) => d.status === 'COMPLETED' || d.status === 'DELIVERED');
  const expiredDonations = donations.filter((d) => d.status === 'EXPIRED');

  // Filtered donations table based on selected KPI card
  const filteredDonations = donations.filter((d) => {
    if (kpiFilter === 'ALL') return true;
    if (kpiFilter === 'URGENT') return d.urgency === 'Critical' || d.urgency === 'High';
    if (kpiFilter === 'MATCHED') return d.status === 'MATCHED' || d.status === 'ACCEPTED';
    if (kpiFilter === 'IN_TRANSIT') return d.status === 'VOLUNTEER_ASSIGNED' || d.status === 'PICKED_UP' || d.status === 'IN_TRANSIT';
    if (kpiFilter === 'DELIVERED') return d.status === 'COMPLETED' || d.status === 'DELIVERED';
    if (kpiFilter === 'EXPIRED') return d.status === 'EXPIRED';
    return true;
  });

  return (
    <div className="space-y-8 py-2">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 via-gray-950 to-emerald-950 text-white p-6 rounded-3xl border border-gray-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-300">
              Live Food Rescue Command Center
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Ecosystem Telemetry &amp; Audit Console</h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time municipal surveillance of surplus batches, cold-chain checks, and courier handshakes.
          </p>
        </div>

        <button
          onClick={onNavigateToMap}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-900/40 flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <MapPin className="w-4 h-4" />
          <span>Open Full Radar Map</span>
        </button>
      </div>

      {/* Operational KPI Cards (Click to filter table) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setKpiFilter(kpiFilter === 'ALL' ? 'ALL' : 'ALL')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            kpiFilter === 'ALL'
              ? 'bg-slate-900 text-white border-slate-700 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Total Active</div>
          <div className="text-xl sm:text-2xl font-black mt-1">{donations.length}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">All Batches</div>
        </button>

        <button
          onClick={() => setKpiFilter(kpiFilter === 'URGENT' ? 'ALL' : 'URGENT')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            kpiFilter === 'URGENT'
              ? 'bg-rose-950 text-white border-rose-700 shadow-md ring-2 ring-rose-500/20'
              : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-rose-300'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider text-rose-500">Urgent</div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {urgentDonations.length}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">&lt; 2 hrs left</div>
        </button>

        <button
          onClick={() => setKpiFilter(kpiFilter === 'MATCHED' ? 'ALL' : 'MATCHED')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            kpiFilter === 'MATCHED'
              ? 'bg-teal-950 text-white border-teal-700 shadow-md ring-2 ring-teal-500/20'
              : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-teal-300'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider text-teal-500">Matched</div>
          <div className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
            {matchedDonations.length}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Shelter Confirmed</div>
        </button>

        <button
          onClick={() => setKpiFilter(kpiFilter === 'IN_TRANSIT' ? 'ALL' : 'IN_TRANSIT')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            kpiFilter === 'IN_TRANSIT'
              ? 'bg-indigo-950 text-white border-indigo-700 shadow-md ring-2 ring-indigo-500/20'
              : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-indigo-300'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-500">In Transit</div>
          <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {inTransitDonations.length}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Couriers Moving</div>
        </button>

        <button
          onClick={() => setKpiFilter(kpiFilter === 'DELIVERED' ? 'ALL' : 'DELIVERED')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            kpiFilter === 'DELIVERED'
              ? 'bg-emerald-950 text-white border-emerald-700 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-500">Delivered</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {deliveredDonations.length}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Handshake Done</div>
        </button>

        <button
          onClick={() => setKpiFilter(kpiFilter === 'EXPIRED' ? 'ALL' : 'EXPIRED')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            kpiFilter === 'EXPIRED'
              ? 'bg-slate-800 text-white border-slate-600 shadow-md'
              : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-gray-400'
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Expired</div>
          <div className="text-xl sm:text-2xl font-black text-gray-500 mt-1">
            {expiredDonations.length}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Missed Window</div>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('FEED')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'FEED'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Live Rescue Feed
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'AUDIT'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          System Audit Log ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('LEADERBOARD')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'LEADERBOARD'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Food Rescue Champions
        </button>
        <button
          onClick={() => setActiveTab('SYSTEM')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'SYSTEM'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          System Health Monitor
        </button>
      </div>

      {/* Tab 1: Live Feed & Filtered Donations Table */}
      {activeTab === 'FEED' && (
        <div className="space-y-6">
          {kpiFilter !== 'ALL' && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                Filtered by: <strong>{kpiFilter}</strong> ({filteredDonations.length} records)
              </span>
              <button
                onClick={() => setKpiFilter('ALL')}
                className="text-emerald-600 hover:text-emerald-700 font-bold"
              >
                Clear Filter ✕
              </button>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Active Operational Ledger</h3>
              <span className="text-xs text-gray-400 font-mono">Live Sync</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-800 text-[10px] text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Donation ID</th>
                    <th className="py-3 px-4">Surplus Food</th>
                    <th className="py-3 px-4">Donor Organization</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Score™</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Courier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                  {filteredDonations.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-gray-500">#{d.id}</td>
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">{d.food_name}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{d.donor_name}</td>
                      <td className="py-3 px-4 font-mono text-gray-800 dark:text-gray-200">
                        {d.quantity} {d.unit} (~{d.estimated_meals} meals)
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                        {d.food_rescue_score || 88} / 100
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {d.assigned_volunteer_name || 'Seeking Courier'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: System Audit Log */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Immutable System Audit Trail</span>
              </h3>
              <p className="text-xs text-gray-500">
                Chronological record of every user action, AI matching event, and dual-OTP verification.
              </p>
            </div>
            <span className="text-xs text-gray-400 font-mono">{auditLogs.length} events logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-[10px] text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Actor</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3">Entity</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-[10px] text-gray-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {log.actor}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-3 px-3 text-gray-500 whitespace-nowrap">{log.entity}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Community Leaderboard */}
      {activeTab === 'LEADERBOARD' && <CommunityLeaderboard />}

      {/* Tab 4: System Health Monitor */}
      {activeTab === 'SYSTEM' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <span>Production Health Monitor</span>
              </h3>
              <p className="text-xs text-gray-500">Live operational health across core platform sub-systems.</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              All Systems Operational
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="text-gray-400 uppercase font-bold text-[10px]">Frontend App (React 19)</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">ONLINE (Port 3000)</div>
              <div className="text-[10px] text-gray-400">Vite 8 SPA + Tailwind v4</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="text-gray-400 uppercase font-bold text-[10px]">REST Backend Server</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">ONLINE (Express)</div>
              <div className="text-[10px] text-gray-400">Node v22 Core Engine</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="text-gray-400 uppercase font-bold text-[10px]">Persistent Database</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">ONLINE (JSON/SQLite Store)</div>
              <div className="text-[10px] text-gray-400">Atomic Disk Persistence</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="text-gray-400 uppercase font-bold text-[10px]">AI Matching Engine</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">ONLINE (5-Factor Normalized)</div>
              <div className="text-[10px] text-gray-400">Haversine + Compatibility</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="text-gray-400 uppercase font-bold text-[10px]">Food Safety Center</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">ONLINE (7-Point Physical)</div>
              <div className="text-[10px] text-gray-400">Temperature &amp; Window Check</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="text-gray-400 uppercase font-bold text-[10px]">Offline Service Worker</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">READY (/sw.js)</div>
              <div className="text-[10px] text-gray-400">Stale-While-Revalidate PWA</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
