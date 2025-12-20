import { useState, useCallback, useRef } from 'react';
import { WindowState, Shortcut } from '../types';
import { t, Language } from '../i18n';

export function useWindows(lang: Language = 'zh') {
    const [windows, setWindows] = useState<WindowState[]>([
        { id: 'calc', type: 'calc', title: 'Calculator', isOpen: false, isMaximized: false, z: 100, w: 340, h: 560 },
        { id: 'notes', type: 'notes', title: 'Notes', isOpen: false, isMaximized: false, z: 100, w: 420, h: 500 },
        { id: 'ai', type: 'ai', title: 'Nebula AI', isOpen: false, isMaximized: false, z: 100, w: 500, h: 600 },
        { id: 'settings', type: 'settings', title: 'Settings', isOpen: false, isMaximized: false, z: 100, w: 720, h: 520 },
        { id: 'add', type: 'add', title: 'Add Shortcut', isOpen: false, isMaximized: false, z: 100, w: 400, h: 480 },
        { id: 'edit', type: 'edit', title: 'Edit App', isOpen: false, isMaximized: false, z: 100, w: 500, h: 600 },
        { id: 'configEditor', type: 'configEditor', title: 'Config Editor', isOpen: false, isMaximized: false, z: 100, w: 900, h: 650 },
        { id: 'store', type: 'store', title: 'App Store', isOpen: false, isMaximized: false, z: 100, w: 1000, h: 700 }, // App Store Window
    ]);
    
    // Use Ref for maxZ to avoid re-creating callbacks on every z-index change
    const maxZRef = useRef(100);

    const isAnyWindowMaximized = windows.some(w => w.isOpen && w.isMaximized);

    const openWin = useCallback((id: string, extra: any = {}) => {
        maxZRef.current += 1;
        const newZ = maxZRef.current;
        
        setWindows(prev => {
            const idx = prev.findIndex(w => w.id === id);
            if (idx >= 0) {
                const nw = [...prev];
                nw[idx] = { 
                    ...nw[idx], 
                    isOpen: true, 
                    z: newZ,
                    isMaximized: false // Optional: minimize on reopen? Or keep state? Usually restore. But code had 'isOpen: true'. 
                                       // Original code didn't reset isMaximized here, but let's check. 
                                       // Original: nw[idx] = { ...nw[idx], isOpen: true, z: maxZ + 1 };
                };
                if (extra.url) nw[idx].url = extra.url;
                if (extra.title) nw[idx].title = extra.title;
                return nw;
            } else {
                return [...prev, {
                    id,
                    type: 'web',
                    title: extra.title || 'App',
                    url: extra.url,
                    isOpen: true,
                    isMaximized: false,
                    z: newZ,
                    w: 1000,
                    h: 700
                }];
            }
        });
    }, []); 

    const closeWin = useCallback((id: string) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false, isMaximized: false } : w));
    }, []);

    const focusWin = useCallback((id: string) => {
        maxZRef.current += 1;
        const newZ = maxZRef.current;
        setWindows(prev => prev.map(w => w.id === id ? { ...w, z: newZ } : w));
    }, []);

    const toggleMaximize = useCallback((id: string) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
    }, []);

    const handleEditApp = useCallback((app: Shortcut) => {
        maxZRef.current += 1;
        const newZ = maxZRef.current;
        
        setWindows(prev => {
            const idx = prev.findIndex(w => w.id === 'edit');
            if (idx >= 0) {
                const nw = [...prev];
                nw[idx] = {
                    ...nw[idx],
                    isOpen: true,
                    z: newZ,
                    title: app.type === 'widget' ? '编辑小组件' : '编辑应用',
                    editData: app
                };
                return nw;
            }
            return prev;
        });
    }, []);

    // Helper to open edit window from settings
    const handleEditAppFromSettings = useCallback((app: Shortcut) => {
        maxZRef.current += 1;
        const newZ = maxZRef.current;
        
        setWindows(prev => {
            const idx = prev.findIndex(w => w.id === 'edit');
            if (idx >= 0) {
                const nw = [...prev];
                nw[idx] = {
                    ...nw[idx],
                    isOpen: true,
                    z: newZ,
                    editData: app,
                    title: app.type === 'widget' ? '编辑小组件' : '编辑应用'
                };
                return nw;
            } else {
                return [...prev, {
                    id: 'edit',
                    type: 'edit',
                    title: app.type === 'widget' ? '编辑小组件' : '编辑应用',
                    isOpen: true,
                    isMaximized: false,
                    z: newZ,
                    w: 500,
                    h: 600,
                    editData: app
                }];
            }
        });
    }, []);

    const getWindowTitle = useCallback((w: WindowState): string => {
        switch (w.type) {
            case 'calc': return t(lang, 'calculator');
            case 'notes': return t(lang, 'notes');
            case 'ai': return t(lang, 'ai');
            case 'settings': return t(lang, 'settings');
            case 'add': return t(lang, 'addShortcut');
            case 'edit': return w.editData?.type === 'widget' ? t(lang, 'editApp') : t(lang, 'editApp');
            case 'configEditor': return t(lang, 'editConfig');
            case 'store': return t(lang, 'appStore') || '应用商店';
            case 'web': return w.title;
            default: return w.title;
        }
    }, [lang]);

    return {
        windows,
        setWindows,
        maxZ: maxZRef.current, // Expose current value if needed, effectively read-only snap
        openWin,
        closeWin,
        focusWin,
        toggleMaximize,
        handleEditApp,
        handleEditAppFromSettings,
        getWindowTitle,
        isAnyWindowMaximized
    };
}
