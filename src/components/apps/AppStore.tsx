import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Check, RefreshCw, Box, Layers, AlertCircle } from 'lucide-react';
import { Shortcut } from '../../types';

// 默认商店地址 (指向 GitHub Raw)
const STORE_BASE_URL = 'https://raw.githubusercontent.com/moduqishi/GrassTab-Store/main';

interface StoreApp extends Shortcut {
    id: string | number;
    name: string;
    description: string;
    icon: string;
    version: string;
    author: string;
    category: string;
    isWindowApp?: boolean;
    shortcut: Shortcut;
}

interface StoreWidget {
    id: string;
    name: string;
    description: string;
    icon: string;
    version: string;
    author: string;
    category: string;
    isWindowApp?: boolean;
    shortcut: Shortcut;
}

interface AppStoreProps {
    onInstall: (item: Shortcut) => void;
    installedApps: Shortcut[];
}

export function AppStore({ onInstall, installedApps }: AppStoreProps) {
    const [activeTab, setActiveTab] = useState<'apps' | 'widgets'>('apps');
    const [apps, setApps] = useState<StoreApp[]>([]);
    const [widgets, setWidgets] = useState<StoreWidget[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [installing, setInstalling] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch Apps with cache busting
            const timestamp = Date.now();
            const appsRes = await fetch(`${STORE_BASE_URL}/apps.json?t=${timestamp}`);
            if (!appsRes.ok) throw new Error('Failed to fetch apps');
            const appsData = await appsRes.json();
            setApps(appsData);

            // Fetch Widgets
            const widgetsRes = await fetch(`${STORE_BASE_URL}/widgets.json?t=${timestamp}`);
            if (!widgetsRes.ok) throw new Error('Failed to fetch widgets');
            const widgetsData = await widgetsRes.json();
            setWidgets(widgetsData);

        } catch (err) {
            console.error(err);
            setError('无法连接到应用商店，请检查网络或配置。');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInstall = async (item: StoreApp | StoreWidget) => {
        setInstalling(item.id.toString());
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const shortcutToAdd = {
            ...item.shortcut,
            id: Date.now(), // Generate new ID for local instance
            title: item.shortcut.title || item.name,
        };

        if (item.category === 'Widget') {
             // Force widget type to ensure visibility in Settings
             shortcutToAdd.type = 'widget';
             shortcutToAdd.isApp = false;
        }

        onInstall(shortcutToAdd);
        setInstalling(null);
    };

    // Check if installed
    const isInstalled = (item: StoreApp | StoreWidget) => {
        if ('url' in item.shortcut && item.shortcut.url) {
            return installedApps.some(app => app.url === item.shortcut.url);
        }
        return false;
    };

    const filteredItems = activeTab === 'apps' 
        ? apps.filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase()) || app.description.includes(searchQuery))
        : widgets.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.description.includes(searchQuery));

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
                <div className="flex space-x-4">
                    <button 
                        onClick={() => setActiveTab('apps')}
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === 'apps' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                    >
                        <Box size={20} className="mr-2" />
                        应用
                    </button>
                    <button 
                        onClick={() => setActiveTab('widgets')}
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === 'widgets' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                    >
                        <Layers size={20} className="mr-2" />
                        小组件
                    </button>
                </div>
                
                <div className="flex items-center space-x-2 bg-gray-700 px-3 py-2 rounded-lg w-64">
                    <Search size={18} className="text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="搜索..." 
                        className="bg-transparent border-none focus:outline-none text-sm w-full placeholder-gray-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-600">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <RefreshCw className="animate-spin mr-2" /> 加载中...
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <p className="mb-4">{error}</p>
                        <button onClick={fetchData} className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">重试</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredItems.map((item) => (
                            <motion.div 
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gray-800 rounded-xl p-4 flex flex-col hover:bg-gray-750 border border-gray-700 hover:border-gray-600 transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="bg-gray-700 p-3 rounded-lg">
                                        {/* Simple Image Fallback or Icon */}
                                        {item.icon.startsWith('http') ? (
                                            <img src={item.icon} alt={item.name} className="w-10 h-10 object-cover rounded" />
                                        ) : (
                                            <div className="w-10 h-10 flex items-center justify-center text-xl">
                                                {activeTab === 'apps' ? '📱' : '🧩'}
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => handleInstall(item)}
                                        disabled={installing === item.id.toString() || isInstalled(item)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${
                                            isInstalled(item) 
                                            ? 'bg-gray-700 text-gray-400 cursor-default' 
                                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                                        }`}
                                    >
                                        {installing === item.id.toString() ? (
                                            <RefreshCw size={14} className="animate-spin" />
                                        ) : isInstalled(item) ? (
                                            <>已安装 <Check size={14} className="ml-1" /></>
                                        ) : (
                                            <>获取 <Download size={14} className="ml-1" /></>
                                        )}
                                    </button>
                                </div>
                                
                                <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                                <p className="text-gray-400 text-sm mb-3 line-clamp-2 flex-1">{item.description}</p>
                                
                                <div className="flex items-center text-xs text-gray-500 mt-auto pt-3 border-t border-gray-700/50">
                                    <span className="bg-gray-700/50 px-2 py-0.5 rounded mr-2">{item.version}</span>
                                    <span>{item.author}</span>
                                    {item.isWindowApp && (
                                        <span className="ml-2 bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded text-[10px]">窗口应用</span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Fallback logic could be added here if needed
