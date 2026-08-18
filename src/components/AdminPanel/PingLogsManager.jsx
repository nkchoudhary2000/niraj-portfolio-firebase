import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc, 
  doc, 
  getDocs 
} from 'firebase/firestore';
import { 
  Terminal, 
  Play, 
  Trash2, 
  Clock, 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Calendar,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { db } from '../../firebase';
import { executePortfolioPing, getTodayDateString } from '../../utils/pingService';

export default function PingLogsManager({ portfolioItems = [] }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRunningPing, setIsRunningPing] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [pingMessage, setPingMessage] = useState(null);

  // Subscribe to real-time ping logs from Firestore
  useEffect(() => {
    const logsRef = collection(db, 'ping_logs');
    const q = query(logsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logList = [];
      snapshot.forEach(docSnap => {
        logList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setLogs(logList);
      
      // Auto-expand the latest log by default if not set
      if (logList.length > 0 && !expandedLogId) {
        setExpandedLogId(logList[0].id);
      }
      setLoading(false);
    }, (err) => {
      console.error("Ping logs listener error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const todayStr = getTodayDateString();
  const hasPingedToday = logs.some(l => l.dateKey === todayStr);

  // Trigger manual curl ping
  const handleTriggerManualPing = async () => {
    if (isRunningPing) return;
    setIsRunningPing(true);
    setPingMessage(null);

    try {
      const res = await executePortfolioPing(portfolioItems, 'admin_manual');
      if (res.success) {
        setPingMessage({
          type: 'success',
          text: `Successfully executed curl ping to ${res.count} live portfolio URLs!`
        });
      } else {
        setPingMessage({
          type: 'error',
          text: res.message || 'Manual ping execution failed.'
        });
      }
    } catch (err) {
      console.error("Manual ping error:", err);
      setPingMessage({
        type: 'error',
        text: `Error triggering ping: ${err.message}`
      });
    } finally {
      setIsRunningPing(false);
    }
  };

  // Clear log entry
  const handleDeleteLog = async (logId) => {
    if (window.confirm("Are you sure you want to delete this curl ping log entry?")) {
      try {
        await deleteDoc(doc(db, 'ping_logs', logId));
      } catch (err) {
        console.error("Delete log error:", err);
        alert("Failed to delete log: " + err.message);
      }
    }
  };

  // Clear all logs
  const handleClearAllLogs = async () => {
    if (logs.length === 0) return;
    if (window.confirm("Are you sure you want to clear ALL historical curl logs?")) {
      try {
        const querySnapshot = await getDocs(collection(db, 'ping_logs'));
        const deletePromises = [];
        querySnapshot.forEach((docSnap) => {
          deletePromises.push(deleteDoc(doc(db, 'ping_logs', docSnap.id)));
        });
        await Promise.all(deletePromises);
        setPingMessage({ type: 'success', text: 'All ping logs successfully cleared.' });
      } catch (err) {
        console.error("Clear logs error:", err);
        alert("Failed to clear logs: " + err.message);
      }
    }
  };

  const livePortfolioItemsCount = portfolioItems.filter(
    i => i.liveUrl && typeof i.liveUrl === 'string' && i.liveUrl.trim().startsWith('http')
  ).length;

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
        <span>Loading daily portfolio curl logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            Daily Portfolio Curl & Ping Monitor
          </h3>
          <p className="text-xs text-slate-400">
            Automatically curls all live portfolio webpage links once per day when the site is visited. Tracks health, execution times, and site response logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerManualPing}
            disabled={isRunningPing}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isRunningPing ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>{isRunningPing ? 'Curling Websites...' : 'Run Curl Now'}</span>
          </button>

          {logs.length > 0 && (
            <button
              onClick={handleClearAllLogs}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 flex items-center gap-1.5 transition-all"
              title="Clear all log history"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Alert Banner */}
      {pingMessage && (
        <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
          pingMessage.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {pingMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{pingMessage.text}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Today's Curl Status</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            {hasPingedToday ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Executed Today ({todayStr})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" /> Pending Site Load Run
              </span>
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Live Portfolio Links</span>
            <Globe className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {livePortfolioItemsCount} <span className="text-xs font-medium text-slate-400">Websites Monitored</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Curl Runs Logged</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {logs.length} <span className="text-xs font-medium text-slate-400">Daily Log History</span>
          </div>
        </div>
      </div>

      {/* Logs List */}
      {logs.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-white/5 bg-slate-900/30 text-slate-400 space-y-3">
          <Terminal className="w-10 h-10 mx-auto text-slate-600" />
          <div>
            <p className="font-semibold text-sm text-slate-300">No curl logs recorded yet.</p>
            <p className="text-xs text-slate-500 mt-1">
              When visitors load your website, all live portfolio links will be automatically pinged once per day and logged here.
            </p>
          </div>
          <button
            onClick={handleTriggerManualPing}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/30 inline-flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-cyan-300" /> Run First Curl Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const formattedTime = log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A';
            const isToday = log.dateKey === todayStr;

            return (
              <div
                key={log.id}
                className={`rounded-2xl border transition-all glass-card overflow-hidden ${
                  isToday 
                    ? 'border-cyan-500/30 bg-cyan-950/10' 
                    : 'border-white/10 bg-slate-900/40'
                }`}
              >
                {/* Header Row */}
                <div 
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-white/10 shrink-0">
                      <Terminal className="w-5 h-5 text-cyan-400" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          Curl Log: {log.dateKey || 'Daily Run'}
                        </span>

                        {isToday && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            TODAY
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {log.triggeredBy === 'admin_manual' ? 'Admin Manual Run' : 'Auto Site Load'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {formattedTime}
                        </span>
                        <span>•</span>
                        <span className="text-slate-300 font-medium">
                          {log.totalLinks || log.logs?.length || 0} Portfolios Pinged
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLog(log.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete log entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button className="p-1.5 text-slate-400 hover:text-white">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Table */}
                {isExpanded && (
                  <div className="border-t border-white/10 p-4 bg-slate-950/60 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider pb-1">
                      <span>Portfolio Webpage Ping Details</span>
                      <span>{log.logs?.length || 0} Targets</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-slate-400 font-semibold">
                            <th className="pb-2 pl-2">Project Title</th>
                            <th className="pb-2">Target Webpage URL</th>
                            <th className="pb-2">Response Status</th>
                            <th className="pb-2 pr-2 text-right">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {log.logs && log.logs.map((itemLog, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                              <td className="py-2.5 pl-2 font-semibold text-white">
                                {itemLog.title}
                              </td>

                              <td className="py-2.5">
                                <a
                                  href={itemLog.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                                >
                                  <span className="truncate max-w-[220px] sm:max-w-[320px]">{itemLog.url}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                              </td>

                              <td className="py-2.5">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                  itemLog.isSuccess !== false
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}>
                                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                                  {itemLog.status || 'Ping Sent (OK)'}
                                </span>
                              </td>

                              <td className="py-2.5 pr-2 text-right font-mono text-slate-400">
                                {itemLog.durationMs ? `${itemLog.durationMs}ms` : 'Fast'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
