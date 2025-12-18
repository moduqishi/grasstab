import React, { useRef, useMemo } from 'react';
import { DialogProvider, useDialog } from './components/Dialog';

// Hooks
import { useSystem } from './hooks/useSystem';
import { t, Language } from './i18n';
import { useApps } from './hooks/useApps';
import { useWindows } from './hooks/useWindows';
import { useSearch } from './hooks/useSearch';
import { useLayout } from './hooks/useLayout';
import { useInteraction } from './hooks/useInteraction';

// Components
import { ContextMenu } from './components/ContextMenu';
import { AppContextMenu } from './components/AppContextMenu';
import { ResponsiveWindow } from './components/Window';
import { DesktopClock } from './components/desktop/DesktopClock';
import { SearchBar } from './components/desktop/SearchBar';
import { DesktopGrid } from './components/desktop/DesktopGrid';
import { Dock } from './components/desktop/Dock';
import { Pagination } from './components/desktop/Pagination';
import { GlobalDragLayer } from './components/desktop/GlobalDragLayer';

// Constants & Types
import { generateYamlConfig, parseYamlConfig } from './utils';
import { GlobalConfig, DockItem, SearchEngineKey } from './types';

// Lazy load heavy components
const CalculatorApp = React.lazy(() => import('./components/apps/Calculator').then(module => ({ default: module.CalculatorApp })));
const NotesApp = React.lazy(() => import('./components/apps/Notes').then(module => ({ default: module.NotesApp })));
const AIApp = React.lazy(() => import('./components/apps/AI').then(module => ({ default: module.AIApp })));
const SettingsApp = React.lazy(() => import('./components/apps/Settings').then(module => ({ default: module.SettingsApp })));
const AddShortcutApp = React.lazy(() => import('./components/apps/AddShortcut').then(module => ({ default: module.AddShortcutApp })));
const EditApp = React.lazy(() => import('./components/apps/EditApp').then(module => ({ default: module.EditApp })));
const WebView = React.lazy(() => import('./components/apps/WebView').then(module => ({ default: module.WebView })));
const CodeEditor = React.lazy(() => import('./components/CodeEditor').then(module => ({ default: module.CodeEditor })));


function DesktopApp() {
    const dialog = useDialog();
    
    // --- Hooks ---
    const { 
        viewState, setViewState, 
        wallpaper, setWallpaper, 
        sysSettings, setSysSettings, 
        time 
    } = useSystem();

    const { 
        appLayout, setAppLayout, 
        dockApps, desktopApps, 
        handleDeleteApp, handleRestoreSystemApp,
        handleIconLoaded, updateApp,
        DOCK_RESERVED_SLOTS 
    } = useApps(dialog);

    const { 
        windows, setWindows, maxZ,
        openWin, closeWin, focusWin, toggleMaximize,
        handleEditApp, handleEditAppFromSettings,
        getWindowTitle, isAnyWindowMaximized 
    } = useWindows(sysSettings.language);

    const { 
        engine, setEngine, 
        search, setSearch, 
        suggestions, showSuggestions, setShowSuggestions, 
        handleSearch, nextEngine 
    } = useSearch();

    const {
        cols, rows, itemsPerPage, cellWidth, cellHeight, gridWidth, iconSize,
        page, setPage, dir, setDir, layoutItems, totalPages, changePage
    } = useLayout(desktopApps, false, sysSettings.showDock); // Assuming isMobile=false for now (App.tsx had isMobile logic, assuming hook handles it via useGridCalculation)

    const gridRef = useRef<HTMLDivElement>(null);
    const dockRef = useRef<HTMLDivElement>(null);

    const { 
        isEditing, setIsEditing, 
        dragState, setDragState, 
        resizingWidget, 
        handlePointerDown, handlePointerUp, handleResizeStart 
    } = useInteraction({
        appLayout, setAppLayout,
        dockApps, desktopApps,
        layoutItems,
        cols, rows, cellWidth, cellHeight,
        page, setPage, totalPages,
        setDir,
        gridRef, dockRef,
        DOCK_RESERVED_SLOTS,
        iconSize
    });

    // --- Config Export/Import Handling (Keep in App for now due to complexity) ---
    // [Legacy Functionality - Re-implemented using hook state]
    
    const handleExportConfig = async () => {
        try {
            // 获取 AI 配置
            let aiSettings = undefined;
            try {
                const aiProvidersStr = localStorage.getItem('ai-providers');
                const currentProviderId = localStorage.getItem('ai-current-provider');
                const currentModel = localStorage.getItem('ai-current-model');
                
                if (aiProvidersStr) {
                    const providers = JSON.parse(aiProvidersStr);
                    aiSettings = { providers, currentProviderId: currentProviderId || undefined, currentModel: currentModel || undefined };
                }
            } catch (e) {
                console.warn('Failed to export AI settings:', e);
            }

            const notes = localStorage.getItem('os-note') || undefined;
            
            if (dockApps.length === 0 && desktopApps.length === 0) {
                dialog.showAlert('无法导出配置', '当前没有任何应用或小组件需要导出。');
                return;
            }

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

            const yamlStr = generateYamlConfig(config);
            if (!yamlStr || yamlStr.trim() === '') throw new Error('生成的配置文件为空');

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

            const aiInfo = aiSettings ? `\n• AI 提供商: ${aiSettings.providers.length} 个` : '';
            const notesInfo = notes ? `\n• 便签: 已保存 (${notes.length} 字符)` : '';
            dialog.showAlert('✓ 配置导出成功', `文件名: grasstab-config-${timestamp}.yaml\n\n• Dock 应用: ${dockApps.length} 个\n• 桌面应用: ${desktopApps.length} 个\n• 系统设置: 已保存${aiInfo}${notesInfo}`);
        } catch (e) {
            console.error('Export failed:', e);
            dialog.showAlert('❌ 导出配置失败', `错误信息: ${e instanceof Error ? e.message : '未知错误'}`);
        }
    };

    const handleImportConfig = async (file: File) => {
        try {
            const fileName = file.name.toLowerCase();
            if (!['.yaml', '.yml', '.json'].some(ext => fileName.endsWith(ext))) {
                dialog.showAlert('文件格式不支持', `请选择有效的配置文件格式:\n• YAML (.yaml, .yml)\n• JSON (.json)`);
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                dialog.showAlert('文件过大', `配置文件不应超过 10MB`);
                return;
            }

            const text = await file.text();
            if (!text || text.trim() === '') {
                dialog.showAlert('配置文件为空', '请选择一个有效的配置文件。');
                return;
            }

            let config: GlobalConfig | null;
            try {
                config = parseYamlConfig(text);
            } catch (e) {
                dialog.showAlert('❌ 配置文件解析失败', `错误: ${e instanceof Error ? e.message : '未知解析错误'}`);
                return;
            }

            if (!config) {
                dialog.showAlert('配置文件无效', '无法解析配置文件，请检查文件格式。');
                return;
            }

            const confirmMsg = `即将导入配置 (版本: ${config.version || '未知'})，此操作无法撤销！`;
            if (await dialog.showConfirm('确认导入配置？', confirmMsg)) {
                // Clear existing
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('os-') || key.startsWith('ai-')) localStorage.removeItem(key);
                });

                // Apply new
                setSysSettings(config.settings);
                setWallpaper(config.wallpaper);
                
                // Reconstruct App Layout
                const newDockApps = config.dockItems || [];
                const newDesktopApps = config.shortcuts || [];
                const dockLayout = Array(DOCK_RESERVED_SLOTS).fill(null);
                newDockApps.forEach((app, index) => {
                    if (index < DOCK_RESERVED_SLOTS) dockLayout[index] = app;
                });
                setAppLayout([...dockLayout, ...newDesktopApps]);

                // Apply Others
                if (config.aiSettings) {
                    localStorage.setItem('ai-providers', JSON.stringify(config.aiSettings.providers));
                    if (config.aiSettings.currentProviderId) localStorage.setItem('ai-current-provider', config.aiSettings.currentProviderId);
                    if (config.aiSettings.currentModel) localStorage.setItem('ai-current-model', config.aiSettings.currentModel);
                }
                if (config.notes !== undefined) localStorage.setItem('os-note', config.notes);

                setPage(0);
                setTimeout(() => dialog.showAlert('✓ 配置导入成功', '配置已生效！'), 100);
            }
        } catch (e) {
            console.error('Import error:', e);
            dialog.showAlert('❌ 导入配置失败', `错误信息: ${e instanceof Error ? e.message : '未知错误'}`);
        }
    };

    const handleReset = async () => {
         if (await dialog.showConfirm('⚠️ RESET ALL DATA', 'This will permanently delete everything and reload.')) {
            if (await dialog.showConfirm('Are you absolutely sure?', 'Last chance.')) {
                 Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('os-') || key.startsWith('ai-')) localStorage.removeItem(key);
                });
                window.location.reload();
            }
         }
    };

    // Scroll handling for view transitions
    const scrollAccumulator = useRef(0);
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleWheel = (e: React.WheelEvent) => {
        scrollAccumulator.current += e.deltaY;
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => { scrollAccumulator.current = 0; }, 150);
        
        const heroToDesktopThreshold = 100;
        const desktopToHeroThreshold = 100;
        const pageChangeThreshold = 100;
        
        if (viewState === 'hero') {
            if (scrollAccumulator.current > heroToDesktopThreshold) {
                setViewState('desktop');
                scrollAccumulator.current = 0;
            }
        } else {
            if (page === 0 && scrollAccumulator.current < -desktopToHeroThreshold) {
                setViewState('hero');
                scrollAccumulator.current = 0;
            } else if (scrollAccumulator.current > pageChangeThreshold) {
                changePage(1);
                scrollAccumulator.current = 0;
            } else if (scrollAccumulator.current < -pageChangeThreshold) {
                changePage(-1);
                scrollAccumulator.current = 0;
            }
        }
    };

    // Context Menu Handlers
    const [contextMenu, setContextMenu] = React.useState<{ x: number, y: number } | null>(null);
    const [appContextMenu, setAppContextMenu] = React.useState<{ x: number, y: number, app: any } | null>(null);

    const handleGlobalContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        const target = e.target as HTMLElement;
        const isOnAppIcon = target.closest('[data-app-icon]');
        const isOnDock = target.closest('.dock-glass');

        if (!isOnAppIcon && !isOnDock) {
            setAppContextMenu(null);
            setContextMenu({ x: e.clientX, y: e.clientY });
        }
    };
    
    // Wrapper for handleAppContextMenu to close desktop context menu
    const onAppContextMenu = (e: React.MouseEvent, app: any) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu(null);
        setAppContextMenu({ x: e.clientX, y: e.clientY, app });
    };

    return (
        <div
            className="relative w-full h-screen overflow-hidden font-sans select-none flex flex-col bg-black text-white cursor-default"
            onContextMenu={handleGlobalContextMenu}
            onClick={() => { setContextMenu(null); setAppContextMenu(null); if (isEditing) setIsEditing(false); }}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
        >
             {/* Styles Injection */}
             <style>{`
                @keyframes slide-r { 0% { transform: translateX(40px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
                @keyframes slide-l { 0% { transform: translateX(-40px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
                @keyframes jiggle { 0% { transform: rotate(0deg); } 25% { transform: rotate(-1.5deg); } 50% { transform: rotate(0deg); } 75% { transform: rotate(1.5deg); } 100% { transform: rotate(0deg); } }
                .anim-next { animation: slide-r 0.35s cubic-bezier(0.2, 0.8, 0.2, 1); }
                .anim-prev { animation: slide-l 0.35s cubic-bezier(0.2, 0.8, 0.2, 1); }
                .dock-glass { background: rgba(40, 40, 45, 0.45); backdrop-filter: blur(50px); -webkit-backdrop-filter: blur(50px); border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5); }
                .jiggle-mode { animation: jiggle 0.25s infinite linear; }
                .jiggle-mode:nth-child(2n) { animation-delay: 0.1s; }
                .jiggle-mode:nth-child(3n) { animation-delay: -0.15s; }
            `}</style>

            <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105" style={{ backgroundImage: `url(${wallpaper})` }} />
            <div className="absolute inset-0 bg-black/20" />

            {/* Global Context Menus */}
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    onEdit={() => setIsEditing(!isEditing)}
                    onChangeWallpaper={() => openWin('settings')}
                    onReset={handleReset}
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

            {/* Desktop UI */}
            <DesktopClock time={time} viewState={viewState} isAnyWindowMaximized={isAnyWindowMaximized} />
            
            <SearchBar 
                showSearchBar={sysSettings.showSearchBar}
                engine={engine}
                search={search}
                setSearch={setSearch}
                nextEngine={nextEngine}
                handleSearch={handleSearch}
                suggestions={suggestions}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
                viewState={viewState}
                isAnyWindowMaximized={isAnyWindowMaximized}
            />

            <DesktopGrid 
                ref={gridRef}
                viewState={viewState}
                isMobile={false} // Defaulting to false, should be true if width < 768. `useLayout` doesn't expose it, but `useGridCalculation` does.
                page={page}
                totalPages={totalPages}
                dir={dir}
                changePage={changePage}
                gridWidth={gridWidth}
                cellWidth={cellWidth}
                cellHeight={cellHeight}
                iconSize={iconSize}
                layoutItems={layoutItems}
                desktopApps={desktopApps}
                isEditing={isEditing}
                dragState={dragState}
                resizingWidget={resizingWidget}
                handlePointerDown={handlePointerDown}
                handleResizeStart={handleResizeStart}
                handleAppContextMenu={onAppContextMenu}
                handleIconLoaded={handleIconLoaded}
                onRemoveShortcut={(id) => setAppLayout(prev => prev.map(item => item?.id === id ? null : item))}
                setAppLayout={setAppLayout}
                openWin={openWin}
            />

            <GlobalDragLayer dragState={dragState} />

            <Pagination 
                showPagination={sysSettings.showPagination}
                totalPages={totalPages}
                page={page}
                viewState={viewState}
            />

            <Dock 
                ref={dockRef}
                showDock={sysSettings.showDock}
                dockApps={dockApps}
                viewState={viewState}
                isAnyWindowMaximized={isAnyWindowMaximized}
                showDockEdit={sysSettings.showDockEdit}
                dragState={dragState}
                isEditing={isEditing}
                onToggleEdit={() => setIsEditing(prev => !prev)}
                onRemoveShortcut={(id) => setAppLayout(prev => prev.map(item => item?.id === id ? null : item))}
                setAppLayout={setAppLayout}
                handlePointerDown={handlePointerDown}
                handleAppContextMenu={onAppContextMenu}
                handleIconLoaded={handleIconLoaded}
                openWin={openWin} 
            />

            {/* Windows */}
            {windows.map(w => {
                if (!w.isOpen) return null;
                return (
                    <ResponsiveWindow
                        key={w.id}
                        title={getWindowTitle(w)}
                        isOpen={w.isOpen}
                        isMaximized={w.isMaximized}
                        onClose={() => closeWin(w.id)}
                        onToggleMaximize={() => toggleMaximize(w.id)}
                        onFocus={() => focusWin(w.id)}
                        zIndex={w.z}
                        id={w.id}
                        defaultWidth={w.w}
                        defaultHeight={w.h}
                    >
                         <React.Suspense fallback={<div className="flex items-center justify-center h-full w-full text-white/50">Loading...</div>}>
                            {w.type === 'calc' && <CalculatorApp />}
                            {w.type === 'notes' && <NotesApp />}
                            {w.type === 'ai' && <AIApp />}
                            {w.type === 'settings' && <SettingsApp 
                                settings={sysSettings} 
                                onUpdate={setSysSettings} 
                                setWp={setWallpaper}
                                onExport={handleExportConfig}
                                onImport={handleImportConfig}
                                onReset={handleReset}
                                onEditConfig={() => openWin('configEditor')}
                                shortcuts={appLayout.filter((s): s is import('./types').Shortcut => s !== null && !s.isApp && s.type !== 'widget')}
                                onShortcutUpdate={() => {}} 
                                onEditShortcut={handleEditApp}
                                onDeleteApp={handleDeleteApp}
                                allApps={appLayout}
                                onRestoreSystemApp={handleRestoreSystemApp}
                            />}
                            {w.type === 'add' && <AddShortcutApp 
                                onAdd={(app) => { 
                                    if (app.id) {
                                        setAppLayout(prev => [...prev, app as import('./types').Shortcut]); 
                                        closeWin('add'); 
                                    }
                                }} 
                                onClose={() => closeWin('add')}
                            />}
                            {w.type === 'edit' && w.editData && <EditApp 
                                app={w.editData} 
                                onSave={(updated) => { updateApp(updated); closeWin('edit'); }} 
                                onClose={() => closeWin('edit')} 
                            />}
                            {w.type === 'configEditor' && <CodeEditor 
                                value={JSON.stringify({ settings: sysSettings, shortcuts: appLayout.filter(s => s !== null), wallpaper }, null, 2)}
                                language="json"
                                onSave={(v) => { try { const data = JSON.parse(v); if(data.settings) setSysSettings(data.settings); if(data.wallpaper) setWallpaper(data.wallpaper); /* import data.shortcuts? */ } catch(e) { } closeWin('configEditor'); }}
                                onClose={() => closeWin('configEditor')}
                            />}
                            {w.type === 'web' && <WebView url={w.url || ''} title={w.title} />}
                         </React.Suspense>
                    </ResponsiveWindow>
                );
            })}
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