import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  PlusCircle, 
  LogOut, 
  LogIn, 
  LayoutGrid, 
  Sliders,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenAuth, 
  onOpenAddModal 
}) {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const { theme, toggleMode } = useTheme();

  return (
    <header className={`sticky top-0 z-40 w-full transition-colors ${
      theme.mode === 'dark' ? 'glass-nav text-white' : 'glass-nav-light text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('showcase')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105"
            style={{ backgroundColor: 'var(--color-brand-500)' }}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight flex items-center gap-2">
              <span className={theme.mode === 'dark' ? 'text-white' : 'text-slate-900'}>
                Niraj Portfolio
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              Web Creations & Work
            </p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Showcase View Button */}
          <button
            onClick={() => setActiveTab('showcase')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'showcase' 
                ? (theme.mode === 'dark' ? 'bg-slate-800 text-white border border-white/10' : 'bg-white text-slate-900 border border-slate-200 shadow-sm')
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Showcase</span>
          </button>

          {/* Admin Panel Button (Restricted to Admin role) */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'admin' 
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' 
                  : 'text-purple-400 hover:bg-purple-900/20'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Admin Hub</span>
            </button>
          )}

          {/* Light / Dark Mode Toggle Button (Works for all visitors) */}
          <button
            onClick={toggleMode}
            title="Toggle Light/Dark Theme"
            className={`p-2 rounded-lg border transition-colors ${
              theme.mode === 'dark' 
                ? 'bg-slate-800/80 hover:bg-slate-800 text-amber-400 border-white/10' 
                : 'bg-slate-200/80 hover:bg-slate-300 text-slate-800 border-slate-300'
            }`}
          >
            {theme.mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Add Project Button (Available to Authenticated Users Only) */}
          {currentUser && (
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow-md hover:brightness-110 active:scale-95"
              style={{ backgroundColor: 'var(--color-brand-500)' }}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </button>
          )}

          {/* User Profile / Auth State */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700/50">
              <img
                src={userProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`}
                alt="Avatar"
                className="w-7 h-7 rounded-full border border-cyan-500/40 object-cover"
              />
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold flex items-center gap-1">
                  {userProfile?.displayName || currentUser.email.split('@')[0]}
                  {isAdmin && <ShieldCheck className="w-3 h-3 text-cyan-400" />}
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
