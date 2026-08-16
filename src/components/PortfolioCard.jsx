import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Trash2, Edit2, Globe, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PortfolioCard({ item, categoryName, onDelete, onEdit }) {
  const { currentUser, isAdmin } = useAuth();
  const canModify = isAdmin || (currentUser && currentUser.uid === item.userId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="group relative rounded-2xl overflow-hidden glass-card border border-white/10 hover:border-cyan-500/40 transition-all duration-300 flex flex-col h-full hover:shadow-2xl hover:shadow-cyan-500/10"
    >
      {/* Thumbnail Image Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        <img
          src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop'}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Category Tag Badge */}
        {categoryName && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {categoryName}
          </div>
        )}

        {/* Edit & Delete Action Buttons for Owner or Admin */}
        {canModify && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={() => onEdit(item)}
                title="Edit Project"
                className="p-1.5 rounded-full bg-slate-900/90 hover:bg-cyan-500 text-slate-300 hover:text-white backdrop-blur-md border border-white/10 transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onDelete(item.id)}
              title="Delete Item"
              className="p-1.5 rounded-full bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white backdrop-blur-md border border-red-500/30 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Card Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-base text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Links Footer */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end gap-2">
          {item.githubUrl && (
            <a
              href={item.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="View GitHub Repository"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-white/5"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
          )}
          {item.liveUrl && (
            <a
              href={item.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Live Webpage"
              className="p-1.5 rounded-lg text-white font-medium text-xs transition-all hover:brightness-110 flex items-center gap-1"
              style={{ backgroundColor: 'var(--color-brand-500)' }}
            >
              <Globe className="w-3.5 h-3.5" />
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
