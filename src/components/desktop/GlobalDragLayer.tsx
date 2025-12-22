import React, { useEffect, useRef } from 'react';
import { DragState } from '../../types';
import { AppIcon } from '../AppIcon';
import { CustomHTMLWidget, IFrameWidget } from '../widgets/Widgets';

interface GlobalDragLayerProps {
    dragState: DragState;
}

export const GlobalDragLayer: React.FC<GlobalDragLayerProps> = ({ dragState }) => {
    const layerRef = useRef<HTMLDivElement>(null);

    // Direct DOM manipulation for performance
    useEffect(() => {
        if (!dragState.isDragging) return;

        const handleMove = (e: PointerEvent) => {
            if (layerRef.current) {
                layerRef.current.style.left = `${e.clientX}px`;
                layerRef.current.style.top = `${e.clientY}px`;
            }
        };

        // Attach global listener
        window.addEventListener('pointermove', handleMove, { passive: true });
        
        // Sync initial position if needed (though initial render sets it)
        if (layerRef.current) {
             layerRef.current.style.left = `${dragState.mx}px`;
             layerRef.current.style.top = `${dragState.my}px`;
        }

        return () => {
            window.removeEventListener('pointermove', handleMove);
        };
    }, [dragState.isDragging]); // Only re-attach if dragging state changes

    if (!dragState.isDragging || !dragState.item) return null;

    return (
        <div
            ref={layerRef}
            style={{
                position: 'fixed',
                left: dragState.mx, // Initial position from state
                top: dragState.my,
                transform: 'translate(-50%, -50%) scale(1.1)',
                zIndex: 10000,
                pointerEvents: 'none',
                // transition: 'transform 0.1s linear', // Removed transition for instant tracking
                willChange: 'left, top'
            }}
        >
            {/* iOS-style dragging icon - maintains aspect ratio */}
            <div className="flex flex-col items-center gap-2">
                <div
                    className={`relative overflow-hidden flex items-center justify-center text-white shadow-2xl ${dragState.item.customIcon ? 'bg-white/5' : dragState.item.type === 'widget' ? 'bg-white' : `bg-gradient-to-br ${dragState.item.color || 'from-gray-700 to-gray-600'}`} ring-2 ring-white/40 ${dragState.item.type === 'widget' ? 'rounded-[24px]' : 'rounded-[18px]'}`}
                    style={{
                        width: dragState.item.type === 'widget'
                            ? `${(dragState.item.size?.w || 1) * 88}px`
                            : '75px',
                        height: dragState.item.type === 'widget'
                            ? `${(dragState.item.size?.h || 1) * 88}px`
                            : '75px'
                    }}
                >
                     {/* Widget Content Preview */}
                    {dragState.item.type === 'widget' ? (
                        <div className="w-full h-full text-black pointer-events-none p-[1px] overflow-hidden">
                             {/* Re-use widget rendering with passed props */}
                             {(() => {
                                 const w = dragState.item.size?.w || 1;
                                 const h = dragState.item.size?.h || 1;
                                 
                                 if (dragState.item.widgetType === 'custom') {
                                     return <CustomHTMLWidget w={w} h={h} content={dragState.item.widgetContent} />;
                                 } else if (dragState.item.widgetType === 'iframe') {
                                     return <IFrameWidget w={w} h={h} content={dragState.item.widgetContent} />;
                                 }
                                 return null;
                             })()}
                        </div>
                    ) : (
                        // Normal App Icon
                        <>
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none" style={{ display: dragState.item.customIcon ? 'none' : 'block' }}></div>
                            <div className="w-full h-full flex items-center justify-center">
                                <AppIcon {...dragState.item} />
                            </div>
                        </>
                    )}
                </div>
                {dragState.item.type !== 'widget' && dragState.item.title && (
                    <span className="text-[13px] text-white font-medium drop-shadow-lg px-2 py-1 bg-black/30 backdrop-blur-sm rounded-lg">
                        {dragState.item.title}
                    </span>
                )}
            </div>
        </div>
    );
};
