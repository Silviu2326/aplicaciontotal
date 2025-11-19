# Script PowerShell para usar Gemini CLI en modo YOLO
# Uso: 
#   .\gemini_yolo.ps1 "tu prompt aqui"

Write-Host "[1/4] Iniciando script (modo YOLO)..." -ForegroundColor Cyan

# 1. Cargar variables de entorno desde .env si existe
Write-Host "[2/4] Cargando variables de entorno..." -ForegroundColor Cyan
if (Test-Path .env) {
    Write-Host "  -> Archivo .env encontrado, cargando variables..." -ForegroundColor Gray
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#][^=]*)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    Write-Host "  -> Variables cargadas correctamente" -ForegroundColor Gray
} else {
    Write-Host "  -> Archivo .env no encontrado, usando variables de entorno del sistema" -ForegroundColor Gray
}

# 2. Verificar API Key
Write-Host "[3/4] Verificando API Key..." -ForegroundColor Cyan
if (-not $env:GEMINI_API_KEY) {
    Write-Host "Error: No se encontro la variable GEMINI_API_KEY" -ForegroundColor Red
    Write-Host "Por favor, crea un archivo .env en la raiz y anade: GEMINI_API_KEY=tu_clave_aqui" -ForegroundColor Yellow
    Write-Host "   O establece la variable: `$env:GEMINI_API_KEY='tu_clave_aqui'" -ForegroundColor Yellow
    exit 1
}
Write-Host "  -> API Key encontrada" -ForegroundColor Gray

# 3. Obtener prompt
if ($args.Count -lt 1) {
    Write-Host "Error: Debes pasar al menos un prompt." -ForegroundColor Red
    Write-Host 'Uso: .\gemini_yolo.ps1 "tu prompt aqui"' -ForegroundColor Yellow
    exit 1
}

# Si el prompt tiene espacios, ya viene como un solo argumento entre comillas
$Prompt = $args -join " "

Write-Host "[4/4] Llamando a Gemini en modo YOLO..." -ForegroundColor Cyan
Write-Host "  -> Prompt: $Prompt" -ForegroundColor Gray
Write-Host ""
Write-Host "Respuesta de Gemini:" -ForegroundColor Green
Write-Host "--------------------------------------------------"

try {
    $ErrorActionPreference = "SilentlyContinue"
    $output = & gemini --yolo "$Prompt" 2>&1 | Out-String
    $ErrorActionPreference = "Continue"

    $cleanOutput = $output.Trim()

    if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq $null) {
        if ($cleanOutput -and $cleanOutput.Length -gt 0) {
            Write-Host $cleanOutput
        } else {
            Write-Host "  (No se recibio respuesta visible)" -ForegroundColor Yellow
        }
        Write-Host ""
        Write-Host "  -> Comando ejecutado exitosamente" -ForegroundColor Green
    } else {
        Write-Host $cleanOutput -ForegroundColor Red
        throw "El comando fallo con codigo de salida: $LASTEXITCODE"
    }
} catch {
    Write-Host ""
    Write-Host "Error al conectar con Gemini CLI: $_" -ForegroundColor Red
    Write-Host "Verifica que Gemini CLI este correctamente instalado y configurado" -ForegroundColor Yellow
    Write-Host "   Prueba ejecutar: gemini --help" -ForegroundColor Yellow
    exit 1
}

Write-Host "--------------------------------------------------"
Write-Host ""
Write-Host "Proceso completado!" -ForegroundColor Green
