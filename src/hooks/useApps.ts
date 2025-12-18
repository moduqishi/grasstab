import { useMemo, useCallback, useRef, useEffect } from 'react';
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

    const handleDeleteApp = useCallback(async (app: Shortcut) => {
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
    }, [dialog, dockApps, desktopApps, updateDock, updateShortcuts]);

    const handleRestoreSystemApp = useCallback((appId: string) => {
        const systemApp = SYSTEM_APPS.find(app => app.id === appId);
        if (systemApp) {
             // Default restore to desktop
             updateShortcuts([...desktopApps, systemApp]);
        }
    }, [desktopApps, updateShortcuts]);

    // --- Optimized Icon Loading Logic ---
    const pendingUpdatesRef = useRef<Map<string|number, string>>(new Map());
    const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const configRef = useRef(config);
    const handlersRef = useRef({ updateDock, updateShortcuts });

    // Keep refs in sync with latest props/state
    useEffect(() => {
        configRef.current = config;
        handlersRef.current = { updateDock, updateShortcuts };
    }, [config, updateDock, updateShortcuts]);

    // Stable callback for child components
    const handleIconLoaded = useCallback((appId: string | number, iconSource: string) => {
        const currentConfig = configRef.current;
        
        // Fast check to potentially avoid queueing
        const inDock = currentConfig.content.dock.find(a => a.id === appId);
        const inDesktop = currentConfig.content.desktop.find(a => a.id === appId);
        
        // If already matches, ignore
        if (inDock && inDock.iconType === iconSource) return;
        if (inDesktop && inDesktop.iconType === iconSource) return;
        if (!inDock && !inDesktop) return; // App deleted?

        // Add to pending updates
        pendingUpdatesRef.current.set(appId, iconSource);

        // Schedule flush
        if (flushTimeoutRef.current) {
            clearTimeout(flushTimeoutRef.current);
        }

        flushTimeoutRef.current = setTimeout(() => {
            const updates = pendingUpdatesRef.current;
            if (updates.size === 0) return;

            const latestConfig = configRef.current;
            const handlers = handlersRef.current;
            
            const newDock = [...latestConfig.content.dock];
            const newDesktop = [...latestConfig.content.desktop];
            let hasDockUpdates = false;
            let hasDesktopUpdates = false;

            updates.forEach((source, id) => {
                const dockIdx = newDock.findIndex(a => a.id === id);
                if (dockIdx !== -1 && newDock[dockIdx].iconType !== source) {
                    newDock[dockIdx] = { ...newDock[dockIdx], iconType: source };
                    hasDockUpdates = true;
                }

                const deskIdx = newDesktop.findIndex(a => a.id === id);
                if (deskIdx !== -1 && newDesktop[deskIdx].iconType !== source) {
                    // console.log(`[IconUpdate] Updating desktop app ${id} to ${source}`);
                    newDesktop[deskIdx] = { ...newDesktop[deskIdx], iconType: source };
                    hasDesktopUpdates = true;
                }
            });

            if (hasDockUpdates) handlers.updateDock(newDock);
            if (hasDesktopUpdates) handlers.updateShortcuts(newDesktop);

            pendingUpdatesRef.current.clear();
            flushTimeoutRef.current = null;
        }, 1000); // Debounce duration
    }, []); // Purely stable

    const updateApp = useCallback((updated: Shortcut) => {
         const inDock = dockApps.some(a => a.id === updated.id);
         if (inDock) {
             updateDock(dockApps.map(a => a.id === updated.id ? updated : a));
         } else {
             updateShortcuts(desktopApps.map(a => a.id === updated.id ? updated : a));
         }
    }, [dockApps, desktopApps, updateDock, updateShortcuts]);

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
