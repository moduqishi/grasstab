import { 
    Search, Sparkles, Box, Layers, Gamepad, Briefcase, Code, PenTool, 
    Cloud, Clock, Calendar, Brain, GraduationCap, CreditCard, Heart, 
    Music, Newspaper, ShoppingBag, Users, Wrench, Plane, Video,
    Book, Film, MessageCircle, Map, Landmark
} from 'lucide-react';
import { ViewMode } from '../types';

interface SidebarProps {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    activeCategory: string | null;
    setActiveCategory: (cat: string | null) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    appCategories: string[];
    widgetCategories: string[];
    categoryCounts: Record<string, number>;
}

const SidebarItem = ({ 
    active, 
    icon: Icon, 
    label, 
    count,
    onClick, 
    level = 0 
}: { 
    active: boolean; 
    icon?: React.ElementType; 
    label: string; 
    count?: number;
    onClick: () => void; 
    level?: number;
}) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 mb-1 text-left group
            ${active 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }
            ${level > 0 ? 'pl-8 text-xs' : ''}
        `}
    >
        {Icon && <Icon size={18} className={`mr-3 flex-shrink-0 ${active ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`} />}
        <span className="truncate flex-1">{label}</span>
        {count !== undefined && (
            <span className={`text-[10px] ml-2 px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-500'}`}>
                {count}
            </span>
        )}
    </button>
);

const getIconForCategory = (cat: string) => {
    switch(cat.toLowerCase()) {
        case 'game': return Gamepad;
        case 'productivity': return Briefcase;
        case 'development': return Code;
        case 'design': return PenTool;
        case 'weather': return Cloud;
        case 'clock': return Clock;
        case 'utility': return Calendar;
        case 'widget': return Layers;
        case 'ai': return Brain;
        case 'education':
        case 'study':
        case 'book': return GraduationCap;
        case 'finance':
        case 'money': return CreditCard;
        case 'life':
        case 'health': return Heart;
        case 'music': return Music;
        case 'news': return Newspaper;
        case 'shopping':
        case 'shop': return ShoppingBag;
        case 'social':
        case 'chat': return Users;
        case 'tools': return Wrench;
        case 'travel':
        case 'trip': return Plane;
        case 'video':
        case 'movie':
        case 'film': return Video;
        case 'government':
        case 'gov': return Landmark;
        default: return Box;
    }
};

export function Sidebar({ 
    viewMode, setViewMode, 
    activeCategory, setActiveCategory, 
    searchQuery, setSearchQuery,
    appCategories, widgetCategories,
    categoryCounts 
}: SidebarProps) {
    return (
        <div className="w-60 flex-shrink-0 flex flex-col h-full border-r border-white/5 bg-white/[0.02] backdrop-blur-xl relative z-20 overflow-hidden">
            <div className="p-6 h-full flex flex-col">
                <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2 mb-6 border border-white/5 focus-within:bg-white/15 focus-within:border-white/20 transition-all flex-shrink-0">
                    <Search size={16} className="text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search" 
                        className="bg-transparent border-none focus:outline-none text-sm w-full placeholder-gray-500 text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <nav className="space-y-1 overflow-y-auto overflow-x-hidden flex-1 scrollbar-hide">
                    <SidebarItem 
                        active={viewMode === 'discover' && !searchQuery} 
                        icon={Sparkles} 
                        label="Discover" 
                        onClick={() => { setViewMode('discover'); setActiveCategory(null); setSearchQuery(''); }} 
                    />
                    
                    <div className="pt-4 pb-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Apps</div>
                    <SidebarItem 
                        active={viewMode === 'apps' && activeCategory === null && !searchQuery} 
                        icon={Box} 
                        label="All Apps" 
                        count={categoryCounts['all_apps']}
                        onClick={() => { setViewMode('apps'); setActiveCategory(null); setSearchQuery(''); }} 
                    />
                    {appCategories.map(cat => (
                        <SidebarItem 
                            key={cat}
                            active={viewMode === 'apps' && activeCategory === cat && !searchQuery} 
                            label={cat} 
                            count={categoryCounts[cat]}
                            icon={getIconForCategory(cat)}
                            level={1}
                            onClick={() => { setViewMode('apps'); setActiveCategory(cat); setSearchQuery(''); }} 
                        />
                    ))}

                    <div className="pt-4 pb-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Widgets</div>
                    <SidebarItem 
                        active={viewMode === 'widgets' && activeCategory === null && !searchQuery} 
                        icon={Layers} 
                        label="All Widgets" 
                        count={categoryCounts['all_widgets']}
                        onClick={() => { setViewMode('widgets'); setActiveCategory(null); setSearchQuery(''); }} 
                    />
                     {widgetCategories.map(cat => (
                        <SidebarItem 
                            key={cat}
                            active={viewMode === 'widgets' && activeCategory === cat && !searchQuery} 
                            label={cat} 
                            count={categoryCounts[cat]}
                            icon={getIconForCategory(cat)}
                            level={1}
                            onClick={() => { setViewMode('widgets'); setActiveCategory(cat); setSearchQuery(''); }} 
                        />
                    ))}
                </nav>
            </div>
        </div>
    );
}
