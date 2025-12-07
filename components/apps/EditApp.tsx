import React, { useState, useEffect } from 'react';
import { Upload, Link as LinkIcon, Monitor, Maximize2, Code, Globe } from 'lucide-react';
import { Shortcut, WidgetType } from '../../types';
import { t, Language } from '../../i18n';
import { IconSelector } from '../IconSelector';

interface EditAppProps {
    app: Shortcut;
    onSave: (updated: Shortcut) => void;
    language?: Language;
}

export const EditApp: React.FC<EditAppProps> = ({ app, onSave, language = 'zh' }) => {
    const isWidget = app.type === 'widget';
    const lang = language;
    
    const [title, setTitle] = useState(app.title || '');
    const [url, setUrl] = useState(app.url || '');
    const [customIcon, setCustomIcon] = useState(app.customIcon || '');
    const [selectedIconUrl, setSelectedIconUrl] = useState('');
    const [iconPreview, setIconPreview] = useState(app.customIcon || '');
    const [isWindowMode, setIsWindowMode] = useState(app.isApp || false);
    
    // Widget-specific states
    const [widgetType, setWidgetType] = useState<WidgetType>(app.widgetType || 'clock');
    const [widgetWidth, setWidgetWidth] = useState(app.size?.w || 2);
    const [widgetHeight, setWidgetHeight] = useState(app.size?.h || 2);
    const [widgetContent, setWidgetContent] = useState(app.widgetContent || '');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('图标文件大小不能超过 2MB');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('请上传图片文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setCustomIcon(base64);
            setIconPreview(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleIconUrlChange = (value: string) => {
        setCustomIcon(value);
        setIconPreview(value);
    };

    const handleSave = () => {
        // 优先使用选中的图标URL,其次是自定义图标
        const finalIcon = selectedIconUrl || customIcon || undefined;
        
        const updated: Shortcut = {
            ...app,
            title,
            url,
            customIcon: finalIcon,
            isApp: isWidget ? app.isApp : isWindowMode,
        };

        if (isWidget) {
            updated.widgetType = widgetType;
            updated.size = { w: widgetWidth, h: widgetHeight };
            updated.widgetContent = widgetContent;
        }

        onSave(updated);
    };

    return (
        <div className="w-full h-full relative flex flex-col">
            {/* Content - with padding bottom for fixed footer */}
            <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-5" onWheel={(e) => e.stopPropagation()}>
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{t(lang, 'name')}</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg outline-none transition-all"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: 'rgba(255, 255, 255, 0.9)'
                            }}
                            placeholder={isWidget ? t(lang, 'enterWidgetName') : t(lang, 'enterAppName')}
                        />
                    </div>

                    {/* URL (only for apps and iframe widgets) */}
                    {(!isWidget || widgetType === 'iframe') && (
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                {isWidget ? t(lang, 'embedLink') : t(lang, 'linkAddress')}
                            </label>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg outline-none transition-all"
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'rgba(255, 255, 255, 0.9)'
                                }}
                                placeholder={isWidget ? "https://example.com" : t(lang, 'enterUrl')}
                            />
                        </div>
                    )}

                    {/* Icon Selector (only for apps) */}
                    {!isWidget && url && (
                        <div>
                            <IconSelector
                                url={url}
                                currentIcon={selectedIconUrl || customIcon}
                                onSelect={(iconUrl) => {
                                    setSelectedIconUrl(iconUrl);
                                    setIconPreview(iconUrl);
                                }}
                                onCustom={(icon) => {
                                    setCustomIcon(icon);
                                    setIconPreview(icon);
                                    setSelectedIconUrl(''); // 清除选中的图标URL
                                }}
                            />
                        </div>
                    )}

                    {/* Window Mode (only for apps) */}
                    {!isWidget && (
                        <div 
                            className="flex items-center justify-between p-4 rounded-lg"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                        >
                            <div className="flex items-center gap-3">
                                <Monitor size={20} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                                <span className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>窗口模式打开</span>
                            </div>
                            <button
                                onClick={() => setIsWindowMode(!isWindowMode)}
                                className={`relative w-12 h-6 rounded-full transition-colors`}
                                style={{ backgroundColor: isWindowMode ? '#34C759' : 'rgba(255, 255, 255, 0.2)' }}
                                aria-label="切换窗口模式"
                                title={isWindowMode ? "禁用窗口模式" : "启用窗口模式"}
                            >
                                <div 
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform`}
                                    style={{ transform: isWindowMode ? 'translateX(24px)' : 'translateX(0)' }}
                                />
                            </button>
                        </div>
                    )}

                    {/* Widget Type Selector */}
                    {isWidget && (
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>小组件类型</label>
                            <select
                                value={widgetType}
                                onChange={(e) => setWidgetType(e.target.value as WidgetType)}
                                className="w-full px-4 py-2.5 rounded-lg outline-none transition-all cursor-pointer appearance-none"
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'rgba(255,255,255,0.5)\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 12px center',
                                    paddingRight: '36px'
                                }}
                                title="选择小组件类型"
                                aria-label="小组件类型选择器"
                            >
                                <option value="clock" style={{ backgroundColor: '#2a2a2a', color: '#fff', padding: '8px' }}>时钟</option>
                                <option value="calendar" style={{ backgroundColor: '#2a2a2a', color: '#fff', padding: '8px' }}>日历</option>
                                <option value="weather" style={{ backgroundColor: '#2a2a2a', color: '#fff', padding: '8px' }}>天气</option>
                                <option value="custom" style={{ backgroundColor: '#2a2a2a', color: '#fff', padding: '8px' }}>自定义 HTML</option>
                                <option value="iframe" style={{ backgroundColor: '#2a2a2a', color: '#fff', padding: '8px' }}>嵌入网页</option>
                            </select>
                        </div>
                    )}

                    {/* Widget Size */}
                    {isWidget && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    <Maximize2 size={16} />
                                    宽度
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="6"
                                    value={widgetWidth}
                                    onChange={(e) => setWidgetWidth(Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))}
                                    className="w-full px-4 py-2.5 rounded-lg outline-none transition-all"
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: 'rgba(255, 255, 255, 0.9)'
                                    }}
                                    title="设置宽度"
                                    aria-label="小组件宽度"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    <Maximize2 size={16} className="rotate-90" />
                                    高度
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="6"
                                    value={widgetHeight}
                                    onChange={(e) => setWidgetHeight(Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))}
                                    className="w-full px-4 py-2.5 rounded-lg outline-none transition-all"
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: 'rgba(255, 255, 255, 0.9)'
                                    }}
                                    title="设置高度"
                                    aria-label="小组件高度"
                                />
                            </div>
                        </div>
                    )}

                    {/* Widget Content (for custom HTML) */}
                    {isWidget && widgetType === 'custom' && (
                        <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                <Code size={16} />
                                HTML 代码
                            </label>
                            <textarea
                                value={widgetContent}
                                onChange={(e) => setWidgetContent(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg outline-none transition-all font-mono text-sm"
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'rgba(255, 255, 255, 0.9)'
                                }}
                                rows={6}
                                placeholder="<div>自定义 HTML 内容</div>"
                            />
                        </div>
                    )}

                    {/* Widget Content (for iframe) */}
                    {isWidget && widgetType === 'iframe' && (
                        <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                <Globe size={16} />
                                嵌入链接
                            </label>
                            <input
                                type="text"
                                value={widgetContent}
                                onChange={(e) => setWidgetContent(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg outline-none transition-all"
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'rgba(255, 255, 255, 0.9)'
                                }}
                                placeholder="https://example.com"
                            />
                        </div>
                    )}
                </div>

            {/* Footer - Apple Style */}
            <div 
                className="absolute bottom-0 left-0 right-0 px-6 py-4 flex justify-end"
                style={{
                    background: 'linear-gradient(to top, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    borderTop: '0.5px solid rgba(255, 255, 255, 0.1)'
                }}
            >
                <button
                    onClick={handleSave}
                    className="px-6 py-2.5 rounded-lg transition-all font-medium hover:brightness-110 active:scale-95"
                    style={{
                        backgroundColor: '#007AFF',
                        color: 'white',
                        boxShadow: '0 2px 8px rgba(0, 122, 255, 0.4)'
                    }}
                >
                    保存
                </button>
            </div>
        </div>
    );
};

