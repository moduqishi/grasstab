import { useState, useEffect } from 'react';
import { DEFAULT_WALLPAPER } from '../constants';
import { SystemSettings } from '../types';

const defaultSettings: SystemSettings = { 
    showDockEdit: false, 
    showSearchBar: true, 
    showPagination: true, 
    showDock: true, 
    language: 'zh' as const 
};

export function useSystem() {
    // --- View State (Hero vs Desktop) ---
    const [viewState, setViewState] = useState<'hero' | 'desktop'>('hero');
    const [wallpaper, setWallpaper] = useState(() => localStorage.getItem('os-bg') || DEFAULT_WALLPAPER);

    // --- System Settings ---
    const [sysSettings, setSysSettings] = useState<SystemSettings>(() => {
        const saved = localStorage.getItem('os-settings');
        if (!saved) return defaultSettings;
        try {
            return JSON.parse(saved);
        } catch {
            return defaultSettings;
        }
    });

    const [time, setTime] = useState(new Date());

    // --- Persistence & Effects ---
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        localStorage.setItem('os-settings', JSON.stringify(sysSettings));
    }, [sysSettings]);

    useEffect(() => {
        localStorage.setItem('os-bg', wallpaper);
    }, [wallpaper]);

    return {
        viewState,
        setViewState,
        wallpaper,
        setWallpaper,
        sysSettings,
        setSysSettings,
        time,
        lang: sysSettings.language || 'zh'
    };
}
