import React, { useState, useEffect } from 'react';

interface WebViewProps {
    url: string;
    title: string;
}

export const WebView: React.FC<WebViewProps> = ({ url, title }) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
    }, [url]);

    const handleLoad = () => {
        setIsLoading(false);
    };

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
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                referrerPolicy="no-referrer-when-downgrade"
            />
        </div>
    );
};
