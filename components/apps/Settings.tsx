import React, { useRef } from 'react';
import { DEFAULT_WALLPAPER } from '../../constants.tsx';
import { SystemSettings } from '../../types';
import { Monitor, Wallpaper, Search, MoreHorizontal, Database, Trash2, Edit3, Download, Upload, FileJson, Languages } from 'lucide-react';
import { t } from '../../i18n';

interface SettingsAppProps {
    setWp: (url: string) => void;
    settings: SystemSettings;
    onUpdate: (s: SystemSettings) => void;
    onExport: () => void;
    onImport: (file: File) => void;
    onReset: () => void;
}

const WALLPAPERS = [
    DEFAULT_WALLPAPER,
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564",
    "https://images.unsplash.com/photo-1534796636912-3b95b3ab5980?q=80&w=2672",
    "https://images.unsplash.com/photo-1519681393798-38e43269d877?q=80&w=2670",
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

const SettingsItem = ({ icon: Icon, label, children, isLast }: { icon: any, label: string, children: React.ReactNode, isLast?: boolean }) => (
    <div
        className="flex items-center justify-between p-4"
        style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderBottom: isLast ? 'none' : '0.5px solid rgba(255, 255, 255, 0.08)'
        }}
    >
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.7)' }}>
                <Icon size={18} />
            </div>
            <span className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{label}</span>
        </div>
        <div>
            {children}
        </div>
    </div>
);

export const SettingsApp: React.FC<SettingsAppProps> = ({ setWp, settings, onUpdate, onExport, onImport, onReset }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
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

    return (
        <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: 'rgba(30, 30, 30, 0.3)' }}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".yaml,.yml,.json"
                aria-label="Import configuration file"
                title="Import configuration file"
            />

            <div className="flex-1 overflow-y-auto">
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

                {/* LANGUAGE SECTION */}
                <SectionHeader title={t(lang, 'language')} />
                <div className="mx-4 rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <SettingsItem icon={Languages} label={t(lang, 'language')}>
                        <select
                            value={settings.language || 'zh'}
                            onChange={(e) => updateSetting('language', e.target.value)}
                            className="px-3 py-1.5 rounded-lg outline-none cursor-pointer appearance-none"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: 'rgba(255, 255, 255, 0.9)',
                                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'rgba(255,255,255,0.5)\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 8px center',
                                paddingRight: '28px'
                            }}
                            aria-label={t(lang, 'language')}
                            title={t(lang, 'language')}
                        >
                            <option value="zh" style={{ backgroundColor: '#2a2a2a', color: '#fff', padding: '8px' }}>{t(lang, 'chinese')}</option>
                            <option value="en" style={{ backgroundColor: '#2a2a2a', color: '#fff', padding: '8px' }}>{t(lang, 'english')}</option>
                        </select>
                    </SettingsItem>
                </div>

                {/* WALLPAPER SECTION */}
                <SectionHeader title={t(lang, 'personalization')} />
                <div className="mx-4 p-4 bg-white dark:bg-[#2c2c2e] rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Wallpaper size={16} className="text-gray-500" />
                        <span className="text-sm font-semibold text-gray-500">{t(lang, 'wallpapers')}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {WALLPAPERS.map((w, i) => (
                            <div key={i} onClick={() => setWp(w)} className="aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-[#0A84FF] transition-all shadow-sm group relative">
                                <img src={w} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={`Wallpaper ${i}`} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* DATA SECTION */}
                <SectionHeader title={t(lang, 'dataManagement')} />
                <div className="mx-4 rounded-xl overflow-hidden shadow-sm mb-8">
                    <div
                        onClick={onExport}
                        className="flex items-center gap-3 p-4 bg-white dark:bg-[#2c2c2e] cursor-pointer active:bg-gray-100 dark:active:bg-gray-700 transition-colors border-b border-gray-100 dark:border-white/5"
                    >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Download size={18} />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{t(lang, 'exportConfig')}</span>
                    </div>

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-3 p-4 bg-white dark:bg-[#2c2c2e] cursor-pointer active:bg-gray-100 dark:active:bg-gray-700 transition-colors border-b border-gray-100 dark:border-white/5"
                    >
                        <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                            <Upload size={18} />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{t(lang, 'importConfig')}</span>
                    </div>

                    <div
                        onClick={onReset}
                        className="flex items-center gap-3 p-4 bg-white dark:bg-[#2c2c2e] cursor-pointer active:bg-gray-100 dark:active:bg-gray-700 transition-colors text-red-500"
                    >
                        <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500">
                            <Trash2 size={18} />
                        </div>
                        <span className="text-sm font-medium">{t(lang, 'resetToDefault')}</span>
                    </div>
                </div>

            </div>
        </div>
    );
};