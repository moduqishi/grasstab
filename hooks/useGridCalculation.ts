import { useState, useEffect } from 'react';
import { LayoutConfig } from '../types';

export const useGridCalculation = (showDock: boolean = true): LayoutConfig => {
    const [layout, setLayout] = useState<LayoutConfig>({ cols: 6, rows: 3, itemsPerPage: 18, isMobile: false, cellWidth: 100, cellHeight: 120, gridWidth: 1000 });

    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const isMobile = w < 768;

            const topReserved = 380;
            const bottomReserved = showDock ? 200 : 60;
            const availableHeight = Math.max(100, h - topReserved - bottomReserved);
            
            const itemHeight = isMobile ? 100 : 130;
            const maxGridWidth = Math.min(w * 0.92, 1200);
            
            let cols = 3;
            if (w >= 640) cols = 4;
            if (w >= 768) cols = 6;
            if (w >= 1280) cols = 8;

            let rows = Math.floor(availableHeight / itemHeight);
            if (rows < 1) rows = 1;
            if (rows > 4) rows = 4; 

            const cellWidth = maxGridWidth / cols;

            setLayout({ 
                cols, 
                rows, 
                itemsPerPage: cols * rows, 
                isMobile, 
                cellWidth, 
                cellHeight: itemHeight,
                gridWidth: maxGridWidth
            });
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [showDock]);

    return layout;
};