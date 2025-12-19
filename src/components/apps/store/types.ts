import { Shortcut } from '../../../types';

export interface StoreApp extends Shortcut {
    id: string | number;
    name: string;
    description: string;
    icon: string;
    screenshots?: string[];
    version: string;
    author: string;
    category: string; // e.g., "Game", "Productivity"
    isWindowApp?: boolean;
    shortcut: Shortcut;
}

export interface StoreWidget {
    id: string;
    name: string;
    description: string;
    icon: string;
    screenshots?: string[];
    version: string;
    author: string;
    category: string; // e.g., "Clock", "Weather"
    isWindowApp?: boolean;
    shortcut: Shortcut;
}

export interface HomeHero {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    action: { type: string; label: string; url: string };
    style: 'dark' | 'light';
}

export interface HomeData {
    hero: HomeHero[];
    featuredApps: string[]; // IDs
    featuredWidgets: string[]; // IDs
}

export type ViewMode = 'discover' | 'apps' | 'widgets';
