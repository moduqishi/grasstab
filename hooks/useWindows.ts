import { useState } from 'react';
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
    ]);
    const [maxZ, setMaxZ] = useState(100);

    const isAnyWindowMaximized = windows.some(w => w.isOpen && w.isMaximized);

    const openWin = (id: string, extra: any = {}) => {
        const idx = windows.findIndex(w => w.id === id);
        if (idx >= 0) {
            const nw = [...windows];
            nw[idx] = { ...nw[idx], isOpen: true, z: maxZ + 1 };
            if (extra.url) nw[idx].url = extra.url;
            if (extra.title) nw[idx].title = extra.title;
            setWindows(nw);
            setMaxZ(prev => prev + 1);
        } else {
            setWindows([...windows, {
                id,
                type: 'web',
                title: extra.title || 'App',
                url: extra.url,
                isOpen: true,
                isMaximized: false,
                z: maxZ + 1,
                w: 1000,
                h: 700
            }]);
            setMaxZ(prev => prev + 1);
        }
    };

    const closeWin = (id: string) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false, isMaximized: false } : w));
    };

    const focusWin = (id: string) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, z: maxZ + 1 } : w));
        setMaxZ(prev => prev + 1);
    };

    const toggleMaximize = (id: string) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
    };

    const handleEditApp = (app: Shortcut) => {
        const idx = windows.findIndex(w => w.id === 'edit');
        if (idx >= 0) {
            const nw = [...windows];
            nw[idx] = {
                ...nw[idx],
                isOpen: true,
                z: maxZ + 1,
                title: app.type === 'widget' ? '编辑小组件' : '编辑应用',
                editData: app
            };
            setWindows(nw);
            setMaxZ(prev => prev + 1);
        }
    };

    // Helper to open edit window from settings
    const handleEditAppFromSettings = (app: Shortcut) => {
        const idx = windows.findIndex(w => w.id === 'edit');
        if (idx >= 0) {
            const nw = [...windows];
            nw[idx] = {
                ...nw[idx],
                isOpen: true,
                z: maxZ + 1,
                editData: app,
                title: app.type === 'widget' ? '编辑小组件' : '编辑应用'
            };
            setWindows(nw);
            setMaxZ(prev => prev + 1);
        } else {
            setWindows([...windows, {
                id: 'edit',
                type: 'edit',
                title: app.type === 'widget' ? '编辑小组件' : '编辑应用',
                isOpen: true,
                isMaximized: false,
                z: maxZ + 1,
                w: 500,
                h: 600,
                editData: app
            }]);
            setMaxZ(prev => prev + 1);
        }
    };

    const getWindowTitle = (w: WindowState): string => {
        switch (w.type) {
            case 'calc': return t(lang, 'calculator');
            case 'notes': return t(lang, 'notes');
            case 'ai': return t(lang, 'ai');
            case 'settings': return t(lang, 'settings');
            case 'add': return t(lang, 'addShortcut');
            case 'edit': return w.editData?.type === 'widget' ? t(lang, 'editApp') : t(lang, 'editApp');
            case 'configEditor': return t(lang, 'editConfig');
            case 'web': return w.title;
            default: return w.title;
        }
    };

    return {
        windows,
        setWindows,
        maxZ,
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
