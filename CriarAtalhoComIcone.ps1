# Primeiro cria o ícone
Write-Host "Criando icone personalizado..." -ForegroundColor Cyan
& "$PSScriptRoot\CriarIcone.ps1"

# Aguarda um momento
Start-Sleep -Seconds 1

# Cria o atalho
$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")

# Remove atalhos antigos
$OldLnk = "$DesktopPath\Ana - Controle de Acesso.lnk"
$OldBat = "$DesktopPath\Ana - Controle de Acesso.bat"

if (Test-Path $OldLnk) { Remove-Item $OldLnk -Force }
if (Test-Path $OldBat) { Remove-Item $OldBat -Force }

# Cria novo atalho com ícone personalizado
$ShortcutPath = "$DesktopPath\Ana.lnk"
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "$PSScriptRoot\Iniciar Ana.bat"
$Shortcut.WorkingDirectory = "$PSScriptRoot"
$Shortcut.IconLocation = "$PSScriptRoot\ana-icon.ico,0"
$Shortcut.Description = "Ana - Sistema de Controle de Acesso"
$Shortcut.Save()

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Atalho criado na Area de Trabalho!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Agora voce tem o icone 'Ana' com a letra A" -ForegroundColor Yellow
Write-Host "Basta dar duplo clique para iniciar o sistema!" -ForegroundColor Yellow
Write-Host ""
