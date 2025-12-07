# 如何禁用 VSCode 中的内联样式警告

## 问题
VSCode 显示 358 个关于 "CSS inline styles should not be used" 的警告。

## 解决方案

### 方法 1: 重新加载 VSCode 窗口 (推荐)
1. 按 `Ctrl+Shift+P` (或 `Cmd+Shift+P` on Mac)
2. 输入 "Developer: Reload Window"
3. 按回车

### 方法 2: 禁用相关扩展
这些警告通常来自以下扩展之一:

1. **webhint** - 请禁用或卸载
2. **Edge DevTools** - 请禁用或卸载  
3. **Stylelint** - 请禁用或卸载

#### 如何禁用扩展:
1. 点击 VSCode 左侧的扩展图标 (或按 `Ctrl+Shift+X`)
2. 搜索 "webhint", "edge devtools", "stylelint"
3. 点击扩展右侧的齿轮图标
4. 选择 "禁用 (工作区)" 或 "卸载"

### 方法 3: 检查已安装的扩展
运行以下命令查看已安装的扩展:
```bash
code --list-extensions
```

查找并禁用这些扩展:
- `webhint.vscode-webhint`
- `ms-vscode.vscode-edge-devtools`
- `ms-vscode.vscode-edge-devtools-preview`
- `stylelint.vscode-stylelint`

### 方法 4: 完全关闭 VSCode 并重新打开
有时配置需要完全重启才能生效。

## 已创建的配置文件

项目中已经创建了以下配置文件来禁用这些警告:

- `.vscode/settings.json` - VSCode 工作区设置
- `.vscode/extensions.json` - 推荐/不推荐的扩展列表
- `.hintrc` - webhint 配置
- `.eslintrc.json` - ESLint 配置
- `.editorconfig` - 编辑器配置

## 验证
重新加载窗口后,问题面板应该不再显示内联样式警告。
