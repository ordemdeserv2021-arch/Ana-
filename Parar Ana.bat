@echo off
title Parando Ana
color 0C

echo ========================================
echo    Parando Sistema Ana...
echo ========================================
echo.

:: Encerra processos Node.js
taskkill /f /im node.exe 2>nul

echo.
echo Sistema Ana encerrado!
echo.
pause
