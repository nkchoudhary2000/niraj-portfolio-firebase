import React, { useState } from 'react';
import { 
  addDoc, 
  collection, 
  doc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { Plus, Trash2, Edit2, ArrowUp, ArrowDown, FolderPlus, Check, X } from 'lucide-react';
import { db } from '../../firebase';

export default function CategoryManager({ categories }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(categories.length + 1);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await addDoc(collection(db, 'categories'), {
        name,
        description,
        order: Number(order),
        createdAt: new Date().toISOString()
      });
      setName('');
      setDescription('');
      setOrder(categories.length + 2);
    } catch (err) {
      console.error("Error adding category:", err);
      alert("Failed to add category: " + err.message);
    }
  };

  const handleDeleteCategory = async (id, catName) => {
    if (window.confirm(`Are you sure you want to delete category "${catName}"?`)) {
      try {
        await deleteDoc(doc(db, 'categories', id));
      } catch (err) {
        console.error("Delete category error:", err);
        alert(err.message);
      }
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDesc(category.description || '');
  };

  const saveEdit = async (id) => {
    try {
      await updateDoc(doc(db, 'categories', id), {
        name: editName,
        description: editDesc
      });
      setEditingId(null);
    } catch (err) {
      console.error("Update category error:", err);
      alert(err.message);
    }
  };

  const moveOrder = async (category, direction) => {
    const currentOrder = category.order || 0;
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    try {
      await updateDoc(doc(db, 'categories', category.id), { order: newOrder });
    } catch (err) {
      console.error("Order update error:", err);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Create New Category Form */}
      <div className="p-6 rounded-2xl glass-card border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FolderPlus className="w-5 h-5 text-cyan-400" />
          Create New Category Row
        </h3>

        <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vibe Code"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Experimental UI demos and creative web designs"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="sm:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-md hover:brightness-110 flex items-center justify-center gap-1.5"
              style={{ backgroundColor: 'var(--color-brand-500)' }}
            >
              <Plus className="w-4 h-4" /> Add Row
            </button>
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
          Active Dynamic Categories ({categories.length})
        </h4>

        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-4 rounded-xl glass-card border border-white/10 flex items-center justify-between gap-4"
          >
            {editingId === cat.id ? (
              <div className="flex-1 flex items-center gap-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="flex-1 px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
                <button
                  onClick={() => saveEdit(cat.id)}
                  className="p-1.5 bg-green-500/20 text-green-400 hover:bg-green-500 rounded-lg"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-1.5 bg-slate-800 text-slate-400 hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h5 className="font-bold text-white text-base">{cat.name}</h5>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400 border border-white/5 font-mono">
                    Order: {cat.order || 0}
                  </span>
                </div>
                {cat.description && (
                  <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
                )}
              </div>
            )}

            {/* Actions & Reordering */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => moveOrder(cat, 'up')}
                title="Move Up"
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => moveOrder(cat, 'down')}
                title="Move Down"
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => startEdit(cat)}
                title="Edit Row"
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                title="Delete Row"
                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
