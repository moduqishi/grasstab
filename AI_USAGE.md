# AI 助手使用说明

## ✨ 新功能特性

### 🎨 Apple 风格设计
- 完整的 Apple 风格界面
- 毛玻璃效果和流畅动画
- 优雅的消息气泡设计

### 🔧 完整的 AI 配置
所有配置都在**设置 → AI 配置**中：

1. **API 地址**
   - 支持任何兼容 OpenAI 格式的 API
   - 默认: `https://api.openai.com/v1/chat/completions`
   - 也支持: Claude、国内大模型（如通义千问、文心一言等）

2. **API Key**
   - 安全存储在本地浏览器
   - 支持密码输入框隐藏

3. **模型选择**
   - 自定义任何模型名称
   - 常用模型: gpt-4, gpt-3.5-turbo, claude-3-opus
   - 快速配置按钮一键切换

4. **Temperature (创意度)**
   - 范围: 0-2
   - 0 = 精确、一致的回答
   - 2 = 更有创意、多样化

5. **Max Tokens (最大长度)**
   - 范围: 100-4000
   - 控制 AI 回复的最大长度

### 💬 Markdown 完整渲染支持

✅ **标题** (H1-H6)
✅ **列表** (有序、无序)
✅ **引用块**
✅ **链接** (自动在新标签打开)
✅ **行内代码** `code`
✅ **代码块** 带语法高亮
✅ **粗体、斜体**
✅ **表格**

### 🎯 代码高亮
- 自动识别编程语言
- One Dark 主题配色
- 悬停显示复制按钮
- 一键复制代码

### 🚀 高级功能

1. **对话管理**
   - 自动滚动到最新消息
   - 清空对话历史按钮
   - 对话上下文保持

2. **输入优化**
   - 自适应高度文本框
   - Shift+Enter 换行
   - Enter 发送消息
   - 加载状态显示

3. **错误处理**
   - 友好的错误提示
   - API 错误详情显示
   - 失败消息自动移除

## 📝 配置示例

### OpenAI GPT-4
```
API 地址: https://api.openai.com/v1/chat/completions
API Key: sk-xxxxxxxxxxxxxxxx
模型: gpt-4
```

### OpenAI GPT-3.5
```
API 地址: https://api.openai.com/v1/chat/completions
API Key: sk-xxxxxxxxxxxxxxxx
模型: gpt-3.5-turbo
```

### 自定义 API (兼容 OpenAI 格式)
```
API 地址: https://your-api.com/v1/chat/completions
API Key: your-api-key
模型: your-model-name
```

## 🎨 UI 特性

- **用户消息**: 蓝色气泡，右对齐
- **AI 回复**: 半透明白色气泡，左对齐，完整 Markdown 渲染
- **代码块**: 深色主题，语法高亮，复制按钮
- **加载状态**: 转圈动画 + "思考中..."
- **错误提示**: 红色半透明背景 + 警告图标

## 💡 使用技巧

1. **首次使用**: 先在设置中配置 API Key
2. **切换模型**: 使用快速配置按钮或手动输入
3. **调整创意度**: Temperature 越高越有创意
4. **长对话**: 定期清空历史以节省 Token
5. **代码询问**: AI 会自动识别并高亮显示代码

## 🔒 隐私保护

- ✅ API Key 仅存储在本地 localStorage
- ✅ 不会上传到任何服务器
- ✅ 对话历史仅在浏览器内存中
- ✅ 清空对话后完全删除

## 🌟 体验提升

相比之前的演示 UI，新版本提供：
- 🎯 真实的 API 调用
- 🎨 完整的 Markdown 渲染
- 💻 代码语法高亮
- 📋 一键复制代码
- ⚙️ 完整的配置管理
- 🍎 纯正的 Apple 风格设计

享受你的全新 AI 助手！🚀
