import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertCircle, ChevronRight } from 'lucide-react';
import { Shortcut } from '../../../types';
import { useStoreData } from './useStoreData';
import { Sidebar } from './components/Sidebar';
import { HeroSection } from './components/HeroSection';
import { AppCard } from './components/AppCard';
import { AppDetail } from './components/AppDetail';
import { StoreApp, StoreWidget, ViewMode } from './types';
import { useConfig } from '../../../config/ConfigContext';
import { t, Language } from '../../../i18n';

interface AppStoreProps {
    onInstall: (item: Shortcut) => void;
    onOpen: (item: Shortcut) => void;
    installedApps: Shortcut[];
}

export function AppStore({ onInstall, onOpen, installedApps }: AppStoreProps) {
    const { apps, widgets, homeData, loading, error } = useStoreData();
    const { config } = useConfig();
    const lang = config.preferences.general.language as Language;
    
    // View State
    const [viewMode, setViewMode] = useState<ViewMode>('discover');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<(StoreApp | StoreWidget) | null>(null);
    const [installing, setInstalling] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(40); // Initial items to show
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Derived State
    const appCategories = useMemo(() => Array.from(new Set(apps.map(a => a.category))), [apps]);
    const widgetCategories = useMemo(() => Array.from(new Set(widgets.map(w => w.category))), [widgets]);

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {
            all_apps: apps.length,
            all_widgets: widgets.length
        };
        [...apps, ...widgets].forEach(item => {
            counts[item.category] = (counts[item.category] || 0) + 1;
        });
        return counts;
    }, [apps, widgets]);

    // Reset visible count when view or search changes
    useEffect(() => {
        setVisibleCount(40);
    }, [viewMode, activeCategory, debouncedSearchQuery]);

    // Filtering Logic
    const filteredItems = useMemo(() => {
        let items: (StoreApp | StoreWidget)[] = [];
        
        if (debouncedSearchQuery.trim()) {
            items = [...apps, ...widgets];
        } else {
            if (viewMode === 'apps') items = apps;
            else if (viewMode === 'widgets') items = widgets;
            else return []; 
        }

        return items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || 
                                 item.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
            
            if (debouncedSearchQuery.trim()) return matchesSearch;
            
            const matchesCategory = !activeCategory || item.category === activeCategory;
            return matchesCategory;
        });
    }, [viewMode, activeCategory, debouncedSearchQuery, apps, widgets]);

    const displayedItems = useMemo(() => filteredItems.slice(0, visibleCount), [filteredItems, visibleCount]);

    // Infinite Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && filteredItems.length > visibleCount) {
                setVisibleCount(prev => prev + 40);
            }
        }, { threshold: 0.1, rootMargin: '100px' });

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [filteredItems.length, visibleCount]);

    // Handlers
    const isInstalled = React.useCallback((item: StoreApp | StoreWidget) => {
        if ('url' in item.shortcut && item.shortcut.url) {
            return installedApps.some(app => app.url === item.shortcut.url);
        }
        return false;
    }, [installedApps]);

    const handleInstall = React.useCallback(async (item: StoreApp | StoreWidget) => {
        setInstalling(item.id.toString());
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulation delay
        
        const shortcutToAdd = {
            ...item.shortcut,
            id: Date.now(),
            title: item.shortcut.title || item.name,
        };

        onInstall(shortcutToAdd);
        setInstalling(null);
    }, [onInstall]);

    const handleOpen = React.useCallback((item: StoreApp | StoreWidget) => {
         // Construct a temporary shortcut object to match the interface expected by onOpen
         // or find the installed app to ensure we have the correct URL/ID
         const installed = installedApps.find(app => app.url === item.shortcut.url);
         if (installed) {
             onOpen(installed);
         } else {
             // Fallback if not technically "installed" but we have data (shouldn't happen if button is active)
             onOpen({
                 ...item.shortcut,
                 id: Date.now(), // Placeholder ID
                 title: item.shortcut.title || item.name
             });
         }
    }, [installedApps, onOpen]);

    // Close detail view on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedItem(null);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-[#0d0d12]">
                <RefreshCw className="animate-spin mb-4 text-blue-500" size={32} />
                <p>{t(lang, 'loadingStore')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-[#0d0d12]">
                <AlertCircle size={48} className="text-red-400 mb-4" />
                <p className="text-lg font-medium text-white mb-2">{t(lang, 'somethingWrong')}</p>
                <p className="mb-6">{error}</p>
                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">{t(lang, 'retry')}</button>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full bg-[#0d0d12] text-white font-sans overflow-hidden relative">
            {/* --- App Detail Overlay --- */}
            <AnimatePresence>
                {selectedItem && (
                    <AppDetail 
                        item={selectedItem} 
                        onClose={() => setSelectedItem(null)}
                        isInstalled={isInstalled(selectedItem)}
                        onInstall={handleInstall}
                        onOpen={handleOpen}
                        installing={installing === selectedItem.id.toString()}
                        lang={lang}
                    />
                )}
            </AnimatePresence>

            <Sidebar 
                viewMode={viewMode}
                setViewMode={setViewMode}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                searchQuery={debouncedSearchQuery}
                setSearchQuery={setSearchQuery}
                appCategories={appCategories}
                widgetCategories={widgetCategories}
                categoryCounts={categoryCounts}
                lang={lang}
            />

            {/* --- Main Content Area --- */}
            <div className="flex-1 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="p-8 w-full min-h-full max-w-[1920px] mx-auto">
                     {/* --- Discover View --- */}
                     {viewMode === 'discover' && !searchQuery && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                            {homeData?.hero && homeData.hero.length > 0 && (
                                <HeroSection hero={homeData.hero[0]} />
                            )}

                            {/* Featured Apps Section */}
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white tracking-tight">{t(lang, 'featuredApps')}</h2>
                                    <button 
                                        onClick={() => setViewMode('apps')}
                                        className="text-blue-400 text-sm font-medium hover:text-blue-300 flex items-center transition-colors"
                                    >
                                        {t(lang, 'seeAll')} <ChevronRight size={16} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-x-4 gap-y-8">
                                    {homeData?.featuredApps.map(id => {
                                        const app = apps.find(a => a.id === id || a.id === parseInt(id));
                                        return app ? (
                                            <AppCard 
                                                key={app.id} 
                                                item={app} 
                                                isInstalled={isInstalled(app)} 
                                                onInstall={handleInstall} 
                                                installing={installing === app.id.toString()}
                                                onClick={() => setSelectedItem(app)}
                                            />
                                        ) : null;
                                    })}
                                </div>
                            </section>
                             
                            {/* Featured Widgets Section */}
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white tracking-tight">{t(lang, 'mustHaveWidgets')}</h2>
                                     <button 
                                        onClick={() => setViewMode('widgets')}
                                        className="text-blue-400 text-sm font-medium hover:text-blue-300 flex items-center transition-colors"
                                    >
                                        {t(lang, 'seeAll')} <ChevronRight size={16} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-x-4 gap-y-8">
                                    {homeData?.featuredWidgets.map(id => {
                                        const widget = widgets.find(w => w.id === id);
                                        return widget ? (
                                            <AppCard 
                                                key={widget.id} 
                                                item={widget} 
                                                isInstalled={isInstalled(widget)} 
                                                onInstall={handleInstall} 
                                                installing={installing === widget.id.toString()}
                                                onClick={() => setSelectedItem(widget)}
                                            />
                                        ) : null;
                                    })}
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {/* --- Grid View (Apps / Widgets / Search Results) --- */}
                    {(viewMode === 'apps' || viewMode === 'widgets' || searchQuery) && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    {searchQuery 
                                        ? t(lang, 'searchResults') 
                                        : (activeCategory ? (t(lang, activeCategory.toLowerCase() as any) || activeCategory) : (viewMode === 'apps' ? t(lang, 'allApps') : t(lang, 'allWidgets')))
                                    }
                                </h1>
                                <p className="text-gray-400">
                                    {searchQuery 
                                        ? t(lang, 'foundItems').replace('{count}', filteredItems.length.toString()) + (lang === 'zh' ? ` 关于 "${searchQuery}"` : ` for "${searchQuery}"`)
                                        : `${t(lang, 'browse')} ${activeCategory ? (t(lang, activeCategory.toLowerCase() as any) || activeCategory) : ''} ${t(lang, 'items') || ''}`
                                    }
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-x-6 gap-y-10 pb-10">
                                {displayedItems.map((item) => (
                                    <div key={item.id} className="relative">
                                        <AppCard 
                                            item={item} 
                                            isInstalled={isInstalled(item)} 
                                            onInstall={handleInstall} 
                                            installing={installing === item.id.toString()} 
                                            onClick={() => setSelectedItem(item)}
                                        />
                                    </div>
                                ))}
                                {filteredItems.length === 0 && (
                                    <div className="col-span-full h-40 flex items-center justify-center text-gray-500">
                                {filteredItems.length === 0 && (
                                    <div className="col-span-full h-40 flex items-center justify-center text-gray-500">
                                        {t(lang, 'noItems')}
                                    </div>
                                )}
                                    </div>
                                )}
                            </div>

                            {/* Infinite Scroll Sentinel */}
                            <div ref={loadMoreRef} className="h-20 w-full flex items-center justify-center">
                                {filteredItems.length > visibleCount && (
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
