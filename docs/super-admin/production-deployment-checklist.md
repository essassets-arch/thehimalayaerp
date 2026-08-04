# Production Deployment Checklist — Super Admin Command Center

## Pre-Deployment Health & Safety Checks

- [x] **Database Data Preservation Verified**: Read-only inventory ran without destructive actions.
- [x] **Permissions Alignment Completed**: 293 canonical permissions mapped and linked to Super Admin in PostgreSQL.
- [x] **NestJS Backend Build**: `nest build && tsc -p tsconfig.seed.json` compiled with zero errors.
- [x] **Live Aggregation Endpoint**: `GET /api/backend/admin/dashboard-stats` configured and active.
- [x] **Mounted Chart Hydration Guard**: All 7 Recharts charts guarded with `{mounted && <ResponsiveContainer ...>}` to guarantee visible non-zero height.

## Deployment Command (VPS)

```bash
./scripts/deploy-vps.sh
```
