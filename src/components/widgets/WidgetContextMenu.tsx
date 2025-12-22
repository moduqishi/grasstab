import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Shortcut } from '../../types';
import { 
    Maximize2, 
    Trash2, 
    Edit2, 
    RefreshCw, 
    Move,
    Copy,
    ExternalLink
} from 'lucide-react';
import { useConfig } from '../../config/ConfigContext';

interface WidgetContextMenuProps {
    x: number;
    y: number;
    widget: Shortcut;
    onClose: () => void;
    onToggleEdit: () => void;
    onDelete: () => void;
    onReload?: () => void;
}

export const WidgetContextMenu: React.FC<WidgetContextMenuProps> = ({
    x,
    y,
    widget,
    onClose,
    onToggleEdit,
    onDelete,
    onReload
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Prevent overflow (basic logic)
    const style = {
        top: Math.min(y, window.innerHeight - 250),
        left: Math.min(x, window.innerWidth - 200),
    };

    return createPortal(
        <div 
            ref={menuRef}
            className="fixed z-[9999] w-56 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5"
            style={style}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
        >
            <div className="px-3 py-2 border-b border-white/5 mb-1">
                 <div className="text-xs font-semibold text-white/50 uppercase tracking-wider">Widget Actions</div>
                 <div className="text-sm text-white font-medium truncate">{widget.title || 'Untitled Widget'}</div>
            </div>

            <MenuItem 
                icon={<Move size={16} />} 
                label="进入编辑模式" 
                shortcut="Long Press"
                onClick={() => {
                    onToggleEdit();
                    onClose();
                }} 
            />

            {widget.widgetType === 'iframe' && widget.url && (
                <MenuItem 
                    icon={<ExternalLink size={16} />} 
                    label="在新标签页打开" 
                    onClick={() => {
                        window.open(widget.url, '_blank');
                        onClose();
                    }} 
                />
            )}
            
            <MenuItem 
                icon={<RefreshCw size={16} />} 
                label="刷新组件" 
                onClick={() => {
                    if (onReload) onReload();
                    // Basic hack reload for now if no handler: force re-render parent?
                    // Ideally we pass a key to valid widget reloading
                    onClose();
                }} 
            />

            <div className="h-px bg-white/10 my-1 mx-2" />
            
            <MenuItem 
                icon={<Trash2 size={16} className="text-red-400" />} 
                label="移除组件" 
                className="text-red-400 hover:bg-red-500/20"
                onClick={() => {
                    onDelete();
                    onClose();
                }} 
            />
        </div>,
        document.body
    );
};

interface MenuItemProps {
    icon: React.ReactNode;
    label: string;
    shortcut?: string;
    onClick: () => void;
    className?: string; // Tailwind overrides
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, shortcut, onClick, className }) => {
    return (
        <button 
            className={`w-full px-3 py-2 flex items-center justify-between text-left hover:bg-white/10 transition-colors group ${className || 'text-white/90'}`}
            onClick={onClick}
        >
            <div className="flex items-center gap-3">
                <span className="opacity-70 group-hover:opacity-100 transition-opacity">{icon}</span>
                <span className="text-[13px]">{label}</span>
            </div>
            {shortcut && <span className="text-[10px] text-white/30 font-medium">{shortcut}</span>}
        </button>
    );
};
