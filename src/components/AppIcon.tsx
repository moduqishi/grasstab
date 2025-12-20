import React, { useState, useEffect } from 'react';
import { Cpu, StickyNote, Calculator, Settings, Check, Edit3, AppWindow, Youtube, Github, Twitter, Sparkles, Mail, Code, LayoutGrid, MessageCircle, ShoppingBag } from 'lucide-react';
import { getDomain, getAllIconUrls } from '../utils';
import { Shortcut } from '../types';
import { CustomHTMLWidget, IFrameWidget } from './widgets/Widgets';
import { AppContextMenu } from './AppContextMenu';
import { useInView } from '../hooks/useInView';

export const getDockIcon = (type: string, isEditing: boolean = false, color?: string) => {
    const iconSize = 48; // Increased size for transparent apps
    const strokeWidth = 2;
    
    const systemColors: Record<string, string> = {
        'ai-chat': '#3B82F6',
        'message-circle': '#3B82F6',
        'sticky-note': '#FACC15',
        'calculator': '#F97316',
        'settings': '#9CA3AF',
        'shopping-bag': '#EC4899'
    };

    const finalColor = color || systemColors[type] || 'currentColor';
    const props = { size: iconSize, strokeWidth, color: finalColor };
    
    switch (type) {
        case 'cpu': return <Cpu {...props} />; // Keep old for fallback
        case 'ai-chat': return <MessageCircle {...props} />; // New chat bubble icon
        case 'message-circle': return <MessageCircle {...props} />; 
        case 'sticky-note': return <StickyNote {...props} />;
        case 'calculator': return <Calculator {...props} />;
        case 'settings': return <Settings {...props} />;
        case 'shopping-bag': return <ShoppingBag {...props} />;
        case 'edit': return isEditing ? <Check size={40} strokeWidth={2.5} /> : <Edit3 size={40} strokeWidth={strokeWidth} />;
        default: return <AppWindow {...props} />;
    }
};

interface AppIconProps extends Shortcut {
    onContextMenu?: (e: React.MouseEvent, app: Shortcut) => void;
    onIconLoaded?: (iconSource: string) => void; // 图标加载成功后的回调
}

export const AppIcon = React.memo((props: AppIconProps) => {
    const { type, title, url, iconType, widgetType, widgetContent, size, customIcon, onContextMenu, onIconLoaded } = props;
    const [currentIconIndex, setCurrentIconIndex] = useState(0);
    const [iconSources, setIconSources] = useState<Array<{source: string, url: string, name: string}>>([]);
    const [iconLoadNotified, setIconLoadNotified] = useState(false);
    const [customIconError, setCustomIconError] = useState(false);
    
    // Only fetch/process icons when in view
    // Use a rootMargin of 200px to pre-load icons just before they scroll into view
    const { ref, inView } = useInView({ 
        triggerOnce: true, 
        rootMargin: '200px' 
    });

    useEffect(() => {
        // Delay URL processing until visible to avoid massive initial requests
        if (url && inView) {
            const sources = getAllIconUrls(url);
            setIconSources(sources);
            
            // 如果 iconType 是图标源名称，优先使用它
            const knownSources = ['iconhorse', 'logodev', 'unavatar', 'google', 'ddg', 'direct'];
            if (iconType && knownSources.includes(iconType)) {
                const preferredIndex = sources.findIndex(s => s.source === iconType);
                setCurrentIconIndex(preferredIndex >= 0 ? preferredIndex : 0);
            } else {
                setCurrentIconIndex(0);
            }
            setIconLoadNotified(false);
        }
    }, [url, iconType, inView]);

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
                className="w-full h-full bg-white text-black overflow-hidden relative pointer-events-auto"
                onContextMenu={handleContextMenu}
                data-app-icon
            >
                {/* Widget content with pointer-events-none for iframe to prevent capturing events */}
                <div className={widgetType === 'iframe' ? 'pointer-events-none w-full h-full' : 'w-full h-full'}>
                    {widgetType === 'custom' && <CustomHTMLWidget w={w} h={h} content={widgetContent} />}
                    {widgetType === 'iframe' && <IFrameWidget w={w} h={h} content={widgetContent} />}
                    {/* Fallback for unknown widget */}
                    {!widgetType && <div className="w-full h-full flex items-center justify-center text-gray-400"><LayoutGrid /></div>}
                </div>
                {/* Invisible overlay to capture events for iframe widgets */}
                {widgetType === 'iframe' && (
                    <div 
                        className="absolute inset-0 pointer-events-auto"
                        onContextMenu={handleContextMenu}
                    />
                )}
            </div>
        );
    }

    // --- APP ICON RENDERER ---

    // 0. Custom Icon (highest priority)
    // Even custom icons benefit from lazy loading via native loading="lazy", but we wrap in ref too.
    // If custom icon fails, we fall through to next methods
    if (customIcon && !customIconError) {
        return (
            <div ref={ref as any} onContextMenu={handleContextMenu} className="w-full h-full" data-app-icon>
                {inView && (
                    <img 
                        src={customIcon} 
                        alt={title} 
                        loading="lazy"
                        className="w-full h-full object-cover select-none pointer-events-none" 
                        onError={(e) => {
                            // If custom icon fails, trigger fallback to other methods
                            setCustomIconError(true);
                        }}
                    />
                )}
            </div>
        );
    }

    // 1. System/Vector Icons (Dock specific or Apps)
    // 只有系统应用的 iconType（cpu, sticky-note, calculator 等）才走这里
    const systemIconTypes = ['cpu', 'sticky-note', 'calculator', 'settings', 'edit', 'message-circle', 'ai-chat', 'shopping-bag'];
    if (iconType && systemIconTypes.includes(iconType)) {
        return (
            <div 
                className="w-full h-full flex items-center justify-center text-white drop-shadow-md"
                onContextMenu={handleContextMenu}
                data-app-icon
            >
                {getDockIcon(iconType, false, props.iconColor)}
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
        // Move to next icon source in priority list
        if (currentIconIndex < iconSources.length - 1) {
            setCurrentIconIndex(prev => prev + 1);
        }
    };

    // 3. Web Icons - Full Cover Style with fallback priority
    // Use `ref` on the container to detect visibility
    // Only render image if `inView` is true to avoid fetch
    if (url) {
        return (
            <div ref={ref as any} onContextMenu={handleContextMenu} className="w-full h-full" data-app-icon>
                {inView && iconSources.length > 0 && currentIconIndex < iconSources.length ? (
                    <img 
                        src={iconSources[currentIconIndex].url} 
                        alt={title} 
                        loading="lazy"
                        className="w-full h-full object-cover select-none pointer-events-none" 
                        onLoad={() => {
                            if (onIconLoaded && !iconLoadNotified) {
                                onIconLoaded(iconSources[currentIconIndex].source);
                                setIconLoadNotified(true);
                            }
                        }}
                        onError={handleError} 
                    />
                ) : inView ? (
                     // Fallback while loading sources or if all failed/not ready
                     // Optionally show a placeholder or the text fallback below temporarily
                     <div className="w-full h-full flex items-center justify-center text-white/50 bg-white/5">
                        <span className="text-xl font-bold">{title ? title.substring(0, 1).toUpperCase() : ''}</span>
                     </div>
                ) : null}
            </div>
        );
    }
    
    // 4. Fallback Text Icon (if no URL and no specific type)
    return renderVector(<span className="text-3xl font-bold truncate px-1 select-none">{title ? title.substring(0, 1).toUpperCase() : '?'}</span>);
});

AppIcon.displayName = 'AppIcon';