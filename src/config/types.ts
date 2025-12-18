import { Shortcut, AIProvider, SearchEngineItem } from '../types';

export interface GrassTabConfig {
  meta: {
    version: string;
    updatedAt: string;
  };

  preferences: {
    general: {
      language: 'zh' | 'en';
    };
    appearance: {
      wallpaper: string;
    };
    layout: {
      showDock: boolean;
      showDockEdit: boolean;
      showSearchBar: boolean;
      showPagination: boolean;
    };
  };

  integrations: {
    ai: {
      enabled: boolean;
      providers: AIProvider[];
      activeProviderId: string;
      activeModel: string;
    };
  };

  searchEngines: SearchEngineItem[]; // Customize search engines

  content: {
    dock: Shortcut[];
    desktop: Shortcut[];
  };

  data: {
    notes: string;
  };
}
