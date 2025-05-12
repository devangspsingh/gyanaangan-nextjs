'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const availableThemes = [
  { name: 'Architect', file: 'architect.svg' },
  { name: 'Dominos', file: 'dominos.svg' },
  { name: 'Endless Clouds', file: 'endless-clouds.svg' },
  { name: 'Hideout', file: 'hideout.svg' },
  { name: 'Intersecting Circles', file: 'intersecting-circles.svg' },
  { name: 'Polka Dots', file: 'polka-dots.svg' },
  { name: 'Signal', file: 'signal.svg' },
  { name: 'Slanted Stars', file: 'slanted-stars.svg' },
  { name: 'Stripes', file: 'stripes.svg' },
  { name: 'Tic Tac Toe', file: 'tic-tac-toe.svg' },
  { name: 'Wallpaper', file: 'wallpaper.svg' }
];
const defaultTheme = 'architect.svg';

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentThemeState] = useState(defaultTheme);

  useEffect(() => {
    // Initialize theme from localStorage or default
    const storedTheme = localStorage.getItem('selectedTheme');
    if (storedTheme && availableThemes.some(t => t.file === storedTheme)) {
      setCurrentThemeState(storedTheme);
    } else {
      setCurrentThemeState(defaultTheme);
      localStorage.setItem('selectedTheme', defaultTheme); // Ensure default is set if invalid/missing
    }
  }, []);

  const setTheme = useCallback((themeFile) => {
    if (!availableThemes.some(t => t.file === themeFile)) {
      console.warn(`Theme ${themeFile} not available. Reverting to default.`);
      themeFile = defaultTheme;
    }
    setCurrentThemeState(themeFile);
    localStorage.setItem('selectedTheme', themeFile);
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
