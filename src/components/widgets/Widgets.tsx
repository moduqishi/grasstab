
interface WidgetProps {
    w: number;
    h: number;
    content?: string;
}

// Local widgets removed as per user request


export const CustomHTMLWidget: React.FC<WidgetProps> = ({ content }) => {
    return (
        <div className="w-full h-full bg-white text-black overflow-hidden relative">
            <div dangerouslySetInnerHTML={{ __html: content || '' }} className="w-full h-full overflow-auto" />
        </div>
    );
};

export const IFrameWidget: React.FC<WidgetProps> = ({ content }) => {
    return (
         <div className="w-full h-full bg-white overflow-hidden relative">
            <iframe 
                src={content} 
                title="widget" 
                className="w-full h-full border-none" 
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
        </div>
    );
};