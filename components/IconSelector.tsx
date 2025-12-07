import React, { useState, useEffect } from 'react';
import { Check, Loader2, AlertCircle, Upload, Link as LinkIcon } from 'lucide-react';
import { getAllIconUrls, getIconSources } from '../utils';

interface IconSelectorProps {
    url: string;
    currentIcon?: string;
    onSelect: (iconUrl: string) => void;
    onCustom: (customIcon: string) => void;
}

interface IconSourceStatus {
    url: string;
    name: string;
    status: 'loading' | 'success' | 'error';
}

export const IconSelector: React.FC<IconSelectorProps> = ({ url, currentIcon, onSelect, onCustom }) => {
    const [sources, setSources] = useState<IconSourceStatus[]>([]);
    const [selectedIcon, setSelectedIcon] = useState<string>(currentIcon || '');
    const [customIconInput, setCustomIconInput] = useState<string>('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!url) return;

        // 初始化所有图标源
        const iconSources = getIconSources(url);
        const initialSources: IconSourceStatus[] = [
            { url: iconSources.iconHorse, name: 'Icon Horse', status: 'loading' },
            { url: iconSources.clearbit, name: 'Clearbit', status: 'loading' },
            { url: iconSources.unavatar, name: 'Unavatar', status: 'loading' },
            { url: iconSources.google, name: 'Google', status: 'loading' },
            { url: iconSources.duckduckgo, name: 'DuckDuckGo', status: 'loading' },
            { url: iconSources.faviconKit, name: 'FaviconKit', status: 'loading' },
            { url: iconSources.direct, name: 'Direct', status: 'loading' },
        ];

        setSources(initialSources);

        // 测试每个图标源
        initialSources.forEach((source, index) => {
            testImageUrl(source.url, (success) => {
                setSources(prev => {
                    const newSources = [...prev];
                    newSources[index] = { ...source, status: success ? 'success' : 'error' };
                    return newSources;
                });
            });
        });
    }, [url]);

    const testImageUrl = (url: string, callback: (success: boolean) => void) => {
        const img = new Image();
        img.onload = () => callback(true);
        img.onerror = () => callback(false);
        // 设置超时,5秒后视为失败
        const timeout = setTimeout(() => {
            img.src = ''; // 取消加载
            callback(false);
        }, 5000);
        img.onload = () => {
            clearTimeout(timeout);
            callback(true);
        };
        img.onerror = () => {
            clearTimeout(timeout);
            callback(false);
        };
        img.src = url;
    };

    const handleSelectIcon = (iconUrl: string) => {
        setSelectedIcon(iconUrl);
        onSelect(iconUrl);
        setShowCustomInput(false);
    };

    const handleCustomIconUrl = (value: string) => {
        setCustomIconInput(value);
        setSelectedIcon(value);
        onCustom(value);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 验证文件大小 (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('图标文件大小不能超过 2MB');
            return;
        }

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            alert('请上传图片文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setCustomIconInput(base64);
            setSelectedIcon(base64);
            onCustom(base64);
            setShowCustomInput(true);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-4">
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        选择图标源
                    </label>
                    <button
                        onClick={() => setShowCustomInput(!showCustomInput)}
                        className="text-xs px-3 py-1.5 rounded-md transition-colors"
                        style={{
                            backgroundColor: showCustomInput ? 'rgba(10, 132, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                            color: showCustomInput ? '#0A84FF' : 'rgba(255, 255, 255, 0.6)',
                            border: '1px solid ' + (showCustomInput ? 'rgba(10, 132, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)')
                        }}
                    >
                        自定义图标
                    </button>
                </div>

                {/* 备选图标源网格 */}
                {!showCustomInput && (
                    <div className="grid grid-cols-3 gap-3">
                        {sources
                            .filter(source => source.status !== 'error') // 隐藏失败的图标源
                            .map((source, index) => (
                            <button
                                key={index}
                                onClick={() => source.status === 'success' && handleSelectIcon(source.url)}
                                disabled={source.status !== 'success'}
                                className={`relative p-3 rounded-lg border transition-all ${
                                    selectedIcon === source.url
                                        ? 'border-[#0A84FF] bg-[#0A84FF]/10'
                                        : 'border-white/10 hover:border-white/20'
                                } ${source.status !== 'success' ? 'cursor-wait' : 'cursor-pointer'}`}
                                style={{
                                    backgroundColor: selectedIcon === source.url 
                                        ? 'rgba(10, 132, 255, 0.1)' 
                                        : 'rgba(255, 255, 255, 0.05)'
                                }}
                            >
                                {/* 图标预览 */}
                                <div className="w-12 h-12 mx-auto mb-2 rounded-lg overflow-hidden flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                                >
                                    {source.status === 'loading' && (
                                        <Loader2 size={20} className="animate-spin" style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                                    )}
                                    {source.status === 'success' && (
                                        <img 
                                            src={source.url} 
                                            alt={source.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                // 如果加载失败，更新状态（将被过滤隐藏）
                                                setSources(prev => {
                                                    const newSources = [...prev];
                                                    const sourceIndex = prev.findIndex(s => s.url === source.url);
                                                    if (sourceIndex !== -1) {
                                                        newSources[sourceIndex] = { ...source, status: 'error' };
                                                    }
                                                    return newSources;
                                                });
                                            }}
                                        />
                                    )}
                                </div>

                                {/* 源名称 */}
                                <div className="text-xs text-center truncate" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                    {source.name}
                                </div>

                                {/* 选中标记 */}
                                {selectedIcon === source.url && (
                                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#0A84FF] flex items-center justify-center">
                                        <Check size={12} color="white" />
                                    </div>
                                )}

                                {/* 加载状态指示器 */}
                                {source.status === 'loading' && (
                                    <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* 自定义图标输入 */}
                {showCustomInput && (
                    <div className="space-y-3">
                        {/* URL输入 */}
                        <div className="relative">
                            <LinkIcon 
                                className="absolute left-3 top-1/2 -translate-y-1/2" 
                                style={{ color: 'rgba(255, 255, 255, 0.4)' }} 
                                size={18} 
                            />
                            <input
                                type="text"
                                value={customIconInput}
                                onChange={(e) => handleCustomIconUrl(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none transition-all"
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'rgba(255, 255, 255, 0.9)'
                                }}
                                placeholder="粘贴图标 URL 或 Base64..."
                            />
                        </div>

                        {/* 上传按钮 */}
                        <label 
                            className="w-full px-4 py-2.5 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: 'rgba(255, 255, 255, 0.8)'
                            }}
                        >
                            <Upload size={18} />
                            上传图片文件
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileUpload} 
                                className="hidden" 
                            />
                        </label>

                        {/* 自定义图标预览 */}
                        {customIconInput && (
                            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                                <div 
                                    className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center shrink-0"
                                    style={{
                                        border: '2px solid rgba(255, 255, 255, 0.15)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                                    }}
                                >
                                    <img 
                                        src={customIconInput} 
                                        alt="自定义图标预览" 
                                        className="w-full h-full object-cover"
                                        onError={() => setCustomIconInput('')}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium mb-1" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                        自定义图标
                                    </div>
                                    <div className="text-xs truncate" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                        {customIconInput.startsWith('data:') ? '已上传的图片' : customIconInput}
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setCustomIconInput('');
                                        setSelectedIcon('');
                                        onCustom('');
                                    }}
                                    className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
                                    style={{ 
                                        color: 'rgba(239, 68, 68, 0.9)',
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)'
                                    }}
                                >
                                    清除
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 提示信息 */}
            <div className="flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.1)' }}>
                <AlertCircle size={16} style={{ color: '#0A84FF', marginTop: '2px' }} />
                <div className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    系统会自动测试所有图标源的可用性。只显示可用的图标源，无法加载的图标会自动隐藏。
                </div>
            </div>
        </div>
    );
};
