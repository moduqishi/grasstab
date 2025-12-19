import { useState, useEffect } from 'react';
import { StoreApp, StoreWidget, HomeData } from './types';

const STORE_BASE_URL = 'https://raw.githubusercontent.com/moduqishi/GrassTab-Store/main';

export function useStoreData() {
    const [apps, setApps] = useState<StoreApp[]>([]);
    const [widgets, setWidgets] = useState<StoreWidget[]>([]);
    const [homeData, setHomeData] = useState<HomeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const timestamp = Date.now();
                const [appsRes, widgetsRes, homeRes] = await Promise.all([
                    fetch(`${STORE_BASE_URL}/apps.json?t=${timestamp}`),
                    fetch(`${STORE_BASE_URL}/widgets.json?t=${timestamp}`),
                    fetch(`${STORE_BASE_URL}/home.json?t=${timestamp}`)
                ]);

                if (!appsRes.ok || !widgetsRes.ok) throw new Error('Failed to fetch data');
                
                const appsData = await appsRes.json();
                const widgetsData = await widgetsRes.json();
                const homeDataJson = homeRes.ok ? await homeRes.json() : null;
                
                setApps(appsData);
                setWidgets(widgetsData);
                setHomeData(homeDataJson);

            } catch (err) {
                console.error(err);
                setError('无法连接到应用商店，请检查网络。');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { apps, widgets, homeData, loading, error };
}
