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
    const stateRef = useRef({ page, totalPages, appLayout, cols, rows, cellWidth, cellHeight, layoutItems, DOCK_RESERVED_SLOTS, dockAppsLength: dockApps.length, desktopAppsLength: desktopApps.length });
    
    // Cache DOM Rects to avoid reflows during drag
    const cachedRects = useRef<{ 
        grid: DOMRect | null, 
        dock: DOMRect | null 
    }>({ grid: null, dock: null });

    // Request Animation Frame reference for throttling
    const rafRef = useRef<number | null>(null);

    // Keep stateRef up to date with latest props that are used inside the raf callback
    useEffect(() => {
        stateRef.current = { 
            page, totalPages, 
            appLayout, cols, rows, cellWidth, cellHeight, 
            layoutItems, DOCK_RESERVED_SLOTS, 
            dockAppsLength: dockApps.length, 
            desktopAppsLength: desktopApps.length 
        };
    }, [page, totalPages, appLayout, cols, rows, cellWidth, cellHeight, layoutItems, DOCK_RESERVED_SLOTS, dockApps.length, desktopApps.length]);

    // --- Interaction Handlers ---
    const handlePointerDown = (e: React.PointerEvent, index: number, source: 'grid' | 'dock', item: any) => {
        if (item.id === 'edit' || item.id === 'dock-edit-btn') return;
        if (index === -1) return;

        e.preventDefault();

        if (!isEditing) {
            longPressTimer.current = setTimeout(() => { setIsEditing(true); }, 800);
            return;
        }

        // Cache rects at the start of drag
        if (gridRef.current) cachedRects.current.grid = gridRef.current.getBoundingClientRect();
        if (dockRef.current) cachedRects.current.dock = dockRef.current.getBoundingClientRect();

        setDragState({
            isDragging: true,
            source,
            index, // For grid, index in desktopApps. For dock, index in dockItems.
            item,
            mx: e.clientX,
            my: e.clientY
        });
    };

    const handleDragLogic = useCallback((clientX: number, clientY: number) => {
        // --- Edge Detection for Auto-Page Flip (Outside Grid Box) ---
        const screenWidth = window.innerWidth;
        const gridLeft = (screenWidth - gridWidth) / 2;
        const gridRight = gridLeft + gridWidth;
        const TRIGGER_BUFFER = 20; 

        if (clientX < gridLeft - TRIGGER_BUFFER) {
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
        } else if (clientX > gridRight + TRIGGER_BUFFER) {
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

        // Access latest state from ref to avoid closure staleness in RAF
        const { 
            appLayout, cols, rows, cellWidth, cellHeight, 
            layoutItems, page, DOCK_RESERVED_SLOTS 
        } = stateRef.current;

        // Grid Collision
        const gridRect = cachedRects.current.grid;
        if (gridRect) {
            const relX = clientX - gridRect.left;
            const relY = clientY - gridRect.top;

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
                    const desktopStart = DOCK_RESERVED_SLOTS;
                    const desktopItems = appLayout.slice(desktopStart).filter(i => i !== null);


                    if (targetItem) {
                        if (targetItem.isAdd) {
                            insertIndex = desktopItems.length;
                        } else {
                            insertIndex = desktopItems.findIndex(s => String(s.id) === String(targetItem.id));
                        }
                    } else {
                        // Hovering empty space
                        const pageItems = layoutItems.filter(i => i.page === page && !i.isAdd);
                        pageItems.sort((a, b) => (a.y - b.y) || (a.x - b.x));
                        const afterItem = pageItems.find(i => (i.y > row) || (i.y === row && i.x > col));

                        if (afterItem) {
                            insertIndex = desktopItems.findIndex(s => String(s.id) === String(afterItem.id));
                        } else {
                            insertIndex = desktopItems.length;
                        }
                    }

                    if (insertIndex !== -1) {
                         // We need the current dragged item from state (passed via closure is tricky in RAF if we used setState)
                         // But here we rely on the implementation NOT to change dragState during drag except for index/source updates
                         // which we handle via setAppLayout.
                         // Wait, we need the *current* dragging item ID. rAF doesn't receive arguments.
                         // We will pass the item ID via a ref if needed, or assume it doesn't change during one drag session.
                         // It's safer to not rely on `dragState.item` from the outer scope if it changes.
                         // However, `dragState` is in `useCallback` dependency of `handlePointerMove` which triggers rAF.
                         // So the `item` in `dragState` there is correct.
                         // BUT, `handleDragLogic` is called by `handlePointerMove`.
                         
                         // The issue: We need `setAppLayout` to be called.
                         // React batching handles it, but expensive calc is what we wanted to avoid.
                         // We already avoided the rect reflow.
                         
                         // Note: We need the *latest* appLayout for collision logic, which we got from stateRef.
                         // We need `dragState` from the *caller* (handlePointerMove capture).
                         
                         // Let's return the action to perform instead of performing it here? 
                         // No, we can perform it.
                    }
                }
            }
        }
        
    }, [gridWidth]); // Dependencies that rarely change

    const handlePointerMove = useCallback((e: PointerEvent) => {
        if (!dragState.isDragging || !dragState.item) return;
        
        // 1. Update visual position (optional, usually handled by CSS/DragLayer, but if we track in state...)
        // setDragState(prev => ({ ...prev, mx: e.clientX, my: e.clientY })); // Removed as per previous optimization
        
        // 2. Schedule logic update
        if (rafRef.current) return; // Drop frame if busy

        const clientX = e.clientX;
        const clientY = e.clientY;
        const draggingItem = dragState.item;
        const draggingSource = dragState.source;
        const draggingIndex = dragState.index;

        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            
            // --- Logic formerly in handlePointerMove ---
            const { 
                appLayout, cols, rows, cellWidth, cellHeight, 
                layoutItems, page, DOCK_RESERVED_SLOTS,
                dockAppsLength, desktopAppsLength
            } = stateRef.current;

             // ... Edge detection ...
             handleDragLogic(clientX, clientY);

             // ... Grid/Dock Collision with latest state ...
             // We duplicated logic in handleDragLogic above, but let's inline it properly here for access to variables.
             // (Refactoring to a pure function would be cleaner but let's fix the inline logic 1st)

            // --- RE-IMPLEMENTATION OF COLLISION LOGIC INSIDE RAF ---
            
            // Grid Collision
             const gridRect = cachedRects.current.grid;
             if (gridRect) {
                 const relX = clientX - gridRect.left;
                 const relY = clientY - gridRect.top;
     
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
                         const desktopStart = DOCK_RESERVED_SLOTS;
                         const desktopItems = appLayout.slice(desktopStart).filter(i => i !== null);
     
                         if (targetItem) {
                             if (targetItem.isAdd) {
                                 insertIndex = desktopItems.length;
                             } else {
                                 insertIndex = desktopItems.findIndex(s => String(s.id) === String(targetItem.id));
                             }
                         } else {
                             const pageItems = layoutItems.filter(i => i.page === page && !i.isAdd);
                             pageItems.sort((a, b) => (a.y - b.y) || (a.x - b.x));
                             const afterItem = pageItems.find(i => (i.y > row) || (i.y === row && i.x > col));
     
                             if (afterItem) {
                                 insertIndex = desktopItems.findIndex(s => String(s.id) === String(afterItem.id));
                             } else {
                                 insertIndex = desktopItems.length;
                             }
                         }
     
                         if (insertIndex !== -1) {
                             if (draggingSource === 'dock') {
                                 // Dock -> Grid
                                 const newLayout = [...appLayout];
                                 // Remove from dock
                                 // Note: We need to find where it IS currently in the layout array (it might have moved?)
                                 // The `dragState.item` is the static app data.
                                 const currentDockIndex = newLayout.slice(0, DOCK_RESERVED_SLOTS).findIndex(i => String(i?.id) === String(draggingItem.id));
                                 
                                 if (currentDockIndex !== -1) {
                                    newLayout[currentDockIndex] = null;
                                 
                                    // Insert into desktop
                                    const desktopInsertIndex = DOCK_RESERVED_SLOTS + insertIndex;
                                    newLayout.splice(desktopInsertIndex, 0, draggingItem as Shortcut);
                                    
                                    setAppLayout(newLayout);
                                    setDragState(prev => ({ ...prev, source: 'grid', index: insertIndex }));
                                 }
                             } else if (draggingSource === 'grid') {
                                 // Grid -> Grid
                                 const currentIndex = desktopItems.findIndex(s => String(s?.id) === String(draggingItem.id));
     
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
             const dockRect = cachedRects.current.dock;
             if (dockRect) {
                  if (clientX >= dockRect.left - 50 && clientX <= dockRect.right + 50 && clientY >= dockRect.top - 80 && clientY <= dockRect.bottom + 40) {
                      const DOCK_ICON_SIZE = 64;
                      const DOCK_ITEM_GAP = 20;
                      const DOCK_CONTAINER_PADDING = 24;
                      const SLOT_WIDTH = DOCK_ICON_SIZE + DOCK_ITEM_GAP;
     
                      const relX = clientX - dockRect.left;
                      let hoverIndex = Math.floor((relX - DOCK_CONTAINER_PADDING + (SLOT_WIDTH / 2)) / SLOT_WIDTH);
                      if (hoverIndex < 0) hoverIndex = 0;
                      if (hoverIndex > dockAppsLength) hoverIndex = dockAppsLength; // Use tracked length
     
                      if (draggingSource === 'grid') {
                          // Grid -> Dock
                          const currentDockCount = appLayout.slice(0, DOCK_RESERVED_SLOTS).filter(i => i !== null).length;
                          if (currentDockCount < DOCK_RESERVED_SLOTS) {
                              const desktopStart = DOCK_RESERVED_SLOTS;
                              const desktopItems = appLayout.slice(desktopStart).filter(i => i !== null);
                              const currentIndex = desktopItems.findIndex(s => String(s?.id) === String(draggingItem.id));
                              
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
                          }
                      } else if (draggingSource === 'dock' && hoverIndex !== draggingIndex) {
                          // Dock -> Dock
                          const dockItems = appLayout.slice(0, DOCK_RESERVED_SLOTS).filter(i => i !== null);
                          
                          // Validate index range
                          if (draggingIndex >= 0 && draggingIndex < dockItems.length) {
                              const [moved] = dockItems.splice(draggingIndex, 1);
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

        });

    }, [dragState, gridWidth, handleDragLogic]); // Depend on dragState to know when dragging stops/starts

    const handlePointerUp = useCallback(() => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        if (flipInterval.current) {
            clearInterval(flipInterval.current);
            flipInterval.current = null;
        }
        
        // Cancel any pending frame
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }

        setDragState(prev => ({ ...prev, isDragging: false }));
        setResizingWidget(null);
        
        // Clear cached rects
        cachedRects.current = { grid: null, dock: null };
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
