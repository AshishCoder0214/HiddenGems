import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Bell, Sun, Moon, LogOut } from 'lucide-react';
import { User } from '../types';
import { motion } from "framer-motion";

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function Navbar({ user, onLogout, darkMode, setDarkMode }: NavbarProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors duration-300 z-50 flex items-center justify-between px-6 md:px-12">
      {/* Logo Section */}
      <Link 
        to="/" 
        className="flex items-center gap-3 cursor-pointer select-none group"
      >
        <div className="w-10 h-10 bg-[#10B981] rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 group-hover:scale-105">
          <MapPin className="w-5.5 h-5.5" fill="currentColor" />
        </div>
        <span className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-slate-100 transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
          Hidden <span className="text-[#10B981] dark:text-emerald-400">Gems</span>
        </span>
      </Link>

      {/* Navigation Middle tab */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
        <Link
          to="/"
          className={`font-sans tracking-tight transition-all cursor-pointer ${
            currentPath === '/'
              ? 'text-[#10B981] dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-slate-100'
          }`}
        >
          Explore
        </Link>
        <Link
          to="/map"
          className={`font-sans tracking-tight transition-all cursor-pointer ${
            currentPath === '/map'
              ? 'text-[#10B981] dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-slate-100'
          }`}
        >
          Explore Map
        </Link>
        <Link
          to="/add"
          className={`font-sans tracking-tight transition-all cursor-pointer ${
            currentPath === '/add'
              ? 'text-[#10B981] dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-slate-100'
          }`}
        >
          Share Spot
        </Link>
      </nav>

      {/* Profile & Notifications Right Section */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="w-9 h-9 rounded-full border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center text-slate-500 dark:text-slate-400 cursor-pointer"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? (
            <Sun className="w-4.5 h-4.5 text-amber-500" />
          ) : (
            <Moon className="w-4.5 h-4.5" />
          )}
        </button>

        {/* User profile action */}
        {user ? (
          <>
            <Link
              to="/profile"
              className={`group flex items-center gap-3 p-1 pr-3.5 rounded-full border transition-all cursor-pointer ${
                currentPath === '/profile'
                  ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                  : 'border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-slate-50/50 dark:hover:bg-slate-850/50'
              }`}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 ring-2 ring-white dark:ring-slate-900 shadow-sm font-bold text-xs flex items-center justify-center transition-colors">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-[#0F172A] dark:text-slate-200 leading-tight">
                  {user.name}
                </p>
                <p className="text-[9px] text-[#10B981] dark:text-emerald-400 font-bold uppercase tracking-wider leading-none mt-0.5">
                  LVL {user.explorerLevel} explorer
                </p>
              </div>
            </Link>

            <button
              onClick={onLogout}
              className="w-9 h-9 rounded-full border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center text-slate-500 dark:text-slate-450 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="px-5 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/15 flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
