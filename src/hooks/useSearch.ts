import { useState, useEffect } from 'react';
import { SearchEngineKey } from '../types';
import { SEARCH_ENGINES } from '../constants';
import { useConfig } from '../config/ConfigContext';

export function useSearch() {
    const { config } = useConfig();
    const [engineId, setEngineId] = useState<string>(() => {
        return config.searchEngines.length > 0 ? config.searchEngines[0].id : 'default';
    });
    const [search, setSearch] = useState('');

    // Get current engine config
    const currentEngine = config.searchEngines.find(e => e.id === engineId) || config.searchEngines[0];

    // Ensure engineId is valid when config changes or on mount
    useEffect(() => {
        if (!config.searchEngines.find(e => e.id === engineId)) {
            if (config.searchEngines.length > 0) {
                setEngineId(config.searchEngines[0].id);
            }
        }
    }, [config.searchEngines, engineId]);
    
    // 搜索建议相关状态
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    // Suggestion fetching
    useEffect(() => {
        // If engine is 'default' (Chrome search), we usually don't have suggestions unless a custom URL is hacked in, 
        // but for now let's assume 'default' delegates to browser and has no suggestions in-page.
        // Or if suggestionUrl is missing.
        if (!currentEngine || !currentEngine.suggestionUrl) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const timer = setTimeout(async () => {
            if (!search.trim()) {
                setSuggestions([]);
                return;
            }

            try {
                let results: string[] = [];
                const q = encodeURIComponent(search);
                const url = currentEngine.suggestionUrl!.replace('%s', q).replace('{query}', q);

                try {
                    const response = await fetch(url);
                    const data = await response.json();
                    
                    // Handle various suggestion formats
                    if (Array.isArray(data)) {
                        if (Array.isArray(data[1])) {
                            // Standard OpenSearch: [query, [suggestions...]]
                            results = data[1];
                        } else {
                            // Simple array: ["sugg1", "sugg2"]
                            results = data.filter(item => typeof item === 'string');
                        }
                    } else if (data && data.AS && data.AS.Results && data.AS.Results[0] && data.AS.Results[0].Suggests) {
                        // Bing format
                        results = data.AS.Results[0].Suggests.map((s: any) => s.Txt);
                    }
                } catch (err) {
                    console.warn(`Suggestions failed for ${currentEngine.name}:`, err);
                }

                setSuggestions(results.slice(0, 8));
                if (results.length > 0) {
                    setShowSuggestions(true);
                }
            } catch (e) {
                console.error('Suggestion fetch error:', e);
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search, engineId, config.searchEngines]);

    const handleSearch = (query: string) => {
        if (!query.trim()) return;
        
        let trimmedQuery = query.trim();
        
        // 智能修正：将中文标点替换为英文标点
        trimmedQuery = trimmedQuery
            .replace(/：/g, ':')
            .replace(/／/g, '/')
            .replace(/。/g, '.')
            .replace(/，/g, '.');
        
        // Check for URL
        const urlPattern = /^(https?[:：]\/\/|[a-zA-Z0-9-]+[。．.][a-zA-Z]{2,}|localhost[：:]\d+)/;
        const isUrl = urlPattern.test(trimmedQuery);
        
        if (isUrl) {
            let url = trimmedQuery;
            if (url.match(/^https?[:：]/)) {
                url = url.replace(/^http[:：]/, 'http:').replace(/^https[:：]/, 'https:');
                if (!url.includes('://')) {
                    url = url.replace(/^(https?:)/, '$1//');
                }
            } else {
                url = `https://${url}`;
            }
            window.location.assign(url);
        } else {
            // Use current engine
            if (currentEngine.id === 'default' && !currentEngine.searchUrl) {
                // Use Chrome API if available
                if (typeof chrome !== 'undefined' && chrome.search?.query) {
                    chrome.search.query({
                        text: trimmedQuery,
                        disposition: 'CURRENT_TAB'
                    });
                } else {
                    // Fallback if no chrome.search (e.g. dev env)
                    window.location.assign(`https://www.google.com/search?q=${encodeURIComponent(trimmedQuery)}`);
                }
            } else {
                const searchUrl = currentEngine.searchUrl || 'https://www.google.com/search?q=%s';
                const url = searchUrl.replace('%s', encodeURIComponent(trimmedQuery)).replace('{query}', encodeURIComponent(trimmedQuery));
                window.location.assign(url);
            }
        }
    };

    const nextEngine = () => {
        setEngineId(prev => {
            const engines = config.searchEngines;
            const currentIndex = engines.findIndex(e => e.id === prev);
            const nextIndex = (currentIndex + 1) % engines.length;
            return engines[nextIndex].id;
        });
    };

    return {
        engine: engineId, // Expose ID as 'engine' for compatibility
        currentEngine,    // Expose full object
        setEngine: setEngineId,
        search,
        setSearch,
        suggestions,
        showSuggestions,
        setShowSuggestions,
        handleSearch,
        nextEngine
    };
}
