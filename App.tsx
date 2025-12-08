import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Minus, Check, Edit3, Plus, Search } from 'lucide-react';
import { DEFAULT_WALLPAPER, SEARCH_ENGINES, DEFAULT_SHORTCUTS, DEFAULT_DOCK, SYSTEM_APPS } from './constants.tsx';
import { Shortcut, DockItem, WindowState, DragState, SearchEngineKey, PackedShortcut, SystemSettings, GlobalConfig } from './types';
import { useGridCalculation } from './hooks/useGridCalculation';
import { AppIcon } from './components/AppIcon';
import { ContextMenu } from './components/ContextMenu';
import { AppContextMenu } from './components/AppContextMenu';
import { ResponsiveWindow } from './components/Window';
import { packItems, generateYamlConfig, parseYamlConfig } from './utils';
import { t } from './i18n';
import { DialogProvider, useDialog } from './components/Dialog';

// Lazy load heavy components
const CalculatorApp = React.lazy(() => import('./components/apps/Calculator').then(module => ({ default: module.CalculatorApp })));
const NotesApp = React.lazy(() => import('./components/apps/Notes').then(module => ({ default: module.NotesApp })));
const AIApp = React.lazy(() => import('./components/apps/AI').then(module => ({ default: module.AIApp })));
const SettingsApp = React.lazy(() => import('./components/apps/Settings').then(module => ({ default: module.SettingsApp })));
const AddShortcutApp = React.lazy(() => import('./components/apps/AddShortcut').then(module => ({ default: module.AddShortcutApp })));
const EditApp = React.lazy(() => import('./components/apps/EditApp').then(module => ({ default: module.EditApp })));
const WebView = React.lazy(() => import('./components/apps/WebView').then(module => ({ default: module.WebView })));
const CodeEditor = React.lazy(() => import('./components/CodeEditor').then(module => ({ default: module.CodeEditor })));

// 统一应用布局管理：前100个位置预留给Dock栏，后面的是桌面应用
// Dock栏预留位置数量（前10个位置）
const DOCK_RESERVED_SLOTS = 10;

function DesktopApp() {
    const dialog = useDialog();
    // --- View State (Hero vs Desktop) ---
    const [viewState, setViewState] = useState<'hero' | 'desktop'>('hero');
    const [wallpaper, setWallpaper] = useState(() => localStorage.getItem('os-bg') || DEFAULT_WALLPAPER);

    // --- System Settings ---
    const defaultSettings = { showDockEdit: false, showSearchBar: true, showPagination: true, showDock: true, language: 'zh' as const };
    const [sysSettings, setSysSettings] = useState<SystemSettings>(() => {
        const saved = localStorage.getItem('os-settings');
        if (!saved) return defaultSettings;
        try {
            return JSON.parse(saved);
        } catch {
            return defaultSettings;
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
            case 'configEditor': return t(lang, 'editConfig');
            case 'web': return w.title;
            default: return w.title;
        }
    };

    useEffect(() => {
        localStorage.setItem('os-settings', JSON.stringify(sysSettings));
    }, [sysSettings]);

    // --- Data State ---
    
    const [appLayout, setAppLayout] = useState<(Shortcut | null)[]>(() => {
        const saved = localStorage.getItem('os-app-layout');
        if (saved) {
            try {
                const layout = JSON.parse(saved);
                if (Array.isArray(layout) && layout.length > 0) return layout;
            } catch {}
        }
        // 首次初始化：使用concat比展开运算符更快
        const emptySlots = Array(DOCK_RESERVED_SLOTS - DEFAULT_DOCK.length).fill(null);
        return DEFAULT_DOCK.concat(emptySlots, DEFAULT_SHORTCUTS);
    });

    // 从布局中提取Dock项和桌面项
    const dockApps = useMemo(() => 
        appLayout.slice(0, DOCK_RESERVED_SLOTS).filter(item => item !== null && item !== undefined),
        [appLayout]
    );
    
    const desktopApps = useMemo(() => 
        appLayout.slice(DOCK_RESERVED_SLOTS).filter(item => item !== null && item !== undefined),
        [appLayout]
    );

    // --- Layout State ---
    const { cols, rows, itemsPerPage, isMobile, cellWidth, cellHeight, gridWidth } = useGridCalculation(sysSettings.showDock);
    const [page, setPage] = useState(0);
    const [dir, setDir] = useState(0);

    // PACKING ALGORITHM: Calculate layout for all items including widgets
    // We add the 'Add Button' as a virtual item at the end of the shortcut list for layout purposes
    const layoutItems = useMemo(() => {
        // 安全检查：确保desktopApps是有效数组
        if (!Array.isArray(desktopApps) || !cols || !rows) return [];
        try {
            const itemsToPack = [...desktopApps, { id: 'add-btn', isAdd: true, type: 'sys' as const, color: '', size: { w: 1, h: 1 } }];
            return packItems(itemsToPack, cols, rows);
        } catch (error) {
            console.error('Error packing items:', error);
            return [];
        }
    }, [desktopApps, cols, rows]);

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
    
    // Scroll accumulation for smoother page/view transitions
    const scrollAccumulator = useRef(0);
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
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
                    try {
                        // Google uses CORS-enabled API
                        const response = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${q}`);
                        const data = await response.json();
                        if (Array.isArray(data) && data[1]) {
                            results = data[1];
                        }
                    } catch (err) {
                        console.warn('Google suggestions unavailable:', err);
                    }
                } else if (engine === 'bing') {
                    try {
                        // Bing Autosuggest API (需要CORS支持)
                        const response = await fetch(`https://api.bing.com/qsonhs.aspx?q=${q}`);
                        const data = await response.json();
                        if (data && data.AS && data.AS.Results && data.AS.Results[0] && data.AS.Results[0].Suggests) {
                            results = data.AS.Results[0].Suggests.map((s: any) => s.Txt);
                        }
                    } catch (err) {
                        console.warn('Bing suggestions unavailable:', err);
                    }
                } else if (engine === 'baidu') {
                    try {
                        // 百度建议API (可能需要JSONP,暂时禁用)
                        console.warn('Baidu suggestions not supported in Manifest V3');
                        results = [];
                    } catch (err) {
                        console.warn('Baidu suggestions unavailable:', err);
                    }
                } else if (engine === 'duckduckgo') {
                    try {
                        // DuckDuckGo API
                        const response = await fetch(`https://duckduckgo.com/ac/?q=${q}&type=list`);
                        const data = await response.json();
                        if (Array.isArray(data) && data[1]) {
                            results = data[1];
                        }
                    } catch (err) {
                        console.warn('DuckDuckGo suggestions unavailable:', err);
                    }
                }

                setSuggestions(results.slice(0, 8));
                if (results.length > 0) {
                    setShowSuggestions(true);
                }
            } catch (e) {
                console.error('Suggestion fetch error:', e);
                setSuggestions([]);
            }
        }, 300);

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
        { id: 'configEditor', type: 'configEditor', title: 'Config Editor', isOpen: false, isMaximized: false, z: 100, w: 900, h: 650 },
    ]);
    const [maxZ, setMaxZ] = useState(100);
    const [configEditorContent, setConfigEditorContent] = useState('');

    const isAnyWindowMaximized = windows.some(w => w.isOpen && w.isMaximized);

    // --- Persistance ---
    useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
    useEffect(() => localStorage.setItem('os-bg', wallpaper), [wallpaper]);
    useEffect(() => localStorage.setItem('os-app-layout', JSON.stringify(appLayout)), [appLayout]);

    // --- Config Export/Import/Reset ---
    const handleExportConfig = useCallback(() => {
        try {
            // 从 appLayout 提取 dock 和 desktop 应用
            const dockApps = appLayout.slice(0, DOCK_RESERVED_SLOTS).filter(item => item !== null);
            const desktopApps = appLayout.slice(DOCK_RESERVED_SLOTS).filter(item => item !== null);
            
            // 获取 AI 配置
            let aiSettings = undefined;
            try {
                const aiProvidersStr = localStorage.getItem('ai-providers');
                const currentProviderId = localStorage.getItem('ai-current-provider');
                const currentModel = localStorage.getItem('ai-current-model');
                
                if (aiProvidersStr) {
                    const providers = JSON.parse(aiProvidersStr);
                    aiSettings = {
                        providers,
                        currentProviderId: currentProviderId || undefined,
                        currentModel: currentModel || undefined
                    };
                }
            } catch (e) {
                console.warn('Failed to export AI settings:', e);
            }

            // 获取便签内容
            const notes = localStorage.getItem('os-note') || undefined;
            
            // 验证数据
            if (dockApps.length === 0 && desktopApps.length === 0) {
                dialog.showAlert(
                    '无法导出配置',
                    '当前没有任何应用或小组件需要导出。\n\n请先添加一些应用后再尝试导出。'
                );
                return;
            }

            // 创建配置对象
            const config: GlobalConfig = {
                version: '1.0',
                createdAt: new Date().toISOString(),
                settings: sysSettings,
                wallpaper,
                shortcuts: desktopApps,
                dockItems: dockApps as DockItem[],
                aiSettings,
                notes
            };

            console.log('Exporting configuration:', {
                dockApps: dockApps.length,
                desktopApps: desktopApps.length,
                aiProviders: aiSettings?.providers?.length || 0,
                hasNotes: !!notes,
                settings: sysSettings
            });

            // 生成YAML
            const yamlStr = generateYamlConfig(config);
            
            // 检查YAML是否为空
            if (!yamlStr || yamlStr.trim() === '') {
                throw new Error('生成的配置文件为空');
            }

            // 创建并下载文件
            const blob = new Blob([yamlStr], { type: 'text/yaml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            a.href = url;
            a.download = `grasstab-config-${timestamp}.yaml`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // 显示成功提示
            const aiInfo = aiSettings ? `\n• AI 提供商: ${aiSettings.providers.length} 个` : '';
            const notesInfo = notes ? `\n• 便签: 已保存 (${notes.length} 字符)` : '';
            
            dialog.showAlert(
                '✓ 配置导出成功',
                `文件名: grasstab-config-${timestamp}.yaml\n\n` +
                `• Dock 应用: ${dockApps.length} 个\n` +
                `• 桌面应用: ${desktopApps.length} 个\n` +
                `• 系统设置: 已保存${aiInfo}${notesInfo}`
            );

            console.log('✓ Configuration exported successfully');
        } catch (e) {
            console.error('Export failed:', e);
            const errorMsg = e instanceof Error ? e.message : '未知错误';
            dialog.showAlert(
                '❌ 导出配置失败', 
                `错误信息: ${errorMsg}\n\n请检查浏览器控制台获取更多信息。`
            );
        }
    }, [sysSettings, wallpaper, appLayout, dialog]);

    const handleImportConfig = useCallback(async (file: File) => {
        try {
            // 验证文件类型
            const fileName = file.name.toLowerCase();
            const validExtensions = ['.yaml', '.yml', '.json'];
            const isValidFile = validExtensions.some(ext => fileName.endsWith(ext));
            
            if (!isValidFile) {
                dialog.showAlert(
                    '文件格式不支持',
                    `请选择有效的配置文件格式:\n• YAML (.yaml, .yml)\n• JSON (.json)\n\n当前文件: ${file.name}`
                );
                return;
            }

            // 验证文件大小（最大 10MB）
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                dialog.showAlert(
                    '文件过大',
                    `配置文件不应超过 10MB\n\n当前文件大小: ${(file.size / 1024 / 1024).toFixed(2)} MB`
                );
                return;
            }

            // 读取文件内容
            const text = await file.text();

            if (!text || text.trim() === '') {
                dialog.showAlert('配置文件为空', '请选择一个有效的配置文件。');
                return;
            }

            // 解析配置
            let config: GlobalConfig | null;
            try {
                config = parseYamlConfig(text);
            } catch (parseError) {
                const errorMsg = parseError instanceof Error ? parseError.message : '未知解析错误';
                dialog.showAlert(
                    '❌ 配置文件解析失败',
                    `文件: ${file.name}\n\n错误: ${errorMsg}\n\n请确保配置文件格式正确。`
                );
                return;
            }

            if (!config) {
                dialog.showAlert('配置文件无效', '无法解析配置文件，请检查文件格式。');
                return;
            }

            // 显示导入确认对话框
            const currentDockCount = appLayout.slice(0, DOCK_RESERVED_SLOTS).filter(item => item !== null).length;
            const currentDesktopCount = appLayout.slice(DOCK_RESERVED_SLOTS).filter(item => item !== null).length;
            const newDockCount = config.dockItems?.length || 0;
            const newDesktopCount = config.shortcuts?.length || 0;
            const aiInfo = config.aiSettings ? `\n• AI 提供商: ${config.aiSettings.providers.length} 个` : '';
            const notesInfo = config.notes !== undefined ? `\n• 便签: ${config.notes.length} 字符` : '';

            const confirmMsg = 
                `文件: ${file.name}\n` +
                `版本: ${config.version || '未知'}\n\n` +
                `即将导入:\n` +
                `• Dock 应用: ${currentDockCount} → ${newDockCount}\n` +
                `• 桌面应用: ${currentDesktopCount} → ${newDesktopCount}\n` +
                `• 系统设置: 将被覆盖${aiInfo}${notesInfo}\n\n` +
                `⚠️ 此操作无法撤销！`;

            if (await dialog.showConfirm('确认导入配置？', confirmMsg)) {
                // 先清除所有现有数据
                localStorage.removeItem('os-app-layout');
                localStorage.removeItem('os-dock');
                localStorage.removeItem('os-settings');
                localStorage.removeItem('os-bg');
                localStorage.removeItem('os-note');
                
                // 清除 AI 设置
                localStorage.removeItem('ai-providers');
                localStorage.removeItem('ai-current-provider');
                localStorage.removeItem('ai-current-model');

                // 清除所有 OS 和 AI 相关的键
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('os-') || key.startsWith('ai-')) {
                        localStorage.removeItem(key);
                    }
                });

                // 应用新配置
                setSysSettings(config.settings);
                setWallpaper(config.wallpaper);
                
                // 正确构建 appLayout：Dock区域(前DOCK_RESERVED_SLOTS个位置) + 桌面区域
                const dockApps = config.dockItems || [];
                const desktopApps = config.shortcuts || [];
                
                // Dock 区域：填充应用 + null（确保占满DOCK_RESERVED_SLOTS个位置）
                const dockLayout = Array(DOCK_RESERVED_SLOTS).fill(null);
                dockApps.forEach((app, index) => {
                    if (index < DOCK_RESERVED_SLOTS) {
                        dockLayout[index] = app;
                    }
                });
                
                // 完整布局 = Dock区域 + 桌面应用
                setAppLayout([...dockLayout, ...desktopApps]);

                // 应用 AI 配置
                if (config.aiSettings) {
                    localStorage.setItem('ai-providers', JSON.stringify(config.aiSettings.providers));
                    if (config.aiSettings.currentProviderId) {
                        localStorage.setItem('ai-current-provider', config.aiSettings.currentProviderId);
                    }
                    if (config.aiSettings.currentModel) {
                        localStorage.setItem('ai-current-model', config.aiSettings.currentModel);
                    }
                }

                // 应用便签内容
                if (config.notes !== undefined) {
                    localStorage.setItem('os-note', config.notes);
                }

                // 重置到第一页
                setPage(0);

                // 显示成功提示
                setTimeout(() => {
                    const statusText = 
                        `• Dock 应用: ${newDockCount} 个已加载\n` +
                        `• 桌面应用: ${newDesktopCount} 个已加载\n` +
                        `• 系统设置: 已应用${aiInfo}${notesInfo}`;

                    dialog.showAlert(
                        '✓ 配置导入成功',
                        `文件: ${file.name}\n\n${statusText}\n\n配置已生效！`
                    );
                }, 100);

                console.log('✓ Configuration imported successfully', {
                    dockApps: newDockCount,
                    desktopApps: newDesktopCount,
                    aiProviders: config.aiSettings?.providers?.length || 0,
                    hasNotes: !!config.notes
                });
            }
        } catch (e) {
            console.error('Import error:', e);
            const errorMsg = e instanceof Error ? e.message : '未知错误';
            dialog.showAlert(
                '❌ 导入配置失败', 
                `错误信息: ${errorMsg}\n\n请检查文件格式是否正确，或查看浏览器控制台获取详细信息。`
            );
        }
    }, [appLayout, dialog, setPage]);

    const handleReset = useCallback(async () => {
        const dockCount = appLayout.slice(0, DOCK_RESERVED_SLOTS).filter(i => i !== null).length;
        const desktopCount = appLayout.slice(DOCK_RESERVED_SLOTS).filter(i => i !== null).length;
        const confirmMsg = `This will permanently delete:\n• ${desktopCount} Desktop apps\n• ${dockCount} Dock apps\n• All system settings\n• Custom wallpaper\n• Saved notes\n• AI API settings\n\nThe system will reload with default settings.\n\nThis action CANNOT be undone!`;

        if (await dialog.showConfirm('⚠️ RESET ALL DATA', confirmMsg)) {
            // Double confirmation for safety
            if (await dialog.showConfirm('Are you absolutely sure?', 'This is your last chance to cancel.')) {
                try {
                    // Clear all localStorage keys related to the system
                    localStorage.removeItem('os-app-layout');
                    localStorage.removeItem('os-dock');
                    localStorage.removeItem('os-settings');
                    localStorage.removeItem('os-bg');
                    localStorage.removeItem('os-note');
                    
                    // Clear AI settings
                    localStorage.removeItem('ai-providers');
                    localStorage.removeItem('ai-current-provider');
                    localStorage.removeItem('ai-current-model');

                    // Clear all OS-related and AI-related keys
                    Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('os-') || key.startsWith('ai-')) {
                            localStorage.removeItem(key);
                        }
                    });

                    // Show brief success message before reload
                    dialog.showAlert('System data cleared. Reloading with defaults...');

                    // Force reload to reset all state
                    window.location.reload();
                } catch (e) {
                    console.error('Reset error:', e);
                    dialog.showAlert('Failed to reset system data. Please try clearing your browser cache manually.');
                }
            }
        }
    }, [appLayout.length]);

    // --- Config Editor ---
    const handleEditConfig = useCallback(() => {
        try {
            // 从 appLayout 提取 dock 和 desktop 应用
            const dockApps = appLayout.slice(0, DOCK_RESERVED_SLOTS).filter(item => item !== null);
            const desktopApps = appLayout.slice(DOCK_RESERVED_SLOTS).filter(item => item !== null);
            
            // 创建当前配置对象
            const config: GlobalConfig = {
                version: '1.0',
                createdAt: new Date().toISOString(),
                settings: sysSettings,
                wallpaper,
                shortcuts: desktopApps,
                dockItems: dockApps as DockItem[]
            };

            // 生成YAML
            const yamlStr = generateYamlConfig(config);
            
            if (!yamlStr || yamlStr.trim() === '') {
                alert('无法生成配置文件，请检查数据');
                return;
            }

            // 设置编辑器内容并打开窗口
            setConfigEditorContent(yamlStr);
            openWin('configEditor');
        } catch (e) {
            console.error('Failed to open config editor:', e);
            alert(`打开配置编辑器失败:\n\n${e instanceof Error ? e.message : 'Unknown error'}`);
        }
    }, [sysSettings, wallpaper, appLayout]);

    const handleSaveConfig = useCallback((yamlContent: string) => {
        try {
            // 解析YAML配置
            const config = parseYamlConfig(yamlContent);

            // 验证配置有效性
            if (!config || typeof config !== 'object') {
                alert('配置格式无效');
                return;
            }

            // 应用配置
            if (config.settings) {
                setSysSettings(config.settings);
            }
            if (config.wallpaper) {
                setWallpaper(config.wallpaper);
            }
            // 合并dock和shortcuts到appLayout
            const dockApps = Array.isArray(config.dockItems) ? config.dockItems.filter((i: any) => i && i.id !== 'edit') : [];
            const desktopApps = Array.isArray(config.shortcuts) ? config.shortcuts.filter(i => !!i) : [];
            const emptySlots = Array(DOCK_RESERVED_SLOTS - dockApps.length).fill(null);
            setAppLayout([...dockApps, ...emptySlots, ...desktopApps]);

            // 关闭编辑器窗口
            closeWin('configEditor');

            // 显示成功提示
            setTimeout(() => {
                alert('✓ 配置已成功应用！');
            }, 100);
        } catch (e) {
            console.error('Save config error:', e);
            alert(`保存配置失败:\n\n${e instanceof Error ? e.message : 'Unknown error'}\n\n请检查YAML格式是否正确。`);
        }
    }, []);

    // --- Drag & Drop State ---
    const [dragState, setDragState] = useState<DragState>({ isDragging: false, source: null, index: -1, item: null, mx: 0, my: 0 });
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const dockRef = useRef<HTMLDivElement>(null);
    
    // --- Widget Resize State ---
    const [resizingWidget, setResizingWidget] = useState<{ id: number | string, startW: number, startH: number, startX: number, startY: number, newW?: number, newH?: number } | null>(null);

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

    // Calculate count based on visible items and whether the edit button is shown
    const dockCount = dockApps.length + (sysSettings.showDockEdit ? 1 : 0);
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
        setAppLayout(prev => prev.map(item => item?.id === updated.id ? updated : item));
        closeWin('edit');
    };

    const handleDeleteApp = async (app: Shortcut) => {
        const appName = app.title || app.displayName || '此应用';
        const confirmMessage = `确定要删除 "${appName}" 吗？`;
            
        if (await dialog.showConfirm(confirmMessage)) {
            // 找到应用的索引，将其设为 null（保持数组结构）
            setAppLayout(prev => {
                const index = prev.findIndex(item => item?.id === app.id);
                if (index === -1) return prev;
                
                const newLayout = [...prev];
                newLayout[index] = null;
                return newLayout;
            });
        }
    };
    
    // 恢复系统应用（直接添加到末尾）
    const handleRestoreSystemApp = (appId: string) => {
        // 找到系统应用
        const systemApp = SYSTEM_APPS.find(app => app.id === appId);
        if (systemApp) {
            // 添加到数组末尾
            setAppLayout(prev => [...prev, systemApp]);
        }
    };

    const handleEditAppFromSettings = (app: Shortcut) => {
        // 从设置中打开编辑窗口
        const idx = windows.findIndex(w => w.id === 'edit');
        if (idx >= 0) {
            // 如果编辑窗口已存在，更新它
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
            // 创建新的编辑窗口
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

    // 更新应用的 iconType（当图标成功加载时）
    const handleIconLoaded = useCallback((appId: string | number, iconSource: string) => {
        setAppLayout(prev => prev.map(item => {
            if (item && item.id === appId && item.iconType !== iconSource) {
                return { ...item, iconType: iconSource };
            }
            return item;
        }));
    }, []);

    const handleAppContextMenu = (e: React.MouseEvent, app: Shortcut) => {
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
                            insertIndex = desktopApps.length; // Insert at end
                        } else {
                            // Find index in desktop apps array
                            insertIndex = desktopApps.findIndex(s => s.id === targetItem.id);
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
                            insertIndex = desktopApps.findIndex(s => s.id === afterItem.id);
                        } else {
                            insertIndex = desktopApps.length;
                        }
                    }

                    if (insertIndex !== -1 && dragState.item) {
                        if (dragState.source === 'dock') {
                            // Dock -> Grid: 从Dock移到桌面
                            const newLayout = [...appLayout];
                            // 找到并移除Dock中的项
                            for (let i = 0; i < DOCK_RESERVED_SLOTS; i++) {
                                if (newLayout[i]?.id === dragState.item!.id) {
                                    newLayout[i] = null;
                                    break;
                                }
                            }
                            // 插入到桌面区域
                            const desktopInsertIndex = DOCK_RESERVED_SLOTS + insertIndex;
                            newLayout.splice(desktopInsertIndex, 0, dragState.item as Shortcut);
                            setAppLayout(newLayout);
                            setDragState(prev => ({ ...prev, source: 'grid', index: insertIndex }));
                        } else if (dragState.source === 'grid') {
                            // Grid -> Grid: 桌面内部移动
                            const desktopStart = DOCK_RESERVED_SLOTS;
                            const desktopItems = appLayout.slice(desktopStart).filter(i => i !== null);
                            const currentIndex = desktopItems.findIndex(s => s?.id === dragState.item!.id);

                            if (currentIndex !== -1 && currentIndex !== insertIndex) {
                                const newDesktopItems = [...desktopItems];
                                const [moved] = newDesktopItems.splice(currentIndex, 1);
                                const adjustedInsert = currentIndex < insertIndex ? insertIndex - 1 : insertIndex;
                                newDesktopItems.splice(adjustedInsert, 0, moved);
                                
                                const newLayout = [
                                    ...appLayout.slice(0, desktopStart),
                                    ...newDesktopItems
                                ];
                                setAppLayout(newLayout);
                                setDragState(prev => ({ ...prev, index: adjustedInsert }));
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
                if (hoverIndex > dockApps.length) hoverIndex = dockApps.length;

                if (dragState.source === 'grid') {
                    // Grid -> Dock: 从桌面移到Dock
                    // 检查Dock是否已满
                    const currentDockCount = appLayout.slice(0, DOCK_RESERVED_SLOTS).filter(i => i !== null).length;
                    if (currentDockCount >= DOCK_RESERVED_SLOTS) {
                        // Dock已满，不允许添加
                        return;
                    }
                    
                    const desktopStart = DOCK_RESERVED_SLOTS;
                    const desktopItems = appLayout.slice(desktopStart).filter(i => i !== null);
                    const currentIndex = desktopItems.findIndex(s => s?.id === dragState.item!.id);
                    
                    if (currentIndex !== -1) {
                        const moved = desktopItems[currentIndex];
                        if (moved) {
                            // 从桌面移除
                            const newDesktopItems = desktopItems.filter(i => i?.id !== moved.id);
                            
                            // 强制为1x1大小
                            const dockItem = { ...moved, size: { w: 1, h: 1 } };
                            
                            // 在Dock中插入
                            const dockItems = appLayout.slice(0, DOCK_RESERVED_SLOTS).filter(i => i !== null);
                            dockItems.splice(hoverIndex, 0, dockItem);
                            
                            // 重建布局
                            const newLayout = new Array(DOCK_RESERVED_SLOTS).fill(null);
                            dockItems.forEach((item, idx) => {
                                if (idx < DOCK_RESERVED_SLOTS) newLayout[idx] = item;
                            });
                            
                            setAppLayout([...newLayout, ...newDesktopItems]);
                            setDragState(prev => ({ ...prev, source: 'dock', index: hoverIndex }));
                        }
                    }
                } else if (dragState.source === 'dock' && hoverIndex !== dragState.index) {
                    // Dock -> Dock: Dock内部移动
                    const dockItems = appLayout.slice(0, DOCK_RESERVED_SLOTS).filter(i => i !== null);
                    
                    if (dragState.index >= 0 && dragState.index < dockItems.length) {
                        const [moved] = dockItems.splice(dragState.index, 1);
                        if (moved) {
                            dockItems.splice(hoverIndex, 0, moved);
                            
                            // 重建Dock布局
                            const newLayout = new Array(DOCK_RESERVED_SLOTS).fill(null);
                            dockItems.forEach((item, idx) => {
                                if (idx < DOCK_RESERVED_SLOTS) newLayout[idx] = item;
                            });
                            
                            const desktopItems = appLayout.slice(DOCK_RESERVED_SLOTS);
                            setAppLayout([...newLayout, ...desktopItems]);
                            setDragState(prev => ({ ...prev, index: hoverIndex }));
                        }
                    }
                }
            }
        }
    }, [dragState, appLayout, cols, rows, cellWidth, cellHeight, page, layoutItems, SLOT_WIDTH, DOCK_RESERVED_SLOTS]);

    const handlePointerUp = useCallback(() => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        if (flipInterval.current) {
            clearInterval(flipInterval.current);
            flipInterval.current = null;
        }
        setDragState(prev => ({ ...prev, isDragging: false }));
        
        // Just clear resizing state, size already updated during drag
        setResizingWidget(null);
    }, [resizingWidget]);
    
    // Widget resize handlers
    const handleResizeStart = useCallback((e: React.PointerEvent, widget: Shortcut) => {
        e.stopPropagation();
        e.preventDefault();
        setResizingWidget({
            id: widget.id,
            startW: widget.size?.w || 2,
            startH: widget.size?.h || 2,
            startX: e.clientX,
            startY: e.clientY
        });
    }, [cellWidth, cellHeight]);
    
    const handleResizeMove = useCallback((e: PointerEvent) => {
        if (!resizingWidget || cellWidth <= 0 || cellHeight <= 0) return;
        
        const deltaX = e.clientX - resizingWidget.startX;
        const deltaY = e.clientY - resizingWidget.startY;
        
        // Calculate new size based on cell dimensions
        const newW = Math.max(1, Math.min(6, resizingWidget.startW + Math.round(deltaX / cellWidth)));
        const newH = Math.max(1, Math.min(6, resizingWidget.startH + Math.round(deltaY / cellHeight)));
        
        // Update both resizing state and appLayout immediately for live preview
        if (newW !== resizingWidget.newW || newH !== resizingWidget.newH) {
            setResizingWidget(prev => prev ? { ...prev, newW, newH } : null);
            // Also update appLayout immediately to trigger layout recalculation
            setAppLayout(prev => prev.map(item => 
                item?.id === resizingWidget.id 
                    ? { ...item, size: { w: newW, h: newH } }
                    : item
            ));
        }
    }, [resizingWidget, cellWidth, cellHeight]);
    
    useEffect(() => {
        if (resizingWidget) {
            window.addEventListener('pointermove', handleResizeMove);
            window.addEventListener('pointerup', handlePointerUp);
        }
        return () => {
            window.removeEventListener('pointermove', handleResizeMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [resizingWidget, handleResizeMove, handlePointerUp]);

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
                // Accumulate scroll delta
                scrollAccumulator.current += e.deltaY;
                
                // Clear previous timeout
                if (scrollTimeout.current) {
                    clearTimeout(scrollTimeout.current);
                }
                
                // Reset accumulator after 150ms of no scrolling
                scrollTimeout.current = setTimeout(() => {
                    scrollAccumulator.current = 0;
                }, 150);
                
                // Different thresholds for different actions
                const heroToDesktopThreshold = 150;  // 大时间 -> 桌面：需要明确滚动
                const desktopToHeroThreshold = 300;  // 桌面 -> 大时间：需要更大的滚动量，且必须在第0页
                const pageChangeThreshold = 150;     // 页面切换：正常滚动量
                
                if (viewState === 'hero') {
                    // 在大时间模式，只能向下滚动进入桌面
                    if (scrollAccumulator.current > heroToDesktopThreshold) {
                        setViewState('desktop');
                        scrollAccumulator.current = 0;
                    }
                } else {
                    // Desktop mode
                    // 只有在第0页时，向上滚动才能回到大时间模式，且需要更大的滚动量
                    if (page === 0 && scrollAccumulator.current < -desktopToHeroThreshold) {
                        setViewState('hero');
                        scrollAccumulator.current = 0;
                    } 
                    // 向下滚动：翻到下一页
                    else if (scrollAccumulator.current > pageChangeThreshold) {
                        if (page < totalPages - 1) {
                            changePage(1);
                            scrollAccumulator.current = 0;
                        }
                    } 
                    // 向上滚动：翻到上一页（不在第0页时）
                    else if (scrollAccumulator.current < -pageChangeThreshold && page > 0) {
                        changePage(-1);
                        scrollAccumulator.current = 0;
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
                    onReset={async () => { if (await dialog.showConfirm('Reset Layout?')) { localStorage.removeItem('os-app-layout'); window.location.reload(); } }}
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
                    className={`absolute w-full flex flex-col items-center transition-all duration-700 cubic-bezier(0.2, 0.8, 0.2, 1) ${viewState === 'hero'
                        ? 'top-[30vh] scale-125'
                        : 'top-0 pt-[8vh] scale-100'
                        }`}
                    style={{ opacity: isAnyWindowMaximized ? 0 : 1, pointerEvents: isAnyWindowMaximized ? 'none' : 'auto', zIndex: 50 }}
                >
                    <div className="text-center mb-6 sm:mb-8 drop-shadow-md select-none">
                        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-thin tracking-tighter text-white/95">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h1>
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/80 mt-1 font-light tracking-widest uppercase">{time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="relative w-[95%] sm:w-[90%] max-w-xl">
                        <div className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center p-1.5 shadow-2xl transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] focus-within:bg-white/20 focus-within:scale-105 focus-within:shadow-[0_0_50px_rgba(255,255,255,0.25)]" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setEngine(prev => {
                                const keys = Object.keys(SEARCH_ENGINES) as SearchEngineKey[];
                                const nextIdx = (keys.indexOf(prev) + 1) % keys.length;
                                return keys[nextIdx];
                            })} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors text-white font-bold text-sm sm:text-base"><span className="w-[75%] h-[75%] flex items-center justify-center">{SEARCH_ENGINES[engine].icon}</span></button>
                            <input
                                className="flex-1 bg-transparent border-none outline-none text-white px-2 sm:px-3 text-base sm:text-lg placeholder-white/40 font-light h-8 sm:h-10"
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
                            {search && <button onClick={() => setSearch('')} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-white/50 hover:text-white rounded-lg hover:bg-white/10 active:bg-white/20" aria-label="Clear search" title="Clear search"><X size={14} className="sm:w-4 sm:h-4" /></button>}
                        </div>

                        {/* Search Suggestions Dropdown */}
                        <div
                            className={`absolute top-full left-0 w-full bg-white/20 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 origin-top ${showSuggestions && suggestions.length > 0 ? 'mt-2 sm:mt-4 opacity-100 max-h-[400px] sm:max-h-[500px] translate-y-0' : 'max-h-0 opacity-0 mt-0 -translate-y-4 border-none'}`}
                            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', willChange: 'transform, opacity, max-height' }}
                        >
                            {suggestions.map((s, i) => (
                                <div
                                    key={i}
                                    className={`px-3 sm:px-4 py-3 sm:py-3.5 text-white/90 cursor-pointer flex items-center gap-2 sm:gap-3 transition-colors active:bg-white/25 ${i === selectedIndex ? 'bg-white/20' : 'hover:bg-white/10'}`}
                                    onClick={() => {
                                        setSearch(s);
                                        handleSearch(s);
                                    }}
                                >
                                    <Search size={14} className="sm:w-4 sm:h-4 text-white/40 flex-shrink-0" />
                                    <span className="text-sm sm:text-base font-light truncate">{s}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Middle Zone - Grid */}
            <div
                className={`absolute top-[250px] sm:top-[320px] md:top-[380px] w-full max-w-[95%] xl:max-w-[1400px] left-1/2 -translate-x-1/2 z-10 transition-all duration-700 cubic-bezier(0.2, 0.8, 0.2, 1) ${sysSettings.showDock ? 'bottom-[140px] sm:bottom-[160px] md:bottom-[180px]' : 'bottom-[40px]'
                    } ${viewState === 'hero'
                        ? 'opacity-0 scale-150 pointer-events-none translate-y-[100px]'
                        : 'opacity-100 scale-100 translate-y-0'
                    }`}
                // onWheel handled by parent
                ref={gridRef}
            >
                {!isMobile && page > 0 && <div onClick={(e) => { e.stopPropagation(); changePage(-1) }} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 sm:p-4 text-white/30 hover:text-white hover:bg-white/5 rounded-full cursor-pointer z-20 transition-all"><ChevronLeft size={32} className="sm:w-10 sm:h-10" strokeWidth={1} /></div>}
                {!isMobile && page < totalPages - 1 && <div onClick={(e) => { e.stopPropagation(); changePage(1) }} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 sm:p-4 text-white/30 hover:text-white hover:bg-white/5 rounded-full cursor-pointer z-20 transition-all"><ChevronRight size={32} className="sm:w-10 sm:h-10" strokeWidth={1} /></div>}

                <div
                    className={`relative w-full h-full ${dir === 1 ? 'anim-next' : dir === -1 ? 'anim-prev' : ''}`}
                    key={page}
                    style={{ width: gridWidth + 'px', margin: '0 auto' }}
                >
                    {currentItems.map((item) => {
                        // Check if this widget is being resized
                        const isBeingResized = resizingWidget?.id === item.id;
                        const displayW = isBeingResized && resizingWidget.newW ? resizingWidget.newW : (item?.size?.w || 1);
                        const displayH = isBeingResized && resizingWidget.newH ? resizingWidget.newH : (item?.size?.h || 1);
                        
                        // Calculate position based on packed coordinates
                        const left = `${item.x * cellWidth}px`;
                        const top = `${item.y * cellHeight}px`;
                        // Calculate dimension based on size (w * cellWidth, h * cellHeight)
                        const width = `${displayW * cellWidth}px`;
                        const height = `${displayH * cellHeight}px`;

                        // Find index in original desktopApps for drag identification
                        const originalIndex = desktopApps.findIndex(s => s.id === item.id);
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
                                    <button onClick={(e) => { e.stopPropagation(); openWin('add') }} className="flex flex-col items-center gap-2 group w-[88px] h-full cursor-pointer">
                                        <div className="w-[68px] h-[68px] rounded-[18px] bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-white/40 group-hover:bg-white/10 group-hover:text-white group-hover:border-white/40 transition-all duration-300"><Plus size={28} strokeWidth={1.5} /></div>
                                        <span className="text-[13px] text-white/80 font-medium tracking-wide truncate w-full text-center px-1 drop-shadow-md group-hover:text-white transition-colors">Add</span>
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
                                            // 直接从appLayout中删除
                                            setAppLayout(prev => prev.map(item => item?.id === s.id ? null : item));
                                        }}
                                        className="absolute -top-2 -left-2 z-20 w-7 h-7 bg-gray-200 text-gray-800 rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-red-500 hover:text-white transition-colors"
                                    >
                                        <Minus size={16} strokeWidth={3} />
                                    </div>
                                )}                                                {/* Resize handle for widgets in edit mode */}
                                                {isEditing && isWidget && (
                                                    <>
                                                        {/* Corner arc indicator */}
                                                        <svg className="absolute -bottom-0.5 -right-0.5 z-20 pointer-events-none" width="32" height="32" viewBox="0 0 32 32">
                                                            <path d="M 32 32 L 32 20 Q 32 12 24 12 L 12 12" stroke="white" strokeWidth="2" fill="none" opacity="0.3"/>
                                                        </svg>
                                                        
                                                        {/* Resize handle */}
                                                        <div
                                                            onPointerDown={(e) => handleResizeStart(e, s)}
                                                            className="absolute -bottom-1.5 -right-1.5 z-20 w-10 h-10 backdrop-blur-md bg-white/20 border border-white/40 rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.1)] cursor-se-resize hover:bg-white/30 hover:scale-105 transition-all active:scale-95"
                                                            title="拖动调整大小"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                                <circle cx="10" cy="10" r="1.5" fill="white" opacity="0.9"/>
                                                                <circle cx="5" cy="10" r="1.5" fill="white" opacity="0.7"/>
                                                                <circle cx="10" cy="5" r="1.5" fill="white" opacity="0.7"/>
                                                            </svg>
                                                        </div>
                                                        
                                                        {/* Size indicator when resizing */}
                                                        {isBeingResized && resizingWidget.newW && resizingWidget.newH && (
                                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm font-medium pointer-events-none">
                                                                {resizingWidget.newW} × {resizingWidget.newH}
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                <div className={`${iconContainerClass} flex items-center justify-center text-white shadow-lg ${s.customIcon ? 'bg-white/5' : `bg-gradient-to-br ${s.color}`} shadow-black/20 ${!isEditing && !isWidget && 'group-hover:scale-105 group-hover:translate-y-[-4px] group-hover:shadow-2xl'} transition-all duration-300 ease-out ring-1 ring-white/10 relative overflow-hidden`}>
                                                    {!isWidget && !s.customIcon && <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none"></div>}
                                                    <AppIcon 
                                                        {...s} 
                                                        onContextMenu={handleAppContextMenu}
                                                        onIconLoaded={(iconSource) => handleIconLoaded(s.id, iconSource)}
                                                    />
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
                            className={`relative overflow-hidden flex items-center justify-center text-white shadow-2xl ${dragState.item.customIcon ? 'bg-white/5' : `bg-gradient-to-br ${dragState.item.color || 'from-gray-700 to-gray-600'}`} ring-2 ring-white/40 ${dragState.item.type === 'widget' ? 'rounded-[24px]' : 'rounded-[18px]'}`}
                            style={{
                                width: dragState.item.type === 'widget'
                                    ? `${(dragState.item.size?.w || 1) * 88}px`
                                    : '75px',
                                height: dragState.item.type === 'widget'
                                    ? `${(dragState.item.size?.h || 1) * 88}px`
                                    : '75px'
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none" style={{ display: dragState.item.customIcon ? 'none' : 'block' }}></div>
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
                <div className={`absolute w-full flex justify-center gap-1.5 sm:gap-2.5 z-20 pointer-events-none transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1) ${sysSettings.showDock ? 'bottom-[100px] sm:bottom-[140px] md:bottom-[190px]' : 'bottom-[30px] sm:bottom-[50px]'
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
                    className="dock-glass h-[80px] sm:h-[100px] md:h-[120px] rounded-[24px] sm:rounded-[30px] md:rounded-[35px] transition-all duration-300 ease-out relative"
                    ref={dockRef}
                    style={{ width: dockWidth + 'px' }}
                >
                    {/* Render Apps */}
                    {dockApps.map((item, index) => {
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
                                                // 直接从appLayout中删除
                                                setAppLayout(prev => prev.map(i => i?.id === item.id ? null : i));
                                            }}
                                            className="absolute -top-3 -left-3 z-20 w-7 h-7 bg-gray-200 text-gray-900 border border-gray-300 rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-red-500 hover:text-white transition-colors"
                                        >
                                            <Minus size={16} strokeWidth={3} />
                                        </div>
                                    )}
                                    <div
                                        className={`w-full h-full rounded-[12px] sm:rounded-[14px] md:rounded-[16px] flex items-center justify-center text-white shadow-lg ${item.customIcon ? 'bg-white/5' : `bg-gradient-to-br ${item.color || 'from-gray-700 to-gray-600'}`} border border-white/10 ring-1 ring-white/5 relative overflow-hidden cursor-pointer ${!isEditing && 'hover:-translate-y-4 hover:scale-110 active:scale-95 transition-all duration-200 ease-out'}`}
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
                                        onContextMenu={(e) => {
                                            if (!isEditing) {
                                                e.preventDefault();
                                                setAppContextMenu({ x: e.clientX, y: e.clientY, app: item as Shortcut });
                                            }
                                        }}
                                        data-app-icon
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent opacity-50 pointer-events-none" style={{ display: item.customIcon ? 'none' : 'block' }}></div>
                                        <div className="w-full h-full flex items-center justify-center">
                                            <AppIcon 
                                                {...item} 
                                                onContextMenu={handleAppContextMenu}
                                                onIconLoaded={(iconSource) => handleIconLoaded(item.id, iconSource)}
                                            />
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
                                left: (DOCK_CONTAINER_PADDING + (dockApps.length * SLOT_WIDTH)) + 'px',
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
                        <React.Suspense fallback={<div className="flex items-center justify-center h-full w-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50"></div></div>}>
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
                                    onEditConfig={handleEditConfig}
                                    shortcuts={appLayout.filter((item): item is Shortcut => item !== null && item.type !== 'sys')}
                                    onShortcutUpdate={(newShortcuts) => {
                                        // 更新所有应用（保留系统应用）
                                        const systemApps = appLayout.filter(item => item?.type === 'sys');
                                        setAppLayout([...newShortcuts, ...systemApps]);
                                    }}
                                    onEditShortcut={handleEditAppFromSettings}
                                    onDeleteApp={handleDeleteApp}
                                    allApps={appLayout}
                                    onRestoreSystemApp={handleRestoreSystemApp}
                                />
                            )}
                            {w.type === 'add' && <AddShortcutApp onAdd={(d) => {
                                const newId = Date.now();
                                // Default to valid size if not provided
                                const size = d.size || { w: 1, h: 1 };
                                const newApp = { ...d, id: newId, type: d.type || 'auto', color: d.color || 'from-gray-800 to-gray-700', size } as Shortcut;
                                // 添加到appLayout末尾（桌面区域）
                                setAppLayout(prev => [...prev, newApp]);
                            }} onClose={() => closeWin('add')} />}
                            {w.type === 'edit' && w.editData && <EditApp app={w.editData} onSave={handleSaveApp} language={lang} />}
                            {w.type === 'configEditor' && (
                                <CodeEditor
                                    value={configEditorContent}
                                    language="yaml"
                                    onSave={handleSaveConfig}
                                    onClose={() => closeWin('configEditor')}
                                />
                            )}
                            {w.type === 'web' && <WebView url={w.url || ''} title={w.title} />}
                        </React.Suspense>
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

export default function App() {
    return (
        <DialogProvider>
            <DesktopApp />
        </DialogProvider>
    );
}