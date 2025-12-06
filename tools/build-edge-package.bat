@echo off
chcp 65001 >nul
echo ========================================
echo 创建 GrassTab Edge 扩展发布包
echo ========================================
echo.

REM 步骤 1: 构建项目
echo [1/4] 构建项目...
call npm run build:extension
if %errorlevel% neq 0 (
    echo.
    echo ❌ 构建失败!
    pause
    exit /b 1
)

REM 步骤 2: 准备扩展文件夹
echo.
echo [2/4] 准备扩展文件夹...

REM 备份图标文件(如果存在)
if exist chrome-extension\icon16.png copy /Y chrome-extension\icon16.png icon16.png.bak >nul 2>&1
if exist chrome-extension\icon48.png copy /Y chrome-extension\icon48.png icon48.png.bak >nul 2>&1
if exist chrome-extension\icon128.png copy /Y chrome-extension\icon128.png icon128.png.bak >nul 2>&1

REM 删除并重建文件夹
if exist chrome-extension rmdir /s /q chrome-extension
mkdir chrome-extension

REM 复制构建文件
xcopy /E /I /Y dist\* chrome-extension\
copy /Y manifest.json chrome-extension\

REM 复制多语言文件
xcopy /E /I /Y _locales\* chrome-extension\_locales\

REM 恢复图标文件(如果有备份)
if exist icon16.png.bak (
    copy /Y icon16.png.bak chrome-extension\icon16.png >nul 2>&1
    del icon16.png.bak
)
if exist icon48.png.bak (
    copy /Y icon48.png.bak chrome-extension\icon48.png >nul 2>&1
    del icon48.png.bak
)
if exist icon128.png.bak (
    copy /Y icon128.png.bak chrome-extension\icon128.png >nul 2>&1
    del icon128.png.bak
)

REM 步骤 3: 检查图标
echo.
echo [3/4] 检查图标文件...
if not exist chrome-extension\icon16.png (
    echo ⚠️  警告: 缺少 icon16.png
    echo 请使用 generate-icons.html 生成图标并保存到 chrome-extension 文件夹
)
if not exist chrome-extension\icon48.png (
    echo ⚠️  警告: 缺少 icon48.png
    echo 请使用 generate-icons.html 生成图标并保存到 chrome-extension 文件夹
)
if not exist chrome-extension\icon128.png (
    echo ⚠️  警告: 缺少 icon128.png
    echo 请使用 generate-icons.html 生成图标并保存到 chrome-extension 文件夹
)

REM 步骤 4: 创建 ZIP 包
echo.
echo [4/4] 创建 ZIP 包...
if exist grasstab-edge.zip del /q grasstab-edge.zip
powershell -Command "Start-Sleep -Milliseconds 500; Compress-Archive -Path 'chrome-extension\*' -DestinationPath 'grasstab-edge.zip' -Force"
if %errorlevel% neq 0 (
    echo ⚠️  警告: ZIP创建时遇到文件占用问题，但文件可能已成功创建
)

echo.
echo ========================================
echo ✅ GrassTab Edge 扩展包创建完成!
echo ========================================
echo.
echo 📦 扩展包位置: grasstab-edge.zip
echo 📁 扩展文件夹: chrome-extension\
echo.
echo 📋 下一步:
echo 1. 确保 chrome-extension 文件夹中有三个图标文件
echo    - icon16.png
echo    - icon48.png  
echo    - icon128.png
echo.
echo 2. 如果缺少图标:
echo    - 打开 generate-icons.html
echo    - 点击"生成所有图标"
echo    - 保存到 chrome-extension 文件夹
echo    - 重新运行此脚本
echo.
echo 3. 准备发布素材 (参考 EDGE-PUBLISH-GUIDE.md):
echo    - 扩展描述 (250-10000 字符)
echo    - 屏幕截图 (3-6 张, 640x480 或 1280x800)
echo    - 促销图片 (可选)
echo.
echo 4. 访问合作伙伴中心上传 grasstab-edge.zip:
echo    https://partner.microsoft.com/dashboard/microsoftedge/
echo.
pause
