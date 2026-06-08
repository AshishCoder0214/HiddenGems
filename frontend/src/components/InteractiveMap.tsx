import React, { useState, useEffect, useRef } from 'react';
import { Search, Award, Compass, Navigation, Filter, Bookmark, Star, X, Info, HelpCircle } from 'lucide-react';
import { Gem, Filters } from '../types';
import { motion, AnimatePresence } from "framer-motion";
import L from 'leaflet';

interface InteractiveMapProps {
  gems: Gem[];
  onToggleSave: (id: string) => Promise<boolean>;
  savedPlacesList?: string[];
  initialSearch?: string;
  initialCategory?: string;
  darkMode?: boolean;
}

export default function InteractiveMap({
  gems,
  onToggleSave,
  savedPlacesList = [],
  initialSearch = '',
  initialCategory = 'All',
  darkMode = false
}: InteractiveMapProps) {
  const [filters, setFilters] = useState<Filters>({
    search: initialSearch,
    category: initialCategory,
    price: null,
    noise: 5,
    crowd: 5,
    safety: 1
  });

  const [selectedGemId, setSelectedGemId] = useState<string | null>(null);
  const [showDirections, setShowDirections] = useState<boolean>(false);
  
  // Mobile drawer states
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState<boolean>(false);

  const filteredGems = gems.filter(gem => {
    if (filters.category !== 'All' && gem.category.toLowerCase() !== filters.category.toLowerCase()) {
      return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchText = gem.title.toLowerCase().includes(q) || gem.description.toLowerCase().includes(q);
      if (!matchText) return false;
    }
    if (gem.noiseLevel > filters.noise) return false;
    if (gem.crowdLevel > filters.crowd) return false;
    if (gem.safetyRating < filters.safety) return false;
    if (filters.price !== null && gem.costEstimate !== filters.price) return false;

    return true;
  });

  const activeGem = filteredGems.find(g => g._id === selectedGemId) || filteredGems[0] || null;

  useEffect(() => {
    if (activeGem && selectedGemId !== activeGem._id) {
      setSelectedGemId(activeGem._id);
    }
  }, [activeGem, selectedGemId]);

  // Leaflet map refs and references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const prevGemsLengthRef = useRef<number>(0);

  // Initialize Leaflet Map instance once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true
    }).setView([51.5074, -0.1278], 12);

    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer theme dynamically
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const tileUrl = darkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    tileLayerRef.current = tileLayer;
  }, [darkMode]);

  // Update geographic pins on filteredGems change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Create markers for each filtered gem
    filteredGems.forEach(gem => {
      const coords = gem.coordinates?.coordinates;
      if (!coords || coords.length !== 2) return;

      const [lon, lat] = coords;
      const isSelected = selectedGemId === gem._id;

      const pinHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer">
          ${isSelected ? '<span class="absolute w-10 h-10 rounded-full border-2 border-emerald-500/30 bg-emerald-400/5 animate-ping -top-1.5"></span>' : ''}
          <div class="px-2.5 py-1 bg-white dark:bg-slate-900 rounded-full shadow-lg text-[9px] font-bold border border-slate-100 dark:border-slate-800 mb-1 text-[#0F172A] dark:text-slate-200 transition-all opacity-0 group-hover:opacity-100 absolute bottom-9 z-50 whitespace-nowrap">
            ${gem.title}
          </div>
          <div class="w-8 h-8 rounded-full border-4 shadow-xl flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-[#10B981] border-white dark:border-slate-900 text-white scale-110 ring-4 ring-emerald-500/10'
              : 'bg-white dark:bg-slate-900 border-[#10B981]/30 dark:border-emerald-950 text-[#10B981] dark:text-emerald-450 hover:border-[#10B981] dark:hover:border-emerald-500 hover:scale-105'
          }">
            <svg class="w-4 h-4 transform rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html: pinHtml,
        className: 'custom-leaflet-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([lat, lon], { icon })
        .addTo(map)
        .on('click', () => {
          setSelectedGemId(gem._id);
          setShowDetailsDrawer(true);
        });

      markersRef.current.push(marker);
    });
  }, [filteredGems, selectedGemId]);

  // Handle bounds fitting on visible items count changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || markersRef.current.length === 0) return;

    if (filteredGems.length !== prevGemsLengthRef.current) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.15));
      prevGemsLengthRef.current = filteredGems.length;
    }
  }, [filteredGems.length]);

  // Centering camera view when selected gem changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedGemId) return;

    const gem = gems.find(g => g._id === selectedGemId);
    if (!gem) return;

    const coords = gem.coordinates?.coordinates;
    if (coords && coords.length === 2) {
      const [lon, lat] = coords;
      map.setView([lat, lon], 14, { animate: true });
    }
  }, [selectedGemId]);

  // Sync initial parameters
  useEffect(() => {
    setFilters(f => ({
      ...f,
      search: initialSearch,
      category: initialCategory
    }));
  }, [initialSearch, initialCategory]);

  const handlePriceClick = (priceLevel: number) => {
    setFilters(f => ({
      ...f,
      price: f.price === priceLevel ? null : priceLevel
    }));
  };

  const handleCategorySelect = (category: string) => {
    setFilters(f => ({
      ...f,
      category
    }));
  };

  const getNoiseLabel = (level: number) => {
    if (level <= 1) return 'Dead Silent';
    if (level <= 2) return 'Quiet Study';
    if (level <= 3) return 'Moderate Background';
    if (level <= 4) return 'Conversational';
    return 'Energetic Soundspace';
  };

  const getCrowdLabel = (level: number) => {
    if (level <= 1) return 'Solitary Sanctuary';
    if (level <= 2) return 'Pristine/Few People';
    if (level <= 3) return 'Bustling Local';
    if (level <= 4) return 'Lively Buzz';
    return 'Densely Packed';
  };

  // Render filter list elements (reused inside desktop sidebar and mobile drawer)
  const renderFilterPanelContents = (isDrawer = false) => (
    <div className="space-y-6 flex-1 flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] font-bold text-[#10B981] dark:text-emerald-400 tracking-wider bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full uppercase">Discovery Lens</span>
          <h2 className="font-sans text-lg font-bold text-[#0F172A] dark:text-white mt-2 tracking-tight">Map Filters</h2>
        </div>
        {isDrawer && (
          <button 
            onClick={() => setShowFilterDrawer(false)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer text-slate-500"
            aria-label="Close filters drawer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Query Search */}
      <div>
        <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-800 rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-[#10B981]/15 transition-all">
          <Search className="w-4 h-4 text-[#10B981] dark:text-emerald-400 shrink-0 mr-2.5" aria-hidden="true" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search keyword..."
            aria-label="Search filter keywords"
            className="bg-transparent border-none text-slate-850 dark:text-slate-200 text-xs font-semibold placeholder:text-slate-400 focus:outline-none w-full outline-none"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Category</label>
        <div className="grid grid-cols-2 gap-2">
          {['All', 'Cafe', 'Study', 'Viewpoint', 'Food', 'Photography'].map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`text-[11px] px-2.5 py-2 font-bold rounded-lg border transition-all cursor-pointer ${
                filters.category === cat
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-850 hover:border-slate-200 dark:hover:border-slate-750'
              }`}
            >
              {cat === 'All' ? 'All Areas' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Cost tier */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Local Cost Estimate</label>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((priceTier) => (
            <button
              key={priceTier}
              onClick={() => handlePriceClick(priceTier)}
              className={`py-2 rounded-lg text-xs font-bold cursor-pointer border transition-all ${
                filters.price === priceTier
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-850 text-slate-500 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-755'
              }`}
            >
              {'$'.repeat(priceTier)}
            </button>
          ))}
        </div>
      </div>

      {/* Noise Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[11px]">Noise Level</span>
          <span className="text-xs font-bold text-[#10B981] dark:text-emerald-400">{getNoiseLabel(filters.noise)}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden relative">
          <div className="h-full bg-[#10B981] dark:bg-emerald-600 rounded-full transition-all" style={{ width: `${(filters.noise / 5) * 100}%` }}></div>
          <input
            type="range"
            min={1}
            max={5}
            value={filters.noise}
            onChange={(e) => setFilters({ ...filters, noise: parseInt(e.target.value, 10) })}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
            aria-label="Filter noise level threshold"
          />
        </div>
      </div>

      {/* Crowd Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[11px]">Crowd Density</span>
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400">{getCrowdLabel(filters.crowd)}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden relative">
          <div className="h-full bg-sky-500 dark:bg-sky-600 rounded-full transition-all" style={{ width: `${(filters.crowd / 5) * 100}%` }}></div>
          <input
            type="range"
            min={1}
            max={5}
            value={filters.crowd}
            onChange={(e) => setFilters({ ...filters, crowd: parseInt(e.target.value, 10) })}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
            aria-label="Filter crowd density threshold"
          />
        </div>
      </div>

      <div className="mt-auto bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-850 p-4 space-y-2">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          <span>Weekly Stats</span>
          <Award className="w-3.5 h-3.5 text-[#10B981]" aria-hidden="true" />
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">+12 new gems found this week</p>
      </div>
    </div>
  );

  // Render gem detail panel contents
  const renderDetailCardContents = (isDrawer = false) => {
    if (!activeGem) return null;
    return (
      <div className="flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar select-none">
        <div className="space-y-4">
          <div className="relative h-44 shrink-0 bg-slate-800 rounded-2xl overflow-hidden">
            <img src={activeGem.images[0]} alt={activeGem.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
            
            {/* Tag Overlays */}
            <div className="absolute bottom-4 left-4 flex gap-1">
              <span className="px-2 py-0.5 bg-[#10B981] text-white text-[9px] font-bold uppercase rounded">Vetted Spot</span>
              <span className="px-2 py-0.5 bg-[#0284C7] text-white text-[9px] font-bold uppercase rounded">{activeGem.category}</span>
            </div>

            {/* Saved state bookmark button */}
            <button
              onClick={() => onToggleSave(activeGem._id)}
              className={`absolute top-4 right-4 w-8 h-8 rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer ${
                savedPlacesList.includes(activeGem._id)
                  ? 'bg-rose-500 border-rose-500 text-white shadow-md'
                  : 'bg-white/20 hover:bg-white/40 border-white/20 text-white'
              }`}
              aria-label={savedPlacesList.includes(activeGem._id) ? "Remove from saved places" : "Save location to bookmarks"}
            >
              <Bookmark className="w-3.5 h-3.5" fill={savedPlacesList.includes(activeGem._id) ? 'currentColor' : 'none'} />
            </button>
            {isDrawer && (
              <button 
                onClick={() => setShowDetailsDrawer(false)}
                className="absolute top-4 left-4 w-8 h-8 bg-slate-900/60 text-white rounded-full flex items-center justify-center cursor-pointer"
                aria-label="Close location detail panel"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-[#0F172A] dark:text-white tracking-tight leading-snug">{activeGem.title}</h2>
              <p className="text-xs text-slate-400 dark:text-slate-400 font-semibold">{activeGem.category} • Vetted Location</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-850 flex flex-col items-center justify-center shrink-0">
              <span className="text-emerald-700 dark:text-emerald-450 font-extrabold text-base leading-none">{activeGem.hiddenGemScore}</span>
              <span className="text-[7px] font-bold text-emerald-500 dark:text-emerald-400 uppercase mt-0.5">Score</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {activeGem.description}
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-55 dark:border-slate-800">
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Atmosphere</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-350">{getNoiseLabel(activeGem.noiseLevel)}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Density</p>
              <p className="text-xs font-bold text-[#0284C7] dark:text-sky-400">{getCrowdLabel(activeGem.crowdLevel)}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Amenity</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{activeGem.wiFiAvailable ? 'Fiber WiFi' : 'Relaxing Nook'}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cost Sourcing</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-305">{'$'.repeat(activeGem.costEstimate)} (Budget Sourced)</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setShowDirections(true)}
            className="w-full py-3 bg-[#10B981] text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:bg-emerald-600 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4 fill-white" /> Get Directions
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-[calc(100vh-64px)] mt-16 flex relative overflow-hidden bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
      
      {/* Accessibility Keyboard Skip Link */}
      <a href="#map-grid" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-emerald-500 text-white px-5 py-2.5 rounded-xl z-50 font-bold text-xs select-none">
        Skip directly to interactive map grid
      </a>

      {/* MOBILE TRIGGER FILTER OVERLAY BUTTON */}
      <button
        onClick={() => setShowFilterDrawer(true)}
        className="lg:hidden absolute top-4 left-4 z-20 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold text-slate-705 dark:text-slate-200 cursor-pointer"
        aria-label="Open filter criteria menu drawer"
      >
        <Filter className="w-4 h-4 text-[#10B981]" />
        <span>Filters</span>
      </button>

      {/* LEFT SIDEBAR: FILTERS (DESKTOP ONLY) */}
      <aside className="hidden lg:flex w-72 h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex-col p-6 z-30 shrink-0 overflow-y-auto custom-scrollbar select-none transition-colors duration-300">
        {renderFilterPanelContents(false)}
      </aside>

      {/* CENTER STAGE: DISTRICT MAP CONTAINER WITH LEAFLET */}
      <section 
        id="map-grid"
        role="application"
        aria-label="Map district locations"
        className="flex-1 h-full relative z-10"
      >
        <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />

        {/* BOTTOM FLOOR SEARCH BANNER HELPER */}
        <div className="absolute bottom-6 left-6 right-6 z-20 pointer-events-none flex justify-center">
          <div className="pointer-events-auto bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-100 dark:border-slate-800 p-2 rounded-2xl shadow-2xl flex items-center gap-3">
            <button
              onClick={() => {
                setFilters({
                  search: '',
                  category: 'All',
                  price: null,
                  noise: 5,
                  crowd: 5,
                  safety: 1
                });
                setSelectedGemId(null);
                
                // Recenter map bounds
                if (mapRef.current && markersRef.current.length > 0) {
                  const group = L.featureGroup(markersRef.current);
                  mapRef.current.fitBounds(group.getBounds().pad(0.15));
                } else if (mapRef.current) {
                  mapRef.current.setView([51.5074, -0.1278], 12);
                }
              }}
              className="px-5 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              Reset map area
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-850"></div>
            <div className="px-4 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {filteredGems.length} off-the-radar listings found
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT FLOATING PROFILE DETAILS PANEL (DESKTOP ONLY) */}
      <aside className="hidden md:flex w-96 h-full p-6 z-30 shrink-0 select-none pointer-events-none flex-col justify-center">
        {activeGem ? (
          <motion.article
            key={activeGem._id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full h-[82vh] rounded-[24px] overflow-hidden flex flex-col shadow-2xl p-6"
          >
            {renderDetailCardContents(false)}
          </motion.article>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full h-[82vh] rounded-[24px] flex flex-col items-center justify-center p-6 text-center shadow-lg pointer-events-auto">
            <Compass className="w-10 h-10 text-slate-300 dark:text-slate-500 animate-spin" />
            <p className="text-slate-400 dark:text-slate-400 text-xs font-semibold mt-4">
              Apply alternative filters or pan around.<br />No matches correspond to the strict bounds.
            </p>
          </div>
        )}
      </aside>

      {/* =========================================
          MOBILE SLIDE-OUT DRAWER FILTERS
         ========================================= */}
      <AnimatePresence>
        {showFilterDrawer && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterDrawer(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-80 max-w-[85vw] h-full bg-white dark:bg-slate-900 flex flex-col p-6 shadow-2xl z-10 overflow-y-auto custom-scrollbar"
            >
              {renderFilterPanelContents(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================
          MOBILE SLIDE-UP DETAIL PANEL DRAWER
         ========================================= */}
      <AnimatePresence>
        {showDetailsDrawer && activeGem && (
          <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailsDrawer(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative max-h-[85vh] w-full bg-white dark:bg-slate-900 rounded-t-[2rem] overflow-hidden flex flex-col shadow-2xl z-10 p-6"
            >
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-4 shrink-0" />
              {renderDetailCardContents(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAP GET DIRECTIONS MODAL DIALOGUE */}
      {showDirections && activeGem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 max-w-md w-full shadow-2xl space-y-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full uppercase">Navigation Steps</span>
                <h3 className="font-sans text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">{activeGem.title}</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-800 dark:text-emerald-400 text-xs font-bold shrink-0">1</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                  Exit from Central London underground tube station and head towards the old pedestrian district.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-800 dark:text-emerald-400 text-xs font-bold shrink-0">2</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                  Spy the legacy vintage bookstore storefront. Step through the archway into the rear courtyard.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-800 dark:text-emerald-400 text-xs font-bold shrink-0">3</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-bold text-emerald-600 dark:text-emerald-400">
                  Welcome to {activeGem.title}! Press checkin badge on entrance to earn explorer bonus.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDirections(false)}
              className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-white font-bold text-xs py-3.5 rounded-2xl transition-all cursor-pointer"
            >
              Dismiss Navigation Guard
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
