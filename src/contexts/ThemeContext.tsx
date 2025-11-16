import React, { createContext, useContext, useEffect, useState } from 'react';

export const colorThemes = {
  'cyber-teal': {
    name: 'Cyber Teal',
    primary: 'oklch(0.7 0.18 200)',
  },
  'electric-blue': {
    name: 'Electric Blue',
    primary: 'oklch(0.6 0.22 260)',
  },
  'bright-orange': {
    name: 'Bright Orange',
    primary: 'oklch(0.68 0.20 40)',
  },
  'deep-purple': {
    name: 'Deep Purple',
    primary: 'oklch(0.55 0.25 300)',
  },
} as const;

export type ColorTheme = keyof typeof colorThemes;

interface ThemeContextType {
  currentTheme: ColorTheme;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>('cyber-teal');

  // Load theme from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('color-theme') as ColorTheme | null;
    if (stored && stored in colorThemes) {
      setCurrentTheme(stored);
    }
  }, []);

  // Update CSS variable when theme changes
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--primary',
      colorThemes[currentTheme].primary
    );
    sessionStorage.setItem('color-theme', currentTheme);
  }, [currentTheme]);

  const cycleTheme = () => {
    const themes = Object.keys(colorThemes) as ColorTheme[];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setCurrentTheme(themes[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
