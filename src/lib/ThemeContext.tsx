'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// Theme constants
export const THEME_LIGHT = 'light';
export const THEME_DARK = 'dark';
export type Theme = typeof THEME_LIGHT | typeof THEME_DARK;

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: THEME_LIGHT,
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: false
});

// Apply theme to document
const applyTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('theme', theme);
  } catch (e) {
    console.error('Failed to save theme to localStorage:', e);
  }
  
  if (theme === THEME_DARK) {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  }
  
  // Force a repaint to ensure theme changes are applied
  const css = document.createElement('style');
  css.appendChild(document.createTextNode('*{}'));
  document.head.appendChild(css);
  setTimeout(() => document.head.removeChild(css), 100);
};

// Get user theme preference
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return THEME_LIGHT;
  
  try {
    // Check localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) return savedTheme;
    
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? THEME_DARK : THEME_LIGHT;
  } catch (e) {
    return THEME_LIGHT;
  }
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(THEME_LIGHT);
  const [mounted, setMounted] = useState(false);

  // Initialize theme once component mounts
  useEffect(() => {
    const initialTheme = getInitialTheme();
    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  const changeTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  const value = {
    theme,
    setTheme: changeTheme,
    toggleTheme,
    isDark: theme === THEME_DARK
  };

  // Return provider with its value
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
} 