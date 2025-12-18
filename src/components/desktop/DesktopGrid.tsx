import React, { useRef, forwardRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';
import { AppIcon } from '../AppIcon';
import { DragState, Shortcut, PackedShortcut } from '../../types';

interface DesktopGridProps {
    viewState: 'hero' | 'desktop';
    isMobile: boolean;
    page: number;
    totalPages: number;
    dir: number;
    changePage: (delta: number) => void;
    gridWidth: number;
    cellWidth: number;
    cellHeight: number;
    iconSize?: number;
    layoutItems: any[];
    desktopApps: Shortcut[];
    
    // Interaction
    isEditing: boolean;
    dragState: DragState;
    resizingWidget: { id: number | string, newW?: number, newH?: number } | null;
    
    // Handlers
    handlePointerDown: (e: React.PointerEvent, index: number, source: 'grid' | 'dock', item: any) => void;
    handleResizeStart: (e: React.PointerEvent, widget: Shortcut) => void;
    handleAppContextMenu: (e: React.MouseEvent, app: Shortcut) => void;
    handleIconLoaded: (appId: string | number, iconSource: string) => void;
    onRemoveShortcut: (id: string | number) => void;
    setAppLayout: React.Dispatch<React.SetStateAction<(Shortcut | null)[]>>; // For delete action
    openWin: (id: string, extra?: any) => void;
}

export const DesktopGrid = forwardRef<HTMLDivElement, DesktopGridProps>(({
    viewState,
    isMobile,
    page,
    totalPages,
    dir,
    changePage,
    gridWidth,
    cellWidth,
    cellHeight,
    iconSize,
    layoutItems,
    desktopApps,
    isEditing,
    dragState,
    resizingWidget,
    handlePointerDown,
    handleResizeStart,
    handleAppContextMenu,
    handleIconLoaded,
    onRemoveShortcut,
    setAppLayout,
    openWin
}, ref) => {
    // Filter packed items for current page
    const currentItems = layoutItems.filter(i => i.page === page);

    return (
        <div
            className={`w-full h-[54%] max-w-[95%] xl:max-w-[1400px] mx-auto z-30 transition-all duration-700 cubic-bezier(0.2, 0.8, 0.2, 1) ${
                viewState === 'hero'
                    ? 'opacity-0 scale-150 pointer-events-none translate-y-[100px]'
                    : 'opacity-100 scale-100 translate-y-0'
            }`}
             ref={ref}
        >
            {!isMobile && page > 0 && <div onClick={(e) => { e.stopPropagation(); changePage(-1) }} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 sm:p-4 text-white/30 hover:text-white hover:bg-white/5 rounded-full cursor-pointer z-20 transition-all"><ChevronLeft size={32} className="sm:w-10 sm:h-10" strokeWidth={1} /></div>}
            {!isMobile && page < totalPages - 1 && <div onClick={(e) => { e.stopPropagation(); changePage(1) }} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 sm:p-4 text-white/30 hover:text-white hover:bg-white/5 rounded-full cursor-pointer z-20 transition-all"><ChevronRight size={32} className="sm:w-10 sm:h-10" strokeWidth={1} /></div>}

            <div
                className={`relative w-full h-full ${dir === 1 ? 'anim-next' : dir === -1 ? 'anim-prev' : ''}`}
                key={page}
                style={{ width: gridWidth + 'px', margin: '0 auto' }}
            >
                {currentItems.map((item) => {
                    // Check if this widget is being resized
                    const isBeingResized = resizingWidget?.id === item.id;
                    const displayW = isBeingResized && resizingWidget!.newW ? resizingWidget!.newW : (item?.size?.w || 1);
                    const displayH = isBeingResized && resizingWidget!.newH ? resizingWidget!.newH : (item?.size?.h || 1);
                    
                    // Calculate position based on packed coordinates
                    const left = `${item.x * cellWidth}px`;
                    const top = `${item.y * cellHeight}px`;
                    // Calculate dimension based on size (w * cellWidth, h * cellHeight)
                    const width = `${displayW * cellWidth}px`;
                    const height = `${displayH * cellHeight}px`;

                    // Find index in original desktopApps for drag identification
                    const originalIndex = desktopApps.findIndex(s => s.id === item.id);
                    // Hide if it's the dragged item (checking ID string equality for safety)
                    const isDraggingMe = dragState.isDragging && String(dragState.item?.id) === String(item.id);

                    if (isDraggingMe) return null;

                    const isAdd = 'isAdd' in item;

                    return (
                        <div
                            key={item.id}
                            style={{ position: 'absolute', left, top, width, height, transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
                            className="flex justify-center items-center"
                        >
                            {isAdd ? (
                                <button onClick={(e) => { e.stopPropagation(); openWin('add') }} className="flex flex-col items-center justify-center gap-2 group w-full h-full cursor-pointer">
                                    <div 
                                        style={{ width: (iconSize || 78), height: (iconSize || 78) }}
                                        className="rounded-[22%] bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-white/40 group-hover:bg-white/10 group-hover:text-white group-hover:border-white/40 transition-all duration-300"
                                    >
                                        <Plus size={(iconSize || 78) * 0.4} strokeWidth={1.5} />
                                    </div>
                                    <span className="text-[13px] text-white/80 font-medium tracking-wide truncate text-center px-1 drop-shadow-md group-hover:text-white transition-colors" style={{ maxWidth: '100%' }}>Add</span>
                                </button>
                            ) : (
                                (() => {
                                    const s = item as PackedShortcut;
                                    const isWidget = s.type === 'widget';

                                    // Dynamic size classes
                                    const containerClass = isWidget ? 'w-full h-full' : 'w-full h-full'; // Always fill cell
                                    
                                    return (
                                        <div
                                            className={`flex flex-col items-center justify-center gap-2 group relative ${containerClass} pointer-events-none ${isEditing ? 'jiggle-mode' : ''}`}
                                        >
                                            {/* Icon Wrapper for positioning badges relative to the ICON, not the cell */}
                                            <div 
                                                className={`relative ${viewState === 'hero' ? 'pointer-events-none' : 'pointer-events-auto'}`}
                                                style={{ 
                                                    width: isWidget ? '100%' : (iconSize || 78), 
                                                    height: isWidget ? '100%' : (iconSize || 78) 
                                                }}
                                                onPointerDown={(e) => handlePointerDown(e, originalIndex, 'grid', s)}
                                                onDragStart={(e) => e.preventDefault()}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!isEditing) {
                                                        if (s.isApp) openWin(s.id.toString(), s);
                                                        else if (s.type === 'widget') { /* Widgets might just be visual */ }
                                                        else window.location.href = s.url!;
                                                    }
                                                }}
                                                onAuxClick={(e) => {
                                                    if (e.button === 1) { // Middle click
                                                        e.stopPropagation();
                                                        if (!isEditing && !s.isApp && !s.type.includes('widget') && s.url) {
                                                            window.open(s.url, '_blank');
                                                        }
                                                    }
                                                }}
                                            >
                                                {isEditing && (
                                                    <div
                                                        onPointerDown={(e) => { e.stopPropagation(); }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onRemoveShortcut(s.id);
                                                        }}
                                                        className="absolute -top-2 -left-2 z-20 w-7 h-7 bg-gray-200 text-gray-800 rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-red-500 hover:text-white transition-colors"
                                                    >
                                                        <Minus size={16} strokeWidth={3} />
                                                    </div>
                                                )}
                                                
                                                {/* Resize handle for widgets in edit mode */}
                                                {isEditing && isWidget && (
                                                    <>
                                                        {/* Corner arc indicator */}
                                                        <svg className="absolute -bottom-0.5 -right-0.5 z-20 pointer-events-none" width="32" height="32" viewBox="0 0 32 32">
                                                            <path d="M 32 32 L 32 20 Q 32 12 24 12 L 12 12" stroke="white" strokeWidth="2" fill="none" opacity="0.3"/>
                                                        </svg>
                                                        
                                                        {/* Resize handle */}
                                                        <div
                                                            onPointerDown={(e) => handleResizeStart(e, s)}
                                                            className="absolute -bottom-1.5 -right-1.5 z-20 w-10 h-10 backdrop-blur-md bg-white/20 border border-white/40 rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.1)] cursor-se-resize hover:bg-white/30 hover:scale-105 transition-all active:scale-95"
                                                            title="拖动调整大小"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                                <circle cx="10" cy="10" r="1.5" fill="white" opacity="0.9"/>
                                                                <circle cx="5" cy="10" r="1.5" fill="white" opacity="0.7"/>
                                                                <circle cx="10" cy="5" r="1.5" fill="white" opacity="0.7"/>
                                                            </svg>
                                                        </div>
                                                        
                                                        {/* Size indicator when resizing */}
                                                        {isBeingResized && resizingWidget && resizingWidget.newW && resizingWidget.newH && (
                                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm font-medium pointer-events-none">
                                                                {resizingWidget.newW} × {resizingWidget.newH}
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                <div 
                                                    className={`w-full h-full flex items-center justify-center text-white ${s.customIcon ? 'bg-white/5 shadow-lg' : s.color ? `bg-gradient-to-br ${s.color} shadow-lg` : ''} ${!isEditing && !isWidget && 'group-hover:scale-105 group-hover:translate-y-[-4px]'} transition-all duration-300 ease-out ${s.color || s.customIcon ? 'ring-1 ring-white/10' : ''} relative overflow-hidden ${isWidget ? 'rounded-[24px]' : 'rounded-[22%]'}`}
                                                >
                                                    {!isWidget && !s.customIcon && <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none"></div>}
                                                    <AppIcon 
                                                        {...s} 
                                                        onContextMenu={handleAppContextMenu}
                                                        onIconLoaded={(iconSource) => handleIconLoaded(s.id, iconSource)}
                                                    />
                                                </div>
                                            </div>

                                            {!isWidget && <span className="text-[13px] text-white/80 font-medium tracking-wide truncate w-full text-center px-1 drop-shadow-md group-hover:text-white transition-colors">{s.title}</span>}
                                        </div>
                                    );
                                })()
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
