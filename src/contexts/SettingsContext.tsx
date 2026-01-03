import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  soundEnabled: boolean;
  confettiEnabled: boolean;
}

interface SettingsContextType {
  settings: Settings;
  setSoundEnabled: (enabled: boolean) => void;
  setConfettiEnabled: (enabled: boolean) => void;
}

const defaultSettings: Settings = {
  soundEnabled: true,
  confettiEnabled: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('questTrackerSettings');
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('questTrackerSettings', JSON.stringify(settings));
  }, [settings]);

  const setSoundEnabled = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, soundEnabled: enabled }));
  };

  const setConfettiEnabled = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, confettiEnabled: enabled }));
  };

  return (
    <SettingsContext.Provider value={{ settings, setSoundEnabled, setConfettiEnabled }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
