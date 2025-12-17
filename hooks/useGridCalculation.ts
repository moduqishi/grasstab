import { useState, useEffect } from 'react';
import { LayoutConfig } from '../types';

// ============ 辅助函数 ============

/**
 * 线性插值函数：在两个值之间平滑过渡
 */
function interpolate(value: number, min: number, max: number, outputMin: number, outputMax: number): number {
    if (value <= min) return outputMin;
    if (value >= max) return outputMax;
    const ratio = (value - min) / (max - min);
    return outputMin + ratio * (outputMax - outputMin);
}

/**
 * 边界限制函数：确保值在合理范围内
 */
function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * 检测宽高比是否在合理范围内
 */
function checkAspectRatio(w: number, h: number): boolean {
    const ratio = w / h;
    return ratio >= 0.5 && ratio <= 3.5;  // 支持竖屏到超宽屏
}

// ============ 关键断点配置 ============

const BREAKPOINTS = {
    // 移动端
    mobileSmall: 640,   // 小手机
    mobileLarge: 768,   // 大手机/小平板
    // 平板/笔记本
    tablet: 1024,       // 平板/小笔记本
    laptop: 1440,       // 标准笔记本
    // 桌面
    desktop: 1920,      // Full HD
    large: 2560         // 2K+
};

// 安全默认值（用于异常情况降级）
const SAFE_DEFAULTS = {
    cols: 6,
    rows: 3,
    itemHeight: 120,
    topReserved: 350,
    bottomReserved: 180,
    iconSize: 78
};

export const useGridCalculation = (showDock: boolean = true): LayoutConfig => {
    const [layout, setLayout] = useState<LayoutConfig>({ 
        cols: 6, rows: 3, itemsPerPage: 18, isMobile: false, 
        cellWidth: 100, cellHeight: 120, gridWidth: 1000 
    });

    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            
            // 检测异常宽高比，使用降级策略
            if (!checkAspectRatio(w, h)) {
                console.warn('Unusual aspect ratio detected, using safe defaults');
                const maxGridWidth = Math.min(w * 0.92, 1200);
                const cellWidth = maxGridWidth / SAFE_DEFAULTS.cols;
                setLayout({
                    cols: SAFE_DEFAULTS.cols,
                    rows: SAFE_DEFAULTS.rows,
                    itemsPerPage: SAFE_DEFAULTS.cols * SAFE_DEFAULTS.rows,
                    isMobile: w < BREAKPOINTS.mobileLarge,
                    cellWidth,
                    cellHeight: SAFE_DEFAULTS.itemHeight,
                    gridWidth: maxGridWidth
                });
                return;
            }

            const isMobile = w < BREAKPOINTS.mobileLarge;

            // ============ Layout Logic ============
            // User Request: 
            // - 27" Large Screen -> 8 cols x 5 rows
            // - <16" Small Screen (Laptops) -> 6 cols x 4 rows
            // - Tablet Landscape -> 6 cols x 4 rows
            
            // We use logical CSS pixels to determine "Real Estate".
            // - 1920px (Full HD Desktop) usually means meaningful desktop space.
            // - 1728px (16" MacBook Pro) and below fall into "Laptop" category.
            // Threshold set to 1800px to separate robust desktops from laptops.

            const isLandscape = w > h;
            const isLargeScreen = w >= 1800; // 27 inch+ zone (1920px / 2560px)
            const isLaptopOrTablet = w >= 640 && w < 1800; // 13"-16" Laptops & Tablets

            let cols = 4;
            let rows = 4;

            if (isLargeScreen) {
                // 27" Large Screen
                cols = 8;
                rows = 5;
            } else if (isLaptopOrTablet) {
                if (isLandscape) {
                    // Standard Laptop (13-16") & Tablet Landscape
                    cols = 6;
                    rows = 4;
                } else {
                    // Tablet Portrait
                    cols = 5;
                    rows = 6;
                }
            } else {
                // Mobile (< 640px)
                cols = 4;
                rows = 4;
            }

            // Available Height (54% of screen)
            const availableHeight = h * 0.54;
            
            // Limit max Grid Width to prevent "stretching" on ultra-wide
            // Keep it relatively centered
            const maxGridWidth = Math.min(w * 0.9, 1400); 

            // Calculate Cell Dimensions
            const cellWidth = maxGridWidth / cols;
            const cellHeight = availableHeight / rows;
            const minDim = Math.min(cellWidth, cellHeight);

            // Icon Size Calculation
            // Target Ratio: Icon : Gap ~= 1 : 0.45
            // Icon + Gap = Cell => Icon + 0.45*Icon = Cell => 1.45*Icon = Cell
            // Icon = Cell / 1.45 ~= Cell * 0.69
            let iconSize = minDim * 0.7;

            // Clamp Icon Size
            // Max 72px (Slightly larger than 67 to allow breathing on big screens)
            // Min 48px (Touch target)
            iconSize = Math.max(48, Math.min(iconSize, 78)); 

            setLayout({
                cols,
                rows,
                itemsPerPage: cols * rows,
                isMobile: w < 768,
                cellWidth,
                cellHeight,
                gridWidth: maxGridWidth,
                iconSize
            });
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [showDock]);

    return layout;
};