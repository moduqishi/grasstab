import { useMemo, useCallback } from 'react';
import { Shortcut } from '../types';
import { useConfig } from '../config/ConfigContext';
import { SYSTEM_APPS } from '../constants';

const DOCK_RESERVED_SLOTS = 10;

export function useApps(dialog: any) { 
    const { config, updateShortcuts, updateDock } = useConfig();
    
    // --- Derived State for Compatibility ---
    // The UI (DesktopGrid) expects a single flat array where the first N items are Dock items (or nulls)
    const appLayout = useMemo(() => {
        const dockSlots = Array(DOCK_RESERVED_SLOTS).fill(null);
        config.content.dock.forEach((item, i) => {
            if (i < DOCK_RESERVED_SLOTS) dockSlots[i] = item;
        });
        return [...dockSlots, ...config.content.desktop] as (Shortcut | null)[];
    }, [config.content.dock, config.content.desktop]);

    const dockApps = config.content.dock;
    const desktopApps = config.content.desktop;

    // --- Actions ---
    
    // Since we are bridging a flat "appLayout" back to separated structures (Dock vs Desktop),
    // we need a setter that understands how to split them back up.
    const setAppLayout = (newLayoutOrFn: (Shortcut | null)[] | ((prev: (Shortcut | null)[]) => (Shortcut | null)[])) => {
        let newLayout: (Shortcut | null)[];
        if (typeof newLayoutOrFn === 'function') {
            newLayout = newLayoutOrFn(appLayout);
        } else {
            newLayout = newLayoutOrFn;
        }

        const newDock = newLayout.slice(0, DOCK_RESERVED_SLOTS).filter(Boolean) as Shortcut[];
        const newDesktop = newLayout.slice(DOCK_RESERVED_SLOTS).filter(Boolean) as Shortcut[];
        
        // Optimistically update both
        if (JSON.stringify(newDock) !== JSON.stringify(dockApps)) updateDock(newDock);
        if (JSON.stringify(newDesktop) !== JSON.stringify(desktopApps)) updateShortcuts(newDesktop);
    };

    const handleDeleteApp = async (app: Shortcut) => {
        const appName = app.title || app.displayName || '此应用';
        const confirmMessage = `确定要删除 "${appName}" 吗？`;
            
        if (await dialog.showConfirm(confirmMessage)) {
            // Check if it's in dock or desktop
            const inDock = dockApps.some(a => a.id === app.id);
            if (inDock) {
                 updateDock(dockApps.filter(a => a.id !== app.id));
            } else {
                 updateShortcuts(desktopApps.filter(a => a.id !== app.id));
            }
        }
    };

    const handleRestoreSystemApp = (appId: string) => {
        const systemApp = SYSTEM_APPS.find(app => app.id === appId);
        if (systemApp) {
             // Default restore to desktop
             updateShortcuts([...desktopApps, systemApp]);
        }
    };

    const handleIconLoaded = useCallback((appId: string | number, iconSource: string) => {
        // Need to check both lists
        const inDock = config.content.dock.find(a => a.id === appId);
        if (inDock && inDock.iconType !== iconSource) {
             updateDock(config.content.dock.map(a => a.id === appId ? { ...a, iconType: iconSource } : a));
             return;
        }

        const inDesktop = config.content.desktop.find(a => a.id === appId);
        if (inDesktop && inDesktop.iconType !== iconSource) {
            updateShortcuts(config.content.desktop.map(a => a.id === appId ? { ...a, iconType: iconSource } : a));
        }
    }, [config.content.dock, config.content.desktop, updateDock, updateShortcuts]);

    const updateApp = (updated: Shortcut) => {
         const inDock = dockApps.some(a => a.id === updated.id);
         if (inDock) {
             updateDock(dockApps.map(a => a.id === updated.id ? updated : a));
         } else {
             updateShortcuts(desktopApps.map(a => a.id === updated.id ? updated : a));
         }
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
