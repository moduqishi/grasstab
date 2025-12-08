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

        // 验证必需字段
        if (!config.settings || typeof config.settings !== 'object') {
            throw new Error('Missing settings object');
        }

        // 精简shortcuts：移除布局相关字段和默认值
        const cleanShortcuts = (config.shortcuts || []).filter(s => s && s.id).map(s => {
            const clean: any = {
                id: s.id,
                title: s.title || '',
                url: s.url || '',
                type: s.type || 'auto'
            };
            
            // displayName：显示名称（如果与 title 不同）
            if (s.displayName && s.displayName !== s.title) {
                clean.displayName = s.displayName;
            }
            
            // iconType：系统应用和特殊类型需要此字段
            if (s.iconType) clean.iconType = s.iconType;
            
            // isApp：标识是否为系统应用
            if (s.isApp) clean.isApp = s.isApp;
            
            // hidden：是否隐藏
            if (s.hidden) clean.hidden = s.hidden;
            
            // color：只在没有自定义图标时才保存（有图标时背景色不可见）
            if (!s.customIcon && s.color && s.color !== 'from-gray-800 to-gray-700') {
                clean.color = s.color;
            }
            
            // 自定义图标
            if (s.customIcon) clean.icon = s.customIcon;
            
            // 尺寸：只保存非默认值
            if (s.size && (s.size.w !== 1 || s.size.h !== 1)) {
                clean.size = { w: s.size.w, h: s.size.h };
            }
            
            // 小组件配置
            if (s.widgetType) {
                clean.widget = {
                    type: s.widgetType,
                    content: s.widgetContent || ''
                };
            }
            
            return clean;
        });

        // 精简dockItems：只保存必要字段
        const cleanDockItems = (config.dockItems || []).filter(d => d && d.id).map(d => {
            const clean: any = {
                id: d.id,
                title: d.title || d.name || '',
                url: d.url || '',
                type: d.type || 'auto'
            };
            
            // displayName：显示名称（如果与 title 不同）
            if (d.displayName && d.displayName !== d.title) {
                clean.displayName = d.displayName;
            }
            
            // iconType：系统应用必需字段（如 'cpu', 'settings' 等）
            if (d.iconType) clean.iconType = d.iconType;
            
            // isApp：标识是否为系统应用
            if (d.isApp) clean.isApp = d.isApp;
            
            // hidden：是否隐藏
            if (d.hidden) clean.hidden = d.hidden;
            
            // color：只在没有自定义图标且非默认值时才保存
            if (!d.customIcon && d.color && d.color !== 'from-gray-800 to-gray-700') {
                clean.color = d.color;
            }
            
            // 自定义图标
            if (d.customIcon) clean.icon = d.customIcon;
            
            return clean;
        });

        // 精简settings：移除undefined值
        const cleanSettings: any = {
            showDock: config.settings.showDock !== false,
            showDockEdit: config.settings.showDockEdit !== false,
            showSearchBar: config.settings.showSearchBar !== false,
            showPagination: config.settings.showPagination !== false,
            language: config.settings.language || 'zh'
        };

        // 可选字段
        if (config.settings.searchEngine) {
            cleanSettings.searchEngine = config.settings.searchEngine;
        }
        if (config.settings.gridCols) {
            cleanSettings.gridCols = config.settings.gridCols;
        }
        if (config.settings.gridRows) {
            cleanSettings.gridRows = config.settings.gridRows;
        }
        if (config.settings.hiddenSystemApps && config.settings.hiddenSystemApps.length > 0) {
            cleanSettings.hiddenSystemApps = config.settings.hiddenSystemApps;
        }

        // 创建一个干净的配置副本
        const cleanConfig: any = {
            version: config.version || '1.0',
            createdAt: config.createdAt || new Date().toISOString(),
            settings: cleanSettings,
            wallpaper: config.wallpaper || '',
            dock: cleanDockItems,
            shortcuts: cleanShortcuts
        };

        // 添加 AI 配置（如果存在）
        if (config.aiSettings) {
            cleanConfig.aiSettings = {
                providers: config.aiSettings.providers || [],
                currentProviderId: config.aiSettings.currentProviderId,
                currentModel: config.aiSettings.currentModel
            };
        }

        // 添加便签内容（如果存在）
        if (config.notes !== undefined) {
            cleanConfig.notes = config.notes;
        }

        const yamlStr = dump(cleanConfig, {
            indent: 2,
            lineWidth: -1, // Don't break long lines (like base64 or long URLs)
            noRefs: true,
            skipInvalid: false, // 严格模式：不跳过无效值
            sortKeys: false, // 保持原始顺序
            flowLevel: -1, // 使用块样式（更易读）
        });

        // 验证生成的YAML不为空
        if (!yamlStr || yamlStr.trim() === '') {
            throw new Error('Generated YAML is empty');
        }

        // 添加注释头部
        const aiInfo = cleanConfig.aiSettings ? ` | AI Providers: ${cleanConfig.aiSettings.providers.length}` : '';
        const notesInfo = cleanConfig.notes !== undefined ? ` | Notes: ${cleanConfig.notes.length} chars` : '';
        
        const header = `# GrassTab Configuration File
# Version: ${cleanConfig.version}
# Created: ${new Date(cleanConfig.createdAt).toLocaleString()}
# Shortcuts: ${cleanShortcuts.length} | Dock Items: ${cleanDockItems.length}${aiInfo}${notesInfo}
# ==========================================

`;

        return header + yamlStr;
    } catch (e) {
        console.error('Failed to generate YAML', e);
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        throw new Error(`导出配置失败: ${errorMsg}\n\n请检查配置数据是否有效。`);
    }
};

export const parseYamlConfig = (yamlStr: string): GlobalConfig | null => {
    try {
        // 移除可能的 UTF-8 BOM 和头部注释
        const cleanYaml = yamlStr.replace(/^\uFEFF/, '').trim();
        
        if (!cleanYaml) {
            throw new Error('Configuration file is empty');
        }

        const doc = load(cleanYaml) as any;

        // Enhanced validation
        if (!doc) {
            throw new Error('Failed to parse configuration file');
        }

        // 验证版本号
        if (!doc.version) {
            console.warn('Missing version field, assuming 1.0');
            doc.version = '1.0';
        }

        // 验证设置对象
        if (!doc.settings || typeof doc.settings !== 'object') {
            throw new Error('Missing or invalid "settings" section');
        }

        // 验证必需的设置字段
        const settings = doc.settings;
        const requiredSettings = ['showDock', 'showDockEdit', 'showSearchBar', 'showPagination', 'language'];
        const missingSettings = requiredSettings.filter(key => !(key in settings));
        
        if (missingSettings.length > 0) {
            console.warn(`Missing settings: ${missingSettings.join(', ')}, using defaults`);
            // 应用默认值
            if (typeof settings.showDock !== 'boolean') settings.showDock = true;
            if (typeof settings.showDockEdit !== 'boolean') settings.showDockEdit = true;
            if (typeof settings.showSearchBar !== 'boolean') settings.showSearchBar = true;
            if (typeof settings.showPagination !== 'boolean') settings.showPagination = true;
            if (!settings.language) settings.language = 'zh';
        }

        // 验证 shortcuts 数组
        if (!doc.shortcuts) {
            console.warn('Missing shortcuts array, using empty array');
            doc.shortcuts = [];
        } else if (!Array.isArray(doc.shortcuts)) {
            throw new Error('"shortcuts" must be an array');
        }

        // 验证 dock 数组（支持新旧格式）
        const dockItems = doc.dock || doc.dockItems;
        if (!dockItems) {
            console.warn('Missing dock array, using empty array');
            doc.dock = [];
        } else if (!Array.isArray(dockItems)) {
            throw new Error('"dock" must be an array');
        }

        // 验证壁纸
        if (!doc.wallpaper) {
            console.warn('Missing wallpaper, using default');
            doc.wallpaper = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4';
        } else if (typeof doc.wallpaper !== 'string') {
            throw new Error('"wallpaper" must be a string (URL or data URI)');
        }

        // 解析 shortcuts：恢复默认值和布局字段
        const shortcuts = doc.shortcuts.map((s: any, index: number) => {
            if (!s || typeof s !== 'object') {
                console.warn(`Invalid shortcut at index ${index}, skipping`);
                return null;
            }
            
            if (!s.id) {
                console.warn(`Shortcut at index ${index} missing ID, skipping`);
                return null;
            }

            return {
                id: s.id,
                title: s.title || 'Untitled',
                displayName: s.displayName || s.title || 'Untitled', // 恢复 displayName
                url: s.url || '',
                type: s.type || 'auto',
                color: s.color || 'from-gray-800 to-gray-700',
                customIcon: s.icon || undefined,
                // iconType: 只为系统应用设置（避免普通网站跳过 URL 图标降级）
                iconType: s.iconType || undefined,
                size: s.size || { w: 1, h: 1 },
                // isApp：优先使用配置值，否则判断 type='sys' 或 URL 以 # 开头
                isApp: s.isApp !== undefined ? s.isApp : (s.type === 'sys' || s.url?.startsWith('#') || false),
                hidden: s.hidden || false, // 恢复 hidden 字段
                widgetType: s.widget?.type || undefined,
                widgetContent: s.widget?.content || undefined
            };
        }).filter((s: any) => s !== null);

        // 解析 dockItems：恢复完整字段（DockItem 继承自 Shortcut，需要包含所有 Shortcut 字段）
        const parsedDockItems = dockItems.map((d: any, index: number) => {
            if (!d || typeof d !== 'object') {
                console.warn(`Invalid dock item at index ${index}, skipping`);
                return null;
            }
            
            if (!d.id) {
                console.warn(`Dock item at index ${index} missing ID, skipping`);
                return null;
            }

            // DockItem 必须包含所有 Shortcut 字段，否则会导致图标显示和点击失效
            return {
                id: d.id,
                title: d.title || 'Untitled',
                name: d.title || 'Untitled',
                displayName: d.displayName || d.title || 'Untitled', // 恢复 displayName
                url: d.url || '',
                type: d.type || 'auto',
                color: d.color || 'from-gray-800 to-gray-700',
                customIcon: d.icon || undefined,
                // iconType：只为系统应用设置（避免普通网站跳过 URL 图标降级）
                iconType: d.iconType || undefined,
                // isApp：优先使用配置值，否则判断 type='sys' 或 URL 以 # 开头
                isApp: d.isApp !== undefined ? d.isApp : (d.type === 'sys' || d.url?.startsWith('#') || false),
                hidden: d.hidden || false, // 恢复 hidden 字段
                // 确保 size 字段存在（Dock 项固定为 1x1）
                size: { w: 1, h: 1 },
                // Widget 相关字段
                widgetType: d.widget?.type || undefined,
                widgetContent: d.widget?.content || undefined
            };
        }).filter((d: any) => d !== null);

        // 验证解析结果
        console.log(`Parsed ${shortcuts.length} shortcuts and ${parsedDockItems.length} dock items`);

        // 构建最终配置对象
        const config: GlobalConfig = {
            version: doc.version,
            createdAt: doc.createdAt || new Date().toISOString(),
            settings: {
                showDock: settings.showDock,
                showDockEdit: settings.showDockEdit,
                showSearchBar: settings.showSearchBar,
                showPagination: settings.showPagination,
                language: settings.language,
                searchEngine: settings.searchEngine,
                gridCols: settings.gridCols,
                gridRows: settings.gridRows,
                hiddenSystemApps: settings.hiddenSystemApps || []
            },
            wallpaper: doc.wallpaper,
            shortcuts,
            dockItems: parsedDockItems
        };

        // 解析 AI 配置（如果存在）
        if (doc.aiSettings && typeof doc.aiSettings === 'object') {
            config.aiSettings = {
                providers: Array.isArray(doc.aiSettings.providers) ? doc.aiSettings.providers : [],
                currentProviderId: doc.aiSettings.currentProviderId,
                currentModel: doc.aiSettings.currentModel
            };
            console.log(`Parsed ${config.aiSettings.providers.length} AI providers`);
        }

        // 解析便签内容（如果存在）
        if (doc.notes !== undefined) {
            config.notes = typeof doc.notes === 'string' ? doc.notes : '';
            console.log(`Parsed notes: ${config.notes.length} chars`);
        }

        return config;

    } catch (e) {
        console.error('Failed to parse YAML', e);
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        throw new Error(`Configuration Parse Error: ${errorMsg}`);
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
