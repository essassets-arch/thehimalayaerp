# Himalaya ERP O2C Repair Plan

The executable source of truth is `scripts/test-harsh-o2c.ts`.

The repair order is:

1. Load and reset the canonical store.
2. Create the lead, quotation, and order.
3. Complete Plant Head handoff and production planning.
4. Create one work order and complete production.
5. Approve QC and create line-level finished goods.
6. Queue finished goods and complete dispatch delivery.
7. Record and verify payment.
8. Confirm closure does not disable replacement or return requests.

Run after every workflow change:

```bash
npx tsx scripts/test-harsh-o2c.ts
```

Development browsers containing an older malformed snapshot should clear it
once before manual verification:

```js
localStorage.removeItem("himalaya-erp-store");
location.reload();
```
