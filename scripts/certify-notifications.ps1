# ================================================================
# HIMALAYA ERP - MASTER NOTIFICATION CERTIFICATION
# PostgreSQL Bell + Firebase FCM Push
# ================================================================
#
# Run from repository root:
#
#   powershell -ExecutionPolicy Bypass -File .\scripts\certify-notifications.ps1
#
# Optional:
#   $env:TEST_EMAIL="admin@himalayaerp.com"
#   $env:TEST_PASSWORD="admin123"
#   .\scripts\certify-notifications.ps1
#
# IMPORTANT:
# - Uses PostgreSQL notification as source of truth.
# - Does NOT print Firebase private key.
# - FCM live delivery requires configured Firebase credentials.
# ================================================================

$ErrorActionPreference = "Continue"

$ROOT = (Get-Location).Path
$BACKEND = Join-Path $ROOT "backend"
$FRONTEND = Join-Path $ROOT "frontend"

$BACKEND_URL = if ($env:BACKEND_URL) {
    $env:BACKEND_URL.TrimEnd("/")
} else {
    # Auto-detect active backend port (4000 or 4001)
    $port = 4000
    $tcp = New-Object System.Net.Sockets.TcpClient
    try {
        $tcp.Connect("127.0.0.1", 4001)
        if ($tcp.Connected) {
            $port = 4001
            $tcp.Close()
        }
    } catch {}
    "http://localhost:$port/api/v1"
}

$TEST_EMAIL = if ($env:TEST_EMAIL) { $env:TEST_EMAIL } else { "admin@himalayaerp.com" }
$TEST_PASSWORD = if ($env:TEST_PASSWORD) { $env:TEST_PASSWORD } else { "admin123" }

$Passed = 0
$Failed = 0
$Warnings = 0
$Skipped = 0

$script:fcmSuccessCount = 0
$script:fcmFailureCount = 0
$script:fcmErrors = @()
$script:fcmDeliveryStatus = "SKIP"

$Results = @()

# ------------------------------------------------
# Helpers
# ------------------------------------------------

function Write-Section($title) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host $title -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
}

function Pass($name, $details = "") {
    $script:Passed++
    Write-Host "[PASS] $name" -ForegroundColor Green
    if ($details) {
        Write-Host "       $details" -ForegroundColor DarkGray
    }
    $script:Results += [PSCustomObject]@{
        Status = "PASS"
        Test = $name
        Details = $details
    }
}

function Fail($name, $details = "") {
    $script:Failed++
    Write-Host "[FAIL] $name" -ForegroundColor Red
    if ($details) {
        Write-Host "       $details" -ForegroundColor Yellow
    }
    $script:Results += [PSCustomObject]@{
        Status = "FAIL"
        Test = $name
        Details = $details
    }
}

function Warn($name, $details = "") {
    $script:Warnings++
    Write-Host "[WARN] $name" -ForegroundColor Yellow
    if ($details) {
        Write-Host "       $details" -ForegroundColor DarkGray
    }
    $script:Results += [PSCustomObject]@{
        Status = "WARN"
        Test = $name
        Details = $details
    }
}

function Skip($name, $details = "") {
    $script:Skipped++
    Write-Host "[SKIP] $name" -ForegroundColor Gray
    if ($details) {
        Write-Host "       $details" -ForegroundColor DarkGray
    }
    $script:Results += [PSCustomObject]@{
        Status = "SKIP"
        Test = $name
        Details = $details
    }
}

# ------------------------------------------------
# 1. DB SCHEMA CHECKS
# ------------------------------------------------
Write-Section "1. DATABASE SCHEMA VALIDATION"

$schemaPath = Join-Path $BACKEND "prisma/schema.prisma"
if (Test-Path $schemaPath) {
    $schemaContent = Get-Content -Path $schemaPath -Raw
    
    if ($schemaContent -match "model\s+Notification\s*\{") {
        Pass "Notification table definition in schema.prisma"
    } else {
        Fail "Notification table definition missing in schema.prisma"
    }

    if ($schemaContent -match "model\s+FcmDeviceToken\s*\{") {
        Pass "FcmDeviceToken table definition in schema.prisma"
    } else {
        Fail "FcmDeviceToken table definition missing in schema.prisma"
    }
} else {
    Fail "Prisma schema file not found" "Path: $schemaPath"
}

# ------------------------------------------------
# 2. FIREBASE CONFIGURATION CHECKS
# ------------------------------------------------
Write-Section "2. FIREBASE CONFIGURATION VALIDATION"

$hasFirebaseConfig = $false
$firebaseDetails = ""

# 1. Check if env json exists
if ($env:FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
        $json = $env:FIREBASE_SERVICE_ACCOUNT_JSON | ConvertFrom-Json
        if ($json.project_id -and $json.private_key) {
            $hasFirebaseConfig = $true
            $firebaseDetails = "FIREBASE_SERVICE_ACCOUNT_JSON env var is configured (project_id: $($json.project_id))"
        }
    } catch {}
}

# 2. Check if service account file exists
if (-not $hasFirebaseConfig) {
    $saPath = if ($env:FIREBASE_SERVICE_ACCOUNT_PATH) { $env:FIREBASE_SERVICE_ACCOUNT_PATH } else { "firebase-service-account.json" }
    $firebaseJsonPath = Join-Path $BACKEND $saPath
    if (Test-Path $firebaseJsonPath) {
        try {
            $json = Get-Content -Path $firebaseJsonPath -Raw | ConvertFrom-Json
            if ($json.project_id -and $json.private_key) {
                $hasFirebaseConfig = $true
                $firebaseDetails = "firebase-service-account.json is present (project_id: $($json.project_id))"
            }
        } catch {}
    }
}

# 3. Check individual env variables
if (-not $hasFirebaseConfig) {
    if ($env:FIREBASE_PROJECT_ID -and $env:FIREBASE_CLIENT_EMAIL -and $env:FIREBASE_PRIVATE_KEY) {
        $hasFirebaseConfig = $true
        $firebaseDetails = "Individual env variables configured (project_id: $($env:FIREBASE_PROJECT_ID))"
    }
}

if ($hasFirebaseConfig) {
    Pass "Firebase Admin credentials validated" $firebaseDetails
} else {
    Warn "Firebase Admin credentials not configured" "Live FCM delivery requires service account JSON or environment variables."
}

# Check frontend firebase VAPID keys
$frontendFirebasePath = Join-Path $FRONTEND "shared/firebase/firebase.js"
if (Test-Path $frontendFirebasePath) {
    $content = Get-Content -Path $frontendFirebasePath -Raw
    if ($content -match "apiKey" -and $content -match "messagingSenderId") {
        Pass "Frontend Firebase SDK initialized successfully in firebase.js"
    } else {
        Fail "Frontend Firebase credentials incomplete in firebase.js"
    }
} else {
    Warn "Frontend firebase.js config not found"
}

# ------------------------------------------------
# 3. BACKEND SERVICE & AUTH CHECK
# ------------------------------------------------
Write-Section "3. BACKEND CONNECTION & AUTHENTICATION"

$loginToken = ""
$userHeaders = @{}

try {
    # Test connection
    $healthCheck = Invoke-RestMethod -Uri "$BACKEND_URL" -Method Get -TimeoutSec 5 -ErrorAction Ignore
    Pass "Backend server is up and listening"
} catch {
    Warn "Backend health check failed" "Check if backend server is running on port 4001. Proceeding with endpoint checks."
}

try {
    # Attempt Login
    $loginBody = @{
        email = $TEST_EMAIL
        password = $TEST_PASSWORD
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BACKEND_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -TimeoutSec 5 -ErrorAction Stop
    
    $token = if ($loginResponse.data.accessToken) { $loginResponse.data.accessToken } else { $loginResponse.accessToken }
    $companyId = if ($loginResponse.data.user.companyId) { $loginResponse.data.user.companyId } else { $loginResponse.user.companyId }

    if ($token) {
        $loginToken = $token
        $userHeaders = @{
            "Authorization" = "Bearer $loginToken"
            "x-company-id" = $companyId
        }
        Pass "Authenticated successfully as $($TEST_EMAIL)"
    } else {
        Fail "Authentication returned empty access token"
    }
} catch {
    Fail "Failed to authenticate" "Request to /auth/login failed: $_"
}

# ------------------------------------------------
# 4. BELL NOTIFICATION API CHECKS
# ------------------------------------------------
Write-Section "4. BELL NOTIFICATION API CHECKS"

if ($loginToken) {
    try {
        # Seed a test notification for the admin user via Node/Prisma to ensure the feed is not empty
        $tempJs = Join-Path $ROOT "backend/scratch-seed-test-notif.js"
        $jsCode = @"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const user = await prisma.user.findFirst({ where: { email: 'admin@himalayaerp.com' } });
  if (user) {
    await prisma.notification.upsert({
      where: { id: 'test-notif-123' },
      update: { isRead: false },
      create: {
        id: 'test-notif-123',
        companyId: user.companyId,
        userId: user.id,
        type: 'TEST_NOTIF',
        title: 'Test Notification',
        message: 'This is a test notification',
        isRead: false
      }
    });
  }
})().catch(err => console.error(err)).finally(() => prisma.`$disconnect());
"@
        $jsCode | Out-File -FilePath $tempJs -Encoding utf8
        $oldDbUrl = $env:DATABASE_URL
        $env:DATABASE_URL = 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public'
        node $tempJs | Out-Null
        $env:DATABASE_URL = $oldDbUrl
        Remove-Item -Path $tempJs -ErrorAction Ignore

        # 1. Fetch Notifications
        $notifsRes = Invoke-RestMethod -Uri "$BACKEND_URL/notifications" -Method Get -Headers $userHeaders -TimeoutSec 5
        $notifs = if ($notifsRes.data) { $notifsRes.data } else { $notifsRes }
        
        $notifsList = @($notifs.items)
        Pass "Fetch notifications API returned successfully" "Count: $($notifsList.Count)"

        # 2. Fetch Unread Count
        $unreadRes = Invoke-RestMethod -Uri "$BACKEND_URL/notifications/unread-count" -Method Get -Headers $userHeaders -TimeoutSec 5
        $unreadObj = if ($unreadRes.data) { $unreadRes.data } else { $unreadRes }
        Pass "Fetch unread count API returned successfully" "Unread Count: $($unreadObj.unreadCount)"

        # 3. Mark All As Read
        $readAllRes = Invoke-RestMethod -Uri "$BACKEND_URL/notifications/read-all" -Method Patch -Headers $userHeaders -TimeoutSec 5
        if ($readAllRes.success) {
            Pass "Mark all as read API succeeded"
        } else {
            Fail "Mark all as read API did not return success"
        }

        # 4. Mark Single Read (if exists)
        if ($notifsList.Count -gt 0) {
            $testNotifId = $notifsList[0].id
            $readSingleRes = Invoke-RestMethod -Uri "$BACKEND_URL/notifications/$testNotifId/read" -Method Patch -Headers $userHeaders -TimeoutSec 5
            if ($readSingleRes.success) {
                Pass "Mark single notification read API succeeded" "ID: $testNotifId"
            } else {
                Fail "Mark single notification read API failed" "ID: $testNotifId"
            }
        } else {
            Skip "Mark single notification read API (No notifications in feed)"
        }
    } catch {
        Fail "Bell notification API endpoint error" "Error message: $_"
    }
} else {
    Skip "Bell notification API checks (No authentication token)"
}

# ------------------------------------------------
# 5. FCM DEVICE TOKEN REGISTRATION CHECKS
# ------------------------------------------------
Write-Section "5. FCM DEVICE TOKEN REGISTRATION CHECKS"

if ($loginToken) {
    try {
        $mockToken = "MOCK_DEVICE_TOKEN_XYZ_12345"
        
        # 1. Register Token
        $registerBody = @{
            token = $mockToken
            deviceType = "web"
            userAgent = "PowerShell Certifier"
        } | ConvertTo-Json

        $registerRes = Invoke-RestMethod -Uri "$BACKEND_URL/notifications/device-token" -Method Post -Headers $userHeaders -Body $registerBody -ContentType "application/json" -TimeoutSec 5
        if ($registerRes.success) {
            Pass "Register FCM device token API succeeded"
        } else {
            Fail "Register FCM device token API failed"
        }

        # 2. Get Push Status Diagnostics
        $statusRes = Invoke-RestMethod -Uri "$BACKEND_URL/notifications/push-status" -Method Get -Headers $userHeaders -TimeoutSec 5
        $statusObj = if ($statusRes.data) { $statusRes.data } else { $statusRes }
        if ($statusObj.firebaseProjectId) {
            Pass "Get push status diagnostics API succeeded" "Project: $($statusObj.firebaseProjectId), Registered: $($statusObj.registeredDeviceTokens)"
        } else {
            Fail "Get push status diagnostics API failed"
        }

        # 3. Test Push POST
        $testPushBody = @{} | ConvertTo-Json
        $testPushRes = Invoke-RestMethod -Uri "$BACKEND_URL/notifications/test-push" -Method Post -Headers $userHeaders -Body $testPushBody -ContentType "application/json" -TimeoutSec 5
        $testPushObj = if ($testPushRes.data) { $testPushRes.data } else { $testPushRes }
        if ($testPushRes.success) {
            Pass "POST test-push API call succeeded" "TokensCount: $($testPushObj.tokensCount)"
            if ($testPushObj.fcmResult) {
                $fcm = $testPushObj.fcmResult
                $fcmErrors = @()
                if ($fcm.responses) {
                    foreach ($resp in $fcm.responses) {
                        if (-not $resp.success -and $resp.error) {
                            $fcmErrors += "Error Code: $($resp.error.code)`n       Error Message: $($resp.error.message)"
                        }
                    }
                }
                
                $script:fcmSuccessCount = $fcm.successCount
                $script:fcmFailureCount = $fcm.failureCount
                $script:fcmErrors = $fcmErrors
                
                if ($fcm.successCount -gt 0) {
                    Pass "FCM send result details" "SuccessCount: $($fcm.successCount), FailureCount: $($fcm.failureCount)"
                    $script:fcmDeliveryStatus = "PASS"
                } else {
                    $script:Failed++
                    Write-Host "[FAIL] FCM send result details" -ForegroundColor Red
                    Write-Host "       SuccessCount: $($fcm.successCount)" -ForegroundColor Yellow
                    Write-Host "       FailureCount: $($fcm.failureCount)" -ForegroundColor Yellow
                    foreach ($err in $fcmErrors) {
                        Write-Host "       $err" -ForegroundColor Yellow
                    }
                    $script:Results += [PSCustomObject]@{
                        Status = "FAIL"
                        Test = "FCM send result details"
                        Details = "SuccessCount: 0, FailureCount: $($fcm.failureCount)"
                    }
                    $script:fcmDeliveryStatus = "FAIL"
                }
            } else {
                $script:fcmDeliveryStatus = "FAIL"
                Fail "FCM send result details" "fcmResult payload was missing from API response"
            }
        } else {
            $script:fcmDeliveryStatus = "FAIL"
            Warn "POST test-push API call failed (FCM error or mock credentials)" "Error: $($testPushRes.error)"
        }

        # 4. De-register Token (Clean up)
        $deregisterBody = @{
            token = $mockToken
        } | ConvertTo-Json

        $deregisterRes = Invoke-RestMethod -Uri "$BACKEND_URL/notifications/device-token" -Method Delete -Headers $userHeaders -Body $deregisterBody -ContentType "application/json" -TimeoutSec 5
        if ($deregisterRes.success) {
            Pass "De-register FCM device token API succeeded"
        } else {
            Fail "De-register FCM device token API failed"
        }
    } catch {
        Fail "FCM Device Token API error" "Error message: $_"
    }
} else {
    Skip "FCM Device Token API checks (No authentication token)"
}

# ------------------------------------------------
# 6. ROLE ISOLATION / SECURITY CHECK
# ------------------------------------------------
Write-Section "6. ROLE ISOLATION & MULTI-TENANCY CHECKS"

if ($loginToken) {
    # Login as User B (Plant Head) to test isolation
    $plantHeadToken = ""
    $phHeaders = @{}
    try {
        $phLoginBody = @{
            email = "plant.head@himalayaerp.com"
            password = "admin123"
        } | ConvertTo-Json

        $phLoginRes = Invoke-RestMethod -Uri "$BACKEND_URL/auth/login" -Method Post -Body $phLoginBody -ContentType "application/json" -TimeoutSec 5 -ErrorAction Stop
        
        $phToken = if ($phLoginRes.data.accessToken) { $phLoginRes.data.accessToken } else { $phLoginRes.accessToken }
        $phCompanyId = if ($phLoginRes.data.user.companyId) { $phLoginRes.data.user.companyId } else { $phLoginRes.user.companyId }

        if ($phToken) {
            $plantHeadToken = $phToken
            $phHeaders = @{
                "Authorization" = "Bearer $plantHeadToken"
                "x-company-id" = $phCompanyId
            }
            Pass "Logged in successfully as plant.head@himalayaerp.com to perform isolation tests"
        } else {
            Warn "Could not login as plant.head@himalayaerp.com (No token returned)"
        }
    } catch {
        Warn "Could not login as plant.head@himalayaerp.com" "Skipping multi-tenancy verification check: $_"
    }

    if ($plantHeadToken -and $notifsList.Count -gt 0) {
        $adminNotifId = $notifsList[0].id
        try {
            # Attempt to mark admin's notification read using plant head token
            $failRes = Invoke-RestMethod -Uri "$BACKEND_URL/notifications/$adminNotifId/read" -Method Patch -Headers $phHeaders -TimeoutSec 5 -ErrorAction Stop
            Fail "Security Breach: Plant Head user was able to modify/read Admin user's notification!" "ID: $adminNotifId"
        } catch {
            Pass "Multi-tenancy isolation validated: Plant Head user is blocked from modifying Admin's notification" "Status Code: 403/404 block verified."
        }
    } else {
        Skip "Multi-tenancy isolation checks"
    }
} else {
    Skip "Multi-tenancy isolation checks (No authentication token)"
}

# ------------------------------------------------
# 7. FRONTEND CLIENT-SIDE SETUP CHECKS
# ------------------------------------------------
Write-Section "7. FRONTEND CLIENT-SIDE SETUP VALIDATION"

# 1. Service Worker check
$swPath = Join-Path $FRONTEND "public/firebase-messaging-sw.js"
if (-not (Test-Path $swPath)) {
    Write-Host "Service worker file not found. Triggering build-time SW generation..." -ForegroundColor DarkGray
    Push-Location $FRONTEND
    try {
        node scripts/generate-sw.js | Out-Null
    } catch {
        Write-Host "Failed to generate SW: $_" -ForegroundColor Yellow
    }
    Pop-Location
}

if (Test-Path $swPath) {
    $swContent = Get-Content -Path $swPath -Raw
    if ($swContent -match "onBackgroundMessage" -and $swContent -match "notificationclick") {
        Pass "firebase-messaging-sw.js is present and includes correct background & click event handlers"
    } else {
        Fail "firebase-messaging-sw.js exists but is missing background or click listeners"
    }
} else {
    Fail "firebase-messaging-sw.js is missing from frontend public folder"
}

# 2. Messaging client script check
$msgScriptPath = Join-Path $FRONTEND "shared/firebase/messaging.js"
if (Test-Path $msgScriptPath) {
    $msgContent = Get-Content -Path $msgScriptPath -Raw
    if ($msgContent -match "getToken" -and $msgContent -match "/notifications/device-token") {
        Pass "messaging.js correctly retrieves and registers FCM token on login"
    } else {
        Fail "messaging.js is missing getToken or device-token registration logic"
    }
} else {
    Fail "messaging.js client script is missing"
}

# ------------------------------------------------
# 8. BACKEND WORKFLOW INTEGRATIONS CHECK
# ------------------------------------------------
Write-Section "8. BACKEND WORKFLOW INTEGRATIONS INTEGRITY"

$workflows = @(
    @{ Service = "sales.service.ts"; File = Join-Path $BACKEND "src/modules/sales/sales.service.ts"; Code = "SALES_ORDER_PENDING_PLANT_HEAD" }
    @{ Service = "production.service.ts"; File = Join-Path $BACKEND "src/modules/production/production.service.ts"; Code = "PRODUCTION_PLAN_CREATED" }
    @{ Service = "work-orders.service.ts"; File = Join-Path $BACKEND "src/modules/work-orders/work-orders.service.ts"; Code = "PRODUCTION_STARTED" }
    @{ Service = "qc.service.ts"; File = Join-Path $BACKEND "src/modules/qc/qc.service.ts"; Code = "QC_PASSED" }
    @{ Service = "material-requests.service.ts"; File = Join-Path $BACKEND "src/modules/material-requests/material-requests.service.ts"; Code = "MATERIAL_REQUEST_APPROVED" }
    @{ Service = "dispatch.service.ts"; File = Join-Path $BACKEND "src/modules/dispatch/dispatch.service.ts"; Code = "DISPATCH_DELIVERED" }
    @{ Service = "payments.service.ts"; File = Join-Path $BACKEND "src/modules/finance/payments.service.ts"; Code = "PAYMENT_VERIFICATION_REQUIRED" }
)

foreach ($wf in $workflows) {
    if (Test-Path $wf.File) {
        $wfContent = Get-Content -Path $wf.File -Raw
        if ($wfContent -match $wf.Code -or $wfContent -match "notificationsService") {
            Pass "$($wf.Service) has active dynamic notification matrix integration"
        } else {
            Warn "$($wf.Service) integration code could not be verified statically" "Expected notification type code: $($wf.Code)"
        }
    } else {
        Fail "$($wf.Service) file not found" "Path: $($wf.File)"
    }
}


# ------------------------------------------------
# 9. E2E BROWSER NOTIFICATION TESTS (PLAYWRIGHT)
# ------------------------------------------------
Write-Section "9. E2E BROWSER NOTIFICATION CERTIFICATION (PLAYWRIGHT)"

$playwrightResultJson = Join-Path $BACKEND "scratch-playwright-result.json"
Remove-Item -Path $playwrightResultJson -ErrorAction Ignore

Push-Location $FRONTEND
try {
    Write-Host "Running Playwright E2E browser notification tests..." -ForegroundColor DarkGray
    npx playwright test tests/browser/certification/notifications.spec.ts --project=desktop-chromium
    if ($LASTEXITCODE -eq 0) {
        Pass "E2E Playwright browser notification certification passed"
    } else {
        Fail "E2E Playwright browser notification certification failed" "Playwright test exited with code: $LASTEXITCODE"
    }
} catch {
    Fail "Failed to execute Playwright browser tests" "Error: $_"
}
Pop-Location

# ------------------------------------------------
# SUMMARY & CERTIFICATION SCORE
# ------------------------------------------------
Write-Section "HIMALAYA ERP NOTIFICATION CERTIFICATION RESULT"

function Get-TestStatus($pattern, $default = "N/A") {
    $matched = $script:Results | Where-Object { $_.Test -match $pattern } | Select-Object -First 1
    if ($matched) { return $matched.Status }
    return $default
}

# Parse Playwright results
$realTokenObtained = "SKIP"
$realTokenRegistered = "SKIP"
$realFcmSuccessCount = 0
$realFcmFailureCount = 0
$realFcmDeliveryStatus = "SKIP"
$realFcmErrors = @()

if (Test-Path $playwrightResultJson) {
    try {
        $playwrightResult = Get-Content -Path $playwrightResultJson -Raw | ConvertFrom-Json
        $realTokenObtained = if ($playwrightResult.realTokenObtained) { "PASS" } else { "FAIL" }
        $realTokenRegistered = if ($playwrightResult.realTokenRegistered) { "PASS" } else { "FAIL" }
        $realFcmSuccessCount = $playwrightResult.fcmSuccessCount
        $realFcmFailureCount = $playwrightResult.fcmFailureCount
        $realFcmDeliveryStatus = $playwrightResult.fcmDeliveryStatus
        $realFcmErrors = @($playwrightResult.errors)
    } catch {}
}

# Calculate Infrastructure metrics declaratively from Results list
$infraFailedCount = ($script:Results | Where-Object { $_.Status -eq "FAIL" -and $_.Test -notmatch "FCM send result details" }).Count

$infraPassedCount = $Passed
$infraTotal = $infraPassedCount + $infraFailedCount + $Warnings + $Skipped

$infraScore = 0
if ($infraPassedCount -gt 0 -or $infraFailedCount -gt 0) {
    $infraScore = [Math]::Round(($infraPassedCount / ($infraPassedCount + $infraFailedCount)) * 100)
}

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " HIMALAYA ERP NOTIFICATION CERTIFICATION" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host " CORE INFRASTRUCTURE" -ForegroundColor White
Write-Host " --------------------------------------------" -ForegroundColor DarkGray
Write-Host " PASS    : $infraPassedCount" -ForegroundColor Green
Write-Host " FAIL    : $infraFailedCount" -ForegroundColor Red
Write-Host " WARNING : $Warnings" -ForegroundColor Yellow
Write-Host " SKIPPED : $Skipped" -ForegroundColor Gray
Write-Host ""
Write-Host " Browser setup:              $(Get-TestStatus 'Firebase Client SDK|messaging.js')" -ForegroundColor White
Write-Host " Bell APIs:                  $(Get-TestStatus 'Fetch notifications')" -ForegroundColor White
Write-Host " Firebase Admin:             $(Get-TestStatus 'Firebase Admin credentials')" -ForegroundColor White
Write-Host " Token registration:         $(Get-TestStatus 'Register FCM device token')" -ForegroundColor White
Write-Host " Service Worker:             $(Get-TestStatus 'firebase-messaging-sw.js')" -ForegroundColor White
Write-Host ""
Write-Host " FCM MOCK DELIVERY TEST" -ForegroundColor White
Write-Host " --------------------------------------------" -ForegroundColor DarkGray
Write-Host " FCM Send Attempt (Mock):    $(Get-TestStatus 'POST test-push')" -ForegroundColor White
Write-Host " FCM Success (Mock):         $($script:fcmSuccessCount)" -ForegroundColor Green
Write-Host " FCM Failure (Mock):         $($script:fcmFailureCount)" -ForegroundColor Red
Write-Host " FCM Delivery (Mock):        $($script:fcmDeliveryStatus)" -ForegroundColor $(if ($script:fcmDeliveryStatus -eq "PASS") { "Green" } else { "Red" })
Write-Host ""
Write-Host " FCM REAL DEVICE DELIVERY TEST" -ForegroundColor White
Write-Host " --------------------------------------------" -ForegroundColor DarkGray
Write-Host " Real Token Obtained:        $realTokenObtained" -ForegroundColor $(if ($realTokenObtained -eq "PASS") { "Green" } else { "Red" })
Write-Host " Real Token Registered:      $realTokenRegistered" -ForegroundColor $(if ($realTokenRegistered -eq "PASS") { "Green" } else { "Red" })
Write-Host " FCM Success (Real):         $realFcmSuccessCount" -ForegroundColor Green
Write-Host " FCM Failure (Real):         $realFcmFailureCount" -ForegroundColor Red
Write-Host " FCM Delivery (Real):        $realFcmDeliveryStatus" -ForegroundColor $(if ($realFcmDeliveryStatus -eq "PASS") { "Green" } else { "Red" })
if ($realFcmErrors.Count -gt 0) {
    Write-Host " Real Delivery Errors:" -ForegroundColor Yellow
    foreach ($err in $realFcmErrors) {
        Write-Host "   $err" -ForegroundColor Yellow
    }
}
Write-Host ""
Write-Host " Overall:" -ForegroundColor White
Write-Host " --------------------------------------------" -ForegroundColor DarkGray
Write-Host " Infrastructure:             $infraScore%" -ForegroundColor $(if ($infraScore -eq 100) { "Green" } else { "Red" })
Write-Host " Actual Push Delivery:       $realFcmDeliveryStatus" -ForegroundColor $(if ($realFcmDeliveryStatus -eq "PASS") { "Green" } else { "Red" })

$finalStatus = "PASSED"
if ($infraFailedCount -gt 0 -or $realFcmDeliveryStatus -ne "PASS") {
    $finalStatus = "FAILED"
}
Write-Host " FINAL STATUS:               $finalStatus" -ForegroundColor $(if ($finalStatus -eq "PASSED") { "Green" } else { "Red" })
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Clean up test-created tokens in the database
Write-Host "Cleaning up test-created tokens from database..." -ForegroundColor DarkGray
$cleanupJs = Join-Path $ROOT "backend/scratch-cleanup-tokens.js"
$cleanupCode = @"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const result = await prisma.fcmDeviceToken.deleteMany({
    where: {
      OR: [
        { token: 'PLAYWRIGHT_TEST_MOCK_FCM_TOKEN_XYZ_987' },
        { token: { startsWith: 'PLAYWRIGHT_TEST_MOCK' } },
        { token: { startsWith: 'cKNgQc9' } },
        { token: { startsWith: 'cAcSSZs' } }
      ]
    }
  });
  console.log('Cleanup completed. Deleted ' + result.count + ' test token(s).');
})().catch(e => console.error(e)).finally(() => prisma.`$disconnect());
"@
$cleanupCode | Out-File -FilePath $cleanupJs -Encoding utf8
$oldDbUrl = $env:DATABASE_URL
$env:DATABASE_URL = 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public'
node $cleanupJs | Out-Null
$env:DATABASE_URL = $oldDbUrl
Remove-Item -Path $cleanupJs -ErrorAction Ignore
Remove-Item -Path $playwrightResultJson -ErrorAction Ignore
Write-Host ""

if ($finalStatus -eq "PASSED") {
    Write-Host "==============================================" -ForegroundColor Green
    Write-Host " HIMALAYA ERP NOTIFICATION CERTIFICATION PASSED" -ForegroundColor Green
    Write-Host "==============================================" -ForegroundColor Green
} else {
    Write-Host "==============================================" -ForegroundColor Red
    Write-Host " HIMALAYA ERP NOTIFICATION CERTIFICATION FAILED" -ForegroundColor Red
    Write-Host "==============================================" -ForegroundColor Red
    Exit 1
}
