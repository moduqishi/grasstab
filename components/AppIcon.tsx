import React, { useState, useEffect } from 'react';
import { Cpu, StickyNote, Calculator, Settings, Check, Edit3, AppWindow, Youtube, Github, Twitter, Sparkles, Mail, Code, LayoutGrid } from 'lucide-react';
import { getDomain } from '../utils';
import { Shortcut } from '../types';
import { ClockWidget, CalendarWidget, WeatherWidget, CustomHTMLWidget, IFrameWidget } from './widgets/SystemWidgets';
import { AppContextMenu } from './AppContextMenu';

export const getDockIcon = (type: string, isEditing: boolean = false) => {
    const iconSize = 40;
    const strokeWidth = 2;
    
    switch (type) {
        case 'cpu': return <Cpu size={iconSize} strokeWidth={strokeWidth} />;
        case 'sticky-note': return <StickyNote size={iconSize} strokeWidth={strokeWidth} />;
        case 'calculator': return <Calculator size={iconSize} strokeWidth={strokeWidth} />;
        case 'settings': return <Settings size={iconSize} strokeWidth={strokeWidth} />;
        case 'edit': return isEditing ? <Check size={iconSize} strokeWidth={2.5} /> : <Edit3 size={iconSize} strokeWidth={strokeWidth} />;
        default: return <AppWindow size={iconSize} strokeWidth={strokeWidth} />;
    }
};

interface AppIconProps extends Shortcut {
    onContextMenu?: (e: React.MouseEvent, app: Shortcut) => void;
}

export const AppIcon: React.FC<AppIconProps> = (props) => {
    const { type, title, url, iconType, widgetType, widgetContent, size, customIcon, onContextMenu } = props;
    const [iconMode, setIconMode] = useState<'brand' | 'favicon' | 'text'>('brand'); 
    
    useEffect(() => { setIconMode('brand'); }, [url]);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onContextMenu) {
            onContextMenu(e, props);
        }
    };

    // --- WIDGET RENDERER ---
    if (type === 'widget') {
        const w = size?.w || 1;
        const h = size?.h || 1;

        return (
            <div 
                className="w-full h-full bg-white text-black overflow-hidden"
                onContextMenu={handleContextMenu}
                data-app-icon
            >
                {widgetType === 'clock' && <ClockWidget w={w} h={h} />}
                {widgetType === 'calendar' && <CalendarWidget w={w} h={h} />}
                {widgetType === 'weather' && <WeatherWidget w={w} h={h} />}
                {widgetType === 'custom' && <CustomHTMLWidget w={w} h={h} content={widgetContent} />}
                {widgetType === 'iframe' && <IFrameWidget w={w} h={h} content={widgetContent} />}
                {/* Fallback for unknown widget */}
                {!widgetType && <div className="w-full h-full flex items-center justify-center text-gray-400"><LayoutGrid /></div>}
            </div>
        );
    }

    // --- APP ICON RENDERER ---

    // 0. Custom Icon (highest priority)
    if (customIcon) {
        return (
            <div onContextMenu={handleContextMenu} className="w-full h-full" data-app-icon>
                <img 
                    src={customIcon} 
                    alt={title} 
                    className="w-full h-full object-cover select-none pointer-events-none" 
                    onError={(e) => {
                        // If custom icon fails to load, fall through to other methods
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
            </div>
        );
    }

    // 1. System/Vector Icons (Dock specific or Apps)
    if (iconType) {
        return (
            <div 
                className="w-full h-full flex items-center justify-center text-white drop-shadow-md"
                onContextMenu={handleContextMenu}
                data-app-icon
            >
                {getDockIcon(iconType)}
            </div>
        );
    }

    const renderVector = (children: React.ReactNode) => (
        <div 
            className="w-full h-full flex items-center justify-center text-white drop-shadow-md"
            onContextMenu={handleContextMenu}
            data-app-icon
        >
            {children}
        </div>
    );

    // 2. Specific App Type Overrides
    switch (type) {
        case 'bilibili': return renderVector(<span className="text-3xl font-bold">B</span>);
        case 'youtube': return renderVector(<Youtube size={34} strokeWidth={2} />);
        case 'github': return renderVector(<Github size={34} />);
        case 'twitter': return renderVector(<Twitter size={34} fill="currentColor" />);
        case 'chatgpt': return renderVector(<Sparkles size={34} />);
        case 'gmail': return renderVector(<Mail size={34} />);
        case 'code': return renderVector(<Code size={34} />);
        case 'sys': return renderVector(<AppWindow size={34} />);
        default: 
            if (title && title.includes('Gitee')) return renderVector(<span className="text-3xl font-bold tracking-tighter">G</span>);
            if (title && title.includes('LeetCode')) return renderVector(<Code size={34} strokeWidth={2.5} />);
            break;
    }

    const handleError = () => {
        if (iconMode === 'brand') setIconMode('favicon');
        else if (iconMode === 'favicon') setIconMode('text');
    };

    // 3. Web Icons - Full Cover Style
    if (iconMode === 'brand' && url) {
        const domain = getDomain(url);
        return (
            <div onContextMenu={handleContextMenu} className="w-full h-full" data-app-icon>
                <img 
                    src={`https://logo.clearbit.com/${domain}`} 
                    alt={title} 
                    className="w-full h-full object-cover select-none pointer-events-none" 
                    onError={handleError} 
                />
            </div>
        );
    }
    
    if (iconMode === 'favicon' && url) {
        const domain = getDomain(url);
        return (
            <div onContextMenu={handleContextMenu} className="w-full h-full" data-app-icon>
                <img 
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`} 
                    alt={title} 
                    className="w-full h-full object-cover select-none pointer-events-none" 
                    onError={handleError} 
                />
            </div>
        );
    }

    // 4. Fallback Text Icon
    return renderVector(<span className="text-3xl font-bold truncate px-1 select-none">{title ? title.substring(0, 1).toUpperCase() : '?'}</span>);
};