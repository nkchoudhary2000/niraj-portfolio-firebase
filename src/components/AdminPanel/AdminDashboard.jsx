import React, { useState } from 'react';
import { Users, FolderTree, Palette, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import UserManager from './UserManager';
import CategoryManager from './CategoryManager';
import ThemeManager from './ThemeManager';

export default function AdminDashboard({ categories }) {
  const [activeTab, setActiveTab] = useState('users');
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 rounded-2xl glass-card text-center border border-red-500/30">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-sm text-slate-400 mt-2">
          You do not have Administrator permissions. The first account created automatically receives the Admin role.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Admin Control Center
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              ROLE: ADMIN
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage user roles, dynamic category rows, and global theme customization.
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'users'
              ? 'bg-slate-800 text-white shadow-lg border border-white/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Users className="w-4 h-4 text-cyan-400" />
          <span>User Role Management</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'categories'
              ? 'bg-slate-800 text-white shadow-lg border border-white/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <FolderTree className="w-4 h-4 text-purple-400" />
          <span>Dynamic Category Builder</span>
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'theme'
              ? 'bg-slate-800 text-white shadow-lg border border-white/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Palette className="w-4 h-4 text-amber-400" />
          <span>Theme & UI Control</span>
        </button>
      </div>

      {/* Tab Views */}
      <div className="pt-4">
        {activeTab === 'users' && <UserManager />}
        {activeTab === 'categories' && <CategoryManager categories={categories} />}
        {activeTab === 'theme' && <ThemeManager />}
      </div>
    </div>
  );
}
