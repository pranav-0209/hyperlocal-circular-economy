$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$pythonExe = "C:/Users/pnarv/AppData/Local/Python/pythoncore-3.14-64/python.exe"
if (-not (Test-Path $pythonExe)) {
    $pythonExe = "python"
}

Write-Host "Installing dependencies..."
& $pythonExe -m pip install -r requirements.txt | Out-Null

$hostName = "127.0.0.1"
$port = 8000
$baseUrl = "http://$hostName`:$port"
$logFile = Join-Path $scriptDir "uvicorn_run.log"
$errLogFile = Join-Path $scriptDir "uvicorn_error.log"

if (Test-Path $logFile) {
    Remove-Item $logFile -Force
}

if (Test-Path $errLogFile) {
    Remove-Item $errLogFile -Force
}

Write-Host "Starting API server..."
$proc = Start-Process -FilePath $pythonExe -ArgumentList "-m", "uvicorn", "ai_service:app", "--host", $hostName, "--port", "$port" -WorkingDirectory $scriptDir -RedirectStandardOutput $logFile -RedirectStandardError $errLogFile -PassThru

$ready = $false
for ($i = 0; $i -lt 60; $i++) {
    try {
        Invoke-RestMethod -Method Get -Uri "$baseUrl/openapi.json" | Out-Null
        $ready = $true
        break
    } catch {
        Start-Sleep -Seconds 1
    }
}

if (-not $ready) {
    Write-Host "Server did not become ready in time."
    if (Test-Path $logFile) {
        Write-Host "Server output logs:"
        Get-Content $logFile
    }
    if (Test-Path $errLogFile) {
        Write-Host "Server error logs:"
        Get-Content $errLogFile
    }
    if (-not $proc.HasExited) {
        Stop-Process -Id $proc.Id -Force
    }
    exit 1
}

Write-Host "Server is running. Testing category suggestion..."
$categoryBody = @{ item_name = "Nike T-Shirt" } | ConvertTo-Json
$categoryResponse = Invoke-RestMethod -Method Post -Uri "$baseUrl/predict/category" -ContentType "application/json" -Body $categoryBody

Write-Host "Category suggestion response:"
$categoryResponse | ConvertTo-Json -Depth 5

Write-Host "Testing price prediction with suggested category + manual condition..."
$priceBody = @{
    item_name = "Nike T-Shirt"
    category = $categoryResponse.category
    condition = "Good"
} | ConvertTo-Json
$priceResponse = Invoke-RestMethod -Method Post -Uri "$baseUrl/predict/price" -ContentType "application/json" -Body $priceBody

Write-Host "Price prediction response:"
$priceResponse | ConvertTo-Json -Depth 5

if (-not $proc.HasExited) {
    Stop-Process -Id $proc.Id -Force
}

Write-Host "Done. API test completed and server stopped."
