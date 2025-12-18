import { useState, useRef, useEffect, useCallback } from 'react';
import { DragState, Shortcut } from '../types';

interface InteractionProps {
    appLayout: (Shortcut | null)[];
    setAppLayout: React.Dispatch<React.SetStateAction<(Shortcut | null)[]>>;
    dockApps: Shortcut[];
    desktopApps: Shortcut[];
    layoutItems: any[];
    cols: number;
    rows: number;
    cellWidth: number;
    cellHeight: number;
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    setDir: React.Dispatch<React.SetStateAction<number>>;
    gridRef: React.RefObject<HTMLDivElement | null>;
    dockRef: React.RefObject<HTMLDivElement | null>;
    DOCK_RESERVED_SLOTS: number;
    iconSize?: number;
    gridWidth: number;
}

export function useInteraction({
    appLayout, setAppLayout,
    dockApps, desktopApps,
    layoutItems,
    cols, rows, cellWidth, cellHeight,
    page, setPage, totalPages,
    setDir,
    gridRef, dockRef,
    DOCK_RESERVED_SLOTS,
    iconSize = 78,
    gridWidth
}: InteractionProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [dragState, setDragState] = useState<DragState>({ isDragging: false, source: null, index: -1, item: null, mx: 0, my: 0 });
    const [resizingWidget, setResizingWidget] = useState<{ id: number | string, startW: number, startH: number, startX: number, startY: number, newW?: number, newH?: number } | null>(null);
    
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const flipInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const stateRef = useRef({ page, totalPages });
    
    // Keep stateRef up to date
    useEffect(() => {
        stateRef.current = { page, totalPages };
    }, [page, totalPages]);

    // --- Interaction Handlers ---
    const handlePointerDown = (e: React.PointerEvent, index: number, source: 'grid' | 'dock', item: any) => {
        if (item.id === 'edit' || item.id === 'dock-edit-btn') return;
        if (index === -1) return;

        e.preventDefault();

        if (!isEditing) {
            longPressTimer.current = setTimeout(() => { setIsEditing(true); }, 800);
            return;
        }

        setDragState({
            isDragging: true,
            source,
            index, // For grid, index in desktopApps. For dock, index in dockItems.
            item,
            mx: e.clientX,
            my: e.clientY
        });
    };

    const handlePointerMove = useCallback((e: PointerEvent) => {
        if (!dragState.isDragging || !dragState.item) return;
        // Optimization: Do NOT update state for mx/my on every frame. GlobalDragLayer handles visual tracking.
        // setDragState(prev => ({ ...prev, mx: e.clientX, my: e.clientY }));

        // --- Edge Detection for Auto-Page Flip (Outside Grid Box) ---
        const screenWidth = window.innerWidth;
        const gridLeft = (screenWidth - gridWidth) / 2;
        const gridRight = gridLeft + gridWidth;
        
        // Define trigger zones: Outside the grid box
        // Use a small buffer (e.g., 20px) so you don't have to go ALL the way to the edge of the screen, just outside the box.
        const TRIGGER_BUFFER = 20; 

        if (e.clientX < gridLeft - TRIGGER_BUFFER) {
            // Left of Grid
            if (!flipInterval.current) {
                flipInterval.current = setInterval(() => {
                    const { page } = stateRef.current;
                    if (page > 0) {
                        setDir(-1);
                        setPage(p => p - 1);
                    }
                }, 600);
            }
        } else if (e.clientX > gridRight + TRIGGER_BUFFER) {
            // Right of Grid
            if (!flipInterval.current) {
                flipInterval.current = setInterval(() => {
                    const { page, totalPages } = stateRef.current;
                    if (page < totalPages - 1) {
                        setDir(1);
                        setPage(p => p + 1);
                    }
                }, 600);
            }
        } else {
            // Inside Grid or near margin (Safety Zone)
            if (flipInterval.current) {
                clearInterval(flipInterval.current);
                flipInterval.current = null;
            }
        }

        // Grid Collision
        if (gridRef.current) {
            const gridRect = gridRef.current.getBoundingClientRect();
            const relX = e.clientX - gridRect.left;
            const relY = e.clientY - gridRect.top;

            if (relX >= 0 && relX <= gridRect.width && relY >= 0 && relY <= gridRect.height) {
                const col = Math.floor(relX / cellWidth);
                const row = Math.floor(relY / cellHeight);

                if (col >= 0 && col < cols && row >= 0 && row < rows) {
                    const targetItem = layoutItems.find(i =>
                        i.page === page &&
                        i.x <= col && col < i.x + (i.size?.w || 1) &&
                        i.y <= row && row < i.y + (i.size?.h || 1)
                    );

                    let insertIndex = -1;

                    if (targetItem) {
                        if (targetItem.isAdd) {
                            insertIndex = desktopApps.length;
                        } else {
                            insertIndex = desktopApps.findIndex(s => String(s.id) === String(targetItem.id));
                        }
                    } else {
                        // Hovering empty space
                        const pageItems = layoutItems.filter(i => i.page === page && !i.isAdd);
                        pageItems.sort((a, b) => (a.y - b.y) || (a.x - b.x));
                        const afterItem = pageItems.find(i => (i.y > row) || (i.y === row && i.x > col));

                        if (afterItem) {
                            insertIndex = desktopApps.findIndex(s => String(s.id) === String(afterItem.id));
                        } else {
                            insertIndex = desktopApps.length;
                        }
                    }

                    if (insertIndex !== -1 && dragState.item) {
                        if (dragState.source === 'dock') {
                            // Dock -> Grid
                            const newLayout = [...appLayout];
                            for (let i = 0; i < DOCK_RESERVED_SLOTS; i++) {
                                if (String(newLayout[i]?.id) === String(dragState.item!.id)) {
                                    newLayout[i] = null;
                                    break;
                                }
                            }
                            const desktopInsertIndex = DOCK_RESERVED_SLOTS + insertIndex;
                            newLayout.splice(desktopInsertIndex, 0, dragState.item as Shortcut);
                            setAppLayout(newLayout);
                            setDragState(prev => ({ ...prev, source: 'grid', index: insertIndex }));
                        } else if (dragState.source === 'grid') {
                            // Grid -> Grid
                            const desktopStart = DOCK_RESERVED_SLOTS;
                            const desktopItems = appLayout.slice(desktopStart).filter(i => i !== null);
                            const currentIndex = desktopItems.findIndex(s => String(s?.id) === String(dragState.item!.id));

                            if (currentIndex !== -1 && currentIndex !== insertIndex) {
                                const newDesktopItems = [...desktopItems];
                                const [moved] = newDesktopItems.splice(currentIndex, 1);
                                const adjustedInsert = currentIndex < insertIndex ? insertIndex - 1 : insertIndex;
                                newDesktopItems.splice(adjustedInsert, 0, moved);
                                
                                const newLayout = [
                                    ...appLayout.slice(0, desktopStart),
                                    ...newDesktopItems
                                ];
                                setAppLayout(newLayout);
                                setDragState(prev => ({ ...prev, index: adjustedInsert }));
                            }
                        }
                    }
                }
            }
        }

        // Dock Collision
        if (dockRef.current) {
             const dockRect = dockRef.current.getBoundingClientRect();
             // 扩大判定区域
             if (e.clientX >= dockRect.left - 50 && e.clientX <= dockRect.right + 50 && e.clientY >= dockRect.top - 80 && e.clientY <= dockRect.bottom + 40) {
                 // Dock constants (locally defined to match App.tsx or derived)
                 // NOTE: These should preferably match what's in Dock component
                 const DOCK_ICON_SIZE = 64;
                 const DOCK_ITEM_GAP = 20;
                 const DOCK_CONTAINER_PADDING = 24;
                 const SLOT_WIDTH = DOCK_ICON_SIZE + DOCK_ITEM_GAP;

                 const relX = e.clientX - dockRect.left;
                 let hoverIndex = Math.floor((relX - DOCK_CONTAINER_PADDING + (SLOT_WIDTH / 2)) / SLOT_WIDTH);
                 if (hoverIndex < 0) hoverIndex = 0;
                 if (hoverIndex > dockApps.length) hoverIndex = dockApps.length;

                 if (dragState.source === 'grid') {
                     // Grid -> Dock
                     const currentDockCount = appLayout.slice(0, DOCK_RESERVED_SLOTS).filter(i => i !== null).length;
                     if (currentDockCount >= DOCK_RESERVED_SLOTS) return;
                     
                     const desktopStart = DOCK_RESERVED_SLOTS;
                     const desktopItems = appLayout.slice(desktopStart).filter(i => i !== null);
                     const currentIndex = desktopItems.findIndex(s => String(s?.id) === String(dragState.item!.id));
                     
                     if (currentIndex !== -1) {
                         const moved = desktopItems[currentIndex];
                         if (moved) {
                             const newDesktopItems = desktopItems.filter(i => String(i?.id) !== String(moved.id));
                             const dockItem = { ...moved, size: { w: 1, h: 1 } };
                             const dockItems = appLayout.slice(0, DOCK_RESERVED_SLOTS).filter(i => i !== null);
                             dockItems.splice(hoverIndex, 0, dockItem);
                             
                             const newLayout = new Array(DOCK_RESERVED_SLOTS).fill(null);
                             dockItems.forEach((item, idx) => {
                                 if (idx < DOCK_RESERVED_SLOTS) newLayout[idx] = item;
                             });
                             
                             setAppLayout([...newLayout, ...newDesktopItems]);
                             setDragState(prev => ({ ...prev, source: 'dock', index: hoverIndex }));
                         }
                     }
                 } else if (dragState.source === 'dock' && hoverIndex !== dragState.index) {
                     // Dock -> Dock
                     const dockItems = appLayout.slice(0, DOCK_RESERVED_SLOTS).filter(i => i !== null);
                     
                     if (dragState.index >= 0 && dragState.index < dockItems.length) {
                         const [moved] = dockItems.splice(dragState.index, 1);
                         if (moved) {
                             dockItems.splice(hoverIndex, 0, moved);
                             const newLayout = new Array(DOCK_RESERVED_SLOTS).fill(null);
                             dockItems.forEach((item, idx) => {
                                 if (idx < DOCK_RESERVED_SLOTS) newLayout[idx] = item;
                             });
                             const desktopItems = appLayout.slice(DOCK_RESERVED_SLOTS);
                             setAppLayout([...newLayout, ...desktopItems]);
                             setDragState(prev => ({ ...prev, index: hoverIndex }));
                         }
                     }
                 }
             }
        }
    }, [dragState, appLayout, cols, rows, cellWidth, cellHeight, page, layoutItems, DOCK_RESERVED_SLOTS, dockApps.length, desktopApps.length]);

    const handlePointerUp = useCallback(() => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        if (flipInterval.current) {
            clearInterval(flipInterval.current);
            flipInterval.current = null;
        }
        setDragState(prev => ({ ...prev, isDragging: false }));
        
        // Just clear resizing state, size already updated during drag
        setResizingWidget(null);
    }, []);

    // Width Resize Handlers
    const handleResizeStart = useCallback((e: React.PointerEvent, widget: Shortcut) => {
        e.stopPropagation();
        e.preventDefault();
        setResizingWidget({
            id: widget.id,
            startW: widget.size?.w || 2,
            startH: widget.size?.h || 2,
            startX: e.clientX,
            startY: e.clientY
        });
    }, []);

    const handleResizeMove = useCallback((e: PointerEvent) => {
        if (!resizingWidget || cellWidth <= 0 || cellHeight <= 0) return;
        
        const deltaX = e.clientX - resizingWidget.startX;
        const deltaY = e.clientY - resizingWidget.startY;
        
        const newW = Math.max(1, Math.min(6, resizingWidget.startW + Math.round(deltaX / cellWidth)));
        const newH = Math.max(1, Math.min(6, resizingWidget.startH + Math.round(deltaY / cellHeight)));
        
        if (newW !== resizingWidget.newW || newH !== resizingWidget.newH) {
            setResizingWidget((prev: any) => prev ? { ...prev, newW, newH } : null);
            setAppLayout((prev: (import('../types').Shortcut | null)[]) => prev.map((item) => 
                item?.id === resizingWidget.id 
                    ? { ...item, size: { w: newW, h: newH } }
                    : item
            ));
        }
    }, [resizingWidget, cellWidth, cellHeight]);

    // Attach listeners
    useEffect(() => {
        if (resizingWidget) {
            window.addEventListener('pointermove', handleResizeMove);
            window.addEventListener('pointerup', handlePointerUp);
        }
        return () => {
            window.removeEventListener('pointermove', handleResizeMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [resizingWidget, handleResizeMove, handlePointerUp]);

    useEffect(() => {
        if (dragState.isDragging) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
        }
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [dragState.isDragging, handlePointerMove, handlePointerUp]);

    const handlePointerUpHandler = () => { if (longPressTimer.current) clearTimeout(longPressTimer.current); };

    return {
        isEditing,
        setIsEditing,
        dragState,
        setDragState,
        resizingWidget,
        handlePointerDown,
        handlePointerUp: handlePointerUpHandler,
        handleResizeStart
    };
}
