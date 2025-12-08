# 配置系统完整文档

## ✅ 已完成

配置系统现已**完全支持**所有用户可调整的设置，包括:

### 1. 系统设置
- ✅ Dock 栏显示/隐藏
- ✅ Dock 编辑按钮
- ✅ 搜索栏显示
- ✅ 分页指示器
- ✅ 界面语言 (中文/英文)
- ✅ 搜索引擎选择
- ✅ 网格布局 (行数/列数)
- ✅ 隐藏系统应用列表

### 2. 视觉设置
- ✅ 壁纸 URL 或 Base64 图片

### 3. 应用布局
- ✅ Dock 栏应用 (底部固定)
- ✅ 桌面快捷方式
- ✅ 小组件配置
- ✅ 应用尺寸 (1x1, 2x1, 2x2 等)
- ✅ 自定义图标
- ✅ 背景颜色

### 4. AI 配置 (新增)
- ✅ AI 提供商列表
  - 提供商 ID
  - 显示名称
  - API 端点 URL
  - API 密钥
  - 可用模型列表
  - 自定义模型
  - 温度参数
  - 最大 Token 数
- ✅ 当前选中的提供商
- ✅ 当前选中的模型

### 5. 便签内容 (新增)
- ✅ 完整的便签文本内容
- ✅ 支持多行文本
- ✅ 保留换行符和格式

## 📁 文件结构

### 核心文件
- **types.ts** - 类型定义
  - `AIProvider` - AI 提供商接口
  - `AISettings` - AI 配置接口
  - `GlobalConfig` - 完整配置接口

- **utils.ts** - 导出/导入逻辑
  - `generateYamlConfig()` - 生成 YAML 配置
  - `parseYamlConfig()` - 解析 YAML 配置

- **App.tsx** - 主应用
  - `handleExportConfig()` - 导出配置处理
  - `handleImportConfig()` - 导入配置处理

### 配置文件
- **config-example.yaml** - 完整示例 (包含 AI 和便签)
- **config-schema.yaml** - 模板和说明 (包含 AI 和便签)

## 🔄 localStorage 映射

配置系统完整支持以下 localStorage 键:

| localStorage Key | 配置字段 | 说明 |
|-----------------|----------|------|
| `os-settings` | `settings` | 系统设置 |
| `os-bg` | `wallpaper` | 壁纸 URL |
| `os-app-layout` | `dockItems` + `shortcuts` | 应用布局 |
| `ai-providers` | `aiSettings.providers` | AI 提供商列表 |
| `ai-current-provider` | `aiSettings.currentProviderId` | 当前 AI 提供商 |
| `ai-current-model` | `aiSettings.currentModel` | 当前 AI 模型 |
| `os-note` | `notes` | 便签内容 |

## 📝 配置示例

### 完整 YAML 配置
```yaml
version: "1.0"
createdAt: "2025-12-08T10:00:00.000Z"

settings:
  showDock: true
  showDockEdit: true
  showSearchBar: true
  showPagination: true
  language: "zh"
  searchEngine: "google"

wallpaper: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"

# AI 配置
aiSettings:
  providers:
    - id: "openai"
      name: "OpenAI"
      apiUrl: "https://api.openai.com/v1"
      apiKey: "sk-..."
      models:
        - "gpt-4"
        - "gpt-3.5-turbo"
      customModels: []
      temperature: 0.7
      maxTokens: 2000
  currentProviderId: "openai"
  currentModel: "gpt-4"

# 便签内容
notes: |
  这是我的便签内容
  支持多行文本

dock:
  - id: github
    title: GitHub
    url: "https://github.com"
    type: auto

shortcuts:
  - id: google
    title: Google
    url: "https://google.com"
    type: auto
    size:
      w: 1
      h: 1
```

## 🚀 使用方法

### 导出配置
1. 右键点击桌面空白处
2. 选择 "导出配置"
3. 配置将下载为 `grasstab-config-[时间戳].yaml`
4. 文件包含所有设置 (包括 AI 和便签)

### 导入配置
1. 右键点击桌面空白处
2. 选择 "导入配置"
3. 选择 `.yaml` 或 `.json` 文件
4. 确认导入
5. 页面自动刷新应用配置

### 导入确认信息
导入时会显示:
- Dock 应用数量变化
- 桌面应用数量变化
- AI 提供商数量 (如果有)
- 便签字符数 (如果有)
- 系统设置覆盖警告

## ✨ 新增功能

### AI 配置导出/导入
- 完整保存所有 AI 提供商配置
- 保存当前选中的提供商和模型
- 支持多个 AI 提供商
- 保留 API 密钥 (请注意安全)

### 便签内容导出/导入
- 完整保存便签文本
- 支持多行内容
- 保留换行符和格式

## 🔒 安全提示

**⚠️ 重要**: 配置文件包含 AI API 密钥!

- 不要将配置文件分享给他人
- 不要上传到公共位置
- 导入他人配置时请检查 API 密钥
- 建议在分享前删除 `apiKey` 字段

## 🧪 测试验证

### 导出测试
1. ✅ 配置 AI 提供商
2. ✅ 输入便签内容
3. ✅ 导出配置
4. ✅ 检查 YAML 文件包含 `aiSettings` 和 `notes` 部分

### 导入测试
1. ✅ 清空浏览器数据
2. ✅ 导入配置文件
3. ✅ 验证 AI 提供商已恢复
4. ✅ 验证便签内容已恢复
5. ✅ 验证所有设置已应用

## 📊 文件大小

- **config-example.yaml**: ~6 KB (包含完整示例)
- **config-schema.yaml**: ~7 KB (包含详细说明)
- **导出的配置文件**: 取决于内容
  - 基础配置: ~2-3 KB
  - 包含 AI 配置: +1-2 KB
  - 包含便签: +便签大小

## 🛠️ 技术实现

### 导出流程
```typescript
1. 从 localStorage 读取 ai-providers, ai-current-provider, ai-current-model
2. 从 localStorage 读取 os-note
3. 构建 GlobalConfig 对象
4. 调用 generateYamlConfig() 生成 YAML
5. 创建下载链接
6. 触发文件下载
```

### 导入流程
```typescript
1. 读取文件内容
2. 调用 parseYamlConfig() 解析
3. 验证配置格式
4. 应用到 React state
5. 写入 localStorage (包括 AI 和便签)
6. 刷新页面
```

## 📝 更新日志

### 2024-12-08 - 完整版本
- ✅ 新增 AI 配置导出/导入
- ✅ 新增便签内容导出/导入
- ✅ 更新所有配置示例
- ✅ 完善导入/导出提示信息
- ✅ 验证所有功能正常

### 2024-12-07 - 初始版本
- ✅ 基础配置导出/导入
- ✅ 系统设置
- ✅ 壁纸
- ✅ 应用布局

## 📚 相关文档

- `CONFIG_GUIDE.md` - 用户使用指南
- `CONFIG_TESTS.md` - 测试用例
- `CONFIG_OPTIMIZATION_SUMMARY.md` - 优化总结
- `config-example.yaml` - 完整示例
- `config-schema.yaml` - 配置模板

## ✅ 验证清单

- [x] 所有 localStorage 键已支持
- [x] AI 配置导出/导入
- [x] 便签内容导出/导入
- [x] 配置文件示例已更新
- [x] 文档已完善
- [x] 编译无错误
- [x] 构建成功 (14MB)

---

**配置系统现已完全优化! 🎉**

所有用户可调整的设置都已完整支持导出和导入功能。
