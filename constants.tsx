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
        name: 'Baidu',
        url: 'https://www.baidu.com/s?wd=',
        icon: (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M9.154 0C7.71 0 6.54 1.658 6.54 3.707c0 2.051 1.171 3.71 2.615 3.71 1.446 0 2.614-1.659 2.614-3.71C11.768 1.658 10.6 0 9.154 0zm7.025.594C14.86.58 13.347 2.589 13.2 3.927c-.187 1.745.25 3.487 2.179 3.735 1.933.25 3.175-1.806 3.422-3.364.252-1.555-.995-3.364-2.362-3.674a1.218 1.218 0 0 0-.261-.03zM3.582 5.535a2.811 2.811 0 0 0-.156.008c-2.118.19-2.428 3.24-2.428 3.24-.287 1.41.686 4.425 3.297 3.864 2.617-.561 2.262-3.68 2.183-4.362-.125-1.018-1.292-2.773-2.896-2.75zm16.534 1.753c-2.308 0-2.617 2.119-2.617 3.616 0 1.43.121 3.425 2.988 3.362 2.867-.063 2.553-3.238 2.553-3.988 0-.745-.62-2.99-2.924-2.99zm-8.264 2.478c-1.424.014-2.708.925-3.323 1.947-1.118 1.868-2.863 3.05-3.112 3.363-.25.309-3.61 2.116-2.864 5.42.746 3.301 3.365 3.237 3.365 3.237s1.93.19 4.171-.31c2.24-.495 4.17.123 4.17.123s5.233 1.748 6.665-1.616c1.43-3.364-.808-5.109-.808-5.109s-2.99-2.306-4.736-4.798c-1.072-1.665-2.348-2.268-3.528-2.257zm-2.234 3.84l1.542.024v8.197H7.758c-1.47-.291-2.055-1.292-2.13-1.462-.072-.173-.488-.976-.268-2.343.635-2.049 2.447-2.196 2.447-2.196h1.81zm3.964 2.39v3.881c.096.413.612.488.612.488h1.614v-4.343h1.689v5.782h-3.915c-1.517-.39-1.59-1.465-1.59-1.465v-4.317zm-5.458 1.147c-.66.197-.978.708-1.05.928-.076.22-.247.78-.1 1.269.294 1.095 1.248 1.144 1.248 1.144h1.37v-3.34z" />
            </svg>
        )
    },
};

export const DEFAULT_SHORTCUTS: Shortcut[] = [
    // === 开发工具 (Development Tools) ===
    { id: 'gh', title: 'GitHub', url: 'https://github.com', type: 'github', color: 'from-gray-900 to-black' },
    { id: 'gitlab', title: 'GitLab', url: 'https://gitlab.com', type: 'auto', color: 'from-orange-600 to-red-600' },
    { id: 'gitee', title: 'Gitee', url: 'https://gitee.com', type: 'auto', color: 'from-red-700 to-red-800' },
    { id: 'so', title: 'Stack Overflow', url: 'https://stackoverflow.com', type: 'code', color: 'from-orange-500 to-orange-600' },
    { id: 'lc', title: 'LeetCode', url: 'https://leetcode.cn', type: 'code', color: 'from-orange-400 to-yellow-500' },
    { id: 'mdn', title: 'MDN Web Docs', url: 'https://developer.mozilla.org', type: 'auto', color: 'from-gray-800 to-gray-900' },
    
    // === AI工具 (AI Tools) ===
    { id: 'chatgpt', title: 'ChatGPT', url: 'https://chat.openai.com', type: 'chatgpt', color: 'from-emerald-500 to-teal-600', isApp: true },
    { id: 'claude', title: 'Claude', url: 'https://claude.ai', type: 'auto', color: 'from-amber-600 to-orange-600' },
    { id: 'gemini', title: 'Gemini', url: 'https://gemini.google.com', type: 'auto', color: 'from-blue-500 to-purple-600' },
    { id: 'hf', title: 'Hugging Face', url: 'https://huggingface.co', type: 'auto', color: 'from-yellow-400 to-orange-300' },
    
    // === 技术社区 (Tech Community) ===
    { id: 'csdn', title: 'CSDN', url: 'https://www.csdn.net', type: 'auto', color: 'from-red-600 to-red-700' },
    { id: 'juejin', title: '掘金', url: 'https://juejin.cn', type: 'auto', color: 'from-blue-500 to-blue-600' },
    { id: 'sf', title: 'SegmentFault', url: 'https://segmentfault.com', type: 'auto', color: 'from-green-500 to-teal-600' },
    { id: 'bokeyuan', title: '博客园', url: 'https://www.cnblogs.com', type: 'auto', color: 'from-blue-400 to-blue-500' },
    { id: 'v2ex', title: 'V2EX', url: 'https://www.v2ex.com', type: 'auto', color: 'from-slate-700 to-slate-800' },
    { id: 'runoob', title: '菜鸟教程', url: 'https://www.runoob.com', type: 'auto', color: 'from-green-500 to-emerald-500' },
    
    // === 云服务 (Cloud Services) ===
    { id: 'vercel', title: 'Vercel', url: 'https://vercel.com', type: 'code', color: 'from-gray-900 to-black' },
    { id: 'netlify', title: 'Netlify', url: 'https://netlify.com', type: 'auto', color: 'from-teal-400 to-cyan-500' },
    { id: 'aliyun', title: '阿里云', url: 'https://www.aliyun.com', type: 'auto', color: 'from-orange-500 to-orange-600' },
    { id: 'tencent', title: '腾讯云', url: 'https://cloud.tencent.com', type: 'auto', color: 'from-blue-500 to-blue-700' },
    
    // === 在线学习 (Online Learning) ===
    { id: 'coursera', title: 'Coursera', url: 'https://www.coursera.org', type: 'auto', color: 'from-blue-600 to-blue-800' },
    { id: 'udemy', title: 'Udemy', url: 'https://www.udemy.com', type: 'auto', color: 'from-purple-600 to-purple-800' },
    { id: 'mooc', title: '中国大学MOOC', url: 'https://www.icourse163.org', type: 'auto', color: 'from-green-600 to-green-700' },
    { id: 'xuetangx', title: '学堂在线', url: 'https://www.xuetangx.com', type: 'auto', color: 'from-blue-500 to-purple-600' },
    { id: 'bilibili', title: 'Bilibili', url: 'https://www.bilibili.com', type: 'bilibili', color: 'from-pink-400 to-pink-500' },
    { id: 'youtube', title: 'YouTube', url: 'https://youtube.com', type: 'youtube', color: 'from-red-500 to-red-600' },
    
    // === 文档工具 (Documentation) ===
    { id: 'notion', title: 'Notion', url: 'https://notion.so', type: 'auto', color: 'from-gray-100 to-gray-200 text-black' },
    { id: 'evernote', title: '印象笔记', url: 'https://www.yinxiang.com', type: 'auto', color: 'from-green-600 to-green-700' },
    { id: 'yuque', title: '语雀', url: 'https://www.yuque.com', type: 'auto', color: 'from-blue-500 to-blue-600' },
    { id: 'wolai', title: 'Wolai', url: 'https://www.wolai.com', type: 'auto', color: 'from-indigo-500 to-purple-600' },
    
    // === 设计工具 (Design Tools) ===
    { id: 'figma', title: 'Figma', url: 'https://figma.com', type: 'auto', color: 'from-purple-500 to-rose-500' },
    { id: 'canva', title: 'Canva', url: 'https://www.canva.com', type: 'auto', color: 'from-purple-500 to-cyan-400' },
    { id: 'dribbble', title: 'Dribbble', url: 'https://dribbble.com', type: 'auto', color: 'from-pink-500 to-rose-400' },
    { id: 'behance', title: 'Behance', url: 'https://www.behance.net', type: 'auto', color: 'from-blue-600 to-blue-800' },
    
    // === 知识社区 (Knowledge Community) ===
    { id: 'zhihu', title: '知乎', url: 'https://www.zhihu.com', type: 'auto', color: 'from-blue-600 to-blue-700' },
    { id: 'quora', title: 'Quora', url: 'https://www.quora.com', type: 'auto', color: 'from-red-600 to-red-700' },
    { id: 'reddit', title: 'Reddit', url: 'https://www.reddit.com', type: 'auto', color: 'from-orange-500 to-red-600' },
    { id: 'douban', title: '豆瓣', url: 'https://www.douban.com', type: 'auto', color: 'from-green-600 to-green-700' },
    
    // === 邮箱通讯 (Email & Communication) ===
    { id: 'gmail', title: 'Gmail', url: 'https://mail.google.com', type: 'gmail', color: 'from-red-500 to-rose-500' },
    { id: 'outlook', title: 'Outlook', url: 'https://outlook.com', type: 'auto', color: 'from-blue-600 to-blue-800' },
    { id: 'discord', title: 'Discord', url: 'https://discord.com', type: 'auto', color: 'from-indigo-500 to-blue-600' },
    { id: 'slack', title: 'Slack', url: 'https://slack.com', type: 'auto', color: 'from-purple-600 to-pink-600' },
    
    // === 工具网站 (Utility Sites) ===
    { id: 'translate', title: 'Google 翻译', url: 'https://translate.google.com', type: 'auto', color: 'from-blue-500 to-blue-600' },
    { id: 'deepl', title: 'DeepL', url: 'https://www.deepl.com', type: 'auto', color: 'from-blue-700 to-blue-900' },
    { id: 'regex101', title: 'Regex101', url: 'https://regex101.com', type: 'auto', color: 'from-green-600 to-teal-600' },
    { id: 'caniuse', title: 'Can I Use', url: 'https://caniuse.com', type: 'auto', color: 'from-yellow-500 to-orange-500' },
    
    // === 资源下载 (Resources) ===
    { id: 'npm', title: 'npm', url: 'https://www.npmjs.com', type: 'auto', color: 'from-red-600 to-red-700' },
    { id: 'pypi', title: 'PyPI', url: 'https://pypi.org', type: 'auto', color: 'from-blue-500 to-yellow-400' },
    { id: 'docker', title: 'Docker Hub', url: 'https://hub.docker.com', type: 'auto', color: 'from-blue-500 to-blue-700' },
    
    // === 新闻资讯 (News) ===
    { id: 'hackernews', title: 'Hacker News', url: 'https://news.ycombinator.com', type: 'auto', color: 'from-orange-500 to-orange-600' },
    { id: 'producthunt', title: 'Product Hunt', url: 'https://www.producthunt.com', type: 'auto', color: 'from-orange-500 to-red-500' },
    { id: 'techcrunch', title: 'TechCrunch', url: 'https://techcrunch.com', type: 'auto', color: 'from-green-600 to-green-800' },
    { id: '36kr', title: '36氪', url: 'https://36kr.com', type: 'auto', color: 'from-blue-500 to-blue-600' },
];

export const DEFAULT_DOCK: DockItem[] = [
    {
        id: 'ai',
        iconType: 'cpu',
        name: 'AI',
        isApp: true,
        type: 'sys',
        color: 'from-purple-600 via-purple-500 to-pink-500'
    },
    {
        id: 'notes',
        iconType: 'sticky-note',
        name: 'Notes',
        isApp: true,
        type: 'sys',
        color: 'from-yellow-300 via-yellow-400 to-yellow-500'
    },
    {
        id: 'calc',
        iconType: 'calculator',
        name: 'Calc',
        isApp: true,
        type: 'sys',
        color: 'from-orange-400 via-orange-500 to-red-500'
    },
    {
        id: 'settings',
        iconType: 'settings',
        name: 'Settings',
        isApp: true,
        type: 'sys',
        color: 'from-gray-400 via-gray-500 to-gray-600'
    }
];