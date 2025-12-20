import { Shortcut, DockItem } from '../types';

export const DEFAULT_SHORTCUTS: Shortcut[] = [
    // === 视频娱乐 (Video & Entertainment) ===
    { id: 1765193991934, title: '抖音', url: 'https://www.douyin.com/', type: 'auto', color: 'from-gray-600 to-gray-800', customIcon: 'https://img.logo.dev/www.douyin.com?token=pk_dwKHjzWUSauY_R0n8QQmKQ' },
    { id: 1765194042238, title: 'bilibili', url: 'https://www.bilibili.com/', type: 'auto', color: 'from-pink-500 to-blue-500', customIcon: 'https://img.logo.dev/www.bilibili.com?token=pk_dwKHjzWUSauY_R0n8QQmKQ' },
    { id: 1765196356678, title: '爱奇艺', url: 'https://www.iqiyi.com/', type: 'auto', color: 'from-green-500 to-green-700', customIcon: 'https://img.logo.dev/www.iqiyi.com?token=pk_dwKHjzWUSauY_R0n8QQmKQ' },
    { id: 1765196407071, title: '腾讯视频', url: 'https://v.qq.com/', type: 'auto', color: 'from-orange-500 to-red-600', customIcon: 'https://icon.horse/icon/v.qq.com', iconType: 'iconhorse' },
    { id: 1765196439382, title: '芒果TV', url: 'https://www.mgtv.com/', type: 'auto', color: 'from-yellow-500 to-orange-600', iconType: 'unavatar' },
    { id: 1765196473480, title: '优酷', url: 'https://www.youku.com/', type: 'auto', color: 'from-blue-500 to-blue-700', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_10197_1764143650/256' },
    { id: 1765195218788, title: 'YouTube', url: 'https://youtube.com', type: 'auto', color: 'from-red-500 to-red-700', customIcon: 'https://img.logo.dev/youtube.com?token=pk_dwKHjzWUSauY_R0n8QQmKQ' },
    
    // === 开发工具 (Development) ===
    { id: 1765196938765, title: 'GitHub', url: 'https://github.com/', type: 'auto', color: 'from-gray-700 to-gray-900', iconType: 'logodev', customIcon: 'https://img.logo.dev/github.com?token=pk_dwKHjzWUSauY_R0n8QQmKQ' },
    
    // === 电影票务 (Movie Ticketing) ===
    { id: 1765196627763, title: '猫眼', url: 'https://www.maoyan.com/', type: 'auto', color: 'from-yellow-600 to-orange-700', iconType: 'unavatar', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_46766_1762161597/256' },
    { id: 1765196675813, title: '猫眼专业版', url: 'https://piaofang.maoyan.com/dashboard', type: 'auto', color: 'from-yellow-600 to-orange-700', iconType: 'unavatar', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_12124845_1763969293/256' },
    
    // === 音乐 (Music) ===
    { id: 1765198295426, title: 'QQ音乐', url: 'https://y.qq.com/', type: 'auto', color: 'from-green-500 to-blue-600', iconType: 'unavatar', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_6259_1765190757/256' },
    { id: 1765198343668, title: '网易云音乐', url: 'https://music.163.com/', type: 'auto', color: 'from-red-500 to-red-700', iconType: 'clearbit', customIcon: 'https://unavatar.io/music.163.com?fallback=false' },
    { id: 1765198362240, title: '喜马拉雅', url: 'https://www.ximalaya.com/', type: 'auto', color: 'from-orange-500 to-orange-700', iconType: 'unavatar' },
    

    // === AI & 技术 (AI & Tech) ===
    { id: 1765194325676, title: 'Hugging Face', url: 'https://huggingface.co/', type: 'auto', color: 'from-yellow-400 to-yellow-600', customIcon: 'https://img.logo.dev/huggingface.co?token=pk_dwKHjzWUSauY_R0n8QQmKQ' },
    { id: 1765197985565, title: '腾讯文档', url: 'https://docs.qq.com/', type: 'auto', color: 'from-blue-500 to-blue-700', iconType: 'unavatar', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_52666442_1764918437/256' },
    
    // === 学习 (Learning) ===
    { id: 1765195013236, title: '菜鸟教程', url: 'https://runoob.com', type: 'auto', color: 'from-green-500 to-green-700', customIcon: 'https://icon.horse/icon/runoob.com' },
    { id: 1765195159657, title: '学习通', url: 'https://i.chaoxing.com/base', type: 'auto', color: 'from-blue-500 to-blue-700', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_12269313_1763524961/256' },
    { id: 1765196315850, title: 'PTA', url: 'https://pintia.cn/', type: 'auto', color: 'from-purple-500 to-purple-700', iconType: 'unavatar' },
    
    // === AI 助手 (AI Assistants) ===
    { id: 1765195317537, title: 'Gemini', url: 'https://gemini.google.com', type: 'auto', color: 'from-blue-500 to-purple-600', customIcon: 'https://www.google.com/s2/favicons?domain=gemini.google.com&sz=128' },
    { id: 1765195544793, title: 'ChatGPT', url: 'https://chatgpt.com/', type: 'auto', color: 'from-green-500 to-teal-600', iconType: 'unavatar' },
    { id: 1765195568334, title: 'Claude', url: 'https://claude.ai/', type: 'auto', color: 'from-orange-500 to-amber-600', iconType: 'unavatar' },
    { id: 1765195610054, title: 'Meta AI', url: 'https://meta.ai', type: 'auto', color: 'from-blue-600 to-purple-700', customIcon: 'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/59/06/f3/5906f39d-ff2a-41ef-873f-57d2aa989aa6/Placeholder.mill/200x200bb-75.webp' },
    { id: 1765195462659, title: 'Doubao', url: 'https://www.doubao.com', type: 'auto', color: 'from-purple-500 to-pink-600', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_54330344_1764673656/256' },
    { id: 1765195675002, title: 'DeepSeek', url: 'https://chat.deepseek.com/', type: 'auto', color: 'from-blue-600 to-indigo-700', iconType: 'unavatar' },
    { id: 1765195700715, title: 'Kimi', url: 'https://www.kimi.com/', type: 'auto', color: 'from-cyan-500 to-blue-600', iconType: 'unavatar' },
    { id: 1765195771345, title: '智谱清言', url: 'https://chatglm.cn/', type: 'auto', color: 'from-blue-500 to-blue-700', iconType: 'unavatar' },
    { id: 1765195807855, title: 'Qwen Chat', url: 'https://chat.qwen.ai/', type: 'auto', color: 'from-purple-600 to-indigo-700', customIcon: 'https://unavatar.io/chat.qwen.ai?fallback=false' },
    
    // === 社交媒体 (Social Media) ===
    { id: 1765195880965, title: '知乎', url: 'https://www.zhihu.com/', type: 'auto', color: 'from-blue-600 to-blue-800', iconType: 'clearbit' },
    { id: 1765195895356, title: '小红书', url: 'https://www.xiaohongshu.com/', type: 'auto', color: 'from-red-500 to-pink-600', iconType: 'unavatar', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_10868231_1764898028/256' },
    { id: 1765196198468, title: '斗鱼', url: 'https://www.douyu.com/', type: 'auto', color: 'from-orange-500 to-orange-700', iconType: 'unavatar', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_10921913_1764658904/256' },
    
    // === 天气 (Weather) ===
    { id: 1765198245086, title: '彩云天气', url: 'https://caiyunapp.com/map/', type: 'auto', color: 'from-blue-400 to-blue-600', iconType: 'unavatar' },
    
    // === 其他应用 (Other Apps) ===
    { id: 1765196606382, title: 'Douban', url: 'https://movie.douban.com/', type: 'auto', color: 'from-green-600 to-green-800', customIcon: 'https://unavatar.io/movie.douban.com?fallback=false' },
    { id: 1765196781842, title: '飞书', url: 'https://www.feishu.cn/', type: 'auto', color: 'from-blue-500 to-blue-700', iconType: 'unavatar' },
    { id: 1765196823194, title: '企业微信', url: 'https://work.weixin.qq.com/', type: 'auto', color: 'from-blue-500 to-blue-700', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_42270467_1763431984/256' },
    { id: 1765196874884, title: '腾讯会议', url: 'https://meeting.tencent.com/', type: 'auto', color: 'from-blue-500 to-blue-700', iconType: 'unavatar', customIcon: 'https://icons.duckduckgo.com/ip3/meeting.tencent.com.ico' },
    { id: 1765197323190, title: '微博热搜', url: 'https://weibo.com/newlogin?tabtype=search&gid=&openLoginLayer=0&url=', type: 'auto', color: 'from-orange-500 to-red-600', customIcon: 'https://img.logo.dev/weibo.com?token=pk_dwKHjzWUSauY_R0n8QQmKQ' },
    { id: 1765197603278, title: '少数派', url: 'https://sspai.com/', type: 'auto', color: 'from-red-500 to-red-700', iconType: 'unavatar' },
    
    // === 搜索引擎 (Search Engines) ===
    { id: 1765197660862, title: '百度', url: 'https://www.baidu.com/', type: 'auto', color: 'from-blue-600 to-blue-800', iconType: 'clearbit', customIcon: 'https://icon.horse/icon/www.baidu.com' },
    { id: 1765197680292, title: 'Google', url: 'https://google.com', type: 'auto', color: 'from-blue-500 to-green-600', customIcon: 'https://unavatar.io/google.com?fallback=false' },
    
    // === 设计资源 (Design Resources) ===
    { id: 1765195392428, title: 'Unsplash', url: 'https://unsplash.com/', type: 'auto', color: 'from-gray-700 to-gray-900', iconType: 'unavatar' },
    
    // === 云存储 (Cloud Storage) ===
    { id: 1765197786241, title: '123云盘', url: 'https://www.123pan.com/', type: 'auto', color: 'from-blue-500 to-blue-700', iconType: 'unavatar' },
    { id: 1765197807912, title: '百度网盘', url: 'https://pan.baidu.com/', type: 'auto', color: 'from-blue-600 to-blue-800', iconType: 'unavatar', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_116071_1764839081/256' },
    
    // === 购物 (Shopping) ===
    { id: 1765197868543, title: '淘宝', url: 'https://www.taobao.com/', type: 'auto', color: 'from-orange-500 to-red-600', iconType: 'clearbit', customIcon: 'https://icon.horse/icon/www.taobao.com' },
    { id: 1765197908143, title: '什么值得买', url: 'https://www.smzdm.com/', type: 'auto', color: 'from-red-600 to-red-800', customIcon: 'https://unavatar.io/www.smzdm.com?fallback=false' },
    
    // === 新闻 (News) ===
    { id: 1765197935324, title: '今日头条', url: 'https://www.toutiao.com/', type: 'auto', color: 'from-red-500 to-red-700', iconType: 'logodev', customIcon: 'https://img.logo.dev/www.toutiao.com?token=pk_dwKHjzWUSauY_R0n8QQmKQ' },
    
    // === 旅行 (Travel) ===
    { id: 1765198092873, title: '携程', url: 'https://www.ctrip.com/', type: 'auto', color: 'from-blue-500 to-blue-700', iconType: 'unavatar' },
    
    // === 地图 (Maps) ===
    { id: 1765198181335, title: '高德地图', url: 'https://www.amap.com/', type: 'auto', color: 'from-blue-500 to-green-600', iconType: 'unavatar', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_7678_1765185623/256' },
    
    // === 天气 (Weather) ===
    { id: 1765198269787, title: '和风天气', url: 'https://www.qweather.com/', type: 'auto', color: 'from-blue-400 to-cyan-600', iconType: 'unavatar' },
    
    // === 设计工具 (Design Tools) ===
    { id: 1765197356299, title: 'Figma', url: 'https://www.figma.com/', type: 'auto', color: 'from-purple-500 to-pink-600', iconType: 'unavatar' },
];

// 系统应用列表 (可以被隐藏/恢复)
export const SYSTEM_APPS: Shortcut[] = [
    {
        id: 'ai',
        iconType: 'message-circle',
        title: 'AI助手',
        isApp: true,
        type: 'sys' as const,
        color: '', // Transparent
        iconColor: '#3B82F6' // Blue
    },
    {
        id: 'store',
        iconType: 'shopping-bag',
        title: '应用商店',
        isApp: true,
        type: 'sys' as const,
        color: '', // Transparent
        iconColor: '#EC4899' // Pink
    },
    {
        id: 'notes',
        iconType: 'sticky-note',
        title: '便笺',
        isApp: true,
        type: 'sys' as const,
        color: '', // Transparent
        iconColor: '#FACC15' // Yellow
    },
    {
        id: 'calc',
        iconType: 'calculator',
        title: '计算器',
        isApp: true,
        type: 'sys' as const,
        color: '', // Transparent
        iconColor: '#F97316' // Orange
    },
    {
        id: 'settings',
        iconType: 'settings',
        title: '设置',
        isApp: true,
        type: 'sys' as const,
        color: '', // Transparent
        iconColor: '#9CA3AF' // Gray
    }
];

export const DEFAULT_DOCK: DockItem[] = [
    {
        id: 'ai',
        iconType: 'message-circle',
        name: 'AI',
        displayName: 'AI助手',
        title: 'AI助手',
        url: '',
        isApp: true,
        type: 'sys',
        color: '', 
        iconColor: '#3B82F6',
        size: { w: 1, h: 1 }
    },
    {
        id: 'notes',
        iconType: 'sticky-note',
        name: 'Notes',
        displayName: '便笺',
        title: '便笺',
        url: '',
        isApp: true,
        type: 'sys',
        color: '', 
        iconColor: '#FACC15',
        size: { w: 1, h: 1 }
    },
    {
        id: 'calc',
        iconType: 'calculator',
        name: 'Calc',
        displayName: '计算器',
        title: '计算器',
        url: '',
        isApp: true,
        type: 'sys',
        color: '', 
        iconColor: '#F97316',
        size: { w: 1, h: 1 }
    },
    {
        id: 'settings',
        iconType: 'settings',
        name: 'Settings',
        displayName: '设置',
        title: '设置',
        url: '',
        isApp: true,
        type: 'sys',
        color: '', 
        iconColor: '#9CA3AF',
        size: { w: 1, h: 1 }
    },
    {
        id: 'store',
        iconType: 'shopping-bag',
        name: 'Store',
        displayName: '商店',
        title: '应用商店',
        url: '',
        isApp: true,
        type: 'sys',
        color: '', 
        iconColor: '#EC4899',
        size: { w: 1, h: 1 }
    }
];
