import { Shortcut, PackedShortcut, GlobalConfig } from './types';
import jsyaml from 'js-yaml';

// Handle CDN import differences (default export vs named)
const { load, dump } = (jsyaml as any).default || jsyaml;

export const getDomain = (url?: string) => { 
    if (!url) return '';
    try { return new URL(url).hostname; } catch (e) { return ''; } 
};

// --- Date Helpers ---
export const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(date);
};

export const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
};

// --- Config Helpers ---
export const generateYamlConfig = (config: GlobalConfig): string => {
    try {
        return dump(config, {
            indent: 2,
            lineWidth: -1, // Don't break long lines (like base64 or long URLs)
            noRefs: true,
        });
    } catch (e) {
        console.error('Failed to generate YAML', e);
        return '';
    }
};

export const parseYamlConfig = (yamlStr: string): GlobalConfig | null => {
    try {
        const doc = load(yamlStr) as any;
        
        // Enhanced validation
        if (!doc) {
            throw new Error('Empty configuration file');
        }
        
        if (!doc.settings || typeof doc.settings !== 'object') {
            throw new Error('Missing or invalid settings');
        }
        
        if (!Array.isArray(doc.shortcuts)) {
            throw new Error('Missing or invalid shortcuts array');
        }
        
        if (!Array.isArray(doc.dockItems)) {
            throw new Error('Missing or invalid dock items array');
        }
        
        // Validate settings structure
        const settings = doc.settings;
        if (typeof settings.showDockEdit !== 'boolean' ||
            typeof settings.showSearchBar !== 'boolean' ||
            typeof settings.showPagination !== 'boolean') {
            throw new Error('Invalid settings structure');
        }
        
        // Add default for showDock if missing (for backward compatibility)
        if (typeof settings.showDock !== 'boolean') {
            settings.showDock = true;
        }
        
        // Validate wallpaper
        if (!doc.wallpaper || typeof doc.wallpaper !== 'string') {
            throw new Error('Missing or invalid wallpaper URL');
        }
        
        // Filter out invalid shortcuts (null, undefined, or missing required fields)
        const validShortcuts = doc.shortcuts.filter((s: any) => 
            s && 
            (s.id !== null && s.id !== undefined) && 
            s.type && 
            s.color
        );
        
        // Filter out invalid dock items
        const validDockItems = doc.dockItems.filter((d: any) => 
            d && 
            (d.id !== null && d.id !== undefined) && 
            d.iconType && 
            d.type && 
            d.color
        );
        
        return {
            version: doc.version || '1.0',
            createdAt: doc.createdAt || new Date().toISOString(),
            settings: doc.settings,
            wallpaper: doc.wallpaper,
            shortcuts: validShortcuts,
            dockItems: validDockItems
        } as GlobalConfig;
        
    } catch (e) {
        console.error('Failed to parse YAML', e);
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        alert('Invalid Configuration File: ' + errorMsg);
        return null;
    }
};

// --- Layout Engine (Bin Packing) ---
export const packItems = (items: Shortcut[], cols: number, rows: number): PackedShortcut[] => {
    if (!items || !cols || !rows) return [];

    const packedItems: PackedShortcut[] = [];
    const pages: boolean[][][] = []; // pages[pageIndex][y][x] = occupied?

    const ensurePage = (pageIdx: number) => {
        while (pages.length <= pageIdx) {
            const newPage = Array(rows).fill(null).map(() => Array(cols).fill(false));
            pages.push(newPage);
        }
    };

    const isOccupied = (pageIdx: number, x: number, y: number, w: number, h: number) => {
        ensurePage(pageIdx);
        const grid = pages[pageIdx];
        
        // Bounds check
        if (x + w > cols || y + h > rows) return true;

        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                // Safety check for grid boundaries
                if (y + dy >= rows || x + dx >= cols) return true;
                if (grid[y + dy][x + dx]) return true;
            }
        }
        return false;
    };

    const markOccupied = (pageIdx: number, x: number, y: number, w: number, h: number) => {
        ensurePage(pageIdx);
        const grid = pages[pageIdx];
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                if (y + dy < rows && x + dx < cols) {
                    grid[y + dy][x + dx] = true;
                }
            }
        }
    };

    items.forEach(item => {
        if (!item) return; // Safety check to prevent crash if array has holes
        
        // Clamp dimensions to grid size to prevent infinite loops
        // Use optional chaining (?.) and fallback to prevent 'reading size of undefined' crashes
        const w = Math.min(cols, Math.max(1, item?.size?.w || 1));
        const h = Math.min(rows, Math.max(1, item?.size?.h || 1));
        
        let placed = false;
        let pageIdx = 0;
        const MAX_PAGES = 20; // Safety break to prevent infinite loops in edge cases

        // Try to place in earliest possible page
        while (!placed && pageIdx < MAX_PAGES) {
            ensurePage(pageIdx);
            
            // Scan current page grid
            searchLoop:
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    if (!isOccupied(pageIdx, x, y, w, h)) {
                        markOccupied(pageIdx, x, y, w, h);
                        packedItems.push({ ...item, x, y, page: pageIdx, size: { w, h } });
                        placed = true;
                        break searchLoop;
                    }
                }
            }
            
            if (!placed) pageIdx++;
        }
    });

    return packedItems;
};