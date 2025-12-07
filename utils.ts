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
        // 确保配置对象有效
        if (!config || typeof config !== 'object') {
            throw new Error('Invalid config object');
        }

        // 精简shortcuts：移除布局相关字段和默认值
        const cleanShortcuts = (config.shortcuts || []).filter(s => s && s.id).map(s => {
            const clean: any = {
                id: s.id,
                title: s.title,
                url: s.url,
                type: s.type
            };
            
            // color：只在没有自定义图标时才保存（有图标时背景色不可见）
            if (!s.customIcon && s.color) {
                clean.color = s.color;
            }
            
            // 只有非默认值才保存
            if (s.customIcon) clean.icon = s.customIcon;
            if (s.size && (s.size.w !== 1 || s.size.h !== 1)) clean.size = s.size;
            if (s.widgetType) {
                clean.widget = {
                    type: s.widgetType,
                    content: s.widgetContent
                };
            }
            
            return clean;
        });

        // 精简dockItems：只保存必要字段
        const cleanDockItems = (config.dockItems || []).filter(d => d && d.id).map(d => {
            const clean: any = {
                id: d.id,
                title: d.title || d.name,
                url: d.url,
                type: d.type || 'auto'
            };
            
            // color：只在没有自定义图标时才保存
            if (!d.customIcon && d.color) {
                clean.color = d.color;
            }
            
            if (d.customIcon) clean.icon = d.customIcon;
            return clean;
        });

        // 创建一个干净的配置副本
        const cleanConfig = {
            version: config.version || '1.0',
            createdAt: config.createdAt || new Date().toISOString(),
            settings: config.settings || {},
            wallpaper: config.wallpaper || '',
            shortcuts: cleanShortcuts,
            dock: cleanDockItems
        };

        const yamlStr = dump(cleanConfig, {
            indent: 2,
            lineWidth: -1, // Don't break long lines (like base64 or long URLs)
            noRefs: true,
            skipInvalid: true, // 跳过无法序列化的值
            sortKeys: false, // 保持原始顺序
        });

        // 验证生成的YAML不为空
        if (!yamlStr || yamlStr.trim() === '') {
            throw new Error('Generated YAML is empty');
        }

        return yamlStr;
    } catch (e) {
        console.error('Failed to generate YAML', e);
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        throw new Error(`导出配置失败: ${errorMsg}\n\n请检查配置数据是否有效。`);
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

        // 支持新旧格式：dock 或 dockItems
        const dockItems = doc.dock || doc.dockItems;
        if (!Array.isArray(dockItems)) {
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

        // 解析shortcuts：恢复默认值和布局字段
        const shortcuts = doc.shortcuts.map((s: any) => {
            if (!s || !s.id) return null;
            return {
                id: s.id,
                title: s.title,
                url: s.url,
                type: s.type || 'auto',
                color: s.color || 'from-gray-800 to-gray-700',
                customIcon: s.icon, // 新格式用icon，映射回customIcon
                size: s.size || { w: 1, h: 1 },
                isApp: s.url?.startsWith('#') || false,
                widgetType: s.widget?.type,
                widgetContent: s.widget?.content
            };
        }).filter((s: any) => s !== null);

        // 解析dockItems：恢复完整字段
        const parsedDockItems = dockItems.map((d: any) => {
            if (!d || !d.id) return null;
            return {
                id: d.id,
                title: d.title,
                name: d.title,
                url: d.url,
                type: d.type || 'auto',
                color: d.color || 'from-gray-800 to-gray-700',
                customIcon: d.icon, // 新格式用icon，映射回customIcon
                iconType: d.type || 'auto'
            };
        }).filter((d: any) => d !== null);

        return {
            version: doc.version || '1.0',
            createdAt: doc.createdAt || new Date().toISOString(),
            settings: doc.settings,
            wallpaper: doc.wallpaper,
            shortcuts,
            dockItems: parsedDockItems
        } as GlobalConfig;

    } catch (e) {
        console.error('Failed to parse YAML', e);
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        throw new Error('Invalid Configuration File: ' + errorMsg);
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

// --- Network Helpers ---
export const jsonp = (url: string, callbackParam: string = 'callback'): Promise<any> => {
    return new Promise((resolve, reject) => {
        const callbackName = 'jsonp_' + Date.now() + '_' + Math.round(Math.random() * 100000);
        const script = document.createElement('script');

        // Add callback parameter to URL
        const separator = url.includes('?') ? '&' : '?';
        script.src = `${url}${separator}${callbackParam}=${callbackName}`;
        script.async = true;

        // Define global callback
        (window as any)[callbackName] = (data: any) => {
            cleanup();
            resolve(data);
        };

        // Error handling
        script.onerror = () => {
            cleanup();
            reject(new Error(`JSONP request failed for ${url}`));
        };

        // Cleanup function
        const cleanup = () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
            delete (window as any)[callbackName];
        };

        document.body.appendChild(script);
    });
};
// --- Icon URL Helpers ---
// Get the best icon URL for a website
export const getIconUrl = (url: string) => {
    try {
        const domain = new URL(url).hostname;
        // Using icon.horse as primary - best quality and coverage
        return `https://icon.horse/icon/${domain}`;
    } catch (e) {
        return null;
    }
};

// Get all available icon URLs for fallback
export const getAllIconUrls = (url: string) => {
    try {
        const domain = new URL(url).hostname;
        return [
            // Priority 1: icon.horse - High quality, good coverage, automatic fallbacks
            { source: 'iconhorse', url: `https://icon.horse/icon/${domain}`, name: 'Icon Horse' },
            // Priority 2: Clearbit - High quality logos for major companies
            { source: 'clearbit', url: `https://logo.clearbit.com/${domain}`, name: 'Clearbit' },
            // Priority 3: unavatar.io - Good alternatives from multiple sources
            { source: 'unavatar', url: `https://unavatar.io/${domain}?fallback=false`, name: 'Unavatar' },
            // Priority 4: Google Favicon - Reliable but sometimes low quality
            { source: 'google', url: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`, name: 'Google' },
            // Priority 5: DuckDuckGo - Good fallback
            { source: 'ddg', url: `https://icons.duckduckgo.com/ip3/${domain}.ico`, name: 'DuckDuckGo' },
            // Priority 6: Favicon Kit - Another reliable source  
            { source: 'faviconkit', url: `https://api.faviconkit.com/${domain}/128`, name: 'Favicon Kit' },
            // Priority 7: Direct favicon from the site
            { source: 'direct', url: `https://${domain}/favicon.ico`, name: 'Direct' }
        ];
    } catch (e) {
        return [];
    }
};

// Get icon sources object for fallback handling
export const getIconSources = (url: string) => {
    try {
        const domain = new URL(url).hostname;
        return {
            iconhorse: `https://icon.horse/icon/${domain}`,
            clearbit: `https://logo.clearbit.com/${domain}`,
            unavatar: `https://unavatar.io/${domain}?fallback=false`,
            google: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
            ddg: `https://icons.duckduckgo.com/ip3/${domain}.ico`,
            faviconkit: `https://api.faviconkit.com/${domain}/128`,
            direct: `https://${domain}/favicon.ico`
        };
    } catch (e) {
        return null;
    }
};
