import React, { useState } from 'react';
import { Search, Compass, Shield, Award, GraduationCap, Volume2, ArrowUpRight, ArrowRight, Share2, Globe, Heart, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onSearch: (searchQuery: string, category: string) => void;
}

export default function LandingPage({ onSearch }: LandingPageProps) {
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('All Categories');

  const handleExploreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(address, category === 'All Categories' ? 'All' : category);
  };

  const handleCategoryClick = (catName: string) => {
    onSearch('', catName);
  };

  const categories = [
    {
      name: 'Study Spots',
      count: '124 Places',
      img: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=600',
      searchKey: 'Study'
    },
    {
      name: 'Budget Food',
      count: '89 Places',
      img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=600',
      searchKey: 'Food'
    },
    {
      name: 'Secret Viewpoints',
      count: '42 Hidden Gems',
      img: 'https://images.unsplash.com/photo-1513635269975-59663e0ca1ad?auto=format&fit=crop&q=80&w=1200',
      searchKey: 'Viewpoint'
    },
    {
      name: 'Quiet Cafes',
      count: '210 Places',
      img: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&q=80&w=600',
      searchKey: 'Cafe'
    },
    {
      name: 'Hidden Parks',
      count: '56 Places',
      img: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&q=80&w=600',
      searchKey: 'Park'
    },
    {
      name: 'Photography Spots',
      count: '78 Creative Venues',
      img: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1200',
      searchKey: 'Photography'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 pt-16 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Decorative Grid Mesh & Dynamic Gradient Pulses */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 dark:via-slate-950/50 to-slate-50 dark:to-slate-950 z-10"></div>
          {/* Subtle dots grid mesh pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-70"></div>
          {/* Radiant background lights */}
          <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-emerald-100/50 dark:bg-emerald-950/20 blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-sky-100/40 dark:bg-sky-950/20 blur-3xl"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-sans text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Discover Places <span className="text-emerald-500 italic font-serif dark:text-emerald-400">Locals Actually Use</span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="font-sans text-lg text-slate-500 dark:text-slate-400 max-w-2xl mt-6 leading-relaxed"
          >
            Bypass the standard tourist traps. Find the quietest neighborhood study nooks, pristine budget street-food stalls, secret skyline viewpoints, and cozy cafes verified by people who actually live here.
          </motion.p>

          {/* Dual-input Glass Search Bar Pill */}
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            onSubmit={handleExploreSubmit}
            className="w-full max-w-3xl mt-12 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-slate-800 p-2 md:p-3 rounded-full flex flex-col md:flex-row items-center gap-2 shadow-xl shadow-slate-200/50 dark:shadow-none"
          >
            {/* Input 1 - Address */}
            <div className="flex items-center gap-3 px-5 py-2.5 w-full border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-800">
              <Search className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Where are you? (e.g., Kensington, Old Street...)"
                className="bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 w-full font-semibold text-sm outline-none"
              />
            </div>

            {/* Input 2 - Category Dropdown */}
            <div className="flex items-center gap-3 px-5 py-2.5 w-full shrink-0 md:w-56 leading-none">
              <Compass className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-300 font-semibold text-sm outline-none w-full cursor-pointer"
              >
                <option className="dark:bg-slate-900 dark:text-white">All Categories</option>
                <option className="dark:bg-slate-900 dark:text-white" value="Study">Study Spots</option>
                <option className="dark:bg-slate-900 dark:text-white" value="Food">Budget Food</option>
                <option className="dark:bg-slate-900 dark:text-white" value="Cafe">Quiet Cafes</option>
                <option className="dark:bg-slate-900 dark:text-white" value="Viewpoint">Secret Viewpoints</option>
                <option className="dark:bg-slate-900 dark:text-white" value="Park">Hidden Parks</option>
                <option className="dark:bg-slate-900 dark:text-white" value="Photography">Photography Spots</option>
              </select>
            </div>

            {/* Submit CTA Explorer button */}
            <button
              type="submit"
              className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-white font-bold text-sm px-8 py-3.5 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Explore
            </button>
          </motion.form>
        </div>
      </section>

      {/* Bento Grid: Designed for the Discerning */}
      <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase bg-emerald-100/50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-full">CORE FEATURES</span>
          <h2 className="font-sans text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">
            Designed for the Discerning
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-semibold">Quality over quantity, always.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Verified */}
          <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-100 dark:border-slate-800 p-8 rounded-3xl flex flex-col justify-between hover:shadow-xl dark:hover:shadow-none hover:border-slate-200/50 dark:hover:border-slate-700/50 transition-all duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 dark:text-emerald-450 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6" fill="currentColor" fillOpacity={0.15} />
              </div>
              <h3 className="font-sans text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-8">Community Verified</h3>
              <p className="font-sans text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                Every place is nominated and voted on by local neighborhood experts. Only high-trust, authentic, non-touristy spaces make it past our curation pipeline.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">
              <span>Security Guaranteed</span>
              <span className="text-emerald-500 dark:text-emerald-450">Active</span>
            </div>
          </div>

          {/* Card 2: Interactive Density */}
          <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-100 dark:border-slate-800 p-8 rounded-3xl md:col-span-2 flex flex-col md:flex-row gap-8 justify-between hover:shadow-xl dark:hover:shadow-none hover:border-slate-200/50 dark:hover:border-slate-700/50 transition-all duration-300 group">
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center text-sky-500 dark:text-sky-400 group-hover:scale-110 transition-transform duration-300">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="font-sans text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-8">Real-Time Atmosphere Index</h3>
                <p className="font-sans text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                  Toggle our real-time atmosphere overlays to find exactly what fits your mood: silent library chambers, lively cafe chat spaces, or solitary urban garden paths.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-6 text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Quiet</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span> WiFi 4.8</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> Budget</div>
              </div>
            </div>

            <div className="w-full md:w-64 h-48 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden relative shrink-0">
              {/* Mock interactive visualization graphics */}
              <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-40"></div>
              {/* Radial heatmap ripple bubbles */}
              <span className="absolute top-[40%] left-[35%] w-16 h-16 rounded-full bg-emerald-400/20 blur-md animate-pulse"></span>
              <span className="absolute top-[30%] left-[50%] w-24 h-24 rounded-full bg-sky-400/20 blur-lg"></span>
              <span className="absolute top-[50%] left-[45%] w-1.5 h-1.5 rounded-full bg-emerald-600 ring-4 ring-emerald-500/20"></span>
              <span className="absolute top-[35%] left-[55%] w-1.5 h-1.5 rounded-full bg-sky-600 ring-4 ring-sky-500/20"></span>
              
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl p-3 border border-slate-100 dark:border-slate-805">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Selected Region</p>
                <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 mt-1">Soho remote density: Low</p>
              </div>
            </div>
          </div>

          {/* Card 3: Gem Score */}
          <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-100 dark:border-slate-800 p-8 rounded-3xl flex flex-col justify-between hover:shadow-xl dark:hover:shadow-none hover:border-slate-200/50 dark:hover:border-slate-700/50 transition-all duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-full gem-glow bg-emerald-500 text-white flex items-center justify-center font-extrabold text-sm group-hover:scale-110 transition-transform duration-300">
                9.8
              </div>
              <h3 className="font-sans text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-8">Unified Gem Score</h3>
              <p className="font-sans text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                Our algorithmic Score weighs multiple variables: street safety, decibel comfort metrics, plug outlets, and cost values to assign a clear value.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-extrabold">
              <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wide">Premium Score Cap</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-405"><Award className="w-4 h-4" /> Weighted</span>
            </div>
          </div>

          {/* Card 4: Student-Friendly */}
          <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-100 dark:border-slate-800 p-8 rounded-3xl flex flex-col justify-between hover:shadow-xl dark:hover:shadow-none hover:border-slate-200/50 dark:hover:border-slate-700/50 transition-all duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-500 dark:text-amber-450 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-sans text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-8">Student-Friendly Perks</h3>
              <p className="font-sans text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                Specifically isolate workspaces based on high-speed internet diagnostics, plug locations, or available academic membership discounts.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-extrabold">
              <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wide">Work Diagnosed</span>
              <span className="text-amber-600 dark:text-amber-400">Free WiFi</span>
            </div>
          </div>

          {/* Card 5: Decibel Tracker */}
          <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-100 dark:border-slate-800 p-8 rounded-3xl flex flex-col justify-between hover:shadow-xl dark:hover:shadow-none hover:border-slate-200/50 dark:hover:border-slate-700/50 transition-all duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500 dark:text-rose-450 group-hover:scale-110 transition-transform duration-300">
                <Volume2 className="w-6 h-6" />
              </div>
              <h3 className="font-sans text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-8">Decibel Decodes</h3>
              <p className="font-sans text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                Avoid the stress of dynamic crowd noises. Get reliable decibel indications before leaving so you never compromise on study efficiency.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-extrabold">
              <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wide">Sound Comfort limits</span>
              <span className="text-rose-600 dark:text-rose-400">30-45 dB Avg</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mood-Based Explore Section (Photo Tile Grids) */}
      <section className="py-24 bg-white dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="px-6 md:px-16 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase bg-emerald-100/50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full">MOOD EXPLORATION</span>
              <h2 className="font-sans text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight font-sans">
                Mood-Based Discovery
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-semibold">Tell us what you need; we have mapped the accurate answers.</p>
            </div>
            <button 
              onClick={() => onSearch('', 'All')}
              className="text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 font-bold text-sm flex items-center gap-2 hover:underline tracking-tight transition-all shrink-0 cursor-pointer"
            >
              View All Categories <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((c, i) => (
              <div
                key={i}
                onClick={() => handleCategoryClick(c.searchKey)}
                className="relative h-64 rounded-3xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Visual Image */}
                <img
                  src={c.img}
                  alt={c.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* Gradient shade overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent"></div>
                
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <div>
                    <h4 className="font-sans text-xl font-extrabold text-white tracking-tight">{c.name}</h4>
                    <span className="text-white/80 text-xs font-semibold leading-relaxed mt-1 block">{c.count}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="relative overflow-hidden bg-slate-900 dark:bg-slate-900 rounded-[2.5rem] border border-slate-900 dark:border-slate-800 p-12 md:p-20 text-center flex flex-col items-center">
          {/* Accent decoration */}
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl"></div>
          <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl"></div>

          <span className="relative z-10 text-xs font-bold text-emerald-400 tracking-widest uppercase bg-emerald-500/10 px-3 py-1.5 rounded-full">JOIN THE CRUSADE</span>
          <h2 className="relative z-10 font-sans text-3xl md:text-5xl font-extrabold text-white mt-6 tracking-tight max-w-2xl leading-tight">
            Ready to stop being a standard city tourist?
          </h2>
          <p className="relative z-10 text-slate-400 font-sans text-base max-w-lg mt-6 leading-relaxed">
            Join over 50,000+ local urban explorers mapping off-the-radar quiet spots and study spaces in major metropolitan cities.
          </p>

          <div className="relative z-10 mt-12 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button 
              onClick={() => onSearch('', 'All')}
              className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-white font-bold text-sm rounded-full shadow-xl shadow-emerald-500/10 cursor-pointer"
            >
              Sign Up Free
            </button>
            <button 
              onClick={() => onSearch('', 'All')}
              className="px-10 py-4 bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white border border-white/20 font-bold text-sm rounded-full cursor-pointer"
            >
              Open Interactive map
            </button>
          </div>
        </div>
      </section>

      {/* Structured Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 border-t border-slate-800 dark:border-slate-900 py-16 px-6 md:px-16 text-slate-400 transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <MapPin className="w-5 h-5" fill="currentColor" />
              </div>
              <span className="font-sans text-lg font-extrabold text-white tracking-tight">
                Hidden <span className="text-emerald-500">Gems</span>
              </span>
            </div>
            <p className="text-sm text-slate-450 max-w-sm leading-relaxed">
              Curating and mapping only the most authentic, vetted spaces. Built for students, academics, creative professionals, and remote workers looking to reclaim their work environment.
            </p>
          </div>

          <div>
            <h4 className="font-sans text-sm font-bold text-white mb-6 uppercase tracking-wider">Explore</h4>
            <ul className="space-y-3 text-sm text-slate-400 font-semibold">
              <li><button onClick={() => onSearch('', 'Study')} className="hover:text-emerald-400 transition-colors cursor-pointer">Study Spots</button></li>
              <li><button onClick={() => onSearch('', 'Food')} className="hover:text-emerald-400 transition-colors cursor-pointer">Budget Food</button></li>
              <li><button onClick={() => onSearch('', 'Cafe')} className="hover:text-emerald-400 transition-colors cursor-pointer">Quiet Cafes</button></li>
              <li><button onClick={() => onSearch('', 'Viewpoint')} className="hover:text-emerald-400 transition-colors cursor-pointer">Secret Viewpoints</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-sm font-bold text-white mb-6 uppercase tracking-wider">Company</h4>
            <ul className="space-y-3 text-sm text-slate-400 font-semibold">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Community Rules</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 dark:border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 Hidden Gems Explorer Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <Globe className="w-4 h-4 hover:text-slate-400 cursor-pointer" />
            <Share2 className="w-4 h-4 hover:text-slate-400 cursor-pointer" />
            <Heart className="w-4 h-4 hover:text-slate-400 cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
}
