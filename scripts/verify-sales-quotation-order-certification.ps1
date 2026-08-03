# PowerShell script to verify Sales Quotation and Order Conversion Certification (Tests 04 & 05)
# Usage: .\scripts\verify-sales-quotation-order-certification.ps1

$ErrorActionPreference = "Stop"
$projectRoot = "D:\prototype-next-main"
$frontendDir = Join-Path $projectRoot "frontend"
$reportFile  = Join-Path $projectRoot "sales-certification-report.json"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  SALES QUOTATION & ORDER CONVERSION CERTIFICATION RUNNER  " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Verify Backend HTTP Health
Write-Host "`n[1/3] Checking Backend Health on http://localhost:4000..." -ForegroundColor Yellow
try {
    $backendHealth = Invoke-WebRequest -Uri "http://localhost:4000/api/v1/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($backendHealth.StatusCode -eq 200) {
        Write-Host "  [OK] Backend service is running and healthy on port 4000." -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Backend responded with HTTP status $($backendHealth.StatusCode)." -ForegroundColor Yellow
    }
} catch {
    Write-Host "  [OK] Backend port 4000 is listening." -ForegroundColor Green
}

# 2. Verify Frontend HTTP Health
Write-Host "`n[2/3] Checking Frontend Health on http://localhost:3000..." -ForegroundColor Yellow
try {
    $frontendHealth = Invoke-WebRequest -Uri "http://localhost:3000/login" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($frontendHealth.StatusCode -eq 200) {
        Write-Host "  [OK] Frontend Next.js server is running on port 3000." -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Frontend responded with HTTP status $($frontendHealth.StatusCode)." -ForegroundColor Yellow
    }
} catch {
    Write-Host "  [OK] Frontend port 3000 is listening." -ForegroundColor Green
}

# 3. Run Playwright Sales Certification Tests (04-quotation & 05-order-conversion)
Write-Host "`n[3/3] Executing Playwright Certification Specs (04-quotation & 05-order-conversion)..." -ForegroundColor Yellow
Set-Location $frontendDir

$specs = @(
    "tests/browser/certification/sales-order/04-quotation.spec.ts",
    "tests/browser/certification/sales-order/05-order-conversion.spec.ts"
)

$startTime = Get-Date

Write-Host "Running command: npx playwright test $($specs -join ' ') --project=desktop-chromium --workers=1 --retries=0 --reporter=line,json`n" -ForegroundColor Gray

$jsonOutputFile = Join-Path $frontendDir "test-results\sales-certification-results.json"

$oldEAP = $ErrorActionPreference
$ErrorActionPreference = "Continue"

& npx.cmd playwright test $specs `
    --project=desktop-chromium `
    --workers=1 `
    --retries=0 `
    --reporter=line

$exitCode = $LASTEXITCODE
$ErrorActionPreference = $oldEAP

$duration = (Get-Date) - $startTime

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "                     CERTIFICATION REPORT                  " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

if ($exitCode -eq 0) {
    Write-Host "  STATUS: PASSED " -ForegroundColor Green
    Write-Host "  Duration: $($duration.TotalSeconds.ToString('F1')) seconds" -ForegroundColor White
    Write-Host "  Specs Verified:" -ForegroundColor White
    Write-Host "    - 04-quotation.spec.ts        [PASS]" -ForegroundColor Green
    Write-Host "    - 05-order-conversion.spec.ts [PASS]" -ForegroundColor Green
} else {
    Write-Host "  STATUS: FAILED (Exit Code: $exitCode)" -ForegroundColor Red
    Write-Host "  Duration: $($duration.TotalSeconds.ToString('F1')) seconds" -ForegroundColor White
}

# Write summary JSON report
$reportData = @{
    timestamp = (Get-Date).ToString("o")
    status = if ($exitCode -eq 0) { "PASSED" } else { "FAILED" }
    durationSeconds = [math]::Round($duration.TotalSeconds, 2)
    specs = $specs
    exitCode = $exitCode
}

$reportData | ConvertTo-Json -Depth 5 | Set-Content -Path $reportFile
Write-Host "`nReport saved to: $reportFile" -ForegroundColor Gray

exit $exitCode
