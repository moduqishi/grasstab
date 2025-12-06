# GitHub Pages 配置指南

## 📝 自动部署已配置完成

本项目已配置自动部署到 GitHub Pages。每次推送到 `main` 分支时会自动构建和部署。

## 🚀 启用 GitHub Pages 步骤

### 1. 推送代码到 GitHub
```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push origin main
```

### 2. 在 GitHub 仓库中启用 Pages

1. 访问仓库: `https://github.com/moduqishi/grasstab`
2. 点击 **Settings** (设置)
3. 在左侧菜单找到 **Pages**
4. 在 **Source** (来源) 部分:
   - 选择 **GitHub Actions**
5. 保存设置

### 3. 触发部署

推送代码后,工作流会自动运行:
- 访问仓库的 **Actions** 标签查看部署进度
- 首次部署大约需要 1-2 分钟

### 4. 访问您的网站

部署完成后,您的网站将在以下地址可用:
```
https://moduqishi.github.io/grasstab/
```

## ✅ 已配置内容

- ✅ GitHub Actions 工作流 (`.github/workflows/deploy.yml`)
- ✅ Vite 配置更新 (设置正确的 base 路径)
- ✅ README 添加在线预览链接

## 🔧 工作流说明

工作流会自动:
1. 检出代码
2. 安装 Node.js 和依赖
3. 运行构建命令 (`npm run build`)
4. 将 `dist` 目录部署到 GitHub Pages

## 💡 提示

- **自动部署**: 每次推送到 `main` 分支自动触发
- **手动部署**: 在 Actions 页面点击 "Run workflow" 手动触发
- **查看日志**: 在 Actions 标签查看详细的构建和部署日志

## 🎯 下一步

1. 推送代码到 GitHub
2. 在 Settings > Pages 启用 GitHub Actions 作为来源
3. 等待自动部署完成
4. 访问您的在线预览网站! 🎉

## 🐛 故障排查

### 部署失败?
- 检查 Actions 标签的错误日志
- 确认 `npm run build` 在本地能正常运行
- 检查仓库的 Pages 设置是否正确

### 404 错误?
- 确认 `vite.config.ts` 中的 `base` 路径正确
- 应该是 `/grasstab/` (仓库名)
- 重新触发部署

### 资源加载失败?
- 检查浏览器控制台的错误信息
- 确认所有资源路径使用相对路径
