import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function HeroBanner({ 
  selectedCategory, 
  setSelectedCategory,
  categories,
  onOpenAddModal
}) {
  const { currentUser } = useAuth();

  return (
    <div className="relative py-8 md:py-12 px-4 sm:px-6 lg:px-8 mb-6 border-b border-white/5">
      {/* Subtle Background Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[200px] rounded-full blur-[100px] opacity-15 pointer-events-none"
        style={{ backgroundColor: 'var(--color-brand-500)' }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        
        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3"
        >
          Portfolio <span className="text-gradient" style={{ backgroundImage: 'linear-gradient(to right, var(--color-brand-accent), #38bdf8)' }}>Showcase</span>
        </motion.h1>

        {/* Category Pill Filters */}
        {categories.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center flex-wrap gap-2 mt-4"
          >
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                selectedCategory === 'all'
                  ? 'bg-slate-800 text-cyan-400 border-cyan-500/50 shadow-md'
                  : 'bg-slate-900/50 text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              All Projects
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-slate-800 text-cyan-400 border-cyan-500/50 shadow-md'
                    : 'bg-slate-900/50 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}

            {/* Render Add Project shortcut inside pill row if user is signed in */}
            {currentUser && (
              <button
                onClick={onOpenAddModal}
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-white transition-all shadow-md hover:brightness-110 flex items-center gap-1"
                style={{ backgroundColor: 'var(--color-brand-500)' }}
              >
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
