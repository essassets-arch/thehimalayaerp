# 02. Core Workflow Trace

Generated from verified code parsing.

## Verified Paths
This document synthesizes the chains verified in:
1. 03-FRONTEND-ACTION-MATRIX.md (Frontend Button -> Handler)
2. 04-API-DATABASE-TRACE.md (Service -> Prisma Model / History)
3. 01-VERIFIED-ROLE-PERMISSION-MATRIX.md (Controller -> @RequirePermissions)

*Note: For the 7 specific domains (Sales, Production, Material, QC, Dispatch, Finance, Auth), traces show heavy reliance on specific status string updates in Services, paired with explicit History table creations.*
