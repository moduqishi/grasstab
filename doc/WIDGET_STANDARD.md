# GrassTab 小组件开发技术标准 (v1.0)

本标准定义了 GrassTab 桌面小组件（Widgets）的开发规范，确保所有组件在不同设备、主题和尺寸下具有一致的体验和卓越的性能。

## 1. 核心理念
- **自包含 (Self-contained)**: 每个小组件应尽量是一个独立的 HTML 文件（包含 CSS 和 JS）。
- **响应式 (Responsive)**: 使用相对单位适配 1x1, 2x1, 2x2 等不同栅格尺寸。
- **高性能 (Performant)**: 避免过度使用 CPU/GPU，确保桌面滑动流畅。
- **无障碍 (Accessible)**: 交互逻辑应清晰易懂。

## 2. 目录结构与注册
### 2.1 文件位置
- 小组件 HTML 文件存放在 `GrassTab-Store/widgets/` 目录下。
- 命名规范：`[slug].html` (例如: `clock.html`, `weather-simple.html`)。

### 2.2 注册 (widgets.json)
每个小组件必须在 `widgets.json` 中注册：
```json
{
    "id": "com.widget.identifier",
    "name": "中文名称",
    "description": "组件描述",
    "shortcut": {
        "title": "显示名称",
        "type": "widget",
        "widgetType": "iframe",
        "widgetContent": "https://[domain]/widgets/[slug].html",
        "size": { "w": 2, "h": 2 }
    }
}
```

## 3. HTML 标准结构
所有小组件必须遵循以下 HTML 基础框架：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>小组件名称</title>
    <style>
        /* 1. 强制重置与布局基础 */
        :root {
            --primary-color: #007aff;
            --padding: 5vmin;
        }

        * {
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }

        body {
            margin: 0;
            padding: var(--padding);
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            user-select: none; /* 禁用文本选择 */
            cursor: default;
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            flex-direction: column;
            background: transparent; /* 允许父容器背景色或自定 */
        }

        /* 2. 响应式适配：使用 vmin/vmax 以适应 IFrame 尺寸变化 */
        .container {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }

        /* 3. 主题适配 (Dark Mode) */
        @media (prefers-color-scheme: dark) {
            body { color: #ffffff; }
        }
        @media (prefers-color-scheme: light) {
            body { color: #000000; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- 在此编写组件核心 HTML -->
    </div>

    <script>
        // 4. 生命周期与交互逻辑
        (function() {
            function init() {
                console.log('Widget initialized');
            }
            
            // 如果需要与宿主通信，使用 postMessage
            // window.parent.postMessage({ type: 'WIDGET_CONNECTED' }, '*');

            init();
        })();
    </script>
</body>
</html>
```

## 4. UI/UX 规范
### 4.1 尺寸与栅格
- **1x1**: 最小单位，适合展示单一数值或图标（如：天气图标、当前日期）。
- **2x1 / 1x2**: 适合展示精简列表或中等信息（如：今日步数、简略时钟）。
- **2x2**: 标准尺寸，适合展示丰富内容（如：模拟时钟、日历月视图、天气趋势）。

### 4.2 字体排版
- 标题/大数字：使用 `8vmin` 到 `12vmin`。
- 正文：使用 `3.5vmin` 到 `5vmin`。
- 辅助文字：不小于 `3vmin`。

### 4.3 交互限制
- **严禁滚动条**: 必须通过 `overflow: hidden` 隐藏并优化布局，使内容完全可见。
- **悬停效果**: 在支持鼠标的设备上，可以添加轻微的 `hover` 缩放或颜色变化。
- **点击反馈**: 如果小组件是可点击的，应使用 active 状态展示反馈。

## 5. 性能与安全
- **动画**: 优先使用 CSS 动画或 `requestAnimationFrame`。避免使用 `setInterval` 进行高频 DOM 操作。
- **网络**: 减少外部资源请求（如字体、大图）。
- **API 请求**: 如果需要抓取数据，建议在 JS 中实现缓存机制（如 `localStorage`），避免每次刷新桌面都触发大量 API 调用。

## 6. 检查清单 (Checklist)
- [ ] 是否在 `body` 上设置了 `user-select: none`？
- [ ] 是否完全使用了 `vmin`/`%` 等相对单位？
- [ ] 是否处理了深色模式 (`prefers-color-scheme`)？
- [ ] 缩放到 150px * 150px 时内容是否依然清晰？
- [ ] 脚本是否有捕获异常，防止整个 IFrame 崩溃？
