// 从环境变量读取目标浏览器
const TARGET_BROWSER = import.meta.env.VITE_TARGET_BROWSER || 'chrome';

export const FEATURES = {
  // 搜索建议功能(仅Edge版本启用)
  SEARCH_SUGGESTIONS: TARGET_BROWSER === 'edge',
  
  // 其他可能的特性开关
  // ADVANCED_ANALYTICS: TARGET_BROWSER === 'edge',
} as const;

export const IS_EDGE = TARGET_BROWSER === 'edge';
export const IS_CHROME = TARGET_BROWSER === 'chrome';

// 调试信息
if (import.meta.env.DEV) {
  console.log('🎯 Target Browser:', TARGET_BROWSER);
  console.log('🔧 Features:', FEATURES);
}
