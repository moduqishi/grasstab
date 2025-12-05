import React, { useEffect, useRef } from 'react';
import { Edit, Trash2 } from 'lucide-react';

interface AppContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export const AppContextMenu: React.FC<AppContextMenuProps> = ({ x, y, onClose, onEdit, onDelete }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Auto-positioning to prevent off-screen rendering
    const menuWidth = 220;
    const menuHeight = 120;
    const adjustedX = Math.min(x, window.innerWidth - menuWidth - 10);
    const adjustedY = Math.min(y, window.innerHeight - menuHeight - 10);

    return (
        <div
            ref={menuRef}
            className="fixed z-[10000] w-[220px] rounded-2xl overflow-hidden flex flex-col text-sm text-white animate-in fade-in zoom-in-95 duration-150 origin-top-left"
            style={{ 
                left: `${adjustedX}px`, 
                top: `${adjustedY}px`,
                backgroundColor: 'rgba(44, 44, 46, 0.95)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 0.5px rgba(255, 255, 255, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <button
                onClick={() => { onEdit(); onClose(); }}
                className="w-full px-4 py-2.5 text-left hover:bg-white/10 transition-colors flex items-center gap-3"
            >
                <Edit size={16} className="text-white/70" />
                <span className="font-medium">编辑</span>
            </button>

            <div style={{ height: '0.5px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />

            <button
                onClick={() => { onDelete(); onClose(); }}
                className="w-full px-4 py-2.5 text-left hover:bg-red-500/20 transition-colors flex items-center gap-3 text-red-400"
            >
                <Trash2 size={16} />
                <span className="font-medium">删除</span>
            </button>
        </div>
    );
};
