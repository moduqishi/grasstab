import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { SearchEngineKey, SearchEngineItem } from '../../types';
import { SEARCH_ENGINES } from '../../constants';
import { FEATURES } from '../../features';

interface SearchBarProps {
    showSearchBar: boolean;
    engine: string; // Changed from SearchEngineKey to string
    currentEngine: SearchEngineItem;
    search: string;
    setSearch: (s: string) => void;
    nextEngine: () => void;
    handleSearch: (q: string) => void;
    suggestions: string[];
    showSuggestions: boolean;
    setShowSuggestions: (show: boolean) => void;
    viewState: 'hero' | 'desktop';
    isAnyWindowMaximized: boolean;
}

export const SearchBar = React.memo<SearchBarProps>(({
    showSearchBar,
    engine,
    currentEngine,
    search,
    setSearch,
    nextEngine,
    handleSearch,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    viewState,
    isAnyWindowMaximized
}) => {
    const [selectedIndex, setSelectedIndex] = React.useState(-1);

    if (!showSearchBar) return null;

    // Helper to get icon
    const renderIcon = () => {
        // 1. Try to find in constants (built-in icons)
        if (currentEngine.icon && currentEngine.icon in SEARCH_ENGINES) {
            return SEARCH_ENGINES[currentEngine.icon as SearchEngineKey].icon;
        }
        // 2. If it's a URL
        if (currentEngine.icon && currentEngine.icon.startsWith('http')) {
             return <img src={currentEngine.icon} alt={currentEngine.name} className="w-full h-full object-contain" />;
        }
        // 3. Fallback
        return SEARCH_ENGINES['default'].icon;
    };

    return (
        <div 
            className={`w-full h-[10%] flex flex-col items-center justify-start relative z-40 transition-all duration-700 cubic-bezier(0.2, 0.8, 0.2, 1) ${
                viewState === 'hero' 
                    ? 'translate-y-[27vh] scale-125' 
                    : 'translate-y-0 scale-100'
            }`}
            style={{ opacity: isAnyWindowMaximized ? 0 : 1, pointerEvents: isAnyWindowMaximized ? 'none' : 'auto' }}
        >
            <div className="relative w-[85%] sm:w-[70%] md:w-[60%] lg:w-[50%] xl:w-[40%] max-w-xl">
                <div className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center p-1.5 shadow-2xl transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] focus-within:bg-white/20 focus-within:scale-105 focus-within:shadow-[0_0_50px_rgba(255,255,255,0.25)]" onClick={e => e.stopPropagation()}>
                    <button onClick={nextEngine} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors text-white font-bold text-sm sm:text-base">
                        <span className="w-[75%] h-[75%] flex items-center justify-center">{renderIcon()}</span>
                    </button>
                    <input
                        className="flex-1 bg-transparent border-none outline-none text-white px-2 sm:px-3 text-base sm:text-lg placeholder-white/40 font-light h-8 sm:h-10"
                        placeholder={`Search ${currentEngine?.name || '...'}`}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        {...(FEATURES.SEARCH_SUGGESTIONS && {
                            onFocus: () => { if (suggestions.length > 0) setShowSuggestions(true); },
                            onBlur: () => setTimeout(() => setShowSuggestions(false), 200)
                        })}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                if (FEATURES.SEARCH_SUGGESTIONS && selectedIndex >= 0 && suggestions[selectedIndex]) {
                                    handleSearch(suggestions[selectedIndex]);
                                } else {
                                    handleSearch(search);
                                }
                            } else if (FEATURES.SEARCH_SUGGESTIONS) {
                                if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    setSelectedIndex(prev => (prev + 1) % suggestions.length);
                                } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
                                } else if (e.key === 'Escape') {
                                    setShowSuggestions(false);
                                }
                            }
                        }}
                    />
                    {search && <button onClick={() => setSearch('')} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-white/50 hover:text-white rounded-lg hover:bg-white/10 active:bg-white/20" aria-label="Clear search" title="Clear search"><X size={14} className="sm:w-4 sm:h-4" /></button>}
                </div>

                {/* Search Suggestions Dropdown */}
                {FEATURES.SEARCH_SUGGESTIONS && (
                    <div
                        className={`absolute top-full left-0 w-full bg-white/20 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 origin-top z-[100] ${showSuggestions && suggestions.length > 0 ? 'mt-2 sm:mt-4 opacity-100 max-h-[400px] sm:max-h-[500px] translate-y-0' : 'max-h-0 opacity-0 mt-0 -translate-y-4 border-none'}`}
                        style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', willChange: 'transform, opacity, max-height' }}
                    >
                        {suggestions.map((s, i) => (
                            <div
                                key={i}
                                className={`px-3 sm:px-4 py-3 sm:py-3.5 text-white/90 cursor-pointer flex items-center gap-2 sm:gap-3 transition-colors active:bg-white/25 ${i === selectedIndex ? 'bg-white/20' : 'hover:bg-white/10'}`}
                                onClick={() => {
                                    setSearch(s);
                                    handleSearch(s);
                                }}
                            >
                                <Search size={14} className="sm:w-4 sm:h-4 text-white/40 flex-shrink-0" />
                                <span className="text-sm sm:text-base font-light truncate">{s}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});
