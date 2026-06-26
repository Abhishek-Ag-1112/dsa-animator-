"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '@/lib/themeContext';

export const ThemeSwitcher: React.FC = () => {
  const { currentTheme, setThemeById, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-accent transition-colors flex items-center gap-1.5 focus:outline-none"
        title="Switch Theme"
      >
        <Palette className="w-4 h-4" />
        <span className="text-xs font-medium hidden sm:inline">{currentTheme.name}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 rounded-md bg-surface border border-border shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1.5 text-xs font-semibold text-text-secondary border-b border-border mb-1">
            Choose Theme
          </div>
          {themes.map((theme) => {
            const isSelected = theme.id === currentTheme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  setThemeById(theme.id);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-background transition-colors ${
                  isSelected ? 'text-accent font-bold' : 'text-text-primary'
                }`}
              >
                <div className="flex items-center gap-2">
                  {/* Swatches representation */}
                  <div className="flex gap-0.5 rounded overflow-hidden border border-border">
                    <div style={{ backgroundColor: theme.background }} className="w-2.5 h-2.5" />
                    <div style={{ backgroundColor: theme.surface }} className="w-2.5 h-2.5" />
                    <div style={{ backgroundColor: theme.accent }} className="w-2.5 h-2.5" />
                  </div>
                  <span>{theme.name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-accent" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
