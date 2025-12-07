import React, { useState, useEffect } from 'react';
import { ExternalLink, AlertTriangle } from 'lucide-react';

interface WebViewProps {
    url: string;
    title: string;
}

export const WebView: React.FC<WebViewProps> = ({ url, title }) => {
    const [loadError, setLoadError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 重置状态当 URL 改变时
        setLoadError(false);
        setIsLoading(true);

        // 设置超时检测（5秒后如果还在加载，可能是被阻止了）
        const timeout = setTimeout(() => {
            if (isLoading) {
                setLoadError(true);
                setIsLoading(false);
            }
        }, 5000);

        return () => clearTimeout(timeout);
    }, [url]);

    const handleLoad = () => {
        setIsLoading(false);
        setLoadError(false);
    };

    const handleError = () => {
        setLoadError(true);
        setIsLoading(false);
    };

    const openInNewTab = () => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    if (loadError) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1e1e1e] dark:to-[#2c2c2e] text-gray-800 dark:text-white p-8">
                <div className="flex flex-col items-center gap-6 max-w-md text-center">
                    <div className="w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <AlertTriangle size={48} className="text-orange-500 dark:text-orange-400" />
                    </div>
                    
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold">无法在窗口中加载此网站</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            该网站设置了安全策略，禁止在嵌入式框架中显示。这是网站的保护措施，无法绕过。
                        </p>
                    </div>

                    <div className="w-full p-4 bg-gray-200 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate" title={url}>
                            {url}
                        </p>
                    </div>

                    <button
                        onClick={openInNewTab}
                        className="flex items-center gap-2 px-6 py-3 bg-[#0A84FF] hover:bg-[#007AFF] text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                        <ExternalLink size={18} />
                        在新标签页中打开
                    </button>

                    <p className="text-xs text-gray-500 dark:text-gray-500">
                        💡 提示：大多数社交媒体和视频网站都会阻止嵌入，建议在浏览器中直接访问
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative bg-white" onWheel={(e) => e.stopPropagation()}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-[#1e1e1e] z-10">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#0A84FF] rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">加载中...</p>
                    </div>
                </div>
            )}
            <iframe
                src={url}
                className="w-full h-full border-none"
                title={title}
                onLoad={handleLoad}
                onError={handleError}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                referrerPolicy="no-referrer-when-downgrade"
            />
        </div>
    );
};
