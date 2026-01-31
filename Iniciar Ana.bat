@echo off
title Ana - Sistema de Controle de Acesso
color 0A

echo ========================================
echo    ANA - Sistema de Controle de Acesso
echo ========================================
echo.
echo Iniciando os servidores...
echo.

:: Inicia o Backend em uma nova janela
start "Ana Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

:: Aguarda 3 segundos para o backend iniciar
timeout /t 3 /nobreak > nul

:: Inicia o Frontend em uma nova janela
start "Ana Frontend" cmd /k "cd /d "%~dp0web" && npm run dev"

:: Aguarda 5 segundos para o frontend iniciar
timeout /t 5 /nobreak > nul

:: Abre o navegador
start http://localhost:5173

echo.
echo ========================================
echo Sistema Ana iniciado com sucesso!
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Login: admin@ana.com / 123456
echo ========================================
echo.
echo Pressione qualquer tecla para fechar esta janela...
echo (Os servidores continuarao rodando)
pause > nul
