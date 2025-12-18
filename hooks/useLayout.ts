import { useState, useMemo, useEffect } from 'react';
import { useGridCalculation } from './useGridCalculation';
import { Shortcut } from '../types';
import { packItems } from '../utils';

export function useLayout(
    desktopApps: Shortcut[], 
    isMobile: boolean, 
    showDock: boolean
) {
    const { cols, rows, itemsPerPage, cellWidth, cellHeight, gridWidth, iconSize } = useGridCalculation(showDock);
    const [page, setPage] = useState(0);
    const [dir, setDir] = useState(0);

    // PACKING ALGORITHM
    const layoutItems = useMemo(() => {
        if (!Array.isArray(desktopApps) || !cols || !rows) return [];
        try {
            const itemsToPack = [...desktopApps, { id: 'add-btn', isAdd: true, type: 'sys' as const, color: '', size: { w: 1, h: 1 } }];
            return packItems(itemsToPack, cols, rows);
        } catch (error) {
            console.error('Error packing items:', error);
            return [];
        }
    }, [desktopApps, cols, rows]);

    // Calculate total pages
    const totalPages = Math.max(1, layoutItems.length > 0 ? Math.max(...layoutItems.map(i => i.page)) + 1 : 1);

    useEffect(() => {
        if (page >= totalPages) setPage(Math.max(0, totalPages - 1));
    }, [totalPages, page]);

    const changePage = (delta: number) => {
        if (delta > 0 && page < totalPages - 1) { setDir(1); setPage(p => p + 1); }
        else if (delta < 0 && page > 0) { setDir(-1); setPage(p => p - 1); }
    };

    return {
        cols, rows, itemsPerPage, cellWidth, cellHeight, gridWidth, iconSize,
        page, setPage,
        dir, setDir,
        layoutItems,
        totalPages,
        changePage
    };
}
