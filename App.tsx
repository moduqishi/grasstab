import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Minus, Check, Edit3, Plus, Search } from 'lucide-react';
import { DEFAULT_WALLPAPER, SEARCH_ENGINES, DEFAULT_SHORTCUTS, DEFAULT_DOCK } from './constants.tsx';
import { Shortcut, DockItem, WindowState, DragState, SearchEngineKey, PackedShortcut, SystemSettings, GlobalConfig } from './types';
import { useGridCalculation } from './hooks/useGridCalculation';
import { AppIcon } from './components/AppIcon';
import { ContextMenu } from './components/ContextMenu';
import { AppContextMenu } from './components/AppContextMenu';
import { ResponsiveWindow } from './components/Window';
import { CalculatorApp } from './components/apps/Calculator';
import { NotesApp } from './components/apps/Notes';
import { AIApp } from './components/apps/AI';
import { SettingsApp } from './components/apps/Settings';
import { AddShortcutApp } from './components/apps/AddShortcut';
import { EditApp } from './components/apps/EditApp';
import { WebView } from './components/apps/WebView';
import { packItems, generateYamlConfig, parseYamlConfig, jsonp } from './utils';
import { t } from './i18n';

export default function App() {
    // --- View State (Hero vs Desktop) ---
    const [viewState, setViewState] = useState<'hero' | 'desktop'>('hero');
    const [wallpaper, setWallpaper] = useState(localStorage.getItem('os-bg') || DEFAULT_WALLPAPER);

    // --- System Settings ---
    const [sysSettings, setSysSettings] = useState<SystemSettings>(() => {
        try {
            const saved = localStorage.getItem('os-settings');
            return saved ? JSON.parse(saved) : { showDockEdit: true, showSearchBar: true, showPagination: true, showDock: true, language: 'zh' };
        } catch {
            return { showDockEdit: true, showSearchBar: true, showPagination: true, showDock: true, language: 'zh' };
        }
    });

    const lang = sysSettings.language || 'zh';

    // Get translated window title
    const getWindowTitle = (w: WindowState): string => {
        switch (w.type) {
            case 'calc': return t(lang, 'calculator');
            case 'notes': return t(lang, 'notes');
            case 'ai': return t(lang, 'ai');
            case 'settings': return t(lang, 'settings');
            case 'add': return t(lang, 'addShortcut');
            case 'edit': return w.editData?.type === 'widget' ? t(lang, 'editApp') : t(lang, 'editApp');
            case 'web': return w.title;
            default: return w.title;
        }
    };

    useEffect(() => {
        localStorage.setItem('os-settings', JSON.stringify(sysSettings));
    }, [sysSettings]);

    // --- Data State ---
    const [shortcuts, setShortcuts] = useState<Shortcut[]>(() => {
        try {
            const s = JSON.parse(localStorage.getItem('os-shortcuts') || 'null');
            // Filter out nulls/invalid items
            return Array.isArray(s) ? s.filter(i => !!i) : DEFAULT_SHORTCUTS;
        } catch { return DEFAULT_SHORTCUTS; }
    });

    const [dockItems, setDockItems] = useState<DockItem[]>(() => {
        try {
            const d = JSON.parse(localStorage.getItem('os-dock') || 'null');
            // Filter out legacy 'edit' button and nulls
            return Array.isArray(d) ? d.filter((item: any) => item && item.id !== 'edit') : DEFAULT_DOCK;
        } catch { return DEFAULT_DOCK; }
    });

    // --- Layout State ---
    const { cols, rows, itemsPerPage, isMobile, cellWidth, cellHeight, gridWidth } = useGridCalculation(sysSettings.showDock);
    const [page, setPage] = useState(0);
    const [dir, setDir] = useState(0);

    // PACKING ALGORITHM: Calculate layout for all items including widgets
    // We add the 'Add Button' as a virtual item at the end of the shortcut list for layout purposes
    const layoutItems = useMemo(() => {
        const itemsToPack = [...shortcuts, { id: 'add-btn', isAdd: true, type: 'sys' as const, color: '', size: { w: 1, h: 1 } }];
        return packItems(itemsToPack, cols, rows);
    }, [shortcuts, cols, rows]);

    // Calculate total pages based on packed layout
    const totalPages = Math.max(1, layoutItems.length > 0 ? Math.max(...layoutItems.map(i => i.page)) + 1 : 1);

    useEffect(() => {
        if (page >= totalPages) setPage(Math.max(0, totalPages - 1));
    }, [totalPages, page]);

    // --- System State ---
    const [isEditing, setIsEditing] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);
    const [appContextMenu, setAppContextMenu] = useState<{ x: number, y: number, app: Shortcut } | null>(null);
    const [time, setTime] = useState(new Date());
    const [engine, setEngine] = useState<SearchEngineKey>('google');
    const [search, setSearch] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    // --- Search Suggestions ---
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!search.trim()) {
                setSuggestions([]);
                return;
            }

            try {
                let results: string[] = [];
                const q = encodeURIComponent(search);

                if (engine === 'google') {
                    // Google Suggest API using JSONP
                    try {
                        const data = await jsonp(`https://suggestqueries.google.com/complete/search?client=firefox&q=${q}`, 'jsonp');
                        if (Array.isArray(data) && data[1]) {
                            results = data[1];
                        }
                    } catch (err) {
                        console.log('Google suggestions fetch failed', err);
                    }
                } else if (engine === 'bing') {
                    // Bing Suggest API using JSONP
                    try {
                        const data = await jsonp(`https://api.bing.com/qsonhs.aspx?q=${q}`, 'cb');
                        if (data && data.AS && data.AS.Results && data.AS.Results[0] && data.AS.Results[0].Suggests) {
                            results = data.AS.Results[0].Suggests.map((s: any) => s.Txt);
                        }
                    } catch (err) {
                        console.log('Bing suggestions fetch failed', err);
                    }
                } else if (engine === 'baidu') {
                    // Baidu Suggest using JSONP
                    try {
                        const data = await jsonp(`https://suggestion.baidu.com/su?wd=${q}`, 'cb');
                        if (data && data.s) {
                            results = data.s;
                        }
                    } catch (err) {
                        console.log('Baidu suggestions fetch failed', err);
                    }
                }

                setSuggestions(results.slice(0, 8)); // Limit to 8 suggestions
                setShowSuggestions(true);
            } catch (e) {
                console.error('Suggestion fetch failed', e);
                setSuggestions([]);
            }
        }, 300); // Debounce

        return () => clearTimeout(timer);
    }, [search, engine]);

    const handleSearch = (query: string) => {
        if (!query.trim()) return;
        
        let trimmedQuery = query.trim();
        
        // 智能修正：将中文标点替换为英文标点
        trimmedQuery = trimmedQuery
            .replace(/：/g, ':')      // 中文冒号 → 英文冒号
            .replace(/／/g, '/')      // 中文斜杠 → 英文斜杠
            .replace(/。/g, '.')      // 中文句号 → 英文点
            .replace(/，/g, '.');     // 中文逗号 → 英文点（用户可能误用）
        
        // 检查是否是 URL（包含协议或域名格式）
        // 支持: http://xxx, https://xxx, xxx.com, xxx.cn, localhost:3000 等
        const urlPattern = /^(https?[:：]\/\/|[a-zA-Z0-9-]+[。．.][a-zA-Z]{2,}|localhost[：:]\d+)/;
        const isUrl = urlPattern.test(trimmedQuery);
        
        if (isUrl) {
            // 如果是 URL，直接访问
            let url = trimmedQuery;
            
            // 修正协议部分
            if (url.match(/^https?[:：]/)) {
                url = url.replace(/^http[:：]/, 'http:').replace(/^https[:：]/, 'https:');
                // 确保有双斜杠
                if (!url.includes('://')) {
                    url = url.replace(/^(https?:)/, '$1//');
                }
            } else {
                // 没有协议，添加 https://
                url = `https://${url}`;
            }
            
            window.location.assign(url);
        } else {
            // 否则使用搜索引擎搜索
            window.location.assign(SEARCH_ENGINES[engine].url + encodeURIComponent(trimmedQuery));
        }
        
        setShowSuggestions(false);
    };


    // --- Window State ---
    const [windows, setWindows] = useState<WindowState[]>([
        { id: 'calc', type: 'calc', title: 'Calculator', isOpen: false, isMaximized: false, z: 100, w: 340, h: 560 },
        { id: 'notes', type: 'notes', title: 'Notes', isOpen: false, isMaximized: false, z: 100, w: 420, h: 500 },
        { id: 'ai', type: 'ai', title: 'Nebula AI', isOpen: false, isMaximized: false, z: 100, w: 500, h: 600 },
        { id: 'settings', type: 'settings', title: 'Settings', isOpen: false, isMaximized: false, z: 100, w: 720, h: 520 },
        { id: 'add', type: 'add', title: 'Add Shortcut', isOpen: false, isMaximized: false, z: 100, w: 400, h: 480 },
        { id: 'edit', type: 'edit', title: 'Edit App', isOpen: false, isMaximized: false, z: 100, w: 500, h: 600 },
    ]);
    const [maxZ, setMaxZ] = useState(100);

    const isAnyWindowMaximized = windows.some(w => w.isOpen && w.isMaximized);

    // --- Persistance ---
    useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
    useEffect(() => localStorage.setItem('os-bg', wallpaper), [wallpaper]);
    useEffect(() => localStorage.setItem('os-shortcuts', JSON.stringify(shortcuts)), [shortcuts]);
    useEffect(() => localStorage.setItem('os-dock', JSON.stringify(dockItems)), [dockItems]);

    // --- Config Export/Import/Reset ---
    const handleExportConfig = useCallback(() => {
        const config: GlobalConfig = {
            version: '1.0',
            createdAt: new Date().toISOString(),
            settings: sysSettings,
            wallpaper,
            shortcuts,
            dockItems
        };
        const yamlStr = generateYamlConfig(config);
        const blob = new Blob([yamlStr], { type: 'text/yaml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `os-one-config-${new Date().toISOString().slice(0, 10)}.yaml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [sysSettings, wallpaper, shortcuts, dockItems]);

    const handleImportConfig = useCallback(async (file: File) => {
        try {
            // Validate file type
            const fileName = file.name.toLowerCase();
            if (!fileName.endsWith('.yaml') && !fileName.endsWith('.yml') && !fileName.endsWith('.json')) {
                alert('Please select a valid YAML or JSON configuration file (.yaml, .yml, or .json)');
                return;
            }

            const text = await file.text();

            if (!text || text.trim() === '') {
                alert('Configuration file is empty');
                return;
            }

            const config = parseYamlConfig(text);

            if (config) {
                const confirmMsg = `Import configuration from "${file.name}"?\n\nThis will overwrite:\n• ${shortcuts.length} shortcuts → ${config.shortcuts.length} shortcuts\n• ${dockItems.length} dock items → ${config.dockItems.length} dock items\n• Current wallpaper and settings\n\nThis action cannot be undone.`;

                if (window.confirm(confirmMsg)) {
                    setSysSettings(config.settings);
                    setWallpaper(config.wallpaper);
                    setShortcuts(config.shortcuts);
                    setDockItems(config.dockItems);

                    // Reset page to first page
                    setPage(0);

                    // Success notification
                    setTimeout(() => {
                        alert(`✓ Configuration imported successfully!\n\n• ${config.shortcuts.length} shortcuts loaded\n• ${config.dockItems.length} dock items loaded\n• Settings and wallpaper applied`);
                    }, 100);
                }
            }
        } catch (e) {
            console.error('Import error:', e);
            const errorMsg = e instanceof Error ? e.message : 'Unknown error occurred';
            alert(`Failed to import configuration:\n\n${errorMsg}\n\nPlease check the file format and try again.`);
        }
    }, [shortcuts.length, dockItems.length]);

    const handleReset = useCallback(() => {
        const confirmMsg = `⚠️ RESET ALL DATA\n\nThis will permanently delete:\n• ${shortcuts.length} shortcuts\n• ${dockItems.length} dock items\n• All system settings\n• Custom wallpaper\n• Saved notes\n\nThe system will reload with default settings.\n\nThis action CANNOT be undone!`;

        if (window.confirm(confirmMsg)) {
            // Double confirmation for safety
            if (window.confirm('Are you absolutely sure? This is your last chance to cancel.')) {
                try {
                    // Clear all localStorage keys
                    localStorage.removeItem('os-shortcuts');
                    localStorage.removeItem('os-dock');
                    localStorage.removeItem('os-settings');
                    localStorage.removeItem('os-bg');
                    localStorage.removeItem('os-note');

                    // Optional: Clear all OS-related keys
                    Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('os-')) {
                            localStorage.removeItem(key);
                        }
                    });

                    // Show brief success message before reload
                    alert('System data cleared. Reloading with defaults...');

                    // Force reload to reset all state
                    window.location.reload();
                } catch (e) {
                    console.error('Reset error:', e);
                    alert('Failed to reset system data. Please try clearing your browser cache manually.');
                }
            }
        }
    }, [shortcuts.length, dockItems.length]);

    // --- Drag & Drop State ---
    const [dragState, setDragState] = useState<DragState>({ isDragging: false, source: null, index: -1, item: null, mx: 0, my: 0 });
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const dockRef = useRef<HTMLDivElement>(null);

    // Auto-pagination refs
    const flipInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const stateRef = useRef({ page, totalPages });
    // Keep stateRef up to date for the interval closure
    stateRef.current = { page, totalPages };

    // --- Dock Constants (STRICT MATH LAYOUT) ---
    const DOCK_ICON_SIZE = 64;
    const DOCK_ITEM_GAP = 20;
    const DOCK_CONTAINER_PADDING = 24;
    const SLOT_WIDTH = DOCK_ICON_SIZE + DOCK_ITEM_GAP;

    // Calculate count based on whether the edit button is shown
    const dockCount = dockItems.length + (sysSettings.showDockEdit ? 1 : 0);
    // If no items and no edit button, width is small (but dock logic usually requires at least one item or padding)
    const dockWidth = Math.max(
        DOCK_CONTAINER_PADDING * 2,
        (DOCK_CONTAINER_PADDING * 2) + (dockCount * DOCK_ICON_SIZE) + (Math.max(0, dockCount - 1) * DOCK_ITEM_GAP)
    );

    // --- Window Management ---
    const openWin = (id: string, extra: any = {}) => {
        if (isEditing) return;
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

    const handleSaveApp = (updated: Shortcut) => {
        setShortcuts(prev => prev.map(s => s.id === updated.id ? updated : s));
        closeWin('edit');
    };

    const handleDeleteApp = (app: Shortcut) => {
        if (window.confirm(`确定要删除 "${app.title || '此应用'}" 吗？`)) {
            setShortcuts(prev => prev.filter(s => s.id !== app.id));
        }
    };

    const handleAppContextMenu = (e: React.MouseEvent, app: Shortcut) => {
        if (isEditing) return; // Don't show context menu in edit mode
        e.preventDefault();
        e.stopPropagation();
        setContextMenu(null); // Close desktop context menu
        setAppContextMenu({ x: e.clientX, y: e.clientY, app });
    };

    const closeWin = (id: string) => setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false, isMaximized: false } : w));
    const focusWin = (id: string) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, z: maxZ + 1 } : w));
        setMaxZ(prev => prev + 1);
    };
    const toggleMaximize = (id: string) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
    };

    // --- Interaction Handlers ---
    const handlePointerDown = (e: React.PointerEvent, index: number, source: 'grid' | 'dock', item: any) => {
        if (item.id === 'edit') return;
        if (index === -1) return; // Prevent invalid drag start

        e.preventDefault();

        // Delay edit mode triggers
        if (!isEditing) {
            longPressTimer.current = setTimeout(() => { setIsEditing(true); }, 800);
            return;
        }

        setDragState({
            isDragging: true,
            source,
            index, // For grid, this is the index in the raw shortcuts array. For dock, index in dockItems.
            item,
            mx: e.clientX,
            my: e.clientY
        });
    };

    const handlePointerMove = useCallback((e: PointerEvent) => {
        if (!dragState.isDragging || !dragState.item) return;
        setDragState(prev => ({ ...prev, mx: e.clientX, my: e.clientY }));

        // --- Edge Detection for Auto-Page Flip ---
        const EDGE_THRESHOLD = 80;
        const screenWidth = window.innerWidth;

        if (e.clientX < EDGE_THRESHOLD) {
            // Left Edge
            if (!flipInterval.current) {
                flipInterval.current = setInterval(() => {
                    const { page } = stateRef.current;
                    if (page > 0) {
                        setDir(-1);
                        setPage(p => p - 1);
                    }
                }, 600);
            }
        } else if (e.clientX > screenWidth - EDGE_THRESHOLD) {
            // Right Edge
            if (!flipInterval.current) {
                flipInterval.current = setInterval(() => {
                    const { page, totalPages } = stateRef.current;
                    if (page < totalPages - 1) {
                        setDir(1);
                        setPage(p => p + 1);
                    }
                }, 600);
            }
        } else {
            // Not near edge
            if (flipInterval.current) {
                clearInterval(flipInterval.current);
                flipInterval.current = null;
            }
        }

        // Grid Collision
        if (gridRef.current) {
            const gridRect = gridRef.current.getBoundingClientRect();
            const relX = e.clientX - gridRect.left;
            const relY = e.clientY - gridRect.top;

            if (relX >= 0 && relX <= gridRect.width && relY >= 0 && relY <= gridRect.height) {
                // Determine insertion index based on proximity to existing items on current page

                const col = Math.floor(relX / cellWidth);
                const row = Math.floor(relY / cellHeight);

                if (col >= 0 && col < cols && row >= 0 && row < rows) {
                    // Find if there is an item at this position on current page
                    const targetItem = layoutItems.find(i =>
                        i.page === page &&
                        i.x <= col && col < i.x + (i.size?.w || 1) &&
                        i.y <= row && row < i.y + (i.size?.h || 1)
                    );

                    let insertIndex = -1;

                    if (targetItem) {
                        if (targetItem.isAdd) {
                            insertIndex = shortcuts.length; // Insert at end
                        } else {
                            // Find index in raw shortcuts array
                            insertIndex = shortcuts.findIndex(s => s.id === targetItem.id);
                        }
                    } else {
                        // Hovering empty space. 
                        // Find the item that comes *after* this position visually or append to end of page.
                        const pageItems = layoutItems.filter(i => i.page === page && !i.isAdd);

                        // Sort by Y then X
                        pageItems.sort((a, b) => (a.y - b.y) || (a.x - b.x));

                        // Find first item that is visually "after" the cursor
                        const afterItem = pageItems.find(i => (i.y > row) || (i.y === row && i.x > col));

                        if (afterItem) {
                            insertIndex = shortcuts.findIndex(s => s.id === afterItem.id);
                        } else {
                            insertIndex = shortcuts.length;
                        }
                    }

                    if (insertIndex !== -1 && dragState.item) {
                        if (dragState.source === 'dock') {
                            // Dock -> Grid
                            const newDock = dockItems.filter(i => i.id !== dragState.item!.id);
                            setDockItems(newDock);

                            const newShortcuts = [...shortcuts];
                            newShortcuts.splice(insertIndex, 0, dragState.item as Shortcut);
                            setShortcuts(newShortcuts);

                            setDragState(prev => ({ ...prev, source: 'grid', index: insertIndex }));
                        } else if (dragState.source === 'grid') {
                            // Grid -> Grid
                            // Only perform move if the index is significantly different to prevent jitter
                            // Identify current index of dragging item
                            const currentIndex = shortcuts.findIndex(s => s.id === dragState.item!.id);

                            if (currentIndex !== -1 && currentIndex !== insertIndex) {
                                // Safe swap/move logic
                                // If we are moving 'forward' (current < insert), we need to adjust insertIndex because removal shifts array
                                let adjustedInsert = insertIndex;
                                if (currentIndex < insertIndex) {
                                    adjustedInsert = insertIndex - 1;
                                }

                                if (adjustedInsert !== currentIndex) {
                                    const newShortcuts = [...shortcuts];
                                    const [moved] = newShortcuts.splice(currentIndex, 1);

                                    newShortcuts.splice(insertIndex > currentIndex ? insertIndex - 1 : insertIndex, 0, moved);

                                    setShortcuts(newShortcuts);
                                    setDragState(prev => ({ ...prev, index: insertIndex > currentIndex ? insertIndex - 1 : insertIndex }));
                                }
                            }
                        }
                    }
                }
            }
        }

        // Dock Collision
        if (dockRef.current) {
            const dockRect = dockRef.current.getBoundingClientRect();
            if (e.clientX >= dockRect.left - 50 && e.clientX <= dockRect.right + 50 && e.clientY >= dockRect.top - 80 && e.clientY <= dockRect.bottom + 40) {
                const relX = e.clientX - dockRect.left;
                let hoverIndex = Math.floor((relX - DOCK_CONTAINER_PADDING + (SLOT_WIDTH / 2)) / SLOT_WIDTH);
                if (hoverIndex < 0) hoverIndex = 0;
                if (hoverIndex > dockItems.length) hoverIndex = dockItems.length;

                if (dragState.source === 'grid') {
                    // Grid -> Dock
                    const currentIndex = shortcuts.findIndex(s => s.id === dragState.item!.id);
                    if (currentIndex !== -1) {
                        const newShortcuts = [...shortcuts];
                        const [moved] = newShortcuts.splice(currentIndex, 1);

                        if (moved) {
                            setShortcuts(newShortcuts);
                            const newItem: DockItem = {
                                ...moved,
                                size: { w: 1, h: 1 }, // Force to 1x1 in Dock
                                iconType: moved.iconType || '',
                            };
                            const newDock = [...dockItems];
                            newDock.splice(hoverIndex, 0, newItem);
                            setDockItems(newDock);
                            setDragState(prev => ({ ...prev, source: 'dock', index: hoverIndex }));
                        }
                    }
                } else if (dragState.source === 'dock' && hoverIndex !== dragState.index) {
                    // Dock -> Dock
                    const newDock = [...dockItems];
                    if (dragState.index >= 0 && dragState.index < newDock.length) {
                        const [moved] = newDock.splice(dragState.index, 1);
                        if (moved) {
                            newDock.splice(hoverIndex, 0, moved);
                            setDockItems(newDock);
                            setDragState(prev => ({ ...prev, index: hoverIndex }));
                        }
                    }
                }
            }
        }
    }, [dragState, shortcuts, dockItems, cols, rows, cellWidth, cellHeight, page, layoutItems, SLOT_WIDTH]);

    const handlePointerUp = useCallback(() => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        if (flipInterval.current) {
            clearInterval(flipInterval.current);
            flipInterval.current = null;
        }
        setDragState(prev => ({ ...prev, isDragging: false }));
    }, []);

    useEffect(() => {
        if (dragState.isDragging) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
        }
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [dragState.isDragging, handlePointerMove, handlePointerUp]);

    const changePage = (delta: number) => {
        if (delta > 0 && page < totalPages - 1) { setDir(1); setPage(p => p + 1); }
        else if (delta < 0 && page > 0) { setDir(-1); setPage(p => p - 1); }
    };

    // Filter packed items for current page
    const currentItems = layoutItems.filter(i => i.page === page);

    const handleDesktopContextMenu = (e: React.MouseEvent) => {
        e.preventDefault(); // Always prevent browser's default context menu

        // Check if the click is NOT on an app icon (app icons will handle their own context menu)
        const target = e.target as HTMLElement;
        const isOnAppIcon = target.closest('[data-app-icon]');

        if (!isOnAppIcon) {
            setAppContextMenu(null);
            setContextMenu({ x: e.clientX, y: e.clientY });
        }
    };

    return (
        <div
            className="relative w-full h-screen overflow-hidden font-sans select-none flex flex-col bg-black text-white cursor-default"
            onContextMenu={handleDesktopContextMenu}
            onClick={() => { setContextMenu(null); setAppContextMenu(null); if (isEditing) setIsEditing(false); }}
            onPointerUp={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
            onWheel={(e) => {
                if (viewState === 'hero') {
                    if (e.deltaY > 30) {
                        setViewState('desktop');
                    }
                } else {
                    // Desktop mode
                    if (e.deltaY < -30 && page === 0) {
                        setViewState('hero');
                    } else if (Math.abs(e.deltaY) > 30) {
                        changePage(e.deltaY);
                    }
                }
            }}
        >
            <style>{`
                @keyframes slide-r { 0% { transform: translateX(40px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
                @keyframes slide-l { 0% { transform: translateX(-40px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
                @keyframes fly-in { 
                    0% { transform: scale(1.5); opacity: 0; } 
                    100% { transform: scale(1); opacity: 1; } 
                }
                .anim-fly-in { animation: fly-in 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
                @keyframes jiggle { 
                    0% { transform: rotate(0deg); }
                    25% { transform: rotate(-1.5deg); } 
                    50% { transform: rotate(0deg); } 
                    75% { transform: rotate(1.5deg); } 
                    100% { transform: rotate(0deg); } 
                }
                .anim-next { animation: slide-r 0.35s cubic-bezier(0.2, 0.8, 0.2, 1); }
                .anim-prev { animation: slide-l 0.35s cubic-bezier(0.2, 0.8, 0.2, 1); }
                
                .dock-glass {
                    background: rgba(40, 40, 45, 0.45);
                    backdrop-filter: blur(50px);
                    -webkit-backdrop-filter: blur(50px);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
                }

                .jiggle-mode { animation: jiggle 0.25s infinite linear; }
                .jiggle-mode:nth-child(2n) { animation-delay: 0.1s; }
                .jiggle-mode:nth-child(3n) { animation-delay: -0.15s; }

                /* Apple-style Scrollbar */
                ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                    border: 2px solid transparent;
                    background-clip: padding-box;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                    background-clip: padding-box;
                }
                ::-webkit-scrollbar-corner {
                    background: transparent;
                }
                /* Firefox */
                * {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
                }
            `}</style>

            <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105" style={{ backgroundImage: `url(${wallpaper})` }} />
            <div className="absolute inset-0 bg-black/20" />

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    onEdit={() => setIsEditing(!isEditing)}
                    onChangeWallpaper={() => openWin('settings')}
                    onReset={() => { if (window.confirm('Reset Layout?')) { localStorage.removeItem('os-shortcuts'); window.location.reload(); } }}
                    onOpenSettings={() => openWin('settings')}
                    onExportConfig={handleExportConfig}
                    onImportConfig={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.yaml,.yml,.json';
                        input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleImportConfig(file);
                        };
                        input.click();
                    }}
                    onToggleSearchBar={() => setSysSettings(prev => ({ ...prev, showSearchBar: !prev.showSearchBar }))}
                    onTogglePagination={() => setSysSettings(prev => ({ ...prev, showPagination: !prev.showPagination }))}
                    onToggleDock={() => setSysSettings(prev => ({ ...prev, showDock: !prev.showDock }))}
                    isEditing={isEditing}
                    showSearchBar={sysSettings.showSearchBar}
                    showPagination={sysSettings.showPagination}
                    showDock={sysSettings.showDock}
                />
            )}

            {/* Top Zone - Search Bar (Conditional) */}
            {sysSettings.showSearchBar && (
                <div
                    className={`absolute w-full flex flex-col items-center z-10 transition-all duration-700 cubic-bezier(0.2, 0.8, 0.2, 1) ${viewState === 'hero'
                        ? 'top-[30vh] scale-125'
                        : 'top-0 pt-[8vh] scale-100'
                        }`}
                    style={{ opacity: isAnyWindowMaximized ? 0 : 1, pointerEvents: isAnyWindowMaximized ? 'none' : 'auto' }}
                >
                    <div className="text-center mb-8 drop-shadow-md select-none">
                        <h1 className="text-7xl md:text-8xl font-thin tracking-tighter text-white/95">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h1>
                        <p className="text-lg md:text-xl text-white/80 mt-1 font-light tracking-widest uppercase">{time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="relative w-[90%] max-w-xl z-50">
                        <div className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center p-1.5 shadow-2xl transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] focus-within:bg-white/20 focus-within:scale-105 focus-within:shadow-[0_0_50px_rgba(255,255,255,0.25)]" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setEngine(prev => {
                                const keys = Object.keys(SEARCH_ENGINES) as SearchEngineKey[];
                                const nextIdx = (keys.indexOf(prev) + 1) % keys.length;
                                return keys[nextIdx];
                            })} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors text-white font-bold">{SEARCH_ENGINES[engine].icon}</button>
                            <input
                                className="flex-1 bg-transparent border-none outline-none text-white px-3 text-lg placeholder-white/40 font-light h-10"
                                placeholder={`Search ${SEARCH_ENGINES[engine].name}...`}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                                            handleSearch(suggestions[selectedIndex]);
                                        } else {
                                            handleSearch(search);
                                        }
                                    } else if (e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        setSelectedIndex(prev => (prev + 1) % suggestions.length);
                                    } else if (e.key === 'ArrowUp') {
                                        e.preventDefault();
                                        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
                                    } else if (e.key === 'Escape') {
                                        setShowSuggestions(false);
                                    }
                                }}
                            />
                            {search && <button onClick={() => setSearch('')} className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white rounded-lg hover:bg-white/10" aria-label="Clear search" title="Clear search"><X size={16} /></button>}
                        </div>

                        {/* Search Suggestions Dropdown */}
                        <div
                            className={`absolute top-full left-0 w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 origin-top ${showSuggestions && suggestions.length > 0 ? 'mt-4 opacity-100 max-h-[500px] translate-y-0' : 'max-h-0 opacity-0 mt-0 -translate-y-4 border-none'}`}
                            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                        >
                            {suggestions.map((s, i) => (
                                <div
                                    key={i}
                                    className={`px-4 py-3 text-white/90 cursor-pointer flex items-center gap-3 transition-colors ${i === selectedIndex ? 'bg-white/20' : 'hover:bg-white/10'}`}
                                    onClick={() => {
                                        setSearch(s);
                                        handleSearch(s);
                                    }}
                                >
                                    <Search size={16} className="text-white/40" />
                                    <span className="text-base font-light">{s}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Middle Zone - Grid */}
            <div
                className={`absolute top-[380px] w-full max-w-[95%] xl:max-w-[1400px] left-1/2 -translate-x-1/2 z-10 transition-all duration-700 cubic-bezier(0.2, 0.8, 0.2, 1) ${sysSettings.showDock ? 'bottom-[180px]' : 'bottom-[40px]'
                    } ${viewState === 'hero'
                        ? 'opacity-0 scale-150 pointer-events-none translate-y-[100px]'
                        : 'opacity-100 scale-100 translate-y-0'
                    }`}
                // onWheel handled by parent
                ref={gridRef}
            >
                {!isMobile && page > 0 && <div onClick={(e) => { e.stopPropagation(); changePage(-1) }} className="absolute left-0 top-1/2 -translate-y-1/2 p-4 text-white/30 hover:text-white hover:bg-white/5 rounded-full cursor-pointer z-20 transition-all"><ChevronLeft size={40} strokeWidth={1} /></div>}
                {!isMobile && page < totalPages - 1 && <div onClick={(e) => { e.stopPropagation(); changePage(1) }} className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-white/30 hover:text-white hover:bg-white/5 rounded-full cursor-pointer z-20 transition-all"><ChevronRight size={40} strokeWidth={1} /></div>}

                <div
                    className={`relative w-full h-full ${dir === 1 ? 'anim-next' : dir === -1 ? 'anim-prev' : ''}`}
                    key={page}
                    style={{ width: gridWidth + 'px', margin: '0 auto' }}
                >
                    {currentItems.map((item) => {
                        // Calculate position based on packed coordinates
                        const left = `${item.x * cellWidth}px`;
                        const top = `${item.y * cellHeight}px`;
                        // Calculate dimension based on size (w * cellWidth, h * cellHeight)
                        const width = `${(item?.size?.w || 1) * cellWidth}px`;
                        const height = `${(item?.size?.h || 1) * cellHeight}px`;

                        // Find index in original shortcuts for drag identification
                        const originalIndex = shortcuts.findIndex(s => s.id === item.id);
                        const isDraggingMe = dragState.isDragging && dragState.source === 'grid' && dragState.item?.id === item.id;

                        if (isDraggingMe) return null;

                        const isAdd = 'isAdd' in item;

                        return (
                            <div
                                key={item.id}
                                style={{ position: 'absolute', left, top, width, height, transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
                                className="flex justify-center items-center p-2"
                            >
                                {isAdd ? (
                                    <button onClick={(e) => { e.stopPropagation(); openWin('add') }} className="flex flex-col items-center gap-3 group w-[88px] cursor-pointer">
                                        <div className="w-[68px] h-[68px] rounded-[18px] bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-white/40 group-hover:bg-white/10 group-hover:text-white group-hover:border-white/40 transition-all duration-300"><Plus size={28} strokeWidth={1.5} /></div>
                                        <span className="text-xs text-white/50 font-medium group-hover:text-white transition-colors">Add</span>
                                    </button>
                                ) : (
                                    (() => {
                                        const s = item as PackedShortcut;
                                        const isWidget = s.type === 'widget';

                                        // Dynamic size classes
                                        const containerClass = isWidget ? 'w-full h-full' : 'w-[88px] h-full';
                                        const iconContainerClass = isWidget
                                            ? 'w-full h-full rounded-[24px]' // Larger rounding for widgets
                                            : 'w-[68px] h-[68px] rounded-[18px]';

                                        return (
                                            <div
                                                className={`flex flex-col items-center gap-2 group relative cursor-pointer ${containerClass} ${isEditing ? 'jiggle-mode' : ''}`}
                                                onPointerDown={(e) => handlePointerDown(e, originalIndex, 'grid', s)}
                                                onDragStart={(e) => e.preventDefault()}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!isEditing) {
                                                        if (s.isApp) openWin(s.id.toString(), s);
                                                        else if (s.type === 'widget') { /* Widgets might just be visual */ }
                                                        else window.location.href = s.url!;
                                                    }
                                                }}
                                            >
                                                {isEditing && (
                                                    <div
                                                        onPointerDown={(e) => { e.stopPropagation(); }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShortcuts(prev => prev.filter(sc => sc.id !== s.id));
                                                        }}
                                                        className="absolute -top-2 -left-2 z-20 w-7 h-7 bg-gray-200 text-gray-800 rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-red-500 hover:text-white transition-colors"
                                                    >
                                                        <Minus size={16} strokeWidth={3} />
                                                    </div>
                                                )}

                                                <div className={`${iconContainerClass} flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${s.color} shadow-black/20 ${!isEditing && !isWidget && 'group-hover:scale-105 group-hover:translate-y-[-4px] group-hover:shadow-2xl'} transition-all duration-300 ease-out ring-1 ring-white/10 relative overflow-hidden`}>
                                                    {!isWidget && <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none"></div>}
                                                    <AppIcon {...s} onContextMenu={handleAppContextMenu} />
                                                </div>

                                                {!isWidget && <span className="text-[13px] text-white/80 font-medium tracking-wide truncate w-full text-center px-1 drop-shadow-md group-hover:text-white transition-colors">{s.title}</span>}
                                            </div>
                                        );
                                    })()
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Global Drag Layer */}
            {dragState.isDragging && dragState.item && (
                <div
                    style={{
                        position: 'fixed',
                        left: dragState.mx,
                        top: dragState.my,
                        transform: 'translate(-50%, -50%) scale(1.1)',
                        zIndex: 10000,
                        pointerEvents: 'none',
                        transition: 'transform 0.15s ease-out'
                    }}
                >
                    {/* iOS-style dragging icon - maintains aspect ratio */}
                    <div className="flex flex-col items-center gap-2">
                        <div
                            className={`relative overflow-hidden flex items-center justify-center text-white shadow-2xl bg-gradient-to-br ${dragState.item.color || 'from-gray-700 to-gray-600'} ring-2 ring-white/40 ${dragState.item.type === 'widget' ? 'rounded-[24px]' : 'rounded-[18px]'}`}
                            style={{
                                width: dragState.item.type === 'widget'
                                    ? `${(dragState.item.size?.w || 1) * 88}px`
                                    : '75px',
                                height: dragState.item.type === 'widget'
                                    ? `${(dragState.item.size?.h || 1) * 88}px`
                                    : '75px'
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none"></div>
                            <div className="w-full h-full flex items-center justify-center">
                                <AppIcon {...dragState.item} />
                            </div>
                        </div>
                        {dragState.item.type !== 'widget' && dragState.item.title && (
                            <span className="text-[13px] text-white font-medium drop-shadow-lg px-2 py-1 bg-black/30 backdrop-blur-sm rounded-lg">
                                {dragState.item.title}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Pagination Indicators (Conditional) */}
            {sysSettings.showPagination && (
                <div className={`absolute w-full flex justify-center gap-2.5 z-20 pointer-events-none transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1) ${sysSettings.showDock ? 'bottom-[190px]' : 'bottom-[50px]'
                    } ${viewState === 'hero' ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'
                    }`}>
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 drop-shadow-md ${i === page ? 'w-1.5 bg-white' : 'w-1.5 bg-white/30'}`} />
                    ))}
                </div>
            )}

            {/* iPadOS Style Dock */}
            <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-[9999] transition-transform duration-700 cubic-bezier(0.32, 0.72, 0, 1) ${!sysSettings.showDock || isAnyWindowMaximized || viewState === 'hero'
                ? 'translate-y-[250%]'
                : 'translate-y-0'
                }`}>
                <div
                    className="dock-glass h-[120px] rounded-[35px] transition-all duration-300 ease-out relative"
                    ref={dockRef}
                    style={{ width: dockWidth + 'px' }}
                >
                    {/* Render Apps */}
                    {dockItems.map((item, index) => {
                        const isDraggingMe = dragState.isDragging && dragState.source === 'dock' && dragState.index === index;
                        const opacity = isDraggingMe ? 0 : 1;
                        const leftPos = DOCK_CONTAINER_PADDING + (index * SLOT_WIDTH);

                        return (
                            <div
                                key={item.id}
                                className="absolute"
                                style={{
                                    left: leftPos + 'px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    opacity,
                                    width: DOCK_ICON_SIZE + 'px',
                                    height: DOCK_ICON_SIZE + 'px',
                                    transition: 'left 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
                                }}
                            >
                                <div className={`w-full h-full relative group/dockitem ${isEditing ? 'jiggle-mode' : ''}`}>
                                    {isEditing && (
                                        <div
                                            onPointerDown={(e) => { e.stopPropagation(); }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDockItems(prev => prev.filter(d => d.id !== item.id));
                                            }}
                                            className="absolute -top-3 -left-3 z-20 w-7 h-7 bg-gray-200 text-gray-900 border border-gray-300 rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-red-500 hover:text-white transition-colors"
                                        >
                                            <Minus size={16} strokeWidth={3} />
                                        </div>
                                    )}
                                    <div
                                        className={`w-full h-full rounded-[16px] flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${item.color || 'from-gray-700 to-gray-600'} border border-white/10 ring-1 ring-white/5 relative overflow-hidden cursor-pointer ${!isEditing && 'hover:-translate-y-4 hover:scale-110 active:scale-95 transition-all duration-200 ease-out'}`}
                                        onPointerDown={(e) => handlePointerDown(e, index, 'dock', item)}
                                        onDragStart={(e) => e.preventDefault()}
                                        onClick={() => {
                                            if (!isEditing) {
                                                if (item.isApp) {
                                                    openWin(item.id.toString(), item);
                                                } else {
                                                    window.location.href = item.url || '#';
                                                }
                                            }
                                        }}
                                        data-app-icon
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent opacity-50 pointer-events-none"></div>
                                        <div className="w-full h-full flex items-center justify-center">
                                            <AppIcon {...item} onContextMenu={handleAppContextMenu} />
                                        </div>
                                    </div>
                                    <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/80 transition-all duration-300 ${windows.find(w => w.id === item.id)?.isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Locked Edit Button (Conditional) */}
                    {sysSettings.showDockEdit && (
                        <div
                            className="absolute"
                            style={{
                                left: (DOCK_CONTAINER_PADDING + (dockItems.length * SLOT_WIDTH)) + 'px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: DOCK_ICON_SIZE + 'px',
                                height: DOCK_ICON_SIZE + 'px',
                                transition: 'left 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
                            }}
                        >
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`w-full h-full rounded-[16px] flex items-center justify-center text-white shadow-lg border border-white/10 transition-all duration-300 ${isEditing ? 'bg-blue-600 border-blue-400' : 'bg-white/10 hover:bg-white/20'}`}
                            >
                                {isEditing ? <Check size={32} /> : <Edit3 size={28} />}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Windows - Conditional Rendering fixes the mount position glitch */}
            {windows.map(w => (
                w.isOpen && (
                    <ResponsiveWindow
                        key={w.id}
                        {...w}
                        title={getWindowTitle(w)}
                        zIndex={w.z}
                        onClose={() => closeWin(w.id)}
                        onFocus={() => focusWin(w.id)}
                        defaultWidth={w.w}
                        defaultHeight={w.h}
                        onToggleMaximize={() => toggleMaximize(w.id)}
                        isMaximized={w.isMaximized}
                    >
                        {w.type === 'calc' && <CalculatorApp />}
                        {w.type === 'notes' && <NotesApp />}
                        {w.type === 'ai' && <AIApp />}
                        {w.type === 'settings' && (
                            <SettingsApp
                                setWp={setWallpaper}
                                settings={sysSettings}
                                onUpdate={setSysSettings}
                                onExport={handleExportConfig}
                                onImport={handleImportConfig}
                                onReset={handleReset}
                            />
                        )}
                        {w.type === 'add' && <AddShortcutApp onAdd={(d) => {
                            const newId = Date.now();
                            // Default to valid size if not provided
                            const size = d.size || { w: 1, h: 1 };
                            setShortcuts(prev => [...prev, { ...d, id: newId, type: d.type || 'auto', color: d.color || 'from-gray-800 to-gray-700', size } as Shortcut])
                        }} onClose={() => closeWin('add')} />}
                        {w.type === 'edit' && w.editData && <EditApp app={w.editData} onSave={handleSaveApp} language={lang} />}
                        {w.type === 'web' && <WebView url={w.url || ''} title={w.title} />}
                    </ResponsiveWindow>
                )
            ))}

            {/* App Context Menu */}
            {appContextMenu && (
                <AppContextMenu
                    x={appContextMenu.x}
                    y={appContextMenu.y}
                    onClose={() => setAppContextMenu(null)}
                    onEdit={() => {
                        handleEditApp(appContextMenu.app);
                        setAppContextMenu(null);
                    }}
                    onDelete={() => {
                        handleDeleteApp(appContextMenu.app);
                        setAppContextMenu(null);
                    }}
                />
            )}
        </div>
    );
}