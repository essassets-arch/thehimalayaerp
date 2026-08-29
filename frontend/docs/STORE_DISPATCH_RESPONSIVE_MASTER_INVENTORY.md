# Himalaya ERP V2 — Store + Dispatch + Dispatch 2 Master Responsive Inventory

## 1. Executive Discovery Summary

This master document synthesizes the complete discovery for **Phase 4: Store, Dispatch, and Dispatch 2**.

| Panel | Discovered Views | Next.js Entrypoints | Tables | Forms | Modals | Drawers | Charts | P0 Risks | P1 Risks | P2 Risks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Store** (`/store/*`) | 17 | 3 | 16 | 17 | 14 | 0 | 4 | 0 | 16 | 1 |
| **Dispatch** (`/dispatch/*`) | 22 | 13 | 20 | 22 | 18 | 0 | 4 | 0 | 21 | 1 |
| **Dispatch 2** (`/dispatch-2/*`) | 20 | 14 | 19 | 20 | 17 | 0 | 4 | 0 | 20 | 0 |
| **TOTAL PHASE 4** | **59** | **30** | **55** | **59** | **49** | **0** | **12** | **0** | **57** | **2** |

## 2. Key Architecture & Portal Routing Mapping

1. **Store Portal Core**: Driven by [`modules/store/pages/StorePortal.jsx`](file:///d:/prototype-next-main/frontend/modules/store/pages/StorePortal.jsx) which resolves 17 tabs/subviews matching navigation and deep links.
2. **Dispatch Portal Core**: Driven by [`modules/dispatch/pages/DispatchPortal.jsx`](file:///d:/prototype-next-main/frontend/modules/dispatch/pages/DispatchPortal.jsx) which dynamically mounts across both `/dispatch/*` and `/dispatch-2/*` via `overrideBasePath` and `mode` props.
3. **Material Workflows**: Shared between Store, Production, and Dispatch via [`components/material-workflow/*`](file:///d:/prototype-next-main/frontend/components/material-workflow).

