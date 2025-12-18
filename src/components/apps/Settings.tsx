import React, { useRef, useState } from 'react';
import { useDialog } from '../Dialog';
import { useConfig } from '../../config/ConfigContext';
import { DEFAULT_WALLPAPER, SYSTEM_APPS } from '../../constants.tsx';
import { SystemSettings, Shortcut } from '../../types';
import { Monitor, Wallpaper, Search, MoreHorizontal, Database, Trash2, Edit3, Download, Upload, FileJson, Languages, FileEdit, ChevronRight, ArrowLeft, Image as ImageIcon, Link as LinkIcon, MessageSquare, Key, Cpu, Thermometer, Hash, Plus, X, Check, Loader2, AppWindow, LayoutGrid, RefreshCw } from 'lucide-react';
import { t } from '../../i18n';
import { AIProvider } from './AI.tsx';

interface SettingsAppProps {
    setWp: (url: string) => void;
    settings: SystemSettings;
    onUpdate: (s: SystemSettings) => void;
    onExport: () => void;
    onImport: (file: File) => void;
    onReset: () => void;
    onEditConfig?: () => void;
    shortcuts: Shortcut[];
    onShortcutUpdate: (shortcuts: Shortcut[]) => void;
    onEditShortcut: (shortcut: Shortcut) => void;
    onDeleteApp: (app: Shortcut) => void;
    allApps: (Shortcut | null)[];
    onRestoreSystemApp: (appId: string) => void;
}

const WALLPAPERS = [
    DEFAULT_WALLPAPER,
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564",
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574",
    "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2670"
];

// 验证URL是否有效
const isValidUrl = (urlString: string): boolean => {
    try {
        new URL(urlString);
        return true;
    } catch {
        return false;
    }
};

const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) => (
    <div
        onClick={() => onChange(!checked)}
        className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${checked ? 'bg-[#34C759]' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
);

const SectionHeader = ({ title }: { title: string }) => (
    <div className="px-4 pb-2 pt-6 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
        {title}
    </div>
);

const normalizeApiUrl = (url: string): string => {
    const trimmed = url.trim();
    if (!trimmed) return '';
    
    // 如果已经包含完整路径，直接返回
    if (trimmed.includes('/chat/completions')) {
        return trimmed;
    }
    
    // 移除末尾的斜杠
    let normalized = trimmed.replace(/\/+$/, '');
    
    // 如果只有基础URL（如 https://api.openai.com），添加 /v1/chat/completions
    if (!normalized.includes('/v1')) {
        normalized += '/v1/chat/completions';
    } else if (normalized.endsWith('/v1')) {
        // 如果已经有 /v1，添加 /chat/completions
        normalized += '/chat/completions';
    } else if (normalized.includes('/v1/') && !normalized.includes('/chat/completions')) {
        // 如果有 /v1/ 但没有完整路径，添加 chat/completions
        normalized += '/chat/completions';
    }
    
    return normalized;
};

const SettingsItem = ({ icon: Icon, label, children, isLast, onClick, hasChevron }: { icon: any, label: string, children?: React.ReactNode, isLast?: boolean, onClick?: () => void, hasChevron?: boolean }) => (
    <div
        className="flex items-center justify-between p-4 transition-all cursor-pointer"
        style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderBottom: isLast ? 'none' : '0.5px solid rgba(255, 255, 255, 0.08)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
        onClick={onClick}
    >
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.7)' }}>
                <Icon size={18} />
            </div>
            <span className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{label}</span>
        </div>
        <div className="flex items-center gap-2">
            {children}
            {hasChevron && <ChevronRight size={18} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />}
        </div>
    </div>
);
export const SettingsApp: React.FC<SettingsAppProps> = ({ setWp, settings, onUpdate, onExport, onImport, onReset, onEditConfig, shortcuts, onShortcutUpdate, onEditShortcut, onDeleteApp, allApps, onRestoreSystemApp }) => {
    const dialog = useDialog();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const wallpaperInputRef = useRef<HTMLInputElement>(null);
    const [showWallpaperMenu, setShowWallpaperMenu] = useState(false);
    const [showAIMenu, setShowAIMenu] = useState(false);
    const [showAppManager, setShowAppManager] = useState(false);
    const [showWidgetManager, setShowWidgetManager] = useState(false);
    const [customWallpaperUrl, setCustomWallpaperUrl] = useState('');
    const { config, updateAI } = useConfig();
    const aiProviders = config.integrations.ai.providers;
    
    // Removed local aiProviders state and localStorage logic
    const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
    const [isAddingProvider, setIsAddingProvider] = useState(false);
    const [isFetchingModels, setIsFetchingModels] = useState(false);
    const lang = settings.language || 'zh';

    // 排序和分组逻辑
    const sortAndGroupShortcuts = (items: Shortcut[], type: 'app' | 'widget') => {
        const filtered = items.filter(item => 
            type === 'app' ? item.type !== 'widget' : item.type === 'widget'
        );

        // 按标题分组（处理重名）
        const grouped = new Map<string, Shortcut[]>();
        filtered.forEach(item => {
            const title = item.title || '';
            if (!grouped.has(title)) {
                grouped.set(title, []);
            }
            grouped.get(title)!.push(item);
        });

        // 排序函数
        const sortByTitle = (a: string, b: string) => {
            const aChinese = /[\u4e00-\u9fa5]/.test(a);
            const bChinese = /[\u4e00-\u9fa5]/.test(b);
            const aEnglish = /^[a-zA-Z]/.test(a);
            const bEnglish = /^[a-zA-Z]/.test(a);

            // 中文排前面
            if (aChinese && !bChinese) return -1;
            if (!aChinese && bChinese) return 1;

            // 英文排中间
            if (aEnglish && !bEnglish && !bChinese) return -1;
            if (!aEnglish && bEnglish && !aChinese) return 1;

            // 同类型按字母/拼音排序
            return a.localeCompare(b, 'zh-CN');
        };

        // 生成显示列表
        const result: (Shortcut & { displayName: string })[] = [];
        Array.from(grouped.keys())
            .sort(sortByTitle)
            .forEach(title => {
                const items = grouped.get(title)!;
                items.forEach((item, index) => {
                    result.push({
                        ...item,
                        displayName: items.length > 1 ? `${title} ${index + 1}` : title
                    });
                });
            });

        return result;
    };

    const updateSetting = (key: keyof SystemSettings, value: boolean | string) => {
        onUpdate({ ...settings, [key]: value });
    };

    const saveProviders = (providers: AIProvider[]) => {
        updateAI({ providers });
    };

    const addProvider = () => {
        const newProvider: AIProvider = {
            id: Date.now().toString(),
            name: '新建 API',
            apiUrl: 'https://api.openai.com/v1/chat/completions',
            apiKey: '',
            models: [],
            customModels: [],
            temperature: 0.7,
            maxTokens: 2000
        };
        setEditingProvider(newProvider);
        setIsAddingProvider(true);
    };

    const saveProvider = () => {
        if (!editingProvider) return;
        
        // 自动规范化 API 地址
        const normalizedProvider = {
            ...editingProvider,
            apiUrl: normalizeApiUrl(editingProvider.apiUrl)
        };
        
        if (isAddingProvider) {
            saveProviders([...aiProviders, normalizedProvider]);
        } else {
            saveProviders(aiProviders.map(p => p.id === normalizedProvider.id ? normalizedProvider : p));
        }
        
        setEditingProvider(null);
        setIsAddingProvider(false);
    };

    const deleteProvider = async (id: string) => {
        if (await dialog.showConfirm('确定要删除这个 API 提供商吗？')) {
            saveProviders(aiProviders.filter(p => p.id !== id));
        }
    };

    const fetchModels = async (provider: AIProvider) => {
        try {
            // 智能构建 models 端点 URL
            let modelsUrl = provider.apiUrl;
            
            if (modelsUrl.includes('/chat/completions')) {
                modelsUrl = modelsUrl.replace('/chat/completions', '/models');
            } else if (modelsUrl.includes('/v1')) {
                modelsUrl = modelsUrl.replace(/\/+$/, '') + '/models';
            } else {
                modelsUrl = modelsUrl.replace(/\/+$/, '') + '/v1/models';
            }
            
            const response = await fetch(modelsUrl, {
                headers: {
                    'Authorization': `Bearer ${provider.apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error('无法获取模型列表');
            }

            const data = await response.json();
            const modelIds = data.data?.map((m: any) => m.id) || [];
            
            return modelIds.filter((id: string) => 
                id.includes('gpt') || 
                id.includes('claude') || 
                id.includes('llama') ||
                id.includes('gemini') ||
                !id.includes('whisper') && !id.includes('tts') && !id.includes('dall-e')
            );
        } catch (err) {
            console.error('Failed to fetch models:', err);
            return [];
        }
    };

    const autoFetchModels = async (provider: AIProvider) => {
        if (!provider.apiUrl || !provider.apiKey) {
            console.log('Missing apiUrl or apiKey');
            return;
        }
        
        setIsFetchingModels(true);
        console.log('Fetching models for:', provider.apiUrl);
        
        // 确保 API URL 被规范化
        const normalizedProvider = {
            ...provider,
            apiUrl: normalizeApiUrl(provider.apiUrl)
        };
        
        const models = await fetchModels(normalizedProvider);
        console.log('Fetched models:', models);
        
        if (models.length > 0) {
            // 将获取的模型添加到 customModels 列表，去重
            const existingModels = new Set(provider.customModels);
            const newModels = models.filter((m: string) => !existingModels.has(m));
            
            setEditingProvider(prev => prev ? { 
                ...prev,
                customModels: [...prev.customModels, ...newModels],
                apiUrl: normalizedProvider.apiUrl
            } : null);
        }
        
        setIsFetchingModels(false);
    };

    const addCustomModel = async (providerId: string) => {
        const modelName = await dialog.showPrompt('输入自定义模型名称：');
        if (modelName && modelName.trim()) {
            if (editingProvider && editingProvider.id === providerId) {
                setEditingProvider({
                    ...editingProvider,
                    customModels: [...editingProvider.customModels, modelName.trim()]
                });
            } else {
                saveProviders(aiProviders.map(p => 
                    p.id === providerId 
                        ? { ...p, customModels: [...p.customModels, modelName.trim()] }
                        : p
                ));
            }
        }
    };

    const removeCustomModel = (providerId: string, model: string) => {
        if (editingProvider && editingProvider.id === providerId) {
            setEditingProvider({
                ...editingProvider,
                customModels: editingProvider.customModels.filter(m => m !== model)
            });
        } else {
            saveProviders(aiProviders.map(p => 
                p.id === providerId 
                    ? { ...p, customModels: p.customModels.filter(m => m !== model) }
                    : p
            ));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImport(file);
        }
        // Reset input so same file can be selected again if needed
        if (e.target) e.target.value = '';
    };

    const handleWallpaperUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                dialog.showAlert('请选择图片文件');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                dialog.showAlert('图片大小不能超过 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                setWp(base64);
            };
            reader.readAsDataURL(file);
        }
        if (e.target) e.target.value = '';
    };

    const handleCustomUrl = () => {
        if (customWallpaperUrl.trim()) {
            setWp(customWallpaperUrl.trim());
            setCustomWallpaperUrl('');
        }
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".yaml,.yml,.json"
                aria-label="Import configuration file"
                title="Import configuration file"
            />
            <input
                type="file"
                ref={wallpaperInputRef}
                onChange={handleWallpaperUpload}
                className="hidden"
                accept="image/*"
                aria-label="Upload wallpaper"
                title="Upload wallpaper"
            />

            <div className="flex-1 overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
                {!showWallpaperMenu && !showAIMenu && !showAppManager && !showWidgetManager ? (
                    <>
                        {/* INTERFACE SECTION */}
                        <SectionHeader title={t(lang, 'interfaceLayout')} />
                        <div className="mx-4 rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                            <SettingsItem icon={Monitor} label={t(lang, 'showDockBar')}>
                                <ToggleSwitch checked={settings.showDock} onChange={(v) => updateSetting('showDock', v)} />
                            </SettingsItem>
                            <SettingsItem icon={Edit3} label={t(lang, 'showDockEditButton')}>
                                <ToggleSwitch checked={settings.showDockEdit} onChange={(v) => updateSetting('showDockEdit', v)} />
                            </SettingsItem>
                            <SettingsItem icon={Search} label={t(lang, 'desktopSearchBar')}>
                                <ToggleSwitch checked={settings.showSearchBar} onChange={(v) => updateSetting('showSearchBar', v)} />
                            </SettingsItem>
                            <SettingsItem icon={MoreHorizontal} label={t(lang, 'paginationDots')} isLast>
                                <ToggleSwitch checked={settings.showPagination} onChange={(v) => updateSetting('showPagination', v)} />
                            </SettingsItem>
                        </div>

                        {/* APP MANAGEMENT SECTION */}
                        <SectionHeader title="应用与小组件" />
                        <div className="mx-4 rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                            <SettingsItem icon={AppWindow} label="应用管理" onClick={() => setShowAppManager(true)} hasChevron />
                            <SettingsItem icon={LayoutGrid} label="小组件管理" onClick={() => setShowWidgetManager(true)} hasChevron isLast />
                        </div>

                        {/* PERSONALIZATION SECTION */}
                        <SectionHeader title={t(lang, 'personalization')} />
                        <div className="mx-4 rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                            <SettingsItem icon={Wallpaper} label={t(lang, 'wallpapers')} onClick={() => setShowWallpaperMenu(true)} hasChevron isLast />
                        </div>

                        {/* AI SETTINGS SECTION */}
                        <SectionHeader title="AI 助手" />
                        <div className="mx-4 rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                            <SettingsItem icon={MessageSquare} label="AI 配置" onClick={() => setShowAIMenu(true)} hasChevron isLast />
                        </div>

                        {/* LANGUAGE SECTION */}
                        <SectionHeader title={t(lang, 'language')} />
                        <div className="mx-4 rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                            <SettingsItem icon={Languages} label={t(lang, 'language')}>
                                <select
                                    value={settings.language || 'zh'}
                                    onChange={(e) => updateSetting('language', e.target.value)}
                                    className="px-3 py-1.5 rounded-lg outline-none cursor-pointer appearance-none transition-all hover:bg-white/15"
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'rgba(255,255,255,0.5)\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 8px center',
                                        paddingRight: '28px'
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <option value="zh" style={{ backgroundColor: '#2a2a2a', color: '#fff', padding: '8px' }}>{t(lang, 'chinese')}</option>
                                    <option value="en" style={{ backgroundColor: '#2a2a2a', color: '#fff', padding: '8px' }}>{t(lang, 'english')}</option>
                                </select>
                            </SettingsItem>
                        </div>

                        {/* DATA SECTION */}
                        <SectionHeader title={t(lang, 'dataManagement')} />
                        <div className="mx-4 rounded-xl overflow-hidden shadow-sm mb-8" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                            <SettingsItem icon={Download} label={t(lang, 'exportConfig')} onClick={onExport} />
                            <SettingsItem icon={Upload} label={t(lang, 'importConfig')} onClick={() => fileInputRef.current?.click()} />
                            {onEditConfig && (
                                <SettingsItem icon={FileEdit} label={t(lang, 'editConfig')} onClick={onEditConfig} />
                            )}
                            <SettingsItem icon={Trash2} label={t(lang, 'resetToDefault')} onClick={onReset} isLast />
                        </div>
                    </>
                ) : showWallpaperMenu ? (
                    <>
                        {/* WALLPAPER SUBMENU */}
                        <div 
                            className="p-4 flex items-center gap-3 cursor-pointer transition-all"
                            style={{ borderBottom: '0.5px solid rgba(255, 255, 255, 0.1)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => setShowWallpaperMenu(false)}
                        >
                            <ArrowLeft size={20} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                            <span className="text-base font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{t(lang, 'wallpapers')}</span>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Preset Wallpapers */}
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                    预设壁纸
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {WALLPAPERS.map((w, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => setWp(w)} 
                                            className="aspect-video rounded-lg overflow-hidden cursor-pointer transition-all shadow-lg"
                                            style={{ 
                                                border: '2px solid rgba(255, 255, 255, 0.1)',
                                                transform: 'scale(1)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                e.currentTarget.style.borderColor = '#007AFF';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                            }}
                                        >
                                            <img src={w} className="w-full h-full object-cover" alt={`Wallpaper ${i}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Custom URL */}
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                    自定义链接
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={customWallpaperUrl}
                                        onChange={(e) => setCustomWallpaperUrl(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCustomUrl()}
                                        placeholder="https://example.com/image.jpg"
                                        className="flex-1 px-4 py-2.5 rounded-lg outline-none transition-all"
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            color: 'rgba(255, 255, 255, 0.9)'
                                        }}
                                    />
                                    <button
                                        onClick={handleCustomUrl}
                                        className="px-4 py-2.5 rounded-lg font-medium transition-all active:scale-95"
                                        style={{
                                            backgroundColor: '#007AFF',
                                            color: 'white'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                                    >
                                        <LinkIcon size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Upload */}
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                    上传图片
                                </div>
                                <button
                                    onClick={() => wallpaperInputRef.current?.click()}
                                    className="w-full p-4 rounded-lg transition-all flex items-center justify-center gap-3"
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                        border: '2px dashed rgba(255, 255, 255, 0.2)',
                                        color: 'rgba(255, 255, 255, 0.7)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                                        e.currentTarget.style.borderColor = '#007AFF';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                    }}
                                >
                                    <ImageIcon size={20} />
                                    <span className="font-medium">选择图片文件</span>
                                </button>
                                <div className="text-xs mt-2" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                    支持 JPG、PNG、WebP 等格式，最大 5MB
                                </div>
                            </div>
                        </div>
                    </>
                ) : showAIMenu ? (
                    <>
                        {/* AI CONFIGURATION SUBMENU */}
                        <div 
                            className="p-4 flex items-center gap-3 cursor-pointer transition-all"
                            style={{ borderBottom: '0.5px solid rgba(255, 255, 255, 0.1)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => {
                                setShowAIMenu(false);
                                setEditingProvider(null);
                                setIsAddingProvider(false);
                            }}
                        >
                            <ArrowLeft size={20} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                            <span className="text-base font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>AI 配置</span>
                        </div>

                        {!editingProvider ? (
                            <div className="p-4 space-y-4">
                                {/* Add Provider Button */}
                                <button
                                    onClick={addProvider}
                                    className="w-full p-4 rounded-lg transition-all flex items-center justify-center gap-3 text-sm font-medium"
                                    style={{
                                        backgroundColor: 'rgba(10, 132, 255, 0.1)',
                                        border: '2px dashed rgba(10, 132, 255, 0.3)',
                                        color: '#0A84FF'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(10, 132, 255, 0.15)';
                                        e.currentTarget.style.borderColor = '#0A84FF';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(10, 132, 255, 0.1)';
                                        e.currentTarget.style.borderColor = 'rgba(10, 132, 255, 0.3)';
                                    }}
                                >
                                    <Plus size={20} />
                                    添加 API 提供商
                                </button>

                                {/* Provider List */}
                                {aiProviders.length > 0 ? (
                                    <div className="space-y-3">
                                        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                            已配置的提供商 ({aiProviders.length})
                                        </div>
                                        {aiProviders.map(provider => (
                                            <div
                                                key={provider.id}
                                                className="p-4 rounded-lg transition-all"
                                                style={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                                }}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <div className="font-medium mb-1" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                                            {provider.name}
                                                        </div>
                                                        <div className="text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                                            {provider.apiUrl}
                                                        </div>
                                                        <div className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                                            {provider.customModels.length} 个模型
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setEditingProvider(provider)}
                                                            className="p-2 rounded-lg hover:bg-white/10 transition-all"
                                                            title="编辑"
                                                        >
                                                            <Edit3 size={16} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteProvider(provider.id)}
                                                            className="p-2 rounded-lg hover:bg-red-500/20 transition-all"
                                                            title="删除"
                                                        >
                                                            <Trash2 size={16} style={{ color: 'rgba(239, 68, 68, 0.8)' }} />
                                                        </button>
                                                    </div>
                                                </div>
                                                {provider.apiKey && (
                                                    <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(52, 199, 89, 0.8)' }}>
                                                        <Check size={12} />
                                                        <span>API Key 已配置</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-3">🤖</div>
                                        <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                            还没有配置 API 提供商
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-4 space-y-6">
                                {/* Provider Name */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                        提供商名称
                                    </label>
                                    <input
                                        type="text"
                                        value={editingProvider.name}
                                        onChange={(e) => setEditingProvider({ ...editingProvider, name: e.target.value })}
                                        placeholder="例如: OpenAI, Claude, 通义千问"
                                        className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-sm"
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            color: 'rgba(255, 255, 255, 0.9)'
                                        }}
                                    />
                                </div>

                                {/* API URL */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                        <div className="flex items-center gap-2">
                                            <Database size={14} />
                                            API 地址
                                        </div>
                                    </label>
                                    <input
                                        type="text"
                                        value={editingProvider.apiUrl}
                                        onChange={(e) => setEditingProvider({ ...editingProvider, apiUrl: e.target.value })}
                                        onBlur={(e) => {
                                            const normalized = normalizeApiUrl(e.target.value);
                                            setEditingProvider({ ...editingProvider, apiUrl: normalized });
                                        }}
                                        placeholder="https://api.openai.com 或 https://api.openai.com/v1"
                                        className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-sm"
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            color: 'rgba(255, 255, 255, 0.9)'
                                        }}
                                    />
                                    {editingProvider.apiUrl && (
                                        <div className="text-xs mt-1.5 font-mono" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                            完整地址: {normalizeApiUrl(editingProvider.apiUrl) || editingProvider.apiUrl}
                                        </div>
                                    )}
                                    <div className="text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                        自动补全为 /v1/chat/completions 端点
                                    </div>
                                </div>

                                {/* API Key */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                        <div className="flex items-center gap-2">
                                            <Key size={14} />
                                            API Key
                                            {isFetchingModels && <Loader2 size={12} className="animate-spin" />}
                                        </div>
                                    </label>
                                    <input
                                        type="password"
                                        value={editingProvider.apiKey}
                                        onChange={(e) => setEditingProvider({ ...editingProvider, apiKey: e.target.value })}
                                        placeholder="sk-..."
                                        className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-sm font-mono"
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            color: 'rgba(255, 255, 255, 0.9)'
                                        }}
                                        disabled={isFetchingModels}
                                    />
                                    <div className="text-xs mt-1.5" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                        你的 API 密钥，仅存储在本地
                                    </div>
                                </div>

                                {/* Custom Models */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                        <div className="flex items-center gap-2">
                                            <Cpu size={14} />
                                            自定义模型
                                            {isFetchingModels && <Loader2 size={12} className="animate-spin" />}
                                        </div>
                                    </label>
                                    
                                    {/* 手动刷新按钮 */}
                                    <button
                                        onClick={() => autoFetchModels(editingProvider)}
                                        disabled={!editingProvider.apiUrl || !editingProvider.apiKey || isFetchingModels}
                                        className="w-full mb-2 p-2 rounded-lg transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                            backgroundColor: 'rgba(10, 132, 255, 0.1)',
                                            border: '1px solid rgba(10, 132, 255, 0.3)',
                                            color: 'rgba(10, 132, 255, 0.9)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!e.currentTarget.disabled) {
                                                e.currentTarget.style.backgroundColor = 'rgba(10, 132, 255, 0.15)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!e.currentTarget.disabled) {
                                                e.currentTarget.style.backgroundColor = 'rgba(10, 132, 255, 0.1)';
                                            }
                                        }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="23 4 23 10 17 10"></polyline>
                                            <polyline points="1 20 1 14 7 14"></polyline>
                                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                                        </svg>
                                        {isFetchingModels ? '正在获取模型...' : '从 API 获取模型列表'}
                                    </button>
                                    
                                    <div className="space-y-2">
                                        {editingProvider.customModels.map(model => (
                                            <div
                                                key={model}
                                                className="flex items-center justify-between p-2 rounded-lg"
                                                style={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                                }}
                                            >
                                                <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{model}</span>
                                                <button
                                                    onClick={() => removeCustomModel(editingProvider.id, model)}
                                                    className="p-1 rounded hover:bg-red-500/20 transition-all"
                                                >
                                                    <X size={14} style={{ color: 'rgba(239, 68, 68, 0.8)' }} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => addCustomModel(editingProvider.id)}
                                            className="w-full p-2 rounded-lg transition-all flex items-center justify-center gap-2 text-xs"
                                            style={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px dashed rgba(255, 255, 255, 0.2)',
                                                color: 'rgba(255, 255, 255, 0.6)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                            }}
                                        >
                                            <Plus size={14} />
                                            添加自定义模型
                                        </button>
                                    </div>
                                    <div className="text-xs mt-1.5" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                        点击上方按钮获取模型，然后删除不需要的模型
                                    </div>
                                </div>

                                {/* Temperature */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                        <div className="flex items-center gap-2">
                                            <Thermometer size={14} />
                                            Temperature ({editingProvider.temperature})
                                        </div>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="2"
                                        step="0.1"
                                        value={editingProvider.temperature}
                                        onChange={(e) => setEditingProvider({ ...editingProvider, temperature: parseFloat(e.target.value) })}
                                        className="w-full"
                                        style={{ accentColor: '#007AFF' }}
                                    />
                                    <div className="flex justify-between text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                        <span>精确 (0)</span>
                                        <span>创意 (2)</span>
                                    </div>
                                </div>

                                {/* Max Tokens */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                        <div className="flex items-center gap-2">
                                            <Hash size={14} />
                                            最大 Tokens ({editingProvider.maxTokens})
                                        </div>
                                    </label>
                                    <input
                                        type="range"
                                        min="100"
                                        max="4000"
                                        step="100"
                                        value={editingProvider.maxTokens}
                                        onChange={(e) => setEditingProvider({ ...editingProvider, maxTokens: parseInt(e.target.value) })}
                                        className="w-full"
                                        style={{ accentColor: '#007AFF' }}
                                    />
                                    <div className="text-xs mt-1.5" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                        控制回复的最大长度
                                    </div>
                                </div>

                                {/* Save/Cancel Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => {
                                            setEditingProvider(null);
                                            setIsAddingProvider(false);
                                        }}
                                        className="flex-1 px-4 py-3 rounded-lg font-medium transition-all"
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            color: 'rgba(255, 255, 255, 0.7)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                                    >
                                        取消
                                    </button>
                                    <button
                                        onClick={saveProvider}
                                        className="flex-1 px-4 py-3 rounded-lg font-medium transition-all"
                                        style={{
                                            backgroundColor: '#007AFF',
                                            color: 'white'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                                    >
                                        保存
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : showAppManager ? (
                    <>
                        {/* APP MANAGER */}
                        <div 
                            className="p-4 flex items-center gap-3 cursor-pointer transition-all"
                            style={{ borderBottom: '0.5px solid rgba(255, 255, 255, 0.1)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => setShowAppManager(false)}
                        >
                            <ArrowLeft size={20} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                            <span className="text-base font-semibold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>应用管理</span>
                        </div>

                        {/* 系统应用管理区域 */}
                        <div className="px-4 pt-4">
                            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                系统应用
                            </div>
                        </div>
                        <div className="mx-4 mb-4 rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                            {SYSTEM_APPS.map((app, index) => {
                                // 直接检查allApps中是否存在该系统应用
                                const isActive = allApps.some(item => item?.id === app.id);
                                const isLast = index === SYSTEM_APPS.length - 1;
                                
                                return (
                                    <div
                                        key={app.id}
                                        className="flex items-center justify-between p-4 transition-all"
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                            borderBottom: isLast ? 'none' : '0.5px solid rgba(255, 255, 255, 0.08)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${app.color}`}>
                                                {app.id === 'ai' && <Cpu size={18} className="text-white" />}
                                                {app.id === 'notes' && <FileEdit size={18} className="text-white" />}
                                                {app.id === 'calc' && <Hash size={18} className="text-white" />}
                                                {app.id === 'settings' && <Monitor size={18} className="text-white" />}
                                            </div>
                                            <span className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                                {app.displayName || app.title}
                                            </span>
                                        </div>
                                        <ToggleSwitch
                                            checked={isActive}
                                            onChange={(enabled) => {
                                                if (enabled) {
                                                    // 恢复应用（添加到末尾）
                                                    onRestoreSystemApp(app.id as string);
                                                } else {
                                                    // 删除应用（使用主程序的删除逻辑）
                                                    dialog.showConfirm(`确定要关闭 "${app.displayName || app.title}" 吗？\n\n关闭后可以随时在这里重新开启`).then((confirmed) => {
                                                        if (confirmed) {
                                                            // 直接调用删除回调
                                                            onDeleteApp(app);
                                                        }
                                                    });
                                                }
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* 桌面应用列表 */}
                        <div className="px-4">
                            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                桌面应用
                            </div>
                        </div>
                        <div className="px-4 space-y-2">
                            {sortAndGroupShortcuts(shortcuts, 'app').filter(app => app.type !== 'sys').map((app, index) => (
                                <div
                                    key={app.id}
                                    className="flex items-center justify-between p-3 rounded-lg transition-all"
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-10 h-10 shrink-0">
                                            {app.customIcon ? (
                                                <img src={app.customIcon} className="w-full h-full rounded-lg object-cover" alt={app.displayName} />
                                            ) : app.url && isValidUrl(app.url) ? (
                                                <img 
                                                    src={`https://www.google.com/s2/favicons?domain=${new URL(app.url).hostname}&sz=128`} 
                                                    className="w-full h-full rounded-lg object-cover"
                                                    alt={app.displayName}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.onerror = null;
                                                        target.src = `https://icon.horse/icon/${new URL(app.url!).hostname}`;
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                                                    <AppWindow size={20} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                                {app.displayName}
                                            </div>
                                            {app.url && (
                                                <div className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                                    {app.url}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onEditShortcut(app)}
                                            className="p-2 rounded-lg transition-all"
                                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                                        >
                                            <Edit3 size={16} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                                        </button>
                                        <button
                                            onClick={() => onDeleteApp(app)}
                                            className="p-2 rounded-lg transition-all"
                                            style={{ backgroundColor: 'rgba(255, 59, 48, 0.15)' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 59, 48, 0.25)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 59, 48, 0.15)'}
                                        >
                                            <Trash2 size={16} style={{ color: '#ff453a' }} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {sortAndGroupShortcuts(shortcuts, 'app').length === 0 && (
                                <div className="text-center py-12" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                    暂无应用
                                </div>
                            )}
                                </div>
                    </>
                ) : showWidgetManager ? (
                    <>
                        {/* WIDGET MANAGER */}
                        <div 
                            className="p-4 flex items-center gap-3 cursor-pointer transition-all"
                            style={{ borderBottom: '0.5px solid rgba(255, 255, 255, 0.1)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => setShowWidgetManager(false)}
                        >
                            <ArrowLeft size={20} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                            <span className="text-base font-semibold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>小组件管理</span>
                        </div>

                        <div className="p-4 space-y-2">
                            {sortAndGroupShortcuts(shortcuts, 'widget').map((widget, index) => (
                                <div
                                    key={widget.id}
                                    className="flex items-center justify-between p-3 rounded-lg transition-all"
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                                            <LayoutGrid size={20} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                                {widget.displayName}
                                            </div>
                                            <div className="text-xs mt-0.5" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                                {widget.widgetType === 'clock' && '时钟'}
                                                {widget.widgetType === 'calendar' && '日历'}
                                                {widget.widgetType === 'weather' && '天气'}
                                                {widget.widgetType === 'custom' && '自定义 HTML'}
                                                {widget.widgetType === 'iframe' && '网页嵌入'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onEditShortcut(widget)}
                                            className="p-2 rounded-lg transition-all"
                                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                                        >
                                            <Edit3 size={16} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (await dialog.showConfirm(`确定要删除 "${widget.displayName}" 吗？`)) {
                                                    onShortcutUpdate(shortcuts.filter(s => s.id !== widget.id));
                                                }
                                            }}
                                            className="p-2 rounded-lg transition-all"
                                            style={{ backgroundColor: 'rgba(255, 59, 48, 0.15)' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 59, 48, 0.25)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 59, 48, 0.15)'}
                                        >
                                            <Trash2 size={16} style={{ color: '#ff453a' }} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {sortAndGroupShortcuts(shortcuts, 'widget').length === 0 && (
                                <div className="text-center py-12" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                    暂无小组件
                                </div>
                            )}
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};