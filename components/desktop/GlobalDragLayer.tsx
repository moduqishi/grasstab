import React from 'react';
import { DragState } from '../../types';
import { AppIcon } from '../AppIcon';

interface GlobalDragLayerProps {
    dragState: DragState;
}

export const GlobalDragLayer: React.FC<GlobalDragLayerProps> = ({ dragState }) => {
    if (!dragState.isDragging || !dragState.item) return null;

    return (
        <div
            style={{
                position: 'fixed',
                left: dragState.mx,
                top: dragState.my,
                transform: 'translate(-50%, -50%) scale(1.1)',
                zIndex: 10000,
                pointerEvents: 'none',
                transition: 'transform 0.15s ease-out'
            }}
        >
            {/* iOS-style dragging icon - maintains aspect ratio */}
            <div className="flex flex-col items-center gap-2">
                <div
                    className={`relative overflow-hidden flex items-center justify-center text-white shadow-2xl ${dragState.item.customIcon ? 'bg-white/5' : `bg-gradient-to-br ${dragState.item.color || 'from-gray-700 to-gray-600'}`} ring-2 ring-white/40 ${dragState.item.type === 'widget' ? 'rounded-[24px]' : 'rounded-[18px]'}`}
                    style={{
                        width: dragState.item.type === 'widget'
                            ? `${(dragState.item.size?.w || 1) * 88}px`
                            : '75px',
                        height: dragState.item.type === 'widget'
                            ? `${(dragState.item.size?.h || 1) * 88}px`
                            : '75px'
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none" style={{ display: dragState.item.customIcon ? 'none' : 'block' }}></div>
                    <div className="w-full h-full flex items-center justify-center">
                        <AppIcon {...dragState.item} />
                    </div>
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
