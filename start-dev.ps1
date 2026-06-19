$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$FrontendDir = Join-Path $ProjectRoot "frontend"
$BackendDir = Join-Path $ProjectRoot "backend"
$Python = Join-Path $BackendDir "venv\Scripts\python.exe"

if (-not (Test-Path $Python)) {
    throw "Backend virtual environment not found at backend\venv"
}

Push-Location $FrontendDir
try {
    npm.cmd run build
}
finally {
    Pop-Location
}

Write-Host ""
Write-Host "Extractor is available at http://localhost:8000" -ForegroundColor Green
Write-Host "API documentation: http://localhost:8000/docs" -ForegroundColor DarkGray

Push-Location $BackendDir
try {
    & $Python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
}
finally {
    Pop-Location
}
