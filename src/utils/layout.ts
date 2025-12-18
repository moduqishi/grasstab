import { Shortcut, PackedShortcut } from '../types';

// --- Layout Engine (Bin Packing) ---
export const packItems = (items: Shortcut[], cols: number, rows: number): PackedShortcut[] => {
    if (!items || !cols || !rows) return [];

    const packedItems: PackedShortcut[] = [];
    const pages: boolean[][][] = []; // pages[pageIndex][y][x] = occupied?

    const ensurePage = (pageIdx: number) => {
        while (pages.length <= pageIdx) {
            const newPage = Array(rows).fill(null).map(() => Array(cols).fill(false));
            pages.push(newPage);
        }
    };

    const isOccupied = (pageIdx: number, x: number, y: number, w: number, h: number) => {
        ensurePage(pageIdx);
        const grid = pages[pageIdx];

        // Bounds check
        if (x + w > cols || y + h > rows) return true;

        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                // Safety check for grid boundaries
                if (y + dy >= rows || x + dx >= cols) return true;
                if (grid[y + dy][x + dx]) return true;
            }
        }
        return false;
    };

    const markOccupied = (pageIdx: number, x: number, y: number, w: number, h: number) => {
        ensurePage(pageIdx);
        const grid = pages[pageIdx];
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                if (y + dy < rows && x + dx < cols) {
                    grid[y + dy][x + dx] = true;
                }
            }
        }
    };

    items.forEach(item => {
        if (!item) return; // Safety check to prevent crash if array has holes

        // Clamp dimensions to grid size to prevent infinite loops
        // Use optional chaining (?.) and fallback to prevent 'reading size of undefined' crashes
        const w = Math.min(cols, Math.max(1, item?.size?.w || 1));
        const h = Math.min(rows, Math.max(1, item?.size?.h || 1));

        let placed = false;
        let pageIdx = 0;
        const MAX_PAGES = 20; // Safety break to prevent infinite loops in edge cases

        // Try to place in earliest possible page
        while (!placed && pageIdx < MAX_PAGES) {
            ensurePage(pageIdx);

            // Scan current page grid
            searchLoop:
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    if (!isOccupied(pageIdx, x, y, w, h)) {
                        markOccupied(pageIdx, x, y, w, h);
                        packedItems.push({ ...item, x, y, page: pageIdx, size: { w, h } });
                        placed = true;
                        break searchLoop;
                    }
                }
            }

            if (!placed) pageIdx++;
        }
    });

    return packedItems;
};
