export const getDomain = (url?: string) => {
    if (!url) return '';
    try { return new URL(url).hostname; } catch (e) { return ''; }
};

// --- Network Helpers ---
export const jsonp = (url: string, callbackParam: string = 'callback'): Promise<any> => {
    return new Promise((resolve, reject) => {
        const callbackName = 'jsonp_' + Date.now() + '_' + Math.round(Math.random() * 100000);
        const script = document.createElement('script');

        // Add callback parameter to URL
        const separator = url.includes('?') ? '&' : '?';
        script.src = `${url}${separator}${callbackParam}=${callbackName}`;
        script.async = true;

        // Define global callback
        (window as any)[callbackName] = (data: any) => {
            cleanup();
            resolve(data);
        };

        // Error handling
        script.onerror = () => {
            cleanup();
            reject(new Error(`JSONP request failed for ${url}`));
        };

        // Cleanup function
        const cleanup = () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
            delete (window as any)[callbackName];
        };

        document.body.appendChild(script);
    });
};

// Fetch page title from URL
export const fetchPageTitle = async (url: string): Promise<string | null> => {
    try {
        // Validate URL
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        
        // Method 1: Try direct fetch (will work if CORS is allowed)
        try {
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                credentials: 'omit'
            });
            
            if (response.ok) {
                const html = await response.text();
                const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
                if (titleMatch && titleMatch[1]) {
                    const title = titleMatch[1]
                        .replace(/&amp;/g, '&')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, "'")
                        .replace(/&#x27;/g, "'")
                        .trim();
                    if (title) return title;
                }
            }
        } catch (e) {
            // CORS blocked, continue to fallback
        }
        
        // Method 2: Try CORS proxy
        try {
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.contents) {
                    const titleMatch = data.contents.match(/<title[^>]*>(.*?)<\/title>/i);
                    if (titleMatch && titleMatch[1]) {
                        const title = titleMatch[1]
                            .replace(/&amp;/g, '&')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&quot;/g, '"')
                            .replace(/&#39;/g, "'")
                            .replace(/&#x27;/g, "'")
                            .trim();
                        if (title) return title;
                    }
                }
            }
        } catch (e) {
            // Proxy failed, continue to fallback
        }
        
        // Method 3: Use domain name as fallback
        // Extract meaningful part from domain (remove www, keep main part)
        const domainParts = domain.replace(/^www\./, '').split('.');
        if (domainParts.length >= 2) {
            // Capitalize first letter
            const mainDomain = domainParts[domainParts.length - 2];
            return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
        }
        
        return null;
    } catch (e) {
        console.warn('Failed to fetch page title:', e);
        return null;
    }
};
