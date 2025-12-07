@echo off
echo ================================
echo GrassTab 移动端调试服务器
echo ================================
echo.

REM 启动开发服务器
echo [1/2] 启动 Vite 开发服务器...
echo.
start cmd /k "cd /d %~dp0 && npm run dev"

REM 等待服务器启动
timeout /t 3 /nobreak >nul

REM 获取本机 IP 地址
echo [2/2] 获取本机 IP 地址...
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :show
)

:show
echo ================================
echo 移动端访问地址:
echo http://%IP::= %:5173
echo ================================
echo.
echo 提示:
echo 1. 确保手机和电脑在同一WiFi网络
echo 2. 在手机浏览器中输入上面的地址
echo 3. 添加到主屏幕获得最佳体验
echo.
echo 按任意键退出...
pause >nul
