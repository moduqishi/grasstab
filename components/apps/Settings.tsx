import React, { useRef, useState } from 'react';
import { DEFAULT_WALLPAPER } from '../../constants.tsx';
import { SystemSettings } from '../../types';
import { Monitor, Wallpaper, Search, MoreHorizontal, Database, Trash2, Edit3, Download, Upload, FileJson, Languages, FileEdit, ChevronRight, ArrowLeft, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { t } from '../../i18n';

interface SettingsAppProps {
    setWp: (url: string) => void;
    settings: SystemSettings;
    onUpdate: (s: SystemSettings) => void;
    onExport: () => void;
    onImport: (file: File) => void;
    onReset: () => void;
    onEditConfig?: () => void;
}

const WALLPAPERS = [
    DEFAULT_WALLPAPER,
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564",
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574",
    "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2670"
];

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
export const SettingsApp: React.FC<SettingsAppProps> = ({ setWp, settings, onUpdate, onExport, onImport, onReset, onEditConfig }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const wallpaperInputRef = useRef<HTMLInputElement>(null);
    const [showWallpaperMenu, setShowWallpaperMenu] = useState(false);
    const [customWallpaperUrl, setCustomWallpaperUrl] = useState('');
    const lang = settings.language || 'zh';

    const updateSetting = (key: keyof SystemSettings, value: boolean | string) => {
        onUpdate({ ...settings, [key]: value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImport(file);
        }
        // Reset input so same file can be selected again if needed
        if (e.target) e.target.value = '';
    };

    const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('请选择图片文件');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('图片大小不能超过 5MB');
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
                {!showWallpaperMenu ? (
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

                        {/* PERSONALIZATION SECTION */}
                        <SectionHeader title={t(lang, 'personalization')} />
                        <div className="mx-4 rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                            <SettingsItem icon={Wallpaper} label={t(lang, 'wallpapers')} onClick={() => setShowWallpaperMenu(true)} hasChevron isLast />
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
                ) : (
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
                )}
            </div>
        </div>
    );
};