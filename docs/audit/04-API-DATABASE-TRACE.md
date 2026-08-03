# 04. API to Database Trace

Generated from verified code parsing (backend/src/**/*.service.ts).

## Prisma Mutations Detected
| File | Line | Model | Action |
|---|---|---|---|
| backend\src\modules\attachments\attachments.service.ts | 25 | attachment | create |
| backend\src\modules\audit\audit.service.ts | 56 | auditLog | create |
| backend\src\modules\auth\auth.service.ts | 78 | refreshSession | update |
| backend\src\modules\auth\auth.service.ts | 116 | refreshSession | update |
| backend\src\modules\auth\auth.service.ts | 193 | refreshSession | create |
| backend\src\modules\comments\comments.service.ts | 34 | comment | create |
| backend\src\modules\comments\comments.service.ts | 51 | comment | update |
| backend\src\modules\crm\leads.service.ts | 59 | lead | create |
| backend\src\modules\crm\leads.service.ts | 100 | lead | update |
| backend\src\modules\crm\leads.service.ts | 127 | leadActivity | create |
| backend\src\modules\customer-complaints\customer-complaints.service.ts | 50 | customerComplaint | create |
| backend\src\modules\customer-complaints\customer-complaints.service.ts | 99 | customerComplaint | update |
| backend\src\modules\customer-complaints\customer-complaints.service.ts | 126 | customerComplaint | update |
| backend\src\modules\customer-complaints\customer-complaints.service.ts | 162 | customerComplaint | update |
| backend\src\modules\customer-complaints\customer-complaints.service.ts | 178 | customerComplaint | update |
| backend\src\modules\customer-complaints\customer-complaints.service.ts | 192 | customerComplaint | update |
| backend\src\modules\dispatch\dispatch.service.ts | 330 | dispatch | update |
| backend\src\modules\employees\employees.service.ts | 485 | employeeDraft | update |
| backend\src\modules\employees\employees.service.ts | 492 | employeeDraft | create |
| backend\src\modules\employees\employees.service.ts | 499 | auditLog | create |
| backend\src\modules\employees\employees.service.ts | 558 | employee | update |
| backend\src\modules\employees\employees.service.ts | 562 | auditLog | create |
| backend\src\modules\employees\employees.service.ts | 581 | employee | update |
| backend\src\modules\employees\employees.service.ts | 589 | auditLog | create |
| backend\src\modules\employees\employees.service.ts | 631 | employeeDocument | create |
| backend\src\modules\employees\employees.service.ts | 645 | auditLog | create |
| backend\src\modules\employees\employees.service.ts | 682 | auditLog | create |
| backend\src\modules\finance\payments.service.ts | 573 | customerPayment | update |
| backend\src\modules\finance\payments.service.ts | 584 | customerLedger | create |
| backend\src\modules\inventory\inventory.service.ts | 25 | inventoryTransaction | create |
| backend\src\modules\material-requests\material-requests.service.ts | 86 | product | create |
| backend\src\modules\material-requests\material-requests.service.ts | 106 | materialRequest | create |
| backend\src\modules\notifications\notifications.service.ts | 22 | notification | update |
| backend\src\modules\notifications\notifications.service.ts | 35 | notification | update |
| backend\src\modules\payroll\payroll.service.ts | 159 | payrollPeriod | update |
| backend\src\modules\payroll\payroll.service.ts | 645 | payrollAdjustment | create |
| backend\src\modules\payroll\payroll.service.ts | 919 | auditLog | create |
| backend\src\modules\payroll\payroll.service.ts | 970 | salarySlip | update |
| backend\src\modules\payroll\payroll.service.ts | 995 | salarySlipShare | create |
| backend\src\modules\payroll\payroll.service.ts | 1020 | salarySlipShare | update |
| backend\src\modules\payroll\payroll.service.ts | 1024 | auditLog | create |
| backend\src\modules\payroll\payroll.service.ts | 1055 | salarySlipShare | update |
| backend\src\modules\payroll\payroll.service.ts | 1059 | auditLog | create |
| backend\src\modules\procurement\material-rejection.service.ts | 52 | materialRejection | create |
| backend\src\modules\procurement\material-rejection.service.ts | 80 | materialRejection | update |
| backend\src\modules\procurement\material-rejection.service.ts | 94 | materialRejection | update |
| backend\src\modules\production\production-testing.service.ts | 33 | productionTestingRecord | create |
| backend\src\modules\production\production-testing.service.ts | 48 | productionTestingRecord | update |
| backend\src\modules\production\production-testing.service.ts | 63 | productionTestingRecord | update |
| backend\src\modules\production\production-workflow.service.ts | 343 | qCInspection | update |
| backend\src\modules\production\production-workflow.service.ts | 386 | productionShiftEntry | create |
| backend\src\modules\production\production-workflow.service.ts | 403 | productionScrapEntry | create |
| backend\src\modules\production\production.service.ts | 71 | productionPlan | create |
| backend\src\modules\production\production.service.ts | 101 | productionPlan | update |
| backend\src\modules\products\products.service.ts | 27 | product | create |
| backend\src\modules\products\products.service.ts | 79 | product | update |
| backend\src\modules\quotations\quotations.service.ts | 169 | quotation | create |
| backend\src\modules\recruitment\recruitment.service.ts | 222 | recruitmentRequest | update |
| backend\src\modules\recruitment\recruitment.service.ts | 238 | recruitmentRequest | update |
| backend\src\modules\recruitment\recruitment.service.ts | 265 | recruitmentRequest | update |
| backend\src\modules\recruitment\recruitment.service.ts | 338 | recruitmentRequest | update |
| backend\src\modules\recruitment\recruitment.service.ts | 444 | recruitmentCandidate | update |
| backend\src\modules\recruitment\recruitment.service.ts | 554 | recruitmentInterview | update |
| backend\src\modules\recruitment\recruitment.service.ts | 577 | recruitmentInterview | update |
| backend\src\modules\recruitment\recruitment.service.ts | 605 | recruitmentRequest | update |
| backend\src\modules\recruitment\recruitment.service.ts | 637 | recruitmentRequest | update |
| backend\src\modules\recruitment\recruitment.service.ts | 680 | recruitmentRequest | update |
| backend\src\modules\replacements\replacements.service.ts | 73 | idSequence | update |
| backend\src\modules\replacements\replacements.service.ts | 78 | idSequence | create |
| backend\src\modules\replacements\replacements.service.ts | 141 | replacementRequest | update |
| backend\src\modules\replacements\replacements.service.ts | 165 | replacementRequest | update |
| backend\src\modules\replacements\replacements.service.ts | 184 | replacementRequest | update |
| backend\src\modules\replacements\replacements.service.ts | 202 | replacementRequest | update |
| backend\src\modules\replacements\replacements.service.ts | 220 | replacementRequest | update |
| backend\src\modules\sales-returns\sales-returns.service.ts | 73 | idSequence | update |
| backend\src\modules\sales-returns\sales-returns.service.ts | 78 | idSequence | create |
| backend\src\modules\sales-returns\sales-returns.service.ts | 202 | salesReturn | update |
| backend\src\modules\sales-returns\sales-returns.service.ts | 218 | salesReturn | update |
| backend\src\modules\sales-returns\sales-returns.service.ts | 229 | salesReturn | update |
| backend\src\modules\sales-returns\sales-returns.service.ts | 245 | salesReturn | update |
| backend\src\modules\sales-target\sales-target.service.ts | 155 | salesTarget | update |
| backend\src\modules\sales-target\sales-target.service.ts | 165 | salesTarget | update |
| backend\src\modules\users\users.service.ts | 87 | user | create |
| backend\src\modules\warehouses\warehouses.service.ts | 11 | warehouse | create |
| backend\src\modules\warehouses\warehouses.service.ts | 44 | warehouse | update |
| backend\src\modules\work-orders\work-orders.service.ts | 210 | finishedGoods | update |
| backend\src\modules\work-orders\work-orders.service.ts | 215 | workOrder | update |
| backend\src\modules\work-orders\work-orders.service.ts | 235 | finishedGoods | update |
| backend\src\modules\work-orders\work-orders.service.ts | 240 | workOrder | update |

## Audit / History Writes Detected
| File | Line | Type |
|---|---|---|
| backend\src\modules\audit\audit.service.ts | 4 | History/Audit Log |
| backend\src\modules\audit\audit.service.ts | 52 | History/Audit Log |
| backend\src\modules\brand-analysis\brand-analysis.service.ts | 77 | History/Audit Log |
| backend\src\modules\brand-analysis\brand-analysis.service.ts | 129 | History/Audit Log |
| backend\src\modules\brand-analysis\brand-analysis.service.ts | 172 | History/Audit Log |
| backend\src\modules\brand-analysis\brand-analysis.service.ts | 211 | History/Audit Log |
| backend\src\modules\brand-analysis\brand-analysis.service.ts | 250 | History/Audit Log |
| backend\src\modules\brand-analysis\brand-analysis.service.ts | 300 | History/Audit Log |
| backend\src\modules\payroll\payroll.service.ts | 351 | History/Audit Log |
| backend\src\modules\payroll\payroll.service.ts | 543 | History/Audit Log |
| backend\src\modules\payroll\payroll.service.ts | 823 | History/Audit Log |
| backend\src\modules\procurement\procurement.service.ts | 282 | History/Audit Log |
| backend\src\modules\procurement\procurement.service.ts | 411 | History/Audit Log |
| backend\src\modules\procurement\procurement.service.ts | 419 | History/Audit Log |
| backend\src\modules\procurement\procurement.service.ts | 555 | History/Audit Log |
| backend\src\modules\procurement\procurement.service.ts | 627 | History/Audit Log |
| backend\src\modules\procurement\procurement.service.ts | 703 | History/Audit Log |
| backend\src\modules\procurement\procurement.service.ts | 759 | History/Audit Log |
| backend\src\modules\procurement\procurement.service.ts | 854 | History/Audit Log |
| backend\src\modules\procurement\procurement.service.ts | 994 | History/Audit Log |
| backend\src\modules\quotations\quotations.service.ts | 320 | History/Audit Log |
| backend\src\modules\quotations\quotations.service.ts | 544 | History/Audit Log |
| backend\src\modules\samples\samples.service.ts | 60 | History/Audit Log |
| backend\src\modules\samples\samples.service.ts | 148 | History/Audit Log |
| backend\src\modules\samples\samples.service.ts | 188 | History/Audit Log |
| backend\src\modules\work-orders\work-orders.service.ts | 118 | History/Audit Log |
| backend\src\modules\workflow\workflow.service.ts | 121 | History/Audit Log |
