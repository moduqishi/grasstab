import React, { useState, useEffect } from 'react';
import { X, Minus, ArrowRight, Maximize2 } from 'lucide-react';

interface ResponsiveWindowProps {
    id: string;
    title: string;
    isOpen: boolean;
    onClose: () => void;
    zIndex: number;
    onFocus: () => void;
    children: React.ReactNode;
    defaultWidth: number;
    defaultHeight: number;
    isMaximized?: boolean;
    onToggleMaximize?: () => void;
}

const TrafficLights = ({ onClose, onMinimize, onMaximize, isMaximized }: { onClose: () => void, onMinimize: () => void, onMaximize: () => void, isMaximized: boolean }) => (
  <div className="flex gap-2.5 group px-5">
    <button onClick={onClose} className="w-[13px] h-[13px] rounded-full bg-[#FF5F56] border border-[#E0443E]/50 flex items-center justify-center text-black/40 shadow-sm transition-transform active:scale-90 hover:text-black/60" aria-label="Close window" title="Close"><X size={8} strokeWidth={3} className="opacity-0 group-hover:opacity-100 transition-opacity" /></button>
    <button onClick={onMinimize} className="w-[13px] h-[13px] rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 flex items-center justify-center text-black/40 shadow-sm transition-transform active:scale-90 hover:text-black/60" aria-label="Minimize window" title="Minimize"><Minus size={8} strokeWidth={3} className="opacity-0 group-hover:opacity-100 transition-opacity" /></button>
    <button onClick={onMaximize} className="w-[13px] h-[13px] rounded-full bg-[#27C93F] border border-[#1AAB29]/50 flex items-center justify-center text-black/40 shadow-sm transition-transform active:scale-90 hover:text-black/60" aria-label={isMaximized ? "Restore window" : "Maximize window"} title={isMaximized ? "Restore" : "Maximize"}>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            {isMaximized ? <Maximize2 size={6} strokeWidth={4} /> : <div className="transform rotate-45"><ArrowRight size={8} strokeWidth={3} className="-rotate-45" /></div>}
        </div>
    </button>
  </div>
);

export const ResponsiveWindow: React.FC<ResponsiveWindowProps> = ({ 
    title, isOpen, onClose, zIndex, onFocus, children, defaultWidth, defaultHeight, 
    isMaximized = false, onToggleMaximize 
}) => {
    const isMobile = window.innerWidth < 768;

    // LAZY INITIALIZATION: Calculate center immediately on mount to prevent top-left flash
    // This function runs synchronously during the first render
    const [pos, setPos] = useState(() => {
        if (isMobile) return { x: 0, y: 0 };
        return {
            x: Math.max(0, (window.innerWidth - defaultWidth) / 2),
            y: Math.max(0, (window.innerHeight - defaultHeight) / 2)
        };
    });
    
    const [size, setSize] = useState({ w: defaultWidth, h: defaultHeight });
    
    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const [dragRel, setDragRel] = useState({ x: 0, y: 0 });
    
    // Resize state
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        if (isMobile) return;
        const move = (e: MouseEvent) => {
            if (isDragging && !isMaximized) {
                const maxX = window.innerWidth - 100; // Allow some overlap
                const maxY = window.innerHeight - 50;
                setPos({ x: Math.max(-100, Math.min(e.clientX - dragRel.x, maxX)), y: Math.max(0, Math.min(e.clientY - dragRel.y, maxY)) });
            } else if (isResizing && !isMaximized) {
                const newW = Math.max(300, e.clientX - pos.x);
                const newH = Math.max(200, e.clientY - pos.y);
                setSize({ w: newW, h: newH });
            }
        };
        const up = () => { setIsDragging(false); setIsResizing(false); };
        
        if (isDragging || isResizing) { window.addEventListener('mousemove', move); window.addEventListener('mouseup', up); }
        else { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); }
        return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    }, [isDragging, isResizing, dragRel, pos, isMobile, isMaximized]);

    if (!isOpen) return null;

    const startDrag = (e: React.MouseEvent) => {
        if (isMobile || isMaximized || (e.target as HTMLElement).closest('.no-drag')) return;
        setIsDragging(true);
        setDragRel({ x: e.clientX - pos.x, y: e.clientY - pos.y });
        onFocus();
    };
    
    const startResize = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsResizing(true);
        onFocus();
    };

    const windowStyle: React.CSSProperties = isMobile 
        ? { 
            inset: '12px', 
            zIndex: 9999,
            backgroundColor: 'rgba(30, 30, 35, 0.85)',
            backdropFilter: 'blur(60px)',
            WebkitBackdropFilter: 'blur(60px)',
            boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6), 0 0 0 0.5px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            borderRadius: '16px'
        } 
        : {
            left: isMaximized ? 0 : `${pos.x}px`,
            top: isMaximized ? 0 : `${pos.y}px`,
            width: isMaximized ? '100%' : `${size.w}px`,
            height: isMaximized ? '100%' : `${size.h}px`,
            zIndex,
            backgroundColor: 'rgba(30, 30, 35, 0.85)',
            backdropFilter: 'blur(60px)',
            WebkitBackdropFilter: 'blur(60px)',
            boxShadow: isMaximized 
                ? '0 0 0 0.5px rgba(255, 255, 255, 0.1)'
                : '0 30px 60px rgba(0, 0, 0, 0.6), 0 0 0 0.5px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            borderRadius: isMaximized ? '0px' : '16px',
        };

    return (
        <div 
            className={`fixed flex flex-col overflow-hidden ${isOpen ? 'animate-in zoom-in-95' : ''} ${isDragging || isResizing ? 'transition-none' : 'transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1)'}`} 
            style={windowStyle}
            onMouseDown={onFocus}
        >
            {/* Window Header */}
            <div 
                className="h-[52px] flex items-center justify-between cursor-grab active:cursor-grabbing select-none shrink-0"
                style={{
                    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    borderBottom: '0.5px solid rgba(255, 255, 255, 0.1)'
                }}
                onMouseDown={startDrag}
            >
                <div className="flex items-center w-full relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2">
                        <TrafficLights onClose={onClose} onMinimize={onClose} onMaximize={onToggleMaximize || (() => {})} isMaximized={!!isMaximized} />
                    </div>
                    <span className="w-full text-center text-[15px] font-medium text-white/90 tracking-wide drop-shadow-sm pointer-events-none">{title}</span>
                </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 bg-transparent relative overflow-hidden no-drag flex flex-col">
                {children}
            </div>

            {/* Resize Handle */}
            {!isMaximized && !isMobile && (
                <div 
                    className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-center justify-center z-50 opacity-0 hover:opacity-100 transition-opacity"
                    onMouseDown={startResize}
                >
                    <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                </div>
            )}
        </div>
    );
};