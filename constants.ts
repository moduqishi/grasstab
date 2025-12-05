import { Shortcut, DockItem, SearchEngineKey } from './types';

export const DEFAULT_WALLPAPER = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";

export const SEARCH_ENGINES: Record<SearchEngineKey, { name: string; url: string; icon: string }> = {
    google: { name: 'Google', url: 'https://www.google.com/search?q=', icon: 'G' },
    bing: { name: 'Bing', url: 'https://www.bing.com/search?q=', icon: 'b' },
    baidu: { name: 'Baidu', url: 'https://www.baidu.com/s?wd=', icon: 'du' },
};

export const DEFAULT_SHORTCUTS: Shortcut[] = [
    // --- Dev / Tech ---
    { id: 'gh', title: 'GitHub', url: 'https://github.com', type: 'github', color: 'from-gray-900 to-black' },
    { id: 'csdn', title: 'CSDN', url: 'https://www.csdn.net', type: 'auto', color: 'from-red-600 to-red-700' },
    { id: 'juejin', title: 'Juejin', url: 'https://juejin.cn', type: 'auto', color: 'from-blue-500 to-blue-600' },
    { id: 'gitee', title: 'Gitee', url: 'https://gitee.com', type: 'auto', color: 'from-red-700 to-red-800' },
    { id: 'sf', title: 'SegmentFault', url: 'https://segmentfault.com', type: 'auto', color: 'from-green-500 to-teal-600' },
    { id: 'oschina', title: 'OSChina', url: 'https://www.oschina.net', type: 'auto', color: 'from-green-600 to-green-700' },
    { id: 'bokeyuan', title: 'Cnblogs', url: 'https://www.cnblogs.com', type: 'auto', color: 'from-blue-400 to-blue-500' },
    { id: 'infoq', title: 'InfoQ', url: 'https://www.infoq.cn', type: 'auto', color: 'from-gray-700 to-gray-800' },
    { id: 'v2ex', title: 'V2EX', url: 'https://www.v2ex.com', type: 'auto', color: 'from-slate-700 to-slate-800' },
    { id: 'lc', title: 'LeetCode', url: 'https://leetcode.cn', type: 'code', color: 'from-orange-400 to-yellow-500' },
    { id: 'so', title: 'StackOverflow', url: 'https://stackoverflow.com', type: 'code', color: 'from-orange-500 to-orange-600' },
    { id: 'mdn', title: 'MDN Docs', url: 'https://developer.mozilla.org', type: 'auto', color: 'from-gray-800 to-gray-900' },
    { id: 'runoob', title: 'Runoob', url: 'https://www.runoob.com', type: 'auto', color: 'from-green-500 to-emerald-500' },
    { id: 'jianshu', title: 'JianShu', url: 'https://www.jianshu.com', type: 'auto', color: 'from-pink-400 to-red-400' },
    { id: 'chatgpt', title: 'ChatGPT', url: 'https://chat.openai.com', type: 'chatgpt', color: 'from-emerald-500 to-teal-600', isApp: true },
    { id: 'vercel', title: 'Vercel', url: 'https://vercel.com', type: 'code', color: 'from-gray-900 to-black' },
    { id: 'hf', title: 'Hugging Face', url: 'https://huggingface.co', type: 'auto', color: 'from-yellow-400 to-orange-300' },
    { id: 'aliyun', title: 'Aliyun', url: 'https://www.aliyun.com', type: 'auto', color: 'from-orange-500 to-orange-600' },
    { id: 'tencent', title: 'Tencent Cloud', url: 'https://cloud.tencent.com', type: 'auto', color: 'from-blue-500 to-blue-700' },
    
    // --- Video / Entertainment ---
    { id: 'bili', title: 'Bilibili', url: 'https://www.bilibili.com', type: 'bilibili', color: 'from-pink-400 to-pink-500' },
    { id: 'yt', title: 'YouTube', url: 'https://youtube.com', type: 'youtube', color: 'from-red-500 to-red-600' },
    { id: 'douyin', title: 'Douyin', url: 'https://www.douyin.com', type: 'auto', color: 'from-gray-900 to-black' },
    { id: 'iqiyi', title: 'iQIYI', url: 'https://www.iqiyi.com', type: 'auto', color: 'from-green-500 to-green-600' },
    { id: 'qqvideo', title: 'Tencent Video', url: 'https://v.qq.com', type: 'auto', color: 'from-blue-500 to-blue-600' },
    { id: 'youku', title: 'Youku', url: 'https://www.youku.com', type: 'auto', color: 'from-blue-400 to-blue-600' },
    { id: 'netflix', title: 'Netflix', url: 'https://netflix.com', type: 'auto', color: 'from-red-700 to-black' },
    { id: 'spotify', title: 'Spotify', url: 'https://spotify.com', type: 'auto', color: 'from-green-500 to-emerald-600' },
    { id: 'music163', title: 'Netease Music', url: 'https://music.163.com', type: 'auto', color: 'from-red-600 to-red-700' },

    // --- Social / Communication ---
    { id: 'weibo', title: 'Weibo', url: 'https://weibo.com', type: 'auto', color: 'from-yellow-400 to-red-500' },
    { id: 'zhihu', title: 'Zhihu', url: 'https://www.zhihu.com', type: 'auto', color: 'from-blue-600 to-blue-700' },
    { id: 'douban', title: 'Douban', url: 'https://www.douban.com', type: 'auto', color: 'from-green-600 to-green-700' },
    { id: 'twitter', title: 'Twitter', url: 'https://twitter.com', type: 'twitter', color: 'from-blue-400 to-blue-500' },
    { id: 'discord', title: 'Discord', url: 'https://discord.com', type: 'auto', color: 'from-indigo-500 to-blue-600' },
    { id: 'gmail', title: 'Gmail', url: 'https://mail.google.com', type: 'gmail', color: 'from-red-500 to-rose-500' },
    { id: 'wx', title: 'WeChat Web', url: 'https://wx.qq.com', type: 'auto', color: 'from-green-500 to-green-600' },
    { id: 'tg', title: 'Telegram', url: 'https://web.telegram.org', type: 'auto', color: 'from-blue-400 to-blue-500' },
    { id: 'tieba', title: 'Tieba', url: 'https://tieba.baidu.com', type: 'auto', color: 'from-blue-500 to-blue-700' },

    // --- Shopping / Life ---
    { id: 'taobao', title: 'Taobao', url: 'https://www.taobao.com', type: 'auto', color: 'from-orange-500 to-orange-600' },
    { id: 'jd', title: 'JD.com', url: 'https://www.jd.com', type: 'auto', color: 'from-red-600 to-red-700' },
    { id: 'tmall', title: 'Tmall', url: 'https://www.tmall.com', type: 'auto', color: 'from-red-500 to-red-600' },
    { id: 'pdd', title: 'Pinduoduo', url: 'https://www.pinduoduo.com', type: 'auto', color: 'from-red-500 to-orange-500' },
    { id: 'meituan', title: 'Meituan', url: 'https://www.meituan.com', type: 'auto', color: 'from-yellow-400 to-yellow-500' },
    { id: 'ele', title: 'Ele.me', url: 'https://www.ele.me', type: 'auto', color: 'from-blue-500 to-blue-600' },
    { id: 'amap', title: 'Amap', url: 'https://www.amap.com', type: 'auto', color: 'from-blue-400 to-blue-500' },
    { id: '12306', title: '12306', url: 'https://www.12306.cn', type: 'auto', color: 'from-blue-600 to-blue-800' },
    
    // --- Tools / Design ---
    { id: 'figma', title: 'Figma', url: 'https://figma.com', type: 'auto', color: 'from-purple-500 to-rose-500' },
    { id: 'dribbble', title: 'Dribbble', url: 'https://dribbble.com', type: 'auto', color: 'from-pink-500 to-rose-400' },
    { id: 'behance', title: 'Behance', url: 'https://www.behance.net', type: 'auto', color: 'from-blue-600 to-blue-800' },
    { id: 'canva', title: 'Canva', url: 'https://www.canva.com', type: 'auto', color: 'from-purple-500 to-cyan-400' },
    { id: 'notion', title: 'Notion', url: 'https://notion.so', type: 'auto', color: 'from-gray-100 to-gray-200 text-black' },
    { id: 'translate', title: 'Translate', url: 'https://translate.google.com', type: 'auto', color: 'from-blue-500 to-blue-600' },
];

export const DEFAULT_DOCK: DockItem[] = [
    { id: 'ai', iconType: 'cpu', name: 'AI', isApp: true, type: 'sys', color: 'from-purple-500 to-indigo-500' },
    { id: 'notes', iconType: 'sticky-note', name: 'Notes', isApp: true, type: 'sys', color: 'from-yellow-400 to-orange-400' },
    { id: 'calc', iconType: 'calculator', name: 'Calc', isApp: true, type: 'sys', color: 'from-gray-500 to-gray-600' },
    { id: 'settings', iconType: 'settings', name: 'Settings', isApp: true, type: 'sys', color: 'from-slate-500 to-slate-600' }
];