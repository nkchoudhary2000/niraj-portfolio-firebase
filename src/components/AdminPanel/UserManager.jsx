import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { ShieldCheck, ShieldAlert, User, Search, RefreshCw } from 'lucide-react';
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

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { role: newRole });
    } catch (err) {
      console.error("Failed to update user role:", err);
      alert("Permission denied or Firestore error: " + err.message);
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

  return (
    <div className="space-y-6">
      
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            User Role Management
          </h3>
          <p className="text-xs text-slate-400">
            View registered accounts and assign Admin privileges. The first user auto-received the Admin role.
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
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Current Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3 flex items-center gap-3">
                  <img
                    src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                  />
                  <div>
                    <span className="font-semibold text-white block">
                      {user.displayName || 'No Name'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      UID: {user.id.substring(0, 8)}...
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-slate-300">{user.email}</td>
                <td className="px-4 py-3">
                  {user.role === 'admin' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      <ShieldCheck className="w-3 h-3" /> ADMIN
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                      <User className="w-3 h-3" /> USER
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleUserRole(user)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                      user.role === 'admin'
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30'
                        : 'bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border-cyan-500/30'
                    }`}
                  >
                    {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
