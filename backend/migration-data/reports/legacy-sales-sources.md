# Legacy Sales Sources

| Source | Location | Type | Notes | Decision |
| --- | --- | --- | --- | --- |
| Zustand state | `state.sales.orders` in `erpStore.ts` | Active UI State | Holds the current session of parsed/mutated mock orders. | Export from here for most accurate recent state. |
| LocalStorage | `erp_orders` | Persistent Mock Data | Hydrates the Zustand store. Often updated via stringified JSON. | Export directly to ensure no lost updates during hydration. |
| LocalStorage | `himalaya_orders` | Persistent Mock Data (Fallback) | Used as a fallback in `new_erp_context.jsx`. | Export to compare if it contains diverged records. |
| Mock Data Array | `mockSalesOrders` in `store/mockData.js` | Hardcoded JSON | Seed data imported to initialize Zustand. | Do not export this directly, only export from LocalStorage/Zustand as they represent user-mutated state. |
| Mock Data JSON | `frontend/storeportal_edits.json` | Snapshot | Raw data files lying in codebase | Discard, do not migrate. |

All legacy write paths originate from `salesActions.ts` and `erpStore.ts` inside Zustand, writing to `state.sales.orders` and then serializing to `erp_orders` in localStorage.
