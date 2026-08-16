import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { X, Send, ShieldAlert, Sparkles, PlusCircle } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function RequestActionModal({ 
  isOpen, 
  onClose, 
  defaultRequestType = 'canAddProject', 
  defaultRequestTitle = 'Request Project Addition Permission'
}) {
  const { currentUser, userProfile } = useAuth();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestedPermission, setRequestedPermission] = useState(defaultRequestType);
  const [successMessage, setSuccessMessage] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("You must be logged in to submit a request.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'action_requests'), {
        userId: currentUser.uid,
        userEmail: currentUser.email || 'No email',
        userName: userProfile?.displayName || currentUser.email?.split('@')[0] || 'User',
        requestedPermission: requestedPermission,
        requestTitle: defaultRequestTitle,
        reason: reason.trim() || 'Requested privilege permission from Admin.',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
        setReason('');
        onClose();
      }, 1800);
    } catch (err) {
      console.error("Error submitting request:", err);
      alert("Failed to submit request: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg p-6 rounded-2xl glass-modal border border-white/10 text-white space-y-6 shadow-2xl animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Request Action Privilege
              </h3>
              <p className="text-xs text-slate-400">
                Ask Admin for permissions or custom action privileges
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMessage ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Request Submitted Successfully!</h4>
            <p className="text-xs text-slate-400">
              The Admin will review your request. You can check status anytime in "My Requests".
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Permission Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Requested Action Privilege:
              </label>
              <select
                value={requestedPermission}
                onChange={(e) => setRequestedPermission(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="canAddProject">Permission to Add Portfolio Projects (canAddProject)</option>
                <option value="canEditProject">Permission to Edit Portfolio Projects (canEditProject)</option>
                <option value="canDeleteProject">Permission to Delete Portfolio Projects (canDeleteProject)</option>
                <option value="canManageCategories">Permission to Manage Dynamic Categories</option>
                <option value="canManageTheme">Permission to Customize Theme & UI</option>
              </select>
            </div>

            {/* Rationale Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Message / Rationale for Admin:
              </label>
              <textarea
                required
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why you are requesting this privilege or describe your project..."
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Submitting...' : 'Send Request to Admin'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
