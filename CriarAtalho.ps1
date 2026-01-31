# Script para criar atalho com ícone personalizado
$WshShell = New-Object -ComObject WScript.Shell

# Remove atalho antigo se existir
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = "$DesktopPath\Ana - Controle de Acesso.lnk"
$OldBat = "$DesktopPath\Ana - Controle de Acesso.bat"

if (Test-Path $OldBat) {
    Remove-Item $OldBat -Force
}

# Cria novo atalho
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "C:\Users\SEMI DEUS\Ana\Iniciar Ana.bat"
$Shortcut.WorkingDirectory = "C:\Users\SEMI DEUS\Ana"
$Shortcut.IconLocation = "C:\Windows\System32\shell32.dll,13"
$Shortcut.Description = "Ana - Sistema de Controle de Acesso"
$Shortcut.Save()

Write-Host "Atalho criado com sucesso!" -ForegroundColor Green
Write-Host "Verifique sua area de trabalho." -ForegroundColor Cyan
