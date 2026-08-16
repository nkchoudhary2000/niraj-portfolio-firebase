import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db } from './firebase';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import PortfolioGrid from './components/PortfolioGrid';
import AdminDashboard from './components/AdminPanel/AdminDashboard';
import AuthModal from './components/AuthModal';
import AddPortfolioModal from './components/AddPortfolioModal';
import EditPortfolioModal from './components/EditPortfolioModal';
import Footer from './components/Footer';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const [activeTab, setActiveTab] = useState('showcase'); // 'showcase' | 'admin'
  const [categories, setCategories] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [defaultAddCategory, setDefaultAddCategory] = useState('');
  
  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);

  const { theme } = useTheme();

  // 1. Listen for dynamic Categories from Firestore in real-time
  useEffect(() => {
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, orderBy('order', 'asc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        await seedDefaultCategories();
      } else {
        const catList = [];
        snapshot.forEach((docSnap) => {
          catList.push({ id: docSnap.id, ...docSnap.data() });
        });
        setCategories(catList);
      }
    }, (err) => console.error("Categories snapshot error:", err));

    return () => unsubscribe();
  }, []);

  // 2. Listen for Portfolio Items from Firestore in real-time
  useEffect(() => {
    const itemsRef = collection(db, 'portfolio_items');

    const unsubscribe = onSnapshot(itemsRef, (snapshot) => {
      const itemList = [];
      snapshot.forEach((docSnap) => {
        itemList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setPortfolioItems(itemList);
    }, (err) => console.error("Portfolio items snapshot error:", err));

    return () => unsubscribe();
  }, []);

  // Initial Seed Helper: Categories
  const seedDefaultCategories = async () => {
    const initialCategories = [
      { name: "Vibe Code", description: "Experimental UI demos and creative web experiences", order: 1 },
      { name: "Personal Grid", description: "Featured personal projects and open source tools", order: 2 },
      { name: "Client Work", description: "Production web applications built for clients", order: 3 },
      { name: "Normal Grid", description: "Standard utility apps and portfolios", order: 4 }
    ];

    try {
      for (const cat of initialCategories) {
        await addDoc(collection(db, 'categories'), {
          ...cat,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn("Seeding categories notice:", err);
    }
  };

  // Delete Portfolio Item
  const handleDeletePortfolioItem = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this portfolio project?")) {
      try {
        await deleteDoc(doc(db, 'portfolio_items', itemId));
      } catch (err) {
        console.error("Delete portfolio item error:", err);
        alert("Delete failed: " + err.message);
      }
    }
  };

  // Trigger Edit Item
  const handleEditPortfolioItem = (item) => {
    setEditingItem(item);
  };

  const handleOpenAddModal = (catId = '') => {
    setDefaultAddCategory(catId);
    setIsAddModalOpen(true);
  };

  // Only pass categories that contain items to HeroBanner pill selection
  const categoriesWithItems = categories.filter(category => 
    portfolioItems.some(item => item.categoryId === category.id)
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme.mode === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAddModal={() => handleOpenAddModal()}
      />

      {/* Main Content View */}
      <main>
        {activeTab === 'showcase' ? (
          <>
            <HeroBanner
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categoriesWithItems}
              onOpenAddModal={() => handleOpenAddModal()}
            />

            <PortfolioGrid
              categories={categories}
              portfolioItems={portfolioItems}
              selectedCategory={selectedCategory}
              onDeleteCategoryItem={handleDeletePortfolioItem}
              onEditCategoryItem={handleEditPortfolioItem}
              onOpenAddModal={handleOpenAddModal}
            />
          </>
        ) : (
          <AdminDashboard categories={categories} />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <AddPortfolioModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        defaultCategoryId={defaultAddCategory}
      />

      <EditPortfolioModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem}
        categories={categories}
      />
    </div>
  );
}
