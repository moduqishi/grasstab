import { Shortcut, DockItem, SearchEngineKey } from './types';

export const DEFAULT_WALLPAPER = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";

import React from 'react';

export const SEARCH_ENGINES: Record<SearchEngineKey, { name: string; url: string; icon: React.ReactNode }> = {
    google: {
        name: 'Google',
        url: 'https://www.google.com/search?q=',
        icon: (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
        )
    },
    bing: {
        name: 'Bing',
        url: 'https://www.bing.com/search?q=',
        icon: (
            <svg viewBox="0 0 16 16" width="24" height="24" fill="currentColor">
                <path d="M8.35 5.046a.615.615 0 0 0-.54.575c-.009.13-.006.14.289.899.67 1.727.833 2.142.86 2.2q.101.215.277.395c.089.092.148.141.247.208.176.117.262.15.944.351.664.197 1.026.327 1.338.482.405.201.688.43.866.7.128.195.242.544.291.896.02.137.02.44 0 .564-.041.27-.124.495-.252.684-.067.1-.044.084.055-.039.278-.346.562-.938.707-1.475a4.42 4.42 0 0 0-2.14-5.028 70 70 0 0 0-.888-.465l-.53-.277-.353-.184c-.16-.082-.266-.138-.345-.18-.368-.192-.523-.27-.568-.283a1 1 0 0 0-.194-.03z" />
                <path d="M9.152 11.493a3 3 0 0 0-.135.083 320 320 0 0 0-1.513.934l-.8.496c-.012.01-.587.367-.876.543a1.9 1.9 0 0 1-.732.257c-.12.017-.349.017-.47 0a1.9 1.9 0 0 1-.884-.358 2.5 2.5 0 0 1-.365-.364 1.9 1.9 0 0 1-.34-.76 1 1 0 0 0-.027-.121c-.005-.006.004.092.022.22.018.132.057.324.098.489a4.1 4.1 0 0 0 2.487 2.796c.359.142.72.23 1.114.275.147.016.566.023.72.011a4.1 4.1 0 0 0 1.956-.661l.235-.149.394-.248.258-.163 1.164-.736c.51-.32.663-.433.9-.665.099-.097.248-.262.255-.283.002-.005.028-.046.059-.091a1.64 1.64 0 0 0 .25-.682c.02-.124.02-.427 0-.565a3 3 0 0 0-.213-.758c-.15-.314-.47-.6-.928-.83a2 2 0 0 0-.273-.12c-.006 0-.433.26-.948.58l-1.113.687z" />
                <path d="m3.004 12.184.03.129c.089.402.245.693.515.963a1.82 1.82 0 0 0 1.312.543c.361 0 .673-.09.994-.287l.472-.29.373-.23V5.334c0-1.537-.003-2.45-.008-2.521a1.82 1.82 0 0 0-.535-1.177c-.097-.096-.18-.16-.427-.33L4.183.24c-.239-.163-.258-.22-.32-.24a.8.8 0 0 0-.183-.027c-.07 0-.286.012-.43.098l-.94.567a1.6 1.6 0 0 0-.278.21c-.48.457-.69.96-.63 1.512.04.368.19.702.45.998.02.023.047.047.08.071l.668.504v8.03c0 .59.04 1.01.12 1.25.08.24.28.45.6.63l.68.39z" />
            </svg>
        )
    },
    baidu: {
        name: '百度',
        url: 'https://www.baidu.com/s?wd=',
        icon: (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="#2932E1"/>
                <path d="M8 10c.5 0 1-.5 1-1s-.5-1-1-1-1 .5-1 1 .5 1 1 1zm8 0c.5 0 1-.5 1-1s-.5-1-1-1-1 .5-1 1 .5 1 1 1zm-4 6c2.5 0 4.5-1.5 5-3.5H7c.5 2 2.5 3.5 5 3.5z" fill="white"/>
            </svg>
        )
    },
    duckduckgo: {
        name: 'DuckDuckGo',
        url: 'https://duckduckgo.com/?q=',
        icon: (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="#DE5833"/>
                <ellipse cx="9" cy="10" rx="1.5" ry="2" fill="#2D4F8E"/>
                <ellipse cx="15" cy="10" rx="1.5" ry="2" fill="#2D4F8E"/>
                <path d="M8 14c0 .5.5 1 1 1h6c.5 0 1-.5 1-1" stroke="#2D4F8E" strokeWidth="1.5" fill="none"/>
            </svg>
        )
    }
};

export const DEFAULT_SHORTCUTS: Shortcut[] = [
    // === 搜索引擎 (Search Engines) ===
    { id: 'google', title: 'Google', url: 'https://www.google.com', type: 'auto', color: 'from-blue-500 to-red-500' },
    { id: 'bing', title: 'Bing', url: 'https://www.bing.com', type: 'auto', color: 'from-blue-600 to-cyan-500' },
    { id: 'baidu', title: '百度', url: 'https://www.baidu.com', type: 'auto', color: 'from-blue-600 to-blue-700' },
    { id: 'ddg', title: 'DuckDuckGo', url: 'https://duckduckgo.com', type: 'auto', color: 'from-orange-600 to-red-600' },
    
    // === 社交媒体 (Social Media) ===
    { id: 'twitter', title: 'Twitter/X', url: 'https://twitter.com', type: 'twitter', color: 'from-sky-400 to-blue-500' },
    { id: 'facebook', title: 'Facebook', url: 'https://facebook.com', type: 'auto', color: 'from-blue-600 to-blue-700' },
    { id: 'instagram', title: 'Instagram', url: 'https://instagram.com', type: 'auto', color: 'from-purple-500 to-pink-500' },
    { id: 'linkedin', title: 'LinkedIn', url: 'https://linkedin.com', type: 'auto', color: 'from-blue-700 to-blue-800' },
    { id: 'reddit', title: 'Reddit', url: 'https://reddit.com', type: 'auto', color: 'from-orange-500 to-red-600' },
    { id: 'weibo', title: '微博', url: 'https://weibo.com', type: 'auto', color: 'from-red-500 to-orange-500' },
    { id: 'zhihu', title: '知乎', url: 'https://www.zhihu.com', type: 'auto', color: 'from-blue-600 to-blue-700' },
    { id: 'douban', title: '豆瓣', url: 'https://www.douban.com', type: 'auto', color: 'from-green-600 to-green-700' },
    
    // === 视频平台 (Video Platforms) ===
    { id: 'youtube', title: 'YouTube', url: 'https://youtube.com', type: 'youtube', color: 'from-red-500 to-red-600' },
    { id: 'bilibili', title: 'Bilibili', url: 'https://www.bilibili.com', type: 'bilibili', color: 'from-pink-400 to-pink-500' },
    { id: 'netflix', title: 'Netflix', url: 'https://netflix.com', type: 'auto', color: 'from-red-600 to-black' },
    { id: 'twitch', title: 'Twitch', url: 'https://twitch.tv', type: 'auto', color: 'from-purple-600 to-purple-700' },
    { id: 'iqiyi', title: '爱奇艺', url: 'https://www.iqiyi.com', type: 'auto', color: 'from-green-500 to-green-600' },
    { id: 'youku', title: '优酷', url: 'https://www.youku.com', type: 'auto', color: 'from-blue-500 to-blue-600' },
    
    // === 开发工具 (Development Tools) ===
    { id: 'github', title: 'GitHub', url: 'https://github.com', type: 'github', color: 'from-gray-900 to-black' },
    { id: 'gitlab', title: 'GitLab', url: 'https://gitlab.com', type: 'auto', color: 'from-orange-600 to-red-600' },
    { id: 'stackoverflow', title: 'Stack Overflow', url: 'https://stackoverflow.com', type: 'code', color: 'from-orange-500 to-orange-600' },
    { id: 'npm', title: 'NPM', url: 'https://www.npmjs.com', type: 'auto', color: 'from-red-600 to-red-700' },
    { id: 'codepen', title: 'CodePen', url: 'https://codepen.io', type: 'auto', color: 'from-gray-900 to-black' },
    { id: 'gitee', title: 'Gitee', url: 'https://gitee.com', type: 'auto', color: 'from-red-700 to-red-800' },
    
    // === 购物 (E-commerce) ===
    { id: 'amazon', title: 'Amazon', url: 'https://amazon.com', type: 'auto', color: 'from-orange-400 to-yellow-600' },
    { id: 'taobao', title: '淘宝', url: 'https://www.taobao.com', type: 'auto', color: 'from-orange-500 to-red-500' },
    { id: 'jd', title: '京东', url: 'https://www.jd.com', type: 'auto', color: 'from-red-600 to-red-700' },
    { id: 'tmall', title: '天猫', url: 'https://www.tmall.com', type: 'auto', color: 'from-red-600 to-pink-600' },
    { id: 'ebay', title: 'eBay', url: 'https://www.ebay.com', type: 'auto', color: 'from-blue-500 to-red-500' },
    
    // === 新闻资讯 (News) ===
    { id: 'bbc', title: 'BBC', url: 'https://www.bbc.com', type: 'auto', color: 'from-gray-900 to-black' },
    { id: 'cnn', title: 'CNN', url: 'https://www.cnn.com', type: 'auto', color: 'from-red-600 to-red-700' },
    { id: 'nyt', title: 'New York Times', url: 'https://www.nytimes.com', type: 'auto', color: 'from-gray-800 to-gray-900' },
    { id: 'toutiao', title: '今日头条', url: 'https://www.toutiao.com', type: 'auto', color: 'from-red-500 to-red-600' },
    { id: '36kr', title: '36氪', url: 'https://36kr.com', type: 'auto', color: 'from-blue-500 to-blue-600' },
    
    // === 工具 (Tools) ===
    { id: 'gmail', title: 'Gmail', url: 'https://mail.google.com', type: 'gmail', color: 'from-red-500 to-rose-500' },
    { id: 'outlook', title: 'Outlook', url: 'https://outlook.com', type: 'auto', color: 'from-blue-600 to-blue-800' },
    { id: 'gdrive', title: 'Google Drive', url: 'https://drive.google.com', type: 'auto', color: 'from-blue-500 to-green-500' },
    { id: 'dropbox', title: 'Dropbox', url: 'https://www.dropbox.com', type: 'auto', color: 'from-blue-600 to-blue-700' },
    { id: 'notion', title: 'Notion', url: 'https://notion.so', type: 'auto', color: 'from-gray-100 to-gray-200 text-black' },
    { id: 'feishu', title: '飞书', url: 'https://www.feishu.cn', type: 'auto', color: 'from-blue-500 to-blue-600' },
    { id: 'dingtalk', title: '钉钉', url: 'https://www.dingtalk.com', type: 'auto', color: 'from-blue-600 to-blue-700' },
    { id: 'wechat', title: '微信', url: 'https://weixin.qq.com', type: 'auto', color: 'from-green-500 to-green-600' },
    
    // === 学习 (Learning) ===
    { id: 'coursera', title: 'Coursera', url: 'https://www.coursera.org', type: 'auto', color: 'from-blue-600 to-blue-800' },
    { id: 'udemy', title: 'Udemy', url: 'https://www.udemy.com', type: 'auto', color: 'from-purple-600 to-purple-800' },
    { id: 'khan', title: 'Khan Academy', url: 'https://www.khanacademy.org', type: 'auto', color: 'from-teal-500 to-teal-600' },
    { id: 'duolingo', title: 'Duolingo', url: 'https://www.duolingo.com', type: 'auto', color: 'from-green-500 to-green-600' },
    
    // === 设计 (Design) ===
    { id: 'figma', title: 'Figma', url: 'https://figma.com', type: 'auto', color: 'from-purple-500 to-rose-500' },
    { id: 'dribbble', title: 'Dribbble', url: 'https://dribbble.com', type: 'auto', color: 'from-pink-500 to-rose-400' },
    { id: 'behance', title: 'Behance', url: 'https://www.behance.net', type: 'auto', color: 'from-blue-600 to-blue-800' },
    { id: 'pinterest', title: 'Pinterest', url: 'https://www.pinterest.com', type: 'auto', color: 'from-red-600 to-red-700' },
    
    // === AI工具 (AI Tools) ===
    { id: 'chatgpt', title: 'ChatGPT', url: 'https://chat.openai.com', type: 'chatgpt', color: 'from-emerald-500 to-teal-600', isApp: true },
    { id: 'claude', title: 'Claude', url: 'https://claude.ai', type: 'auto', color: 'from-amber-600 to-orange-600' },
    { id: 'gemini', title: 'Gemini', url: 'https://gemini.google.com', type: 'auto', color: 'from-blue-500 to-purple-600' },
    { id: 'midjourney', title: 'Midjourney', url: 'https://www.midjourney.com', type: 'auto', color: 'from-purple-600 to-pink-600' },
];

// 系统应用列表 (可以被隐藏/恢复)
export const SYSTEM_APPS: Shortcut[] = [
    {
        id: 'ai',
        iconType: 'cpu',
        title: 'AI助手',
        isApp: true,
        type: 'sys' as const,
        color: 'from-purple-600 via-purple-500 to-pink-500'
    },
    {
        id: 'notes',
        iconType: 'sticky-note',
        title: '便笺',
        isApp: true,
        type: 'sys' as const,
        color: 'from-yellow-300 via-yellow-400 to-yellow-500'
    },
    {
        id: 'calc',
        iconType: 'calculator',
        title: '计算器',
        isApp: true,
        type: 'sys' as const,
        color: 'from-orange-400 via-orange-500 to-red-500'
    },
    {
        id: 'settings',
        iconType: 'settings',
        title: '设置',
        isApp: true,
        type: 'sys' as const,
        color: 'from-gray-400 via-gray-500 to-gray-600'
    }
];

export const DEFAULT_DOCK: DockItem[] = [
    {
        id: 'ai',
        iconType: 'cpu',
        name: 'AI',
        displayName: 'AI助手',
        title: 'AI助手',
        isApp: true,
        type: 'sys',
        color: 'from-purple-600 via-purple-500 to-pink-500'
    },
    {
        id: 'notes',
        iconType: 'sticky-note',
        name: 'Notes',
        displayName: '便笺',
        title: '便笺',
        isApp: true,
        type: 'sys',
        color: 'from-yellow-300 via-yellow-400 to-yellow-500'
    },
    {
        id: 'calc',
        iconType: 'calculator',
        name: 'Calc',
        displayName: '计算器',
        title: '计算器',
        isApp: true,
        type: 'sys',
        color: 'from-orange-400 via-orange-500 to-red-500'
    },
    {
        id: 'settings',
        iconType: 'settings',
        name: 'Settings',
        displayName: '设置',
        title: '设置',
        isApp: true,
        type: 'sys',
        color: 'from-gray-400 via-gray-500 to-gray-600'
    }
];