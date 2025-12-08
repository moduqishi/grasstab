# 配置文件系统说明

## 📋 概述

GrassTab 使用 YAML 格式的配置文件来保存和恢复系统设置、应用、小组件和壁纸。

## 📁 相关文件

- `config-example.yaml` - 完整配置示例，包含所有可用选项
- `config-schema.yaml` - 详细的配置文件模板和字段说明
- 导出的配置文件命名格式: `grasstab-config-YYYY-MM-DDTHH-MM-SS.yaml`

## 🎯 支持的配置项

### 1. 系统设置 (settings)

```yaml
settings:
  showDock: true              # 显示底部 Dock 栏
  showDockEdit: true          # 显示 Dock 编辑按钮
  showSearchBar: true         # 显示桌面搜索栏
  showPagination: true        # 显示分页指示器
  language: "zh"              # 界面语言 (zh/en)
  searchEngine: "google"      # 默认搜索引擎
  gridCols: 6                 # 网格列数 (可选)
  gridRows: 4                 # 网格行数 (可选)
  hiddenSystemApps: []        # 隐藏的系统应用 (可选)
```

### 2. 壁纸 (wallpaper)

```yaml
wallpaper: "https://example.com/image.jpg"
```

支持:
- HTTPS URL
- Base64 Data URI (data:image/png;base64,...)

### 3. Dock 栏应用 (dock)

```yaml
dock:
  - id: 1001                  # 唯一 ID (必需)
    title: "GitHub"           # 显示名称 (必需)
    url: "https://github.com" # 应用 URL (必需)
    type: "github"            # 应用类型 (必需)
    icon: ""                  # 自定义图标 URL (可选)
    color: ""                 # 背景渐变色 (可选)
```

### 4. 桌面应用/小组件 (shortcuts)

#### 普通应用

```yaml
shortcuts:
  - id: 1
    title: "Twitter"
    url: "https://twitter.com"
    type: "twitter"
    icon: "https://..."       # 自定义图标 (可选)
    color: "from-blue-600 to-blue-500"  # 背景色 (可选)
```

#### 大尺寸应用

```yaml
  - id: 2
    title: "Weather"
    url: "https://weather.com"
    type: "auto"
    size:
      w: 2                    # 宽度 (格子数)
      h: 1                    # 高度 (格子数)
```

#### 小组件

```yaml
  - id: 3
    title: "时钟"
    url: ""
    type: "widget"
    size:
      w: 2
      h: 1
    widget:
      type: "clock"           # 小组件类型
      content: ""             # 小组件内容
```

## 📝 字段说明

### 应用类型 (type)

- `auto` - 自动识别
- `github` - GitHub
- `bilibili` - Bilibili
- `youtube` - YouTube
- `chatgpt` - ChatGPT
- `code` - VS Code Web
- `twitter` - Twitter/X
- `gmail` - Gmail
- `sys` - 系统应用
- `widget` - 小组件

### 小组件类型 (widget.type)

- `clock` - 时钟
- `calendar` - 日历
- `weather` - 天气
- `custom` - 自定义 HTML
- `iframe` - 嵌入网页

### 尺寸规则 (size)

- 默认: `{ w: 1, h: 1 }` (单格)
- 最大: 取决于网格大小 (通常 6x4)
- 推荐小组件尺寸: 2x1 或 2x2

### 图标优先级

1. 自定义图标 (`icon` 字段)
2. 自动获取的网站 favicon
3. 纯色背景 + 首字母

### 颜色格式 (color)

使用 Tailwind CSS 渐变类名:
```
from-{color}-{shade} to-{color}-{shade}
```

示例:
- `from-blue-600 to-blue-500`
- `from-gray-800 to-gray-700` (默认)

## 🔄 导入/导出流程

### 导出配置

1. 打开设置应用
2. 点击"导出配置"
3. 自动下载 YAML 文件
4. 文件包含完整的系统状态

### 导入配置

1. 打开设置应用
2. 点击"导入配置"
3. 选择 YAML 或 JSON 文件
4. 确认导入 (会显示详细变更)
5. 系统自动应用配置

## ✅ 验证和错误处理

### 导出时验证

- ✅ 检查数据完整性
- ✅ 移除冗余字段
- ✅ 生成标准化 YAML
- ✅ 添加文件头注释

### 导入时验证

- ✅ 文件格式检查 (.yaml/.yml/.json)
- ✅ 文件大小限制 (最大 10MB)
- ✅ YAML 语法验证
- ✅ 必需字段检查
- ✅ 数据类型验证
- ✅ 自动补全缺失字段
- ✅ 详细错误提示

## 🛠️ 故障排除

### 导出失败

**问题**: 生成的文件为空
- **原因**: 没有任何应用或小组件
- **解决**: 先添加一些应用再导出

**问题**: 下载失败
- **原因**: 浏览器权限问题
- **解决**: 检查浏览器下载设置

### 导入失败

**问题**: "配置文件解析失败"
- **原因**: YAML 语法错误
- **解决**: 
  1. 使用 YAML 验证工具检查语法
  2. 检查缩进是否使用空格 (不是 Tab)
  3. 检查引号配对

**问题**: "缺少必需字段"
- **原因**: 配置文件不完整
- **解决**: 参考 `config-schema.yaml` 补全字段

**问题**: "文件格式不支持"
- **原因**: 文件扩展名错误
- **解决**: 确保文件是 .yaml、.yml 或 .json

## 📚 示例场景

### 场景 1: 备份当前配置

```bash
# 1. 导出配置
设置 -> 导出配置 -> 保存 grasstab-config-2025-12-08.yaml

# 2. 保存到云盘或其他位置
```

### 场景 2: 迁移到新设备

```bash
# 在新设备上:
# 1. 打开 GrassTab
# 2. 设置 -> 导入配置
# 3. 选择之前导出的 .yaml 文件
# 4. 确认导入
```

### 场景 3: 团队配置共享

```bash
# 1. 创建标准配置文件 team-config.yaml
# 2. 团队成员各自导入
# 3. 保持统一的应用和设置
```

### 场景 4: 版本回退

```bash
# 如果新配置有问题:
# 1. 导入之前备份的配置文件
# 2. 立即恢复到之前的状态
```

## 🔐 安全注意事项

1. **API 密钥**: 配置文件会包含 AI 提供商的 API 密钥，请妥善保管
2. **隐私数据**: 不要分享包含个人信息的配置文件
3. **备份**: 定期导出配置作为备份
4. **验证来源**: 只导入可信来源的配置文件

## 🆕 版本兼容性

- 当前版本: `1.0`
- 向后兼容: 支持旧版本配置文件
- 向前兼容: 旧版本可能无法导入新版本配置

## 📞 获取帮助

- 查看配置模板: `config-schema.yaml`
- 查看示例配置: `config-example.yaml`
- 检查浏览器控制台的详细错误信息
- 使用在线 YAML 验证工具检查语法

## 🔄 更新日志

### v1.0 (2025-12-08)
- ✅ 优化配置文件格式
- ✅ 增强导入导出验证
- ✅ 改进错误提示
- ✅ 添加详细文档注释
- ✅ 支持所有用户设置
- ✅ 完善字段说明
