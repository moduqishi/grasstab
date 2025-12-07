export const translations = {
    zh: {
        // Settings
        settings: '设置',
        interfaceLayout: '界面与布局',
        personalization: '个性化',
        dataManagement: '数据管理',
        language: '语言',
        
        // Interface Options
        showDockBar: '显示 Dock 栏',
        showDockEditButton: '显示 Dock 编辑按钮',
        desktopSearchBar: '桌面搜索栏',
        paginationDots: '分页指示器',
        
        // Language Options
        chinese: '中文',
        english: 'English',
        
        // Wallpapers
        wallpapers: '壁纸',
        
        // Data Management
        exportConfig: '导出配置',
        importConfig: '导入配置',
        editConfig: '编辑配置',
        resetToDefault: '恢复默认',
        
        // Window Titles
        calculator: '计算器',
        notes: '便签',
        ai: 'AI 助手',
        addShortcut: '添加应用',
        editApp: '编辑应用',
        
        // Edit App
        name: '名称',
        linkAddress: '链接地址',
        embedLink: '嵌入链接',
        customIcon: '自定义图标',
        iconUrl: '图标 URL',
        uploadIcon: '上传',
        clearIcon: '清除',
        openInWindow: '窗口模式打开',
        widgetType: '小组件类型',
        widgetSize: '小组件尺寸',
        width: '宽度',
        height: '高度',
        htmlCode: 'HTML 代码',
        save: '保存',
        
        // Widget Types
        clock: '时钟',
        calendar: '日历',
        weather: '天气',
        customHtml: '自定义 HTML',
        embedWebpage: '嵌入网页',
        
        // Placeholders
        enterAppName: '输入应用名称',
        enterWidgetName: '输入小组件名称',
        enterUrl: 'https://',
        pasteIconUrl: '粘贴图标 URL',
        pasteOrEnterHtml: '输入或粘贴 HTML 代码...',
        
        // Context Menu
        addWidget: '添加小组件',
        addApp: '添加应用',
        edit: '编辑',
        delete: '删除',
        
        // Confirm
        confirmDelete: '确定要删除',
        thisApp: '吗？',
        
        // Add Shortcut
        appName: '应用名称',
        appUrl: '应用链接',
        
        // Search
        searchPlaceholder: '搜索...',
        
        // Common
        preview: '预览',
        enableWindowMode: '启用窗口模式',
        disableWindowMode: '禁用窗口模式',
        toggleWindowMode: '切换窗口模式',
        selectWidgetType: '选择小组件类型',
        setWidth: '设置宽度',
        setHeight: '设置高度',
        uploadCustomIcon: '上传自定义图标',
        importConfigFile: '导入配置文件'
    },
    en: {
        // Settings
        settings: 'Settings',
        interfaceLayout: 'Interface & Layout',
        personalization: 'Personalization',
        dataManagement: 'Data Management',
        language: 'Language',
        
        // Interface Options
        showDockBar: 'Show Dock Bar',
        showDockEditButton: 'Show Dock Edit Button',
        desktopSearchBar: 'Desktop Search Bar',
        paginationDots: 'Pagination Dots',
        
        // Language Options
        chinese: '中文',
        english: 'English',
        
        // Wallpapers
        wallpapers: 'Wallpapers',
        
        // Data Management
        exportConfig: 'Export Config',
        importConfig: 'Import Config',
        editConfig: 'Edit Config',
        resetToDefault: 'Reset to Default',
        
        // Window Titles
        calculator: 'Calculator',
        notes: 'Notes',
        ai: 'AI Assistant',
        addShortcut: 'Add Shortcut',
        editApp: 'Edit App',
        
        // Edit App
        name: 'Name',
        linkAddress: 'Link Address',
        embedLink: 'Embed Link',
        customIcon: 'Custom Icon',
        iconUrl: 'Icon URL',
        uploadIcon: 'Upload',
        clearIcon: 'Clear',
        openInWindow: 'Open in Window Mode',
        widgetType: 'Widget Type',
        widgetSize: 'Widget Size',
        width: 'Width',
        height: 'Height',
        htmlCode: 'HTML Code',
        save: 'Save',
        
        // Widget Types
        clock: 'Clock',
        calendar: 'Calendar',
        weather: 'Weather',
        customHtml: 'Custom HTML',
        embedWebpage: 'Embed Webpage',
        
        // Placeholders
        enterAppName: 'Enter app name',
        enterWidgetName: 'Enter widget name',
        enterUrl: 'https://',
        pasteIconUrl: 'Paste icon URL',
        pasteOrEnterHtml: 'Enter or paste HTML code...',
        
        // Context Menu
        addWidget: 'Add Widget',
        addApp: 'Add App',
        edit: 'Edit',
        delete: 'Delete',
        
        // Confirm
        confirmDelete: 'Are you sure to delete',
        thisApp: '?',
        
        // Add Shortcut
        appName: 'App Name',
        appUrl: 'App URL',
        
        // Search
        searchPlaceholder: 'Search...',
        
        // Common
        preview: 'Preview',
        enableWindowMode: 'Enable window mode',
        disableWindowMode: 'Disable window mode',
        toggleWindowMode: 'Toggle window mode',
        selectWidgetType: 'Select widget type',
        setWidth: 'Set width',
        setHeight: 'Set height',
        uploadCustomIcon: 'Upload custom icon',
        importConfigFile: 'Import configuration file'
    }
};

export type Language = 'zh' | 'en';

export const t = (lang: Language, key: keyof typeof translations.zh): string => {
    return translations[lang][key] || translations.zh[key] || key;
};
