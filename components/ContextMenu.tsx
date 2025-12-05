import React from 'react';
import { Check, Edit3, Wallpaper, RefreshCw, Settings, Download, Upload, Info, Grid3x3, Monitor, Search, PanelBottom } from 'lucide-react';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onEdit: () => void;
    onChangeWallpaper: () => void;
    onReset: () => void;
    onOpenSettings: () => void;
    onExportConfig: () => void;
    onImportConfig: () => void;
    onToggleSearchBar: () => void;
    onTogglePagination: () => void;
    onToggleDock: () => void;
    isEditing: boolean;
    showSearchBar: boolean;
    showPagination: boolean;
    showDock: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ 
    x, y, onClose, onEdit, onChangeWallpaper, onReset, onOpenSettings,
    onExportConfig, onImportConfig, onToggleSearchBar, onTogglePagination, onToggleDock,
    isEditing, showSearchBar, showPagination, showDock
}) => {
    // Adjust position to keep menu on screen
    const menuWidth = 220;
    const menuHeight = 450;
    const adjustedX = Math.min(x, window.innerWidth - menuWidth - 10);
    const adjustedY = Math.min(y, window.innerHeight - menuHeight - 10);

    return (
        <div 
            className="fixed z-[10000] w-[220px] rounded-2xl overflow-hidden flex flex-col text-sm text-white animate-in fade-in zoom-in-95 duration-150 origin-top-left"
            style={{ 
                left: `${adjustedX}px`, 
                top: `${adjustedY}px`,
                backgroundColor: 'rgba(44, 44, 46, 0.95)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 0.5px rgba(255, 255, 255, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="px-4 py-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255, 255, 255, 0.5)', backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
                <Grid3x3 size={12} />
                Desktop Menu
            </div>

            {/* Edit Section */}
            <div className="py-1">
                <MenuItem 
                    icon={isEditing ? Check : Edit3}
                    label={isEditing ? 'Done Editing' : 'Edit Home Screen'}
                    onClick={() => { onEdit(); onClose(); }}
                    variant={isEditing ? 'primary' : 'default'}
                />
            </div>

            <Divider />

            {/* View Options */}
            <div className="py-1">
                <MenuLabel>View Options</MenuLabel>
                <MenuItemToggle
                    icon={Search}
                    label="Search Bar"
                    checked={showSearchBar}
                    onClick={() => { onToggleSearchBar(); onClose(); }}
                />
                <MenuItemToggle
                    icon={Grid3x3}
                    label="Page Indicators"
                    checked={showPagination}
                    onClick={() => { onTogglePagination(); onClose(); }}
                />
                <MenuItemToggle
                    icon={PanelBottom}
                    label="Dock Bar"
                    checked={showDock}
                    onClick={() => { onToggleDock(); onClose(); }}
                />
            </div>

            <Divider />

            {/* Personalization */}
            <div className="py-1">
                <MenuLabel>Personalization</MenuLabel>
                <MenuItem 
                    icon={Wallpaper}
                    label="Change Wallpaper"
                    onClick={() => { onChangeWallpaper(); onClose(); }}
                />
                <MenuItem 
                    icon={Settings}
                    label="System Settings"
                    onClick={() => { onOpenSettings(); onClose(); }}
                />
            </div>

            <Divider />

            {/* Configuration */}
            <div className="py-1">
                <MenuLabel>Configuration</MenuLabel>
                <MenuItem 
                    icon={Download}
                    label="Export Config"
                    onClick={() => { onExportConfig(); onClose(); }}
                />
                <MenuItem 
                    icon={Upload}
                    label="Import Config"
                    onClick={() => { onImportConfig(); onClose(); }}
                />
            </div>

            <Divider />

            {/* Danger Zone */}
            <div className="py-1">
                <MenuItem 
                    icon={RefreshCw}
                    label="Reset Layout"
                    onClick={() => { onReset(); onClose(); }}
                    variant="danger"
                />
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 flex items-center gap-2 text-xs" style={{ color: 'rgba(255, 255, 255, 0.3)', backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
                <Info size={10} />
                Right-click anywhere
            </div>
        </div>
    );
};

// Helper Components
const MenuItem: React.FC<{
    icon: any;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'danger';
    shortcut?: string;
}> = ({ icon: Icon, label, onClick, variant = 'default', shortcut }) => {
    const variantStyles = {
        default: 'hover:bg-white/10 text-white/90',
        primary: 'hover:bg-blue-600 text-blue-400 hover:text-white',
        danger: 'hover:bg-red-600/80 text-red-400 hover:text-white'
    };

    return (
        <button 
            onClick={onClick}
            className={`w-full px-4 py-2.5 flex items-center gap-3 transition-all text-left group ${variantStyles[variant]}`}
        >
            <Icon size={16} className="shrink-0" />
            <span className="flex-1 font-medium">{label}</span>
            {shortcut && <span className="text-xs opacity-50">{shortcut}</span>}
        </button>
    );
};

const MenuItemToggle: React.FC<{
    icon: any;
    label: string;
    checked: boolean;
    onClick: () => void;
}> = ({ icon: Icon, label, checked, onClick }) => (
    <button 
        onClick={onClick}
        className="w-full px-4 py-2.5 flex items-center gap-3 transition-all text-left hover:bg-white/10 text-white/90 group"
    >
        <Icon size={16} className="shrink-0" />
        <span className="flex-1 font-medium">{label}</span>
        <div className={`w-9 h-5 rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-white/20'} relative`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${checked ? 'left-[18px]' : 'left-0.5'}`} />
        </div>
    </button>
);

const MenuLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="px-4 py-1.5 text-xs font-semibold text-white/40 uppercase tracking-wider">
        {children}
    </div>
);

const Divider = () => <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />;