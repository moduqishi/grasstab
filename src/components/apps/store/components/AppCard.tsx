import React from 'react';
import { motion } from 'framer-motion';
import { Box, Layers } from 'lucide-react';
import { StoreApp, StoreWidget } from '../types';
import { AppIcon } from '../../../AppIcon';

interface AppCardProps {
    item: StoreApp | StoreWidget;
    isInstalled: boolean;
    onInstall: (item: StoreApp | StoreWidget) => void;
    installing: boolean;
    onClick: () => void;
}

export const AppCard = React.memo(({ item, isInstalled, onInstall, installing, onClick }: AppCardProps) => {
    // Basic heuristic same as index.tsx to decide icon
    const isWidget = ['Clock', 'Weather', 'Utility', 'Widget'].includes(item.category);
    const TypeIcon = isWidget ? Layers : Box;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="group relative flex flex-col items-center cursor-pointer p-2"
            onClick={onClick}
        >
            {/* App Icon */}
            <div className="relative w-20 h-20 mb-3 transition-transform duration-300 group-hover:scale-105">
                 <div className="w-full h-full rounded-[22%] overflow-hidden bg-[#1c1c1e] shadow-xl group-hover:shadow-2xl transition-all border border-white/5 flex items-center justify-center">
                    <AppIcon 
                        {...item.shortcut}
                        title={item.name}
                        customIcon={item.icon}
                        id={item.id}
                        // Use item.shortcut.url for auto-discovery if custom icon fails
                        url={item.shortcut.url}
                    />
                </div>
            </div>
    
            {/* App Info */}
            <div className="flex flex-col items-center w-full px-1 text-center relative">
                 <div className="relative inline-flex items-center justify-center max-w-full">
                     <div className="absolute right-full mr-1.5 flex items-center justify-center top-1/2 -translate-y-1/2">
                        <TypeIcon size={12} className="text-gray-500 opacity-60" />
                     </div>
                    <h3 className="text-white font-medium text-[13px] leading-tight line-clamp-1 break-all group-hover:text-blue-400 transition-colors">
                        {item.name}
                    </h3>
                </div>
            </div>
        </motion.div>
    );
});
