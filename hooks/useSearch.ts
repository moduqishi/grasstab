import { useState, useEffect } from 'react';
import { SearchEngineKey } from '../types';
import { SEARCH_ENGINES } from '../constants';
import { FEATURES } from '../features';

declare const chrome: any;

export function useSearch() {
    const [engine, setEngine] = useState<SearchEngineKey>('default');
    const [search, setSearch] = useState('');
    
    // 搜索建议相关状态 - 仅对自定义搜索引擎生效（非 default）
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    // Suggestion fetching
    useEffect(() => {
        if (engine === 'default') {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        if (!FEATURES.SEARCH_SUGGESTIONS) return;

        const timer = setTimeout(async () => {
            if (!search.trim()) {
                setSuggestions([]);
                return;
            }

            try {
                let results: string[] = [];
                const q = encodeURIComponent(search);

                if (engine === 'google') {
                    try {
                        const response = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${q}`);
                        const data = await response.json();
                        if (Array.isArray(data) && data[1]) {
                            results = data[1];
                        }
                    } catch (err) {
                        console.warn('Google suggestions unavailable:', err);
                    }
                } else if (engine === 'bing') {
                    try {
                        const response = await fetch(`https://api.bing.com/qsonhs.aspx?q=${q}`);
                        const data = await response.json();
                        if (data && data.AS && data.AS.Results && data.AS.Results[0] && data.AS.Results[0].Suggests) {
                            results = data.AS.Results[0].Suggests.map((s: any) => s.Txt);
                        }
                    } catch (err) {
                        console.warn('Bing suggestions unavailable:', err);
                    }
                } else if (engine === 'baidu') {
                    console.warn('Baidu suggestions not supported in Manifest V3');
                    results = [];
                } else if (engine === 'duckduckgo') {
                    try {
                        const response = await fetch(`https://duckduckgo.com/ac/?q=${q}&type=list`);
                        const data = await response.json();
                        if (Array.isArray(data) && data[1]) {
                            results = data[1];
                        }
                    } catch (err) {
                        console.warn('DuckDuckGo suggestions unavailable:', err);
                    }
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
    }, [search, engine]);

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
            if (engine === 'default') {
                if (typeof chrome !== 'undefined' && chrome.search?.query) {
                    chrome.search.query({
                        text: trimmedQuery,
                        disposition: 'CURRENT_TAB'
                    });
                } else {
                    window.location.assign(`https://www.google.com/search?q=${encodeURIComponent(trimmedQuery)}`);
                }
            } else {
                window.location.assign(SEARCH_ENGINES[engine].url + encodeURIComponent(trimmedQuery));
            }
        }
    };

    const nextEngine = () => {
        setEngine(prev => {
            const keys = Object.keys(SEARCH_ENGINES) as SearchEngineKey[];
            const nextIdx = (keys.indexOf(prev) + 1) % keys.length;
            return keys[nextIdx];
        });
    };

    return {
        engine,
        setEngine,
        search,
        setSearch,
        suggestions,
        showSuggestions,
        setShowSuggestions,
        handleSearch,
        nextEngine
    };
}
