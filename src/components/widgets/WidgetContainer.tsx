import React, { useRef } from 'react';
import { PackedShortcut } from '../../types';
import { CustomHTMLWidget, IFrameWidget } from './Widgets';
import { Minus } from 'lucide-react';

interface WidgetContainerProps {
    widget: PackedShortcut;
    isEditing: boolean;
    resizingWidget: { id: number | string, newW?: number, newH?: number } | null;
    cellWidth: number;
    cellHeight: number;
    
    // Handlers
    onPointerDown: (e: React.PointerEvent) => void;
    onContextMenu: (e: React.MouseEvent) => void;
    onResizeStart: (e: React.PointerEvent) => void;
    onRemove: () => void;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
    widget,
    isEditing,
    resizingWidget,
    cellWidth,
    cellHeight,
    onPointerDown,
    onContextMenu,
    onResizeStart,
    onRemove
}) => {
    const isBeingResized = resizingWidget?.id === widget.id;
    const displayW = isBeingResized && resizingWidget!.newW ? resizingWidget!.newW : (widget.size?.w || 1);
    const displayH = isBeingResized && resizingWidget!.newH ? resizingWidget!.newH : (widget.size?.h || 1);

    // Calculate dynamic style
    const style = {
        width: `${displayW * cellWidth}px`,
        height: `${displayH * cellHeight}px`,
    };

    return (
        <div 
            className={`relative group transition-all duration-300 ${isEditing ? 'jiggle-mode' : ''}`}
            style={{ width: '100%', height: '100%' }} // Parent DesktopGrid cell handles positioning? No, DesktopGrid passes calculated w/h
            // Actually, DesktopGrid applies width/height to the wrapper div. 
            // We should just fill 100% of parent wrapper which DesktopGrid controls.
        >
             {/* 
               DesktopGrid wraps this in a div with absolute positioning, left/top/width/height.
               So here we just need to fill that space.
            */}
            
            <div 
                className={`w-full h-full relative rounded-[24px] overflow-hidden shadow-lg border border-white/10 bg-white transition-transform duration-300 ${!isEditing ? 'hover:scale-[1.02]' : ''}`}
                style={{ isolation: 'isolate', maskImage: 'linear-gradient(white, white)', WebkitMaskImage: 'linear-gradient(white, white)' }}
                onContextMenu={onContextMenu}
            >
                {/* 1. Content Layer */}
                <div className={`w-full h-full ${isEditing ? 'pointer-events-none blur-[1px]' : 'pointer-events-auto'}`}>
                    {widget.widgetType === 'custom' && (
                        <CustomHTMLWidget 
                            w={displayW} 
                            h={displayH} 
                            content={widget.widgetContent} 
                        />
                    )}
                    {widget.widgetType === 'iframe' && (
                        <IFrameWidget 
                            w={displayW} 
                            h={displayH} 
                            content={widget.widgetContent} 
                            onRightClick={(x, y) => {
                                // Create synthetic event or call handler directly?
                                // DesktopGrid passes onContextMenu which expects React.MouseEvent.
                                // But looking at DesktopApp, it just needs { clientX, clientY }.
                                // So we can construct a fake event object compatible enough.
                                const fakeEvent = {
                                    preventDefault: () => {},
                                    stopPropagation: () => {},
                                    clientX: x,
                                    clientY: y
                                } as unknown as React.MouseEvent;
                                onContextMenu(fakeEvent);
                            }}
                        />
                    )}
                    {/* Fallback */}
                    {!['custom', 'iframe'].includes(widget.widgetType || '') && (
                         <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                             Unknown Widget Type
                         </div>
                    )}
                </div>

                {/* 2. Interaction/Edit Overlay - Inside to be clipped */}
                {isEditing && (
                    <div 
                        className="absolute inset-0 z-20 cursor-move bg-white/10 backdrop-blur-[1px] flex items-center justify-center border-2 border-blue-500/30 rounded-[24px]"
                        onPointerDown={onPointerDown}
                    >
                         {/* Optional: Add an icon or text indicating it's draggable */}
                    </div>
                )}
            </div>

            {/* 3. Controls Layer (Delete & Resize) - OUTSIDE to float freely */}
            {isEditing && (
                <>
                    {/* Delete Button */}
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="absolute -top-2 -left-2 z-30 w-7 h-7 bg-gray-200 text-gray-800 rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-red-500 hover:text-white transition-colors"
                    >
                        <Minus size={16} strokeWidth={3} />
                    </div>

                    {/* Resize Handle */}
                    {/* Corner arc indicator - visual only, keep inside or outside? Outside is fine if relative to wrapper */}
                    {/* Actually, arc looks better inside the rounded corner of the widget. Let's keep it separate or just use the handle. */}
                    
                    <div
                        onPointerDown={onResizeStart}
                        className="absolute -bottom-1.5 -right-1.5 z-30 w-10 h-10 backdrop-blur-md bg-white/20 border border-white/40 rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.1)] cursor-se-resize hover:bg-white/30 hover:scale-105 transition-all active:scale-95"
                        title="拖动调整大小"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle cx="10" cy="10" r="1.5" fill="white" opacity="0.9"/>
                            <circle cx="5" cy="10" r="1.5" fill="white" opacity="0.7"/>
                            <circle cx="10" cy="5" r="1.5" fill="white" opacity="0.7"/>
                        </svg>
                    </div>

                    {/* Live Size Indicator */}
                    {isBeingResized && resizingWidget && resizingWidget.newW && resizingWidget.newH && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm font-medium pointer-events-none shadow-xl">
                            {resizingWidget.newW} × {resizingWidget.newH}
                            <div className="text-[10px] text-gray-300 text-center font-normal mt-0.5">Grid Units</div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
