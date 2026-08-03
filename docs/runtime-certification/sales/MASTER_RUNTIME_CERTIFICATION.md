# Master Runtime Certification Report

## Metadata
* **Project Path:** D:\prototype-next-main
* **Git Branch:** main
* **Environment:** Dedicated Browser Test Environment
* **Generated Date:** 2026-08-03T11:43:22Z
* **Node Version:** v20.16.0
* **npm Version:** 10.8.1
* **Git Version:** git version 2.55.0.windows.2
* **Target Database:** prototype_next_browser_test
* **Overall Verdict:** FAILED

## Quality Gates and Verification Commands
| Command Name | Folder | Exit Code | Result |
| :--- | :--- | :--- | :--- |
| 
px prisma validate | backend | 0 | PASS |
| 
px prisma migrate status | backend | 0 | PASS |
| 
pm run build | backend | 0 | PASS |
| 
pm test -- --runInBand | backend | 0 | PASS |
| 
pm run lint | frontend | 0 | PASS |
| 
pm run type-check | frontend | 0 | PASS |
| 
pm run build | frontend | 0 | PASS |
| 
pm run test:browser:all:strict | frontend | 1 | FAIL |

## Test Discovery and Execution Summary
* **Passed Tests (Browser-Project Executions):** 0
* **Failed Tests:** 0
* **Skipped Tests:** 0
* **Total Discovered Executions:** 0
* **Logical Tests Count:** 0
* **Executed Spec Files Count:** 0
* **Browser Projects Count:** 0

## System Logs and Environment Context

### Git Status Output
On branch main Your branch is up to date with 'origin/main'.  Changes not staged for commit:   (use "git add <file>..." to update what will be committed)   (use "git restore <file>..." to discard changes in working directory) 	modified:   docs/phase-f-triple-plus/playwright-execution.json 	modified:   frontend/app/(dashboard)/production/finished-goods/page.tsx 	modified:   frontend/playwright-report/index.html 	modified:   frontend/scripts/reset-browser-test-db.ts 	modified:   frontend/tsconfig.tsbuildinfo  Untracked files:   (use "git add <file>..." to include in what will be committed) 	ENVIRONMENT_RECOVERY.md 	backend/scripts/clean-db.js 	docs/runtime-certification/ 	frontend/ENVIRONMENT_RECOVERY.md 	frontend/tests/browser/deep-workflows/ 	scripts/  no changes added to commit (use "git add" and/or "git commit -a")

### Playwright Run Output

