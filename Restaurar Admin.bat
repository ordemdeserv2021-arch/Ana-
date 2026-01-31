@echo off
title Restaurar Admin - Ana
color 0E

echo ========================================
echo    Restaurando Usuario Admin
echo ========================================
echo.

cd /d "%~dp0backend"
call npm run seed

echo.
echo ========================================
echo Concluido! Login: admin@ana.com / 123456
echo ========================================
pause