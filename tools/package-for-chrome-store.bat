@echo off
chcp 65001 >nul
echo ====================================
echo   GrassTab Chrome 商店打包工具
echo ====================================
echo.

REM 检查 chrome-extension 目录是否存在
if not exist "chrome-extension\" (
    echo [错误] chrome-extension 目录不存在！
    echo 请先运行 npm run build 构建扩展
    pause
    exit /b 1
)

echo [1/3] 准备打包...

REM 删除旧的打包文件
if exist "grasstab-chrome-extension.zip" (
    del /f /q "grasstab-chrome-extension.zip"
    echo 已删除旧的打包文件
)

echo.
echo [2/3] 正在打包 chrome-extension 目录...

REM 使用 PowerShell 压缩文件夹
powershell -command "Compress-Archive -Path 'chrome-extension\*' -DestinationPath 'grasstab-chrome-extension.zip' -CompressionLevel Optimal -Force"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [错误] 打包失败！
    pause
    exit /b 1
)

echo.
echo [3/3] 验证打包文件...

REM 检查文件是否创建成功
if exist "grasstab-chrome-extension.zip" (
    echo.
    echo ====================================
    echo   ✓ 打包完成！
    echo ====================================
    echo.
    echo 文件位置: %CD%\grasstab-chrome-extension.zip
    
    REM 获取文件大小
    for %%I in (grasstab-chrome-extension.zip) do echo 文件大小: %%~zI 字节
    
    echo.
    echo 下一步：
    echo 1. 访问 https://chrome.google.com/webstore/devconsole
    echo 2. 点击"新增项"
    echo 3. 上传 grasstab-chrome-extension.zip
    echo 4. 填写商店信息（参考 CHROME_STORE_LISTING.md）
    echo.
    echo 提示：请确保已准备好截图和图标
    echo.
) else (
    echo.
    echo [错误] 打包文件未创建！
    pause
    exit /b 1
)

pause
