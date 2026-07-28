const fs = require("fs");
let np = fs.readFileSync("store/new_procurement_store.ts", "utf8");
np = np.replace(/createAuditEntry/g, "createProcurementAuditEntry");
fs.writeFileSync("store/new_procurement_store.ts", np);
console.log("Fixed new_procurement_store");
