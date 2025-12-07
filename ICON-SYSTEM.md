# 📷 GrassTab 图标系统说明

## 🎯 图标优先级策略

GrassTab 使用多源图标系统，按照以下优先级自动降级，确保每个网站都能显示最佳图标。

### 优先级列表

```
1. icon.horse      ⭐ 最高质量，广泛覆盖，自动降级
2. Clearbit        ⭐ 高质量商标，适合主流公司
3. unavatar.io     ⭐ 多源聚合，良好备选
4. Google Favicon  ⭐ 可靠但质量一般
5. DuckDuckGo      ⭐ 优秀的备选方案
6. Favicon Kit     ⭐ 另一个可靠源
7. Direct          ⭐ 直接从网站获取
```

## 📦 API 说明

### `getIconUrl(url: string)`
获取最佳图标 URL（优先使用 icon.horse）

```typescript
const iconUrl = getIconUrl('https://github.com');
// 返回: 'https://icon.horse/icon/github.com'
```

### `getAllIconUrls(url: string)`
获取所有可用图标源（按优先级排序）

```typescript
const sources = getAllIconUrls('https://github.com');
// 返回数组，包含所有7个源:
[
  { source: 'iconhorse', url: '...', name: 'Icon Horse' },
  { source: 'clearbit', url: '...', name: 'Clearbit' },
  // ... 其他5个源
]
```

### `getIconSources(url: string)`
获取图标源对象（键值对形式）

```typescript
const sources = getIconSources('https://github.com');
// 返回:
{
  iconhorse: 'https://icon.horse/icon/github.com',
  clearbit: 'https://logo.clearbit.com/github.com',
  unavatar: 'https://unavatar.io/github.com?fallback=false',
  google: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
  ddg: 'https://icons.duckduckgo.com/ip3/github.com.ico',
  faviconkit: 'https://api.faviconkit.com/github.com/128',
  direct: 'https://github.com/favicon.ico'
}
```

## 🔄 自动降级机制

AppIcon 组件会自动按优先级尝试每个图标源：

```tsx
// 初始状态：使用 icon.horse (优先级1)
<img src="https://icon.horse/icon/example.com" />

// 如果加载失败，自动切换到 Clearbit (优先级2)
<img src="https://logo.clearbit.com/example.com" />

// 继续失败则切换到 unavatar (优先级3)
<img src="https://unavatar.io/example.com?fallback=false" />

// ... 依此类推，直到文字图标
<span>E</span>
```

## 🎨 图标渲染优先级

完整的图标渲染优先级（从高到低）：

```
1. ⭐ 自定义图标 (customIcon)
   - 用户上传的自定义图片
   - Base64 编码或 URL

2. ⭐ 系统矢量图标 (iconType)
   - Lucide React 图标
   - 用于系统应用（计算器、设置等）

3. ⭐ 特定应用覆盖 (type)
   - 特殊应用的自定义渲染
   - 例：Bilibili "B"、GitHub 图标

4. ⭐ 网站图标 (url + 多源降级)
   - 7层降级策略
   - 自动尝试所有源

5. ⭐ 文字图标 (title首字母)
   - 最终降级方案
   - 显示标题首字母大写
```

## 🚀 使用示例

### 在 AppIcon 组件中

```tsx
import { getAllIconUrls } from '../utils';

const AppIcon = ({ url, title }) => {
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const [iconSources, setIconSources] = useState([]);
  
  useEffect(() => {
    if (url) {
      const sources = getAllIconUrls(url);
      setIconSources(sources);
      setCurrentIconIndex(0);
    }
  }, [url]);
  
  const handleError = () => {
    if (currentIconIndex < iconSources.length - 1) {
      setCurrentIconIndex(prev => prev + 1);
    }
  };
  
  return (
    <img 
      src={iconSources[currentIconIndex]?.url} 
      onError={handleError}
    />
  );
};
```

### 直接使用工具函数

```tsx
import { getIconUrl, getAllIconUrls } from './utils';

// 获取单个最佳图标
const bestIcon = getIconUrl('https://example.com');

// 获取所有备选图标
const allIcons = getAllIconUrls('https://example.com');

// 预加载所有图标源
allIcons.forEach(({ url }) => {
  const img = new Image();
  img.src = url;
});
```

## 🌐 图标源特点

### 1. Icon Horse
- **优点**: 高质量、自动降级、快速
- **覆盖**: 广泛的网站支持
- **质量**: ⭐⭐⭐⭐⭐

### 2. Clearbit
- **优点**: 商标级质量，主流公司必备
- **覆盖**: 主要针对大公司
- **质量**: ⭐⭐⭐⭐⭐

### 3. Unavatar
- **优点**: 聚合多个源
- **覆盖**: 良好的覆盖率
- **质量**: ⭐⭐⭐⭐

### 4. Google Favicon
- **优点**: 极高可靠性
- **缺点**: 质量一般（16×16 放大）
- **质量**: ⭐⭐⭐

### 5. DuckDuckGo
- **优点**: 隐私友好，可靠
- **覆盖**: 广泛支持
- **质量**: ⭐⭐⭐⭐

### 6. Favicon Kit
- **优点**: API 可定制尺寸
- **覆盖**: 良好支持
- **质量**: ⭐⭐⭐⭐

### 7. Direct
- **优点**: 最原始的图标
- **缺点**: 可能不存在或低质量
- **质量**: ⭐⭐

## ⚙️ 配置与优化

### 缩放和显示

所有图标使用 `object-cover` 确保完美填充：

```css
.icon {
  object-fit: cover;  /* 覆盖整个区域 */
  width: 100%;
  height: 100%;
  pointer-events: none;  /* 防止拖拽干扰 */
}
```

### 预加载优化

```typescript
// 预加载前3个优先级的图标
const preloadIcons = (url: string) => {
  const sources = getAllIconUrls(url).slice(0, 3);
  sources.forEach(({ url }) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
};
```

### 错误处理

```typescript
const handleError = () => {
  console.log(`Icon failed: ${iconSources[currentIconIndex].name}`);
  
  // 自动切换到下一个源
  if (currentIconIndex < iconSources.length - 1) {
    setCurrentIconIndex(prev => prev + 1);
  } else {
    // 所有源都失败，显示文字图标
    console.log('All icon sources failed, showing text fallback');
  }
};
```

## 🔍 调试技巧

### 查看当前使用的图标源

```typescript
useEffect(() => {
  if (iconSources[currentIconIndex]) {
    console.log('Current icon source:', iconSources[currentIconIndex].name);
  }
}, [currentIconIndex]);
```

### 测试所有源

```typescript
const testAllSources = async (url: string) => {
  const sources = getAllIconUrls(url);
  
  for (const source of sources) {
    try {
      const response = await fetch(source.url, { method: 'HEAD' });
      console.log(`${source.name}: ${response.ok ? '✅' : '❌'}`);
    } catch (e) {
      console.log(`${source.name}: ❌ (Network Error)`);
    }
  }
};
```

## 📊 性能考虑

### 加载时间
- icon.horse: ~100-300ms
- Clearbit: ~100-500ms
- Google: ~50-200ms (最快但质量低)

### 缓存策略
所有图标源都支持浏览器缓存，重复访问几乎零延迟。

### 带宽优化
- 使用 128×128 尺寸（大多数源）
- 避免加载超大图片
- 自动降级减少失败请求

## 🛠️ 未来改进

- [ ] 添加本地缓存层
- [ ] 支持自定义图标源顺序
- [ ] 添加图标质量评分系统
- [ ] 支持 WebP 格式优先
- [ ] 实现智能预加载算法

---

最后更新: 2025-12-07
