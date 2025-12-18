import React, { useRef, useMemo } from 'react';
import { ConfigProvider, useConfig } from './config/ConfigContext';
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
        config,
        exportConfig, 
        importConfig, 
        resetConfig 
    } = useConfig();

    const { 
        engine, setEngine, 
        currentEngine,
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
            const yamlStr = exportConfig();
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

            const aiProviders = config.integrations.ai.providers;
            const aiInfo = aiProviders.length > 0 ? `\n• AI 提供商: ${aiProviders.length} 个` : '';
            const notesInfo = config.data.notes ? `\n• 便签: 已保存` : '';
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

            const text = await file.text();
            if (!text || text.trim() === '') {
                dialog.showAlert('配置文件为空', '请选择一个有效的配置文件。');
                return;
            }

            const confirmMsg = `即将导入配置，此操作无法撤销！`;
            if (await dialog.showConfirm('确认导入配置？', confirmMsg)) {
                const success = await importConfig(text);
                if (success) {
                    setPage(0);
                    dialog.showAlert('✓ 配置导入成功', '配置已生效！');
                    // Optional: reload if needed to reset deep state, but Context should handle it
                    // window.location.reload(); 
                } else {
                    dialog.showAlert('❌ 导入失败', '配置文件解析失败，请检查格式');
                }
            }
        } catch (e) {
            console.error('Import error:', e);
            dialog.showAlert('❌ 导入配置失败', `错误信息: ${e instanceof Error ? e.message : '未知错误'}`);
        }
    };

    const handleReset = async () => {
         if (await dialog.showConfirm('⚠️ 恢复默认设置', '此操作将清除所有自定义数据并恢复到初始状态。')) {
            if (await dialog.showConfirm('确定要执行吗？', '最后一次确认。')) {
                 resetConfig();
                 location.reload();
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
                    onOpenSettings={() => openWin('settings')}
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
                    onOpen={() => {
                        const s = appContextMenu.app;
                        if (s.isApp) openWin(s.id.toString(), s);
                        else if (s.type !== 'widget' && s.url) window.location.href = s.url;
                        setAppContextMenu(null);
                    }}
                    onOpenNewTab={() => {
                        const s = appContextMenu.app;
                        if (s.url) window.open(s.url, '_blank');
                        setAppContextMenu(null);
                    }}
                />
            )}

            {/* Desktop UI */}
            <DesktopClock time={time} viewState={viewState} isAnyWindowMaximized={isAnyWindowMaximized} />
            
            <SearchBar 
                showSearchBar={sysSettings.showSearchBar}
                engine={engine}
                currentEngine={currentEngine} // Pass the full engine object
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
                                    const newApp = {
                                        ...app,
                                        id: app.id || Date.now(),
                                        color: app.color || 'from-blue-500 to-cyan-500' // Default color if missing
                                    } as import('./types').Shortcut;
                                    
                                    setAppLayout(prev => [...prev, newApp]); 
                                    closeWin('add'); 
                                }} 
                                onClose={() => closeWin('add')}
                            />}
                            {w.type === 'edit' && w.editData && <EditApp 
                                app={w.editData} 
                                onSave={(updated) => { updateApp(updated); closeWin('edit'); }} 
                                onClose={() => closeWin('edit')} 
                            />}
                            {w.type === 'configEditor' && <CodeEditor 
                                value={exportConfig()}
                                language="yaml"
                                onSave={async (v) => { 
                                    const success = await importConfig(v);
                                    if (success) {
                                        closeWin('configEditor');
                                        dialog.showAlert('配置已更新');
                                    } else {
                                        dialog.showAlert('配置更新失败，请检查 YAML 格式');
                                    }
                                }}
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
        <ConfigProvider>
            <DialogProvider>
                <DesktopApp />
            </DialogProvider>
        </ConfigProvider>
    );
}