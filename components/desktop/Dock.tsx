import React, { forwardRef } from 'react';
import { Shortcut, DragState } from '../../types';
import { AppIcon } from '../AppIcon';
import { Edit3, Check, Minus } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

interface DockProps {
    showDock: boolean;
    dockApps: Shortcut[];
    viewState: 'hero' | 'desktop';
    isAnyWindowMaximized: boolean;
    showDockEdit: boolean;
    dragState: DragState;
    isEditing: boolean;
    onToggleEdit: () => void;
    onRemoveShortcut: (id: string | number) => void;
    setAppLayout: React.Dispatch<React.SetStateAction<(Shortcut | null)[]>>;
    handlePointerDown: (e: React.PointerEvent, index: number, source: 'grid' | 'dock', item: any) => void;
    handleAppContextMenu: (e: React.MouseEvent, app: Shortcut) => void;
    handleIconLoaded: (appId: string | number, iconSource: string) => void;
    openWin: (id: string, extra?: any) => void;
}

export const Dock = forwardRef<HTMLDivElement, DockProps>(({
    showDock,
    dockApps,
    viewState,
    isAnyWindowMaximized,
    showDockEdit,
    dragState,
    isEditing,
    onToggleEdit,
    onRemoveShortcut,
    setAppLayout,
    handlePointerDown,
    handleAppContextMenu,
    handleIconLoaded,
    openWin
}, ref) => {
    // Dynamic Dock Calculation (Restored from Git Version)
    const dockZoneH = (typeof window !== 'undefined' ? window.innerHeight : 1000) * 0.15;
    
    // Old Logic: Independent size, target 75% of dock height, Max 88px
    const dynamicIconSize = Math.min(78, Math.max(48, dockZoneH * 0.75)); 
    
    // Calculate Dock Container Dimensions (Content Box)
    // No longer needed for explicit width but good for reference if we revert
    // const dockAppCount = dockApps.length + (showDockEdit ? 1 : 0);
    // const contentWidth = (dockAppCount * dynamicIconSize) + (Math.max(0, dockAppCount - 1) * dynamicGap);

    return (
        <div className={`w-full h-[15%] flex items-center justify-center z-[9999] transition-transform duration-700 cubic-bezier(0.32, 0.72, 0, 1) ${
            !showDock || isAnyWindowMaximized || viewState === 'hero'
                ? 'translate-y-[250%]'
                : 'translate-y-0'
            }`}>
            <motion.div
                className="dock-glass rounded-[24px] sm:rounded-[30px] md:rounded-[35px] relative flex items-center justify-center gap-2 sm:gap-3 px-3 py-3 overflow-visible"
                ref={ref}
                layout
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{
                    height: 'auto',
                    minHeight: (dynamicIconSize + 20) + 'px' 
                }}
            >
                <LayoutGroup>
                    <AnimatePresence>
                        {dockApps.map((item, index) => {
                            // Hide the item if it matches the dragged item ID OR if the drag source/index matches.
                            // This combined check guards against ID mismatches or state sync issues.
                            const isDraggingMe = dragState.isDragging && (
                                String(dragState.item?.id) === String(item.id) || 
                                (dragState.source === 'dock' && dragState.index === index)
                            );
                            const opacity = isDraggingMe ? 0 : 1;

                            return (
                                <motion.div
                                    layout
                                    key={item.id}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: opacity }}
                                    exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    className={`relative flex items-center justify-center group ${isEditing ? 'jiggle-mode' : ''}`}
                                    style={{ 
                                        width: dynamicIconSize + 'px', 
                                        height: dynamicIconSize + 'px',
                                        // Removed manual CSS transition for transform to let Framer handle layout
                                    }}
                                    onPointerDown={(e) => handlePointerDown(e, index, 'dock', item)}
                                    onContextMenu={(e) => handleAppContextMenu(e, item)}
                                    onClick={() => {
                                        if (!isEditing) {
                                            if (item.isApp) openWin(item.id.toString(), item);
                                            else window.location.href = item.url!;
                                        }
                                    }}
                                >
                                    <div 
                                        className="transition-transform duration-200 hover:-translate-y-2 hover:scale-110 active:scale-95 origin-bottom relative"
                                        style={{ width: dynamicIconSize + 'px', height: dynamicIconSize + 'px' }}
                                    >
                                        {isEditing && (
                                            <div
                                                onPointerDown={(e) => { e.stopPropagation(); }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRemoveShortcut(item.id);
                                                }}
                                                className="absolute -top-2 -left-2 z-20 w-7 h-7 bg-gray-200 text-gray-800 rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-red-500 hover:text-white transition-colors"
                                            >
                                                <Minus size={16} strokeWidth={3} />
                                            </div>
                                        )}

                                        <div 
                                            className={`w-full h-full flex items-center justify-center text-white shadow-lg ${item.customIcon ? 'bg-white/5' : `bg-gradient-to-br ${item.color}`} relative`}
                                            style={{ clipPath: 'inset(0 round 17px)' }}
                                        >
                                           {!item.customIcon && <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none"></div>}
                                            <AppIcon 
                                                {...item} 
                                                onContextMenu={handleAppContextMenu}
                                                onIconLoaded={(iconSource) => handleIconLoaded(item.id, iconSource)}
                                            />
                                        </div>
                                        {/* Tooltip */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800/80 backdrop-blur-md rounded-md text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                            {item.title}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </LayoutGroup>
                
                {/* Edit Button */}
                {showDockEdit && (
                    <motion.div
                        layout
                        className="relative flex items-center justify-center group"
                        style={{
                            width: dynamicIconSize + 'px',
                            height: dynamicIconSize + 'px',
                        }}
                        onPointerDown={(e) => handlePointerDown(e, dockApps.length, 'dock', { id: 'dock-edit-btn' })}
                        onClick={() => onToggleEdit()}
                    >
                         <div 
                            className="transition-transform duration-200 hover:-translate-y-2 hover:scale-110 active:scale-95"
                            style={{ width: dynamicIconSize + 'px', height: dynamicIconSize + 'px' }}
                         >
                            <div className={`w-full h-full flex items-center justify-center text-white/80 ${isEditing ? 'bg-white/30 text-white' : 'bg-white/10 hover:bg-white/20 hover:text-white'} shadow-lg rounded-[17px] backdrop-blur-md transition-all border border-white/5`}>
                                {isEditing ? <Check size={dynamicIconSize * 0.45} strokeWidth={3} /> : <Edit3 size={dynamicIconSize * 0.45} />}
                            </div>
                         </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
});
