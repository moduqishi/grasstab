export type WidgetType = 'clock' | 'weather' | 'calendar' | 'custom' | 'iframe';

export interface Shortcut {
    id: number | string;
    title?: string;
    displayName?: string; // 显示名称
    url?: string;
    type: 'github' | 'bilibili' | 'youtube' | 'chatgpt' | 'code' | 'twitter' | 'gmail' | 'sys' | 'auto' | 'widget';
    color: string;
    isApp?: boolean;
    isAdd?: boolean; // UI helper
    iconType?: string; // For dock mapping
    customIcon?: string; // Custom icon URL or base64 data
    hidden?: boolean; // 是否隐藏（用于系统应用）
    
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
    displayName?: string; // 显示名称
    iconType: string; // Identifier for the Lucide icon
}

export interface WindowState {
    id: string;
    type: 'calc' | 'notes' | 'ai' | 'settings' | 'add' | 'web' | 'edit' | 'configEditor';
    title: string;
    isOpen: boolean;
    isMaximized?: boolean; // Lifted state
    z: number;
    w: number;
    h: number;
    url?: string;
    editData?: Shortcut; // For edit window
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
    language: 'zh' | 'en';
    searchEngine?: SearchEngineKey;
    gridCols?: number;
    gridRows?: number;
    hiddenSystemApps?: string[]; // 隐藏的系统应用ID列表
}

export interface GlobalConfig {
    version: string;
    createdAt: string;
    settings: SystemSettings;
    wallpaper: string;
    shortcuts: Shortcut[];
    dockItems: DockItem[];
}