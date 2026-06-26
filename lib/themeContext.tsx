"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme } from './types';

export const THEMES: Theme[] = [
  { id: 'default-dark', name: 'Default Dark', background: '#0d0f18', surface: '#131620', accent: '#6366f1' },
  { id: 'github-dark', name: 'GitHub Dark', background: '#0d1117', surface: '#161b22', accent: '#58a6ff' },
  { id: 'dracula', name: 'Dracula', background: '#282a36', surface: '#1e1f29', accent: '#bd93f9' },
  { id: 'monokai', name: 'Monokai', background: '#272822', surface: '#1e1f1c', accent: '#a6e22e' },
  { id: 'light', name: 'Light', background: '#f8fafc', surface: '#ffffff', accent: '#4f46e5' },
];

interface ThemeContextType {
  currentTheme: Theme;
  setThemeById: (id: string) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[0]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedThemeId = localStorage.getItem('dsa-animator-theme');
    const savedTheme = THEMES.find(t => t.id === savedThemeId);
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Remove previous theme classes
    THEMES.forEach(t => {
      document.documentElement.classList.remove(`theme-${t.id}`);
    });
    
    // Add current theme class
    document.documentElement.classList.add(`theme-${currentTheme.id}`);
    localStorage.setItem('dsa-animator-theme', currentTheme.id);
  }, [currentTheme, mounted]);

  const setThemeById = (id: string) => {
    const targetTheme = THEMES.find(t => t.id === id);
    if (targetTheme) {
      setCurrentTheme(targetTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setThemeById, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
