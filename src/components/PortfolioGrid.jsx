import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { FolderGit2, Plus } from 'lucide-react';
import PortfolioCard from './PortfolioCard';
import { useAuth } from '../context/AuthContext';

export default function PortfolioGrid({ 
  categories, 
  portfolioItems, 
  selectedCategory, 
  onDeleteCategoryItem,
  onEditCategoryItem,
  onOpenAddModal
}) {
  const { currentUser } = useAuth();
  
  // Filter portfolio items based on selected category pill
  const filteredItems = portfolioItems.filter(item => {
    return selectedCategory === 'all' || item.categoryId === selectedCategory;
  });

  // Group items by category
  const activeCategories = selectedCategory === 'all' 
    ? categories 
    : categories.filter(c => c.id === selectedCategory);

  // Filter categories to ONLY include those with active portfolio items
  const nonEmpytCategories = activeCategories.filter(category => 
    filteredItems.some(item => item.categoryId === category.id)
  );

  const hasAnyItems = nonEmpytCategories.length > 0;

  if (!hasAnyItems) {
    return (
      <div className="max-w-7xl mx-auto px-4 text-center py-16 text-slate-400 text-sm font-medium">
        No portfolio projects published under selected category.
        {currentUser && (
          <div className="mt-4">
            <button
              onClick={() => onOpenAddModal()}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-md hover:brightness-110 inline-flex items-center gap-1.5"
              style={{ backgroundColor: 'var(--color-brand-500)' }}
            >
              <Plus className="w-4 h-4" /> Submit First Project
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-12">
      {nonEmpytCategories.map((category) => {
        const categoryItems = filteredItems.filter(item => item.categoryId === category.id);

        return (
          <section key={category.id} className="space-y-4">
            {/* Category Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0"
                  style={{ backgroundColor: 'var(--color-brand-500)' }}
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2">
                  <span>{category.name}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold border border-white/5">
                    {categoryItems.length}
                  </span>
                </h2>
              </div>

              {/* Show Add Shortcut ONLY to Logged-in Users */}
              {currentUser && (
                <button
                  onClick={() => onOpenAddModal(category.id)}
                  className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              )}
            </div>

            {/* Grid Layout: Desktop Strictly 5 Columns (lg:grid-cols-5) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              <AnimatePresence>
                {categoryItems.map((item) => (
                  <PortfolioCard
                    key={item.id}
                    item={item}
                    categoryName={category.name}
                    onDelete={onDeleteCategoryItem}
                    onEdit={onEditCategoryItem}
                  />
                ))}
              </AnimatePresence>
            </div>
          </section>
        );
      })}
    </div>
  );
}
