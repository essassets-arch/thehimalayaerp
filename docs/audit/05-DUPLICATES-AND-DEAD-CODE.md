# 05. Duplicates, Mocks and Hardcoded Data

Generated from verified code parsing.

## 1. Mock Data Usages
The following files contain references to "mock" data:
- frontend\app\api\backend\[...path]\route.ts
- frontend\app\api\v1\production\floor\route.ts
- frontend\app\api\v1\production\[id]\complete\route.ts
- frontend\engine\services\workflow.service.ts
- frontend\lib\api.ts
- frontend\lib\mockData.ts
- frontend\lib\mockDB.ts
- frontend\lib\mockStorage.ts
- frontend\old_erpStore.ts
- frontend\scripts\export-legacy.ts
- frontend\scripts\test-material-indent-flow.ts
- frontend\scripts\test-po-delivery-flow.ts
- frontend\scripts\test_complete_purchase_flow.ts
- frontend\scripts\test_final_flow.ts
- frontend\scripts\test_procurement_flow.ts
- frontend\services\customers\legacyCustomersWriteRepository.ts
- frontend\services\leads\legacyLeadsWriteRepository.ts
- frontend\services\sales\salesRepositoryFactory.ts
- frontend\store\erpStore.ts
- frontend\store\procurementActions.ts
- frontend\tests\e2e\employee-registration-integration.spec.ts
- frontend\test_material_flow.ts
- frontend\test_procurement_flow.ts
- frontend\test_sales_flow.ts
- frontend\app\(dashboard)\dispatch\sample-dispatch\create\[id]\page.tsx
- frontend\app\(dashboard)\dispatch\sample-dispatch\page.tsx
- frontend\app\(dashboard)\layout.tsx
- frontend\app\(dashboard)\sales\create-payment\page.tsx
- frontend\components\erp\notifications\NotificationBell.tsx
- frontend\components\MockDataSeeder.tsx
- frontend\components\DailyTaskView.jsx
- frontend\components\DispatchView.jsx
- frontend\components\HeroBanner.jsx
- frontend\components\ProductionView.jsx
- frontend\components\SamplesView.jsx
- frontend\components\shared\FinishedGoodsTable.jsx
- frontend\modules\finance\pages\FinancePortal.jsx
- frontend\modules\finance\pages\FinanceSalesConfirmationView.jsx
- frontend\modules\plant-head\pages\PlantHeadPortal.jsx
- frontend\modules\production\pages\ProductionPortal.jsx
- frontend\modules\super-admin\components\DashboardView.jsx
- frontend\modules\super-admin\components\EmployeeDetail.jsx
- frontend\modules\super-admin\components\sales-analytics\analytics\ExecutiveKPIs.jsx
- frontend\modules\super-admin\components\sales-analytics\analytics\HeatMap.jsx
- frontend\modules\super-admin\components\sales-analytics\analytics\Leaderboards.jsx
- frontend\modules\super-admin\components\sales-analytics\analytics\LeadFunnel.jsx
- frontend\modules\super-admin\components\sales-analytics\analytics\OrderAnalytics.jsx
- frontend\modules\super-admin\components\sales-analytics\analytics\PaymentAnalytics.jsx
- frontend\modules\super-admin\components\sales-analytics\analytics\ProductAnalytics.jsx
- frontend\modules\super-admin\components\sales-analytics\analytics\RegionalAnalytics.jsx
- frontend\modules\super-admin\components\sales-analytics\analytics\RevenueCharts.jsx
- frontend\modules\super-admin\pages\SuperAdminPortal.jsx
- frontend\shared\components\GlobalOrderTracker.jsx
- frontend\shared\context\AuthContext.jsx
- frontend\shared\context\ERPContext.jsx

## 2. LocalStorage Dependencies
The following files access `localStorage` directly (potentially bypassing centralized state/API):
- frontend\lib\backendFetch.ts
- frontend\lib\mockDB.ts
- frontend\lib\mockStorage.ts
- frontend\modules\hr\employee\employee.repository.ts
- frontend\old_erpStore.ts
- frontend\scripts\export-legacy.ts
- frontend\scripts\test-iso-gel-coat-indent.ts
- frontend\scripts\test-material-indent-flow.ts
- frontend\scripts\test-po-delivery-flow.ts
- frontend\scripts\test_complete_purchase_flow.ts
- frontend\scripts\test_final_flow.ts
- frontend\scripts\test_procurement_flow.ts
- frontend\services\procurement\procurementClient.ts
- frontend\store\authStore.ts
- frontend\store\erpStore.ts
- frontend\store\new_procurement_store.ts
- frontend\store\payrollFlow.ts
- frontend\store\procurementActions.ts
- frontend\tests\e2e\after-sales-modal-ui.spec.ts
- frontend\tests\e2e\clean-sales-state.spec.ts
- frontend\tests\e2e\dispatch-queues-ui.spec.ts
- frontend\tests\e2e\employee-registration-draft.spec.ts
- frontend\tests\e2e\employee-registration-validation.spec.ts
- frontend\tests\e2e\harsh-o2c-ui.spec.ts
- frontend\tests\salary-workflow.spec.ts
- frontend\test_material_flow.ts
- frontend\test_procurement_flow.ts
- frontend\test_sales_flow.ts
- frontend\utils\storage.ts
- frontend\components\MockDataSeeder.tsx
- frontend\modules\hr\employee\components\EmployeeRegistrationForm.tsx
- frontend\components\HeroBanner.jsx
- frontend\modules\admin\pages\AdminNewLead.jsx
- frontend\modules\admin\pages\AdminNewQuotation.jsx
- frontend\modules\admin\pages\AdminOpsPortal.jsx
- frontend\modules\notifications\pages\NotificationCenter.jsx
- frontend\modules\production\pages\ProductionPortal.jsx
- frontend\modules\sales\pages\SalesPortal.jsx
- frontend\modules\store\pages\StorePortal.jsx
- frontend\shared\context\ERPContext.jsx
- frontend\shared\context\new_erp_context.jsx

## 3. Duplicate APIs
*Requires manual review of endpoints list*

## 4. UUID vs Business-Number Mismatches
*Requires manual trace of API payloads expecting UUIDs vs Strings*
