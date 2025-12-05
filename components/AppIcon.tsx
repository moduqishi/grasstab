import React, { useState, useEffect } from 'react';
import { Cpu, StickyNote, Calculator, Settings, Check, Edit3, AppWindow, Youtube, Github, Twitter, Sparkles, Mail, Code, LayoutGrid } from 'lucide-react';
import { getDomain } from '../utils';
import { Shortcut } from '../types';
import { ClockWidget, CalendarWidget, WeatherWidget, CustomHTMLWidget, IFrameWidget } from './widgets/SystemWidgets';

export const getDockIcon = (type: string, isEditing: boolean = false) => {
    switch (type) {
        case 'cpu': return <Cpu strokeWidth={1.5} />;
        case 'sticky-note': return <StickyNote strokeWidth={1.5} />;
        case 'calculator': return <Calculator strokeWidth={1.5} />;
        case 'settings': return <Settings strokeWidth={1.5} />;
        case 'edit': return isEditing ? <Check strokeWidth={2} /> : <Edit3 strokeWidth={1.5} />;
        default: return <AppWindow strokeWidth={1.5} />;
    }
};

export const AppIcon: React.FC<Shortcut> = (props) => {
    const { type, title, url, iconType, widgetType, widgetContent, size } = props;
    const [iconMode, setIconMode] = useState<'brand' | 'favicon' | 'text'>('brand'); 
    
    useEffect(() => { setIconMode('brand'); }, [url]);

    // --- WIDGET RENDERER ---
    if (type === 'widget') {
        const w = size?.w || 1;
        const h = size?.h || 1;

        return (
            <div className="w-full h-full bg-white text-black overflow-hidden">
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

    // 1. System/Vector Icons (Dock specific or Apps)
    if (iconType) {
        return <div className="w-full h-full flex items-center justify-center text-white drop-shadow-md">{getDockIcon(iconType)}</div>;
    }

    const renderVector = (children: React.ReactNode) => (
        <div className="w-full h-full flex items-center justify-center text-white drop-shadow-md">{children}</div>
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
            <img 
                src={`https://logo.clearbit.com/${domain}`} 
                alt={title} 
                className="w-full h-full object-cover select-none pointer-events-none" 
                onError={handleError} 
            />
        );
    }
    
    if (iconMode === 'favicon' && url) {
        const domain = getDomain(url);
        return (
            <img 
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`} 
                alt={title} 
                className="w-full h-full object-cover select-none pointer-events-none" 
                onError={handleError} 
            />
        );
    }

    // 4. Fallback Text Icon
    return renderVector(<span className="text-3xl font-bold truncate px-1 select-none">{title ? title.substring(0, 1).toUpperCase() : '?'}</span>);
};