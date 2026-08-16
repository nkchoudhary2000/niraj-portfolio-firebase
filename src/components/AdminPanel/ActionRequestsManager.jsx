import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  getDoc 
} from 'firebase/firestore';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  UserCheck, 
  MessageSquare, 
  RefreshCw, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Shield, 
  Search 
} from 'lucide-react';
import { db } from '../../firebase';

export default function ActionRequestsManager() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [adminNotes, setAdminNotes] = useState({});
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const reqRef = collection(db, 'action_requests');
    const q = query(reqRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setRequests(list);
      setLoading(false);
    }, (err) => {
      console.error("Action requests listener error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (request) => {
    setProcessingId(request.id);
    const note = adminNotes[request.id] || 'Request approved by administrator.';

    try {
      // 1. Update Request document
      const requestRef = doc(db, 'action_requests', request.id);
      await updateDoc(requestRef, {
        status: 'approved',
        adminNote: note,
        updatedAt: new Date().toISOString()
      });

      // 2. Grant requested privilege to user if requestedPermission is specified
      const permKey = request.requestedPermission || 'canAddProject';
      const userRef = doc(db, 'users', request.userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const currentPrivs = userData.privileges || {};
        await updateDoc(userRef, {
          privileges: {
            ...currentPrivs,
            [permKey]: true
          }
        });
      }

      // Reset note input
      setAdminNotes(prev => ({ ...prev, [request.id]: '' }));
    } catch (err) {
      console.error("Error approving request:", err);
      alert("Approval error: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request) => {
    setProcessingId(request.id);
    const note = adminNotes[request.id] || 'Request rejected by administrator.';

    try {
      const requestRef = doc(db, 'action_requests', request.id);
      await updateDoc(requestRef, {
        status: 'rejected',
        adminNote: note,
        updatedAt: new Date().toISOString()
      });

      setAdminNotes(prev => ({ ...prev, [request.id]: '' }));
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert("Rejection error: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesSearch = 
      req.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requestType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
        <span>Loading action & privilege requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-400" />
            User Action & Privilege Requests
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pendingCount} Pending
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400">
            Review requests submitted by users asking for permission to add projects or perform actions. Approving automatically grants the user privilege!
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search request or email..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              filterStatus === status
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {status} ({status === 'all' ? requests.length : requests.filter(r => r.status === status).length})
          </button>
        ))}
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="py-12 text-center rounded-xl border border-white/5 bg-slate-900/30 text-slate-400">
          <Clock className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <p className="font-semibold text-sm">No action requests found matching filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className={`p-5 rounded-2xl border transition-all glass-card ${
                req.status === 'pending'
                  ? 'border-amber-500/30 bg-amber-950/10'
                  : req.status === 'approved'
                  ? 'border-emerald-500/20 bg-emerald-950/10'
                  : 'border-rose-500/20 bg-rose-950/10'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Left Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-sm">
                      {req.userName || 'User'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ({req.userEmail})
                    </span>

                    {/* Status Badge */}
                    {req.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Clock className="w-3 h-3 animate-pulse" /> PENDING REVIEW
                      </span>
                    )}
                    {req.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle className="w-3 h-3 text-emerald-400" /> APPROVED & GRANTED
                      </span>
                    )}
                    {req.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        <XCircle className="w-3 h-3 text-rose-400" /> REJECTED
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-purple-500/20 font-medium">
                      Requested Action: {req.requestTitle || req.requestType || 'Permission Request'}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {new Date(req.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-white/5">
                    <span className="font-semibold text-slate-400 block mb-0.5">User Note / Rationale:</span>
                    {req.reason || 'No additional rationale provided.'}
                  </p>

                  {/* Project Draft Details if provided */}
                  {req.projectDraft && (
                    <div className="text-xs bg-slate-950/80 p-3 rounded-xl border border-cyan-500/20 space-y-1">
                      <span className="font-bold text-cyan-400 block">Proposed Project Details:</span>
                      <div><strong className="text-slate-300">Title:</strong> {req.projectDraft.title}</div>
                      <div><strong className="text-slate-300">Description:</strong> {req.projectDraft.description}</div>
                      {req.projectDraft.demoUrl && <div><strong className="text-slate-300">Demo URL:</strong> {req.projectDraft.demoUrl}</div>}
                    </div>
                  )}

                  {/* Admin Note if already processed */}
                  {req.adminNote && (
                    <p className="text-xs text-slate-400 italic flex items-center gap-1.5 pt-1">
                      <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                      <span>Admin Response: {req.adminNote}</span>
                    </p>
                  )}
                </div>

                {/* Actions for Pending Requests */}
                {req.status === 'pending' && (
                  <div className="space-y-2 md:w-64 shrink-0">
                    <input
                      type="text"
                      placeholder="Optional admin note..."
                      value={adminNotes[req.id] || ''}
                      onChange={(e) => setAdminNotes({ ...adminNotes, [req.id]: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(req)}
                        disabled={processingId === req.id}
                        className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 flex items-center justify-center gap-1 transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve & Grant
                      </button>

                      <button
                        onClick={() => handleReject(req)}
                        disabled={processingId === req.id}
                        className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 flex items-center justify-center gap-1 transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
