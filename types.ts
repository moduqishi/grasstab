export type WidgetType = 'clock' | 'weather' | 'calendar' | 'custom' | 'iframe';

export interface Shortcut {
    id: number | string;
    title?: string;
    url?: string;
    type: 'github' | 'bilibili' | 'youtube' | 'chatgpt' | 'code' | 'twitter' | 'gmail' | 'sys' | 'auto' | 'widget';
    color: string;
    isApp?: boolean;
    isAdd?: boolean; // UI helper
    iconType?: string; // For dock mapping
    
    // Widget Properties
    size?: { w: number, h: number };
    widgetType?: WidgetType;
    widgetContent?: string;
}

export interface PackedShortcut extends Shortcut {
    x: number;
    y: number;
    page: number;
}

export interface DockItem extends Shortcut {
    name?: string;
    iconType: string; // Identifier for the Lucide icon
}

export interface WindowState {
    id: string;
    type: 'calc' | 'notes' | 'ai' | 'settings' | 'add' | 'web';
    title: string;
    isOpen: boolean;
    isMaximized?: boolean; // Lifted state
    z: number;
    w: number;
    h: number;
    url?: string;
}

export interface DragState {
    isDragging: boolean;
    source: 'grid' | 'dock' | null;
    index: number;
    item: Shortcut | DockItem | null;
    mx: number;
    my: number;
}

export type SearchEngineKey = 'google' | 'bing' | 'baidu';

export interface LayoutConfig {
    cols: number;
    rows: number;
    itemsPerPage: number;
    isMobile: boolean;
    cellWidth: number;
    cellHeight: number;
    gridWidth: number;
}

export interface SystemSettings {
    showDockEdit: boolean;
    showSearchBar: boolean;
    showPagination: boolean;
    showDock: boolean;
}

export interface GlobalConfig {
    version: string;
    createdAt: string;
    settings: SystemSettings;
    wallpaper: string;
    shortcuts: Shortcut[];
    dockItems: DockItem[];
}