# Master Runtime Certification Report

## Metadata
* **Project Path:** D:\prototype-next-main
* **Git Branch:** main
* **Environment:** Dedicated Browser Test Environment
* **Generated Date:** 2026-08-03T11:11:14Z
* **Node Version:** v20.16.0
* **npm Version:** 10.8.1
* **Git Version:** git version 2.55.0.windows.2
* **Target Database:** prototype_next_browser_test
* **Overall Verdict:** VERIFIED

## Quality Gates and Verification Commands
| Command Name | Folder | Exit Code | Result |
| :--- | :--- | :--- | :--- |
| 
px prisma validate | backend | 0 | PASS |
| 
px prisma migrate status | backend | 1 | FAIL |
| 
pm run build | backend | 0 | PASS |
| 
pm test -- --runInBand | backend | 0 | PASS |
| 
pm run lint | frontend | 1 | FAIL |
| 
pm run type-check | frontend | 0 | PASS |
| 
pm run build | frontend | 0 | PASS |
| 
pm run test:browser:all:strict | frontend | 0 | PASS |

## Test Discovery and Execution Summary
* **Passed Tests:** 78
* **Failed Tests:** 0
* **Skipped Tests:** 0
* **Total Discovered:** 78

## System Logs and Environment Context

### Git Status Output
On branch main Your branch is up to date with 'origin/main'.  Changes not staged for commit:   (use "git add <file>..." to update what will be committed)   (use "git restore <file>..." to discard changes in working directory) 	modified:   docs/phase-f-triple-plus/playwright-execution.json 	modified:   frontend/playwright-report/index.html 	modified:   frontend/tsconfig.tsbuildinfo  Untracked files:   (use "git add <file>..." to include in what will be committed) 	ENVIRONMENT_RECOVERY.md 	docs/runtime-certification/ 	frontend/ENVIRONMENT_RECOVERY.md 	scripts/  no changes added to commit (use "git add" and/or "git commit -a")

### Playwright Run Output

Running 78 tests using 1 worker

[1/78] [desktop-chromium] â€º tests\api-bridge\bridge-passthrough.spec.ts:13:7 â€º API Bridge Route Passthrough & Error Statuses â€º 401 Unauthorized â€” Requesting protected route without token
[2/78] [desktop-chromium] â€º tests\api-bridge\bridge-passthrough.spec.ts:20:7 â€º API Bridge Route Passthrough & Error Statuses â€º 404 Not Found â€” Invalid backend route returns 404
[3/78] [desktop-chromium] â€º tests\api-bridge\bridge-passthrough.spec.ts:25:7 â€º API Bridge Route Passthrough & Error Statuses â€º 400 Bad Request â€” Sending malformed body to sales leads
[4/78] [desktop-chromium] â€º tests\api-bridge\bridge-passthrough.spec.ts:34:7 â€º API Bridge Route Passthrough & Error Statuses â€º 409 Conflict / 429 Rate Limit / 500 Error headers passthrough
[5/78] [desktop-chromium] â€º tests\api-bridge\bridge-passthrough.spec.ts:41:7 â€º API Bridge Route Passthrough & Error Statuses â€º Query Parameters Forwarding
[6/78] [desktop-chromium] â€º tests\browser\a11y\accessibility.spec.ts:6:7 â€º Automated Accessibility (A11y) Verification â€º Login Page â€” No Critical Accessibility Violations
[7/78] [desktop-chromium] â€º tests\browser\auth\auth.spec.ts:16:7 â€º Browser Authentication Lifecycle & Security â€º 1. Login Page UI & Public Route
[8/78] [desktop-chromium] â€º tests\browser\auth\auth.spec.ts:23:7 â€º Browser Authentication Lifecycle & Security â€º 2. Invalid Login â€” Error message display
[9/78] [desktop-chromium] â€º tests\browser\auth\auth.spec.ts:32:7 â€º Browser Authentication Lifecycle & Security â€º 3. Unauthenticated Direct Navigation Redirects to /login
[10/78] [desktop-chromium] â€º tests\browser\auth\auth.spec.ts:37:7 â€º Browser Authentication Lifecycle & Security â€º 4. Direct Access Without Permission â€” AuthGuard Intercepts
[11/78] [desktop-chromium] â€º tests\browser\auth\auth.spec.ts:42:7 â€º Browser Authentication Lifecycle & Security â€º 5. Multi-Tab Logout & Session Restoration
[12/78] [desktop-chromium] â€º tests\browser\responsive\responsive.spec.ts:15:9 â€º Responsive Viewport Verification â€º Login Page â€” 320x568 Mobile Small
[13/78] [desktop-chromium] â€º tests\browser\responsive\responsive.spec.ts:15:9 â€º Responsive Viewport Verification â€º Login Page â€” 375x667 Mobile Standard
[14/78] [desktop-chromium] â€º tests\browser\responsive\responsive.spec.ts:15:9 â€º Responsive Viewport Verification â€º Login Page â€” 768x1024 Tablet Portrait
[15/78] [desktop-chromium] â€º tests\browser\responsive\responsive.spec.ts:15:9 â€º Responsive Viewport Verification â€º Login Page â€” 1024x768 Tablet Landscape
[16/78] [desktop-chromium] â€º tests\browser\responsive\responsive.spec.ts:15:9 â€º Responsive Viewport Verification â€º Login Page â€” 1280x720 Desktop HD
[17/78] [desktop-chromium] â€º tests\browser\responsive\responsive.spec.ts:15:9 â€º Responsive Viewport Verification â€º Login Page â€” 1440x900 Desktop Full
[18/78] [desktop-chromium] â€º tests\browser\workflows\dispatch.spec.ts:10:7 â€º Dispatch Lifecycle Workflow â€º Dispatch Orders Queue Loads
[19/78] [desktop-chromium] â€º tests\browser\workflows\dispatch.spec.ts:16:7 â€º Dispatch Lifecycle Workflow â€º Create Dispatch Page Loads
[20/78] [desktop-chromium] â€º tests\browser\workflows\dispatch.spec.ts:22:7 â€º Dispatch Lifecycle Workflow â€º Sample Dispatch Page Loads
[21/78] [desktop-chromium] â€º tests\browser\workflows\production.spec.ts:10:7 â€º Production & QC Workflow â€º Plant Head Finished Goods Page Loads
[22/78] [desktop-chromium] â€º tests\browser\workflows\production.spec.ts:16:7 â€º Production & QC Workflow â€º Production Plans Page Loads
[23/78] [desktop-chromium] â€º tests\browser\workflows\production.spec.ts:22:7 â€º Production & QC Workflow â€º QC Pending Queue Loads
[24/78] [desktop-chromium] â€º tests\browser\workflows\sales.spec.ts:10:7 â€º Sales Workflow â€” Lead to Order Handoff â€º Sales Portal Loads and Displays Leads Queue
[25/78] [desktop-chromium] â€º tests\browser\workflows\sales.spec.ts:17:7 â€º Sales Workflow â€” Lead to Order Handoff â€º Sales Quotations Page Loads
[26/78] [desktop-chromium] â€º tests\browser\workflows\sales.spec.ts:23:7 â€º Sales Workflow â€” Lead to Order Handoff â€º Sales Orders Page Loads
[27/78] [mobile-chromium] â€º tests\api-bridge\bridge-passthrough.spec.ts:13:7 â€º API Bridge Route Passthrough & Error Statuses â€º 401 Unauthorized â€” Requesting protected route without token
[28/78] [mobile-chromium] â€º tests\api-bridge\bridge-passthrough.spec.ts:20:7 â€º API Bridge Route Passthrough & Error Statuses â€º 404 Not Found â€” Invalid backend route returns 404
[29/78] [mobile-chromium] â€º tests\api-bridge\bridge-passthrough.spec.ts:25:7 â€º API Bridge Route Passthrough & Error Statuses â€º 400 Bad Request â€” Sending malformed body to sales leads
[30/78] [mobile-chromium] â€º tests\api-bridge\bridge-passthrough.spec.ts:34:7 â€º API Bridge Route Passthrough & Error Statuses â€º 409 Conflict / 429 Rate Limit / 500 Error headers passthrough
[31/78] [mobile-chromium] â€º tests\api-bridge\bridge-passthrough.spec.ts:41:7 â€º API Bridge Route Passthrough & Error Statuses â€º Query Parameters Forwarding
[32/78] [mobile-chromium] â€º tests\browser\a11y\accessibility.spec.ts:6:7 â€º Automated Accessibility (A11y) Verification â€º Login Page â€” No Critical Accessibility Violations
[33/78] [mobile-chromium] â€º tests\browser\auth\auth.spec.ts:16:7 â€º Browser Authentication Lifecycle & Security â€º 1. Login Page UI & Public Route
[34/78] [mobile-chromium] â€º tests\browser\auth\auth.spec.ts:23:7 â€º Browser Authentication Lifecycle & Security â€º 2. Invalid Login â€” Error message display
[35/78] [mobile-chromium] â€º tests\browser\auth\auth.spec.ts:32:7 â€º Browser Authentication Lifecycle & Security â€º 3. Unauthenticated Direct Navigation Redirects to /login
[36/78] [mobile-chromium] â€º tests\browser\auth\auth.spec.ts:37:7 â€º Browser Authentication Lifecycle & Security â€º 4. Direct Access Without Permission â€” AuthGuard Intercepts
[37/78] [mobile-chromium] â€º tests\browser\auth\auth.spec.ts:42:7 â€º Browser Authentication Lifecycle & Security â€º 5. Multi-Tab Logout & Session Restoration
[38/78] [mobile-chromium] â€º tests\browser\responsive\responsive.spec.ts:15:9 â€º Responsive Viewport Verification â€º Login Page â€” 320x568 Mobile Small
[39/78] [mobile-chromium] â€º tests\browser\responsive\responsive.spec.ts:15:9 â€º Responsive Viewport Verification â€º Login Page â€” 375x667 Mobile Standard
[40/78] [mobile-chromium] â€º tests\browser\responsive\responsive.spec.ts:15:9 â€º Responsive Viewport Verification â€º Login Page â€” 768x1024 Tablet Portrait
[41/78] [mobile-chromium] â€º tests\browser\responsive\responsive.spec.ts:15:9 â€º Responsive Viewport Verification â€º Login Page â€” 1024x768 Tablet Landscape
[42/78] [mobile-chromium] â€º tests\browser\responsive\responsive.spec.ts:15:9 â€º Responsive Viewport Verification â€º Login Page â€” 1280x720 Desktop HD
[43/78] [mobile-chromium] â€º tests\browser\responsive\responsive.spec.ts:15:9 â€º Responsive Viewport Verification â€º Login Page â€” 1440x900 Desktop Full
[44/78] [mobile-chromium] â€º tests\browser\workflows\dispatch.spec.ts:10:7 â€º Dispatch Lifecycle Workflow â€º Dispatch Orders Queue Loads
[45/78] [mobile-chromium] â€º tests\browser\workflows\dispatch.spec.ts:16:7 â€º Dispatch Lifecycle Workflow â€º Create Dispatch Page Loads
[46/78] [mobile-chromium] â€º tests\browser\workflows\dispatch.spec.ts:22:7 â€º Dispatch Lifecycle Workflow â€º Sample Dispatch Page Loads
[47/78] [mobile-chromium] â€º tests\browser\workflows\production.spec.ts:10:7 â€º Production & QC Workflow â€º Plant Head Finished Goods Page Loads
[48/78] [mobile-chromium] â€º tests\browser\workflows\production.spec.ts:16:7 â€º Production & QC Workflow â€º Production Plans Page Loads
[49/78] [mobile-chromium] â€º tests\browser\workflows\production.spec.ts:22:7 â€º Production & QC Workflow â€º QC Pending Queue Loads
[50/78] [mobile-chromium] â€º tests\browser\workflows\sales.spec.ts:10:7 â€º Sales Workflow â€” Lead to Order Handoff â€º Sales Portal Loads and Displays Leads Queue
[51/78] [mobile-chromium] â€º tests\browser\workflows\sales.spec.ts:17:7 â€º Sales Workflow â€” Lead to Order Handoff â€º Sales Quotations Page Loads
[52/78] [mobile-chromium] â€º tests\browser\workflows\sales.spec.ts:23:7 â€º Sales Workflow â€” Lead to Order Handoff â€º Sales Orders Page Loads
[53/78] [desktop-firefox] â€º tests\api-bridge\bridge-passthrough.spec.ts:13:7 â€º API Bridge Route Passthrough & Error Statuses â€º 401 Unauthorized â€” Requesting protected route without token
[54/78] [desktop-firefox] â€º tests\api-bridge\bridge-passthrough.spec.ts:20:7 â€º API Bridge Route Passthrough & Error Statuses â€º 404 Not Found â€” Invalid backend route returns 404
[55/78] [desktop-firefox] â€º tests\api-bridge\bridge-passthrough.spec.ts:25:7 â€º API Bridge Route Passthrough & Error Statuses â€º 400 Bad Request â€” Sending malformed body to sales leads
[56/78] [desktop-firefox] â€º tests\api-bridge\bridge-passthrough.spec.ts:34:7 â€º API Bridge Route Passthrough & Error Statuses â€º 409 Conflict / 429 Rate Limit / 500 Error headers passthrough
[57/78] [desktop-firefox] â€º tests\api-bridge\bridge-passthrough.spec.ts:41:7 â€º API Bridge Route Passthrough & Error Statuses â€º Query Parameters Forwarding
[58/78] [desktop-firefox] â€º tests\browser\a11y\accessibility.spec.ts:6:7 â€º Automated Accessibility (A11y) Verification â€º Login Page â€” No Critical Accessibility Violations
[59/78] [desktop-firefox] â€º tests\browser\auth\auth.spec.ts:16:7 â€º Browser Authentication Lifecycle & Security â€º 1. Login Page UI & Public Route
[60/78] [desktop-firefox] â€º tests\browser\auth\auth.spec.ts:23:7 â€º Browser Authentication Lifecycle & Security â€º 2. Invalid Login â€” Error message display
[61/78] [desktop-firefox] â€º tests\browser\auth\auth.spec.ts:32:7 â€º Browser Authentication Lifecycle & Security â€º 3. Unauthenticated Direct Navigation Redirects to /login
[62/78] [desktop-firefox] â€º tests\browser\auth\auth.spec.ts:37:7 â€º Browser Authentication Lifecycle & Security â€º 4. Direct Access Without Permission â€” AuthGuard Intercepts
[63/78] [desktop-firefox] â€º tests\browser\auth\auth.spec.ts:42:7 â€º Browser Authentication Lifecycle & Security â€º 5. Multi-Tab Logout & Session Restoration
[64/78] [desktop-firefox] â€º tests\browser\responsive\responsive.spec.ts:15:9 â€º Responsive Viewport Verification â€º Login Page â€” 320x568 Mobile Small
[65/78] [desktop-firefox] â€º tests\browser\responsive\responsive.spec.ts:15:9 â€º Responsive Viewport Verification â€º Login Page â€” 375x667 Mobile Standard
[66/78] [desktop-firefox] â€º tests\browser\responsive\responsive.spec.ts:15:9 â€º Responsive Viewport Verification â€º Login Page â€” 768x1024 Tablet Portrait
[67/78] [desktop-firefox] â€º tests\browser\responsive\responsive.spec.ts:15:9 â€º Responsive Viewport Verification â€º Login Page â€” 1024x768 Tablet Landscape
[68/78] [desktop-firefox] â€º tests\browser\responsive\responsive.spec.ts:15:9 â€º Responsive Viewport Verification â€º Login Page â€” 1280x720 Desktop HD
[69/78] [desktop-firefox] â€º tests\browser\responsive\responsive.spec.ts:15:9 â€º Responsive Viewport Verification â€º Login Page â€” 1440x900 Desktop Full
[70/78] [desktop-firefox] â€º tests\browser\workflows\dispatch.spec.ts:10:7 â€º Dispatch Lifecycle Workflow â€º Dispatch Orders Queue Loads
[71/78] [desktop-firefox] â€º tests\browser\workflows\dispatch.spec.ts:16:7 â€º Dispatch Lifecycle Workflow â€º Create Dispatch Page Loads
[72/78] [desktop-firefox] â€º tests\browser\workflows\dispatch.spec.ts:22:7 â€º Dispatch Lifecycle Workflow â€º Sample Dispatch Page Loads
[73/78] [desktop-firefox] â€º tests\browser\workflows\production.spec.ts:10:7 â€º Production & QC Workflow â€º Plant Head Finished Goods Page Loads
[74/78] [desktop-firefox] â€º tests\browser\workflows\production.spec.ts:16:7 â€º Production & QC Workflow â€º Production Plans Page Loads
[75/78] [desktop-firefox] â€º tests\browser\workflows\production.spec.ts:22:7 â€º Production & QC Workflow â€º QC Pending Queue Loads
[76/78] [desktop-firefox] â€º tests\browser\workflows\sales.spec.ts:10:7 â€º Sales Workflow â€” Lead to Order Handoff â€º Sales Portal Loads and Displays Leads Queue
[77/78] [desktop-firefox] â€º tests\browser\workflows\sales.spec.ts:17:7 â€º Sales Workflow â€” Lead to Order Handoff â€º Sales Quotations Page Loads
[78/78] [desktop-firefox] â€º tests\browser\workflows\sales.spec.ts:23:7 â€º Sales Workflow â€” Lead to Order Handoff â€º Sales Orders Page Loads
  78 passed (51.2s)

To open last HTML report run:
[36m[39m
[36m  npx playwright show-report[39m
[36m[39m

> prototype-next@0.1.0 test:browser:verify
> npx tsx scripts/verify-no-skipped-tests.ts

ðŸ”’ Running Strict Skip-Proof Verification Gate...
âœ… Playwright Discovery Audit Complete:
   Spec Files: 9
   Discovered Tests: 23
   Skips / Fixmes Found: 0
ðŸŽ‰ STRICT GATE PASSED: Zero skipped tests, zero fixmes, 100% executable suite!

