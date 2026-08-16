import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { X, Clock, CheckCircle, XCircle, MessageSquare, Shield, RefreshCw } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function MyRequestsModal({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !isOpen) return;

    const reqRef = collection(db, 'action_requests');
    const q = query(
      reqRef, 
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort manually by date desc
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRequests(list);
      setLoading(false);
    }, (err) => {
      console.error("My requests listener error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl p-6 rounded-2xl glass-modal border border-white/10 text-white space-y-6 shadow-2xl animate-fade-in max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">My Action Requests</h3>
              <p className="text-xs text-slate-400">Track status of your privilege & action requests</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="overflow-y-auto space-y-3 pr-1 flex-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
              <span>Fetching request status...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Clock className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">You have not submitted any permission requests yet.</p>
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-white/10 bg-slate-900/60 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">
                    {req.requestTitle || req.requestedPermission || 'Permission Request'}
                  </span>

                  {req.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Clock className="w-3 h-3 animate-pulse" /> PENDING
                    </span>
                  )}
                  {req.status === 'approved' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle className="w-3 h-3 text-emerald-400" /> APPROVED
                    </span>
                  )}
                  {req.status === 'rejected' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      <XCircle className="w-3 h-3 text-rose-400" /> REJECTED
                    </span>
                  )}
                </div>

                <p className="text-slate-300 bg-slate-950/50 p-2.5 rounded-lg border border-white/5">
                  <strong className="text-slate-400 block text-[10px] uppercase">Reason Submitted:</strong>
                  {req.reason}
                </p>

                {req.adminNote && (
                  <div className="text-slate-300 bg-purple-950/20 p-2.5 rounded-lg border border-purple-500/20 flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-purple-300 block text-[10px] uppercase">Admin Response:</strong>
                      <span>{req.adminNote}</span>
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-slate-500 text-right">
                  Submitted: {new Date(req.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
