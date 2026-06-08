import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Grid, Compass, Lock, Calendar, Send, ArrowUpRight, Award } from 'lucide-react';
import { User, Gem } from '../types';
import { motion } from 'motion/react';

interface ProfileDashboardProps {
  user: User | null;
  gems: Gem[];
  onToggleSave: (id: string) => Promise<boolean>;
}

export default function ProfileDashboard({
  user,
  gems,
  onToggleSave
}: ProfileDashboardProps) {
  const [activeTab, setActiveTab] = useState<'saved' | 'submissions'>('saved');
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="w-full min-h-[calc(100vh-64px)] mt-16 bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Compass className="w-10 h-10 text-slate-300 animate-spin mx-auto" />
          <p className="text-slate-400 font-semibold text-xs">Accessing profile stats...</p>
        </div>
      </div>
    );
  }

  // Filter gems created by user
  const submittedGems = gems.filter((g: any) => {
    if (typeof g.submittedBy === 'object') {
      return g.submittedBy._id === user._id || g.submittedBy.name === user.name;
    }
    return g.submittedBy === user._id;
  });

  // Filter saved places
  const savedGems = gems.filter(g => 
    user.savedPlaces && user.savedPlaces.some((saved: any) => {
      if (!saved) return false;
      const savedId = typeof saved === 'object' && saved._id ? saved._id.toString() : saved.toString();
      return savedId === g._id.toString();
    })
  );

  // Determine which badges are active versus locked
  const badgeDefinitions = [
    { name: 'First Discovery', desc: 'Nominated your very first verified location.', icon: '🏅', color: 'from-amber-400 to-yellow-500' },
    { name: 'Reviewer Pro', desc: 'Contribute 5+ community reviews.', icon: '⚡', color: 'from-sky-400 to-blue-500' },
    { name: 'Local Guide', desc: 'Vetted 10+ local study spaces and cafes.', icon: '🧭', color: 'from-emerald-400 to-teal-500' },
    { name: 'Master Explorer', desc: 'Milestone: Contribute 20+ neighborhood gems.', icon: '🔥', color: 'from-rose-400 to-pink-500', requirement: 20 },
    { name: 'Local Legend', desc: 'The absolute pinnacle of neighborhood knowledge. 30+ gems.', icon: '👑', color: 'from-purple-400 to-indigo-500', requirement: 30 }
  ];

  // SVG Coordinates calculation for our monthly contributions chart line graph
  const chartPoints = [
    { x: 40, y: 140, count: 2, label: 'Jan' },
    { x: 120, y: 130, count: 3, label: 'Feb' },
    { x: 200, y: 110, count: 5, label: 'Mar' },
    { x: 280, y: 120, count: 4, label: 'Apr' },
    { x: 360, y: 80, count: 8, label: 'May' },
    { x: 440, y: 30, count: 12, label: 'Jun' }
  ];

  // Build beautiful SVG path coordinates
  const svgLinePath = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const svgAreaPath = `${svgLinePath} L 440 180 L 40 180 Z`;

  // Progress metrics calculation for level progress status
  const currentCount = user.contributionsCount;
  const nextLevelMilestone = Math.ceil(currentCount / 1.2) * 1.2;
  const prevLevelMilestone = Math.max(0, nextLevelMilestone - 5);
  const progressPercent = Math.min(100, Math.max(10, ((currentCount - prevLevelMilestone) / (nextLevelMilestone - prevLevelMilestone)) * 100));

  return (
    <div className="w-full min-h-[calc(100vh-64px)] mt-16 bg-slate-50 dark:bg-slate-950 py-12 px-6 md:px-16 select-none transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Profile dashboard header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[24px] p-8 md:p-12 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-8 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[#10B981] text-white flex items-center justify-center font-extrabold text-2xl shadow-xl shadow-emerald-500/20">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h1 className="font-sans text-2xl md:text-3xl font-bold text-[#0F172A] dark:text-white tracking-tight flex items-center justify-center sm:justify-start gap-2.5">
                {user.name} 
                <span className="text-[10px] font-bold text-[#10B981] bg-emerald-50 dark:bg-emerald-950/45 px-2.5 py-1 rounded-full uppercase leading-none">Local Explorer</span>
              </h1>
              <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-400 dark:text-slate-505 font-semibold">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Member since June 2026</span>
                <span className="hidden sm:inline w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full"></span>
                <span className="text-[#10B981]">Explorer Level {user.explorerLevel}</span>
              </div>
            </div>
          </div>

          {/* Level progression bar metrics */}
          <div className="w-full md:w-80 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 dark:text-slate-505 uppercase">
              <span>Level Progress</span>
              <span className="text-slate-700 dark:text-slate-305">Lvl {user.explorerLevel} ➔ {user.explorerLevel + 1}</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden p-0.5">
              <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold leading-none text-right">
              {currentCount} Submissions
            </p>
          </div>
        </div>

        {/* Stats segment + Contributions chart row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Boxes Left Panel */}
          <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/45 text-emerald-500 dark:text-emerald-400 rounded-2xl flex items-center justify-center font-bold text-xl">
                {user.contributionsCount}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Submissions</p>
                <p className="font-sans text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">Places Vetted</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-sky-50 dark:bg-sky-950/45 text-sky-500 dark:text-sky-450 rounded-2xl flex items-center justify-center font-bold text-xl">
                {savedGems.length}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Bookmarks</p>
                <p className="font-sans text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">Saved Spots</p>
              </div>
            </div>

            <div className="col-span-2 lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/45 text-amber-500 dark:text-amber-400 rounded-2xl flex items-center justify-center font-bold text-xl">
                {user.contributionsCount * 50}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Explorer Score</p>
                <p className="font-sans text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">Points Earned</p>
              </div>
            </div>
          </div>

          {/* SVG linear contributions stats chart right panel */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6.5 flex flex-col justify-between transition-colors duration-300">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-450 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/45 px-2 py-0.5 rounded">Contribution Stats</span>
                <h3 className="font-sans text-base font-extrabold text-slate-800 dark:text-white mt-1 select-none">Discovery Trend</h3>
              </div>
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-3 py-1 rounded-xl">2026 Log scale</span>
            </div>

            <div className="w-full h-44 relative bg-slate-50/50 dark:bg-slate-955/40 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
              <svg className="w-full h-full" viewBox="0 0 480 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <line x1="40" y1="30" x2="440" y2="30" stroke="currentColor" className="text-slate-100 dark:text-slate-800/40" strokeWidth="1" />
                <line x1="40" y1="80" x2="440" y2="80" stroke="currentColor" className="text-slate-100 dark:text-slate-800/40" strokeWidth="1" />
                <line x1="40" y1="130" x2="440" y2="130" stroke="currentColor" className="text-slate-100 dark:text-slate-800/40" strokeWidth="1" />

                <path d={svgAreaPath} fill="url(#chartGradient)" />
                <path d={svgLinePath} fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                {chartPoints.map((pt, i) => (
                  <g key={i} className="group cursor-pointer">
                    <circle cx={pt.x} cy={pt.y} r="5" className="fill-white dark:fill-slate-900 stroke-emerald-500 stroke-[3]" />
                    <circle cx={pt.x} cy={pt.y} r="8" className="fill-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <text x={pt.x} y={pt.y - 12} className="text-[10px] font-extrabold fill-slate-800 dark:fill-slate-200 text-anchor-middle" textAnchor="middle">{pt.count}</text>
                  </g>
                ))}
              </svg>

              <div className="absolute bottom-2 left-10 right-10 flex justify-between text-[9px] text-slate-400 dark:text-slate-500 font-extrabold">
                {chartPoints.map((p, i) => <span key={i}>{p.label}</span>)}
              </div>
            </div>
          </div>
        </div>

        {/* Gamified Achievements Showcase */}
        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 md:p-12 transition-colors duration-300">
          <div className="mb-8">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-450 tracking-widest uppercase bg-emerald-100/50 dark:bg-emerald-950/45 px-3 py-1.5 rounded-full">Gamification Badges</span>
            <h2 className="font-sans text-2xl font-extrabold text-slate-800 dark:text-white mt-4 tracking-tight">Active Achievements</h2>
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-xs mt-1">Unlock superior badges by continuing to map local off-the-radar venues.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {badgeDefinitions.map((bg, index) => {
              const isUnlocked = user.badges.includes(bg.name);

              return (
                <div
                  key={index}
                  className={`relative p-6 rounded-3xl border text-center flex flex-col items-center justify-between transition-all ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-slate-100 dark:border-slate-800 shadow-md hover:shadow-xl'
                      : 'bg-slate-100/30 dark:bg-slate-950/15 border-slate-200/20 dark:border-slate-800/10 opacity-60'
                  }`}
                >
                  <div className="space-y-4">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${isUnlocked ? bg.color : 'from-slate-200 dark:from-slate-800 to-slate-300 dark:to-slate-900'} flex items-center justify-center text-2xl shadow-inner relative`}>
                      <span>{isUnlocked ? bg.icon : '🔒'}</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-sans text-sm font-extrabold text-slate-800 dark:text-white">{bg.name}</h4>
                      <p className="font-sans text-[11px] text-slate-400 dark:text-slate-450 font-semibold leading-relaxed">
                        {bg.desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 w-full">
                    {isUnlocked ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/45 border border-emerald-100/50 dark:border-emerald-850/45 px-3 py-1 rounded-full uppercase tracking-wider block">
                        UNLOCKED
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-950 px-3 py-1 rounded-full uppercase tracking-wider block flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" /> Lock {bg.requirement} gems
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tab Selector lists saved and vetted submissions */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-6">
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-4 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'saved'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-400 dark:text-slate-505 hover:text-slate-600 dark:hover:text-slate-400'
              }`}
            >
              <Bookmark className="w-4 h-4" /> Bookmarked Gems ({savedGems.length})
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`pb-4 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'submissions'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-400 dark:text-slate-505 hover:text-slate-600 dark:hover:text-slate-400'
              }`}
            >
              <Grid className="w-4 h-4" /> My Vetted Submissions ({submittedGems.length})
            </button>
          </div>

          {/* Tab content grids */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeTab === 'saved' ? (
              savedGems.length > 0 ? (
                savedGems.map((gem) => (
                  <div
                    key={gem._id}
                    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="relative h-44 bg-slate-50 dark:bg-slate-950">
                      <img src={gem.images[0]} alt={gem.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                      <span className="absolute bottom-3 left-3 text-[10px] font-extrabold text-white bg-emerald-500 px-2.5 py-1 rounded-full shadow-md">
                        {gem.hiddenGemScore} Gem Score
                      </span>
                    </div>
                    <div className="p-5 space-y-3">
                      <div>
                        <h4 className="font-sans text-sm font-extrabold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">{gem.title}</h4>
                        <span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/45 px-2 py-0.5 rounded mt-1.5 inline-block uppercase tracking-wider">{gem.category}</span>
                      </div>
                      <p className="font-sans text-[11px] text-slate-400 dark:text-slate-550 leading-relaxed line-clamp-2">
                        {gem.description}
                      </p>
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <button
                          onClick={() => onToggleSave(gem._id)}
                          className="text-[10px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Bookmark className="w-3.5 h-3.5 fill-rose-500" /> Bookmark saved
                        </button>
                        <button
                          onClick={() => navigate('/map')}
                          className="text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-500 flex items-center gap-1 cursor-pointer"
                        >
                          Open Map <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
                  <Bookmark className="w-8 h-8 text-slate-200 dark:text-slate-800 mx-auto" />
                  <p className="text-slate-400 dark:text-slate-400 text-xs font-semibold">No bookmarked locations saved yet.</p>
                  <button 
                    onClick={() => navigate('/map')}
                    className="px-6 py-2.5 bg-slate-900 dark:bg-slate-850 hover:dark:bg-slate-800 text-white rounded-xl font-bold text-[11px] hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Open Interactive map
                  </button>
                </div>
              )
            ) : (
              submittedGems.length > 0 ? (
                submittedGems.map((gem) => (
                  <div
                    key={gem._id}
                    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="relative h-44 bg-slate-50 dark:bg-slate-950">
                      <img src={gem.images[0]} alt={gem.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                      <span className="absolute bottom-3 left-3 text-[10px] font-extrabold text-white bg-emerald-500 px-2.5 py-1 rounded-full shadow-md">
                        {gem.hiddenGemScore} Gem Score
                      </span>
                    </div>
                    <div className="p-5 space-y-3">
                      <div>
                        <h4 className="font-sans text-sm font-extrabold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">{gem.title}</h4>
                        <span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/45 px-2 py-0.5 rounded mt-1.5 inline-block uppercase tracking-wider">{gem.category}</span>
                      </div>
                      <p className="font-sans text-[11px] text-slate-400 dark:text-slate-550 leading-relaxed line-clamp-2">
                        {gem.description}
                      </p>
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase">
                        <span>VETTED STATUS</span>
                        <span className="flex items-center gap-1 text-emerald-500 font-black"><Send className="w-3.5 h-3.5" /> PUBLISHED</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 border-dashed">
                  <Send className="w-8 h-8 text-slate-200 dark:text-slate-800 mx-auto" />
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold">You haven't contributed any geographic listings yet.</p>
                  <button 
                    onClick={() => navigate('/add')}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-[11px] shadow-lg transition-all cursor-pointer animate-pulse"
                  >
                    Submit 1st Location
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
