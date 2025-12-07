# 📱 移动端适配快速参考

## 响应式断点速查

### 屏幕尺寸分类
| 类型 | 宽度范围 | 列数 | 图标大小 |
|------|---------|------|---------|
| 小屏手机 | < 640px | 3列 | 90px |
| 中等手机 | 640-768px | 4列 | 100px |
| 平板 | 768-1024px | 6列 | 130px |
| 桌面 | ≥ 1280px | 8列 | 130px |

### Tailwind 断点
```
无前缀: < 640px
sm:    ≥ 640px
md:    ≥ 768px
lg:    ≥ 1024px
xl:    ≥ 1280px
```

---

## 关键尺寸速查

### 搜索栏
```tsx
// 容器
w-[95%] sm:w-[90%]

// 引擎按钮
w-8 h-8 sm:w-10 sm:h-10

// 输入框
text-base sm:text-lg

// 清除按钮
w-7 h-7 sm:w-8 sm:h-8
```

### Dock
```tsx
// 高度
h-[80px] sm:h-[100px] md:h-[120px]

// 圆角
rounded-[24px] sm:rounded-[30px] md:rounded-[35px]

// 底部距离
bottom-4 sm:bottom-6 md:bottom-8
```

### 时间显示
```tsx
// 时间
text-5xl sm:text-6xl md:text-7xl lg:text-8xl

// 日期
text-sm sm:text-base md:text-lg lg:text-xl

// 间距
mb-6 sm:mb-8
```

### 网格布局
```tsx
// 顶部
top-[250px] sm:top-[320px] md:top-[380px]

// 底部（有Dock）
bottom-[140px] sm:bottom-[160px] md:bottom-[180px]

// 底部（无Dock）
bottom-[40px]
```

---

## 常用 Tailwind 类组合

### 触摸优化按钮
```tsx
className="
  min-h-[44px] min-w-[44px]
  active:scale-95
  active:bg-white/20
  transition-all
"
```

### 响应式容器
```tsx
className="
  w-[95%] sm:w-[90%]
  px-3 sm:px-4
  py-3 sm:py-3.5
  text-sm sm:text-base
"
```

### 响应式间距
```tsx
className="
  gap-1.5 sm:gap-2.5
  mt-2 sm:mt-4
  mb-6 sm:mb-8
"
```

### 响应式圆角
```tsx
className="
  rounded-xl sm:rounded-2xl
  rounded-[12px] sm:rounded-[14px] md:rounded-[16px]
"
```

---

## JavaScript 检测

### 移动端判断
```typescript
// 窗口组件
const isMobile = window.innerWidth < 768;

// Grid 计算
const isMobile = w < 768;
const isSmallMobile = w < 640;
```

### 条件渲染
```tsx
// 隐藏移动端元素
{!isMobile && <DesktopOnly />}

// 仅移动端显示
{isMobile && <MobileOnly />}
```

---

## CSS 关键设置

### 防止缩放
```css
touch-action: manipulation;
-webkit-tap-highlight-color: transparent;
```

### 最小触摸目标
```css
button, a {
  min-height: 44px;
  min-width: 44px;
}
```

### 输入框防缩放
```css
input {
  font-size: 16px; /* iOS 不会缩放 */
}
```

### 安全区域
```css
@supports (padding: max(0px)) {
  body {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

---

## HTML Meta 标签

```html
<meta 
  name="viewport" 
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
/>
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

---

## 开发命令

```bash
# 开发服务器
npm run dev

# 扩展构建
npm run build:extension

# 网页构建
npm run build

# 移动端调试
dev-mobile.bat
```

---

## 测试设备推荐

### Chrome DevTools
- iPhone SE (375×667)
- iPhone 12 Pro (390×844)
- iPad Air (820×1180)

### 真机测试
- iOS Safari
- Android Chrome
- 各尺寸实际设备

---

## 常见问题

### Q: 为什么输入框要 16px？
A: iOS Safari 在字体 < 16px 时会自动缩放页面

### Q: 为什么最小触摸目标是 44px？
A: Apple 的人机界面指南建议触摸目标至少 44×44pt

### Q: user-scalable=no 有什么影响？
A: 禁止用户缩放，但改善了双击等手势体验

### Q: 如何测试安全区域？
A: 在 iPhone X 及以上设备或 DevTools 中模拟

---

## 性能优化提示

1. 使用 `transform` 和 `opacity` 做动画
2. 移动端减少复杂动画
3. 图片使用 WebP 格式
4. 懒加载非首屏内容
5. 防抖/节流用户输入

---

最后更新: 2025-12-06
