// --- Icon URL Helpers ---
// Get the best icon URL for a website
export const getIconUrl = (url: string) => {
    try {
        const domain = new URL(url).hostname;
        // Using icon.horse as primary - best quality and coverage
        return `https://icon.horse/icon/${domain}`;
    } catch (e) {
        return null;
    }
};

// Get all available icon URLs for fallback
export const getAllIconUrls = (url: string) => {
    try {
        const domain = new URL(url).hostname;
        return [
            // Priority 1: Logo.dev - High quality logos for major companies
            { source: 'logodev', url: `https://img.logo.dev/${domain}?token=pk_dwKHjzWUSauY_R0n8QQmKQ`, name: 'Logo.dev' },
            // Priority 2: unavatar.io - Good alternatives from multiple sources
            { source: 'unavatar', url: `https://unavatar.io/${domain}?fallback=false`, name: 'Unavatar' },
            // Priority 3: Google Favicon - Reliable but sometimes low quality
            { source: 'google', url: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`, name: 'Google' },
            // Priority 4: DuckDuckGo - Good fallback
            { source: 'ddg', url: `https://icons.duckduckgo.com/ip3/${domain}.ico`, name: 'DuckDuckGo' },
            // Priority 5: icon.horse - Good fallback
            { source: 'iconhorse', url: `https://icon.horse/icon/${domain}`, name: 'Icon Horse' },
            // Priority 6: Direct favicon from the site
            { source: 'direct', url: `https://${domain}/favicon.ico`, name: 'Direct' }
        ];
    } catch (e) {
        return [];
    }
};

// Get icon sources object for fallback handling
export const getIconSources = (url: string) => {
    try {
        const domain = new URL(url).hostname;
        return {
            logodev: `https://img.logo.dev/${domain}?token=pk_dwKHjzWUSauY_R0n8QQmKQ`,
            unavatar: `https://unavatar.io/${domain}?fallback=false`,
            google: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
            ddg: `https://icons.duckduckgo.com/ip3/${domain}.ico`,
            direct: `https://${domain}/favicon.ico`,
            iconhorse: `https://icon.horse/icon/${domain}`
        };
    } catch (e) {
        return null;
    }
};
