import React, { useState } from 'react';
import { Palette, Sun, Moon, Check, Sparkles, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeManager() {
  const { theme, updateThemeInFirestore, PRESET_THEMES } = useTheme();
  const [customPrimary, setCustomPrimary] = useState(theme.primaryColor);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleModeToggle = async (newMode) => {
    setSaving(true);
    try {
      await updateThemeInFirestore({ mode: newMode });
      setSuccessMsg(`Switched to global ${newMode.toUpperCase()} mode!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectPreset = async (preset) => {
    setSaving(true);
    try {
      await updateThemeInFirestore({
        primaryColor: preset.primary,
        accentColor: preset.accent,
        glowColor: preset.glow,
        themeName: preset.name
      });
      setCustomPrimary(preset.primary);
      setSuccessMsg(`Applied theme palette "${preset.name}"!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleApplyCustomHex = async () => {
    setSaving(true);
    try {
      await updateThemeInFirestore({
        primaryColor: customPrimary,
        accentColor: customPrimary,
        glowColor: `${customPrimary}66`,
        themeName: 'Custom Hex'
      });
      setSuccessMsg('Applied custom primary color!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-cyan-400" />
          Global Theme & UI Control
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Customize light/dark mode and primary accent colors. All updates persist in Firestore and propagate globally across the application.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Light / Dark Mode Selector */}
      <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
          1. Global Mode Setting
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleModeToggle('dark')}
            disabled={saving}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              theme.mode === 'dark'
                ? 'bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/30 text-white'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-6 h-6 text-cyan-400" />
            <span className="font-bold text-sm">Dark Mode</span>
            <span className="text-[10px] text-slate-500">Sleek glassmorphic dark theme</span>
          </button>

          <button
            onClick={() => handleModeToggle('light')}
            disabled={saving}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              theme.mode === 'light'
                ? 'bg-white/10 border-amber-500 ring-2 ring-amber-500/30 text-white'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-6 h-6 text-amber-400" />
            <span className="font-bold text-sm">Light Mode</span>
            <span className="text-[10px] text-slate-500">Clean bright crisp layout</span>
          </button>
        </div>
      </div>

      {/* Preset Accent Palettes */}
      <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
          2. Primary Brand Color Palettes
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_THEMES.map((preset) => {
            const isSelected = theme.primaryColor === preset.primary;
            return (
              <button
                key={preset.name}
                onClick={() => handleSelectPreset(preset)}
                disabled={saving}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  isSelected 
                    ? 'bg-slate-800 border-white/30 text-white shadow-lg' 
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-full shadow-md shrink-0 border border-white/20"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div className="text-left">
                    <div className="text-xs font-bold text-white">{preset.name}</div>
                    <div className="text-[10px] text-slate-500 uppercase">{preset.primary}</div>
                  </div>
                </div>

                {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Color Input */}
      <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
          3. Custom Accent Hex Picker
        </h4>

        <div className="flex items-center gap-3">
          <input
            type="color"
            value={customPrimary}
            onChange={(e) => setCustomPrimary(e.target.value)}
            className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
          />
          <input
            type="text"
            value={customPrimary}
            onChange={(e) => setCustomPrimary(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none uppercase"
          />
          <button
            onClick={handleApplyCustomHex}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-md hover:brightness-110"
            style={{ backgroundColor: 'var(--color-brand-500)' }}
          >
            Apply Hex
          </button>
        </div>
      </div>
    </div>
  );
}
