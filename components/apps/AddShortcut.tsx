import React, { useState, useRef } from 'react';
import { Plus, AppWindow, LayoutGrid, Clock, Calendar, CloudSun, Code, Monitor, Upload, Image as ImageIcon, Check, X, Link, Maximize2 } from 'lucide-react';
import { Shortcut, WidgetType } from '../../types';
import { IconSelector } from '../IconSelector';

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
    const [mode, setMode] = useState<'app' | 'widget'>('app');
    
    // App State
    const [t, setT] = useState(''); 
    const [u, setU] = useState(''); 
    const [isA, setIsA] = useState(false);
    const [customIcon, setCustomIcon] = useState('');
    const [selectedIconUrl, setSelectedIconUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Widget State
    const [wType, setWType] = useState<WidgetType>('clock');
    const [wWidth, setWWidth] = useState(2);
    const [wHeight, setWHeight] = useState(2);
    const [wContent, setWContent] = useState('');

    // Handle icon file upload
    const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Image size must be less than 2MB');
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
            className="flex flex-col h-full bg-white text-gray-900"
            onWheel={(e) => e.stopPropagation()} // 阻止滚轮事件冒泡到主界面
        >
            {/* Apple-style Segmented Control */}
            <div className="p-4 bg-[#f5f5f7]">
                <div className="relative flex bg-[#e8e8ed] rounded-lg p-0.5">
                    <button 
                        onClick={() => setMode('app')} 
                        className={`relative flex-1 py-2 px-4 text-sm font-medium transition-all duration-200 rounded-md ${
                            mode === 'app' 
                                ? 'text-gray-900' 
                                : 'text-gray-600'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-1.5 relative z-10">
                            <AppWindow size={16} />
                            <span>应用</span>
                        </div>
                    </button>
                    <button 
                        onClick={() => setMode('widget')} 
                        className={`relative flex-1 py-2 px-4 text-sm font-medium transition-all duration-200 rounded-md ${
                            mode === 'widget' 
                                ? 'text-gray-900' 
                                : 'text-gray-600'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-1.5 relative z-10">
                            <LayoutGrid size={16} />
                            <span>小组件</span>
                        </div>
                    </button>
                    {/* Sliding background */}
                    <div 
                        className="absolute top-0.5 h-[calc(100%-4px)] bg-white rounded-md shadow-sm transition-all duration-200 ease-out"
                        style={{
                            left: mode === 'app' ? '2px' : 'calc(50% - 2px)',
                            width: 'calc(50% - 2px)'
                        }}
                    />
                </div>
            </div>

            {/* Scrollable Content with gradient fade */}
            <div className="flex-1 overflow-y-auto apple-scrollbar relative bg-[#f5f5f7]" onWheel={(e) => e.stopPropagation()}>
                <div className="p-6 space-y-5">{mode === 'app' ? (
                    // ===== APP MODE =====
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900 px-1">
                                应用名称
                            </label>
                            <input 
                                className="w-full bg-white border border-gray-300 px-4 py-2.5 rounded-lg text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" 
                                value={t} 
                                onChange={e => setT(e.target.value)} 
                                placeholder="例如：我的博客" 
                                autoFocus
                            />
                        </div>
                        
                        {/* URL Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900 px-1">
                                链接地址
                            </label>
                            <input 
                                className="w-full bg-white border border-gray-300 px-4 py-2.5 rounded-lg text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" 
                                value={u} 
                                onChange={e => setU(e.target.value)} 
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
                            className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-200 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                                    <Monitor size={18} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900">窗口模式</div>
                                    <div className="text-xs text-gray-500 mt-0.5">在独立窗口中打开</div>
                                </div>
                            </div>
                            <div className={`relative w-12 h-7 rounded-full transition-all duration-200 ${
                                isA ? 'bg-[#34C759]' : 'bg-gray-300'
                            }`}>
                                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-200 ${
                                    isA ? 'left-[23px]' : 'left-0.5'
                                }`}></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // ===== WIDGET MODE =====
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Widget Type Selector - Compact Grid */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900 px-1">
                                类型
                            </label>
                            <div className="grid grid-cols-5 gap-2">
                                {WIDGET_TYPES.map(wt => (
                                    <button 
                                        key={wt.type}
                                        onClick={() => setWType(wt.type)}
                                        className={`relative p-3 rounded-lg border transition-all ${
                                            wType === wt.type 
                                                ? 'bg-blue-500 border-blue-500 text-white shadow-md' 
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 active:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center gap-1.5">
                                            <wt.icon size={20} strokeWidth={wType === wt.type ? 2.5 : 2} />
                                            <span className="text-[10px] font-medium leading-tight text-center">{wt.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Size Inputs - Apple Style */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900 px-1">
                                尺寸
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-xs text-gray-600">宽度</span>
                                        <span className="text-xs font-semibold text-gray-900">{wWidth}</span>
                                    </div>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max="6" 
                                        value={wWidth}
                                        onChange={(e) => setWWidth(Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))}
                                        className="w-full bg-white border border-gray-300 px-4 py-2.5 rounded-lg text-gray-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-center font-medium"
                                        placeholder="1-6"
                                        title="Widget width (1-6 grid cells)"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-xs text-gray-600">高度</span>
                                        <span className="text-xs font-semibold text-gray-900">{wHeight}</span>
                                    </div>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max="6" 
                                        value={wHeight}
                                        onChange={(e) => setWHeight(Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))}
                                        className="w-full bg-white border border-gray-300 px-4 py-2.5 rounded-lg text-gray-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-center font-medium"
                                        placeholder="1-6"
                                        title="Widget height (1-6 grid cells)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Content Input for Custom/IFrame */}
                        {(wType === 'custom' || wType === 'iframe') && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-semibold text-gray-900 px-1">
                                    {wType === 'iframe' ? '网页链接' : 'HTML 代码'}
                                </label>
                                {wType === 'iframe' ? (
                                    <input 
                                        className="w-full bg-white border border-gray-300 px-4 py-2.5 rounded-lg text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" 
                                        value={wContent} 
                                        onChange={e => setWContent(e.target.value)} 
                                        placeholder="https://example.com" 
                                    />
                                ) : (
                                    <textarea 
                                        className="w-full h-32 bg-white border border-gray-300 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono text-sm resize-none" 
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
            <div className="p-4 bg-[#f5f5f7] border-t border-gray-200">
                <div className="flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 active:bg-gray-100 transition-all"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={!canSubmit}
                        className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                            canSubmit
                                ? 'bg-[#007AFF] hover:bg-[#0051D5] active:bg-[#004FC4] text-white shadow-sm'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {mode === 'app' ? '添加' : '添加'}
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
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 10px;
                    border: 2px solid transparent;
                    background-clip: padding-box;
                }
                .apple-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.3);
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