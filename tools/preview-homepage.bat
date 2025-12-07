@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   GrassTab 发布页 - 本地预览
echo ========================================
echo.

cd /d "%~dp0..\doc\homepage"

echo 正在启动本地服务器...
echo.
echo 浏览器将自动打开: http://localhost:8000
echo.
echo 按 Ctrl+C 停止服务器
echo.
echo ========================================
echo.

cd dist
python -m http.server 8000
