import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import yaml from 'js-yaml';
import { GrassTabConfig, GrassTabConfig as Config } from './types';
import { DEFAULT_CONFIG } from './defaultConfig';
import { Shortcut, DockItem, AIProvider, SystemSettings } from '../types';

interface ConfigContextType {
  config: Config;
  updateSettings: (settings: Partial<Config['preferences']['layout'] | Config['preferences']['general'] | Config['preferences']['appearance']>) => void;
  updateAI: (aiSettings: Partial<Config['integrations']['ai']>) => void;
  updateShortcuts: (shortcuts: Shortcut[]) => void;
  updateDock: (dockItems: Shortcut[]) => void;
  updateNotes: (notes: string) => void;
  importConfig: (yamlString: string) => Promise<boolean>;
  exportConfig: () => string;
  resetConfig: () => void;
  
  // Helpers for direct compatibility with legacy hooks if needed
  setWallpaper: (url: string) => void;
  setLanguage: (lang: 'zh' | 'en') => void;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

const CONFIG_KEY = 'grasstab_config';

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<Config>(() => {
    try {
      const saved = localStorage.getItem(CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Simple merge with default to ensure new fields exists
        // Note: For deep merge in prod, use lodash.merge. Here specific top-level merges.
        const merged = { ...DEFAULT_CONFIG, ...parsed };
        
        // Ensure critical sections exist (migration-like safety)
        if (!merged.integrations?.ai) merged.integrations.ai = DEFAULT_CONFIG.integrations.ai;
        if (!merged.content?.dock) merged.content.dock = DEFAULT_CONFIG.content.dock;
        if (!merged.content?.desktop) merged.content.desktop = DEFAULT_CONFIG.content.desktop;
        
        return merged;
      }
    } catch (e) {
      console.error('Failed to load config', e);
    }
    return DEFAULT_CONFIG;
  });

  // Auto-save
  useEffect(() => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }, [config]);

  const updateSettings = (partial: any) => {
    setConfig(prev => {
      // Trying to intelligently merge partial into the right sub-object
      // This is a bit loose but flexible for the UI
      const newPrefs = { ...prev.preferences };
      
      if ('showDock' in partial || 'showSearchBar' in partial || 'showPagination' in partial || 'showDockEdit' in partial) {
        newPrefs.layout = { ...newPrefs.layout, ...partial };
      }
      if ('language' in partial) {
        newPrefs.general = { ...newPrefs.general, ...partial };
      }
      if ('wallpaper' in partial) {
        newPrefs.appearance = { ...newPrefs.appearance, ...partial };
      }
      
      return { ...prev, preferences: newPrefs };
    });
  };

  const updateAI = (partial: Partial<Config['integrations']['ai']>) => {
    setConfig(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        ai: { ...prev.integrations.ai, ...partial }
      }
    }));
  };

  const updateShortcuts = (shortcuts: Shortcut[]) => {
    setConfig(prev => ({
      ...prev,
      content: { ...prev.content, desktop: shortcuts }
    }));
  };

  const updateDock = (dockItems: Shortcut[]) => {
    setConfig(prev => ({
      ...prev,
      content: { ...prev.content, dock: dockItems }
    }));
  };

  const updateNotes = (notes: string) => {
    setConfig(prev => ({
      ...prev,
      data: { ...prev.data, notes }
    }));
  };

  const setWallpaper = (url: string) => {
    setConfig(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        appearance: { ...prev.preferences.appearance, wallpaper: url }
      }
    }));
  };
  
  const setLanguage = (lang: 'zh' | 'en') => {
      setConfig(prev => ({
          ...prev,
          preferences: {
              ...prev.preferences,
              general: { ...prev.preferences.general, language: lang }
          }
      }))
  }

  const importConfig = async (yamlString: string): Promise<boolean> => {
    try {
      const parsed = yaml.load(yamlString) as Config;
      if (!parsed || !parsed.meta || !parsed.content) {
        throw new Error('Invalid config format');
      }
      
      // Safety check: ensure arrays are arrays
      if (!Array.isArray(parsed.content.dock)) parsed.content.dock = [];
      if (!Array.isArray(parsed.content.desktop)) parsed.content.desktop = [];
      
      setConfig(parsed);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  const exportConfig = () => {
    // Clone to update export time
    const exportData = {
      ...config,
      meta: {
        ...config.meta,
        updatedAt: new Date().toISOString()
      }
    };
    return yaml.dump(exportData, { indent: 2, lineWidth: -1 });
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  return (
    <ConfigContext.Provider value={{
      config,
      updateSettings,
      updateAI,
      updateShortcuts,
      updateDock,
      updateNotes,
      importConfig,
      exportConfig,
      resetConfig,
      setWallpaper,
      setLanguage
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
