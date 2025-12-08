# GrassTab - Chrome Web Store 上架说明

## 📦 扩展包位置
上传文件夹：`chrome-extension/`

## 📝 基本信息

### 扩展名称
**中文**: GrassTab  
**英文**: GrassTab

### 简短描述（132字符以内）
**中文**: 美观实用的新标签页，支持自定义应用、小组件、壁纸和AI助手，让你的浏览器焕然一新  
**英文**: Beautiful new tab with custom apps, widgets, wallpapers and AI assistant

### 详细描述

**中文**:
```
GrassTab 是一个功能强大且美观的新标签页扩展，为您提供高度自定义的浏览器起始页体验。

🎨 主要功能

• 自定义应用快捷方式 - 添加常用网站，自动获取精美图标
• Dock 栏管理 - 类 macOS 的 Dock 栏，快速访问常用应用
• 多种小组件 - 时钟、日历、天气、自定义 HTML、网页嵌入
• 精美壁纸 - 内置多种高质量壁纸，支持自定义图片
• AI 助手 - 集成主流 AI 服务（OpenAI、Claude、Gemini 等）
• 代码编辑器 - 内置 Monaco Editor，支持多种编程语言
• 便签功能 - 随时记录灵感和待办事项
• 计算器 - 强大的科学计算器
• 配置导入/导出 - 轻松备份和迁移您的设置
• 多语言支持 - 中文、English

✨ 特色亮点

• 完全离线可用，无需联网
• 所有数据本地存储，保护隐私
• 响应式设计，支持各种屏幕尺寸
• 流畅的动画效果和现代化UI
• 高度可定制，打造专属起始页

🔒 隐私保护

• 所有数据仅存储在您的浏览器本地
• 不收集任何个人信息
• AI 功能需要您自行配置 API 密钥
• 开源项目，代码透明可审计

📦 适用场景

• 需要快速访问常用网站
• 喜欢个性化浏览器体验
• 需要在新标签页查看时间、天气
• 开发者需要快速编辑代码
• 使用 AI 助手提高工作效率

立即安装 GrassTab,让您的每一个新标签页都充满效率与美感!

项目开源地址:https://github.com/moduqishi/grasstab
```

**英文**:
```
GrassTab is a powerful and beautiful new tab extension that provides a highly customizable browser start page experience.

🎨 Key Features

• Custom App Shortcuts - Add favorite websites with auto-fetched beautiful icons
• Dock Bar Management - macOS-style Dock bar for quick access to apps
• Multiple Widgets - Clock, calendar, weather, custom HTML, webpage embed
• Beautiful Wallpapers - Built-in high-quality wallpapers, support custom images
• AI Assistant - Integrate mainstream AI services (OpenAI, Claude, Gemini, etc.)
• Code Editor - Built-in Monaco Editor with multi-language support
• Notes - Quickly capture ideas and to-dos
• Calculator - Powerful scientific calculator
• Config Import/Export - Easy backup and migration of settings
• Multi-language - Chinese, English

✨ Highlights

• Fully offline capable, no internet required
• All data stored locally, privacy protected
• Responsive design for all screen sizes
• Smooth animations and modern UI
• Highly customizable for your personal touch

🔒 Privacy Protection

• All data stored locally in your browser only
• No personal information collected
• AI features require your own API keys
• Open source project, transparent code

📦 Perfect For

• Quick access to frequently used websites
• Personalized browser experience lovers
• Checking time and weather on new tabs
• Developers needing quick code editing
• Using AI assistants to boost productivity

Install GrassTab now and make every new tab efficient and beautiful!

Open source: https://github.com/moduqishi/grasstab
```

## 🎯 分类
**主要分类**: 生产力工具 (Productivity)  
**次要分类**: 
- 工具 (Tools)
- 开发者工具 (Developer Tools)

## 🏷️ 关键词（最多 5 个）
1. new tab
2. productivity
3. customizable
4. widgets
5. AI assistant

## 📸 截图要求

需要准备以下截图（尺寸：1280x800 或 640x400）：

1. **主界面** - 展示桌面应用布局和壁纸
2. **Dock 栏** - 展示底部 Dock 栏和系统应用
3. **小组件** - 展示时钟、天气等小组件
4. **设置界面** - 展示配置选项
5. **AI 助手** - 展示 AI 对话功能
6. **代码编辑器** - 展示 Monaco Editor

## 🎬 宣传视频（可选）
建议录制 30-60 秒的功能演示视频，展示：
- 添加应用快捷方式
- 自定义 Dock 栏
- 使用小组件
- AI 助手对话
- 更换壁纸

## 🌐 网站和支持链接

- **官方网站**: https://moduqishi.github.io/grasstab/
- **支持页面**: https://github.com/moduqishi/grasstab/issues
- **隐私政策**: https://moduqishi.github.io/grasstab/privacy.html

## 📋 隐私实践

需要在开发者控制台填写：

**数据收集**:
- ☐ 不收集任何数据

**权限使用说明**:
- `storage` - 保存用户的应用布局、设置和壁纸
- `unlimitedStorage` - 存储大量应用数据和自定义内容
- `host_permissions` - 获取网站图标和搜索建议

## 📄 上传前检查清单

- [ ] 确保 `chrome-extension/` 目录包含所有必需文件
- [ ] manifest.json 格式正确，包含 default_locale
- [ ] _locales/zh_CN/messages.json 存在且格式正确
- [ ] _locales/en/messages.json 存在且格式正确
- [ ] 所有图标文件存在（icon16.png, icon48.png, icon128.png）
- [ ] 测试扩展在 Chrome 中能正常加载
- [ ] 准备好至少 3 张截图（1280x800）
- [ ] 准备好 128x128 的商店图标（如果需要单独的）
- [ ] 设置开发者账号（需要一次性支付 $5 注册费）

## 🚀 上传步骤

1. 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. 点击"新增项"
3. 上传 `chrome-extension.zip`（将 chrome-extension 文件夹打包）
4. 填写商店信息（使用上述准备的内容）
5. 上传截图和图标
6. 选择分类和关键词
7. 填写隐私实践
8. 提交审核

## ⏱️ 审核时间
通常需要 1-3 个工作日，首次提交可能需要更长时间

## 💡 提示

1. **截图质量**: 确保截图清晰，展示核心功能
2. **描述关键词**: 在描述中自然包含用户可能搜索的关键词
3. **更新日志**: 每次更新都写清楚改进内容
4. **响应反馈**: 及时回复用户评论和问题
5. **保持更新**: 定期更新扩展，修复 bug 和添加新功能

## 📧 联系方式
如果审核被拒，Chrome 会通过邮件说明原因，根据反馈修改后重新提交即可。

---

**祝上架顺利！🎉**
