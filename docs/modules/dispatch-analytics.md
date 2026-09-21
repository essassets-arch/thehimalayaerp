# Plant Head dispatch analytics

The report combines Dispatch 1 and Dispatch 2 shipment records for the authenticated company. It uses `dispatchedAt` in Asia/Kolkata, with an inclusive start and exclusive end. Creation dates do not move a shipment into another reporting month. Records without a dispatch timestamp are not reported as dispatched shipments. Daily stock-out reports are not added to shipments, which would count the same movement twice.

Any month/year and custom date range can be selected. Available months come from company shipment records without a sampling limit. Current and previous month presets use the current calendar date. Invalid ranges fail explicitly.

Quantities come from DispatchItem, not package counts or ordered quantities. Products and salespeople in matrices are dynamic. Recorded shipment weights are assigned to a product only for single-product shipments; mixed-product weights remain in a visible unallocated bucket. Missing measurements are counted and excluded from recorded totals. Missing transport details and delivery SLA appear as unavailable, not invented values. Product filters select whole shipments containing that product. Pending orders are labeled as the current backlog, independently of the shipment period.

Loading and API errors do not display successful zero reports or old results. Older requests cannot overwrite newer selections. Print output uses the same report data.

Verification: six isolated Jest tests cover India-time month boundaries, year transitions, leap years, invalid ranges, both categories, tenant filtering, draft exclusion, item quantities, mixed weight reconciliation, empty results and query failures. The tests use in-memory fixtures, not the application database. Backend production TypeScript compilation and frontend JSX syntax checks pass. Live data reconciliation, browser acceptance and deployment have not been performed.

Run from `backend`:

```powershell
node ../node_modules/jest/bin/jest.js --runInBand --runTestsByPath src/modules/plant-head/dispatch-analytics.spec.ts
```
