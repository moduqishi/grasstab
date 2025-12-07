import { useState, useEffect } from 'react';
import { LayoutConfig } from '../types';

export const useGridCalculation = (showDock: boolean = true): LayoutConfig => {
    const [layout, setLayout] = useState<LayoutConfig>({ cols: 6, rows: 3, itemsPerPage: 18, isMobile: false, cellWidth: 100, cellHeight: 120, gridWidth: 1000 });

    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const isMobile = w < 768;

            // 根据屏幕大小调整预留空间
            const topReserved = isMobile ? (w < 640 ? 250 : 320) : 380;
            const bottomReserved = isMobile 
                ? (showDock ? (w < 640 ? 140 : 160) : 40)
                : (showDock ? 200 : 60);
            let availableHeight = Math.max(100, h - topReserved - bottomReserved);
            
            // 移动端使用更小的图标
            let itemHeight = isMobile ? (w < 640 ? 90 : 100) : 130;
            const maxGridWidth = Math.min(w * 0.92, 1200);
            
            let cols = 3;
            if (w >= 640) cols = 4;
            if (w >= 768) cols = 6;
            if (w >= 1280) cols = 8;

            // 计算初始行数
            let rows = Math.floor(availableHeight / itemHeight);
            
            // 确保至少显示 3 行
            const MIN_ROWS = 3;
            if (rows < MIN_ROWS) {
                // 如果计算出的行数少于 3 行，动态调整 itemHeight
                // 为每行图标之间留出一些间距 (约 10px)
                const spacing = 10;
                itemHeight = Math.floor((availableHeight - spacing * (MIN_ROWS - 1)) / MIN_ROWS);
                
                // 确保 itemHeight 不会太小（最小 80px）
                if (itemHeight < 80) {
                    itemHeight = 80;
                    // 如果还是放不下，减少可用高度的保留空间
                    availableHeight = itemHeight * MIN_ROWS + spacing * (MIN_ROWS - 1);
                }
                
                rows = MIN_ROWS;
            }
            
            // 最大行数限制（允许大屏幕显示更多行）
            if (rows > 5) rows = 5;

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