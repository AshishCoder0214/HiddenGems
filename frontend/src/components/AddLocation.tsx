import React, { useState, useEffect, useRef } from 'react';
import { Compass, Camera, Sparkles, AlertCircle, ArrowLeft, ArrowRight, Check, MapPin, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import L from 'leaflet';

interface AddLocationProps {
  onSubmitGem: (gemData: any) => Promise<boolean>;
  darkMode?: boolean;
}

export default function AddLocation({ onSubmitGem, darkMode = false }: AddLocationProps) {
  // Active wizard stage: 1 = Location / visual proof, 2 = Details, 3 = Atmosphere
  const [stage, setStage] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Form states matching schemas
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Study');
  const [description, setDescription] = useState('');
  const [costEstimate, setCostEstimate] = useState<number>(2);
  const [crowdLevel, setCrowdLevel] = useState<number>(2);
  const [noiseLevel, setNoiseLevel] = useState<number>(2);
  const [safetyRating, setSafetyRating] = useState<number>(4.5);
  const [wiFiAvailable, setWiFiAvailable] = useState<boolean>(true);
  
  // Latitude and Longitude coords corresponding to Central London
  const [lon, setLon] = useState<number>(-0.1278);
  const [lat, setLat] = useState<number>(51.5074);

  // Media upload mock
  const [imageLink, setImageLink] = useState('https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=1200&q=80');

  // Calculates scores deterministically live so users can adjust and see feedback!
  const calculateLiveScore = (): number => {
    const rawScore = (10 - noiseLevel - crowdLevel + safetyRating + (wiFiAvailable ? 2 : 0) + (4 - costEstimate)) / 2 + 3.5;
    return Math.min(10, Math.max(1, parseFloat(rawScore.toFixed(1))));
  };

  // Leaflet map refs and references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true
    }).setView([lat, lon], 13);

    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Custom HTML pin icon matching the theme
    const pinHtml = `
      <div class="relative flex flex-col items-center">
        <span class="absolute w-8 h-8 rounded-full border-2 border-emerald-500 bg-emerald-400/20 -top-3.5 -left-4 animate-ping"></span>
        <svg class="w-6 h-6 text-emerald-500 -translate-x-1/2 -translate-y-1/2 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `;

    const icon = L.divIcon({
      html: pinHtml,
      className: 'custom-leaflet-pin',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker([lat, lon], { icon, draggable: true })
      .addTo(map);

    markerRef.current = marker;
    mapRef.current = map;

    // Click map to reposition coordinates pin marker
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat: newLat, lng: newLng } = e.latlng;
      setLat(parseFloat(newLat.toFixed(4)));
      setLon(parseFloat(newLng.toFixed(4)));
      marker.setLatLng(e.latlng);
      map.panTo(e.latlng);
    });

    // Drag marker to reposition coordinate select state values
    marker.on('dragend', (e: any) => {
      const position = e.target.getLatLng();
      setLat(parseFloat(position.lat.toFixed(4)));
      setLon(parseFloat(position.lng.toFixed(4)));
      map.panTo(position);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
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

  // Synchronize state coordinates back to marker position if manually modified/set
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (currentPos.lat !== lat || currentPos.lng !== lon) {
        const newLatLng = L.latLng(lat, lon);
        markerRef.current.setLatLng(newLatLng);
        mapRef.current.panTo(newLatLng);
      }
    }
  }, [lat, lon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category) {
      alert('Kindly fill out all details in the step wizard before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSubmitGem({
        title,
        description,
        category,
        coordinates: [lon, lat],
        costEstimate,
        crowdLevel,
        noiseLevel,
        safetyRating,
        wiFiAvailable,
        images: [imageLink]
      });

      if (success) {
        setSuccessInfo('Congratulations! Your hidden gem location has been verified and registered.');
        // Reset steps
        setTitle('');
        setDescription('');
        setStage(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNoiseLevelVerbal = (lvl: number) => {
    if (lvl <= 1) return 'Dead silent sanctuary';
    if (lvl <= 2) return 'Whisper quiet study nook';
    if (lvl <= 3) return 'Moderate conversational tone';
    return 'Lively background chatter';
  };

  const getCrowdLevelVerbal = (lvl: number) => {
    if (lvl <= 1) return 'Solitary space (almost empty)';
    if (lvl <= 2) return 'Isolated setting (very comfortable)';
    if (lvl <= 3) return 'Moderate density';
    return 'Densely occupied but inspiring';
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] mt-16 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 select-none md:p-12 transition-colors duration-300">
      <div className="max-w-4xl w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[24px] p-8 md:p-12 shadow-2xl relative overflow-hidden transition-colors duration-300">
        {/* Step indicator header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <span className="text-[10px] font-bold text-[#10B981] dark:text-emerald-400 tracking-wider bg-emerald-50 dark:bg-emerald-950/45 px-2.5 py-1 rounded-full uppercase">Submission Pipeline</span>
            <h1 className="font-sans text-2xl md:text-3xl font-bold text-[#0F172A] dark:text-white mt-2 select-all tracking-tight">Share a Hidden Spot</h1>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center ${stage >= 1 ? 'bg-[#10B981] text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 dark:bg-slate-950 text-slate-400'}`}>1</span>
            <div className="w-8 h-px bg-slate-200 dark:bg-slate-800"></div>
            <span className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center ${stage >= 2 ? 'bg-[#10B981] text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-950 text-slate-400'}`}>2</span>
            <div className="w-8 h-px bg-slate-200 dark:bg-slate-800"></div>
            <span className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center ${stage >= 3 ? 'bg-[#10B981] text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-950 text-slate-400'}`}>3</span>
          </div>
        </div>

        {/* Success Modal overlays */}
        {successInfo && (
          <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-40 flex flex-col items-center justify-center p-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Check className="w-8 h-8 shrink-0" />
            </div>
            <h2 className="font-sans text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{successInfo}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
              Your submission has incremented your explorer stats! Recalculated level and achievements have been credited.
            </p>
            <button
              onClick={() => setSuccessInfo(null)}
              className="px-10 py-3.5 bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl cursor-pointer transition-all active:scale-95"
            >
              Continue Exploring
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          <AnimatePresence mode="wait">
            {stage === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                key="stage-1"
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {/* File/Media proof Drag block */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Visual Proof (Photo Slot)</label>
                  <div
                    onClick={() => {
                      const urls = [
                        'https://images.unsplash.com/photo-1406857013876-17608298e26a?auto=format&fit=crop&w=1200&q=80',
                        'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=1200&q=80',
                        'https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=1200&q=80'
                      ];
                      const chosen = urls[Math.floor(Math.random() * urls.length)];
                      setImageLink(chosen);
                    }}
                    className="border-2 border-dashed border-emerald-500/20 dark:border-emerald-500/45 hover:border-emerald-500 dark:hover:bg-emerald-950/10 rounded-[2rem] aspect-square flex flex-col items-center justify-center p-6 text-center cursor-pointer group transition-all"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/45 flex items-center justify-center text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform mb-4">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="font-sans text-sm font-extrabold text-slate-800 dark:text-slate-100">Change Proof Image (Randomize)</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed mt-2 max-w-[200px]">
                      Simulates camera roll drag-and-drop or select up to 10MB limits.
                    </span>
                    <div className="mt-4 w-full h-24 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                      <img src={imageLink} alt="Uploaded Proof" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                {/* Interactive Map select coordinates block */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Coordinates Selection (Drop pin)</label>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-505 dark:text-slate-400 leading-normal mb-2">
                      Click inside the map below to drop your pin and select standard GPS coordinates, or drag the pin.
                    </p>
                    <div className="w-full aspect-square bg-slate-100 dark:bg-slate-950 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/80 overflow-hidden relative group">
                      {/* Leaflet container */}
                      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />

                      {/* Display Coordinates HUD info */}
                      <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 dark:bg-slate-950/90 text-white backdrop-blur-md rounded-xl p-3 border border-white/10 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-mono z-[1000]">
                        <div>
                          <p className="font-bold text-slate-400 dark:text-slate-500">LONGITUDE</p>
                          <p className="font-extrabold mt-0.5 text-emerald-400">{lon}</p>
                        </div>
                        <div className="h-6 w-px bg-white/20 dark:bg-white/10"></div>
                        <div>
                          <p className="font-bold text-slate-400 dark:text-slate-500">LATITUDE</p>
                          <p className="font-extrabold mt-0.5 text-emerald-400">{lat}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStage(2)}
                    className="px-8 py-3.5 bg-slate-900 dark:bg-slate-850 dark:hover:bg-slate-750 text-white rounded-full font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer shadow-lg active:scale-95"
                  >
                    Next Details <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {stage === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                key="stage-2"
                className="space-y-6"
              >
                {/* Gem Title */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Place/Gem Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., The Cozy Botanical Conservatory"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-800 focus:border-emerald-500 rounded-2xl p-4 font-semibold text-sm outline-none text-slate-800 dark:text-slate-100 transition-all focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                {/* Category select category chips */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider block">Category Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    {['Study', 'Cafe', 'Food', 'Viewpoint', 'Park', 'Photography'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`py-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                          category === cat
                            ? 'bg-emerald-500 border-2 border-emerald-500 text-white shadow-xl shadow-emerald-500/10'
                            : 'bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-305 dark:hover:border-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Description</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what makes this location special. Highlight key entry codes, landmarks, or optimal visit times..."
                    rows={4}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-emerald-500 rounded-2xl p-4 font-normal text-xs outline-none text-slate-800 dark:text-slate-200 resize-none transition-all focus:ring-4 focus:ring-emerald-500/10"
                  ></textarea>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStage(1)}
                    className="px-6 py-3.5 text-slate-505 dark:text-slate-400 dark:hover:bg-slate-950 font-bold text-xs rounded-full flex items-center gap-2 cursor-pointer transition-all border border-slate-100 dark:border-slate-800"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back location
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage(3)}
                    className="px-8 py-3.5 bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-705 text-white font-bold text-xs rounded-full flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer shadow-lg active:scale-95"
                  >
                    Next Comfort Settings <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {stage === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                key="stage-3"
                className="space-y-8"
              >
                {/* Cost Estimate tag chips */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider block">Estimated Price Tier</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((priceTier) => (
                      <button
                        key={priceTier}
                        type="button"
                        onClick={() => setCostEstimate(priceTier)}
                        className={`py-3.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          costEstimate === priceTier
                            ? 'bg-emerald-500 border border-emerald-500 text-white shadow-xl shadow-emerald-500/10'
                            : 'bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-705'
                        }`}
                      >
                        {priceTier === 1 ? 'Budget ($)' : priceTier === 2 ? 'Moderate ($$)' : 'Exclusive ($$$)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* comfort parameters sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Slider 1 decibels */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider block">Noise Indicator</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/45 px-2.5 py-0.5 rounded-md text-[10px]">
                        {getNoiseLevelVerbal(noiseLevel)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={noiseLevel}
                      onChange={(e) => setNoiseLevel(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-505 font-extrabold">
                      <span>SILENT</span>
                      <span>ACTIVE</span>
                    </div>
                  </div>

                  {/* Slider 2 Crowd density */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider block">Crowd Density Indicators</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/45 px-2.5 py-0.5 rounded-md text-[10px]">
                        {getCrowdLevelVerbal(crowdLevel)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={crowdLevel}
                      onChange={(e) => setCrowdLevel(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 dark:bg-slate-955 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-550 font-extrabold">
                      <span>SOLITARY</span>
                      <span>PACKED</span>
                    </div>
                  </div>
                </div>

                 {/* Toggle features options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1 WiFi */}
                  <div
                    onClick={() => setWiFiAvailable(!wiFiAvailable)}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      wiFiAvailable
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-150 dark:border-emerald-800 text-slate-800 dark:text-slate-200'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-805 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-[#10B981] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856a9.75 9.75 0 0 1 13.788 0M1.924 8.674a14.25 14.25 0 0 1 20.152 0M12.53 18a.75.75 0 1 1-1.06 0 .75.75 0 0 1 1.06 0Z" />
                      </svg>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Fast WiFi Available</span>
                    </div>
                    <div className={`w-9 h-5.5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${wiFiAvailable ? 'bg-[#10B981]' : 'bg-slate-200 dark:bg-slate-800'}`}>
                      <div className={`w-4.5 h-4.5 rounded-full bg-white shadow transition-transform duration-200 ${wiFiAvailable ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
                    </div>
                  </div>

                  {/* Option 2 Safety Rating confirmation */}
                  <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-[#10B981] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                      </svg>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Safety Verification</span>
                    </div>
                    <select
                      value={safetyRating}
                      onChange={(e) => setSafetyRating(parseFloat(e.target.value))}
                      className="bg-transparent border-none text-xs font-bold text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer outline-none"
                    >
                      <option value="5.0">5.0 Safe Haven</option>
                      <option value="4.5">4.5 Vetted &amp; Safe</option>
                      <option value="4.0">4.0 Standard Safety</option>
                    </select>
                  </div>
                </div>

                {/* Score HUD indicator */}
                <div className="bg-emerald-500/5 dark:bg-emerald-950/15 border border-emerald-500/20 dark:border-emerald-850/80 rounded-[2rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-full bg-emerald-500 text-white font-extrabold text-base flex items-center justify-center gem-glow shrink-0">
                      {calculateLiveScore()}
                    </div>
                    <div>
                      <h4 className="font-sans text-sm font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5"><Sparkles className="w-4 h-4 fill-emerald-250 dark:fill-emerald-400" /> Projected Score</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px]">Calculated based on your active metrics. Over 9.0 marks a Top Discovery prize!</p>
                    </div>
                  </div>
                  
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold select-none bg-emerald-100/50 dark:bg-emerald-950/45 px-3 py-1.5 rounded-full">
                    LEVEL BONUS CREDITED
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStage(2)}
                    className="px-6 py-3.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 font-bold text-xs rounded-full flex items-center gap-2 cursor-pointer transition-all border border-slate-100 dark:border-slate-800"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back details
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-12 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 disabled:opacity-40"
                  >
                    {isSubmitting ? 'Registering Gem...' : 'Publish Gem Spot'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}
