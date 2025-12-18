import { useState, useMemo, useEffect, useCallback } from 'react';
import { Shortcut, DockItem } from '../types';
import { DEFAULT_DOCK, DEFAULT_SHORTCUTS, SYSTEM_APPS } from '../constants';

const DOCK_RESERVED_SLOTS = 10;

export function useApps(dialog: any) { // Inject dialog for confirm actions
    // --- Data State ---
    const [appLayout, setAppLayout] = useState<(Shortcut | null)[]>(() => {
        const saved = localStorage.getItem('os-app-layout');
        if (saved) {
            try {
                const layout = JSON.parse(saved);
                if (Array.isArray(layout) && layout.length > 0) return layout;
            } catch {}
        }
        // 首次初始化：使用spread运算符合并不同类型的数组
        const emptySlots = Array(DOCK_RESERVED_SLOTS - DEFAULT_DOCK.length).fill(null);
        return [...DEFAULT_DOCK, ...emptySlots, ...DEFAULT_SHORTCUTS] as (Shortcut | null)[];
    });

    // Persistence
    useEffect(() => {
        localStorage.setItem('os-app-layout', JSON.stringify(appLayout));
    }, [appLayout]);

    // Derived State
    const dockApps = useMemo(() => 
        appLayout.slice(0, DOCK_RESERVED_SLOTS).filter(item => item !== null && item !== undefined),
        [appLayout]
    );
    
    const desktopApps = useMemo(() => 
        appLayout.slice(DOCK_RESERVED_SLOTS).filter(item => item !== null && item !== undefined),
        [appLayout]
    );

    // Handlers
    const handleDeleteApp = async (app: Shortcut) => {
        const appName = app.title || app.displayName || '此应用';
        const confirmMessage = `确定要删除 "${appName}" 吗？`;
            
        if (await dialog.showConfirm(confirmMessage)) {
            setAppLayout(prev => {
                const index = prev.findIndex(item => item?.id === app.id);
                if (index === -1) return prev;
                
                const newLayout = [...prev];
                newLayout[index] = null;
                return newLayout;
            });
        }
    };

    const handleRestoreSystemApp = (appId: string) => {
        const systemApp = SYSTEM_APPS.find(app => app.id === appId);
        if (systemApp) {
            setAppLayout(prev => [...prev, systemApp]);
        }
    };

    const handleIconLoaded = useCallback((appId: string | number, iconSource: string) => {
        setAppLayout(prev => prev.map(item => {
            if (item && item.id === appId && item.iconType !== iconSource) {
                return { ...item, iconType: iconSource };
            }
            return item;
        }));
    }, []);

    // Helper to update a specific app (used for edit/save)
    const updateApp = (updated: Shortcut) => {
        setAppLayout(prev => prev.map(item => item?.id === updated.id ? updated : item));
    };

    return {
        appLayout,
        setAppLayout,
        dockApps,
        desktopApps,
        handleDeleteApp,
        handleRestoreSystemApp,
        handleIconLoaded,
        updateApp,
        DOCK_RESERVED_SLOTS
    };
}
