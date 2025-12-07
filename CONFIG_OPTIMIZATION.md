# 配置文件优化说明

## 优化内容

### 1. 字段简化

**之前的格式（冗余）：**
```yaml
shortcuts:
  - id: google
    title: Google
    url: https://www.google.com
    type: auto
    color: from-blue-500 to-red-500
    x: 0                    # ❌ 自动计算，不需要
    y: 0                    # ❌ 自动计算，不需要
    page: 0                 # ❌ 自动计算，不需要
    isApp: false            # ❌ 默认值，不需要
    size:                   # ❌ 默认1x1，不需要
      w: 1
      h: 1
    customIcon: https://...  # 🔄 改为 icon
```

**优化后的格式（简洁）：**
```yaml
shortcuts:
  - id: google
    title: Google
    url: https://www.google.com
    type: auto
    color: from-blue-500 to-red-500
    # ✅ 只保留必要字段
    # ✅ 布局自动计算
    # ✅ 图标可选（不设置会自动获取）
```

### 2. 命名优化

| 旧字段名 | 新字段名 | 说明 |
|---------|---------|------|
| `customIcon` | `icon` | 更简洁直观 |
| `dockItems` | `dock` | 更短更易读 |
| `widgetType` + `widgetContent` | `widget: {type, content}` | 结构化组织 |

### 3. 默认值处理

以下字段有默认值，不需要在配置文件中写出：

- `size: {w: 1, h: 1}` - 默认1x1大小
- `isApp: false` - 自动根据URL判断
- `x, y, page` - 自动布局计算
- `type: 'auto'` - 某些情况可省略
- `color` - 有默认渐变色

### 4. 图标自动获取

不设置 `icon` 字段时，系统会自动从以下源获取图标：
1. Google Favicon API
2. Clearbit Logo API
3. Unavatar
4. DuckDuckGo Icons
5. FaviconKit
6. 直接从网站获取

### 5. 配置文件大小对比

**优化前（554行）：**
- 大量重复的布局字段
- 每个项目都有x/y/page
- 自动生成的图标URL也被保存

**优化后（约150行）：**
- 移除所有自动计算的字段
- 只保存用户自定义的内容
- 配置文件缩小约70%

## 兼容性

✅ **完全向后兼容**
- 支持读取旧格式配置文件
- 自动识别 `customIcon` 和 `icon`
- 自动识别 `dockItems` 和 `dock`
- 自动补全缺失的默认值

## 配置示例

查看 `config-example.yaml` 获取完整示例。

### 最小配置
```yaml
version: '1.0'
settings:
  language: zh
wallpaper: https://example.com/bg.jpg
shortcuts:
  - id: google
    title: Google
    url: https://www.google.com
    color: from-blue-500 to-red-500
dock:
  - id: settings
    title: 设置
    url: "#settings"
    color: from-gray-600 to-gray-800
```

### 带自定义图标
```yaml
shortcuts:
  - id: myapp
    title: 我的应用
    url: https://myapp.com
    color: from-purple-500 to-pink-500
    icon: https://myapp.com/logo.png  # 自定义图标
```

### 大尺寸小组件
```yaml
shortcuts:
  - id: clock
    title: 时钟
    color: from-blue-600 to-purple-600
    size:
      w: 2
      h: 2
    widget:
      type: clock
```

## 导出行为

现在导出配置文件时会：
1. ✅ 自动移除所有布局字段
2. ✅ 只保存用户自定义的图标
3. ✅ 使用简化的字段名
4. ✅ 生成更小、更易读的配置文件

## 编辑建议

1. **手动编辑配置时**，不需要写 `x/y/page` 字段
2. **图标设置**，只在需要自定义时才写 `icon` 字段
3. **小组件**，使用结构化的 `widget` 对象
4. **保持简洁**，利用默认值减少配置量

## 技术细节

### 导出流程
```
应用状态 → 清理数据 → 移除冗余 → 生成YAML
```

### 导入流程
```
YAML文件 → 解析 → 补全默认值 → 兼容处理 → 应用状态
```

### 数据转换
- `customIcon` ↔ `icon` (双向映射)
- `dockItems` ↔ `dock` (双向映射)
- `widget.type/content` ↔ `widgetType/widgetContent` (双向映射)
