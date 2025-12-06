@echo off
echo ========================================
echo 构建 GrassTab Chrome 扩展
echo ========================================
echo.

echo [1/2] 构建项目...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ❌ 构建失败!
    pause
    exit /b 1
)

echo.
echo [2/2] 创建扩展文件夹...

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
    echo ✓ 已恢复 icon16.png
)
if exist icon48.png.bak (
    copy /Y icon48.png.bak chrome-extension\icon48.png >nul 2>&1
    del icon48.png.bak
    echo ✓ 已恢复 icon48.png
)
if exist icon128.png.bak (
    copy /Y icon128.png.bak chrome-extension\icon128.png >nul 2>&1
    del icon128.png.bak
    echo ✓ 已恢复 icon128.png
)

echo.
echo ========================================
echo ✅ GrassTab Chrome 扩展构建完成!
echo ========================================
echo.
echo 📦 扩展位置: chrome-extension\
echo.
echo 安装步骤:
echo 1. 打开 Chrome 浏览器
echo 2. 访问 chrome://extensions/
echo 3. 开启右上角的"开发者模式"
echo 4. 点击"加载已解压的扩展程序"
echo 5. 选择 chrome-extension 文件夹
echo 6. 打开新标签页即可使用!
echo.
pause
