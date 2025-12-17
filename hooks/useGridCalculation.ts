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
    bottomReserved: 180
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

            // ============ 动态计算顶部预留空间 ============
            // INSTRUCTION: Use 54% of window height for grid area (Zone 3)
            // The vertically flexible layout reserves:
            // 18% Top (Time)
            // 10% Search
            // 54% Grid (THIS)
            // 3% Indicators
            // 15% Dock
            
            let availableHeight = h * 0.54;

            // ============ 动态计算图标高度 ============
            let itemHeight: number;
            if (isMobile) {
                itemHeight = w < BREAKPOINTS.mobileSmall ? 90 : 
                           interpolate(w, BREAKPOINTS.mobileSmall, BREAKPOINTS.mobileLarge, 90, 100);
            } else {
                if (w < BREAKPOINTS.tablet) {
                    itemHeight = 115;
                } else if (w < BREAKPOINTS.laptop) {
                    itemHeight = interpolate(w, BREAKPOINTS.tablet, BREAKPOINTS.laptop, 115, 125);
                } else if (w < BREAKPOINTS.desktop) {
                    itemHeight = interpolate(w, BREAKPOINTS.laptop, BREAKPOINTS.desktop, 125, 130);
                } else {
                    // 超大屏幕可以稍微增大图标
                    itemHeight = w < BREAKPOINTS.large ? 130 : 
                               interpolate(w, BREAKPOINTS.desktop, BREAKPOINTS.large, 130, 140);
                }
            }

            const maxGridWidth = Math.min(w * 0.92, w < BREAKPOINTS.desktop ? 1200 : 1400);

            // ============ 动态计算列数 ============
            let cols: number;
            if (w < BREAKPOINTS.mobileSmall) {
                cols = 3;
            } else if (w < BREAKPOINTS.mobileLarge) {
                cols = 4;
            } else if (w < BREAKPOINTS.tablet) {
                cols = 6;
            } else if (w < BREAKPOINTS.laptop) {
                cols = 6;
            } else if (w < BREAKPOINTS.desktop) {
                cols = 6;
            } else if (w < BREAKPOINTS.large) {
                cols = 8;
            } else {
                // 超大屏幕可以显示更多列
                cols = 10;
            }

            // ============ 动态计算行数 ============
            let rows = Math.floor(availableHeight / itemHeight);

            // 确保至少显示 3 行
            const MIN_ROWS = 3;
            if (rows < MIN_ROWS) {
                const spacing = 10;
                itemHeight = Math.floor((availableHeight - spacing * (MIN_ROWS - 1)) / MIN_ROWS);
                
                // 确保 itemHeight 不会太小
                const minItemHeight = isMobile ? 80 : 90;
                if (itemHeight < minItemHeight) {
                    itemHeight = minItemHeight;
                    availableHeight = itemHeight * MIN_ROWS + spacing * (MIN_ROWS - 1);
                }
                
                rows = MIN_ROWS;
            }

            // 最大行数限制（根据屏幕宽度动态调整）
            let maxRows: number;
            if (w < BREAKPOINTS.tablet) {
                maxRows = 4;
            } else if (w < BREAKPOINTS.desktop) {
                maxRows = 4;
            } else if (w < BREAKPOINTS.large) {
                maxRows = 5;
            } else {
                maxRows = 6;  // 超大屏幕可以显示更多行
            }
            
            rows = clamp(rows, MIN_ROWS, maxRows);

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