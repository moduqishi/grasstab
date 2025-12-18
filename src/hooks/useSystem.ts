import { useState, useEffect } from 'react';
import { useConfig } from '../config/ConfigContext';
import { SystemSettings } from '../types';

export function useSystem() {
    const { config, updateSettings, setWallpaper } = useConfig();
    
    // --- View State (Hero vs Desktop) ---
    // ViewState is transient UI state, so we keep it local (or could be in another context)
    const [viewState, setViewState] = useState<'hero' | 'desktop'>('hero');
    
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    // Bridge to old SystemSettings interface for compatibility
    const sysSettings: SystemSettings = {
        showDock: config.preferences.layout.showDock,
        showDockEdit: config.preferences.layout.showDockEdit,
        showSearchBar: config.preferences.layout.showSearchBar,
        showPagination: config.preferences.layout.showPagination,
        language: config.preferences.general.language,
        // Legacy/Unused fields can be mapped if needed
        hiddenSystemApps: [],
    };

    const setSysSettings = (newSettings: SystemSettings | ((prev: SystemSettings) => SystemSettings)) => {
        if (typeof newSettings === 'function') {
            // This is a bit tricky with the bridge, avoiding for now or implementing if needed
            // For now, assume it's an object update or we read from current
             const next = newSettings(sysSettings);
             updateSettings(next);
        } else {
            updateSettings(newSettings);
        }
    };

    return {
        viewState,
        setViewState,
        wallpaper: config.preferences.appearance.wallpaper,
        setWallpaper,
        sysSettings,
        setSysSettings,
        time,
        lang: config.preferences.general.language
    };
}
