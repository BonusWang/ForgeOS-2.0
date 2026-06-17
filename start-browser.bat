@echo off
chcp 65001 >nul
title Forge-OS Dev Server
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\dev-launch.ps1"

echo.
pause
