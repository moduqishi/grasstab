import React from 'react';
import { Check, Edit3, Wallpaper, RefreshCw } from 'lucide-react';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onEdit: () => void;
    onChangeWallpaper: () => void;
    onReset: () => void;
    isEditing: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onEdit, onChangeWallpaper, onReset, isEditing }) => (
    <div 
        className="fixed z-[10000] w-48 bg-[#2c2c2e]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1.5 flex flex-col text-sm text-white/90 animate-in fade-in zoom-in-95 duration-100 origin-top-left"
        style={{ left: x, top: y }}
        onClick={(e) => e.stopPropagation()}
    >
        <button onClick={() => { onEdit(); onClose(); }} className="px-3 py-1.5 hover:bg-blue-600 flex items-center gap-2 transition-colors text-left mx-1 rounded-md">
            {isEditing ? <><Check size={14}/> Done Editing</> : <><Edit3 size={14}/> Edit Home Screen</>}
        </button>
        <button onClick={() => { onChangeWallpaper(); onClose(); }} className="px-3 py-1.5 hover:bg-blue-600 flex items-center gap-2 transition-colors text-left mx-1 rounded-md">
            <Wallpaper size={14}/> Change Wallpaper
        </button>
        <div className="h-[1px] bg-white/10 my-1 mx-2"></div>
        <button onClick={() => { onReset(); onClose(); }} className="px-3 py-1.5 hover:bg-red-600/80 flex items-center gap-2 transition-colors text-left mx-1 rounded-md text-red-300 hover:text-white">
            <RefreshCw size={14}/> Reset Layout
        </button>
    </div>
);