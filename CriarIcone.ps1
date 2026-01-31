# Script para criar ícone personalizado do Ana
Add-Type -AssemblyName System.Drawing

$size = 256
$bitmap = New-Object System.Drawing.Bitmap($size, $size)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

# Configurações de qualidade
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# Cores
$azulPrimario = [System.Drawing.Color]::FromArgb(255, 37, 99, 235)  # #2563eb
$azulEscuro = [System.Drawing.Color]::FromArgb(255, 29, 78, 216)    # #1d4ed8
$branco = [System.Drawing.Color]::White

# Fundo com gradiente (simulado com círculo)
$brush = New-Object System.Drawing.SolidBrush($azulPrimario)
$graphics.FillEllipse($brush, 10, 10, 236, 236)

# Borda mais escura
$pen = New-Object System.Drawing.Pen($azulEscuro, 8)
$graphics.DrawEllipse($pen, 10, 10, 236, 236)

# Letra A
$fontFamily = New-Object System.Drawing.FontFamily("Segoe UI")
$font = New-Object System.Drawing.Font($fontFamily, 140, [System.Drawing.FontStyle]::Bold)
$brushTexto = New-Object System.Drawing.SolidBrush($branco)

$stringFormat = New-Object System.Drawing.StringFormat
$stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
$stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center

$rect = New-Object System.Drawing.RectangleF(0, 10, $size, $size)
$graphics.DrawString("A", $font, $brushTexto, $rect, $stringFormat)

# Salvar como PNG primeiro
$pngPath = "C:\Users\SEMI DEUS\Ana\ana-icon.png"
$bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Criar múltiplos tamanhos para o ICO
$icoPath = "C:\Users\SEMI DEUS\Ana\ana-icon.ico"

# Criar ícone com tamanhos diferentes
$icon16 = New-Object System.Drawing.Bitmap($bitmap, 16, 16)
$icon32 = New-Object System.Drawing.Bitmap($bitmap, 32, 32)
$icon48 = New-Object System.Drawing.Bitmap($bitmap, 48, 48)
$icon256 = $bitmap

# Salvar como ICO usando método alternativo
$memoryStream = New-Object System.IO.MemoryStream
$icon32.Save($memoryStream, [System.Drawing.Imaging.ImageFormat]::Png)
$iconBytes = $memoryStream.ToArray()

# Criar arquivo ICO manualmente
$icoHeader = [byte[]]@(0,0,1,0,1,0,32,32,0,0,1,0,32,0)
$icoSize = [BitConverter]::GetBytes([int32]$iconBytes.Length)
$icoOffset = [byte[]]@(22,0,0,0)

$fileStream = [System.IO.File]::Create($icoPath)
$fileStream.Write($icoHeader, 0, $icoHeader.Length)
$fileStream.Write($icoSize, 0, 4)
$fileStream.Write($icoOffset, 0, 4)
$fileStream.Write($iconBytes, 0, $iconBytes.Length)
$fileStream.Close()

# Limpar
$graphics.Dispose()
$bitmap.Dispose()
$memoryStream.Dispose()

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Icone do Ana criado com sucesso!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Arquivo: $icoPath" -ForegroundColor Yellow
