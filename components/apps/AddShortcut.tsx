import React, { useState, useRef, useEffect } from 'react';
import { useDialog } from '../Dialog';
import { Plus, AppWindow, LayoutGrid, Clock, Calendar, CloudSun, Code, Monitor, Upload, Image as ImageIcon, Check, X, Link, Maximize2, Sparkles } from 'lucide-react';
import { Shortcut, WidgetType } from '../../types';
import { IconSelector } from '../IconSelector';
import { fetchPageTitle } from '../../utils';

interface AddShortcutProps {
    onAdd: (data: Partial<Shortcut>) => void;
    onClose: () => void;
}

const WIDGET_TYPES: { type: WidgetType, label: string, icon: any, desc: string }[] = [
    { type: 'clock', label: '时钟', icon: Clock, desc: '精美的模拟时钟' },
    { type: 'calendar', label: '日历', icon: Calendar, desc: '当前日期显示' },
    { type: 'weather', label: '天气', icon: CloudSun, desc: '天气信息卡片' },
    { type: 'custom', label: '自定义 HTML', icon: Code, desc: '嵌入自定义代码' },
    { type: 'iframe', label: '网页嵌入', icon: Monitor, desc: '嵌入外部网页' },
];

export const AddShortcutApp: React.FC<AddShortcutProps> = ({ onAdd, onClose }) => {
    const dialog = useDialog();
    const [mode, setMode] = useState<'app' | 'widget'>('app');
    
    // App State
    const [t, setT] = useState(''); 
    const [u, setU] = useState(''); 
    const [isA, setIsA] = useState(false);
    const [customIcon, setCustomIcon] = useState('');
    const [selectedIconUrl, setSelectedIconUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const hasFetchedTitle = useRef(false); // 只获取一次
    const [isFetchingTitle, setIsFetchingTitle] = useState(false);

    // Widget State
    const [wType, setWType] = useState<WidgetType>('clock');
    const [wWidth, setWWidth] = useState(2);
    const [wHeight, setWHeight] = useState(2);
    const [wContent, setWContent] = useState('');

    // Auto-fetch title when URL changes and title is empty
    useEffect(() => {
        const fetchTitle = async () => {
            let processedUrl = u.trim();
            
            // 只在URL有效时获取标题
            if (processedUrl && !t && !hasFetchedTitle.current && processedUrl.match(/^https?:\/\/.+/)) {
                setIsFetchingTitle(true);
                hasFetchedTitle.current = true;
                
                try {
                    const title = await fetchPageTitle(processedUrl);
                    if (title && !t) {
                        // 处理标题：只保留 - 前面的部分
                        const cleanTitle = title.split(' - ')[0].split(' – ')[0].split('|')[0].trim();
                        setT(cleanTitle);
                    }
                } catch (e) {
                    console.warn('Failed to fetch title:', e);
                } finally {
                    setIsFetchingTitle(false);
                }
            }
        };

        // 防抖：延迟执行
        const timer = setTimeout(fetchTitle, 800);
        return () => clearTimeout(timer);
    }, [u]);

    // 当用户手动输入标题时，不再自动获取
    const handleTitleChange = (value: string) => {
        setT(value);
        if (value) {
            hasFetchedTitle.current = true; // 用户输入了，不要再自动获取
        }
    };

    // URL 输入框失去焦点时处理
    const handleUrlBlur = () => {
        let processedUrl = u.trim();
        if (!processedUrl) return;
        
        // 替换中文句号为英文句号
        processedUrl = processedUrl.replace(/。/g, '.');
        
        // 自动添加 https:// 协议
        if (!processedUrl.match(/^https?:\/\//i)) {
            processedUrl = 'https://' + processedUrl;
        }
        
        setU(processedUrl);
    };

    // Handle icon file upload
    const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file type
            if (!file.type.startsWith('image/')) {
                dialog.showAlert('Please select an image file');
                return;
            }
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                dialog.showAlert('Image size must be less than 2MB');
                return;
            }
            // Convert to base64
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                setCustomIcon(base64);
            };
            reader.readAsDataURL(file);
        }
        // Reset input
        if (e.target) e.target.value = '';
    };
    const handleSubmit = () => {
        if (mode === 'app') {
            if(t && u) {
                // 优先使用选中的图标URL,其次是自定义图标
                const finalIcon = selectedIconUrl || customIcon || undefined;
                onAdd({ title: t, url: u, isApp: isA, type: 'auto', size: {w:1, h:1}, customIcon: finalIcon });
                onClose();
            }
        } else {
            onAdd({ 
                title: wType.charAt(0).toUpperCase() + wType.slice(1), 
                type: 'widget', 
                widgetType: wType, 
                widgetContent: wContent, 
                size: { w: wWidth, h: wHeight },
                color: 'from-white to-gray-100' // Default light theme for widgets
            });
            onClose();
        }
    };

    const canSubmit = mode === 'app' ? (t.trim() && u.trim()) : true;

    return (
        <div
            className="flex flex-col h-full text-white"
            onWheel={(e) => e.stopPropagation()} // 阻止滚轮事件冒泡到主界面
            onClick={(e) => e.stopPropagation()} // 阻止点击事件冒泡
        >
            {/* Segmented Control - Dark Mode */}
            <div className="p-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <div className="relative flex rounded-xl p-1" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <button 
                        onClick={() => setMode('app')} 
                        className="relative flex-1 py-2 px-4 text-sm font-medium transition-all duration-200 rounded-lg z-10"
                        style={{ color: mode === 'app' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.5)' }}
                    >
                        <div className="flex items-center justify-center gap-1.5">
                            <AppWindow size={16} />
                            <span>应用</span>
                        </div>
                    </button>
                    <button 
                        onClick={() => setMode('widget')} 
                        className="relative flex-1 py-2 px-4 text-sm font-medium transition-all duration-200 rounded-lg z-10"
                        style={{ color: mode === 'widget' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.5)' }}
                    >
                        <div className="flex items-center justify-center gap-1.5">
                            <LayoutGrid size={16} />
                            <span>小组件</span>
                        </div>
                    </button>
                    {/* Sliding background */}
                    <div 
                        className="absolute top-1 h-[calc(100%-8px)] rounded-lg shadow-sm transition-all duration-200 ease-out"
                        style={{
                            left: mode === 'app' ? '4px' : 'calc(50% - 4px)',
                            width: 'calc(50% - 4px)',
                            backgroundColor: 'rgba(255, 255, 255, 0.15)'
                        }}
                    />
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto apple-scrollbar relative" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }} onWheel={(e) => e.stopPropagation()}>
                <div className="p-6 space-y-5">{mode === 'app' ? (
                    // ===== APP MODE =====
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold px-1 flex items-center gap-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                <span>应用名称</span>
                                {isFetchingTitle && (
                                    <span className="inline-flex items-center">
                                        <Sparkles className="w-3.5 h-3.5 animate-pulse" style={{ color: '#fbbf24' }} />
                                    </span>
                                )}
                            </label>
                            <input 
                                className="w-full px-4 py-2.5 rounded-lg outline-none transition-all" 
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'rgba(255, 255, 255, 0.9)'
                                }}
                                value={t} 
                                onChange={e => handleTitleChange(e.target.value)} 
                                placeholder="留空将自动填充" 
                                autoFocus
                            />
                        </div>
                        
                        {/* URL Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold px-1" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                链接地址
                            </label>
                            <input 
                                className="w-full px-4 py-2.5 rounded-lg outline-none transition-all"
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'rgba(255, 255, 255, 0.9)'
                                }}
                                value={u} 
                                onChange={e => setU(e.target.value)}
                                onBlur={handleUrlBlur}
                                placeholder="https://example.com" 
                            />
                        </div>
                        
                        {/* Icon Selector */}
                        {u && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <IconSelector
                                    url={u}
                                    currentIcon={selectedIconUrl || customIcon}
                                    onSelect={setSelectedIconUrl}
                                    onCustom={setCustomIcon}
                                />
                            </div>
                        )}
                        
                        {/* Window Mode Toggle */}
                        <div 
                            onClick={() => setIsA(!isA)} 
                            className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
                                    <Monitor size={18} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>窗口模式</div>
                                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>在独立窗口中打开</div>
                                </div>
                            </div>
                            <div className={`relative w-12 h-7 rounded-full transition-all duration-200`} style={{ backgroundColor: isA ? '#34C759' : 'rgba(255, 255, 255, 0.2)' }}>
                                <div className={`absolute top-0.5 w-6 h-6 rounded-full shadow-md transition-all duration-200 ${
                                    isA ? 'left-[23px]' : 'left-0.5'
                                }`} style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // ===== WIDGET MODE =====
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Widget Type Selector */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold px-1" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                类型
                            </label>
                            <div className="grid grid-cols-5 gap-2">
                                {WIDGET_TYPES.map(wt => (
                                    <button 
                                        key={wt.type}
                                        onClick={() => setWType(wt.type)}
                                        className="relative p-3 rounded-lg border transition-all"
                                        style={{
                                            backgroundColor: wType === wt.type ? '#3b82f6' : 'rgba(255, 255, 255, 0.05)',
                                            borderColor: wType === wt.type ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
                                            color: wType === wt.type ? 'white' : 'rgba(255, 255, 255, 0.7)'
                                        }}
                                    >
                                        <div className="flex flex-col items-center gap-1.5">
                                            <wt.icon size={20} strokeWidth={wType === wt.type ? 2.5 : 2} />
                                            <span className="text-[10px] font-medium leading-tight text-center">{wt.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Size Inputs */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold px-1" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                尺寸
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>宽度</span>
                                        <span className="text-xs font-semibold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{wWidth}</span>
                                    </div>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max="6" 
                                        value={wWidth}
                                        onChange={(e) => setWWidth(Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))}
                                        className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-center font-medium"
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: 'rgba(255, 255, 255, 0.9)'
                                        }}
                                        placeholder="1-6"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>高度</span>
                                        <span className="text-xs font-semibold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{wHeight}</span>
                                    </div>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max="6" 
                                        value={wHeight}
                                        onChange={(e) => setWHeight(Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))}
                                        className="w-full px-4 py-2.5 rounded-lg outline-none transition-all text-center font-medium"
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: 'rgba(255, 255, 255, 0.9)'
                                        }}
                                        placeholder="1-6"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Content Input */}
                        {(wType === 'custom' || wType === 'iframe') && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-semibold px-1" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    {wType === 'iframe' ? '网页链接' : 'HTML 代码'}
                                </label>
                                {wType === 'iframe' ? (
                                    <input 
                                        className="w-full px-4 py-2.5 rounded-lg outline-none transition-all"
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: 'rgba(255, 255, 255, 0.9)'
                                        }}
                                        value={wContent} 
                                        onChange={e => setWContent(e.target.value)} 
                                        placeholder="https://example.com" 
                                    />
                                ) : (
                                    <textarea 
                                        className="w-full h-32 px-4 py-3 rounded-lg outline-none transition-all font-mono text-sm resize-none"
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: 'rgba(255, 255, 255, 0.9)'
                                        }}
                                        value={wContent} 
                                        onChange={e => setWContent(e.target.value)} 
                                        placeholder="<div class='widget'>Hello World</div>" 
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}</div>
            </div>

            {/* Action Footer - Apple Style */}
            <div 
                className="p-4"
                style={{
                    background: 'linear-gradient(to top, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    borderTop: '0.5px solid rgba(255, 255, 255, 0.1)'
                }}
            >
                <div className="flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg font-medium transition-all hover:bg-white/10 active:scale-95"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: 'rgba(255, 255, 255, 0.8)'
                        }}
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={!canSubmit}
                        className="flex-1 py-2.5 rounded-lg font-semibold transition-all active:scale-95"
                        style={{
                            backgroundColor: canSubmit ? '#007AFF' : 'rgba(255, 255, 255, 0.1)',
                            color: canSubmit ? 'white' : 'rgba(255, 255, 255, 0.4)',
                            cursor: canSubmit ? 'pointer' : 'not-allowed',
                            boxShadow: canSubmit ? '0 2px 8px rgba(0, 122, 255, 0.4)' : 'none'
                        }}
                    >
                        添加
                    </button>
                </div>
            </div>

            <style>{`
                .apple-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .apple-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .apple-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                    border: 2px solid transparent;
                    background-clip: padding-box;
                }
                .apple-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                    background-clip: padding-box;
                }
                @keyframes slide-in-from-bottom-4 {
                    from {
                        opacity: 0;
                        transform: translateY(1rem);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes slide-in-from-top-2 {
                    from {
                        opacity: 0;
                        transform: translateY(-0.5rem);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-in {
                    animation-duration: 0.5s;
                    animation-fill-mode: both;
                }
                .fade-in {
                    animation-name: fadeIn;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .slide-in-from-bottom-4 {
                    animation-name: slide-in-from-bottom-4;
                }
                .slide-in-from-top-2 {
                    animation-name: slide-in-from-top-2;
                }
            `}</style>
        </div>
    );
};