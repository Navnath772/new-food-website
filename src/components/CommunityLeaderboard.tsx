import React, { useState } from 'react';
import { Award, Medal, ShieldCheck, Sparkles, Trophy, Users, Utensils } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  category: string;
  metricLabel: string;
  metricValue: string | number;
  badge: string;
  verified: boolean;
}

export const CommunityLeaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'donors' | 'volunteers' | 'ngos'>('donors');

  const donorData: LeaderboardEntry[] = [
    { rank: 1, name: 'ABC College Mess Administration', category: 'Educational Institution', metricLabel: 'Meals Rescued', metricValue: '3,840', badge: 'Top Institutional Partner', verified: true },
    { rank: 2, name: 'Grand Heritage Palace Banquets', category: 'Convention & Hotel', metricLabel: 'Meals Rescued', metricValue: '2,920', badge: 'Zero Waste Star', verified: true },
    { rank: 3, name: 'Annapurna Caterers & Events', category: 'Catering Service', metricLabel: 'Meals Rescued', metricValue: '1,850', badge: 'Rapid Donor', verified: true },
    { rank: 4, name: 'Hotel Pearl Executive Kitchen', category: 'Hospitality', metricLabel: 'Meals Rescued', metricValue: '1,420', badge: 'Clean Plate Partner', verified: true },
    { rank: 5, name: 'Sayaji Banquets & Diners', category: 'Banquet Hall', metricLabel: 'Meals Rescued', metricValue: '1,180', badge: 'Community Supporter', verified: true },
  ];

  const volunteerData: LeaderboardEntry[] = [
    { rank: 1, name: 'Rahul Patil', category: 'Motorcycle Courier', metricLabel: 'Completed Missions', metricValue: 34, badge: 'Rapid Responder & Food Hero', verified: true },
    { rank: 2, name: 'Pooja Kulkarni', category: 'EV Scooter', metricLabel: 'Completed Missions', metricValue: 28, badge: 'Eco Courier', verified: true },
    { rank: 3, name: 'Amit Deshmukh', category: 'Car / Small Van', metricLabel: 'Completed Missions', metricValue: 24, badge: 'Heavy Cargo Hero', verified: true },
    { rank: 4, name: 'Vikram Shinde', category: 'Bicycle Express', metricLabel: 'Completed Missions', metricValue: 19, badge: 'Zero Emission Champion', verified: true },
    { rank: 5, name: 'Sneha More', category: 'Walk & Transit', metricLabel: 'Completed Missions', metricValue: 15, badge: 'Neighborhood Angel', verified: true },
  ];

  const ngoData: LeaderboardEntry[] = [
    { rank: 1, name: 'Annapurna Community Shelter', category: 'Unhoused Food Bank', metricLabel: 'Portions Distributed', metricValue: '4,150', badge: 'Primary Urban Node', verified: true },
    { rank: 2, name: 'Shanti Balgram Orphanage', category: 'Youth Shelter', metricLabel: 'Portions Distributed', metricValue: '2,800', badge: 'Child Nutrition Anchor', verified: true },
    { rank: 3, name: 'Snehalaya Senior Care & Night Shelter', category: 'Elderly Care', metricLabel: 'Portions Distributed', metricValue: '1,960', badge: 'Vulnerable Care Leader', verified: true },
    { rank: 4, name: 'Asha Kiran Women & Children Center', category: 'Family Shelter', metricLabel: 'Portions Distributed', metricValue: '1,410', badge: 'Family Support Anchor', verified: true },
  ];

  const currentList = activeTab === 'donors' ? donorData : activeTab === 'volunteers' ? volunteerData : ngoData;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Food Rescue Champions
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-gray-500">
              Demo Leaderboard
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Celebrating outstanding institutions and civic heroes powering zero hunger across Kolhapur.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('donors')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'donors' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Donors
          </button>
          <button
            onClick={() => setActiveTab('volunteers')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'volunteers' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Couriers
          </button>
          <button
            onClick={() => setActiveTab('ngos')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'ngos' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Beneficiary Shelters
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-800 text-[10px] text-gray-400 uppercase tracking-wider">
              <th className="py-3 px-3">Rank</th>
              <th className="py-3 px-3">Participant</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3 text-right">Impact Score</th>
              <th className="py-3 px-3">Recognition Badge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
            {currentList.map((entry) => (
              <tr key={entry.name} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-3">
                  {entry.rank === 1 ? (
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                      🥇
                    </span>
                  ) : entry.rank === 2 ? (
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                      🥈
                    </span>
                  ) : entry.rank === 3 ? (
                    <span className="w-6 h-6 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                      🥉
                    </span>
                  ) : (
                    <span className="font-mono text-gray-400 font-bold px-2">#{entry.rank}</span>
                  )}
                </td>
                <td className="py-3.5 px-3 font-semibold text-gray-900 dark:text-white flex items-center space-x-1.5">
                  <span>{entry.name}</span>
                  {entry.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                </td>
                <td className="py-3.5 px-3 text-gray-500 dark:text-gray-400">{entry.category}</td>
                <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {entry.metricValue} <span className="text-[10px] text-gray-400 font-normal">{entry.metricLabel}</span>
                </td>
                <td className="py-3.5 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/40">
                    {entry.badge}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
