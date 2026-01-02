import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AuraTheme = 'golden' | 'electric' | 'mystic' | 'emerald' | 'crimson';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  particleStart: string;
  particleEnd: string;
  gradient: string;
  name: string;
  icon: string;
}

const themeDefinitions: Record<AuraTheme, ThemeColors> = {
  golden: {
    primary: '45 93% 58%',
    secondary: '35 91% 50%',
    accent: '25 95% 53%',
    glow: '45 93% 58%',
    particleStart: '#fbbf24',
    particleEnd: '#f59e0b',
    gradient: 'linear-gradient(135deg, hsl(45 93% 58%) 0%, hsl(35 91% 50%) 100%)',
    name: 'Golden Aura',
    icon: '✨',
  },
  electric: {
    primary: '200 98% 55%',
    secondary: '210 100% 50%',
    accent: '190 95% 60%',
    glow: '200 98% 55%',
    particleStart: '#06b6d4',
    particleEnd: '#0284c7',
    gradient: 'linear-gradient(135deg, hsl(200 98% 55%) 0%, hsl(210 100% 50%) 100%)',
    name: 'Electric Blue',
    icon: '⚡',
  },
  mystic: {
    primary: '270 91% 65%',
    secondary: '280 85% 55%',
    accent: '260 95% 70%',
    glow: '270 91% 65%',
    particleStart: '#a78bfa',
    particleEnd: '#8b5cf6',
    gradient: 'linear-gradient(135deg, hsl(270 91% 65%) 0%, hsl(280 85% 55%) 100%)',
    name: 'Mystic Purple',
    icon: '🔮',
  },
  emerald: {
    primary: '160 84% 39%',
    secondary: '150 80% 35%',
    accent: '170 90% 45%',
    glow: '160 84% 39%',
    particleStart: '#10b981',
    particleEnd: '#059669',
    gradient: 'linear-gradient(135deg, hsl(160 84% 39%) 0%, hsl(150 80% 35%) 100%)',
    name: 'Emerald Green',
    icon: '🍃',
  },
  crimson: {
    primary: '0 84% 60%',
    secondary: '355 90% 55%',
    accent: '10 95% 65%',
    glow: '0 84% 60%',
    particleStart: '#ef4444',
    particleEnd: '#dc2626',
    gradient: 'linear-gradient(135deg, hsl(0 84% 60%) 0%, hsl(355 90% 55%) 100%)',
    name: 'Crimson Fire',
    icon: '🔥',
  },
};

interface AuraThemeContextType {
  theme: AuraTheme;
  setTheme: (theme: AuraTheme) => void;
  themeColors: ThemeColors;
  allThemes: typeof themeDefinitions;
}

const AuraThemeContext = createContext<AuraThemeContextType | undefined>(undefined);

export const AuraThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AuraTheme>(() => {
    const stored = localStorage.getItem('auraTheme');
    return (stored as AuraTheme) || 'golden';
  });

  const setTheme = (newTheme: AuraTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('auraTheme', newTheme);
  };

  useEffect(() => {
    const colors = themeDefinitions[theme];
    const root = document.documentElement;

    // Update CSS custom properties
    root.style.setProperty('--aura-primary', colors.primary);
    root.style.setProperty('--aura-secondary', colors.secondary);
    root.style.setProperty('--aura-accent', colors.accent);
    root.style.setProperty('--aura-glow', colors.glow);
    root.style.setProperty('--aura-gradient', colors.gradient);
    root.style.setProperty('--aura-particle-start', colors.particleStart);
    root.style.setProperty('--aura-particle-end', colors.particleEnd);

    // Update theme-dependent existing variables
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--ring', colors.primary);
    root.style.setProperty('--xp-bar', colors.primary);
    root.style.setProperty('--level-glow', colors.primary);
    root.style.setProperty('--sidebar-primary', colors.primary);
    root.style.setProperty('--sidebar-ring', colors.primary);
  }, [theme]);

  const value: AuraThemeContextType = {
    theme,
    setTheme,
    themeColors: themeDefinitions[theme],
    allThemes: themeDefinitions,
  };

  return <AuraThemeContext.Provider value={value}>{children}</AuraThemeContext.Provider>;
};

export const useAuraTheme = (): AuraThemeContextType => {
  const context = useContext(AuraThemeContext);
  if (!context) {
    throw new Error('useAuraTheme must be used within AuraThemeProvider');
  }
  return context;
};
