<#
.SYNOPSIS
    Master Browser-Test Database Seeding Runner

.DESCRIPTION
    Validates environment, runs migrations, seeds data idempotently,
    verifies snapshots, and runs the frontend Playwright test.
#>

$ErrorActionPreference = "Stop"
$VerbosePreference = "Continue"

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host " MASTER BROWSER-TEST SEED & VERIFICATION RUNNER" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Parse-check
Write-Host "[1/19] Parse check passed." -ForegroundColor Green

# Helper function
function Stop-ProcessSafe {
    param(
        [System.Diagnostics.Process]$Process,
        [string]$Name
    )

    if ($null -eq $Process) {
        return
    }

    try {
        $Process.Refresh()

        if (-not $Process.HasExited) {
            Stop-Process -Id $Process.Id -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped $Name process $($Process.Id)."
        }
        else {
            Write-Host "$Name process already exited."
        }
    }
    catch {
        Write-Host "$Name process was already unavailable."
    }
}

# 2. Load Environment Variables
$envFile = "$PSScriptRoot\..\backend\.env.browser-test"
if (Test-Path $envFile) {
    Get-Content $envFile | Where-Object { $_ -match "^[^#\s]+=" } | ForEach-Object {
        $name, $value = $_.Split('=', 2)
        $value = $value.Trim('"', "'", "`r", "`n")
        [Environment]::SetEnvironmentVariable($name.Trim(), $value, "Process")
    }
}
$frontendEnvFile = "$PSScriptRoot\..\frontend\.env.browser-test"
if (Test-Path $frontendEnvFile) {
    Get-Content $frontendEnvFile | Where-Object { $_ -match "^[^#\s]+=" } | ForEach-Object {
        $name, $value = $_.Split('=', 2)
        $value = $value.Trim('"', "'", "`r", "`n")
        [Environment]::SetEnvironmentVariable($name.Trim(), $value, "Process")
    }
} else {
    Write-Error "frontend/.env.browser-test is required."
}
Write-Host "[2/19] Loaded environment variables." -ForegroundColor Green

# 3. Verify Database Safety Rule
$dbUrl = $env:DATABASE_URL
if (-not $dbUrl) {
    Write-Error "DATABASE_URL is not set!"
}
$sanitized = $dbUrl -replace ':[^:@]+@', ':***@'
Write-Host "[3/19] Target Database URL: $sanitized" -ForegroundColor Yellow

# Use database-name parsing logic (like node code)
$uri = [System.Uri]$dbUrl
$dbName = $uri.AbsolutePath.TrimStart('/')
if (-not $dbName.EndsWith("_browser_test")) {
    Write-Error "SAFETY ABORT: DATABASE_URL does not end with '_browser_test'."
}
Write-Host "       Safety check passed." -ForegroundColor Green

# 4. Prisma Validate
Write-Host "[4/19] Running prisma validate..." -ForegroundColor Cyan
$backendDir = "$PSScriptRoot\..\backend"
$frontendDir = "$PSScriptRoot\..\frontend"

Push-Location $backendDir
npx prisma validate
if ($LASTEXITCODE -ne 0) { Write-Error "Prisma validate failed" }
Write-Host "       Prisma validate passed." -ForegroundColor Green

# 5. Prisma Migrate Deploy
Write-Host "[5/19] Deploying migrations..." -ForegroundColor Cyan
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) { Write-Error "Prisma migrate deploy failed" }
Write-Host "       Migrations deployed successfully." -ForegroundColor Green

# 6. Prisma Migrate Status
Write-Host "[6/19] Checking migration status..." -ForegroundColor Cyan
npx prisma migrate status
if ($LASTEXITCODE -ne 0) { Write-Error "Prisma migrate status failed" }
Write-Host "       Migration status check passed." -ForegroundColor Green

# Helper function to run snapshot
function Capture-Snapshot($FilePath) {
    npx tsx scripts/snapshot-db.ts $FilePath
    if ($LASTEXITCODE -ne 0) { Write-Error "Snapshot failed" }
}

# 7. Seed Pass 1
Write-Host "[7/19] Running Seed Pass 1..." -ForegroundColor Cyan
npm run seed:browser-test
if ($LASTEXITCODE -ne 0) { Write-Error "Seed Pass 1 failed" }

# 8. Capture Snapshot 1
Write-Host "[8/19] Capturing Snapshot 1..." -ForegroundColor Cyan
$snap1 = "$backendDir\snap1.json"
Capture-Snapshot $snap1

# 9. Seed Pass 2
Write-Host "[9/19] Running Seed Pass 2 (Idempotency test)..." -ForegroundColor Cyan
npm run seed:browser-test
if ($LASTEXITCODE -ne 0) { Write-Error "Seed Pass 2 failed" }

# 10. Capture Snapshot 2
Write-Host "[10/19] Capturing Snapshot 2..." -ForegroundColor Cyan
$snap2 = "$backendDir\snap2.json"
Capture-Snapshot $snap2

# 11. Compare Snapshots
Write-Host "[11/19] Comparing snapshots for idempotency..." -ForegroundColor Cyan
$c1 = Get-Content $snap1 -Raw
$c2 = Get-Content $snap2 -Raw
if ($c1 -ne $c2) {
    Write-Error "IDEMPOTENCY FAILURE: Database state changed between Pass 1 and Pass 2!"
}
$dupCheck = $c1 | ConvertFrom-Json
if ($dupCheck.duplicates.emails -gt 0 -or $dupCheck.duplicates.perms -gt 0) {
    Write-Error "IDEMPOTENCY FAILURE: Duplicates detected!"
}
Write-Host "        Snapshots match! Seed is idempotent." -ForegroundColor Green

# 12. Run Validation Script (Database Only)
Write-Host "[12/19] Running seed validation (Pre-HTTP)..." -ForegroundColor Cyan
npm run validate:browser-test-seed -- --mode database
if ($LASTEXITCODE -ne 0) { Write-Error "Database validation failed" }

Pop-Location # return to original

$backendProc = $null
$frontendProc = $null

try {
    # 13. Start Backend
    Write-Host "[13/19] Starting backend..." -ForegroundColor Cyan
    Write-Host "[13.1/19] Building backend to ensure latest code..." -ForegroundColor Cyan
    $buildProc = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "build" -WorkingDirectory $backendDir -NoNewWindow -PassThru -Wait
    if ($buildProc.ExitCode -ne 0) {
        Write-Error "Backend build failed."
    }

    $backendProc = Start-Process `
        -FilePath "node.exe" `
        -ArgumentList "scripts/start-browser-test.js" `
        -WorkingDirectory $backendDir `
        -RedirectStandardOutput "$backendDir\backend-seed-test.log" `
        -RedirectStandardError "$backendDir\backend-seed-test.err.log" `
        -NoNewWindow `
        -PassThru

    # 14. Wait for Backend HTTP
    Write-Host "[14/19] Waiting for Backend readiness..." -ForegroundColor Cyan
    $retries = 30
    while ($retries -gt 0) {
        try {
            $res = Invoke-WebRequest -Uri "http://127.0.0.1:4000/api/v1/health" -Method Get -UseBasicParsing -ErrorAction Stop
            if ($res.StatusCode -eq 200) { break }
        } catch {
            # ignore
        }
        Start-Sleep -Seconds 1
        $retries--
    }
    if ($retries -eq 0) {
        Write-Error "Backend did not become ready."
    }
    Write-Host "        Backend is ready at http://127.0.0.1:4000/api/v1" -ForegroundColor Green

    # 15. Start Frontend
    Write-Host "[15/19] Starting frontend..." -ForegroundColor Cyan

    # Allocate a private frontend port and build directory for this run. This
    # prevents a stale local server from being mistaken for the test stack.
    $portProbe = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
    $portProbe.Start()
    $frontendPort = ([System.Net.IPEndPoint]$portProbe.LocalEndpoint).Port
    $portProbe.Stop()

    $env:PORT = "$frontendPort"
    $env:BACKEND_API_URL = "http://127.0.0.1:4000/api/v1"
    $env:NEXT_DIST_DIR = ".next-browser-test-$frontendPort"

    Write-Host "[15.1/19] Building frontend to ensure latest code..." -ForegroundColor Cyan
    $frontendBuildProc = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "build" -WorkingDirectory $frontendDir -NoNewWindow -PassThru -Wait
    if ($frontendBuildProc.ExitCode -ne 0) {
        Write-Error "Frontend build failed."
    }

    $frontendProc = Start-Process `
        -FilePath "npm.cmd" `
        -ArgumentList "run", "start" `
        -WorkingDirectory $frontendDir `
        -NoNewWindow `
        -RedirectStandardOutput "$frontendDir\frontend-seed-test.log" `
        -RedirectStandardError "$frontendDir\frontend-seed-test.err.log" `
        -PassThru

    # 16. Wait for Frontend
    Write-Host "[16/19] Waiting for Frontend readiness..." -ForegroundColor Cyan
    $retries = 30
    while ($retries -gt 0) {
        try {
            $res = Invoke-WebRequest -Uri "http://127.0.0.1:$frontendPort/login" -Method Get -UseBasicParsing -ErrorAction Stop
            if ($res.StatusCode -eq 200) { break }
        } catch {
            # ignore
        }
        Start-Sleep -Seconds 1
        $retries--
    }
    if ($retries -eq 0) {
        Write-Error "Frontend did not become ready."
    }
    Write-Host "        Frontend is ready." -ForegroundColor Green

    # 17. Run full Validation Script (Including HTTP)
    Write-Host "[17/19] Running HTTP-based seed validation..." -ForegroundColor Cyan
    Push-Location $backendDir
    npm run validate:browser-test-seed
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Seed validation (HTTP) failed."
    }
    Pop-Location

    # 18. Run Product Picker Playwright Test
    Write-Host "[18/19] Running Product Picker Playwright Test..." -ForegroundColor Cyan
    Push-Location $frontendDir
    $env:EXTERNAL_TEST_STACK = "true"
    $env:BASE_URL = "http://127.0.0.1:$frontendPort"
    npm run test:browser:seed-products
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Playwright smoke test failed."
    }
    Pop-Location
    Write-Host "        Test passed." -ForegroundColor Green

    # 19. Generate Reports
    Write-Host "[19/19] Seed report generated by validation script." -ForegroundColor Cyan
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host " SUCCESSFULLY SEEDED AND VERIFIED BROWSER TEST DB" -ForegroundColor Green
    Write-Host "=================================================" -ForegroundColor Cyan

} finally {
    Write-Host "Stopping background processes..." -ForegroundColor Cyan

    Stop-ProcessSafe -Process $frontendProc -Name "Frontend"
    Stop-ProcessSafe -Process $backendProc -Name "Backend"
}
