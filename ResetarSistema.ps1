Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   ANA - REINICIALIZACAO DO SISTEMA" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Parar processos Node/Nodemon que possam estar rodando
Write-Host "1. Parando processos antigos..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# 2. Navegar para o backend
Set-Location "$PSScriptRoot\backend"

# 3. Limpar dependências (Opcional, mas bom para garantir 'do zero')
if (Test-Path "node_modules") {
    Write-Host "2. Removendo node_modules (pode demorar)..." -ForegroundColor Yellow
    Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
}

# 4. Reinstalar
Write-Host "3. Instalando dependencias..." -ForegroundColor Yellow
npm install

# 5. Resetar Banco de Dados (Isso cria o usuário admin correto)
Write-Host "4. Resetando Banco de Dados e criando Admin..." -ForegroundColor Yellow
npx prisma migrate reset --force

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "   SISTEMA RECONSTRUIDO COM SUCESSO!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Usuario Admin restaurado:"
Write-Host "Email: admin@ana.com"
Write-Host "Senha: admin123"
Write-Host ""
Write-Host "Pressione ENTER para fechar..."
Read-Host
