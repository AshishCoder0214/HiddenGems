import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import InteractiveMap from './components/InteractiveMap';
import AddLocation from './components/AddLocation';
import ProfileDashboard from './components/ProfileDashboard';
import Login from './components/Login';
import Register from './components/Register';
import { Gem, User } from './types';
import { motion, AnimatePresence } from 'motion/react';

// Route protection guard wrapper
interface ProtectedRouteProps {
  children: React.ReactNode;
  token: string | null;
}

function ProtectedRoute({ children, token }: ProtectedRouteProps) {
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [gems, setGems] = useState<Gem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Dark mode setting state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Sync session profile data when token updates
  const fetchUserProfile = async (sessionToken: string) => {
    try {
      const res = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      if (res.ok) {
        const profileData = await res.json();
        setUser(profileData);
      } else {
        // Token expired/invalid
        handleLogout();
      }
    } catch (err) {
      console.error('Failed to retrieve user profile.', err);
    } finally {
      setIsLoading(false);
    }
  };
const API_URL = import.meta.env.VITE_API_URL;

  const fetchGems = async () => {
    try {
      const gemsRes = await fetch(`${API_URL}/api/gems`);
      if (gemsRes.ok) {
        const gemsData = await gemsRes.json();
        // Read paginated wrapper format data: Gem[]
        setGems(gemsData.data || []);
      }
    } catch (err) {
      console.warn('Failed to load gems database listing.', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile(token);
    } else {
      setIsLoading(false);
    }
    fetchGems();
  }, [token]);

  const handleLoginSuccess = (newToken: string, loginUser: any) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(loginUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  // Search state mapping triggers across the dual-input in landing page to map dashboard
  const [landingSearchText, setLandingSearchText] = useState('');
  const [landingCategoryText, setLandingCategoryText] = useState('All');

  // Filter callback from Landing page
  const handleLandingQuerySubmit = (search: string, category: string) => {
    setLandingSearchText(search);
    setLandingCategoryText(category);
    navigate('/map');
  };

  // Submit gem callback
  const handleSubmitGem = async (newGemData: any): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/gems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newGemData),
      });

      if (res.ok) {
        // Refresh profile stats and catalog
        await fetchUserProfile(token);
        await fetchGems();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failure submitting spot listing.', err);
      return false;
    }
  };

  // Bookmark / Save item toggle callback
  const handleToggleSaveGem = async (gemId: string): Promise<boolean> => {
    if (!token) {
      navigate('/login');
      return false;
    }
    try {
      const res = await fetch(`/api/gems/${gemId}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        await fetchUserProfile(token);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed toggling favorites state.', err);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Loading Explorer HUD...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-955 w-full flex flex-col font-sans select-none overflow-x-hidden antialiased transition-colors duration-300">
      <Navbar 
        user={user} 
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <main className="flex-1 w-full relative">
        <AnimatePresence mode="wait">
          <Routes>
            <Route 
              path="/" 
              element={
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                  <LandingPage onSearch={handleLandingQuerySubmit} />
                </motion.div>
              } 
            />
            <Route 
              path="/map" 
              element={
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                  <InteractiveMap
                    gems={gems}
                    onToggleSave={handleToggleSaveGem}
                    savedPlacesList={user && Array.isArray(user.savedPlaces) 
                      ? user.savedPlaces.map((p: any) => typeof p === 'object' && p._id ? p._id.toString() : p.toString()) 
                      : []}
                    initialSearch={landingSearchText}
                    initialCategory={landingCategoryText}
                    darkMode={darkMode}
                  />
                </motion.div>
              } 
            />
            <Route 
              path="/add" 
              element={
                <ProtectedRoute token={token}>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                    <AddLocation onSubmitGem={handleSubmitGem} darkMode={darkMode} />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute token={token}>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                    <ProfileDashboard
                      user={user}
                      gems={gems}
                      onToggleSave={handleToggleSaveGem}
                    />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/login" 
              element={<Login onLoginSuccess={handleLoginSuccess} />} 
            />
            <Route 
              path="/register" 
              element={<Register onRegisterSuccess={handleLoginSuccess} />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}
