# 移动端适配说明

## 已完成的移动端优化

### 1. 响应式布局
- **时间显示**: 使用 `text-5xl sm:text-6xl md:text-7xl lg:text-8xl` 实现字体自适应
- **日期显示**: 使用 `text-sm sm:text-base md:text-lg lg:text-xl` 实现字体自适应
- **网格布局**: 调整 `top` 值在不同屏幕下的位置 (`top-[250px] sm:top-[320px] md:top-[380px]`)
- **底部间距**: 自适应Dock显示状态 (`bottom-[140px] sm:bottom-[160px] md:bottom-[180px]`)

### 2. 搜索栏优化
- **容器宽度**: 移动端使用 95% 宽度，桌面端 90%
- **搜索引擎按钮**: 移动端 32px，桌面端 40px
- **输入框**: 字体大小 `text-base sm:text-lg`，内边距响应式调整
- **清除按钮**: 移动端 28px，桌面端 32px
- **建议下拉**: 
  - 圆角: `rounded-xl sm:rounded-2xl`
  - 最大高度: `max-h-[400px] sm:max-h-[500px]`
  - 间距: `mt-2 sm:mt-4`
  - 文字: `text-sm sm:text-base` 并添加 `truncate` 防止溢出
  - 触摸反馈: 添加 `active:bg-white/25` 增强触摸体验

### 3. Dock 优化
- **高度**: `h-[80px] sm:h-[100px] md:h-[120px]`
- **圆角**: `rounded-[24px] sm:rounded-[30px] md:rounded-[35px]`
- **图标圆角**: `rounded-[12px] sm:rounded-[14px] md:rounded-[16px]`
- **底部距离**: `bottom-4 sm:bottom-6 md:bottom-8`

### 4. 分页指示器
- **间距**: `gap-1.5 sm:gap-2.5`
- **底部位置**: 根据屏幕大小和Dock状态动态调整
  - 有Dock: `bottom-[100px] sm:bottom-[140px] md:bottom-[190px]`
  - 无Dock: `bottom-[30px] sm:bottom-[50px]`

### 5. 导航按钮
- **内边距**: `p-2 sm:p-4`
- **图标大小**: 基础 32px，添加 `sm:w-10 sm:h-10` 类
- **显示逻辑**: 移动端自动隐藏 (`!isMobile && ...`)

### 6. 窗口系统
- **自动全屏**: 移动端 (< 768px) 窗口自动全屏显示
- **触摸优化**: 已有完整的触摸拖拽支持
- **按钮尺寸**: Traffic Lights 已优化为触摸友好尺寸

### 7. HTML Meta 标签
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="mobile-web-app-capable" content="yes" />
```

### 8. CSS 全局优化
- **触摸操作**: `touch-action: manipulation` 防止双击缩放
- **触摸目标**: 移动端最小尺寸 44x44px
- **点击高亮**: `-webkit-tap-highlight-color: transparent`
- **输入框**: 字体 16px 防止 iOS 自动缩放
- **安全区域**: 使用 `env(safe-area-inset-*)` 适配刘海屏

## 测试建议

### Chrome DevTools 测试
1. 按 F12 打开开发者工具
2. 点击设备工具栏图标 (Ctrl+Shift+M)
3. 选择设备:
   - iPhone 12/13/14 Pro (390×844)
   - iPhone 12/13/14 Pro Max (428×926)
   - iPad Air (820×1180)
   - Samsung Galaxy S20 (360×800)

### 实际设备测试
1. 在手机浏览器中打开扩展
2. 测试功能:
   - ✅ 时间和日期显示
   - ✅ 搜索栏操作
   - ✅ 图标拖拽
   - ✅ 窗口打开/关闭
   - ✅ Dock 交互
   - ✅ 页面切换（滑动）

## 响应式断点

项目使用 Tailwind CSS 默认断点:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

主要移动端判断:
- `isMobile = window.innerWidth < 768px` (在 useGridCalculation hook 中)
- Window组件: `window.innerWidth < 768`

## 已知限制

1. **拖拽体验**: 移动端的拖拽可能不如桌面端流畅，已实现但可能需要进一步优化
2. **长按菜单**: 移动端使用长按触发编辑模式，可能与系统手势冲突
3. **小屏幕**: 320px 以下的极小屏幕未完全测试

## 未来改进方向

1. **手势支持**: 
   - 左右滑动切换页面
   - 上滑隐藏搜索栏
   - 双指捏合缩放网格

2. **PWA 支持**:
   - 添加 manifest.json (Web版本)
   - Service Worker 离线支持
   - 添加到主屏幕

3. **性能优化**:
   - 移动端减少动画复杂度
   - 虚拟滚动优化大量图标
   - 懒加载非关键组件

## 构建命令

```bash
# 扩展版本（相对路径，适用于浏览器扩展）
npm run build:extension

# 网页版本（绝对路径 /grasstab/，适用于 GitHub Pages）
npm run build
```

## 开发调试

```bash
# 启动开发服务器（支持热重载）
npm run dev

# 在手机上访问（需要同一局域网）
# 1. 运行 npm run dev
# 2. 找到本机 IP (ipconfig 或 ifconfig)
# 3. 在手机浏览器访问 http://[YOUR_IP]:5173
```

---

更新时间: 2025-12-06
