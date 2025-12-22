import React from 'react';

interface WidgetProps {
    w: number;
    h: number;
    content?: string;
    onRightClick?: (x: number, y: number) => void;
}

// Local widgets removed as per user request


export const CustomHTMLWidget: React.FC<WidgetProps> = ({ content }) => {
    return (
        <div className="w-full h-full bg-white text-black overflow-hidden relative">
            <div dangerouslySetInnerHTML={{ __html: content || '' }} className="w-full h-full overflow-auto" />
        </div>
    );
};

export const IFrameWidget: React.FC<WidgetProps> = ({ content, onRightClick }) => {
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    const handleLoad = () => {
        try {
            const doc = iframeRef.current?.contentDocument;
            if (doc) {
                doc.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    if (onRightClick) {
                        const rect = iframeRef.current?.getBoundingClientRect();
                        if (rect) {
                            onRightClick(rect.left + e.clientX, rect.top + e.clientY);
                        }
                    }
                });
            }
        } catch (e) {
            // Context menu interception failed (likely cross-origin)
        }
    };

    return (
         <div className="w-full h-full bg-white overflow-hidden relative">
            <iframe 
                ref={iframeRef}
                src={content} 
                title="widget" 
                className="w-full h-full border-none" 
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                onLoad={handleLoad}
            />
        </div>
    );
};