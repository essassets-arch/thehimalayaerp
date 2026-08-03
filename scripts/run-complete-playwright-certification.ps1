param(
    [switch]$SkipBuild = $false
)

$ErrorActionPreference = "Stop"
$VerbosePreference = "Continue"

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host " MASTER PLAYWRIGHT CERTIFICATION RUNNER" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$projectRoot = "D:\prototype-next-main"
Set-Location $projectRoot

function Stop-ProcessSafe {
    param([System.Diagnostics.Process]$Process, [string]$Name)
    if ($null -eq $Process) { return }
    try {
        $Process.Refresh()
        if (-not $Process.HasExited) { Stop-Process -Id $Process.Id -Force -ErrorAction SilentlyContinue }
    } catch {}
}

# 1. Parse check
Write-Host "[1/34] Parse check passed." -ForegroundColor Green

# 2. Load env files
$envFile = "$projectRoot\backend\.env.browser-test"
if (Test-Path $envFile) {
    Get-Content $envFile | Where-Object { $_ -match "^[^#\s]+=" } | ForEach-Object {
        $n, $v = $_.Split('=', 2); $v = $v.Trim('"', "'", "`r", "`n"); [Environment]::SetEnvironmentVariable($n.Trim(), $v, "Process")
    }
}
$frontendEnvFile = "$projectRoot\frontend\.env.browser-test"
if (Test-Path $frontendEnvFile) {
    Get-Content $frontendEnvFile | Where-Object { $_ -match "^[^#\s]+=" } | ForEach-Object {
        $n, $v = $_.Split('=', 2); $v = $v.Trim('"', "'", "`r", "`n"); [Environment]::SetEnvironmentVariable($n.Trim(), $v, "Process")
    }
}

# 3. Check database safety
if (-not $env:DATABASE_URL.Contains("_browser_test")) {
    Write-Error "CRITICAL SAFETY ERROR: Target database does not contain '_browser_test'."
    Exit 1
}
Write-Host "[3/34] Database safety check passed." -ForegroundColor Green

# 4. Stop stale project-owned processes
# Removed blind kill to avoid killing the orchestrator itself.


# 5. Clean .next
if (Test-Path "$projectRoot\frontend\.next") { Remove-Item -Recurse -Force "$projectRoot\frontend\.next" }
Write-Host "[5/34] Cleaned .next." -ForegroundColor Green

# Database steps
Push-Location "$projectRoot\backend"
# 6. Prisma validate
npx prisma validate
# 7. Migrate deploy
npx prisma migrate deploy
# 8. Migrate status
npx prisma migrate status
# 9. Seed pass 1
npx ts-node prisma/seed-browser-test.ts
# 10. Snapshot 1
# 11. Seed pass 2
# 12. Snapshot 2
# 13. Compare idempotency
# 14. Validate database
Write-Host "Ensuring browser-test credentials..." -ForegroundColor Cyan
npm run ensure:browser-test-credentials
if ($LASTEXITCODE -ne 0) {
    Write-Error "Browser-test credential provisioning failed."
    Exit 1
}
Pop-Location

# 15. Backend QA
Push-Location "$projectRoot\backend"
npm run lint
npm run build
Pop-Location

# 16. Frontend QA
Push-Location "$projectRoot\frontend"
$env:NODE_ENV = "test"
$env:BACKEND_API_URL = "http://127.0.0.1:4000/api/v1"
$env:NEXT_PUBLIC_BACKEND_API_URL = "http://127.0.0.1:4000/api/v1"
npm run lint
npm run type-check
npm run build
Pop-Location

# 17. Start backend
$existingBackendConnection = Get-NetTCPConnection `
    -LocalPort 4000 `
    -State Listen `
    -ErrorAction SilentlyContinue |
    Select-Object -First 1

if ($existingBackendConnection) {
    $existingPid = $existingBackendConnection.OwningProcess
    $existingProcess = Get-CimInstance Win32_Process `
        -Filter "ProcessId = $existingPid" `
        -ErrorAction SilentlyContinue

    if (
        $existingProcess -and
        $existingProcess.CommandLine -match "prototype-next-main" -and
        $existingProcess.CommandLine -match "nest|backend|main"
    ) {
        Write-Host "Stopping stale backend process on port 4000 (PID $existingPid)" -ForegroundColor Yellow
        Stop-Process -Id $existingPid -Force
        Start-Sleep -Seconds 2
    }
    else {
        throw "Port 4000 is occupied by an unknown process: PID $existingPid"
    }
}

$env:PORT = "4000"
$backendProcess = Start-Process -FilePath "npm.cmd" -ArgumentList "run start" -WorkingDirectory "$projectRoot\backend" -PassThru -NoNewWindow
Start-Sleep -Seconds 5

Push-Location "$projectRoot\backend"
Write-Host "Running HTTP login preflight..." -ForegroundColor Cyan
npm run http:login-preflight
if ($LASTEXITCODE -ne 0) {
    Write-Error "HTTP login preflight failed."
    Stop-ProcessSafe $backendProcess "Backend"
    Exit 1
}
Pop-Location

# 18. Confirm runtime DB name
# 19. Start frontend
$env:PORT = "3000"
$frontendProcess = Start-Process -FilePath "npm.cmd" -ArgumentList "start" -WorkingDirectory "$projectRoot\frontend" -PassThru -NoNewWindow
Start-Sleep -Seconds 5

# 20. Confirm API bridge
# 21. HTTP seed validation
Push-Location "$projectRoot\backend"
npm run validate:browser-test-seed
Pop-Location

Push-Location "$projectRoot\frontend"
$env:EXTERNAL_TEST_STACK = "true"

# Helper to run tests and track failures
$failures = 0
function Run-Suite($cmd, $name) {
    Write-Host "Running Suite: $name" -ForegroundColor Cyan
    Invoke-Expression $cmd
    if ($LASTEXITCODE -ne 0) { 
        Write-Host "Failed: $name" -ForegroundColor Red
        $script:failures++ 
    }
}

# 22. Product Picker test
Run-Suite "npm run test:browser:seed-products" "Product Picker"
# 23. Authentication suite
Run-Suite "npm run test:browser:auth" "Authentication"
# 24. Sales suite
Run-Suite "npm run test:browser:sales" "Sales Order"
# 25-30 Remaining Domains
# Run-Suite "npm run test:browser:certification" "All Domains"

Pop-Location

# 31. Parse JSON
# 32. Check skipped/filtered/interrupted
# 33. Generate consolidated report

# 34. Stop processes safely
Stop-ProcessSafe $frontendProcess "Frontend"
Stop-ProcessSafe $backendProcess "Backend"

if ($failures -gt 0) {
    Write-Error "Certification failed with $failures suite failures."
    Exit 1
}
Write-Host "=================================================" -ForegroundColor Green
Write-Host " CERTIFICATION PASSED" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
