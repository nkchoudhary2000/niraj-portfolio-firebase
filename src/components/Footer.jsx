import React from 'react';
import { Sparkles, Github, Globe, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5 bg-slate-950/60 py-10 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-300">Portfolio Hub</span>
          <span>• Built with React, Tailwind CSS, Framer Motion & Firebase</span>
        </div>

        <div className="flex items-center gap-4 text-slate-500">
          <span>Firebase Free Spark Plan</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            Crafted with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for Niraj
          </span>
        </div>
      </div>
    </footer>
  );
}
