# 15 — Frontend LocalStorage, SessionStorage & Mock State Deep Audit

## 1. Executive Summary

- **Total Frontend Files Scanned**: All `.ts`, `.tsx`, `.js`, `.jsx` under `frontend/` (`app`, `components`, `lib`, `services`, `store`, `shared`, `modules`, `hooks`, `engine`).
- **Total Occurrences Found**: `544` occurrences.

---

## 2. Classification Summary

| Classification Category | Occurrences | Risk Level | Description |
| :--- | :---: | :---: | :--- |
| **Authentication/session** | 36 | **LOW** | Local storage for auth JWT & refresh tokens |
| **UI preference** | 2 | **LOW** | Dark/light mode theme & sidebar collapse state |
| **Form draft** | 123 | **LOW** | Client form auto-save drafts |
| **Test only** | 0 | **LOW** | Jest/React testing library mock fixtures |
| **Deprecated** | 17 | **MEDIUM** | Unused legacy store helpers |
| **Dangerous production business state** | 43 | **HIGH** | Hardcoded fallback business arrays in production pages |
| **Manual review required** | 323 | **MEDIUM** | Miscellaneous mock utility references |

---

## 3. Complete Itemized Occurrence List

| File Path | Line | Keyword | Code Snippet | Classification |
| :--- | :---: | :---: | :--- | :--- |
| [`frontend/app/(dashboard)/dispatch/sample-dispatch/create/[id]/page.tsx`](file:///frontend/app/(dashboard)/dispatch/sample-dispatch/create/[id]/page.tsx#L54) | L54 | `mock` | `const MOCK_ACTIVE_ORDERS = [` | **Manual review required** |
| [`frontend/app/(dashboard)/dispatch/sample-dispatch/create/[id]/page.tsx`](file:///frontend/app/(dashboard)/dispatch/sample-dispatch/create/[id]/page.tsx#L125) | L125 | `mock` | `{MOCK_ACTIVE_ORDERS.map(order => (` | **Manual review required** |
| [`frontend/app/(dashboard)/dispatch/sample-dispatch/page.tsx`](file:///frontend/app/(dashboard)/dispatch/sample-dispatch/page.tsx#L9) | L9 | `mock` | `const INITIAL_MOCK_REQUESTS = [` | **Manual review required** |
| [`frontend/app/(dashboard)/dispatch/sample-dispatch/page.tsx`](file:///frontend/app/(dashboard)/dispatch/sample-dispatch/page.tsx#L46) | L46 | `mock` | `const [requests, setRequests] = useState(INITIAL_MOCK_REQUES` | **Manual review required** |
| [`frontend/app/(dashboard)/dispatch/sample-dispatch/page.tsx`](file:///frontend/app/(dashboard)/dispatch/sample-dispatch/page.tsx#L419) | L419 | `fallback` | `<Suspense fallback={<div>Loading...</div>}>` | **Dangerous production business state** |
| [`frontend/app/(dashboard)/layout.tsx`](file:///frontend/app/(dashboard)/layout.tsx#L14) | L14 | `mockData` | `import MockDataSeeder from '@/components/MockDataSeeder';` | **Manual review required** |
| [`frontend/app/(dashboard)/layout.tsx`](file:///frontend/app/(dashboard)/layout.tsx#L137) | L137 | `mockData` | `<MockDataSeeder />` | **Manual review required** |
| [`frontend/app/(dashboard)/layout.tsx`](file:///frontend/app/(dashboard)/layout.tsx#L185) | L185 | `fallback` | `<Suspense fallback={<PageLoader />}>` | **Dangerous production business state** |
| [`frontend/app/(dashboard)/production/plans/page.tsx`](file:///frontend/app/(dashboard)/production/plans/page.tsx#L30) | L30 | `fallback` | `status: string; // fallback if workflowState is missing` | **Dangerous production business state** |
| [`frontend/app/(dashboard)/production/work-orders/page.tsx`](file:///frontend/app/(dashboard)/production/work-orders/page.tsx#L32) | L32 | `fallback` | `status: string; // fallback` | **Dangerous production business state** |
| [`frontend/app/(dashboard)/qc/page.tsx`](file:///frontend/app/(dashboard)/qc/page.tsx#L33) | L33 | `fallback` | `status: string; // fallback` | **Dangerous production business state** |
| [`frontend/app/(dashboard)/sales/create-payment/page.tsx`](file:///frontend/app/(dashboard)/sales/create-payment/page.tsx#L89) | L89 | `fallback` | `console.warn('Fallback store application for submitSalesPaym` | **Manual review required** |
| [`frontend/app/(dashboard)/sales/create-payment/page.tsx`](file:///frontend/app/(dashboard)/sales/create-payment/page.tsx#L276) | L276 | `mock` | `{/* Legacy mock document cards hidden; the form accepts one ` | **Manual review required** |
| [`frontend/app/(dashboard)/sales/create-payment/page.tsx`](file:///frontend/app/(dashboard)/sales/create-payment/page.tsx#L329) | L329 | `fallback` | `<Suspense fallback={` | **Dangerous production business state** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L22) | L22 | `mock` | `// Global in-memory state for sample dispatch so we can mock` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L24) | L24 | `mock` | `if (!globalAny.mockDispatch) {` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L25) | L25 | `mock` | `globalAny.mockDispatch = {` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L45) | L45 | `mock` | `id: 'mock-item-1',` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L48) | L48 | `mock` | `productId: 'mock-prod-1',` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L66) | L66 | `mock` | `return NextResponse.json({ success: true, data: globalAny.mo` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L74) | L74 | `mock` | `globalAny.mockDispatch.isSubmitted = true;` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L77) | L77 | `mock` | `globalAny.mockDispatch.status = 'DISPATCH_APPROVED';` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L80) | L80 | `mock` | `globalAny.mockDispatch.status = 'DISPATCH_DRAFT';` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L81) | L81 | `mock` | `globalAny.mockDispatch.isSubmitted = false;` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L84) | L84 | `mock` | `globalAny.mockDispatch.status = 'READY_FOR_PICKUP';` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L87) | L87 | `mock` | `globalAny.mockDispatch.status = 'VEHICLE_ASSIGNED';` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L89) | L89 | `mock` | `Object.assign(globalAny.mockDispatch, body);` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L93) | L93 | `mock` | `globalAny.mockDispatch.status = 'LOADING_IN_PROGRESS';` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L96) | L96 | `mock` | `globalAny.mockDispatch.loadingCompletedAt = new Date().toISO` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L97) | L97 | `mock` | `if (body) Object.assign(globalAny.mockDispatch, body);` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L100) | L100 | `mock` | `globalAny.mockDispatch.status = 'DISPATCHED';` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L101) | L101 | `mock` | `globalAny.mockDispatch.gateOutAt = new Date().toISOString();` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L104) | L104 | `mock` | `globalAny.mockDispatch.status = 'IN_TRANSIT';` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L106) | L106 | `mock` | `globalAny.mockDispatch.currentLocation = body.currentLocatio` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L107) | L107 | `mock` | `globalAny.mockDispatch.transitCondition = body.transitCondit` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L108) | L108 | `mock` | `globalAny.mockDispatch.transitLogs.push({` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L117) | L117 | `mock` | `globalAny.mockDispatch.status = 'OUT_FOR_DELIVERY';` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L120) | L120 | `mock` | `globalAny.mockDispatch.status = 'DELIVERED';` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L121) | L121 | `mock` | `if (body) Object.assign(globalAny.mockDispatch, body);` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L124) | L124 | `mock` | `globalAny.mockDispatch.status = 'POD_RECEIVED';` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L125) | L125 | `mock` | `globalAny.mockDispatch.podStatus = 'PENDING';` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L126) | L126 | `mock` | `if (body) globalAny.mockDispatch.podUrl = body.podUrl;` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L130) | L130 | `mock` | `globalAny.mockDispatch.podStatus = 'APPROVED';` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L132) | L132 | `mock` | `globalAny.mockDispatch.status = 'DELIVERED';` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L133) | L133 | `mock` | `globalAny.mockDispatch.podUrl = null;` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L137) | L137 | `mock` | `globalAny.mockDispatch.status = 'DISPATCH_CLOSED';` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L138) | L138 | `mock` | `globalAny.mockDispatch.closedAt = new Date().toISOString();` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L139) | L139 | `mock` | `globalAny.mockDispatch.transitDuration = 48; // Mock duratio` | **Manual review required** |
| [`frontend/app/api/backend/[...path]/route.ts`](file:///frontend/app/api/backend/[...path]/route.ts#L143) | L143 | `mock` | `return NextResponse.json({ success: true, data: globalAny.mo` | **Manual review required** |
| [`frontend/app/api/v1/production/floor/route.ts`](file:///frontend/app/api/v1/production/floor/route.ts#L5) | L5 | `mock` | `// Since this is a prototype, we return mock production floo` | **Manual review required** |
| [`frontend/app/api/v1/production/floor/route.ts`](file:///frontend/app/api/v1/production/floor/route.ts#L9) | L9 | `mock` | `console.warn('No authorization header found, but returning m` | **Manual review required** |
| [`frontend/app/api/v1/production/floor/route.ts`](file:///frontend/app/api/v1/production/floor/route.ts#L12) | L12 | `mock` | `// Return mock data for the dashboard` | **Manual review required** |
| [`frontend/app/api/v1/production/[id]/complete/route.ts`](file:///frontend/app/api/v1/production/[id]/complete/route.ts#L13) | L13 | `mock` | `// Mock completion logic` | **Manual review required** |
| [`frontend/components/CreatePayment.jsx`](file:///frontend/components/CreatePayment.jsx#L36) | L36 | `dummy` | `'Sales Confirmation', // paymentMode (dummy/internal)` | **Manual review required** |
| [`frontend/components/CreateQuotation.jsx`](file:///frontend/components/CreateQuotation.jsx#L493) | L493 | `fallback` | `price: items.length > 0 ? items[0].unitPrice : 0, // Fallbac` | **Manual review required** |
| [`frontend/components/DailyTaskView.jsx`](file:///frontend/components/DailyTaskView.jsx#L60) | L60 | `mock` | `// Let's also fetch completed samples/orders. To make it dyn` | **Manual review required** |
| [`frontend/components/DashboardView.jsx`](file:///frontend/components/DashboardView.jsx#L426) | L426 | `fallback` | `// Local fallback calculation based on memory state - Always` | **Dangerous production business state** |
| [`frontend/components/DispatchView.jsx`](file:///frontend/components/DispatchView.jsx#L37) | L37 | `mock` | `// Dispatch details database mocks (keyed by order ID)` | **Manual review required** |
| [`frontend/components/erp/BrandAnalysisCreateModal.jsx`](file:///frontend/components/erp/BrandAnalysisCreateModal.jsx#L42) | L42 | `fallback` | `const imageUrl = uploadRes.url \|\| uploadRes.fileUrl; // Fall` | **Manual review required** |
| [`frontend/components/erp/communication/AttachmentUploader.tsx`](file:///frontend/components/erp/communication/AttachmentUploader.tsx#L66) | L66 | `fake` | `fileUrl: `/uploads/${file.name}`, // Fake URL` | **Manual review required** |
| [`frontend/components/erp/notifications/NotificationBell.tsx`](file:///frontend/components/erp/notifications/NotificationBell.tsx#L29) | L29 | `mock` | `// For this prototype, we'll just mock it or query a stub en` | **Manual review required** |
| [`frontend/components/erp/notifications/NotificationBell.tsx`](file:///frontend/components/erp/notifications/NotificationBell.tsx#L34) | L34 | `fallback` | `return []; // Fallback for prototype` | **Manual review required** |
| [`frontend/components/HeroBanner.jsx`](file:///frontend/components/HeroBanner.jsx#L136) | L136 | `mock` | `// Mock Calendar events for June 2026` | **Manual review required** |
| [`frontend/components/HeroBanner.jsx`](file:///frontend/components/HeroBanner.jsx#L173) | L173 | `localStorage` | `const token = localStorage.getItem('token') \|\| '';` | **Authentication/session** |
| [`frontend/components/MockDataSeeder.tsx`](file:///frontend/components/MockDataSeeder.tsx#L7) | L7 | `mockData` | `export default function MockDataSeeder() {` | **Manual review required** |
| [`frontend/components/MockDataSeeder.tsx`](file:///frontend/components/MockDataSeeder.tsx#L42) | L42 | `localStorage` | `// Seed LocalStorage` | **Form draft** |
| [`frontend/components/MockDataSeeder.tsx`](file:///frontend/components/MockDataSeeder.tsx#L44) | L44 | `localStorage` | `const version = localStorage.getItem('mock_version_1');` | **Form draft** |
| [`frontend/components/MockDataSeeder.tsx`](file:///frontend/components/MockDataSeeder.tsx#L47) | L47 | `localStorage` | `localStorage.removeItem(key);` | **Form draft** |
| [`frontend/components/MockDataSeeder.tsx`](file:///frontend/components/MockDataSeeder.tsx#L50) | L50 | `localStorage` | `const existing = localStorage.getItem(key);` | **Form draft** |
| [`frontend/components/MockDataSeeder.tsx`](file:///frontend/components/MockDataSeeder.tsx#L52) | L52 | `localStorage` | `localStorage.setItem(key, JSON.stringify(dataFunc()));` | **Form draft** |
| [`frontend/components/MockDataSeeder.tsx`](file:///frontend/components/MockDataSeeder.tsx#L57) | L57 | `localStorage` | `if (!localStorage.getItem('mock_version_2')) {` | **Form draft** |
| [`frontend/components/MockDataSeeder.tsx`](file:///frontend/components/MockDataSeeder.tsx#L59) | L59 | `localStorage` | `localStorage.removeItem('erp_analysis_requests_v1');` | **Form draft** |
| [`frontend/components/MockDataSeeder.tsx`](file:///frontend/components/MockDataSeeder.tsx#L60) | L60 | `localStorage` | `localStorage.setItem('mock_version_2', 'true');` | **Form draft** |
| [`frontend/components/MockDataSeeder.tsx`](file:///frontend/components/MockDataSeeder.tsx#L65) | L65 | `localStorage` | `if (!localStorage.getItem('mock_version_materials_v3')) {` | **Form draft** |
| [`frontend/components/MockDataSeeder.tsx`](file:///frontend/components/MockDataSeeder.tsx#L67) | L67 | `localStorage` | `localStorage.removeItem('erp_inventory');` | **Form draft** |
| [`frontend/components/MockDataSeeder.tsx`](file:///frontend/components/MockDataSeeder.tsx#L68) | L68 | `localStorage` | `localStorage.setItem('mock_version_materials_v3', 'true');` | **Form draft** |
| [`frontend/components/OrdersView.jsx`](file:///frontend/components/OrdersView.jsx#L400) | L400 | `fallback` | `const fallbackProductName = currentDetailsOrder?.products \|\|` | **Dangerous production business state** |
| [`frontend/components/OrdersView.jsx`](file:///frontend/components/OrdersView.jsx#L403) | L403 | `fallback` | `productName: fallbackProductName,` | **Dangerous production business state** |
| [`frontend/components/OrdersView.jsx`](file:///frontend/components/OrdersView.jsx#L404) | L404 | `fallback` | `code: `P-${(String(fallbackProductName).replace(/[^A-Za-z]/g` | **Dangerous production business state** |
| [`frontend/components/PaymentFollowupERPView.jsx`](file:///frontend/components/PaymentFollowupERPView.jsx#L418) | L418 | `fallback` | `// API/legacy records are fallbacks; canonical Zustand order` | **Dangerous production business state** |
| [`frontend/components/PlantHeadCommandDashboard.jsx`](file:///frontend/components/PlantHeadCommandDashboard.jsx#L7) | L7 | `fallback` | `const text = (value, fallback = '—') => value === undefined ` | **Dangerous production business state** |
| [`frontend/components/ProductionView.jsx`](file:///frontend/components/ProductionView.jsx#L9) | L9 | `mock` | `// Raw materials allocation database mocks (keyed by order I` | **Manual review required** |
| [`frontend/components/ProductionView.jsx`](file:///frontend/components/ProductionView.jsx#L23) | L23 | `fallback` | `// Default fallback checklist` | **Dangerous production business state** |
| [`frontend/components/ReportsView.jsx`](file:///frontend/components/ReportsView.jsx#L1137) | L1137 | `fallback` | `const outstanding = 0; // customer performance query doesn't` | **Dangerous production business state** |
| [`frontend/components/SamplesView.jsx`](file:///frontend/components/SamplesView.jsx#L324) | L324 | `mock` | `const getMockInfo = (sample) => {` | **Manual review required** |
| [`frontend/components/SamplesView.jsx`](file:///frontend/components/SamplesView.jsx#L494) | L494 | `mock` | `const mockInfo = getMockInfo(sample);` | **Manual review required** |
| [`frontend/components/SamplesView.jsx`](file:///frontend/components/SamplesView.jsx#L543) | L543 | `mock` | `{sample.dispatchDate && mockInfo.days === 0 && sample.status` | **Manual review required** |
| [`frontend/components/shared/FinishedGoodsTable.jsx`](file:///frontend/components/shared/FinishedGoodsTable.jsx#L13) | L13 | `mock` | `// Mock format` | **Manual review required** |
| [`frontend/components/shared/FinishedGoodsTable.jsx`](file:///frontend/components/shared/FinishedGoodsTable.jsx#L50) | L50 | `mock` | `// If we're using mock data store` | **Manual review required** |
| [`frontend/components/Sidebar.jsx`](file:///frontend/components/Sidebar.jsx#L156) | L156 | `fallback` | `// Fallback safety check for ability object` | **Manual review required** |
| [`frontend/components/ui/avatar.tsx`](file:///frontend/components/ui/avatar.tsx#L37) | L37 | `fallback` | `function AvatarFallback({ className, ...props }: React.Compo` | **Manual review required** |
| [`frontend/components/ui/avatar.tsx`](file:///frontend/components/ui/avatar.tsx#L39) | L39 | `fallback` | `<AvatarPrimitive.Fallback` | **Manual review required** |
| [`frontend/components/ui/avatar.tsx`](file:///frontend/components/ui/avatar.tsx#L40) | L40 | `fallback` | `data-slot="avatar-fallback"` | **Dangerous production business state** |
| [`frontend/components/ui/avatar.tsx`](file:///frontend/components/ui/avatar.tsx#L68) | L68 | `fallback` | `export { Avatar, AvatarFallback, AvatarImage, AvatarIndicato` | **Manual review required** |
| [`frontend/lib/api.ts`](file:///frontend/lib/api.ts#L2) | L2 | `mockData` | `import { mockLeads, mockQuotations, mockOrders, mockCustomer` | **Dangerous production business state** |
| [`frontend/lib/api.ts`](file:///frontend/lib/api.ts#L10) | L10 | `mock` | `return [...mockLeads];` | **Manual review required** |
| [`frontend/lib/api.ts`](file:///frontend/lib/api.ts#L14) | L14 | `mock` | `return [...mockQuotations];` | **Manual review required** |
| [`frontend/lib/api.ts`](file:///frontend/lib/api.ts#L18) | L18 | `mock` | `return [...mockOrders];` | **Manual review required** |
| [`frontend/lib/api.ts`](file:///frontend/lib/api.ts#L22) | L22 | `mock` | `return [...mockCustomers];` | **Manual review required** |
| [`frontend/lib/api.ts`](file:///frontend/lib/api.ts#L28) | L28 | `mock` | `return [...mockNotifications];` | **Manual review required** |

*(Note: Truncated to top 100 occurrences for document length. Complete itemized dataset stored in `frontend-audit-results.json`)*
