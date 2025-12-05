# 配置管理功能使用指南

## 📥 导入配置

### 如何导入配置文件：

1. **打开设置应用**
   - 点击 Dock 栏的"Settings"图标

2. **选择导入选项**
   - 滚动到"Data & Config"部分
   - 点击"Import Configuration"

3. **选择配置文件**
   - 支持的格式：`.yaml`, `.yml`, `.json`
   - 选择您之前导出的配置文件

4. **确认导入**
   - 系统会显示将要导入的内容概览
   - 确认后，配置将立即生效

### 配置文件包含的内容：
- ✅ 所有快捷方式
- ✅ Dock 栏项目
- ✅ 系统设置（显示选项）
- ✅ 壁纸设置

### 注意事项：
⚠️ 导入配置会**完全覆盖**当前设置
⚠️ 导入前请确保已备份当前配置（使用导出功能）
⚠️ 导入操作**不可撤销**

---

## 📤 导出配置

### 如何导出配置：

1. **打开设置应用**
   - 点击 Dock 栏的"Settings"图标

2. **点击导出**
   - 在"Data & Config"部分
   - 点击"Export Configuration (YAML)"

3. **保存文件**
   - 文件名格式：`os-one-config-YYYY-MM-DD.yaml`
   - 保存到您的下载文件夹

### 使用场景：
- 📦 备份当前配置
- 🔄 在不同设备间同步设置
- 🎁 分享您的配置给其他用户
- 💾 版本控制您的设置

---

## 🔄 重置系统

### 重置功能说明：

**重置将会删除：**
- 🗑️ 所有自定义快捷方式
- 🗑️ Dock 栏自定义项
- 🗑️ 系统设置
- 🗑️ 自定义壁纸
- 🗑️ 保存的笔记内容

**重置后：**
- ✨ 恢复默认的 50+ 预设快捷方式
- ✨ 恢复默认 Dock 栏（AI、Notes、Calc、Settings）
- ✨ 恢复默认壁纸
- ✨ 重置所有系统设置

### 如何重置：

1. **打开设置应用**
2. **滚动到底部**
3. **点击"Reset All System Data"（红色选项）**
4. **双重确认**
   - 第一次确认：确认您了解后果
   - 第二次确认：最后机会取消
5. **系统重新加载**

⚠️ **警告：此操作不可撤销！**
💡 **建议：重置前先导出配置作为备份**

---

## 📋 配置文件示例

项目中包含了一个测试配置文件：`test-config.yaml`

### 配置文件结构：

\`\`\`yaml
version: '1.0'
createdAt: '2025-12-06T00:00:00.000Z'
settings:
  showDockEdit: true
  showSearchBar: true
  showPagination: true
wallpaper: https://images.unsplash.com/photo-xxx
shortcuts:
  - id: gh
    title: GitHub
    url: https://github.com
    type: github
    color: from-gray-900 to-black
dockItems:
  - id: ai
    iconType: cpu
    name: AI
    isApp: true
    type: sys
    color: from-purple-500 to-indigo-500
\`\`\`

---

## 🛡️ 数据安全

### 数据存储位置：
- 所有数据存储在浏览器的 `localStorage`
- 键名前缀：`os-*`
- 数据仅存在本地，不会上传到服务器

### LocalStorage 键列表：
- `os-shortcuts` - 快捷方式数据
- `os-dock` - Dock 栏配置
- `os-settings` - 系统设置
- `os-bg` - 壁纸 URL
- `os-note` - 笔记内容

### 手动清除数据：
如果遇到问题，可以手动清除浏览器数据：
1. 打开浏览器开发者工具（F12）
2. Application > Storage > Local Storage
3. 删除以 `os-` 开头的所有键
4. 刷新页面

---

## 🔧 故障排除

### 导入失败？
- ✅ 检查文件格式是否为 `.yaml` 或 `.yml`
- ✅ 确认文件不为空
- ✅ 验证 YAML 语法是否正确
- ✅ 查看浏览器控制台错误信息

### 导出没反应？
- ✅ 检查浏览器是否允许下载
- ✅ 查看下载文件夹
- ✅ 尝试刷新页面后重试

### 重置后数据还在？
- ✅ 确保页面已完全刷新
- ✅ 清除浏览器缓存
- ✅ 尝试硬刷新（Ctrl+Shift+R）

---

## 💡 最佳实践

1. **定期备份**
   - 每次做重大改动前导出配置
   - 建议每周备份一次

2. **版本管理**
   - 导出的文件名包含日期
   - 可以保留多个版本

3. **分享配置**
   - 可以将配置文件分享给朋友
   - 他们导入后会得到相同的布局

4. **测试环境**
   - 使用无痕模式测试新配置
   - 避免影响主配置

---

## 🎯 快速开始

### 试用导入功能：

1. 打开设置应用
2. 导入项目根目录的 `test-config.yaml`
3. 查看效果
4. 如果不满意，点击重置恢复默认

享受使用 OS One Ultimate！🚀
