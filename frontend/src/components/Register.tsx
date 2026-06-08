import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Key, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from "framer-motion";

interface RegisterProps {
  onRegisterSuccess: (token: string, user: any) => void;
}

export default function Register({ onRegisterSuccess }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill out all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        onRegisterSuccess(data.token, data);
        navigate('/map');
      } else {
        setError(data.error || 'Registration failed. Email might already be taken.');
      }
    } catch (err) {
      setError('Network failure connecting to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 md:p-10 shadow-2xl space-y-8 select-none transition-colors duration-300">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-[#10B981] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <MapPin className="w-6.5 h-6.5" fill="currentColor" />
            </div>
          </div>
          <h2 className="font-sans text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white mt-4">
            Join Hidden Gems
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Register to start tracking explorer levels and sharing spots.
          </p>
        </div>

        {/* Error HUD */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl flex items-center gap-3 text-rose-700 dark:text-rose-450 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name field */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Full Name
            </label>
            <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-[#10B981]/15 transition-all">
              <User className="w-4.5 h-4.5 text-slate-450 dark:text-slate-550 shrink-0 mr-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Explorer Alex"
                className="bg-transparent border-none text-slate-850 dark:text-slate-200 text-xs font-semibold placeholder:text-slate-450 focus:outline-none w-full outline-none"
              />
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-[#10B981]/15 transition-all">
              <Mail className="w-4.5 h-4.5 text-slate-450 dark:text-slate-550 shrink-0 mr-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@hiddengems.co"
                className="bg-transparent border-none text-slate-850 dark:text-slate-200 text-xs font-semibold placeholder:text-slate-450 focus:outline-none w-full outline-none"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Password (Min. 8 characters)
            </label>
            <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-[#10B981]/15 transition-all">
              <Key className="w-4.5 h-4.5 text-slate-450 dark:text-slate-550 shrink-0 mr-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent border-none text-slate-850 dark:text-slate-200 text-xs font-semibold placeholder:text-slate-450 focus:outline-none w-full outline-none"
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#10B981] hover:bg-emerald-600 active:scale-98 text-white text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 disabled:opacity-40"
          >
            {loading ? 'Registering...' : 'Register'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Redirect toggle */}
        <div className="text-center text-xs font-semibold text-slate-400 dark:text-slate-505 pt-4 border-t border-slate-50 dark:border-slate-850">
          Already have an account?{' '}
          <Link to="/login" className="text-[#10B981] hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
