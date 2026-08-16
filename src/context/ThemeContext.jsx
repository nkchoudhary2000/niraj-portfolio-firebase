import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const PRESET_THEMES = [
  { name: 'Cyan Glow', primary: '#0284c7', accent: '#38bdf8', glow: 'rgba(2, 132, 199, 0.4)' },
  { name: 'Purple Nebula', primary: '#9333ea', accent: '#c084fc', glow: 'rgba(147, 51, 234, 0.4)' },
  { name: 'Emerald Cyber', primary: '#059669', accent: '#34d399', glow: 'rgba(5, 150, 105, 0.4)' },
  { name: 'Sunset Orange', primary: '#ea580c', accent: '#fb923c', glow: 'rgba(234, 88, 12, 0.4)' },
  { name: 'Neon Rose', primary: '#e11d48', accent: '#fb7185', glow: 'rgba(225, 29, 72, 0.4)' }
];

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    mode: 'dark',
    primaryColor: '#0284c7',
    accentColor: '#38bdf8',
    glowColor: 'rgba(2, 132, 199, 0.4)',
    themeName: 'Cyan Glow'
  });

  // Listen to Firestore theme settings in real-time
  useEffect(() => {
    const themeRef = doc(db, 'settings', 'theme');
    const unsubscribe = onSnapshot(themeRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTheme(prev => ({
          ...prev,
          mode: data.mode || prev.mode || 'dark',
          primaryColor: data.primaryColor || '#0284c7',
          accentColor: data.accentColor || '#38bdf8',
          glowColor: data.glowColor || 'rgba(2, 132, 199, 0.4)',
          themeName: data.themeName || 'Cyan Glow'
        }));
      }
    }, (error) => {
      console.warn("Theme settings fetch fallback to default:", error);
    });

    return () => unsubscribe();
  }, []);

  // Apply theme to DOM root
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    if (theme.mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      body.className = "bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-white transition-colors duration-300";
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      body.className = "bg-slate-100 text-slate-900 antialiased selection:bg-cyan-500 selection:text-white transition-colors duration-300";
    }

    // Set dynamic CSS variables
    root.style.setProperty('--color-brand-500', theme.primaryColor);
    root.style.setProperty('--color-brand-600', theme.primaryColor);
    root.style.setProperty('--color-brand-700', theme.primaryColor);
    root.style.setProperty('--color-brand-glow', theme.glowColor);
    root.style.setProperty('--color-brand-accent', theme.accentColor);
  }, [theme]);

  // Instantly toggle theme mode locally and sync to Firestore
  const toggleMode = async () => {
    const nextMode = theme.mode === 'dark' ? 'light' : 'dark';
    setTheme(prev => ({ ...prev, mode: nextMode }));
    try {
      const themeRef = doc(db, 'settings', 'theme');
      await setDoc(themeRef, { mode: nextMode }, { merge: true });
    } catch (e) {
      // Ignored if non-admin
    }
  };

  // Function for admin to persist theme changes to Firestore
  const updateThemeInFirestore = async (newTheme) => {
    try {
      const themeRef = doc(db, 'settings', 'theme');
      await setDoc(themeRef, {
        ...theme,
        ...newTheme,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error("Failed to update theme in Firestore:", error);
      throw error;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleMode, updateThemeInFirestore, PRESET_THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};
