import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { 
  ShieldCheck, 
  User, 
  Search, 
  RefreshCw, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  FolderTree, 
  Palette,
  Check,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

export default function UserManager() {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setUsersList(list);
      setLoading(false);
    }, (error) => {
      console.error("User list snapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleUserRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    
    // Prevent self-demotion if only one admin left
    if (user.id === currentUser.uid && newRole === 'user') {
      const adminCount = usersList.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        alert("You cannot demote yourself because you are the sole admin!");
        return;
      }
    }

    const updatedPrivileges = newRole === 'admin' ? {
      canAddProject: true,
      canEditProject: true,
      canDeleteProject: true,
      canManageCategories: true,
      canManageTheme: true
    } : (user.privileges || {
      canAddProject: false,
      canEditProject: false,
      canDeleteProject: false,
      canManageCategories: false,
      canManageTheme: false
    });

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { 
        role: newRole,
        privileges: updatedPrivileges 
      });
    } catch (err) {
      console.error("Failed to update user role:", err);
      alert("Permission denied or Firestore error: " + err.message);
    }
  };

  const togglePrivilege = async (user, permKey) => {
    if (user.role === 'admin') {
      alert("Admin accounts inherently possess all privileges.");
      return;
    }

    const currentPrivileges = user.privileges || {
      canAddProject: false,
      canEditProject: false,
      canDeleteProject: false,
      canManageCategories: false,
      canManageTheme: false
    };

    const newPrivileges = {
      ...currentPrivileges,
      [permKey]: !currentPrivileges[permKey]
    };

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { privileges: newPrivileges });
    } catch (err) {
      console.error("Failed to toggle privilege:", err);
      alert("Failed to update permission: " + err.message);
    }
  };

  const applyRolePreset = async (user, presetName) => {
    let newPrivileges = {
      canAddProject: false,
      canEditProject: false,
      canDeleteProject: false,
      canManageCategories: false,
      canManageTheme: false
    };

    if (presetName === 'Editor') {
      newPrivileges = {
        canAddProject: true,
        canEditProject: true,
        canDeleteProject: true,
        canManageCategories: false,
        canManageTheme: false
      };
    } else if (presetName === 'Contributor') {
      newPrivileges = {
        canAddProject: true,
        canEditProject: true,
        canDeleteProject: false,
        canManageCategories: false,
        canManageTheme: false
      };
    }

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { privileges: newPrivileges });
    } catch (err) {
      console.error("Failed to apply role preset:", err);
      alert("Error updating preset: " + err.message);
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.email?.toLowerCase().includes(filterQuery.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(filterQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
        <span>Loading registered users...</span>
      </div>
    );
  }

  const privilegeConfig = [
    { key: 'canAddProject', label: 'Add Projects', icon: PlusCircle, color: 'text-emerald-400' },
    { key: 'canEditProject', label: 'Edit Projects', icon: Edit3, color: 'text-cyan-400' },
    { key: 'canDeleteProject', label: 'Delete Projects', icon: Trash2, color: 'text-rose-400' },
    { key: 'canManageCategories', label: 'Categories', icon: FolderTree, color: 'text-purple-400' },
    { key: 'canManageTheme', label: 'Theme/UI', icon: Palette, color: 'text-amber-400' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            User Role & Privilege Management
          </h3>
          <p className="text-xs text-slate-400">
            Assign custom action privileges to individual users or toggle Admin status. Click any privilege pill to grant or revoke specific actions.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search email or name..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 glass-card">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
            <tr>
              <th className="px-4 py-3">User Profile</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Defined Privileges & Permissions</th>
              <th className="px-4 py-3 text-right">Admin Role Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {filteredUsers.map((user) => {
              const isAdminUser = user.role === 'admin';
              const userPrivs = user.privileges || {};

              return (
                <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* User info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                        alt="User Avatar"
                        className="w-9 h-9 rounded-full border border-slate-700 object-cover"
                      />
                      <div>
                        <span className="font-semibold text-white block">
                          {user.displayName || 'No Name'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Current Role Badge */}
                  <td className="px-4 py-3">
                    {isAdminUser ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> ADMIN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" /> USER
                      </span>
                    )}
                  </td>

                  {/* Granular Privilege Toggles */}
                  <td className="px-4 py-3">
                    {isAdminUser ? (
                      <span className="text-[11px] italic text-purple-300/80">
                        Full Administrator Privileges Granted
                      </span>
                    ) : (
                      <div className="space-y-2">
                        {/* Preset Quick Buttons */}
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="text-slate-500">Presets:</span>
                          <button
                            onClick={() => applyRolePreset(user, 'Contributor')}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                          >
                            Contributor (Add+Edit)
                          </button>
                          <button
                            onClick={() => applyRolePreset(user, 'Editor')}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700"
                          >
                            Full Editor
                          </button>
                        </div>

                        {/* Individual Toggles */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {privilegeConfig.map((priv) => {
                            const IconComponent = priv.icon;
                            const isGranted = !!userPrivs[priv.key];

                            return (
                              <button
                                key={priv.key}
                                onClick={() => togglePrivilege(user, priv.key)}
                                title={`Click to ${isGranted ? 'revoke' : 'grant'} ${priv.label}`}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium flex items-center gap-1 transition-all border ${
                                  isGranted
                                    ? 'bg-slate-800/90 text-white border-cyan-500/40 shadow-sm'
                                    : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-400'
                                }`}
                              >
                                <IconComponent className={`w-3 h-3 ${isGranted ? priv.color : 'text-slate-600'}`} />
                                <span>{priv.label}</span>
                                {isGranted ? (
                                  <Check className="w-2.5 h-2.5 text-emerald-400 ml-0.5" />
                                ) : (
                                  <X className="w-2.5 h-2.5 text-slate-600 ml-0.5" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Admin Promote/Demote */}
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleUserRole(user)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        isAdminUser
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30'
                          : 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border-purple-500/30'
                      }`}
                    >
                      {isAdminUser ? 'Demote to User' : 'Promote to Admin'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

